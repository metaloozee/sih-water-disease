import { v } from "convex/values";
import { internal } from "./_generated/api";
import { internalMutation, mutation, query } from "./_generated/server";

// Constants for time calculations
const SECONDS_PER_MINUTE = 60;
const MINUTES_PER_HOUR = 60;
const MILLISECONDS_PER_SECOND = 1000;
const MILLISECONDS_PER_HOUR =
  SECONDS_PER_MINUTE * MINUTES_PER_HOUR * MILLISECONDS_PER_SECOND;
const DEFAULT_HOURS_BACK = 24;
const MAX_READINGS_LIMIT = 100;
const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 10;

// Constants for water quality thresholds and calculations
const PH_MIN = 6.5;
const PH_MAX = 8.5;
const TURBIDITY_MAX = 5; // NTU
const TEMPERATURE_MIN = 15; // Celsius
const TEMPERATURE_MAX = 25; // Celsius
const DISSOLVED_OXYGEN_MIN = 5; // mg/L
const TOTAL_COLIFORM_MAX = 0; // CFU/100ml
const ECOLI_MAX = 0; // CFU/100ml
const CHLORINE_MIN = 0.2; // mg/L
const CHLORINE_MAX = 5; // mg/L

// Constants for status calculations
const CRITICAL_THRESHOLD_MULTIPLIER = 0.8;
const WARNING_THRESHOLD_MULTIPLIER = 1.5;

// Constants for simulation
const PH_BASE = 7.2;
const PH_VARIATION = 2;
const RANDOM_OFFSET = 0.5;
const TURBIDITY_BASE = 2;
const TURBIDITY_VARIATION = 8;
const TEMPERATURE_BASE = 20;
const TEMPERATURE_VARIATION = 10;
const DISSOLVED_OXYGEN_BASE = 6;
const DISSOLVED_OXYGEN_VARIATION = 4;
const CHLORINE_BASE = 0.5;
const CHLORINE_VARIATION = 2;
const COLIFORM_PROBABILITY = 0.8;
const COLIFORM_MAX_COUNT = 50;
const ECOLI_PROBABILITY = 0.9;
const ECOLI_MAX_COUNT = 10;

// Constants for disease risk calculation
const ECOLI_CHOLERA_RISK = 0.4;
const ECOLI_TYPHOID_RISK = 0.3;
const ECOLI_DIARRHEA_RISK = 0.5;
const COLIFORM_CHOLERA_RISK = 0.3;
const COLIFORM_TYPHOID_RISK = 0.4;
const COLIFORM_HEPATITIS_RISK = 0.2;
const COLIFORM_DIARRHEA_RISK = 0.3;
const TURBIDITY_CHOLERA_RISK = 0.2;
const TURBIDITY_DIARRHEA_RISK = 0.2;
const PH_TYPHOID_RISK = 0.1;
const PH_HEPATITIS_RISK = 0.1;
const LOW_CHLORINE_CHOLERA_RISK = 0.2;
const LOW_CHLORINE_TYPHOID_RISK = 0.2;
const LOW_CHLORINE_HEPATITIS_RISK = 0.1;
const LOW_CHLORINE_DIARRHEA_RISK = 0.2;
const MAX_RISK_VALUE = 1.0;
const LOW_RISK_THRESHOLD = 0.3;
const MEDIUM_RISK_THRESHOLD = 0.7;
const BASE_CONFIDENCE = 0.75;
const CONFIDENCE_VARIATION = 0.2;

// Water quality thresholds based on WHO standards
const WATER_QUALITY_THRESHOLDS = {
  ph: { min: PH_MIN, max: PH_MAX },
  turbidity: { max: TURBIDITY_MAX },
  temperature: { min: TEMPERATURE_MIN, max: TEMPERATURE_MAX },
  dissolvedOxygen: { min: DISSOLVED_OXYGEN_MIN },
  totalColiform: { max: TOTAL_COLIFORM_MAX },
  ecoli: { max: ECOLI_MAX },
  chlorine: { min: CHLORINE_MIN, max: CHLORINE_MAX },
};

// Type definitions
type WaterQualityReading = {
  timestamp: number;
  location: string;
  ph: number;
  turbidity: number;
  temperature: number;
  dissolvedOxygen: number;
  totalColiform: number;
  ecoli: number;
  chlorine: number;
};

type RiskLevel = "low" | "medium" | "high";

