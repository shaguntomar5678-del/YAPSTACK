export interface ModalityQuality {
  name: string;
  sourceSystem: string;
  samplingFrequency: string; // e.g. "Continuous (1 Hz)", "q1h", "q6h", "q12h"
  completenessRate: number; // 0-100%
  latencySeconds: number;
  lastTransmission: string;
  irregularSamplingDetected: boolean;
  artifactsCount24h: number;
  status: 'Optimal' | 'Degraded' | 'Offline' | 'Delayed';
}

export interface MissingMeasurementRecord {
  testOrVital: string;
  category: 'Renal Panel' | 'Hepatic Function' | 'Hemodynamics' | 'Blood Gases' | 'Fluid Balance';
  lastRecordedAt?: string;
  hoursSinceLastMeasurement: number;
  expectedFrequencyHours: number;
  clinicalImpactTier: 'High' | 'Medium' | 'Low';
  patientId: string;
  patientName: string;
}

export interface DataQualityAudit {
  patientId: string;
  overallTrustScore: number; // 0-100
  completenessScore: number;
  consistencyScore: number;
  baselineIntegrityScore: number;
  totalMissingExpectedPoints: number;
  activeQualityFlags: {
    id: string;
    level: 'critical' | 'warning' | 'info';
    title: string;
    description: string;
    affectedModalities: string[];
    suggestedVerification: string;
  }[];
  modalities: ModalityQuality[];
  missingMeasurements: MissingMeasurementRecord[];
  timeline24h: {
    hour: string;
    vitalsRecorded: number;
    labsRecorded: number;
    gapsDetected: boolean;
  }[];
}
