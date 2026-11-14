/**
 * src/lib/schemas.ts
 * Zod schemas derived from public/data/ JSON files.
 * All fields nullable where the JSON may contain null (sanitised from Python NaN).
 */
import { z } from 'zod';

// ─── Manifest ────────────────────────────────────────────────────────────────

export const ManifestSchema = z.object({
  schemaVersion: z.number().optional(),
  horizon_hours: z.number().optional(),
  anchor_step_hours: z.number().optional(),
  thresholds: z.record(z.number()).optional(),
  models: z.record(z.string()).optional(),
  proxies: z.record(z.string()).optional(),
  training_data: z.string().optional(),
  demo_patients: z.string().optional(),
  disclaimers: z.array(z.string()),
});
export type Manifest = z.infer<typeof ManifestSchema>;

// ─── patients.json ───────────────────────────────────────────────────────────

export const OrganSummarySchema = z.object({
  status: z.enum(['elevated', 'low', 'dysfunction_present', 'insufficient_data']),
  risk: z.number().nullable().optional(),
  change_flag: z.boolean().optional(),
});

export const FirstChangeSchema = z.object({
  organ: z.string(),
  hour: z.number(),
}).nullable();

export const PatientSummarySchema = z.object({
  id: z.string(),
  source: z.string(),
  age: z.number(),
  gender: z.number(), // 0=F 1=M in raw JSON
  note: z.string().optional(),
  hour: z.number().optional(),
  risk_overall: z.number().nullable(),
  display_overall: z.enum(['shown', 'data_insufficient', 'not_applicable']),
  elevated: z.boolean(),
  trust: z.string(), // 'high'|'moderate'|'medium'|'low'|'insufficient'
  organs: z.record(OrganSummarySchema),
  first_change: z.union([FirstChangeSchema, z.null()]).optional(),
  top_reason: z.string().nullable().optional(),
  // Extra fields added by adapter (not in raw JSON)
  name: z.string().optional(),
  bed: z.string().optional(),
});
export type PatientSummary = z.infer<typeof PatientSummarySchema>;
export const PatientsListSchema = z.array(PatientSummarySchema);

// ─── patients/{id}.json ──────────────────────────────────────────────────────

export const OrganAnchorSchema = z.object({
  risk: z.number().nullable().optional(),
  threshold: z.number().optional(),
  status: z.enum(['elevated', 'low', 'dysfunction_present', 'insufficient_data']),
  not_applicable_reason: z.string().nullable().optional(),
  z_score: z.number().nullable().optional(),
  change_flag: z.boolean().optional(),
});
export type OrganAnchor = z.infer<typeof OrganAnchorSchema>;

export const ReasonSchema = z.object({
  feature: z.string(),
  text: z.string(),
  effect: z.string(),
  impact: z.number(),
});
export type Reason = z.infer<typeof ReasonSchema>;

export const TrustSchema = z.object({
  level: z.string(),
  completeness: z.number(),
  baseline_availability: z.union([z.boolean(), z.number()]),
  consistency: z.number(),
  reasons: z.array(z.string()),
});
export type Trust = z.infer<typeof TrustSchema>;

export const AnchorSchema = z.object({
  hour: z.number(),
  risk_overall: z.number().nullable(),
  threshold: z.number().optional(),
  display_overall: z.enum(['shown', 'data_insufficient', 'not_applicable']),
  elevated: z.boolean().optional(),
  organs: z.record(OrganAnchorSchema),
  trust: TrustSchema,
  reasons: z.array(ReasonSchema),
});
export type Anchor = z.infer<typeof AnchorSchema>;

export const FutureCastPointSchema = z.object({
  hour: z.number(),
  risk_overall: z.number().nullable(),
  use_overall: z.boolean().optional(),
});
export type FutureCastPoint = z.infer<typeof FutureCastPointSchema>;

export const FutureCastScenarioSchema = z.object({
  stable: z.array(FutureCastPointSchema),
  trend_continues: z.array(FutureCastPointSchema),
});
export type FutureCastScenario = z.infer<typeof FutureCastScenarioSchema>;

export const FutureCastEntrySchema = z.union([
  z.literal('data_insufficient'),
  FutureCastScenarioSchema,
]);
export type FutureCastEntry = z.infer<typeof FutureCastEntrySchema>;

export const CascadeEventSchema = z.object({
  organ: z.string(),
  hour: z.number(),
  label: z.string().optional(),
  id: z.string().optional(),
});
export type CascadeEvent = z.infer<typeof CascadeEventSchema>;

