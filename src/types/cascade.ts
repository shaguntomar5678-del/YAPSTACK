export type CascadeNodeType = 'organ' | 'event' | 'syndrome' | 'intervention';

export type CascadeRelationshipType = 'observed_association' | 'clinically_reviewed_pathophysiology';

export interface CascadeNodeData {
  label: string;
  sublabel?: string;
  category: 'renal' | 'fluid' | 'cardiac' | 'respiratory' | 'hepatic' | 'systemic';
  status: 'normal' | 'watch' | 'warning' | 'critical';
  timestamp: string;
  relativeTime: string; // e.g. "Hour 0", "Hour +8", "Hour +18"
  primaryMetric: {
    name: string;
    value: string;
    deltaVsBaseline: string;
  };
  observedEvidence: string[];
  reviewedPathophysiology?: string;
  isTriggerNode?: boolean;
}

export interface CascadeEdgeData {
  relationshipType: CascadeRelationshipType;
  temporalLag: string; // e.g., "6h lag", "12h lag"
  correlationScore: number; // 0.0 to 1.0 (synthetic demo)
  directionDescription: string;
  evidenceSummary: string;
  pathophysiologicalMechanism: string;
  isClinicallyReviewed: boolean;
}

export interface CascadeTimelineStep {
  step: number;
  label: string;
  timestamp: string;
  description: string;
  activeNodeIds: string[];
  activeEdgeIds: string[];
}
