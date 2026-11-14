import { FutureCastPrediction, PredictionHorizon } from '../types/futurecast';
import { generateMockFutureCast } from './mockData';

export const futurecastService = {
  async getPrediction(patientId: string, horizon: PredictionHorizon): Promise<FutureCastPrediction> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    return generateMockFutureCast(patientId, horizon);
  },
};
