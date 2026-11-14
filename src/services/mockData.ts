import { Patient } from '../types/patient';
import { ClinicalAlert } from '../types/alert';
import { DataQualityAudit } from '../types/dataTrust';
import { CascadeNodeData, CascadeEdgeData, CascadeTimelineStep } from '../types/cascade';
import { FutureCastPrediction } from '../types/futurecast';

// Generate hourly time series for Sunita Sharma (PAT-1082) past 48 hours
function generateSunitaTimeSeries() {
  const points = [];
  const baseDate = new Date('2026-11-14T18:00:00Z');

  for (let i = 48; i >= 0; i--) {
    const time = new Date(baseDate.getTime() - i * 3600 * 1000).toISOString();
    // Progressive septic worsening over 48 hours
    const progress = (48 - i) / 48; // 0 to 1

    const renalScore = Math.min(95, Math.round(20 + progress * 68 + (Math.sin(i * 0.4) * 3)));
    const hepaticScore = Math.min(65, Math.round(15 + progress * 35 + (Math.cos(i * 0.3) * 2)));
    const cardiacScore = Math.min(85, Math.round(25 + progress * 52 + (Math.sin(i * 0.5) * 4)));
    const respiratoryScore = Math.min(80, Math.round(20 + progress * 55 + (Math.cos(i * 0.4) * 3)));

    const creatinine = +(0.9 + progress * 1.9 + (i % 6 === 0 ? 0.05 : 0)).toFixed(2);
    const eGFR = Math.round(92 - progress * 74);
    const urineOutput = +(0.95 - progress * 0.72 + (Math.sin(i) * 0.04)).toFixed(2);
    const fluidBalance = Math.round(200 + progress * 3600);

    const alt = Math.round(22 + progress * 62);
    const ast = Math.round(24 + progress * 72);
    const bilirubin = +(0.6 + progress * 1.2).toFixed(1);
    const albumin = +(4.1 - progress * 1.3).toFixed(1);

    const heartRate = Math.round(76 + progress * 42 + Math.sin(i) * 3);
    const map = Math.round(82 - progress * 24 + Math.cos(i) * 2);
    const troponin = +(0.01 + progress * 0.07).toFixed(3);

    const spO2 = Math.round(98 - progress * 7 - (i < 8 ? 1 : 0));
    const respiratoryRate = Math.round(16 + progress * 12);
    const fiO2 = Math.round(21 + progress * 34);

    points.push({
      timestamp: time,
      renalScore,
      hepaticScore,
      cardiacScore,
      respiratoryScore,
      creatinine,
      eGFR,
      urineOutput,
      fluidBalance,
      alt,
      ast,
      bilirubin,
      albumin,
      heartRate,
      map,
      troponin,
      spO2,
      respiratoryRate,
      fiO2,
    });
  }
  return points;
}

// Generate time series for Rajesh Patel (PAT-2041)
function generateRajeshTimeSeries() {
  const points = [];
  const baseDate = new Date('2026-11-14T18:00:00Z');

  for (let i = 48; i >= 0; i--) {
    const time = new Date(baseDate.getTime() - i * 3600 * 1000).toISOString();
    const progress = (48 - i) / 48;

    const cardiacScore = Math.min(92, Math.round(40 + progress * 48 + Math.sin(i * 0.6) * 4));
    const renalScore = Math.min(80, Math.round(25 + progress * 48 + Math.cos(i * 0.5) * 3));
    const hepaticScore = Math.min(78, Math.round(18 + progress * 55 + Math.sin(i * 0.3) * 2));
    const respiratoryScore = Math.min(65, Math.round(22 + progress * 38 + Math.cos(i * 0.4) * 3));

    const creatinine = +(1.1 + progress * 1.0).toFixed(2);
    const eGFR = Math.round(78 - progress * 50);
    const urineOutput = +(0.8 - progress * 0.5).toFixed(2);
    const fluidBalance = Math.round(500 + progress * 3700);

    const alt = Math.round(35 + progress * 285);
    const ast = Math.round(38 + progress * 372);
    const bilirubin = +(0.8 + progress * 2.1).toFixed(1);
    const albumin = +(3.8 - progress * 0.8).toFixed(1);

    const heartRate = Math.round(84 + progress * 20 + Math.sin(i) * 5);
    const map = Math.round(78 - progress * 14);
    const troponin = +(0.2 + progress * 14.6).toFixed(2);

    const spO2 = Math.round(97 - progress * 4);
    const respiratoryRate = Math.round(18 + progress * 6);
    const fiO2 = Math.round(21 + progress * 19);

    points.push({
      timestamp: time,
      renalScore,
      hepaticScore,
      cardiacScore,
      respiratoryScore,
      creatinine,
      eGFR,
      urineOutput,
      fluidBalance,
      alt,
      ast,
      bilirubin,
      albumin,
      heartRate,
      map,
      troponin,
      spO2,
      respiratoryRate,
      fiO2,
    });
  }
  return points;
}