type DiseaseRisk = {
  cholera: {
    riskLevel: RiskLevel;
    probability: number;
    confidence: number;
  };
  typhoid: {
    riskLevel: RiskLevel;
    probability: number;
    confidence: number;
  };
  hepatitisA: {
    riskLevel: RiskLevel;
    probability: number;
    confidence: number;
  };
  diarrhea: {
    riskLevel: RiskLevel;
    probability: number;
    confidence: number;
  };
  overallRisk: RiskLevel;
};

export const getLatestWaterQuality = query({
  args: {},
  handler: async (ctx) => {
    const latest = await ctx.db
      .query("waterQualityReadings")
      .withIndex("by_timestamp")
      .order("desc")
      .first();

    if (!latest) {
      return null;
    }

    // Calculate status for each parameter
    const status = {
      ph: getParameterStatus(latest.ph, WATER_QUALITY_THRESHOLDS.ph),
      turbidity: getParameterStatus(latest.turbidity, {
        max: WATER_QUALITY_THRESHOLDS.turbidity.max,
      }),
      temperature: getParameterStatus(
        latest.temperature,
        WATER_QUALITY_THRESHOLDS.temperature
      ),
      dissolvedOxygen: getParameterStatus(latest.dissolvedOxygen, {
        min: WATER_QUALITY_THRESHOLDS.dissolvedOxygen.min,
      }),
      totalColiform: getParameterStatus(latest.totalColiform, {
        max: WATER_QUALITY_THRESHOLDS.totalColiform.max,
      }),
      ecoli: getParameterStatus(latest.ecoli, {
        max: WATER_QUALITY_THRESHOLDS.ecoli.max,
      }),
      chlorine: getParameterStatus(
        latest.chlorine,
        WATER_QUALITY_THRESHOLDS.chlorine
      ),
    };

    return { ...latest, status };
  },
});

export const getRecentReadings = query({
  args: { hours: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const hoursBack = args.hours || DEFAULT_HOURS_BACK;
    const cutoffTime = Date.now() - hoursBack * MILLISECONDS_PER_HOUR;

    return await ctx.db
      .query("waterQualityReadings")
      .withIndex("by_timestamp")
      .filter((q) => q.gte(q.field("timestamp"), cutoffTime))
      .order("desc")
      .take(MAX_READINGS_LIMIT);
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
    pageSize: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const page = args.page || DEFAULT_PAGE;
    const pageSize = args.pageSize || DEFAULT_PAGE_SIZE;
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
        hasPrev: page > 1,
      },
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
      ph: PH_BASE + (Math.random() - RANDOM_OFFSET) * PH_VARIATION,
      turbidity: TURBIDITY_BASE + Math.random() * TURBIDITY_VARIATION,
      temperature: TEMPERATURE_BASE + Math.random() * TEMPERATURE_VARIATION,
      dissolvedOxygen:
        DISSOLVED_OXYGEN_BASE + Math.random() * DISSOLVED_OXYGEN_VARIATION,
      totalColiform:
        Math.random() < COLIFORM_PROBABILITY
          ? 0
          : Math.floor(Math.random() * COLIFORM_MAX_COUNT),
      ecoli:
        Math.random() < ECOLI_PROBABILITY
          ? 0
          : Math.floor(Math.random() * ECOLI_MAX_COUNT),
      chlorine: CHLORINE_BASE + Math.random() * CHLORINE_VARIATION,
    };

    const readingId = await ctx.db.insert("waterQualityReadings", {
      timestamp: Date.now(),
      location: "Village Reservoir",
      ...baseValues,
    });

    // Check for alerts and calculate disease risk
    await ctx.scheduler.runAfter(
      0,
      internal.waterMonitoring.processWaterQualityData,
      {
        readingId,
      }
    );

    return readingId;
  },
});

