import { ClinicalAlert } from '../types/alert';
import { MOCK_ALERTS } from './mockData';

let alertState: ClinicalAlert[] = [...MOCK_ALERTS];

export const alertService = {
  async getAlerts(filterPatientId?: string): Promise<ClinicalAlert[]> {
    await new Promise((resolve) => setTimeout(resolve, 60));
    if (filterPatientId) {
      return alertState.filter((a) => a.patientId === filterPatientId);
    }
    return [...alertState];
  },

  async acknowledgeAlert(alertId: string, clinicianName: string, notes: string): Promise<ClinicalAlert | null> {
    await new Promise((resolve) => setTimeout(resolve, 80));
    const idx = alertState.findIndex((a) => a.id === alertId);
    if (idx === -1) return null;

    alertState[idx] = {
      ...alertState[idx],
      acknowledged: true,
      acknowledgedBy: clinicianName,
      acknowledgedAt: new Date().toISOString(),
      reviewNotes: notes,
    };

    return alertState[idx];
  },
};
