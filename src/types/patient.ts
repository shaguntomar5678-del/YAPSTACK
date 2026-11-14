import { OrganStatus, RenalMetrics, HepaticMetrics, CardiacMetrics, RespiratoryMetrics, OrganTimeSeriesPoint } from './organ';

export type AcuityTier = 'Critical' | 'Urgent' | 'Guarded' | 'Stable';

export interface DeteriorationEvent {
  id: string;
  timestamp: string;
  primaryOrgan: 'renal' | 'hepatic' | 'cardiac' | 'respiratory' | 'multi-organ';
  title: string;
  description: string;
  severity: 'critical' | 'warning' | 'info';
  observedParameters: { name: string; value: string; baseline: string }[];
  clinicalSignificance: string;
}

export interface ExplainabilityFactor {
  factor: string;
  organ: 'renal' | 'hepatic' | 'cardiac' | 'respiratory';
  weight: number; // percentage contribution
  trendDirection: 'rising' | 'falling' | 'erratic' | 'stable';
  clinicalContext: string;
}

export interface Patient {
  id: string;
  mrn: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  bed: string;
  unit: 'Medical ICU' | 'Surgical ICU' | 'Cardiac ICU' | 'Step-Down Unit' | 'Telemetry';
  admissionDate: string;
  icuDay: number;
  primaryDiagnosis: string;
  comorbidities: string[];
  allergies: string[];
  codeStatus: 'Full Code' | 'DNR/DNI' | 'Limited Intervention';
  acuityTier: AcuityTier;
  riskScore: number; // 0-100 overall composite risk score
  requiresReview: boolean;
  multiOrganPatternDetected: boolean;
  patternDescription?: string;

  // Organ system current status
  organStatuses: {
    renal: OrganStatus;
    hepatic: OrganStatus;
    cardiac: OrganStatus;
    respiratory: OrganStatus;
  };

  // Detailed current parameters
  renal: RenalMetrics;
  hepatic: HepaticMetrics;
  cardiac: CardiacMetrics;
  respiratory: RespiratoryMetrics;

  // Longitudinal history (e.g. past 48-72 hours)
  timeSeries: OrganTimeSeriesPoint[];

  // Deterioration events
  deteriorationEvents: DeteriorationEvent[];

  // Top explainability drivers
  explainabilityFactors: ExplainabilityFactor[];

  // Data Trust summary
  dataQuality: {
    overallCompleteness: number; // percentage
    measurementConsistency: number; // percentage
    baselineAvailable: boolean;
    missingModalityCount: number;
    flags: string[];
    lastSync: string;
  };
}
