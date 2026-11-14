export type AlertPriority = 'Critical' | 'High' | 'Moderate' | 'Informational';

export interface ClinicalAlert {
  id: string;
  patientId: string;
  patientName: string;
  patientBed: string;
  priority: AlertPriority;
  organSystems: ('renal' | 'hepatic' | 'cardiac' | 'respiratory')[];
  title: string;
  message: string;
  timestamp: string;
  evidence: {
    indicator: string;
    value: string;
    threshold: string;
    baseline: string;
  }[];
  dataReliability: 'High' | 'Moderate' | 'Artifact Suspected';
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  reviewNotes?: string;
  recommendedAction?: string;
}
