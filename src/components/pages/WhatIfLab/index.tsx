import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
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
  AlertTriangle,
  Info,
  CheckCircle2,
  ChevronDown,
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { useWhatIf } from '../../../lib/hooks';
import { Badge } from '../../common/Badge';
import {
  formatRiskPercent,
  RISK_DISCLAIMER_CAPTION,
} from '../../../utils/formatters';
import { cn } from '../../../utils/cn';

export const WhatIfLab: React.FC = () => {
  const { language, t } = useApp();

  // What-If grid is precomputed for hero patient V-104
  const { data: whatifData, loading, error } = useWhatIf('V-104');

  // Controls that snap exactly to the precomputed grid
  const [focus, setFocus] = useState<'all' | 'renal' | 'cardio' | 'resp'>('all');
  const [intensity, setIntensity] = useState<number>(0.75);
  const [missingLabs, setMissingLabs] = useState<boolean>(false);

  // Baseline/Current is defined by clinical protocol: focus='all', intensity=0.75, missing_labs=false
  const baselineEntry = useMemo(() => {
    if (!whatifData?.grid) return null;
    return (
      whatifData.grid.find(
        (g) => g.focus === 'all' && g.intensity === 0.75 && g.missing_labs === false
      ) || whatifData.grid[0]
    );
  }, [whatifData]);

  // Selected counterfactual entry
  const selectedEntry = useMemo(() => {
    if (!whatifData?.grid) return null;
    return (
      whatifData.grid.find(
        (g) => g.focus === focus && g.intensity === intensity && g.missing_labs === missingLabs
      ) || baselineEntry
    );
  }, [whatifData, focus, intensity, missingLabs, baselineEntry]);

  // Chart data: compare baseline vs selected counterfactual across anchors (h=12..92)
  const chartData = useMemo(() => {
    if (!baselineEntry?.anchors || !selectedEntry?.anchors) return [];

    const baseMap = new Map(baselineEntry.anchors.map((a) => [a.hour, a.risk_overall]));
    const selMap = new Map(selectedEntry.anchors.map((a) => [a.hour, a.risk_overall]));

    const hours = baselineEntry.anchors.map((a) => a.hour);

    return hours.map((hour) => {
      const bRisk = baseMap.get(hour);
      const sRisk = selMap.get(hour);
      return {
        hour,
        label: `${hour}h`,
        baselineRisk: bRisk !== null && bRisk !== undefined ? bRisk * 100 : null,
        simulatedRisk: sRisk !== null && sRisk !== undefined ? sRisk * 100 : null,
      };
    });
  }, [baselineEntry, selectedEntry]);

  const handleReset = () => {
    setFocus('all');
    setIntensity(0.75);
    setMissingLabs(false);
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-vitalis-muted">
        Loading What-If in-silico simulation grid for patient V-104...
      </div>
    );
  }

  if (error || !whatifData) {
    return (
      <div className="p-8 text-center text-vitalis-muted">
        <p className="text-vitalis-critical">
          {error || 'Simulation grid could not be loaded.'}
        </p>
      </div>
    );
  }

  // Calculate final anchor risk delta
  const finalBase = baselineEntry?.anchors[baselineEntry.anchors.length - 1]?.risk_overall ?? 0;
  const finalSim = selectedEntry?.anchors[selectedEntry.anchors.length - 1]?.risk_overall ?? 0;
  const deltaRisk = (finalSim - finalBase) * 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-card rounded-lg border border-vitalis-border p-5 shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-vitalis-navy flex items-center gap-2">
              <FlaskConical className="w-5 h-5 text-vitalis-blue" />
              <span>{language === 'hi' ? 'यदि-प्रयोगशाला (काउंटरफैक्चुअल लैब)' : 'What-If Simulation Laboratory'}</span>
            </h1>
            <Badge variant="navy" size="xs">
              Precomputed Re-Scored Model Grid
            </Badge>
          </div>
          <p className="text-xs text-vitalis-muted mt-0.5">
            Evaluate hypothetical multi-organ trajectory shifts on Patient V-104 (Hero 4-Day Cascade Case)
          </p>
        </div>

        <button
          type="button"
          onClick={handleReset}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-vitalis-border bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-vitalis-text transition-colors self-start md:self-auto"
        >
          <RotateCcw className="w-3.5 h-3.5 text-vitalis-muted" />
          <span>Reset to Baseline (Intensity 0.75, Full Labs)</span>
        </button>
      </div>

      {/* Grid: Interactive Simulation Controls & Outcome Trajectory */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Controls Column - 1 Col */}
        <div className="bg-card rounded-lg border border-vitalis-border p-5 shadow-subtle space-y-5">
          <div className="flex items-center gap-2 border-b border-vitalis-border pb-2.5">
            <Sliders className="w-4 h-4 text-vitalis-navy" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-vitalis-text">
              Simulation Parameters
            </h3>
          </div>

          {/* Organ Focus Selector */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-vitalis-text block">
              1. Organ Perturbation Target Focus:
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                { key: 'all', label: 'All Systems' },
                { key: 'renal', label: 'Renal' },
                { key: 'cardio', label: 'Cardiovascular' },
                { key: 'resp', label: 'Respiratory' },
              ].map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setFocus(item.key as any)}
                  className={cn(
                    'p-2 rounded-lg border text-left font-medium transition-all text-xs',
                    focus === item.key
                      ? 'bg-vitalis-navy text-white border-vitalis-navy shadow-subtle'
                      : 'bg-slate-50 border-vitalis-border text-slate-700 hover:bg-slate-100'
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Intensity Slider (Snaps to grid: 0, 0.25, 0.5, 0.75, 1.0) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-vitalis-text">2. Perturbation Intensity:</span>
              <span className="font-mono font-bold text-vitalis-navy bg-slate-100 px-2 py-0.5 rounded">
                {(intensity * 100).toFixed(0)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.25"
              value={intensity}
              onChange={(e) => setIntensity(Number(e.target.value))}
              className="w-full accent-vitalis-navy cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-vitalis-muted font-mono">
              <span>0% (Norm)</span>
              <span>25%</span>
              <span>50%</span>
              <span>75% (Base)</span>
              <span>100% (Max)</span>
            </div>
          </div>

          {/* Missing Labs Toggle */}
          <div className="space-y-2 pt-2 border-t border-vitalis-border">
            <label className="text-xs font-semibold text-vitalis-text block">
              3. Telemetry Completeness:
            </label>
            <label className="flex items-start gap-2.5 p-3 rounded-lg border border-vitalis-border bg-slate-50/80 cursor-pointer hover:bg-slate-100 transition-colors">
              <input
                type="checkbox"
                checked={missingLabs}
                onChange={(e) => setMissingLabs(e.target.checked)}
                className="mt-0.5 accent-vitalis-navy rounded"
              />
              <div className="text-xs">
                <span className="font-bold text-slate-800 block">
                  Simulate Missing Laboratory Measurements
                </span>
                <span className="text-[11px] text-vitalis-muted leading-snug block mt-0.5">
                  Evaluates model resilience when creatinine and lactate sampling intervals drop out.
                </span>
              </div>
            </label>
          </div>

          {/* Fluid Balance Disclaimer Slider */}
          <div className="space-y-2 pt-2 border-t border-vitalis-border opacity-70">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-500">Fluid Balance Adjustment:</span>
              <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-mono">
                Not Modelled
              </span>
            </div>
            <input
              type="range"
              disabled
              value={0}
              className="w-full accent-slate-400 cursor-not-allowed"
            />
            <p className="text-[10px] text-amber-800 italic">
              Fluid balance is illustrative only — not an input feature in the trained proxy model.
            </p>
          </div>
        </div>

        {/* Outcome Trajectory & Comparison Chart - 2 Cols */}
        <div className="lg:col-span-2 bg-card rounded-lg border border-vitalis-border p-5 shadow-subtle space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-vitalis-border pb-3">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-vitalis-text">
                Observed Baseline vs. Counterfactual Trajectory
              </h3>
              <p className="text-[11px] text-vitalis-muted mt-0.5">
                Blue Line: Observed Baseline (Intensity 0.75) • Amber Line: Variant ({focus}, {(intensity * 100).toFixed(0)}%{missingLabs ? ', missing labs' : ''})
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <Badge variant={deltaRisk <= 0 ? 'stable' : 'critical'}>
                Final Delta: {deltaRisk > 0 ? `+${deltaRisk.toFixed(1)}%` : `${deltaRisk.toFixed(1)}%`}
              </Badge>
            </div>
          </div>

          {/* Chart Display */}
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 15, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#DCE4EF" vertical={false} />
                <XAxis dataKey="label" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="#64748B"
                  fontSize={11}
                  tickLine={false}
                  domain={[0, 100]}
                  tickFormatter={(val) => `${val}%`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderColor: '#DCE4EF',
                    borderRadius: '8px',
                    fontSize: '11px',
                  }}
                  formatter={(val: any, name: string) => [
                    typeof val === 'number' ? `${val.toFixed(1)}%` : '--',
                    name,
                  ]}
                />

                <Line
                  type="monotone"
                  dataKey="baselineRisk"
                  stroke="#123B82"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: '#123B82' }}
                  name="Observed Baseline (V-104)"
                  connectNulls
                />

                <Line
                  type="monotone"
                  dataKey="simulatedRisk"
                  stroke="#D97706"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={{ r: 3, fill: '#D97706' }}
                  name="Counterfactual Simulation"
                  connectNulls
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Anchor Comparison Snapshot Grid */}
          <div className="space-y-2 pt-2 border-t border-vitalis-border">
            <span className="text-[11px] font-bold text-vitalis-navy uppercase tracking-wider block">
              Anchor Replay Snapshot (Hours 60, 72, 84, 92):
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              {[60, 72, 84, 92].map((h) => {
                const bPoint = baselineEntry?.anchors.find((a) => a.hour === h);
                const sPoint = selectedEntry?.anchors.find((a) => a.hour === h);
                const bVal = bPoint?.risk_overall !== null && bPoint?.risk_overall !== undefined ? bPoint.risk_overall * 100 : null;
                const sVal = sPoint?.risk_overall !== null && sPoint?.risk_overall !== undefined ? sPoint.risk_overall * 100 : null;
                const diff = bVal !== null && sVal !== null ? sVal - bVal : null;

                return (
                  <div key={h} className="p-2.5 rounded-lg border border-vitalis-border bg-slate-50 space-y-1">
                    <div className="font-bold text-slate-800 text-[11px]">
                      Hour {h}h
                    </div>
                    <div className="text-[10px] text-vitalis-muted flex justify-between">
                      <span>Baseline:</span>
                      <span className="font-mono text-slate-700">{bVal !== null ? `${bVal.toFixed(1)}%` : '--'}</span>
                    </div>
                    <div className="text-[10px] text-vitalis-muted flex justify-between">
                      <span>Variant:</span>
                      <span className="font-mono text-amber-700 font-semibold">{sVal !== null ? `${sVal.toFixed(1)}%` : '--'}</span>
                    </div>
                    {diff !== null && (
                      <div className="text-[10px] font-mono text-right font-bold pt-0.5 border-t border-slate-200">
                        {diff > 0 ? `+${diff.toFixed(1)}%` : `${diff.toFixed(1)}%`}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Clinical Guardrail Footer */}
          <div className="p-3 rounded-lg bg-amber-50/70 border border-amber-200 text-[10px] text-amber-800 leading-relaxed">
            <strong>Clinical Warning:</strong> What-If simulations are deterministic re-scorings of precomputed in-silico grid entries. No causal clinical intervention outcome or pharmacologic efficacy is implied.
          </div>
        </div>
      </div>
    </div>
  );
};
