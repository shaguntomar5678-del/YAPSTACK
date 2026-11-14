import React, { useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import {
  Activity,
  Heart,
  Droplets,
  Wind,
  ShieldCheck,
  TrendingUp,
  Network,
  AlertTriangle,
  Clock,
  ArrowRight,
  Layers,
  ChevronDown,
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { usePatient } from '../../../lib/hooks';
import { Badge } from '../../common/Badge';
import {
  formatRiskCaption,
  formatRiskPercent,
  formatNotApplicableReason,
  RISK_DISCLAIMER_CAPTION,
} from '../../../utils/formatters';
import { cn } from '../../../utils/cn';

export const Patient360: React.FC = () => {
  const {
    selectedPatientId,
    setSelectedPatientId,
    selectedAnchorHour,
    setSelectedAnchorHour,
    patients,
    setCurrentPage,
    language,
    t,
  } = useApp();

  const { data: patient, loading: loadingPatient, error } = usePatient(selectedPatientId);
  const [activeSeriesTab, setActiveSeriesTab] = useState<'cardio' | 'renal' | 'resp' | 'hepatic'>('cardio');

  // Selected patient summary
  const patientSummary = useMemo(() => {
    return patients?.find((p) => p.id === selectedPatientId);
  }, [patients, selectedPatientId]);

  // Anchors available in record
  const anchors = useMemo(() => patient?.anchors ?? [], [patient]);

  // Currently active anchor
  const currentAnchor = useMemo(() => {
    if (!anchors.length) return null;
    const found = anchors.find((a) => a.hour === selectedAnchorHour);
    return found || anchors[anchors.length - 1];
  }, [anchors, selectedAnchorHour]);

  const tp = t.patient360;

  // Chart data formatting for Recharts
  const chartData = useMemo(() => {
    if (!patient?.series) return [];
    // Collect all unique hours across series
    const hourSet = new Set<number>();
    Object.values(patient.series).forEach((pts) => {
      pts.forEach(([h]) => hourSet.add(h));
    });
    const sortedHours = Array.from(hourSet).sort((a, b) => a - b);

    // Build map for quick lookup
    const seriesMaps: Record<string, Map<number, number | null>> = {};
    Object.entries(patient.series).forEach(([key, pts]) => {
      seriesMaps[key] = new Map(pts);
    });

    return sortedHours.map((hour) => {
      const entry: Record<string, number | null> = { hour };
      Object.keys(seriesMaps).forEach((key) => {
        const val = seriesMaps[key].get(hour);
        entry[key] = val !== undefined ? val : null;
      });
      return entry;
    });
  }, [patient?.series]);

  const getOrganStatusBadge = (status: string) => {
    switch (status) {
      case 'elevated':
        return <Badge variant="critical">Elevated Risk</Badge>;
      case 'dysfunction_present':
        return <Badge variant="navy">Dysfunction Present</Badge>;
      case 'low':
        return <Badge variant="stable">Low Risk</Badge>;
      case 'insufficient_data':
      default:
        return <Badge variant="outline">Insufficient Data</Badge>;
    }
  };

  const getTrustBadgeVariant = (trust: string): 'teal' | 'navy' | 'warning' | 'critical' => {
    switch (trust) {
      case 'high':
        return 'teal';
      case 'moderate':
      case 'medium':
        return 'navy';
      case 'low':
        return 'warning';
      case 'insufficient':
      default:
        return 'critical';
    }
  };

  if (loadingPatient) {
    return (
      <div className="p-8 text-center text-vitalis-muted">
        <p>Loading patient telemetry record...</p>
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div className="p-8 text-center text-vitalis-muted">
        <p className="text-vitalis-critical">
          {error || 'Patient record could not be loaded.'}
        </p>
        <button
          onClick={() => setCurrentPage('command-center')}
          className="mt-4 text-xs text-vitalis-blue underline"
        >
          Return to Command Center
        </button>
      </div>
    );
  }

  const organs = currentAnchor?.organs;

  return (
    <div className="space-y-6">
      {/* Patient Header & Replay Clock Controls */}
      <div className="bg-card rounded-lg border border-vitalis-border p-5 shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Patient Selector & Profile */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <select
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
              className="appearance-none bg-slate-50 border border-vitalis-border rounded-lg pl-3 pr-8 py-2 text-sm font-bold text-vitalis-navy focus:outline-none focus:border-vitalis-blue cursor-pointer"
            >
              {patients.map((pat) => (
                <option key={pat.id} value={pat.id}>
                  {pat.id} — {pat.name} ({pat.bed})
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-vitalis-muted absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-vitalis-text">
                {patientSummary?.name ?? `Patient ${patient.id}`}
              </h1>
              <Badge variant="outline" size="xs">
                {patient.gender === 1 ? 'Male' : 'Female'}, {patient.age}y
              </Badge>
              <Badge variant="navy" size="xs">
                {patientSummary?.bed ?? 'ICU'}
              </Badge>
              <span className="text-[10px] text-slate-500 italic">Simulated patient</span>
            </div>
            <p className="text-xs text-vitalis-muted mt-0.5">
              {patient.note || 'Continuous multi-organ ICU monitoring record'}
            </p>
          </div>
        </div>

        {/* Right: Replay Clock Anchor Selector */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-slate-50 border border-vitalis-border p-2.5 rounded-lg">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-vitalis-navy">
            <Clock className="w-4 h-4 text-vitalis-blue" />
            <span>Replay Anchor:</span>
          </div>
          <div className="flex items-center gap-1 overflow-x-auto max-w-xs sm:max-w-md py-0.5">
            {anchors.map((anc) => (
              <button
                key={anc.hour}
                type="button"
                onClick={() => setSelectedAnchorHour(anc.hour)}
                className={cn(
                  'px-2 py-1 rounded text-[11px] font-mono font-medium transition-all shrink-0',
                  anc.hour === currentAnchor?.hour
                    ? 'bg-vitalis-navy text-white font-bold shadow-subtle'
                    : 'bg-white text-slate-600 border border-slate-200 hover:border-vitalis-blue'
                )}
                title={`Anchor hour ${anc.hour}`}
              >
                {anc.hour}h
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Modelled Risk Card & Trust Header */}
      {currentAnchor && (
        <div className="bg-card rounded-lg border border-vitalis-border p-5 shadow-subtle grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          {/* Risk Level */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-vitalis-muted">
                Multi-Organ Modelled Risk
              </span>
              <Badge
                variant={getTrustBadgeVariant(currentAnchor.trust.level)}
                size="xs"
                className="capitalize font-mono"
              >
                Trust: {currentAnchor.trust.level}
              </Badge>
            </div>
            <div className="text-2xl font-bold font-mono text-vitalis-text flex items-baseline gap-2">
              <span>{formatRiskCaption(currentAnchor.display_overall, currentAnchor.risk_overall, currentAnchor.trust.level)}</span>
              {currentAnchor.threshold !== undefined && (
                <span className="text-xs text-vitalis-muted font-normal">
                  (threshold: {(currentAnchor.threshold * 100).toFixed(0)}%)
                </span>
              )}
            </div>
            <p className="text-[10px] text-vitalis-muted">
              {RISK_DISCLAIMER_CAPTION}
            </p>
          </div>

          {/* Data Quality Metrics */}
          <div className="bg-slate-50 border border-vitalis-border rounded-lg p-3 space-y-1.5 text-xs">
            <div className="flex items-center justify-between text-vitalis-muted">
              <span>Completeness:</span>
              <span className="font-mono font-bold text-slate-800">
                {(currentAnchor.trust.completeness * 100).toFixed(0)}%
              </span>
            </div>
            <div className="flex items-center justify-between text-vitalis-muted">
              <span>Consistency:</span>
              <span className="font-mono font-bold text-slate-800">
                {(currentAnchor.trust.consistency * 100).toFixed(0)}%
              </span>
            </div>
            <div className="flex items-center justify-between text-vitalis-muted">
              <span>Baseline Availability:</span>
              <span className="font-mono font-bold text-slate-800">
                {typeof currentAnchor.trust.baseline_availability === 'number'
                  ? `${(currentAnchor.trust.baseline_availability * 100).toFixed(0)}%`
                  : currentAnchor.trust.baseline_availability ? 'Yes' : 'No'}
              </span>
            </div>
          </div>

          {/* Quick Nav */}
          <div className="flex flex-col gap-2">
            <button
              onClick={() => setCurrentPage('cascade-graph')}
              className="w-full flex items-center justify-between px-3 py-2 rounded border border-vitalis-border bg-slate-50 hover:bg-sky-50 hover:border-vitalis-blue text-xs font-semibold text-vitalis-navy transition-all"
            >
              <span className="flex items-center gap-1.5">
                <Network className="w-3.5 h-3.5 text-vitalis-blue" />
                Cascade Dynamics Graph
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-vitalis-muted" />
            </button>
            <button
              onClick={() => setCurrentPage('futurecast')}
              className="w-full flex items-center justify-between px-3 py-2 rounded border border-vitalis-border bg-slate-50 hover:bg-emerald-50 hover:border-vitalis-teal text-xs font-semibold text-vitalis-navy transition-all"
            >
              <span className="flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-vitalis-teal" />
                FutureCast Trajectory (+4h, +8h, +12h)
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-vitalis-muted" />
            </button>
          </div>
        </div>
      )}

      {/* 4 Organ Status Cards */}
      {organs && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Renal */}
          <div className="bg-card rounded-lg border border-vitalis-border p-4 shadow-subtle space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-vitalis-navy flex items-center gap-1.5">
                <Droplets className="w-4 h-4 text-vitalis-blue" />
                Renal System
              </span>
              {getOrganStatusBadge(organs.renal.status)}
            </div>
            <div className="text-xl font-bold font-mono text-vitalis-text">
              {organs.renal.risk !== null && organs.renal.risk !== undefined
                ? formatRiskPercent(organs.renal.risk)
                : '--'}
            </div>
            <div className="space-y-1 text-xs text-vitalis-muted border-t border-vitalis-border/60 pt-2">
              <div className="flex justify-between">
                <span>Z-Score:</span>
                <span className="font-mono text-slate-700">
                  {organs.renal.z_score !== null && organs.renal.z_score !== undefined
                    ? organs.renal.z_score.toFixed(2)
                    : '--'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Baseline Divergence:</span>
                <span className="font-semibold text-slate-800">
                  {organs.renal.change_flag ? 'Flagged' : 'Normal'}
                </span>
              </div>
              {organs.renal.not_applicable_reason && (
                <div className="text-[10px] text-amber-700 font-medium">
                  {formatNotApplicableReason(organs.renal.not_applicable_reason)}
                </div>
              )}
            </div>
          </div>

          {/* Hepatic */}
          <div className="bg-card rounded-lg border border-vitalis-border p-4 shadow-subtle space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-vitalis-navy flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-amber-600" />
                Hepatic System
              </span>
              {getOrganStatusBadge(organs.hepatic.status)}
            </div>
            <div className="text-xl font-bold font-mono text-vitalis-text">
              {organs.hepatic.risk !== null && organs.hepatic.risk !== undefined
                ? formatRiskPercent(organs.hepatic.risk)
                : '--'}
            </div>
            <div className="space-y-1 text-xs text-vitalis-muted border-t border-vitalis-border/60 pt-2">
              <div className="flex justify-between">
                <span>Z-Score:</span>
                <span className="font-mono text-slate-700">
                  {organs.hepatic.z_score !== null && organs.hepatic.z_score !== undefined
                    ? organs.hepatic.z_score.toFixed(2)
                    : '--'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Baseline Divergence:</span>
                <span className="font-semibold text-slate-800">
                  {organs.hepatic.change_flag ? 'Flagged' : 'Normal'}
                </span>
              </div>
              {organs.hepatic.not_applicable_reason && (
                <div className="text-[10px] text-amber-700 font-medium">
                  {formatNotApplicableReason(organs.hepatic.not_applicable_reason)}
                </div>
              )}
            </div>
          </div>

          {/* Cardiac */}
          <div className="bg-card rounded-lg border border-vitalis-border p-4 shadow-subtle space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-vitalis-navy flex items-center gap-1.5">
                <Heart className="w-4 h-4 text-vitalis-critical" />
                Cardiovascular
              </span>
              {getOrganStatusBadge(organs.cardio.status)}
            </div>
            <div className="text-xl font-bold font-mono text-vitalis-text">
              {organs.cardio.risk !== null && organs.cardio.risk !== undefined
                ? formatRiskPercent(organs.cardio.risk)
                : '--'}
            </div>
            <div className="space-y-1 text-xs text-vitalis-muted border-t border-vitalis-border/60 pt-2">
              <div className="flex justify-between">
                <span>Z-Score:</span>
                <span className="font-mono text-slate-700">
                  {organs.cardio.z_score !== null && organs.cardio.z_score !== undefined
                    ? organs.cardio.z_score.toFixed(2)
                    : '--'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Baseline Divergence:</span>
                <span className="font-semibold text-slate-800">
                  {organs.cardio.change_flag ? 'Flagged' : 'Normal'}
                </span>
              </div>
              {organs.cardio.not_applicable_reason && (
                <div className="text-[10px] text-amber-700 font-medium">
                  {formatNotApplicableReason(organs.cardio.not_applicable_reason)}
                </div>
              )}
            </div>
          </div>

          {/* Respiratory */}
          <div className="bg-card rounded-lg border border-vitalis-border p-4 shadow-subtle space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-vitalis-navy flex items-center gap-1.5">
                <Wind className="w-4 h-4 text-vitalis-teal" />
                Respiratory
              </span>
              {getOrganStatusBadge(organs.resp.status)}
            </div>
            <div className="text-xl font-bold font-mono text-vitalis-text">
              {organs.resp.risk !== null && organs.resp.risk !== undefined
                ? formatRiskPercent(organs.resp.risk)
                : '--'}
            </div>
            <div className="space-y-1 text-xs text-vitalis-muted border-t border-vitalis-border/60 pt-2">
              <div className="flex justify-between">
                <span>Z-Score:</span>
                <span className="font-mono text-slate-700">
                  {organs.resp.z_score !== null && organs.resp.z_score !== undefined
                    ? organs.resp.z_score.toFixed(2)
                    : '--'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Baseline Divergence:</span>
                <span className="font-semibold text-slate-800">
                  {organs.resp.change_flag ? 'Flagged' : 'Normal'}
                </span>
              </div>
              {organs.resp.not_applicable_reason && (
                <div className="text-[10px] text-amber-700 font-medium">
                  {formatNotApplicableReason(organs.resp.not_applicable_reason)}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Longitudinal Trend Charts & Explainability Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Interactive Time-Series Charts (2 Cols) */}
        <div className="lg:col-span-2 bg-card rounded-lg border border-vitalis-border p-5 shadow-subtle space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-vitalis-border pb-3">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-vitalis-text">
                Longitudinal Parameter Telemetry &amp; Baselines
              </h2>
              <p className="text-[11px] text-vitalis-muted mt-0.5">
                Personal baseline reference line (dashed gray) • Vertical marker shows active anchor ({selectedAnchorHour}h)
              </p>
            </div>

            {/* Metric Category Tabs */}
            <div className="flex items-center bg-slate-50 border border-vitalis-border rounded-md p-0.5 text-xs">
              <button
                type="button"
                onClick={() => setActiveSeriesTab('cardio')}
                className={cn(
                  'px-2.5 py-1 rounded transition-colors',
                  activeSeriesTab === 'cardio'
                    ? 'bg-vitalis-navy text-white font-semibold'
                    : 'text-vitalis-muted hover:text-vitalis-text'
                )}
              >
                Cardiovascular (MAP, HR)
              </button>
              <button
                type="button"
                onClick={() => setActiveSeriesTab('renal')}
                className={cn(
                  'px-2.5 py-1 rounded transition-colors',
                  activeSeriesTab === 'renal'
                    ? 'bg-vitalis-navy text-white font-semibold'
                    : 'text-vitalis-muted hover:text-vitalis-text'
                )}
              >
                Renal (Creatinine, BUN)
              </button>
              <button
                type="button"
                onClick={() => setActiveSeriesTab('resp')}
                className={cn(
                  'px-2.5 py-1 rounded transition-colors',
                  activeSeriesTab === 'resp'
                    ? 'bg-vitalis-navy text-white font-semibold'
                    : 'text-vitalis-muted hover:text-vitalis-text'
                )}
              >
                Respiratory (SpO2, Resp, FiO2)
              </button>
              <button
                type="button"
                onClick={() => setActiveSeriesTab('hepatic')}
                className={cn(
                  'px-2.5 py-1 rounded transition-colors',
                  activeSeriesTab === 'hepatic'
                    ? 'bg-vitalis-navy text-white font-semibold'
                    : 'text-vitalis-muted hover:text-vitalis-text'
                )}
              >
                Hepatic (Bilirubin, Lactate)
              </button>
            </div>
          </div>

          {/* Primary Chart */}
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#DCE4EF" vertical={false} />
                <XAxis
                  dataKey="hour"
                  stroke="#64748B"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(val) => `${val}h`}
                />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} domain={['auto', 'auto']} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderColor: '#DCE4EF',
                    borderRadius: '8px',
                    fontSize: '11px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                  }}
                  formatter={(value: any, name: string) => [
                    typeof value === 'number' ? value.toFixed(2) : '--',
                    name,
                  ]}
                  labelFormatter={(val) => `ICU Hour: ${val}h`}
                />

                {/* Selected anchor vertical line */}
                <ReferenceLine
                  x={selectedAnchorHour}
                  stroke="#DC2626"
                  strokeDasharray="3 3"
                  label={{
                    value: `Anchor ${selectedAnchorHour}h`,
                    position: 'top',
                    fill: '#DC2626',
                    fontSize: 10,
                  }}
                />

                {/* Cardio Lines */}
                {activeSeriesTab === 'cardio' && (
                  <>
                    {typeof patient.baselines?.MAP === 'number' && (
                      <ReferenceLine
                        y={patient.baselines.MAP}
                        stroke="#94A3B8"
                        strokeDasharray="4 4"
                        label={{ value: 'MAP Baseline', position: 'right', fill: '#64748B', fontSize: 10 }}
                      />
                    )}
                    <Line
                      type="monotone"
                      dataKey="MAP"
                      stroke="#2563EB"
                      strokeWidth={2}
                      dot={false}
                      name="Mean Arterial Pressure (mmHg)"
                      connectNulls
                    />
                    <Line
                      type="monotone"
                      dataKey="HR"
                      stroke="#DC2626"
                      strokeWidth={1.5}
                      dot={false}
                      name="Heart Rate (bpm)"
                      connectNulls
                    />
                  </>
                )}

                {/* Renal Lines */}
                {activeSeriesTab === 'renal' && (
                  <>
                    {typeof patient.baselines?.Creatinine === 'number' && (
                      <ReferenceLine
                        y={patient.baselines.Creatinine}
                        stroke="#94A3B8"
                        strokeDasharray="4 4"
                        label={{ value: 'Creatinine Baseline', position: 'right', fill: '#64748B', fontSize: 10 }}
                      />
                    )}
                    <Line
                      type="monotone"
                      dataKey="Creatinine"
                      stroke="#123B82"
                      strokeWidth={2}
                      dot={{ r: 3, fill: '#123B82' }}
                      name="Creatinine (mg/dL)"
                      connectNulls
                    />
                    <Line
                      type="monotone"
                      dataKey="BUN"
                      stroke="#D97706"
                      strokeWidth={1.5}
                      dot={{ r: 2.5, fill: '#D97706' }}
                      name="BUN (mg/dL)"
                      connectNulls
                    />
                  </>
                )}

                {/* Resp Lines */}
                {activeSeriesTab === 'resp' && (
                  <>
                    {typeof patient.baselines?.O2Sat === 'number' && (
                      <ReferenceLine
                        y={patient.baselines.O2Sat}
                        stroke="#94A3B8"
                        strokeDasharray="4 4"
                        label={{ value: 'SpO2 Baseline', position: 'right', fill: '#64748B', fontSize: 10 }}
                      />
                    )}
                    <Line
                      type="monotone"
                      dataKey="O2Sat"
                      stroke="#0D9488"
                      strokeWidth={2}
                      dot={false}
                      name="SpO2 (%)"
                      connectNulls
                    />
                    <Line
                      type="monotone"
                      dataKey="Resp"
                      stroke="#2563EB"
                      strokeWidth={1.5}
                      dot={false}
                      name="Respiratory Rate (bpm)"
                      connectNulls
                    />
                  </>
                )}

                {/* Hepatic Lines */}
                {activeSeriesTab === 'hepatic' && (
                  <>
                    <Line
                      type="monotone"
                      dataKey="Lactate"
                      stroke="#DC2626"
                      strokeWidth={2}
                      dot={{ r: 3, fill: '#DC2626' }}
                      name="Lactate (mmol/L)"
                      connectNulls
                    />
                    <Line
                      type="monotone"
                      dataKey="Bilirubin_total"
                      stroke="#D97706"
                      strokeWidth={1.5}
                      dot={{ r: 3, fill: '#D97706' }}
                      name="Total Bilirubin (mg/dL)"
                      connectNulls
                    />
                  </>
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Explainability Panel ("Why was this flagged?") */}
        <div className="bg-card rounded-lg border border-vitalis-border p-5 shadow-subtle space-y-4">
          <div className="flex items-center justify-between border-b border-vitalis-border pb-2.5">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-vitalis-navy" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-vitalis-text">
                Why was this flagged? (Anchor {currentAnchor?.hour}h)
              </h3>
            </div>
            <span className="text-[10px] text-vitalis-muted font-mono">
              SHAP Attributions
            </span>
          </div>

          <div className="space-y-3">
            {currentAnchor?.reasons && currentAnchor.reasons.length > 0 ? (
              currentAnchor.reasons.map((r, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-lg border border-vitalis-border bg-slate-50/60 space-y-1.5 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-800 font-mono text-[11px]">
                      {r.feature}
                    </span>
                    <Badge
                      variant={r.effect.includes('higher') ? 'critical' : 'stable'}
                      size="xs"
                    >
                      {r.effect}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-slate-700 leading-snug">
                    {r.text}
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={cn(
                          'h-full rounded-full',
                          r.effect.includes('higher') ? 'bg-vitalis-critical' : 'bg-emerald-500'
                        )}
                        style={{ width: `${Math.min(100, Math.max(10, r.impact * 100))}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-mono text-slate-500 shrink-0">
                      {(r.impact).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-vitalis-muted py-4 text-center">
                No dominant risk factors flagged at this anchor.
              </p>
            )}
          </div>

          {/* Clinical Guardrail Footer */}
          <div className="p-2.5 rounded bg-amber-50/60 border border-amber-200 text-[10px] text-amber-800 leading-relaxed">
            Attribution scores reflect model sensitivity on proxy features. They do not constitute etiologic diagnoses or treatment guidance.
          </div>
        </div>
      </div>
    </div>
  );
};