export const MOCK_PATIENTS: Patient[] = [
  {
    id: 'PAT-1082',
    mrn: 'MRN-8829104',
    name: 'Sunita Sharma',
    age: 68,
    gender: 'Female',
    bed: 'MICU Bed 04-A',
    unit: 'Medical ICU',
    admissionDate: '2026-11-11T08:30:00Z',
    icuDay: 3,
    primaryDiagnosis: 'Septic Shock secondary to Urosepsis & Acute Kidney Injury',
    comorbidities: ['Type 2 Diabetes Mellitus', 'Hypertension', 'CKD Stage 2 (Baseline Cr 0.9)'],
    allergies: ['Penicillin', 'Sulfa drugs'],
    codeStatus: 'Full Code',
    acuityTier: 'Critical',
    riskScore: 88,
    requiresReview: true,
    multiOrganPatternDetected: true,
    patternDescription: 'Septic vasodilation propagating to ATN with secondary fluid overload and ventilation-perfusion mismatch.',
    organStatuses: {
      renal: {
        status: 'critical',
        trend: 'deteriorating',
        score: 88,
        primaryConcerns: ['KDIGO Stage 3 AKI', 'Oliguria < 0.25 mL/kg/h', 'Cr +211% above baseline', 'Positive Fluid Balance +3800 mL'],
        lastAssessed: '2026-11-14T17:45:00Z',
      },
      hepatic: {
        status: 'watch',
        trend: 'deteriorating',
        score: 48,
        primaryConcerns: ['Moderate Transaminitis (ALT 84, AST 96)', 'Hypoalbuminemia 2.8 g/dL'],
        lastAssessed: '2026-11-14T16:00:00Z',
      },
      cardiac: {
        status: 'warning',
        trend: 'deteriorating',
        score: 74,
        primaryConcerns: ['Vasopressor dependence (Norepinephrine 0.12 mcg/kg/min)', 'MAP 60 mmHg refractory to fluid challenge', 'Persistent Sinus Tachycardia HR 118'],
        lastAssessed: '2026-11-14T17:50:00Z',
      },
      respiratory: {
        status: 'warning',
        trend: 'deteriorating',
        score: 72,
        primaryConcerns: ['Worsening P/F ratio (195)', 'High Flow NC 45L / 55% FiO2', 'Tachypnea RR 28'],
        lastAssessed: '2026-11-14T17:55:00Z',
      },
    },
    renal: {
      creatinine: 2.8,
      creatinineBaseline: 0.9,
      eGFR: 18,
      eGFRBaseline: 72,
      urineOutput: 0.22,
      urineOutputBaseline: 0.95,
      cumulativeFluidBalance24h: 3820,
      bloodUreaNitrogen: 64,
      potassium: 5.4,
      kdigoStage: 'Stage 3',
    },
    hepatic: {
      alt: 84,
      altBaseline: 22,
      ast: 96,
      astBaseline: 24,
      totalBilirubin: 1.8,
      totalBilirubinBaseline: 0.6,
      albumin: 2.8,
      albuminBaseline: 4.1,
      inr: 1.4,
      alkalinePhosphatase: 142,
      pattern: 'Mixed',
    },
    cardiac: {
      heartRate: 118,
      heartRateBaseline: 76,
      meanArterialPressure: 60,
      mapBaseline: 82,
      systolicBP: 88,
      diastolicBP: 46,
      cardiacIndex: 2.3,
      troponinI: 0.08,
      ecgRhythm: 'Sinus Tachycardia with non-specific ST changes',
      qtcInterval: 442,
      inotropicSupport: true,
      vasopressorDose: 'Norepinephrine @ 0.12 mcg/kg/min',
    },
    respiratory: {
      spO2: 91,
      spO2Baseline: 98,
      respiratoryRate: 28,
      rrBaseline: 16,
      paO2FiO2Ratio: 195,
      pfBaseline: 420,
      fiO2: 55,
      oxygenSupportMode: 'High Flow Nasal Cannula',
      workOfBreathing: 'Significantly Increased',
    },
    timeSeries: generateSunitaTimeSeries(),
    deteriorationEvents: [
      {
        id: 'EVT-01',
        timestamp: '2026-11-14T16:30:00Z',
        primaryOrgan: 'renal',
        title: 'Oliguric KDIGO Stage 3 Transition',
        description: 'Urine output dropped below 0.25 mL/kg/h for 4 consecutive hours. Serum creatinine increased to 2.8 mg/dL.',
        severity: 'critical',
        observedParameters: [
          { name: 'Creatinine', value: '2.8 mg/dL', baseline: '0.9 mg/dL' },
          { name: 'Urine Output', value: '0.22 mL/kg/h', baseline: '0.95 mL/kg/h' },
          { name: 'Fluid Balance 24h', value: '+3820 mL', baseline: '+250 mL' }
        ],
        clinicalSignificance: 'High risk of acute uremic complications and volume overload prompting nephrology consult for CRRT evaluation.'
      },
      {
        id: 'EVT-02',
        timestamp: '2026-11-14T14:15:00Z',
        primaryOrgan: 'cardiac',
        title: 'Escalation of Vasopressor Requirement',
        description: 'Mean arterial pressure dropped to 58 mmHg despite 2L crystalloid bolus; norepinephrine infusion initiated.',
        severity: 'critical',
        observedParameters: [
          { name: 'MAP', value: '60 mmHg', baseline: '82 mmHg' },
          { name: 'Norepinephrine', value: '0.12 mcg/kg/min', baseline: 'None' }
        ],
        clinicalSignificance: 'Persistent distributive shock impairing renal perfusion pressure.'
      },
      {
        id: 'EVT-03',
        timestamp: '2026-11-14T11:00:00Z',
        primaryOrgan: 'respiratory',
        title: 'High Flow Oxygen Escalation',
        description: 'Transitioned from nasal cannula 4L to HFNC 45L / 55% due to tachypnea (RR 28) and SpO2 90%.',
        severity: 'warning',
        observedParameters: [
          { name: 'SpO2', value: '91%', baseline: '98%' },
          { name: 'P/F Ratio', value: '195', baseline: '420' }
        ],
        clinicalSignificance: 'Early non-cardiogenic pulmonary edema secondary to capillary leak and aggressive volume loading.'
      }
    ],
    explainabilityFactors: [
      {
        factor: 'Acute Tubular Necrosis / Sepsis-Induced AKI',
        organ: 'renal',
        weight: 38,
        trendDirection: 'rising',
        clinicalContext: 'Creatinine 2.8 mg/dL (+211% vs baseline) combined with prolonged oliguria and high BUN/Cr ratio.'
      },
      {
        factor: 'Vasoplegic Shock & Refractory Hypotension',
        organ: 'cardiac',
        weight: 29,
        trendDirection: 'rising',
        clinicalContext: 'MAP 60 mmHg requiring ongoing norepinephrine titration to preserve organ perfusion.'
      },
      {
        factor: 'Pulmonary Capillary Leak & Volume Transudation',
        organ: 'respiratory',
        weight: 22,
        trendDirection: 'rising',
        clinicalContext: 'P/F ratio 195 with +3820 mL net fluid balance creating alveolar-capillary barrier degradation.'
      },
      {
        factor: 'Ischemic & Sepsis-associated Hepatocellular Injury',
        organ: 'hepatic',
        weight: 11,
        trendDirection: 'rising',
        clinicalContext: 'ALT 84 / AST 96 representing secondary splanchnic hypoperfusion.'
      }
    ],
    dataQuality: {
      overallCompleteness: 94.2,
      measurementConsistency: 96.5,
      baselineAvailable: true,
      missingModalityCount: 0,
      flags: ['Recent ABG older than 4 hours', 'Continuous arterial line calibrated 6h ago'],
      lastSync: '2026-11-14T17:58:00Z',
    }
  },
  {
    id: 'PAT-2041',
    mrn: 'MRN-4491028',
    name: 'Rajesh Patel',
    age: 54,
    gender: 'Male',
    bed: 'CICU Bed 02-B',
    unit: 'Cardiac ICU',
    admissionDate: '2026-11-12T14:10:00Z',
    icuDay: 2,
    primaryDiagnosis: 'Cardiogenic Shock post-anterior STEMI s/p PCI to LAD',
    comorbidities: ['Coronary Artery Disease', 'Hyperlipidemia', 'Smoking history'],
    allergies: ['Aspirin (Bronchospasm)'],
    codeStatus: 'Full Code',
    acuityTier: 'Critical',
    riskScore: 84,
    requiresReview: true,
    multiOrganPatternDetected: true,
    patternDescription: 'Forward cardiac pump failure leading to venous congestion, Cardiorenal Type 1 syndrome, and congestive hepatopathy.',
    organStatuses: {
      cardiac: {
        status: 'critical',
        trend: 'deteriorating',
        score: 91,
        primaryConcerns: ['Elevated Troponin I (14.8 ng/mL)', 'Depressed Cardiac Index (1.8 L/min/m2)', 'Atrial Fibrillation with RVR'],
        lastAssessed: '2026-11-14T17:40:00Z',
      },
      renal: {
        status: 'warning',
        trend: 'deteriorating',
        score: 75,
        primaryConcerns: ['Cardiorenal Syndrome Type 1', 'Creatinine 2.1 mg/dL (baseline 1.1)', 'Elevated CVP / venous congestion'],
        lastAssessed: '2026-11-14T17:30:00Z',
      },
      hepatic: {
        status: 'warning',
        trend: 'deteriorating',
        score: 72,
        primaryConcerns: ['Congestive Hepatopathy', 'ALT 320 U/L, AST 410 U/L', 'Total Bilirubin 2.9 mg/dL', 'INR 1.6'],
        lastAssessed: '2026-11-14T16:45:00Z',
      },
      respiratory: {
        status: 'watch',
        trend: 'stable',
        score: 54,
        primaryConcerns: ['Cardiogenic pulmonary edema', 'BiPAP support 12/6 cmH2O', 'FiO2 40%'],
        lastAssessed: '2026-11-14T17:15:00Z',
      },
    },
    renal: {
      creatinine: 2.1,
      creatinineBaseline: 1.1,
      eGFR: 32,
      eGFRBaseline: 78,
      urineOutput: 0.35,
      urineOutputBaseline: 0.8,
      cumulativeFluidBalance24h: 4200,
      bloodUreaNitrogen: 52,
      potassium: 4.8,
      kdigoStage: 'Stage 2',
    },
    hepatic: {
      alt: 320,
      altBaseline: 35,
      ast: 410,
      astBaseline: 38,
      totalBilirubin: 2.9,
      totalBilirubinBaseline: 0.8,
      albumin: 3.1,
      albuminBaseline: 3.8,
      inr: 1.6,
      alkalinePhosphatase: 165,
      pattern: 'Congestive',
    },
    cardiac: {
      heartRate: 104,
      heartRateBaseline: 72,
      meanArterialPressure: 64,
      mapBaseline: 85,
      systolicBP: 92,
      diastolicBP: 50,
      cardiacIndex: 1.8,
      troponinI: 14.8,
      ecgRhythm: 'Atrial Fibrillation with rapid ventricular response',
      qtcInterval: 468,
      inotropicSupport: true,
      vasopressorDose: 'Dobutamine 5 mcg/kg/min + Norepi 0.06 mcg/kg/min',
    },
    respiratory: {
      spO2: 93,
      spO2Baseline: 97,
      respiratoryRate: 24,
      rrBaseline: 16,
      paO2FiO2Ratio: 232,
      pfBaseline: 380,
      fiO2: 40,
      peep: 6,
      oxygenSupportMode: 'BiPAP',
      workOfBreathing: 'Mildly Increased',
    },
    timeSeries: generateRajeshTimeSeries(),
    deteriorationEvents: [
      {
        id: 'EVT-11',
        timestamp: '2026-11-14T15:20:00Z',
        primaryOrgan: 'cardiac',
        title: 'New Onset Atrial Fibrillation with RVR',
        description: 'Rhythm converted to AFib with ventricular rates up to 125 bpm, reducing diastolic filling and cardiac output.',
        severity: 'critical',
        observedParameters: [
          { name: 'Heart Rate', value: '104 bpm', baseline: '72 bpm' },
          { name: 'Cardiac Index', value: '1.8 L/min/m2', baseline: '2.8 L/min/m2' }
        ],
        clinicalSignificance: 'Compounding cardiogenic shock; rhythm control strategy initiated.'
      },
      {
        id: 'EVT-12',
        timestamp: '2026-11-14T12:00:00Z',
        primaryOrgan: 'hepatic',
        title: 'Shock Liver / Congestive Hepatopathy Surge',
        description: 'Transaminases escalated >8x baseline (ALT 320, AST 410) alongside rising bilirubin 2.9 mg/dL.',
        severity: 'warning',
        observedParameters: [
          { name: 'ALT', value: '320 U/L', baseline: '35 U/L' },
          { name: 'AST', value: '410 U/L', baseline: '38 U/L' }
        ],
        clinicalSignificance: 'Reflects severe right ventricular failure and venous back-pressure.'
      }
    ],
    explainabilityFactors: [
      {
        factor: 'Acute Left Ventricular Systolic Dysfunction',
        organ: 'cardiac',
        weight: 46,
        trendDirection: 'rising',
        clinicalContext: 'Troponin peak 14.8 ng/mL and low stroke volume index.'
      },
      {
        factor: 'Right Heart Failure & Splanchnic Congestion',
        organ: 'hepatic',
        weight: 26,
        trendDirection: 'rising',
        clinicalContext: 'Elevated central venous pressure causing centrilobular liver congestion.'
      },
      {
        factor: 'Low Cardiac Output Renal Hypoperfusion',
        organ: 'renal',
        weight: 20,
        trendDirection: 'rising',
        clinicalContext: 'Drop in renal filtration gradient with rising serum creatinine.'
      },
      {
        factor: 'Hydrostatic Alveolar Transudation',
        organ: 'respiratory',
        weight: 8,
        trendDirection: 'stable',
        clinicalContext: 'Cardiogenic pulmonary edema responsive to non-invasive ventilation.'
      }
    ],
    dataQuality: {
      overallCompleteness: 98.1,
      measurementConsistency: 97.8,
      baselineAvailable: true,
      missingModalityCount: 0,
      flags: ['Cardiac telemetry continuous', 'Echo completed 8 hours ago'],
      lastSync: '2026-11-14T17:55:00Z',
    }
  },
  {
    id: 'PAT-3190',
    mrn: 'MRN-7739012',
    name: 'Priya Nair',
    age: 61,
    gender: 'Female',
    bed: 'SICU Bed 08',
    unit: 'Surgical ICU',
    admissionDate: '2026-11-10T19:00:00Z',
    icuDay: 4,
    primaryDiagnosis: 'Severe Acute Pancreatitis complicated by moderate ARDS',
    comorbidities: ['Cholelithiasis', 'Obesity Class II (BMI 36.2)'],
    allergies: ['No known drug allergies'],
    codeStatus: 'Full Code',
    acuityTier: 'Urgent',
    riskScore: 73,
    requiresReview: true,
    multiOrganPatternDetected: true,
    patternDescription: 'Systemic inflammatory response with secondary pulmonary alveolar damage and moderate renal stress.',
    organStatuses: {
      respiratory: {
        status: 'critical',
        trend: 'deteriorating',
        score: 86,
        primaryConcerns: ['Moderate ARDS (P/F ratio 140)', 'Volume-cycled Mechanical Ventilation', 'PEEP 12 cmH2O, FiO2 60%'],
        lastAssessed: '2026-11-14T17:35:00Z',
      },
      renal: {
        status: 'warning',
        trend: 'stable',
        score: 64,
        primaryConcerns: ['Creatinine 1.7 mg/dL (baseline 0.8)', 'Third-spacing with positive fluid balance'],
        lastAssessed: '2026-11-14T17:00:00Z',
      },
      hepatic: {
        status: 'watch',
        trend: 'improving',
        score: 44,
        primaryConcerns: ['Resolving biliary stasis', 'Total Bilirubin 2.1 mg/dL', 'Alkaline Phosphatase 210 U/L'],
        lastAssessed: '2026-11-14T15:30:00Z',
      },
      cardiac: {
        status: 'stable',
        trend: 'stable',
        score: 32,
        primaryConcerns: ['Sinus Tachycardia HR 92 bpm', 'MAP 74 mmHg maintained without inotropes'],
        lastAssessed: '2026-11-14T17:20:00Z',
      },
    },
    renal: {
      creatinine: 1.7,
      creatinineBaseline: 0.8,
      eGFR: 42,
      eGFRBaseline: 90,
      urineOutput: 0.52,
      urineOutputBaseline: 0.9,
      cumulativeFluidBalance24h: 1950,
      bloodUreaNitrogen: 38,
      potassium: 4.3,
      kdigoStage: 'Stage 1',
    },
    hepatic: {
      alt: 65,
      altBaseline: 24,
      ast: 78,
      astBaseline: 22,
      totalBilirubin: 2.1,
      totalBilirubinBaseline: 0.7,
      albumin: 2.6,
      albuminBaseline: 3.9,
      inr: 1.2,
      alkalinePhosphatase: 210,
      pattern: 'Cholestatic',
    },
    cardiac: {
      heartRate: 92,
      heartRateBaseline: 74,
      meanArterialPressure: 74,
      mapBaseline: 80,
      systolicBP: 114,
      diastolicBP: 54,
      troponinI: 0.02,
      ecgRhythm: 'Normal Sinus Rhythm with sinus tachycardia intervals',
      qtcInterval: 430,
      inotropicSupport: false,
    },
    respiratory: {
      spO2: 92,
      spO2Baseline: 98,
      respiratoryRate: 22,
      rrBaseline: 15,
      paO2FiO2Ratio: 140,
      pfBaseline: 430,
      fiO2: 60,
      peep: 12,
      oxygenSupportMode: 'Mechanical Ventilation',
      lungCompliance: 28,
      workOfBreathing: 'Significantly Increased',
    },
    timeSeries: generateSunitaTimeSeries(),
    deteriorationEvents: [
      {
        id: 'EVT-21',
        timestamp: '2026-11-14T13:40:00Z',
        primaryOrgan: 'respiratory',
        title: 'Intubation for Refractory Hypoxemia',
        description: 'PaO2/FiO2 ratio dropped to 140 under HFNC, leading to invasive mechanical ventilation with ARDSnet protocol.',
        severity: 'critical',
        observedParameters: [
          { name: 'P/F Ratio', value: '140', baseline: '430' },
          { name: 'PEEP', value: '12 cmH2O', baseline: '0 cmH2O' }
        ],
        clinicalSignificance: 'Pancreatitis-induced systemic cytokine release causing acute diffuse alveolar damage.'
      }
    ],
    explainabilityFactors: [
      {
        factor: 'Diffuse Alveolar Epithelial Damage (ARDS)',
        organ: 'respiratory',
        weight: 58,
        trendDirection: 'rising',
        clinicalContext: 'Severe inflammatory alveolitis from acute pancreatitis enzymes and cytokines.'
      },
      {
        factor: 'Third Space Fluid Sequestration & Prerenal Stress',
        organ: 'renal',
        weight: 24,
        trendDirection: 'stable',
        clinicalContext: 'Retroperitoneal fluid accumulation moderating effective circulating intravascular volume.'
      },
      {
        factor: 'Biliary Tract Inflammation & Congestion',
        organ: 'hepatic',
        weight: 12,
        trendDirection: 'falling',
        clinicalContext: 'Resolving gallstone pancreatitis cholestatic pattern.'
      },
      {
        factor: 'Systemic Hyperdynamic Inflammatory Circulation',
        organ: 'cardiac',
        weight: 6,
        trendDirection: 'stable',
        clinicalContext: 'Mild compensatory tachycardia maintaining systemic perfusion.'
      }
    ],
    dataQuality: {
      overallCompleteness: 92.4,
      measurementConsistency: 95.0,
      baselineAvailable: true,
      missingModalityCount: 0,
      flags: ['Ventilator waveforms streamed continuously'],
      lastSync: '2026-11-14T17:50:00Z',
    }
  },
  {
    id: 'PAT-4028',
    mrn: 'MRN-5019284',
    name: 'Arvind Verma',
    age: 73,
    gender: 'Male',
    bed: 'MICU Bed 06-B',
    unit: 'Medical ICU',
    admissionDate: '2026-11-09T22:15:00Z',
    icuDay: 5,
    primaryDiagnosis: 'Severe Community-Acquired Pneumonia with Secondary Renal Decline',
    comorbidities: ['COPD (Gold Stage 2)', 'Peripheral Vascular Disease'],
    allergies: ['Ciprofloxacin'],
    codeStatus: 'Limited Intervention',
    acuityTier: 'Urgent',
    riskScore: 66,
    requiresReview: true,
    multiOrganPatternDetected: false,
    organStatuses: {
      respiratory: {
        status: 'warning',
        trend: 'stable',
        score: 72,
        primaryConcerns: ['HFNC 35L / 40%', 'Persistent right lower lobe consolidation', 'RR 24'],
        lastAssessed: '2026-11-14T17:00:00Z',
      },
      renal: {
        status: 'watch',
        trend: 'deteriorating',
        score: 55,
        primaryConcerns: ['Creatinine 1.5 mg/dL (baseline 1.1)', 'Urine output 0.45 mL/kg/h'],
        lastAssessed: '2026-11-14T16:30:00Z',
      },
      cardiac: {
        status: 'stable',
        trend: 'stable',
        score: 28,
        primaryConcerns: ['Normal sinus rhythm', 'MAP 74 mmHg'],
        lastAssessed: '2026-11-14T17:10:00Z',
      },
      hepatic: {
        status: 'stable',
        trend: 'stable',
        score: 18,
        primaryConcerns: ['Normal baseline transaminases and bilirubin'],
        lastAssessed: '2026-11-14T14:00:00Z',
      },
    },
    renal: {
      creatinine: 1.5,
      creatinineBaseline: 1.1,
      eGFR: 48,
      eGFRBaseline: 70,
      urineOutput: 0.45,
      urineOutputBaseline: 0.85,
      cumulativeFluidBalance24h: 1100,
      bloodUreaNitrogen: 28,
      potassium: 4.4,
      kdigoStage: 'Stage 1',
    },
    hepatic: {
      alt: 28,
      altBaseline: 24,
      ast: 31,
      astBaseline: 26,
      totalBilirubin: 0.8,
      totalBilirubinBaseline: 0.7,
      albumin: 3.4,
      albuminBaseline: 3.9,
      inr: 1.1,
      alkalinePhosphatase: 95,
      pattern: 'Normal',
    },
    cardiac: {
      heartRate: 78,
      heartRateBaseline: 72,
      meanArterialPressure: 74,
      mapBaseline: 78,
      systolicBP: 122,
      diastolicBP: 60,
      troponinI: 0.01,
      ecgRhythm: 'Normal Sinus Rhythm',
      qtcInterval: 422,
      inotropicSupport: false,
    },
    respiratory: {
      spO2: 94,
      spO2Baseline: 96,
      respiratoryRate: 24,
      rrBaseline: 16,
      paO2FiO2Ratio: 260,
      pfBaseline: 390,
      fiO2: 40,
      oxygenSupportMode: 'High Flow Nasal Cannula',
      workOfBreathing: 'Mildly Increased',
    },
    timeSeries: generateSunitaTimeSeries(),
    deteriorationEvents: [],
    explainabilityFactors: [
      {
        factor: 'Bacterial Lobar Consolidation',
        organ: 'respiratory',
        weight: 62,
        trendDirection: 'stable',
        clinicalContext: 'Hypoxemia related to ventilation/perfusion mismatch from dense consolidation.'
      },
      {
        factor: 'Mild Sepsis-Induced Tubular Stress',
        organ: 'renal',
        weight: 38,
        trendDirection: 'rising',
        clinicalContext: 'Mild serum creatinine elevation from antimicrobials and systemic inflammatory state.'
      }
    ],
    dataQuality: {
      overallCompleteness: 89.0,
      measurementConsistency: 92.1,
      baselineAvailable: true,
      missingModalityCount: 1,
      flags: ['Urine output measured intermittently via urimeter'],
      lastSync: '2026-11-14T17:40:00Z',
    }
  },
  {
    id: 'PAT-5512',
    mrn: 'MRN-3392811',
    name: 'Devendra Rao',
    age: 45,
    gender: 'Male',
    bed: 'SDU Bed 14',
    unit: 'Step-Down Unit',
    admissionDate: '2026-11-12T03:45:00Z',
    icuDay: 2,
    primaryDiagnosis: 'Decompensated Alcoholic Cirrhosis with Acute Variceal Bleed (Hemostasis secured)',
    comorbidities: ['Portal Hypertension', 'Ascites', 'Splenomegaly'],
    allergies: ['Morphine'],
    codeStatus: 'Full Code',
    acuityTier: 'Guarded',
    riskScore: 48,
    requiresReview: false,
    multiOrganPatternDetected: true,
    patternDescription: 'End-stage liver disease physiology with risk of secondary Hepatorenal Syndrome (HRS-AKI).',
    organStatuses: {
      hepatic: {
        status: 'critical',
        trend: 'stable',
        score: 82,
        primaryConcerns: ['Total Bilirubin 4.8 mg/dL', 'INR 2.1', 'Albumin 2.4 g/dL', 'MELD-Na Score 26'],
        lastAssessed: '2026-11-14T16:00:00Z',
      },
      renal: {
        status: 'watch',
        trend: 'stable',
        score: 52,
        primaryConcerns: ['Creatinine 1.3 mg/dL (baseline 0.9)', 'Monitoring closely for HRS'],
        lastAssessed: '2026-11-14T16:30:00Z',
      },
      cardiac: {
        status: 'stable',
        trend: 'stable',
        score: 24,
        primaryConcerns: ['Hyperdynamic circulation (HR 82, MAP 68)'],
        lastAssessed: '2026-11-14T17:00:00Z',
      },
      respiratory: {
        status: 'stable',
        trend: 'stable',
        score: 16,
        primaryConcerns: ['Room air, SpO2 97%'],
        lastAssessed: '2026-11-14T17:00:00Z',
      },
    },
    renal: {
      creatinine: 1.3,
      creatinineBaseline: 0.9,
      eGFR: 62,
      eGFRBaseline: 94,
      urineOutput: 0.65,
      urineOutputBaseline: 0.85,
      cumulativeFluidBalance24h: 400,
      bloodUreaNitrogen: 24,
      potassium: 4.1,
      kdigoStage: 'Stage 1',
    },
    hepatic: {
      alt: 110,
      altBaseline: 45,
      ast: 145,
      astBaseline: 52,
      totalBilirubin: 4.8,
      totalBilirubinBaseline: 2.2,
      albumin: 2.4,
      albuminBaseline: 3.0,
      inr: 2.1,
      alkalinePhosphatase: 180,
      pattern: 'Hepatocellular',
    },
    cardiac: {
      heartRate: 82,
      heartRateBaseline: 70,
      meanArterialPressure: 68,
      mapBaseline: 74,
      systolicBP: 104,
      diastolicBP: 50,
      troponinI: 0.01,
      ecgRhythm: 'Normal Sinus Rhythm',
      qtcInterval: 456,
      inotropicSupport: false,
    },
    respiratory: {
      spO2: 97,
      spO2Baseline: 98,
      respiratoryRate: 16,
      rrBaseline: 15,
      paO2FiO2Ratio: 440,
      pfBaseline: 450,
      fiO2: 21,
      oxygenSupportMode: 'Room Air',
      workOfBreathing: 'Normal',
    },
    timeSeries: generateSunitaTimeSeries(),
    deteriorationEvents: [],
    explainabilityFactors: [
      {
        factor: 'Synthetic Hepatic Dysfunction & Hyperbilirubinemia',
        organ: 'hepatic',
        weight: 70,
        trendDirection: 'stable',
        clinicalContext: 'Impaired protein synthesis (INR 2.1, Albumin 2.4) with cholestasis.'
      },
      {
        factor: 'Splanchnic Arterial Vasodilation / HRS Vulnerability',
        organ: 'renal',
        weight: 30,
        trendDirection: 'stable',
        clinicalContext: 'Renal vasoconstriction triggered by severe portal hypertension.'
      }
    ],
    dataQuality: {
      overallCompleteness: 91.5,
      measurementConsistency: 93.4,
      baselineAvailable: true,
      missingModalityCount: 0,
      flags: [],
      lastSync: '2026-11-14T17:30:00Z',
    }
  },
  {
    id: 'PAT-6204',
    mrn: 'MRN-6612091',
    name: 'Lakshmi Iyer',
    age: 79,
    gender: 'Female',
    bed: 'Telemetry Bed 22-A',
    unit: 'Telemetry',
    admissionDate: '2026-11-13T11:20:00Z',
    icuDay: 1,
    primaryDiagnosis: 'Acute Decompensated Heart Failure (HFrEF, EF 25%)',
    comorbidities: ['Heart Failure with Reduced Ejection Fraction', 'CKD Stage 3b', 'Hypertension'],
    allergies: ['ACE Inhibitors (Angioedema)'],
    codeStatus: 'Full Code',
    acuityTier: 'Guarded',
    riskScore: 42,
    requiresReview: false,
    multiOrganPatternDetected: false,
    organStatuses: {
      cardiac: {
        status: 'watch',
        trend: 'improving',
        score: 54,
        primaryConcerns: ['Elevated NT-proBNP 4,200 pg/mL', 'Peripheral edema 2+'],
        lastAssessed: '2026-11-14T16:00:00Z',
      },
      renal: {
        status: 'watch',
        trend: 'stable',
        score: 48,
        primaryConcerns: ['Baseline CKD with Cr 1.8 mg/dL', 'Diuretic therapy ongoing'],
        lastAssessed: '2026-11-14T16:00:00Z',
      },
      respiratory: {
        status: 'stable',
        trend: 'improving',
        score: 32,
        primaryConcerns: ['Nasal Cannula 2L/min', 'SpO2 96%'],
        lastAssessed: '2026-11-14T16:00:00Z',
      },
      hepatic: {
        status: 'stable',
        trend: 'stable',
        score: 20,
        primaryConcerns: ['Mild passive congestion, stable'],
        lastAssessed: '2026-11-14T14:00:00Z',
      },
    },
    renal: {
      creatinine: 1.8,
      creatinineBaseline: 1.7,
      eGFR: 28,
      eGFRBaseline: 30,
      urineOutput: 0.8,
      urineOutputBaseline: 0.75,
      cumulativeFluidBalance24h: -1200,
      bloodUreaNitrogen: 36,
      potassium: 4.2,
      kdigoStage: 'None',
    },
    hepatic: {
      alt: 32,
      altBaseline: 28,
      ast: 35,
      astBaseline: 30,
      totalBilirubin: 1.0,
      totalBilirubinBaseline: 0.9,
      albumin: 3.6,
      albuminBaseline: 3.7,
      inr: 1.1,
      alkalinePhosphatase: 88,
      pattern: 'Normal',
    },
    cardiac: {
      heartRate: 74,
      heartRateBaseline: 72,
      meanArterialPressure: 82,
      mapBaseline: 84,
      systolicBP: 128,
      diastolicBP: 64,
      troponinI: 0.02,
      ecgRhythm: 'Normal Sinus Rhythm with Left Ventricular Hypertrophy',
      qtcInterval: 440,
      inotropicSupport: false,
    },
    respiratory: {
      spO2: 96,
      spO2Baseline: 97,
      respiratoryRate: 18,
      rrBaseline: 16,
      paO2FiO2Ratio: 360,
      pfBaseline: 380,
      fiO2: 28,
      oxygenSupportMode: 'Nasal Cannula',
      workOfBreathing: 'Normal',
    },
    timeSeries: generateSunitaTimeSeries(),
    deteriorationEvents: [],
    explainabilityFactors: [
      {
        factor: 'Volume Overload / Elevated Left Ventricular Filling Pressures',
        organ: 'cardiac',
        weight: 65,
        trendDirection: 'falling',
        clinicalContext: 'Responding favorably to intravenous loop diuretic diuresis (-1200 mL net balance).'
      },
      {
        factor: 'Chronic Baseline Kidney Disease Stability',
        organ: 'renal',
        weight: 35,
        trendDirection: 'stable',
        clinicalContext: 'Stable serum creatinine 1.8 mg/dL during volume extraction.'
      }
    ],
    dataQuality: {
      overallCompleteness: 94.0,
      measurementConsistency: 96.0,
      baselineAvailable: true,
      missingModalityCount: 0,
      flags: [],
      lastSync: '2026-11-14T17:15:00Z',
    }
  },
  {
    id: 'PAT-7811',
    mrn: 'MRN-1928374',
    name: 'Vikramaditya Singh',
    age: 52,
    gender: 'Male',
    bed: 'SDU Bed 11',
    unit: 'Step-Down Unit',
    admissionDate: '2026-11-11T12:00:00Z',
    icuDay: 3,
    primaryDiagnosis: 'Post-op Laparoscopic Right Hemicolectomy (Routine Recovery)',
    comorbidities: ['Controlled Hypertension'],
    allergies: ['No known drug allergies'],
    codeStatus: 'Full Code',
    acuityTier: 'Stable',
    riskScore: 18,
    requiresReview: false,
    multiOrganPatternDetected: false,
    organStatuses: {
      renal: {
        status: 'stable',
        trend: 'stable',
        score: 15,
        primaryConcerns: ['Cr 0.8 mg/dL, excellent urine output'],
        lastAssessed: '2026-11-14T16:00:00Z',
      },
      hepatic: {
        status: 'stable',
        trend: 'stable',
        score: 12,
        primaryConcerns: ['Normal labs across panel'],
        lastAssessed: '2026-11-14T16:00:00Z',
      },
      cardiac: {
        status: 'stable',
        trend: 'stable',
        score: 14,
        primaryConcerns: ['HR 72, MAP 84'],
        lastAssessed: '2026-11-14T16:00:00Z',
      },
      respiratory: {
        status: 'stable',
        trend: 'stable',
        score: 10,
        primaryConcerns: ['Room air, SpO2 99%'],
        lastAssessed: '2026-11-14T16:00:00Z',
      },
    },
    renal: {
      creatinine: 0.8,
      creatinineBaseline: 0.8,
      eGFR: 102,
      eGFRBaseline: 102,
      urineOutput: 1.1,
      urineOutputBaseline: 1.0,
      cumulativeFluidBalance24h: 150,
      bloodUreaNitrogen: 14,
      potassium: 4.0,
      kdigoStage: 'None',
    },
    hepatic: {
      alt: 22,
      altBaseline: 20,
      ast: 24,
      astBaseline: 22,
      totalBilirubin: 0.6,
      totalBilirubinBaseline: 0.5,
      albumin: 4.0,
      albuminBaseline: 4.2,
      inr: 1.0,
      alkalinePhosphatase: 74,
      pattern: 'Normal',
    },
    cardiac: {
      heartRate: 72,
      heartRateBaseline: 70,
      meanArterialPressure: 84,
      mapBaseline: 82,
      systolicBP: 124,
      diastolicBP: 68,
      troponinI: 0.01,
      ecgRhythm: 'Normal Sinus Rhythm',
      qtcInterval: 410,
      inotropicSupport: false,
    },
    respiratory: {
      spO2: 99,
      spO2Baseline: 99,
      respiratoryRate: 15,
      rrBaseline: 14,
      paO2FiO2Ratio: 470,
      pfBaseline: 480,
      fiO2: 21,
      oxygenSupportMode: 'Room Air',
      workOfBreathing: 'Normal',
    },
    timeSeries: generateSunitaTimeSeries(),
    deteriorationEvents: [],
    explainabilityFactors: [
      {
        factor: 'Physiological Post-Surgical Homeostasis',
        organ: 'renal',
        weight: 100,
        trendDirection: 'stable',
        clinicalContext: 'All biomarker indices within physiological limits.'
      }
    ],
    dataQuality: {
      overallCompleteness: 99.0,
      measurementConsistency: 99.2,
      baselineAvailable: true,
      missingModalityCount: 0,
      flags: [],
      lastSync: '2026-11-14T17:00:00Z',
    }
  },
  {
    id: 'PAT-8923',
    mrn: 'MRN-2019481',
    name: 'Ananya Mukherjee',
    age: 39,
    gender: 'Female',
    bed: 'Telemetry Bed 25',
    unit: 'Telemetry',
    admissionDate: '2026-11-13T06:00:00Z',
    icuDay: 2,
    primaryDiagnosis: 'Diabetic Ketoacidosis (Anion Gap Closed, SubQ Transition)',
    comorbidities: ['Type 1 Diabetes Mellitus'],
    allergies: ['No known drug allergies'],
    codeStatus: 'Full Code',
    acuityTier: 'Stable',
    riskScore: 14,
    requiresReview: false,
    multiOrganPatternDetected: false,
    organStatuses: {
      renal: {
        status: 'stable',
        trend: 'improving',
        score: 12,
        primaryConcerns: ['Prerenal azotemia resolved, Cr 0.7 mg/dL'],
        lastAssessed: '2026-11-14T16:00:00Z',
      },
      hepatic: {
        status: 'stable',
        trend: 'stable',
        score: 10,
        primaryConcerns: ['Normal'],
        lastAssessed: '2026-11-14T16:00:00Z',
      },
      cardiac: {
        status: 'stable',
        trend: 'stable',
        score: 12,
        primaryConcerns: ['HR 68, MAP 78'],
        lastAssessed: '2026-11-14T16:00:00Z',
      },
      respiratory: {
        status: 'stable',
        trend: 'stable',
        score: 8,
        primaryConcerns: ['Kussmaul breathing resolved'],
        lastAssessed: '2026-11-14T16:00:00Z',
      },
    },
    renal: {
      creatinine: 0.7,
      creatinineBaseline: 0.7,
      eGFR: 110,
      eGFRBaseline: 110,
      urineOutput: 1.3,
      urineOutputBaseline: 1.1,
      cumulativeFluidBalance24h: 300,
      bloodUreaNitrogen: 12,
      potassium: 4.1,
      kdigoStage: 'None',
    },
    hepatic: {
      alt: 18,
      altBaseline: 18,
      ast: 20,
      astBaseline: 20,
      totalBilirubin: 0.5,
      totalBilirubinBaseline: 0.5,
      albumin: 4.2,
      albuminBaseline: 4.2,
      inr: 1.0,
      alkalinePhosphatase: 68,
      pattern: 'Normal',
    },
    cardiac: {
      heartRate: 68,
      heartRateBaseline: 70,
      meanArterialPressure: 78,
      mapBaseline: 76,
      systolicBP: 118,
      diastolicBP: 62,
      troponinI: 0.01,
      ecgRhythm: 'Normal Sinus Rhythm',
      qtcInterval: 418,
      inotropicSupport: false,
    },
    respiratory: {
      spO2: 98,
      spO2Baseline: 98,
      respiratoryRate: 14,
      rrBaseline: 14,
      paO2FiO2Ratio: 460,
      pfBaseline: 460,
      fiO2: 21,
      oxygenSupportMode: 'Room Air',
      workOfBreathing: 'Normal',
    },
    timeSeries: generateSunitaTimeSeries(),
    deteriorationEvents: [],
    explainabilityFactors: [],
    dataQuality: {
      overallCompleteness: 98.4,
      measurementConsistency: 99.0,
      baselineAvailable: true,
      missingModalityCount: 0,
      flags: [],
      lastSync: '2026-11-14T17:00:00Z',
    }
  }
];

