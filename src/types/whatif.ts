export interface WhatIfParameters {
  renalIntensity: number; // -50 to +100 (%)
  cardiacIntensity: number; // -50 to +100 (%)
  respiratoryIntensity: number; // -50 to +100 (%)
  fluidBalanceDeltaMl: number; // -2000 to +3000 (mL)
  simulateMissingLabs: boolean;
  selectedInterventionPreset?: 'aggressive_diuresis' | 'fluid_resuscitation' | 'vasopressor_escalation' | 'protective_ventilation' | 'baseline';
}

export interface SimulationResultPoint {
  hourOffset: number; // 0 to 24
  timestamp: string;
  baselineCompositeScore: number;
  hypotheticalCompositeScore: number;
  baselineRenalScore: number;
  hypotheticalRenalScore: number;
  baselineCardiacScore: number;
  hypotheticalCardiacScore: number;
  baselineRespiratoryScore: number;
  hypotheticalRespiratoryScore: number;
  uncertaintyBandWidth: number; // expanded if simulateMissingLabs is true
}

export interface WhatIfSimulationOutcome {
  patientId: string;
  parameters: WhatIfParameters;
  simulatedPoints: SimulationResultPoint[];
  deltaDecompensationRisk: number; // e.g. -14% or +28%
  hypotheticalRiskTier: 'Critical' | 'Urgent' | 'Guarded' | 'Stable';
  organImpacts: {
    organ: 'renal' | 'hepatic' | 'cardiac' | 'respiratory';
    deltaScore: number;
    explanation: string;
    direction: 'improved' | 'worsened' | 'neutral';
  }[];
  physiologicalRationale: string;
  confidenceRating: 'High' | 'Moderate' | 'Degraded (Missing Data)';
}
