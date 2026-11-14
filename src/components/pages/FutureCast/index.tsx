import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import {
  TrendingUp,
  ShieldAlert,
  Layers,
  Clock,
  ChevronDown,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { usePatient } from '../../../lib/hooks';
import { Badge } from '../../common/Badge';
import {
  formatRiskPercent,
  RISK_DISCLAIMER_CAPTION,
} from '../../../utils/formatters';
import { cn } from '../../../utils/cn';

export const FutureCast: React.FC = () => {
  const {
    selectedPatientId,
    setSelectedPatientId,
    selectedAnchorHour,
    setSelectedAnchorHour,
    patients,
    language,
    t,
  } = useApp();

  const { data: patient, loading, error } = usePatient(selectedPatientId);

  const patientSummary = useMemo(() => {
    return patients?.find((p) => p.id === selectedPatientId);
  }, [patients, selectedPatientId]);

  const anchors = useMemo(() => patient?.anchors ?? [], [patient]);

  const currentAnchor = useMemo(() => {
    if (!anchors.length) return null;
    const found = anchors.find((a) => a.hour === selectedAnchorHour);
    return found || anchors[anchors.length - 1];
  }, [anchors, selectedAnchorHour]);

  // Lookup FutureCast entry for current anchor hour
  const fcEntry = useMemo(() => {
    if (!patient?.futurecast || !currentAnchor) return null;
    return patient.futurecast[String(currentAnchor.hour)];
  }, [patient?.futurecast, currentAnchor]);

  const isDataInsufficient = fcEntry === 'data_insufficient' || !fcEntry;

  // Build chart points combining historical anchors and futurecast points
  const chartPoints = useMemo(() => {
    if (!patient || !currentAnchor) return [];

    // Historical points: last 4 anchors up to currentAnchor
    const histAnchors = anchors.filter((a) => a.hour <= currentAnchor.hour).slice(-4);

    const points: Array<{
      hour: number;
      label: string;
      historical?: number | null;
      stable?: number | null;
      trend_continues?: number | null;
      isProjected?: boolean;
    }> = histAnchors.map((a) => ({
      hour: a.hour,
      label: `${a.hour}h`,
      historical: a.risk_overall !== null ? a.risk_overall * 100 : null,
      stable: a.hour === currentAnchor.hour && a.risk_overall !== null ? a.risk_overall * 100 : undefined,
      trend_continues: a.hour === currentAnchor.hour && a.risk_overall !== null ? a.risk_overall * 100 : undefined,
      isProjected: false,
    }));

    // If futurecast scenarios exist, add them
    if (!isDataInsufficient && typeof fcEntry === 'object' && fcEntry !== null) {
      const stableMap = new Map((fcEntry.stable || []).map((p) => [p.hour, p.risk_overall]));
      const trendMap = new Map((fcEntry.trend_continues || []).map((p) => [p.hour, p.risk_overall]));

      const futureHours = Array.from(new Set([...stableMap.keys(), ...trendMap.keys()])).sort(
        (a, b) => a - b
      );

      futureHours.forEach((h) => {
        const sVal = stableMap.get(h);
        const tVal = trendMap.get(h);
        points.push({
          hour: h,
          label: `+${h - currentAnchor.hour}h (${h}h)`,
          historical: undefined,
          stable: sVal !== null && sVal !== undefined ? sVal * 100 : null,
          trend_continues: tVal !== null && tVal !== undefined ? tVal * 100 : null,
          isProjected: true,
        });
      });
    }

    return points;
  }, [patient, currentAnchor, fcEntry, isDataInsufficient, anchors]);

  if (loading) {
    return (
      <div className="p-8 text-center text-vitalis-muted">
        Loading predictive trajectories...
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div className="p-8 text-center text-vitalis-muted">
        <p className="text-vitalis-critical">
          {error || 'Patient prediction record could not be loaded.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="bg-card rounded-lg border border-vitalis-border p-5 shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-vitalis-navy flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-vitalis-teal" />
              <span>{language === 'hi' ? 'भविष्य-दर्शन (फ्यूचरकास्ट)' : 'FutureCast Trajectory Projections'}</span>
            </h1>
            <Badge variant="teal" size="xs">
              12h Forward Horizons
            </Badge>
          </div>
          <p className="text-xs text-vitalis-muted mt-0.5">
            Forward progression modelling across stable and deteriorating pathophysiological scenarios
          </p>
        </div>

        {/* Patient & Anchor Selectors */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <select
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
              className="appearance-none bg-slate-50 border border-vitalis-border rounded-lg pl-3 pr-8 py-1.5 text-xs font-semibold text-vitalis-navy focus:outline-none focus:border-vitalis-blue cursor-pointer"
            >
              {patients.map((pat) => (
                <option key={pat.id} value={pat.id}>
                  {pat.id} — {pat.name} ({pat.bed})
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-vitalis-muted absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <div className="flex items-center gap-1 bg-slate-50 border border-vitalis-border rounded-lg p-1 text-xs">
            <Clock className="w-3.5 h-3.5 text-vitalis-muted ml-1" />
            <select
              value={currentAnchor?.hour}
              onChange={(e) => setSelectedAnchorHour(Number(e.target.value))}
              className="bg-transparent text-vitalis-navy font-mono font-bold focus:outline-none cursor-pointer pr-1"
            >
              {anchors.map((anc) => (
                <option key={anc.hour} value={anc.hour}>
                  Anchor {anc.hour}h
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Insufficient Data State */}
      {isDataInsufficient ? (
        <div className="bg-card rounded-lg border border-amber-200 p-8 text-center space-y-3">
          <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto" />
          <h3 className="text-base font-bold text-vitalis-text">
            Not Enough Evidence to Project Forward at Hour {currentAnchor?.hour}h
          </h3>
          <p className="text-xs text-vitalis-muted max-w-lg mx-auto">
            The multi-organ intelligence engine has withheld forward trajectory estimates because required physiological telemetry or personal baseline calibration does not satisfy safety thresholds.
          </p>
          <span className="inline-block text-[11px] text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1 rounded">
            Display rule strictly enforced: No fabricated numbers presented.
          </span>
        </div>
      ) : (
        /* Trajectory Projections Chart & Scenario Table */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Composed Chart - 2 Cols */}
          <div className="lg:col-span-2 bg-card rounded-lg border border-vitalis-border p-5 shadow-subtle space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-vitalis-border pb-3">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-vitalis-text">
                  Modelled Risk Trajectory (+4h, +8h, +12h)
                </h3>
                <p className="text-[11px] text-vitalis-muted mt-0.5">
                  Comparison between current trajectory maintenance vs stabilizing response
                </p>
              </div>

              <div className="flex items-center gap-3 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="text-slate-700">Stable Scenario</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-amber-600" />
                  <span className="text-slate-700">Trend Continues</span>
                </div>
              </div>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartPoints} margin={{ top: 15, right: 20, left: 0, bottom: 0 }}>
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

                  {/* Reference line for current anchor */}
                  <ReferenceLine
                    x={`${currentAnchor?.hour}h`}
                    stroke="#DC2626"
                    strokeDasharray="3 3"
                    label={{ value: 'Active Anchor', fill: '#DC2626', fontSize: 10, position: 'top' }}
                  />

                  {/* Historical observations line */}
                  <Line
                    type="monotone"
                    dataKey="historical"
                    stroke="#123B82"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: '#123B82' }}
                    name="Historical Modelled Risk"
                    connectNulls
                  />

                  {/* Stable forward line */}
                  <Line
                    type="monotone"
                    dataKey="stable"
                    stroke="#0D9488"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    dot={{ r: 4, fill: '#0D9488' }}
                    name="Stable Scenario"
                    connectNulls
                  />

                  {/* Trend continues forward line */}
                  <Line
                    type="monotone"
                    dataKey="trend_continues"
                    stroke="#D97706"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    dot={{ r: 4, fill: '#D97706' }}
                    name="Trend Continues Scenario"
                    connectNulls
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            <div className="p-2.5 rounded bg-amber-50/70 border border-amber-200 text-[10px] text-amber-800 leading-relaxed">
              <strong>Clinical Guardrail:</strong> {RISK_DISCLAIMER_CAPTION}
            </div>
          </div>

          {/* Scenario Details & Evidence Panel - 1 Col */}
          <div className="bg-card rounded-lg border border-vitalis-border p-5 shadow-subtle space-y-4">
            <div className="flex items-center gap-2 border-b border-vitalis-border pb-2.5">
              <Layers className="w-4 h-4 text-vitalis-navy" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-vitalis-text">
                Horizon Estimates
              </h3>
            </div>

            {/* Scenario Table */}
            <div className="space-y-2 text-xs">
              {(typeof fcEntry === 'object' && fcEntry !== null && fcEntry.stable
                ? fcEntry.stable
                : []
              ).map((sPoint, idx) => {
                const tPoint = (fcEntry as any).trend_continues?.[idx];
                const offsetH = sPoint.hour - (currentAnchor?.hour ?? 0);
                return (
                  <div
                    key={sPoint.hour}
                    className="p-3 rounded-lg border border-vitalis-border bg-slate-50 space-y-2"
                  >
                    <div className="flex items-center justify-between font-bold text-vitalis-navy">
                      <span>Horizon: +{offsetH} hours</span>
                      <span className="font-mono text-slate-500 font-normal">
                        ICU Hour {sPoint.hour}h
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div className="bg-emerald-50/80 border border-emerald-200 rounded p-1.5 text-emerald-900">
                        <span className="block text-[10px] text-emerald-700">Stable Scenario</span>
                        <span className="font-mono font-bold text-xs">
                          {formatRiskPercent(sPoint.risk_overall)}
                        </span>
                      </div>
                      <div className="bg-amber-50/80 border border-amber-200 rounded p-1.5 text-amber-900">
                        <span className="block text-[10px] text-amber-700">Trend Continues</span>
                        <span className="font-mono font-bold text-xs">
                          {formatRiskPercent(tPoint?.risk_overall)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Evidence Summary from Current Anchor */}
            <div className="space-y-2 pt-2 border-t border-vitalis-border">
              <span className="text-[10px] font-bold text-vitalis-navy uppercase tracking-wider block">
                Primary Model Drivers:
              </span>
              <div className="space-y-1.5 text-[11px]">
                {(currentAnchor?.reasons || []).slice(0, 3).map((r, i) => (
                  <div key={i} className="p-2 rounded bg-slate-50 border border-slate-200 text-slate-700">
                    <span className="font-semibold block font-mono text-[10px] text-vitalis-navy">
                      {r.feature}
                    </span>
                    <span>{r.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
