import { Patient } from '../types/patient';
import { MOCK_PATIENTS } from './mockData';

export interface PatientFilters {
  searchQuery?: string;
  unit?: string;
  acuityTier?: string;
  requiresReviewOnly?: boolean;
  multiOrganOnly?: boolean;
}

export interface HospitalKPIs {
  monitoredPatients: number;
  requiringReview: number;
  multiOrganPatterns: number;
  dataQualityIssues: number;
  criticalCount: number;
  urgentCount: number;
  guardedCount: number;
  stableCount: number;
}

export const patientService = {
  async getPatients(filters?: PatientFilters): Promise<Patient[]> {
    // Simulated network delay
    await new Promise((resolve) => setTimeout(resolve, 80));

    let patients = [...MOCK_PATIENTS];

    if (filters) {
      if (filters.searchQuery) {
        const q = filters.searchQuery.toLowerCase();
        patients = patients.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.id.toLowerCase().includes(q) ||
            p.mrn.toLowerCase().includes(q) ||
            p.primaryDiagnosis.toLowerCase().includes(q) ||
            p.bed.toLowerCase().includes(q)
        );
      }
      if (filters.unit && filters.unit !== 'All Units') {
        patients = patients.filter((p) => p.unit === filters.unit);
      }
      if (filters.acuityTier && filters.acuityTier !== 'All Tiers') {
        patients = patients.filter((p) => p.acuityTier === filters.acuityTier);
      }
      if (filters.requiresReviewOnly) {
        patients = patients.filter((p) => p.requiresReview);
      }
      if (filters.multiOrganOnly) {
        patients = patients.filter((p) => p.multiOrganPatternDetected);
      }
    }

    return patients;
  },

  async getPatientById(id: string): Promise<Patient | null> {
    await new Promise((resolve) => setTimeout(resolve, 50));
    const found = MOCK_PATIENTS.find((p) => p.id === id);
    return found || null;
  },

  async getHospitalKPIs(): Promise<HospitalKPIs> {
    await new Promise((resolve) => setTimeout(resolve, 50));
    const total = MOCK_PATIENTS.length;
    const requiringReview = MOCK_PATIENTS.filter((p) => p.requiresReview).length;
    const multiOrganPatterns = MOCK_PATIENTS.filter((p) => p.multiOrganPatternDetected).length;
    const dataQualityIssues = MOCK_PATIENTS.filter((p) => p.dataQuality.flags.length > 0 || p.dataQuality.missingModalityCount > 0).length;

    const criticalCount = MOCK_PATIENTS.filter((p) => p.acuityTier === 'Critical').length;
    const urgentCount = MOCK_PATIENTS.filter((p) => p.acuityTier === 'Urgent').length;
    const guardedCount = MOCK_PATIENTS.filter((p) => p.acuityTier === 'Guarded').length;
    const stableCount = MOCK_PATIENTS.filter((p) => p.acuityTier === 'Stable').length;

    return {
      monitoredPatients: total,
      requiringReview,
      multiOrganPatterns,
      dataQualityIssues,
      criticalCount,
      urgentCount,
      guardedCount,
      stableCount,
    };
  },
};
