import { OrganTimeSeriesPoint } from '../types/organ';
import { patientService } from './patientService';

export const organService = {
  async getLongitudinalSeries(patientId: string): Promise<OrganTimeSeriesPoint[]> {
    const patient = await patientService.getPatientById(patientId);
    if (!patient) return [];
    return patient.timeSeries;
  },
};
