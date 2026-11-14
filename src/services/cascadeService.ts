import { MOCK_CASCADE_DATA } from './mockData';
import { CascadeNodeData, CascadeEdgeData, CascadeTimelineStep } from '../types/cascade';

export interface CascadeGraphPayload {
  nodes: { id: string; type: string; position: { x: number; y: number }; data: CascadeNodeData }[];
  edges: { id: string; source: string; target: string; data: CascadeEdgeData; animated?: boolean }[];
  timelineSteps: CascadeTimelineStep[];
}

export const cascadeService = {
  async getCascadeGraph(patientId: string): Promise<CascadeGraphPayload> {
    await new Promise((resolve) => setTimeout(resolve, 80));
    // In demo environment, we provide the full detailed graph for Eleanor Vance,
    // and adapted nodes for others if needed
    return MOCK_CASCADE_DATA;
  },
};
