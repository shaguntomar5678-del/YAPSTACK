import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Area,
  ComposedChart,
  Line,
} from 'recharts';
import {
  FlaskConical,
  Sliders,
  RotateCcw,
  Sparkles,
  Droplets,
  Heart,
  Wind,
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { simulationService } from '../../../services/simulationService';
import { WhatIfParameters, WhatIfSimulationOutcome } from '../../../types/whatif';
import { Badge } from '../../common/Badge';
import { cn } from '../../../utils/cn';

export const WhatIfLab: React.FC = () => {
  const { selectedPatient, patients, setSelectedPatientId, language, t } = useApp();

  const [parameters, setParameters] = useState<WhatIfParameters>({
    renalIntensity: 0,
    cardiacIntensity: 0,
    respiratoryIntensity: 0,
    fluidBalanceDeltaMl: 0,
    simulateMissingLabs: false,
  });

  const [outcome, setOutcome] = useState<WhatIfSimulationOutcome | null>(null);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  useEffect(() => {
    if (selectedPatient) {
      setIsSimulating(true);
      simulationService.runSimulation(selectedPatient.id, parameters).then((res) => {
        setOutcome(res);
        setIsSimulating(false);
      });
    }
  }, [selectedPatient, parameters]);

  const applyPreset = (preset: 'diuresis' | 'fluid_bolus' | 'pressor' | 'ventilation' | 'reset') => {
    switch (preset) {
      case 'diuresis':
        setParameters({
          renalIntensity: -20,
          cardiacIntensity: -10,
          respiratoryIntensity: -35,
          fluidBalanceDeltaMl: -1500,
          simulateMissingLabs: false,
        });
        break;
      case 'fluid_bolus':
        setParameters({
          renalIntensity: 15,
          cardiacIntensity: 10,
          respiratoryIntensity: 30,
          fluidBalanceDeltaMl: 2000,
          simulateMissingLabs: false,
        });
        break;
      case 'pressor':
        setParameters({
          renalIntensity: -15,
          cardiacIntensity: -25,
          respiratoryIntensity: 0,
          fluidBalanceDeltaMl: 0,
          simulateMissingLabs: false,
        });
        break;
      case 'ventilation':
        setParameters({
          renalIntensity: 0,
          cardiacIntensity: 0,
          respiratoryIntensity: -40,
          fluidBalanceDeltaMl: 0,
          simulateMissingLabs: false,
        });
        break;
      case 'reset':
        setParameters({
          renalIntensity: 0,
          cardiacIntensity: 0,
          respiratoryIntensity: 0,
          fluidBalanceDeltaMl: 0,
          simulateMissingLabs: false,
        });
        break;
    }
  };

  if (!selectedPatient) return null;

  const tw = t.whatif;

  // Chart data
  const chartData = outcome
    ? outcome.simulatedPoints.map((pt) => ({
        time: pt.hourOffset === 0 ? (language === 'hi' ? 'वर्तमान' : 'Now') : `+${pt.hourOffset}h`,
        baseline: pt.baselineCompositeScore,
        hypothetical: pt.hypotheticalCompositeScore,
        uncertaintyLower: pt.hypotheticalCompositeScore - pt.uncertaintyBandWidth,
        uncertaintyUpper: pt.hypotheticalCompositeScore + pt.uncertaintyBandWidth,
        uncertaintyRange: [
          Math.max(0, pt.hypotheticalCompositeScore - pt.uncertaintyBandWidth),
          Math.min(100, pt.hypotheticalCompositeScore + pt.uncertaintyBandWidth),
        ],
      }))
    : [];

  const deltaRisk = outcome ? outcome.deltaDecompensationRisk : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-card rounded-lg border border-vitalis-border p-5 shadow-subtle flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-vitalis-navy flex items-center gap-2">
              <FlaskConical className="w-5 h-5 text-vitalis-blue" />
              {tw.title}
            </h1>
            <Badge variant="teal" size="xs">
              {language === 'hi' ? 'परिकल्पित अनुकरण' : 'Deterministic Simulation'}
            </Badge>
          </div>
          <p className="text-xs text-vitalis-muted mt-0.5">
            {tw.subtitle} • {selectedPatient.name} ({selectedPatient.bed})
          </p>
        </div>

        {/* Patient Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-vitalis-muted font-medium">{language === 'hi' ? 'रोगी:' : 'Patient:'}</span>
          <select
            value={selectedPatient.id}
            onChange={(e) => setSelectedPatientId(e.target.value)}
            className="bg-background border border-vitalis-border rounded-md px-2.5 py-1 text-xs text-vitalis-text focus:outline-none focus:border-vitalis-blue"
          >
            {patients.map((pt) => (
              <option key={pt.id} value={pt.id}>
                {pt.name} ({pt.bed})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Preset Quick Actions */}
      <div className="bg-card rounded-lg border border-vitalis-border p-3.5 shadow-subtle flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-xs text-vitalis-muted font-semibold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-vitalis-blue" />
          <span>{tw.presets}:</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => applyPreset('diuresis')}
            className="px-2.5 py-1 text-xs font-medium rounded border border-vitalis-border hover:bg-slate-100 transition-colors"
          >
            {tw.decongestion}
          </button>
          <button
            onClick={() => applyPreset('fluid_bolus')}
            className="px-2.5 py-1 text-xs font-medium rounded border border-vitalis-border hover:bg-slate-100 transition-colors"
          >
            {tw.volumeChallenge}
          </button>
          <button
            onClick={() => applyPreset('pressor')}
            className="px-2.5 py-1 text-xs font-medium rounded border border-vitalis-border hover:bg-slate-100 transition-colors"
          >
            {tw.pressorEscalation}
          </button>
          <button
            onClick={() => applyPreset('ventilation')}
            className="px-2.5 py-1 text-xs font-medium rounded border border-vitalis-border hover:bg-slate-100 transition-colors"
          >
            {tw.protectiveVent}
          </button>
          <button
            onClick={() => applyPreset('reset')}
            className="px-2.5 py-1 text-xs font-semibold rounded bg-slate-100 hover:bg-slate-200 text-vitalis-navy flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" />
            {tw.resetBaseline}
          </button>
        </div>
      </div>

      {/* Grid: Controls vs Trajectory Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Interactive Sliders & Toggles */}
        <div className="bg-card rounded-lg border border-vitalis-border p-5 shadow-subtle space-y-5">
          <div className="pb-3 border-b border-vitalis-border flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-vitalis-navy flex items-center gap-2">
              <Sliders className="w-4 h-4 text-vitalis-navy" />
              {language === 'hi' ? 'परिकल्पित पैरामीटर स्लाइडर्स' : 'Hypothetical Parameter Sliders'}
            </h3>
            <span className="text-[10px] text-vitalis-muted">Interactive Modifiers</span>
          </div>

          {/* Slider 1: Fluid Balance */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                <Droplets className="w-3.5 h-3.5 text-vitalis-blue" />
                {tw.fluidBalanceChange}
              </span>
              <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                {parameters.fluidBalanceDeltaMl > 0 ? `+${parameters.fluidBalanceDeltaMl}` : parameters.fluidBalanceDeltaMl} mL
              </span>
            </div>
            <input
              type="range"
              min={-2000}
              max={3000}
              step={250}
              value={parameters.fluidBalanceDeltaMl}
              onChange={(e) =>
                setParameters({ ...parameters, fluidBalanceDeltaMl: Number(e.target.value) })
              }
              className="w-full accent-vitalis-navy cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-vitalis-muted">
              <span>-2,000 mL ({language === 'hi' ? 'द्रव निष्कासन' : 'Diuresis'})</span>
              <span>0 (Baseline)</span>
              <span>+3,000 mL ({language === 'hi' ? 'विस्तारण' : 'Resuscitation'})</span>
            </div>
          </div>

          {/* Slider 2: Renal Intensity */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                <Droplets className="w-3.5 h-3.5 text-vitalis-blue" />
                {tw.renalModifier}
              </span>
              <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                {parameters.renalIntensity > 0 ? `+${parameters.renalIntensity}` : parameters.renalIntensity}%
              </span>
            </div>
            <input
              type="range"
              min={-50}
              max={100}
              step={5}
              value={parameters.renalIntensity}
              onChange={(e) =>
                setParameters({ ...parameters, renalIntensity: Number(e.target.value) })
              }
              className="w-full accent-vitalis-blue cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-vitalis-muted">
              <span>-50% ({language === 'hi' ? 'सुरक्षा' : 'Protection'})</span>
              <span>0% (Status Quo)</span>
              <span>+100% ({language === 'hi' ? 'क्षति' : 'Injury Spike'})</span>
            </div>
          </div>

          {/* Slider 3: Cardiac Intensity */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-red-600" />
                {tw.cardiacModifier}
              </span>
              <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                {parameters.cardiacIntensity > 0 ? `+${parameters.cardiacIntensity}` : parameters.cardiacIntensity}%
              </span>
            </div>
            <input
              type="range"
              min={-50}
              max={100}
              step={5}
              value={parameters.cardiacIntensity}
              onChange={(e) =>
                setParameters({ ...parameters, cardiacIntensity: Number(e.target.value) })
              }
              className="w-full accent-red-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-vitalis-muted">
              <span>-50% (Optimization)</span>
              <span>0% (Status Quo)</span>
              <span>+100% (Pump Failure)</span>
            </div>
          </div>

          {/* Slider 4: Respiratory Intensity */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                <Wind className="w-3.5 h-3.5 text-vitalis-teal" />
                {tw.respModifier}
              </span>
              <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                {parameters.respiratoryIntensity > 0 ? `+${parameters.respiratoryIntensity}` : parameters.respiratoryIntensity}%
              </span>
            </div>
            <input
              type="range"
              min={-50}
              max={100}
              step={5}
              value={parameters.respiratoryIntensity}
              onChange={(e) =>
                setParameters({ ...parameters, respiratoryIntensity: Number(e.target.value) })
              }
              className="w-full accent-vitalis-teal cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-vitalis-muted">
              <span>-50% (Clearance)</span>
              <span>0% (Status Quo)</span>
              <span>+100% (Severe ARDS)</span>
            </div>
          </div>

          {/* Missing Labs Simulation Toggle */}
          <div className="pt-3 border-t border-vitalis-border">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={parameters.simulateMissingLabs}
                onChange={(e) =>
                  setParameters({ ...parameters, simulateMissingLabs: e.target.checked })
                }
                className="mt-0.5 rounded border-vitalis-border text-vitalis-navy focus:ring-0 accent-vitalis-navy"
              />
              <div className="text-xs">
                <span className="font-semibold text-slate-800 block">
                  {tw.missingLabs}
                </span>
                <span className="text-[11px] text-vitalis-muted leading-tight">
                  {tw.missingLabsSub}
                </span>
              </div>
            </label>
          </div>
        </div>

        {/* Right 2 Cols: Simulation Comparison & Physiological Rationale */}
        <div className="lg:col-span-2 space-y-6">
          {/* Comparison Outcome Cards */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-card rounded-lg border border-vitalis-border p-3.5 shadow-subtle">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-vitalis-muted block">
                {tw.riskDelta}
              </span>
              <div className="flex items-baseline gap-1 mt-1">
                <span
                  className={cn(
                    'text-2xl font-bold font-mono',
                    deltaRisk > 0
                      ? 'text-vitalis-critical'
                      : deltaRisk < 0
                      ? 'text-emerald-700'
                      : 'text-slate-700'
                  )}
                >
                  {deltaRisk > 0 ? `+${deltaRisk}` : deltaRisk} pts
                </span>
              </div>
              <span className="text-[10px] text-vitalis-muted">
                {deltaRisk < 0 ? (language === 'hi' ? 'जोखिम में कमी' : 'Trajectory mitigated') : deltaRisk > 0 ? (language === 'hi' ? 'जोखिम में वृद्धि' : 'Trajectory worsened') : 'Identical to baseline'}
              </span>
            </div>

            <div className="bg-card rounded-lg border border-vitalis-border p-3.5 shadow-subtle">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-vitalis-muted block">
                {tw.hypotheticalTier}
              </span>
              <div className="mt-1">
                <Badge
                  variant={
                    outcome?.hypotheticalRiskTier === 'Critical'
                      ? 'critical'
                      : outcome?.hypotheticalRiskTier === 'Urgent'
                      ? 'warning'
                      : 'stable'
                  }
                  size="md"
                  dot
                >
                  {outcome?.hypotheticalRiskTier || 'Critical'}
                </Badge>
              </div>
              <span className="text-[10px] text-vitalis-muted block mt-1">
                {language === 'hi' ? 'अनुमानित श्रेणी' : 'Predicted risk tier'}
              </span>
            </div>

            <div className="bg-card rounded-lg border border-vitalis-border p-3.5 shadow-subtle">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-vitalis-muted block">
                {tw.confidenceRating}
              </span>
              <div className="text-sm font-bold text-slate-800 mt-1">
                {outcome?.confidenceRating || 'High'}
              </div>
              <span className="text-[10px] text-vitalis-muted">
                {parameters.simulateMissingLabs ? 'Band widened ±18 pts' : 'Calibrated standard band'}
              </span>
            </div>
          </div>

          {/* Comparative Chart */}
          <div className="bg-card rounded-lg border border-vitalis-border p-5 shadow-subtle space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-vitalis-navy">
                {tw.comparisonTitle}
              </h3>
              <div className="flex items-center gap-3 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 bg-slate-400 inline-block" />
                  <span className="text-vitalis-muted">{language === 'hi' ? 'मूल प्रक्षेपवक्र' : 'Baseline Path'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 bg-vitalis-blue inline-block" />
                  <span className="text-vitalis-blue font-semibold">{language === 'hi' ? 'परिकल्पित अनुकरण' : 'Hypothetical Simulation'}</span>
                </div>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#DCE4EF" vertical={false} />
                  <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#64748B' }} stroke="#DCE4EF" />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748B' }} stroke="#DCE4EF" />
                  <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#DCE4EF', fontSize: '12px' }} />
                  <Area type="monotone" dataKey="uncertaintyRange" name="Simulation Uncertainty Band" fill="#2563EB" fillOpacity={0.12} stroke="none" />
                  <Line type="monotone" dataKey="baseline" name="Baseline Trajectory" stroke="#94A3B8" strokeWidth={2} strokeDasharray="4 2" dot={false} />
                  <Line type="monotone" dataKey="hypothetical" name="Simulated Trajectory" stroke="#2563EB" strokeWidth={3} dot={false} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Organ Impact Breakdown & Physiological Rationale */}
          <div className="bg-card rounded-lg border border-vitalis-border p-5 shadow-subtle space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-vitalis-navy">
              {tw.organSensitivity}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              {outcome?.organImpacts.map((imp, idx) => (
                <div key={idx} className="bg-slate-50 border border-vitalis-border rounded p-3 space-y-1">
                  <div className="flex justify-between items-center font-semibold">
                    <span className="capitalize text-slate-800">{imp.organ}</span>
                    <span
                      className={cn(
                        'font-mono text-[11px]',
                        imp.deltaScore > 0 ? 'text-red-700 font-bold' : imp.deltaScore < 0 ? 'text-emerald-700 font-bold' : 'text-slate-600'
                      )}
                    >
                      {imp.deltaScore > 0 ? `+${imp.deltaScore}` : imp.deltaScore} pts
                    </span>
                  </div>
                  <p className="text-[11px] text-vitalis-muted leading-relaxed">
                    {imp.explanation}
                  </p>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-vitalis-border text-[11px] text-slate-700 leading-relaxed bg-sky-50/60 p-3 rounded border border-sky-100">
              <span className="font-semibold text-vitalis-navy">
                {language === 'hi' ? 'शारीरिक तंत्र व्याख्या:' : 'Simulation Mechanistic Model:'}{' '}
              </span>
              {outcome?.physiologicalRationale}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
