export type OrganType = 'renal' | 'hepatic' | 'cardiac' | 'respiratory';

export type OrganStatusLevel = 'stable' | 'watch' | 'warning' | 'critical';

export interface OrganStatus {
  status: OrganStatusLevel;
  trend: 'improving' | 'stable' | 'deteriorating';
  score: number; // 0-100 severity index (synthetic)
  primaryConcerns: string[];
  lastAssessed: string;
}

export interface RenalMetrics {
  creatinine: number; // mg/dL (baseline ~0.9)
  creatinineBaseline: number;
  eGFR: number; // mL/min/1.73m2 (baseline > 90)
  eGFRBaseline: number;
  urineOutput: number; // mL/kg/h (normal > 0.5)
  urineOutputBaseline: number;
  cumulativeFluidBalance24h: number; // mL (+/-)
  bloodUreaNitrogen: number; // mg/dL
  potassium: number; // mEq/L
  kdigoStage: 'None' | 'Stage 1' | 'Stage 2' | 'Stage 3';
}

export interface HepaticMetrics {
  alt: number; // U/L (baseline < 45)
  altBaseline: number;
  ast: number; // U/L (baseline < 40)
  astBaseline: number;
  totalBilirubin: number; // mg/dL (baseline < 1.2)
  totalBilirubinBaseline: number;
  albumin: number; // g/dL (baseline 3.5-5.0)
  albuminBaseline: number;
  inr: number; // baseline 0.9-1.1
  alkalinePhosphatase: number; // U/L
  pattern: 'Hepatocellular' | 'Cholestatic' | 'Mixed' | 'Normal' | 'Congestive';
}

export interface CardiacMetrics {
  heartRate: number; // bpm
  heartRateBaseline: number;
  meanArterialPressure: number; // mmHg (normal 65-100)
  mapBaseline: number;
  systolicBP: number; // mmHg
  diastolicBP: number; // mmHg
  cardiacIndex?: number; // L/min/m2
  troponinI: number; // ng/mL (baseline < 0.04)
  ecgRhythm: string; // e.g. "Sinus Tachycardia", "Normal Sinus", "Atrial Fibrillation"
  qtcInterval: number; // ms
  inotropicSupport: boolean;
  vasopressorDose?: string; // e.g. "Norepinephrine 0.08 mcg/kg/min"
}

export interface RespiratoryMetrics {
  spO2: number; // %
  spO2Baseline: number;
  respiratoryRate: number; // breaths/min
  rrBaseline: number;
  paO2FiO2Ratio: number; // P/F ratio (normal > 300)
  pfBaseline: number;
  fiO2: number; // % oxygen delivered (21% room air - 100%)
  peep?: number; // cmH2O
  oxygenSupportMode: 'Room Air' | 'Nasal Cannula' | 'High Flow Nasal Cannula' | 'BiPAP' | 'Mechanical Ventilation';
  lungCompliance?: number; // mL/cmH2O
  workOfBreathing: 'Normal' | 'Mildly Increased' | 'Significantly Increased' | 'Exhaustion Risk';
}

export interface OrganTimeSeriesPoint {
  timestamp: string;
  renalScore: number;
  hepaticScore: number;
  cardiacScore: number;
  respiratoryScore: number;
  // Key individual parameters
  creatinine?: number;
  eGFR?: number;
  urineOutput?: number;
  fluidBalance?: number;
  alt?: number;
  ast?: number;
  bilirubin?: number;
  albumin?: number;
  heartRate?: number;
  map?: number;
  troponin?: number;
  spO2?: number;
  respiratoryRate?: number;
  fiO2?: number;
}
