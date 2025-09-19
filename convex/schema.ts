import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const applicationTables = {
  waterQualityReadings: defineTable({
    timestamp: v.number(),
    ph: v.number(),
    turbidity: v.number(), // NTU (Nephelometric Turbidity Units)
    temperature: v.number(), // Celsius
    dissolvedOxygen: v.number(), // mg/L
    totalColiform: v.number(), // CFU/100ml
    ecoli: v.number(), // CFU/100ml
    chlorine: v.number(), // mg/L
    location: v.string(),
  }).index("by_timestamp", ["timestamp"]),

  diseaseRiskPredictions: defineTable({
    timestamp: v.number(),
    cholera: v.object({
      riskLevel: v.union(
        v.literal("low"),
        v.literal("medium"),
        v.literal("high")
      ),
      probability: v.number(),
      confidence: v.number(),
    }),
    typhoid: v.object({
      riskLevel: v.union(
        v.literal("low"),
        v.literal("medium"),
        v.literal("high")
      ),
      probability: v.number(),
      confidence: v.number(),
    }),
    hepatitisA: v.object({
      riskLevel: v.union(
        v.literal("low"),
        v.literal("medium"),
        v.literal("high")
      ),
      probability: v.number(),
      confidence: v.number(),
    }),
    diarrhea: v.object({
      riskLevel: v.union(
        v.literal("low"),
        v.literal("medium"),
        v.literal("high")
      ),
      probability: v.number(),
      confidence: v.number(),
    }),
    overallRisk: v.union(
      v.literal("low"),
      v.literal("medium"),
      v.literal("high")
    ),
  }).index("by_timestamp", ["timestamp"]),

  alerts: defineTable({
    timestamp: v.number(),
    type: v.union(v.literal("water_quality"), v.literal("disease_risk")),
    severity: v.union(v.literal("warning"), v.literal("critical")),
    message: v.string(),
    parameter: v.optional(v.string()),
    value: v.optional(v.number()),
    threshold: v.optional(v.number()),
    acknowledged: v.boolean(),
  })
    .index("by_timestamp", ["timestamp"])
    .index("by_acknowledged", ["acknowledged"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