export const processWaterQualityData = internalMutation({
  args: { readingId: v.id("waterQualityReadings") },
  handler: async (ctx, args) => {
    const reading = await ctx.db.get(args.readingId);
    if (!reading) {
      return;
    }

    // Check for water quality alerts
    const alerts: Array<{
      type: "water_quality";
      severity: "warning" | "critical";
      message: string;
      parameter: string;
      value: number;
      threshold: number;
    }> = [];

    if (
      reading.ph < WATER_QUALITY_THRESHOLDS.ph.min ||
      reading.ph > WATER_QUALITY_THRESHOLDS.ph.max
    ) {
      alerts.push({
        type: "water_quality" as const,
        severity: "warning" as const,
        message: `pH level ${reading.ph.toFixed(2)} is outside safe range (${WATER_QUALITY_THRESHOLDS.ph.min}-${WATER_QUALITY_THRESHOLDS.ph.max})`,
        parameter: "pH",
        value: reading.ph,
        threshold:
          reading.ph < WATER_QUALITY_THRESHOLDS.ph.min
            ? WATER_QUALITY_THRESHOLDS.ph.min
            : WATER_QUALITY_THRESHOLDS.ph.max,
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

function getParameterStatus(
  value: number,
  threshold: { min?: number; max?: number }
): "good" | "warning" | "critical" {
  if (threshold.min !== undefined && value < threshold.min) {
    return value < threshold.min * CRITICAL_THRESHOLD_MULTIPLIER
      ? "critical"
      : "warning";
  }
  if (threshold.max !== undefined && value > threshold.max) {
    return value > threshold.max * WARNING_THRESHOLD_MULTIPLIER
      ? "critical"
      : "warning";
  }
  return "good";
}

function calculateDiseaseRisk(reading: WaterQualityReading): DiseaseRisk {
  // Simplified disease risk calculation based on water quality parameters
  let choleraRisk = 0;
  let typhoidRisk = 0;
  let hepatitisRisk = 0;
  let diarrheaRisk = 0;

  // E. coli and coliform presence significantly increases risk
  if (reading.ecoli > 0) {
    choleraRisk += ECOLI_CHOLERA_RISK;
    typhoidRisk += ECOLI_TYPHOID_RISK;
    diarrheaRisk += ECOLI_DIARRHEA_RISK;
  }

  if (reading.totalColiform > 0) {
    choleraRisk += COLIFORM_CHOLERA_RISK;
    typhoidRisk += COLIFORM_TYPHOID_RISK;
    hepatitisRisk += COLIFORM_HEPATITIS_RISK;
    diarrheaRisk += COLIFORM_DIARRHEA_RISK;
  }

  // Poor water quality parameters increase risk
  if (reading.turbidity > TURBIDITY_MAX) {
    choleraRisk += TURBIDITY_CHOLERA_RISK;
    diarrheaRisk += TURBIDITY_DIARRHEA_RISK;
  }

  if (reading.ph < PH_MIN || reading.ph > PH_MAX) {
    typhoidRisk += PH_TYPHOID_RISK;
    hepatitisRisk += PH_HEPATITIS_RISK;
  }

  if (reading.chlorine < CHLORINE_MIN) {
    choleraRisk += LOW_CHLORINE_CHOLERA_RISK;
    typhoidRisk += LOW_CHLORINE_TYPHOID_RISK;
    hepatitisRisk += LOW_CHLORINE_HEPATITIS_RISK;
    diarrheaRisk += LOW_CHLORINE_DIARRHEA_RISK;
  }

  // Cap risks at maximum value
  choleraRisk = Math.min(choleraRisk, MAX_RISK_VALUE);
  typhoidRisk = Math.min(typhoidRisk, MAX_RISK_VALUE);
  hepatitisRisk = Math.min(hepatitisRisk, MAX_RISK_VALUE);
  diarrheaRisk = Math.min(diarrheaRisk, MAX_RISK_VALUE);

  const getRiskLevel = (risk: number): RiskLevel => {
    if (risk < LOW_RISK_THRESHOLD) {
      return "low";
    }
    if (risk < MEDIUM_RISK_THRESHOLD) {
      return "medium";
    }
    return "high";
  };

  const overallRisk = Math.max(
    choleraRisk,
    typhoidRisk,
    hepatitisRisk,
    diarrheaRisk
  );

  return {
    cholera: {
      riskLevel: getRiskLevel(choleraRisk),
      probability: choleraRisk,
      confidence: BASE_CONFIDENCE + Math.random() * CONFIDENCE_VARIATION,
    },
    typhoid: {
      riskLevel: getRiskLevel(typhoidRisk),
      probability: typhoidRisk,
      confidence: BASE_CONFIDENCE + Math.random() * CONFIDENCE_VARIATION,
    },
    hepatitisA: {
      riskLevel: getRiskLevel(hepatitisRisk),
      probability: hepatitisRisk,
      confidence: BASE_CONFIDENCE + Math.random() * CONFIDENCE_VARIATION,
    },
    diarrhea: {
      riskLevel: getRiskLevel(diarrheaRisk),
      probability: diarrheaRisk,
      confidence: BASE_CONFIDENCE + Math.random() * CONFIDENCE_VARIATION,
    },
    overallRisk: getRiskLevel(overallRisk),
  };
}