export const MOCK_ALERTS: ClinicalAlert[] = [
  {
    id: 'ALT-101',
    patientId: 'PAT-1082',
    patientName: 'Sunita Sharma',
    patientBed: 'MICU Bed 04-A',
    priority: 'Critical',
    organSystems: ['renal', 'cardiac'],
    title: 'KDIGO Stage 3 AKI with Refractory Hypotension',
    message: 'Serum creatinine has increased to 2.8 mg/dL (+211% vs baseline) alongside oliguria < 0.22 mL/kg/h and escalating vasopressor requirement (Norepinephrine 0.12 mcg/kg/min).',
    timestamp: '2026-11-14T17:45:00Z',
    evidence: [
      { indicator: 'Serum Creatinine', value: '2.8 mg/dL', threshold: '> 2.0 mg/dL', baseline: '0.9 mg/dL' },
      { indicator: 'Urine Output (4h avg)', value: '0.22 mL/kg/h', threshold: '< 0.5 mL/kg/h', baseline: '0.95 mL/kg/h' },
      { indicator: 'Mean Arterial Pressure', value: '60 mmHg', threshold: '< 65 mmHg', baseline: '82 mmHg' }
    ],
    dataReliability: 'High',
    acknowledged: false,
    recommendedAction: 'Immediate Nephrology bedside evaluation for Continuous Renal Replacement Therapy (CRRT); re-evaluate volume status via POCUS.'
  },
  {
    id: 'ALT-102',
    patientId: 'PAT-2041',
    patientName: 'Rajesh Patel',
    patientBed: 'CICU Bed 02-B',
    priority: 'Critical',
    organSystems: ['cardiac', 'hepatic'],
    title: 'Acute Transaminitis Spike in Cardiogenic Shock',
    message: 'Rapid rise of ALT to 320 U/L and AST to 410 U/L indicates acute congestive hepatopathy secondary to severe right ventricular failure.',
    timestamp: '2026-11-14T16:45:00Z',
    evidence: [
      { indicator: 'ALT', value: '320 U/L', threshold: '> 100 U/L', baseline: '35 U/L' },
      { indicator: 'AST', value: '410 U/L', threshold: '> 100 U/L', baseline: '38 U/L' },
      { indicator: 'Cardiac Index', value: '1.8 L/min/m2', threshold: '< 2.2 L/min/m2', baseline: '2.8 L/min/m2' }
    ],
    dataReliability: 'High',
    acknowledged: false,
    recommendedAction: 'Assess CVP and RV strain; optimize inotropic support and consider mechanical circulatory support escalation.'
  },
  {
    id: 'ALT-103',
    patientId: 'PAT-3190',
    patientName: 'Priya Nair',
    patientBed: 'SICU Bed 08',
    priority: 'High',
    organSystems: ['respiratory'],
    title: 'Severe Oxygenation Impairment (P/F Ratio 140)',
    message: 'PaO2/FiO2 ratio has fallen to 140 under invasive ventilation. Driving pressure is 15 cmH2O with compliance of 28 mL/cmH2O.',
    timestamp: '2026-11-14T15:10:00Z',
    evidence: [
      { indicator: 'P/F Ratio', value: '140', threshold: '< 200 (Moderate ARDS)', baseline: '430' },
      { indicator: 'PEEP', value: '12 cmH2O', threshold: '> 10 cmH2O', baseline: '0 cmH2O' }
    ],
    dataReliability: 'High',
    acknowledged: true,
    acknowledgedBy: 'Dr. Aditi Mukherjee, MD (Critical Care)',
    acknowledgedAt: '2026-11-14T15:25:00Z',
    reviewNotes: 'Patient placed on lung-protective ventilation protocol with neuromuscular blockade trial.',
    recommendedAction: 'Maintain tidal volume 6 mL/kg PBW; evaluate for prone positioning if P/F remains < 150.'
  },
  {
    id: 'ALT-104',
    patientId: 'PAT-4028',
    patientName: 'Arvind Verma',
    patientBed: 'MICU Bed 06-B',
    priority: 'Moderate',
    organSystems: ['renal'],
    title: 'Incipient Oliguria & Rising BUN/Creatinine',
    message: 'Creatinine reached 1.5 mg/dL (+36% from baseline) with urine output averaging 0.45 mL/kg/h over the past 6 hours.',
    timestamp: '2026-11-14T14:30:00Z',
    evidence: [
      { indicator: 'Creatinine', value: '1.5 mg/dL', threshold: '> 1.4 mg/dL', baseline: '1.1 mg/dL' },
      { indicator: 'Urine Output', value: '0.45 mL/kg/h', threshold: '< 0.5 mL/kg/h', baseline: '0.85 mL/kg/h' }
    ],
    dataReliability: 'Moderate',
    acknowledged: false,
    recommendedAction: 'Review nephrotoxic medications; check urine electrolytes and ensure accurate hourly urine catheter output recording.'
  },
  {
    id: 'ALT-105',
    patientId: 'PAT-1082',
    patientName: 'Sunita Sharma',
    patientBed: 'MICU Bed 04-A',
    priority: 'High',
    organSystems: ['respiratory', 'renal'],
    title: 'Severe Positive Fluid Balance & Respiratory Worsening',
    message: 'Cumulative 24-hour fluid balance is +3,820 mL. Worsening alveolar-arterial gradient and requirement for HFNC 55% FiO2.',
    timestamp: '2026-11-14T13:20:00Z',
    evidence: [
      { indicator: '24h Fluid Balance', value: '+3,820 mL', threshold: '> +2,000 mL', baseline: '+250 mL' },
      { indicator: 'SpO2', value: '91%', threshold: '< 92%', baseline: '98%' }
    ],
    dataReliability: 'High',
    acknowledged: false,
    recommendedAction: 'Restrict maintenance crystalloids; transition to concentrated vasopressor infusions; prepare for fluid removal if CRRT initiated.'
  }
];

