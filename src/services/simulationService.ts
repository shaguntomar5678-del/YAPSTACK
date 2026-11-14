import { WhatIfParameters, WhatIfSimulationOutcome, SimulationResultPoint } from '../types/whatif';
import { patientService } from './patientService';

export const simulationService = {
  async runSimulation(patientId: string, params: WhatIfParameters): Promise<WhatIfSimulationOutcome> {
    await new Promise((resolve) => setTimeout(resolve, 120));

    const patient = await patientService.getPatientById(patientId);
    const baseRisk = patient ? patient.riskScore : 75;
    const baseRenal = patient ? patient.organStatuses.renal.score : 80;
    const baseCardiac = patient ? patient.organStatuses.cardiac.score : 70;
    const baseResp = patient ? patient.organStatuses.respiratory.score : 65;

    // Fluid impact equation (deterministic):
    // Positive balance beyond +1500mL worsens respiratory transudation and renal congestion
    // Negative balance (diuresis) reduces respiratory congestion up to an optimal point (-1500mL),
    // but excessive dehydration (> -2000mL) degrades renal perfusion.
    const fluidNetLiters = params.fluidBalanceDeltaMl / 1000;
    const fluidRespImpact = fluidNetLiters > 0 ? fluidNetLiters * 3.2 : fluidNetLiters * 2.8;
    const fluidRenalImpact = fluidNetLiters > 1.5 ? (fluidNetLiters - 1.5) * 2.4 : (fluidNetLiters < -1.5 ? Math.abs(fluidNetLiters + 1.5) * 3.1 : -1.2);

    // Missing labs penalty: increases uncertainty band width and adds conservative risk bias
    const missingPenalty = params.simulateMissingLabs ? 6.5 : 0;
    const uncertaintySpread = params.simulateMissingLabs ? 18.0 : 7.0;

    const simulatedPoints: SimulationResultPoint[] = [];
    const now = new Date('2026-11-14T18:00:00Z');

    // Simulate 24-hour forward trajectory in 2-hour increments
    for (let h = 0; h <= 24; h += 2) {
      const timestamp = new Date(now.getTime() + h * 3600 * 1000).toISOString();
      const progress = h / 24; // 0 to 1

      // Baseline trajectory progression
      const baselineComposite = Math.min(100, Math.max(10, Math.round(baseRisk + progress * 8)));
      const baselineRenal = Math.min(100, Math.max(10, Math.round(baseRenal + progress * 6)));
      const baselineCardiac = Math.min(100, Math.max(10, Math.round(baseCardiac + progress * 5)));
      const baselineResp = Math.min(100, Math.max(10, Math.round(baseResp + progress * 7)));

      // Counterfactual modifications:
      // Modifiers: renalIntensity (-50 to +100), cardiacIntensity (-50 to +100), respiratoryIntensity (-50 to +100)
      const renalMod = (params.renalIntensity / 100) * 18 * progress + (fluidRenalImpact * progress);
      const cardiacMod = (params.cardiacIntensity / 100) * 16 * progress;
      const respMod = (params.respiratoryIntensity / 100) * 18 * progress + (fluidRespImpact * progress);

      const hypotheticalRenal = Math.min(100, Math.max(5, Math.round(baselineRenal + renalMod)));
      const hypotheticalCardiac = Math.min(100, Math.max(5, Math.round(baselineCardiac + cardiacMod)));
      const hypotheticalResp = Math.min(100, Math.max(5, Math.round(baselineResp + respMod)));

      // Multi-organ cross coupling:
      // If cardiac and renal worsen together, add non-linear cross-organ penalty
      const crossPenalty = (renalMod > 0 && cardiacMod > 0) ? (renalMod * 0.15 + cardiacMod * 0.15) : 0;

      const deltaTotal = (renalMod * 0.35 + cardiacMod * 0.30 + respMod * 0.25 + crossPenalty + missingPenalty);
      const hypotheticalComposite = Math.min(100, Math.max(5, Math.round(baselineComposite + deltaTotal)));

      simulatedPoints.push({
        hourOffset: h,
        timestamp,
        baselineCompositeScore: baselineComposite,
        hypotheticalCompositeScore: hypotheticalComposite,
        baselineRenalScore: baselineRenal,
        hypotheticalRenalScore: hypotheticalRenal,
        baselineCardiacScore: baselineCardiac,
        hypotheticalCardiacScore: hypotheticalCardiac,
        baselineRespiratoryScore: baselineResp,
        hypotheticalRespiratoryScore: hypotheticalResp,
        uncertaintyBandWidth: Math.round(uncertaintySpread * (0.6 + progress * 0.8)),
      });
    }

    const endPoint = simulatedPoints[simulatedPoints.length - 1];
    const deltaDecomp = endPoint.hypotheticalCompositeScore - endPoint.baselineCompositeScore;

    let hypotheticalRiskTier: 'Critical' | 'Urgent' | 'Guarded' | 'Stable' = 'Critical';
    if (endPoint.hypotheticalCompositeScore < 30) hypotheticalRiskTier = 'Stable';
    else if (endPoint.hypotheticalCompositeScore < 60) hypotheticalRiskTier = 'Guarded';
    else if (endPoint.hypotheticalCompositeScore < 80) hypotheticalRiskTier = 'Urgent';

    const organImpacts = [
      {
        organ: 'renal' as const,
        deltaScore: endPoint.hypotheticalRenalScore - endPoint.baselineRenalScore,
        explanation: params.renalIntensity < 0
          ? 'Hypothetical nephroprotective response or reduced toxic insult decreases predicted tubular stress.'
          : 'Elevated renal stress index triggers exacerbated microvascular ischemia.',
        direction: (endPoint.hypotheticalRenalScore < endPoint.baselineRenalScore ? 'improved' : endPoint.hypotheticalRenalScore > endPoint.baselineRenalScore ? 'worsened' : 'neutral') as any
      },
      {
        organ: 'cardiac' as const,
        deltaScore: endPoint.hypotheticalCardiacScore - endPoint.baselineCardiacScore,
        explanation: params.cardiacIntensity < 0
          ? 'Improved hemodynamic stability alleviates myocardial oxygen demand.'
          : 'Elevated cardiac intensity simulates worsening inotropic dependency or rhythm disruption.',
        direction: (endPoint.hypotheticalCardiacScore < endPoint.baselineCardiacScore ? 'improved' : endPoint.hypotheticalCardiacScore > endPoint.baselineCardiacScore ? 'worsened' : 'neutral') as any
      },
      {
        organ: 'respiratory' as const,
        deltaScore: endPoint.hypotheticalRespiratoryScore - endPoint.baselineRespiratoryScore,
        explanation: params.fluidBalanceDeltaMl < 0
          ? 'Net negative fluid extraction reduces alveolar-capillary transudation and lung stiffness.'
          : 'Fluid retention expands interstitial volume, worsening ventilation-perfusion mismatch.',
        direction: (endPoint.hypotheticalRespiratoryScore < endPoint.baselineRespiratoryScore ? 'improved' : endPoint.hypotheticalRespiratoryScore > endPoint.baselineRespiratoryScore ? 'worsened' : 'neutral') as any
      }
    ];

    let physiologicalRationale = 'Deterministic simulation evaluates cross-organ couplings between circulating volume, capillary permeability, and perfusion pressures.';
    if (params.fluidBalanceDeltaMl < -1000 && params.renalIntensity <= 0) {
      physiologicalRationale = 'Targeted fluid removal coupled with stable renal perfusion shifts the trajectory into a decongested, lower-risk domain without provoking hypovolemic prerenal azotemia.';
    } else if (params.fluidBalanceDeltaMl > 1500) {
      physiologicalRationale = 'Excessive volume loading produces hydrostatic pulmonary congestion that outpaces compromised urinary excretion, escalating decompensation risk.';
    }

    return {
      patientId,
      parameters: params,
      simulatedPoints,
      deltaDecompensationRisk: deltaDecomp,
      hypotheticalRiskTier,
      organImpacts,
      physiologicalRationale,
      confidenceRating: params.simulateMissingLabs ? 'Degraded (Missing Data)' : 'High',
    };
  },
};