export const CascadeEdgeSchema = z.object({
  source: z.string(),
  target: z.string(),
  type: z.enum(['observed_sequence_and_plausible', 'plausible_only']),
  rationale: z.string().optional(),
  causal: z.boolean().optional(),
  lag_hours: z.number().nullable().optional(),
  active_from_hour: z.number().nullable().optional(),
});
export type CascadeEdge = z.infer<typeof CascadeEdgeSchema>;

export const BaselineValueSchema = z.union([
  z.number(),
  z.object({
    mean: z.number(),
    std: z.number(),
    normal_range: z.tuple([z.number(), z.number()]).optional(),
  }),
]);

export const PatientRecordSchema = z.object({
  id: z.string(),
  source: z.string(),
  age: z.number(),
  gender: z.number(),
  note: z.string().optional(),
  anchors: z.array(AnchorSchema),
  series: z.record(z.array(z.tuple([z.number(), z.number().nullable()]))),
  baselines: z.record(z.union([z.number(), z.object({
    mean: z.number().optional(),
    std: z.number().optional(),
    normal_range: z.tuple([z.number(), z.number()]).optional(),
  })])),
  cascade: z.object({
    events: z.array(CascadeEventSchema),
    edges: z.array(CascadeEdgeSchema),
    note: z.string().optional(),
  }),
  futurecast: z.record(FutureCastEntrySchema),
  dysfunction_now: z.record(z.boolean()).optional(),
});
export type PatientRecord = z.infer<typeof PatientRecordSchema>;

// ─── whatif_V-104.json ───────────────────────────────────────────────────────

export const WhatIfAnchorSchema = z.object({
  hour: z.number(),
  risk_overall: z.number().nullable(),
  display_overall: z.enum(['shown', 'data_insufficient', 'not_applicable']),
  organs: z.record(z.number().nullable()),
  trust: z.string(),
});
export type WhatIfAnchor = z.infer<typeof WhatIfAnchorSchema>;

export const WhatIfGridEntrySchema = z.object({
  focus: z.enum(['all', 'renal', 'cardio', 'resp']),
  intensity: z.number(),
  missing_labs: z.boolean(),
  anchors: z.array(WhatIfAnchorSchema),
});
export type WhatIfGridEntry = z.infer<typeof WhatIfGridEntrySchema>;

export const WhatIfSchema = z.object({
  patient: z.string(),
  note: z.string().optional(),
  grid: z.array(WhatIfGridEntrySchema),
});
export type WhatIf = z.infer<typeof WhatIfSchema>;

// ─── model_card.json ─────────────────────────────────────────────────────────

export const ModelResultRowSchema = z.object({
  set: z.string(),
  auroc: z.number().nullable(),
  auprc: z.number().nullable(),
  brier: z.number().nullable(),
  prevalence: z.number().nullable().optional(),
  sensitivity_at_thr: z.number().nullable().optional(),
  false_alerts_per_patient_day: z.number().nullable().optional(),
  auroc_ci: z.string().nullable().optional(),
  auprc_ci: z.string().nullable().optional(),
});
export type ModelResultRow = z.infer<typeof ModelResultRowSchema>;

export const M6ComparisonRowSchema = z.object({
  model: z.string(),
  set: z.string(),
  auroc: z.number().nullable(),
  auprc: z.number().nullable(),
  prevalence: z.number().nullable().optional(),
  sensitivity_at_thr: z.number().nullable().optional(),
  false_alerts_per_patient_day: z.number().nullable().optional(),
  brier: z.number().nullable().optional(),
});
export type M6ComparisonRow = z.infer<typeof M6ComparisonRowSchema>;

export const PairedDeltaRowSchema = z.object({
  set: z.string(),
  metric: z.string(),
  comparison: z.string(),
  delta: z.number().nullable(),
  ci_low: z.number().nullable().optional(),
  ci_high: z.number().nullable().optional(),
  interval_excludes_zero: z.boolean().nullable().optional(),
});
export type PairedDeltaRow = z.infer<typeof PairedDeltaRowSchema>;

export const AblationRowSchema = z.object({
  variant: z.string(),
  set: z.string(),
  auroc: z.number().nullable(),
  auprc: z.number().nullable(),
});
export type AblationRow = z.infer<typeof AblationRowSchema>;

export const ModelCardSchema = z.object({
  m1_results: z.array(ModelResultRowSchema),
  m2_results: z.array(ModelResultRowSchema),
  m3_results: z.array(ModelResultRowSchema),
  m4_results: z.array(ModelResultRowSchema),
  m5_results: z.array(ModelResultRowSchema),
  m6_comparison: z.array(M6ComparisonRowSchema),
  m6_paired_deltas: z.array(PairedDeltaRowSchema),
  m6_ablation: z.array(AblationRowSchema),
});
export type ModelCard = z.infer<typeof ModelCardSchema>;