export const MOCK_DATA_TRUST_AUDIT: DataQualityAudit = {
  patientId: 'PAT-1082',
  overallTrustScore: 94.2,
  completenessScore: 95.8,
  consistencyScore: 96.5,
  baselineIntegrityScore: 98.0,
  totalMissingExpectedPoints: 3,
  activeQualityFlags: [
    {
      id: 'DQ-01',
      level: 'warning',
      title: 'Arterial Blood Gas Latency Exceeds 4 Hours',
      description: 'Last arterial blood gas was drawn 4.5 hours ago. Critical in evaluating acid-base balance and lactate clearance in shock.',
      affectedModalities: ['Blood Gases (ABG)'],
      suggestedVerification: 'Order STAT point-of-care repeat ABG with co-oximetry.'
    },
    {
      id: 'DQ-02',
      level: 'info',
      title: 'Arterial Line Calibration Interval',
      description: 'Zero and square-wave flush test last documented 6 hours ago. Waveform damping should be inspected.',
      affectedModalities: ['Invasive Hemodynamics'],
      suggestedVerification: 'Verify arterial catheter transducer leveling to phlebostatic axis.'
    }
  ],
  modalities: [
    {
      name: 'Continuous Hemodynamics (Art Line / Telemetry)',
      sourceSystem: 'Philips IntelliVue MX800',
      samplingFrequency: 'Continuous (1 Hz)',
      completenessRate: 99.4,
      latencySeconds: 2,
      lastTransmission: 'Just now',
      irregularSamplingDetected: false,
      artifactsCount24h: 12,
      status: 'Optimal'
    },
    {
      name: 'Ventilator & Oxygenation Telemetry',
      sourceSystem: 'Hamilton C6 / Airvo 2',
      samplingFrequency: 'Continuous (0.1 Hz)',
      completenessRate: 98.1,
      latencySeconds: 5,
      lastTransmission: 'Just now',
      irregularSamplingDetected: false,
      artifactsCount24h: 3,
      status: 'Optimal'
    },
    {
      name: 'Automated Urimeter & Fluid Balance',
      sourceSystem: 'CritiCore Digital Urimeter',
      samplingFrequency: 'Hourly (q1h)',
      completenessRate: 96.0,
      latencySeconds: 45,
      lastTransmission: '12 min ago',
      irregularSamplingDetected: false,
      artifactsCount24h: 0,
      status: 'Optimal'
    },
    {
      name: 'Stat Core Laboratory (Chemistry / CBC)',
      sourceSystem: 'Hospital LIS Interface',
      samplingFrequency: 'Every 6-12 hours',
      completenessRate: 92.5,
      latencySeconds: 180,
      lastTransmission: '1.2 hr ago',
      irregularSamplingDetected: true,
      artifactsCount24h: 0,
      status: 'Delayed'
    },
    {
      name: 'Point-of-Care Blood Gases (ABG / VBG)',
      sourceSystem: 'Radiometer ABL90 FLEX',
      samplingFrequency: 'Every 4 hours (protocolized)',
      completenessRate: 85.0,
      latencySeconds: 120,
      lastTransmission: '4.5 hr ago',
      irregularSamplingDetected: true,
      artifactsCount24h: 1,
      status: 'Delayed'
    }
  ],
  missingMeasurements: [
    {
      testOrVital: 'Arterial Blood Gas (PaO2, PaCO2, Lactate)',
      category: 'Blood Gases',
      lastRecordedAt: '2026-11-14T13:20:00Z',
      hoursSinceLastMeasurement: 4.5,
      expectedFrequencyHours: 4.0,
      clinicalImpactTier: 'High',
      patientId: 'PAT-1082',
      patientName: 'Sunita Sharma'
    },
    {
      testOrVital: 'Serum Ionized Calcium',
      category: 'Renal Panel',
      lastRecordedAt: '2026-11-14T06:00:00Z',
      hoursSinceLastMeasurement: 12.0,
      expectedFrequencyHours: 12.0,
      clinicalImpactTier: 'Medium',
      patientId: 'PAT-1082',
      patientName: 'Sunita Sharma'
    },
    {
      testOrVital: 'Central Venous Oxygen Saturation (ScvO2)',
      category: 'Hemodynamics',
      lastRecordedAt: '2026-11-14T02:00:00Z',
      hoursSinceLastMeasurement: 16.0,
      expectedFrequencyHours: 8.0,
      clinicalImpactTier: 'Medium',
      patientId: 'PAT-1082',
      patientName: 'Sunita Sharma'
    }
  ],
  timeline24h: Array.from({ length: 24 }).map((_, idx) => {
    const hour = `${(24 - idx).toString().padStart(2, '0')}:00`;
    return {
      hour,
      vitalsRecorded: 60,
      labsRecorded: idx % 6 === 0 ? 14 : 0,
      gapsDetected: idx === 18,
    };
  }).reverse()
};

