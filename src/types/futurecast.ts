export type PredictionHorizon = '6h' | '12h' | '24h' | '48h';

export interface TrajectoryDataPoint {
  timestamp: string;
  hourOffset: number; // e.g. -24 to +48
  isHistorical: boolean;
  actualRiskScore?: number;
  projectedMedian: number;
  worseningScenario: number;
  stableScenario: number;
  uncertaintyUpper: number;
  uncertaintyLower: number;

  // Organ breakdown projected scores (0-100)
  projectedRenal: number;
  projectedHepatic: number;
  projectedCardiac: number;
  projectedRespiratory: number;
}

export interface FutureCastPrediction {
  patientId: string;
  horizon: PredictionHorizon;
  generatedAt: string;
  trajectory: TrajectoryDataPoint[];
  decompensationProbability: number; // 0-100%
  baselineRiskScore: number;
  projectedRiskScoreMedian: number;
  primaryRiskDrivers: {
    organ: 'renal' | 'hepatic' | 'cardiac' | 'respiratory';
    factor: string;
    impact: 'high' | 'moderate' | 'low';
    confidenceInterval: string;
  }[];
  conformalUncertaintyPercent: number; // e.g. +/- 14%
  modelLimitations: string[];
  clinicalEvidencePoints: string[];
}
