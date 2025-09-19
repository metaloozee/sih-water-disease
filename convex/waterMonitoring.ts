import { query, mutation, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

// Water quality thresholds based on WHO standards
const WATER_QUALITY_THRESHOLDS = {
  ph: { min: 6.5, max: 8.5 },
  turbidity: { max: 5 }, // NTU
  temperature: { min: 15, max: 25 }, // Celsius
  dissolvedOxygen: { min: 5 }, // mg/L
  totalColiform: { max: 0 }, // CFU/100ml
  ecoli: { max: 0 }, // CFU/100ml
  chlorine: { min: 0.2, max: 5 }, // mg/L
};

export const getLatestWaterQuality = query({
  args: {},
  handler: async (ctx) => {
    const latest = await ctx.db
      .query("waterQualityReadings")
      .withIndex("by_timestamp")
      .order("desc")
      .first();
    
    if (!latest) return null;

    // Calculate status for each parameter
    const status = {
      ph: getParameterStatus(latest.ph, WATER_QUALITY_THRESHOLDS.ph),
      turbidity: getParameterStatus(latest.turbidity, { max: WATER_QUALITY_THRESHOLDS.turbidity.max }),
      temperature: getParameterStatus(latest.temperature, WATER_QUALITY_THRESHOLDS.temperature),
      dissolvedOxygen: getParameterStatus(latest.dissolvedOxygen, { min: WATER_QUALITY_THRESHOLDS.dissolvedOxygen.min }),
      totalColiform: getParameterStatus(latest.totalColiform, { max: WATER_QUALITY_THRESHOLDS.totalColiform.max }),
      ecoli: getParameterStatus(latest.ecoli, { max: WATER_QUALITY_THRESHOLDS.ecoli.max }),
      chlorine: getParameterStatus(latest.chlorine, WATER_QUALITY_THRESHOLDS.chlorine),
    };

    return { ...latest, status };
  },
});

export const getRecentReadings = query({
  args: { hours: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const hoursBack = args.hours || 24;
    const cutoffTime = Date.now() - (hoursBack * 60 * 60 * 1000);
    
    return await ctx.db
      .query("waterQualityReadings")
      .withIndex("by_timestamp")
      .filter((q) => q.gte(q.field("timestamp"), cutoffTime))
      .order("desc")
      .take(100);
  },
});

export const getLatestDiseaseRisk = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("diseaseRiskPredictions")
      .withIndex("by_timestamp")
      .order("desc")
      .first();
  },
});

export const getActiveAlerts = query({
  args: { 
    page: v.optional(v.number()),
    pageSize: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    const page = args.page || 1;
    const pageSize = args.pageSize || 10;
    const offset = (page - 1) * pageSize;

    // Get total count for pagination
    const allAlerts = await ctx.db
      .query("alerts")
      .withIndex("by_acknowledged")
      .filter((q) => q.eq(q.field("acknowledged"), false))
      .order("desc")
      .collect();
    
    const totalCount = allAlerts.length;
    const totalPages = Math.ceil(totalCount / pageSize);

    // Get paginated results
    const alerts = allAlerts.slice(offset, offset + pageSize);

    return {
      alerts,
      pagination: {
        page,
        pageSize,
        totalCount,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    };
  },
});

export const acknowledgeAlert = mutation({
  args: { alertId: v.id("alerts") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.alertId, { acknowledged: true });
  },
});

export const simulateWaterQualityReading = mutation({
  args: {},
  handler: async (ctx) => {
    // Generate realistic dummy data with some variation
    const baseValues = {
      ph: 7.2 + (Math.random() - 0.5) * 2,
      turbidity: 2 + Math.random() * 8,
      temperature: 20 + Math.random() * 10,
      dissolvedOxygen: 6 + Math.random() * 4,
      totalColiform: Math.random() < 0.8 ? 0 : Math.floor(Math.random() * 50),
      ecoli: Math.random() < 0.9 ? 0 : Math.floor(Math.random() * 10),
      chlorine: 0.5 + Math.random() * 2,
    };

    const readingId = await ctx.db.insert("waterQualityReadings", {
      timestamp: Date.now(),
      location: "Village Reservoir",
      ...baseValues,
    });

    // Check for alerts and calculate disease risk
    await ctx.scheduler.runAfter(0, internal.waterMonitoring.processWaterQualityData, {
      readingId,
    });

    return readingId;
  },
});