// Cascade Graph Elements for Sunita Sharma (PAT-1082)
export const MOCK_CASCADE_DATA: {
  nodes: { id: string; type: string; position: { x: number; y: number }; data: CascadeNodeData }[];
  edges: { id: string; source: string; target: string; data: CascadeEdgeData; animated?: boolean }[];
  timelineSteps: CascadeTimelineStep[];
} = {
  nodes: [
    {
      id: 'node-cardiac-shock',
      type: 'clinicalNode',
      position: { x: 50, y: 150 },
      data: {
        label: 'Septic Vasodilation & Hypoperfusion',
        sublabel: 'Cardiac & Hemodynamic Instability',
        category: 'cardiac',
        status: 'critical',
        timestamp: 'Hour 0 (08:30)',
        relativeTime: 'Hour 0',
        primaryMetric: {
          name: 'MAP',
          value: '58 mmHg',
          deltaVsBaseline: '-29%'
        },
        observedEvidence: [
          'Systemic vascular resistance markedly reduced',
          'Norepinephrine infusion initiated at 0.08 mcg/kg/min',
          'Tachycardia (HR 118 bpm) compensatory for distributive drop'
        ],
        reviewedPathophysiology: 'Pro-inflammatory cytokines trigger nitric oxide synthase overexpression leading to profound arteriolar dilation and diminished effective circulating arterial volume.',
        isTriggerNode: true
      }
    },
    {
      id: 'node-renal-atn',
      type: 'clinicalNode',
      position: { x: 380, y: 70 },
      data: {
        label: 'Renal Hypoperfusion & AKI',
        sublabel: 'KDIGO Stage 3 Acute Kidney Injury',
        category: 'renal',
        status: 'critical',
        timestamp: 'Hour +8 (16:30)',
        relativeTime: 'Hour +8',
        primaryMetric: {
          name: 'Creatinine',
          value: '2.8 mg/dL',
          deltaVsBaseline: '+211%'
        },
        observedEvidence: [
          'Urine output dropped to 0.22 mL/kg/h',
          'Serum Creatinine jumped from 0.9 to 2.8 mg/dL',
          'Fractional excretion of sodium (FeNa) > 2% indicating intrinsic tubular injury'
        ],
        reviewedPathophysiology: 'Loss of renal autoregulation below MAP 65 mmHg coupled with microvascular thrombosis and direct endotoxin tubular toxicity.',
      }
    },
    {
      id: 'node-fluid-overload',
      type: 'clinicalNode',
      position: { x: 380, y: 260 },
      data: {
        label: 'Positive Fluid Balance & Capillary Leak',
        sublabel: 'Fluid Overload State (+3,820 mL)',
        category: 'fluid',
        status: 'warning',
        timestamp: 'Hour +14 (22:30)',
        relativeTime: 'Hour +14',
        primaryMetric: {
          name: 'Net Balance',
          value: '+3,820 mL',
          deltaVsBaseline: '+1420%'
        },
        observedEvidence: [
          'Crystalloid resuscitation attempts to restore MAP',
          'Concomitant anuria preventing physiological volume excretion',
          'Diffuse peripheral edema and increased tissue turgor'
        ],
        reviewedPathophysiology: 'Glycocalyx shedding in septic shock permits high extravasation of crystalloids into interstitium when renal clearance is abolished.',
      }
    },
    {
      id: 'node-respiratory-edema',
      type: 'clinicalNode',
      position: { x: 740, y: 150 },
      data: {
        label: 'Hypoxemic Ventilation Mismatch',
        sublabel: 'Secondary Non-Cardiogenic Pulmonary Edema',
        category: 'respiratory',
        status: 'warning',
        timestamp: 'Hour +24 (08:30 D2)',
        relativeTime: 'Hour +24',
        primaryMetric: {
          name: 'P/F Ratio',
          value: '195',
          deltaVsBaseline: '-53%'
        },
        observedEvidence: [
          'Bilateral dependent lung crackles',
          'Escalated to HFNC 45L / 55% to maintain SpO2 > 90%',
          'PXR demonstrates alveolar interstitial haziness'
        ],
        reviewedPathophysiology: 'High hydrostatic capillary pressures from positive fluid balance combined with endothelial permeability precipitate alveolar flooding.',
      }
    },
    {
      id: 'node-hepatic-ischemia',
      type: 'clinicalNode',
      position: { x: 740, y: 320 },
      data: {
        label: 'Splanchnic Hypoperfusion & Hepatopathy',
        sublabel: 'Secondary Hepatic Stress',
        category: 'hepatic',
        status: 'watch',
        timestamp: 'Hour +32 (16:30 D2)',
        relativeTime: 'Hour +32',
        primaryMetric: {
          name: 'ALT / AST',
          value: '84 / 96 U/L',
          deltaVsBaseline: '+281%'
        },
        observedEvidence: [
          'Mild hepatocellular enzyme elevation',
          'Bilirubin mildly rising to 1.8 mg/dL',
          'Albumin consumption down to 2.8 g/dL'
        ],
        reviewedPathophysiology: 'Hypoperfusion of hepatic sinusoids compounded by high central venous back-pressure from volume overload.',
      }
    }
  ],
  edges: [
    {
      id: 'edge-cardiac-renal',
      source: 'node-cardiac-shock',
      target: 'node-renal-atn',
      animated: true,
      data: {
        relationshipType: 'clinically_reviewed_pathophysiology',
        temporalLag: '+8h observed lag',
        correlationScore: 0.92,
        directionDescription: 'Systemic hypotension impairs preglomerular perfusion pressure leading to acute ischemic tubular necrosis.',
        evidenceSummary: 'Temporal precedence: MAP drop below 60 mmHg preceded steep urine output decrease by 7.5 hours.',
        pathophysiologicalMechanism: 'Renal medullary hypoxia exacerbated by efferent vasodilation and loss of myogenic auto-regulation.',
        isClinicallyReviewed: true,
      }
    },
    {
      id: 'edge-cardiac-fluid',
      source: 'node-cardiac-shock',
      target: 'node-fluid-overload',
      animated: true,
      data: {
        relationshipType: 'observed_association',
        temporalLag: '+14h observed lag',
        correlationScore: 0.85,
        directionDescription: 'Aggressive fluid loading instituted for hypotension in the setting of diminishing urinary output.',
        evidenceSummary: 'Correlation r=0.88 between cumulative fluid input and progressive worsening of base deficit.',
        pathophysiologicalMechanism: 'Iatrogenic crystalloid expansion in anuric shock state without functional clearance.',
        isClinicallyReviewed: false,
      }
    },
    {
      id: 'edge-fluid-respiratory',
      source: 'node-fluid-overload',
      target: 'node-respiratory-edema',
      animated: true,
      data: {
        relationshipType: 'clinically_reviewed_pathophysiology',
        temporalLag: '+10h observed lag',
        correlationScore: 0.89,
        directionDescription: 'Excessive intravascular hydrostatic pressure drives fluid across injured alveolar membranes.',
        evidenceSummary: 'Stepwise increase in oxygen requirement correlated with fluid retention > 2.5L.',
        pathophysiologicalMechanism: 'Starling equilibrium shift favoring interstitial and alveolar transudation in inflamed pulmonary microvasculature.',
        isClinicallyReviewed: true,
      }
    },
    {
      id: 'edge-renal-fluid',
      source: 'node-renal-atn',
      target: 'node-fluid-overload',
      animated: true,
      data: {
        relationshipType: 'clinically_reviewed_pathophysiology',
        temporalLag: '+6h observed lag',
        correlationScore: 0.94,
        directionDescription: 'Severe oliguria (<0.25 mL/kg/h) blocks fluid excretion leading directly to rapid positive fluid accumulation.',
        evidenceSummary: 'Zero diuresis despite 100mg IV furosemide challenge.',
        pathophysiologicalMechanism: 'Loss of functional nephron filtration surface area and tubular obstruction.',
        isClinicallyReviewed: true,
      }
    },
    {
      id: 'edge-fluid-hepatic',
      source: 'node-fluid-overload',
      target: 'node-hepatic-ischemia',
      animated: false,
      data: {
        relationshipType: 'observed_association',
        temporalLag: '+18h observed lag',
        correlationScore: 0.74,
        directionDescription: 'Elevated central venous pressure creates retrograde congestion across hepatic veins.',
        evidenceSummary: 'Mild transaminitis coincided with maximal 24h positive balance.',
        pathophysiologicalMechanism: 'Passive congestion reducing hepatic sinusoidal blood flow velocity.',
        isClinicallyReviewed: false,
      }
    }
  ],
  timelineSteps: [
    {
      step: 1,
      label: 'Hour 0: Shock Onset',
      timestamp: '2026-11-12T08:30:00Z',
      description: 'Patient presented with septic distributive hypotension (MAP 58). Vasopressor therapy initiated.',
      activeNodeIds: ['node-cardiac-shock'],
      activeEdgeIds: []
    },
    {
      step: 2,
      label: 'Hour +8: Renal Decompensation',
      timestamp: '2026-11-12T16:30:00Z',
      description: 'Renal perfusion failure manifested as abrupt oliguria and doubling of baseline serum creatinine.',
      activeNodeIds: ['node-cardiac-shock', 'node-renal-atn'],
      activeEdgeIds: ['edge-cardiac-renal']
    },
    {
      step: 3,
      label: 'Hour +14: Volume Sequestration',
      timestamp: '2026-11-12T22:30:00Z',
      description: 'Persistent fluid loading in the absence of diuresis led to severe positive balance (+3,820 mL).',
      activeNodeIds: ['node-cardiac-shock', 'node-renal-atn', 'node-fluid-overload'],
      activeEdgeIds: ['edge-cardiac-renal', 'edge-cardiac-fluid', 'edge-renal-fluid']
    },
    {
      step: 4,
      label: 'Hour +24: Pulmonary Interstitial Leak',
      timestamp: '2026-11-13T08:30:00Z',
      description: 'Hydrostatic fluid overload and capillary leak precipitated hypoxemia, dropping P/F ratio to 195.',
      activeNodeIds: ['node-cardiac-shock', 'node-renal-atn', 'node-fluid-overload', 'node-respiratory-edema'],
      activeEdgeIds: ['edge-cardiac-renal', 'edge-cardiac-fluid', 'edge-renal-fluid', 'edge-fluid-respiratory']
    },
    {
      step: 5,
      label: 'Hour +32: Splanchnic Congestion',
      timestamp: '2026-11-13T16:30:00Z',
      description: 'Retrograde venous congestion resulted in secondary hepatic enzyme elevation.',
      activeNodeIds: ['node-cardiac-shock', 'node-renal-atn', 'node-fluid-overload', 'node-respiratory-edema', 'node-hepatic-ischemia'],
      activeEdgeIds: ['edge-cardiac-renal', 'edge-cardiac-fluid', 'edge-renal-fluid', 'edge-fluid-respiratory', 'edge-fluid-hepatic']
    }
  ]
};

