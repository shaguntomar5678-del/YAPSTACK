import { DataQualityAudit } from '../types/dataTrust';
import { MOCK_DATA_TRUST_AUDIT } from './mockData';
import { patientService } from './patientService';

export const dataTrustService = {
  async getAuditForPatient(patientId: string): Promise<DataQualityAudit> {
    await new Promise((resolve) => setTimeout(resolve, 80));
    const patient = await patientService.getPatientById(patientId);

    // Return customized audit or base audit
    if (!patient) return MOCK_DATA_TRUST_AUDIT;

    return {
      ...MOCK_DATA_TRUST_AUDIT,
      patientId: patient.id,
      overallTrustScore: patient.dataQuality.overallCompleteness,
      activeQualityFlags: patient.dataQuality.flags.map((flag, idx) => ({
        id: `DQ-${idx + 1}`,
        level: 'warning' as const,
        title: flag,
        description: 'Automated telemetry ingestion detected potential sampling gap or required recalibration interval.',
        affectedModalities: ['Laboratory / Bedside Monitoring'],
        suggestedVerification: 'Review bedside telemetry source and bedside nurse validation notes.'
      })),
    };
  },
};