export const processWaterQualityData = internalMutation({
  args: { readingId: v.id("waterQualityReadings") },
  handler: async (ctx, args) => {
    const reading = await ctx.db.get(args.readingId);
    if (!reading) return;

    // Check for water quality alerts
    const alerts = [];
    
    if (reading.ph < WATER_QUALITY_THRESHOLDS.ph.min || reading.ph > WATER_QUALITY_THRESHOLDS.ph.max) {
      alerts.push({
        type: "water_quality" as const,
        severity: "warning" as const,
        message: `pH level ${reading.ph.toFixed(2)} is outside safe range (${WATER_QUALITY_THRESHOLDS.ph.min}-${WATER_QUALITY_THRESHOLDS.ph.max})`,
        parameter: "pH",
        value: reading.ph,
        threshold: reading.ph < WATER_QUALITY_THRESHOLDS.ph.min ? WATER_QUALITY_THRESHOLDS.ph.min : WATER_QUALITY_THRESHOLDS.ph.max,
      });
    }

    if (reading.turbidity > WATER_QUALITY_THRESHOLDS.turbidity.max) {
      alerts.push({
        type: "water_quality" as const,
        severity: "warning" as const,
        message: `Turbidity level ${reading.turbidity.toFixed(2)} NTU exceeds safe limit (${WATER_QUALITY_THRESHOLDS.turbidity.max} NTU)`,
        parameter: "turbidity",
        value: reading.turbidity,
        threshold: WATER_QUALITY_THRESHOLDS.turbidity.max,
      });
    }

    if (reading.totalColiform > WATER_QUALITY_THRESHOLDS.totalColiform.max) {
      alerts.push({
        type: "water_quality" as const,
        severity: "critical" as const,
        message: `Total coliform detected: ${reading.totalColiform} CFU/100ml`,
        parameter: "totalColiform",
        value: reading.totalColiform,
        threshold: WATER_QUALITY_THRESHOLDS.totalColiform.max,
      });
    }

    if (reading.ecoli > WATER_QUALITY_THRESHOLDS.ecoli.max) {
      alerts.push({
        type: "water_quality" as const,
        severity: "critical" as const,
        message: `E. coli detected: ${reading.ecoli} CFU/100ml`,
        parameter: "ecoli",
        value: reading.ecoli,
        threshold: WATER_QUALITY_THRESHOLDS.ecoli.max,
      });
    }

    // Insert alerts
    for (const alert of alerts) {
      await ctx.db.insert("alerts", {
        timestamp: Date.now(),
        acknowledged: false,
        ...alert,
      });
    }

    // Calculate disease risk predictions
    const diseaseRisk = calculateDiseaseRisk(reading);
    await ctx.db.insert("diseaseRiskPredictions", {
      timestamp: Date.now(),
      ...diseaseRisk,
    });

    // Check for high disease risk alerts
    if (diseaseRisk.overallRisk === "high") {
      await ctx.db.insert("alerts", {
        timestamp: Date.now(),
        type: "disease_risk",
        severity: "critical",
        message: "High risk of water-borne disease outbreak detected",
        acknowledged: false,
      });
    }
  },
});

function getParameterStatus(value: number, threshold: { min?: number; max?: number }): "good" | "warning" | "critical" {
  if (threshold.min !== undefined && value < threshold.min) {
    return value < threshold.min * 0.8 ? "critical" : "warning";
  }
  if (threshold.max !== undefined && value > threshold.max) {
    return value > threshold.max * 1.5 ? "critical" : "warning";
  }
  return "good";
}

function calculateDiseaseRisk(reading: any) {
  // Simplified disease risk calculation based on water quality parameters
  let choleraRisk = 0;
  let typhoidRisk = 0;
  let hepatitisRisk = 0;
  let diarrheaRisk = 0;

  // E. coli and coliform presence significantly increases risk
  if (reading.ecoli > 0) {
    choleraRisk += 0.4;
    typhoidRisk += 0.3;
    diarrheaRisk += 0.5;
  }
  
  if (reading.totalColiform > 0) {
    choleraRisk += 0.3;
    typhoidRisk += 0.4;
    hepatitisRisk += 0.2;
    diarrheaRisk += 0.3;
  }

  // Poor water quality parameters increase risk
  if (reading.turbidity > 5) {
    choleraRisk += 0.2;
    diarrheaRisk += 0.2;
  }

  if (reading.ph < 6.5 || reading.ph > 8.5) {
    typhoidRisk += 0.1;
    hepatitisRisk += 0.1;
  }

  if (reading.chlorine < 0.2) {
    choleraRisk += 0.2;
    typhoidRisk += 0.2;
    hepatitisRisk += 0.1;
    diarrheaRisk += 0.2;
  }

  // Cap risks at 1.0
  choleraRisk = Math.min(choleraRisk, 1.0);
  typhoidRisk = Math.min(typhoidRisk, 1.0);
  hepatitisRisk = Math.min(hepatitisRisk, 1.0);
  diarrheaRisk = Math.min(diarrheaRisk, 1.0);

  const getRiskLevel = (risk: number) => {
    if (risk < 0.3) return "low" as const;
    if (risk < 0.7) return "medium" as const;
    return "high" as const;
  };

  const overallRisk = Math.max(choleraRisk, typhoidRisk, hepatitisRisk, diarrheaRisk);

  return {
    cholera: {
      riskLevel: getRiskLevel(choleraRisk),
      probability: choleraRisk,
      confidence: 0.75 + Math.random() * 0.2,
    },
    typhoid: {
      riskLevel: getRiskLevel(typhoidRisk),
      probability: typhoidRisk,
      confidence: 0.75 + Math.random() * 0.2,
    },
    hepatitisA: {
      riskLevel: getRiskLevel(hepatitisRisk),
      probability: hepatitisRisk,
      confidence: 0.75 + Math.random() * 0.2,
    },
    diarrhea: {
      riskLevel: getRiskLevel(diarrheaRisk),
      probability: diarrheaRisk,
      confidence: 0.75 + Math.random() * 0.2,
    },
    overallRisk: getRiskLevel(overallRisk),
  };
}