// FutureCast synthetic prediction generation for Sunita Sharma
export function generateMockFutureCast(patientId: string, horizon: '6h' | '12h' | '24h' | '48h'): FutureCastPrediction {
  const points = [];
  const hoursCount = horizon === '6h' ? 6 : horizon === '12h' ? 12 : horizon === '24h' ? 24 : 48;
  const now = new Date('2026-11-14T18:00:00Z');

  // Past 12 hours historical
  for (let h = -12; h <= 0; h++) {
    const t = new Date(now.getTime() + h * 3600 * 1000).toISOString();
    const actual = Math.min(88, Math.round(62 + ((h + 12) / 12) * 26 + (Math.sin(h) * 1.5)));
    points.push({
      timestamp: t,
      hourOffset: h,
      isHistorical: true,
      actualRiskScore: actual,
      projectedMedian: actual,
      worseningScenario: actual,
      stableScenario: actual,
      uncertaintyUpper: actual,
      uncertaintyLower: actual,
      projectedRenal: 88,
      projectedHepatic: 48,
      projectedCardiac: 74,
      projectedRespiratory: 72,
    });
  }

  // Future projections
  for (let h = 1; h <= hoursCount; h++) {
    const t = new Date(now.getTime() + h * 3600 * 1000).toISOString();
    const progress = h / hoursCount;

    // Median trajectory assuming standard ICU care without CRRT
    const projectedMedian = Math.min(96, Math.round(88 + progress * 7));
    // Worsening trajectory (vasodilatory collapse, refractory anuria)
    const worseningScenario = Math.min(99, Math.round(88 + progress * 11));
    // Stable trajectory (early CRRT initiation and targeted decongestion)
    const stableScenario = Math.max(50, Math.round(88 - progress * 24));

    // Uncertainty band widens over time (conformal quantile bounds)
    const bandWidth = 4 + progress * 14;
    const uncertaintyUpper = Math.min(100, Math.round(projectedMedian + bandWidth));
    const uncertaintyLower = Math.max(0, Math.round(projectedMedian - bandWidth));

    const projectedRenal = Math.min(98, Math.round(88 + progress * 6));
    const projectedCardiac = Math.min(92, Math.round(74 + progress * 8));
    const projectedRespiratory = Math.min(90, Math.round(72 + progress * 7));
    const projectedHepatic = Math.min(65, Math.round(48 + progress * 5));

    points.push({
      timestamp: t,
      hourOffset: h,
      isHistorical: false,
      projectedMedian,
      worseningScenario,
      stableScenario,
      uncertaintyUpper,
      uncertaintyLower,
      projectedRenal,
      projectedHepatic,
      projectedCardiac,
      projectedRespiratory,
    });
  }

  return {
    patientId,
    horizon,
    generatedAt: '2026-11-14T17:58:00Z',
    trajectory: points,
    decompensationProbability: 84.5,
    baselineRiskScore: 88,
    projectedRiskScoreMedian: points[points.length - 1].projectedMedian,
    primaryRiskDrivers: [
      {
        organ: 'renal',
        factor: 'Progression from Stage 3 AKI to anuric failure',
        impact: 'high',
        confidenceInterval: '78% - 91%'
      },
      {
        organ: 'cardiac',
        factor: 'Persistent vasopressor dependency with risk of tachyarrhythmia',
        impact: 'high',
        confidenceInterval: '65% - 82%'
      },
      {
        organ: 'respiratory',
        factor: 'Worsening alveolar transudation requiring invasive mechanical ventilation',
        impact: 'moderate',
        confidenceInterval: '54% - 73%'
      }
    ],
    conformalUncertaintyPercent: 12.8,
    modelLimitations: [
      'Model trajectory calibrated on observational clinical parameters; not yet validated in prospective multi-center randomized trials.',
      'Projections do not factor unobserved emergent surgical procedures or unexpected blood product transfusions.',
      'Predictions assume continued norepinephrine titration within +/- 0.05 mcg/kg/min range.'
    ],
    clinicalEvidencePoints: [
      'KDIGO clinical criteria for refractory Stage 3 AKI fulfilled.',
      'Sepsis-3 consensus definitions for septic shock with multi-organ hyper-lactatemia.',
      'Berlin definition criteria approaching severe ARDS if P/F deteriorates below 150.'
    ]
  };
}
