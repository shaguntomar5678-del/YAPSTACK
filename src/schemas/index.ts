import { z } from 'zod';

export const OrganTypeSchema = z.enum(['renal', 'hepatic', 'cardiac', 'respiratory']);
export const OrganStatusLevelSchema = z.enum(['stable', 'watch', 'warning', 'critical']);

export const OrganStatusSchema = z.object({
  status: OrganStatusLevelSchema,
  trend: z.enum(['improving', 'stable', 'deteriorating']),
  score: z.number().min(0).max(100),
  primaryConcerns: z.array(z.string()),
  lastAssessed: z.string(),
});

export const RenalMetricsSchema = z.object({
  creatinine: z.number(),
  creatinineBaseline: z.number(),
  eGFR: z.number(),
  eGFRBaseline: z.number(),
  urineOutput: z.number(),
  urineOutputBaseline: z.number(),
  cumulativeFluidBalance24h: z.number(),
  bloodUreaNitrogen: z.number(),
  potassium: z.number(),
  kdigoStage: z.enum(['None', 'Stage 1', 'Stage 2', 'Stage 3']),
});

export const HepaticMetricsSchema = z.object({
  alt: z.number(),
  altBaseline: z.number(),
  ast: z.number(),
  astBaseline: z.number(),
  totalBilirubin: z.number(),
  totalBilirubinBaseline: z.number(),
  albumin: z.number(),
  albuminBaseline: z.number(),
  inr: z.number(),
  alkalinePhosphatase: z.number(),
  pattern: z.enum(['Hepatocellular', 'Cholestatic', 'Mixed', 'Normal', 'Congestive']),
});

export const CardiacMetricsSchema = z.object({
  heartRate: z.number(),
  heartRateBaseline: z.number(),
  meanArterialPressure: z.number(),
  mapBaseline: z.number(),
  systolicBP: z.number(),
  diastolicBP: z.number(),
  cardiacIndex: z.number().optional(),
  troponinI: z.number(),
  ecgRhythm: z.string(),
  qtcInterval: z.number(),
  inotropicSupport: z.boolean(),
  vasopressorDose: z.string().optional(),
});

export const RespiratoryMetricsSchema = z.object({
  spO2: z.number(),
  spO2Baseline: z.number(),
  respiratoryRate: z.number(),
  rrBaseline: z.number(),
  paO2FiO2Ratio: z.number(),
  pfBaseline: z.number(),
  fiO2: z.number(),
  peep: z.number().optional(),
  oxygenSupportMode: z.enum(['Room Air', 'Nasal Cannula', 'High Flow Nasal Cannula', 'BiPAP', 'Mechanical Ventilation']),
  lungCompliance: z.number().optional(),
  workOfBreathing: z.enum(['Normal', 'Mildly Increased', 'Significantly Increased', 'Exhaustion Risk']),
});

export const PatientSchema = z.object({
  id: z.string(),
  mrn: z.string(),
  name: z.string(),
  age: z.number(),
  gender: z.enum(['Male', 'Female', 'Other']),
  bed: z.string(),
  unit: z.enum(['Medical ICU', 'Surgical ICU', 'Cardiac ICU', 'Step-Down Unit', 'Telemetry']),
  admissionDate: z.string(),
  icuDay: z.number(),
  primaryDiagnosis: z.string(),
  comorbidities: z.array(z.string()),
  allergies: z.array(z.string()),
  codeStatus: z.enum(['Full Code', 'DNR/DNI', 'Limited Intervention']),
  acuityTier: z.enum(['Critical', 'Urgent', 'Guarded', 'Stable']),
  riskScore: z.number().min(0).max(100),
  requiresReview: z.boolean(),
  multiOrganPatternDetected: z.boolean(),
  patternDescription: z.string().optional(),
  organStatuses: z.object({
    renal: OrganStatusSchema,
    hepatic: OrganStatusSchema,
    cardiac: OrganStatusSchema,
    respiratory: OrganStatusSchema,
  }),
  renal: RenalMetricsSchema,
  hepatic: HepaticMetricsSchema,
  cardiac: CardiacMetricsSchema,
  respiratory: RespiratoryMetricsSchema,
});
