import React, { useMemo } from 'react';
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
import { Badge } from '../../common/Badge';
import { cn } from '../../../utils/cn';
import { usePatient } from '../../../lib/hooks';
import type { PatientRecord, Anchor, OrganAnchor } from '../../../lib/schemas';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function genderLabel(g: number): string {
  return g === 1 ? 'M' : 'F';
}

function trustVariant(level: string): 'stable' | 'warning' | 'critical' | 'watch' {
  if (level === 'high') return 'stable';
  if (level === 'moderate' || level === 'medium') return 'watch';
  if (level === 'low') return 'warning';
  return 'critical'; // insufficient
}

function organLabel(key: string): string {
  const map: Record<string, string> = {
    renal: 'Renal',
    hepatic: 'Hepatic',
    cardio: 'Cardiac',
    resp: 'Respiratory',
  };
  return map[key] ?? key;
}

function organIcon(key: string): React.ReactNode {
  const cls = 'w-3.5 h-3.5';
  if (key === 'renal') return <Droplets className={cls} />;
  if (key === 'hepatic') return <Activity className={cls} />;
  if (key === 'cardio') return <Heart className={cls} />;
  if (key === 'resp') return <Wind className={cls} />;
  return <Activity className={cls} />;
}

function organIconBg(key: string): string {
  if (key === 'renal') return 'bg-blue-50 text-vitalis-blue border-blue-100';
  if (key === 'hepatic') return 'bg-amber-50 text-amber-700 border-amber-100';
  if (key === 'cardio') return 'bg-red-50 text-red-600 border-red-100';
  if (key === 'resp') return 'bg-teal-50 text-teal-700 border-teal-100';
  return 'bg-slate-50 text-slate-600 border-slate-100';
}

function organTabKey(key: string): string {
  // Map organ key to OrganType used in setSelectedOrganTab
  if (key === 'cardio') return 'cardiac';
  if (key === 'resp') return 'respiratory';
  return key;
}

function mapNotApplicableReason(reason: string | null | undefined): string {
  if (!reason) return 'Organ dysfunction already present';
  const r = reason.toLowerCase();
  if (r.includes('aki') || r.includes('renal')) return 'Acute kidney injury already documented';
  if (r.includes('liver') || r.includes('hepatic')) return 'Hepatic dysfunction already present';
  if (r.includes('cardiac') || r.includes('cardio') || r.includes('heart')) return 'Cardiac dysfunction already established';
  if (r.includes('resp') || r.includes('lung') || r.includes('pulm')) return 'Respiratory failure already documented';
  if (r.includes('septic') || r.includes('sepsis')) return 'Septic shock — systemic dysfunction present';
  return reason;
}

function getBaselineValue(baselines: PatientRecord['baselines'], key: string): number | null {
  const val = baselines[key];
  if (val === undefined || val === null) return null;
  if (typeof val === 'number') return val;
  if (typeof val === 'object' && 'mean' in val) return (val as { mean?: number }).mean ?? null;
  return null;
}

// ─── Organ Card ───────────────────────────────────────────────────────────────

interface OrganCardProps {
  organKey: string;
  organ: OrganAnchor;
  onNavigate: () => void;
}

const OrganCard: React.FC<OrganCardProps> = ({ organKey, organ, onNavigate }) => {
  const statusConfig = useMemo(() => {
    switch (organ.status) {
      case 'elevated':
        return {
          badgeClass: 'bg-amber-100 text-amber-800 border border-amber-200',
          label: 'Elevated Risk',
          dot: 'bg-amber-500',
        };
      case 'low':
        return {
          badgeClass: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
          label: 'Low Risk',
          dot: 'bg-emerald-500',
        };
      case 'dysfunction_present':
        return {
          badgeClass: 'bg-red-100 text-red-800 border border-red-200',
          label: 'Dysfunction Present',
          dot: 'bg-red-500',
        };
      case 'insufficient_data':
        return {
          badgeClass: 'bg-slate-100 text-slate-600 border border-slate-200',
          label: 'Insufficient Data',
          dot: 'bg-slate-400',
        };
      default:
        return {
          badgeClass: 'bg-slate-100 text-slate-600 border border-slate-200',
          label: organ.status,
          dot: 'bg-slate-400',
        };
    }
  }, [organ.status]);

  return (
    <div
      onClick={onNavigate}
      className="bg-card rounded-lg border border-vitalis-border p-4 shadow-subtle hover:border-vitalis-blue/50 cursor-pointer transition-all group"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className={cn('w-7 h-7 rounded flex items-center justify-center font-bold text-xs border', organIconBg(organKey))}>
            {organIcon(organKey)}
          </div>
          <div>
            <h2 className="text-xs font-bold text-vitalis-navy group-hover:text-vitalis-blue">
              {organLabel(organKey)}
            </h2>
            {organ.change_flag && (
              <span className="text-[10px] text-amber-600 font-semibold">↑ Change detected</span>
            )}
          </div>
        </div>
        <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1', statusConfig.badgeClass)}>
          <span className={cn('w-1.5 h-1.5 rounded-full inline-block', statusConfig.dot)} />
          {statusConfig.label}
        </span>
      </div>

      <div className="space-y-1.5 mt-3 pt-2 border-t border-vitalis-border/60 text-xs">
        {(organ.status === 'elevated' || organ.status === 'low') && organ.risk != null && (
          <div className="flex justify-between items-center">
            <span className="text-vitalis-muted text-[11px]">Modelled risk:</span>
            <span className="font-mono font-bold text-slate-900">
              {(organ.risk * 100).toFixed(1)}%
            </span>
          </div>
        )}
        {organ.status === 'dysfunction_present' && (
          <div className="text-[11px] text-red-700 font-medium leading-snug">
            {mapNotApplicableReason(organ.not_applicable_reason)}
          </div>
        )}
        {organ.status === 'insufficient_data' && (
          <div className="text-[11px] text-slate-500 italic">
            Not enough data to compute risk at this anchor.
          </div>
        )}
        {organ.z_score != null && (
          <div className="flex justify-between items-center">
            <span className="text-vitalis-muted text-[11px]">Z-score (vs baseline):</span>
            <span
              className={cn(
                'font-mono text-[11px] font-semibold',
                Math.abs(organ.z_score) > 2
                  ? 'text-vitalis-critical'
                  : Math.abs(organ.z_score) > 1
                  ? 'text-amber-700'
                  : 'text-emerald-700'
              )}
            >
              {organ.z_score > 0 ? '+' : ''}{organ.z_score.toFixed(2)}σ
            </span>
          </div>
        )}
      </div>

      <div className="mt-2 text-[10px] text-vitalis-blue flex items-center justify-end gap-1 font-medium group-hover:translate-x-0.5 transition-transform">
        <span>Explore {organLabel(organKey)}</span>
        <ArrowRight className="w-3 h-3" />
      </div>
    </div>
  );
};

// ─── Mini Trend Chart ─────────────────────────────────────────────────────────

interface MiniChartProps {
  label: string;
  seriesKey: string;
  series: PatientRecord['series'];
  baselines: PatientRecord['baselines'];
  anchorHour: number;
  color: string;
}

const MiniChart: React.FC<MiniChartProps> = ({ label, seriesKey, series, baselines, anchorHour, color }) => {
  const rawPoints = series[seriesKey] ?? [];
  const data = rawPoints
    .filter(([, v]) => v != null)
    .map(([h, v]) => ({ hour: h, value: v as number }))
    .sort((a, b) => a.hour - b.hour);

  const baseline = getBaselineValue(baselines, seriesKey);

  if (data.length === 0) {
    return (
      <div className="bg-card rounded-lg border border-vitalis-border p-3 shadow-subtle">
        <div className="text-[11px] font-semibold text-vitalis-navy mb-1">{label}</div>
        <div className="h-[120px] flex items-center justify-center text-xs text-vitalis-muted italic">
          No data available
        </div>
      </div>
    );
  }

  const values = data.map((d) => d.value);
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const pad = (maxVal - minVal) * 0.15 || 1;
  const domainMin = baseline != null ? Math.min(minVal, baseline) - pad : minVal - pad;
  const domainMax = baseline != null ? Math.max(maxVal, baseline) + pad : maxVal + pad;

  return (
    <div className="bg-card rounded-lg border border-vitalis-border p-3 shadow-subtle">
      <div className="text-[11px] font-semibold text-vitalis-navy mb-1 flex items-center justify-between">
        <span>{label}</span>
        {baseline != null && (
          <span className="text-[10px] text-vitalis-muted font-normal">baseline: {baseline.toFixed(1)}</span>
        )}
      </div>
      <ResponsiveContainer width="100%" height={120}>
        <LineChart data={data} margin={{ top: 4, right: 8, left: -24, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#DCE4EF" vertical={false} />
          <XAxis
            dataKey="hour"
            tick={{ fontSize: 9, fill: '#64748B' }}
            stroke="#DCE4EF"
            tickFormatter={(h) => `h${h}`}
          />
          <YAxis
            domain={[domainMin, domainMax]}
            tick={{ fontSize: 9, fill: '#64748B' }}
            stroke="#DCE4EF"
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-white border border-vitalis-border p-2 rounded shadow text-xs">
                    <span className="font-mono font-bold">{(payload[0].value as number).toFixed(2)}</span>
                    <span className="text-vitalis-muted ml-1">h{payload[0].payload.hour}</span>
                  </div>
                );
              }
              return null;
            }}
          />
          {baseline != null && (
            <ReferenceLine
              y={baseline}
              stroke="#94a3b8"
              strokeDasharray="4 2"
              label={{ value: 'BL', fill: '#94a3b8', fontSize: 9, position: 'insideTopRight' }}
            />
          )}
          <ReferenceLine
            x={anchorHour}
            stroke="#123B82"
            strokeDasharray="3 3"
            label={{ value: `h${anchorHour}`, fill: '#123B82', fontSize: 9, position: 'insideTopLeft' }}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            dot={false}
            connectNulls
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

export const Patient360: React.FC = () => {
  const {
    selectedPatientId,
    setSelectedPatientId,
    setCurrentPage,
    setSelectedOrganTab,
    language,
    selectedAnchorHour,
    setSelectedAnchorHour,
    patients,
  } = useApp();

  const { data: record, loading, error } = usePatient(selectedPatientId ?? null);

  // Loading state
  if (loading) {
    return (
      <div className="p-8 text-center text-vitalis-muted space-y-2">
        <Clock className="w-8 h-8 mx-auto animate-spin text-vitalis-blue opacity-60" />
        <p className="text-sm">Loading patient record…</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-8 text-center space-y-2">
        <AlertTriangle className="w-8 h-8 mx-auto text-vitalis-critical" />
        <p className="text-sm text-vitalis-critical font-semibold">Failed to load patient data</p>
        <p className="text-xs text-vitalis-muted">{error}</p>
      </div>
    );
  }

  // No patient selected
  if (!record) {
    return (
      <div className="p-8 text-center text-vitalis-muted">
        <p>{language === 'hi' ? 'कोई रोगी चयनित नहीं है।' : 'No patient selected. Return to the Command Center to choose a patient.'}</p>
      </div>
    );
  }

  // Derived data
  const anchorHours = record.anchors.map((a) => a.hour).sort((a, b) => a - b);
  const selectedAnchor: Anchor | undefined = record.anchors.find((a) => a.hour === selectedAnchorHour);

  const organKeys = ['renal', 'hepatic', 'cardio', 'resp'];

  // Sorted reasons (by impact desc)
  const sortedReasons = selectedAnchor
    ? [...selectedAnchor.reasons].sort((a, b) => b.impact - a.impact)
    : [];

  return (
    <div className="space-y-6">

      {/* ── Replay Clock Slider ─────────────────────────────────────────────── */}
      <div className="bg-card rounded-lg border border-vitalis-border p-4 shadow-subtle">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-2 shrink-0">
            <Clock className="w-4 h-4 text-vitalis-blue" />
            <span className="text-xs font-bold uppercase tracking-wider text-vitalis-navy">Replay Clock</span>
          </div>
          <div className="flex-1 flex items-center gap-3">
            <input
              type="range"
              min={anchorHours[0] ?? 0}
              max={anchorHours[anchorHours.length - 1] ?? 0}
              step={1}
              value={selectedAnchorHour}
              onChange={(e) => {
                const v = Number(e.target.value);
                // Snap to nearest available anchor hour
                if (anchorHours.length === 0) return;
                const nearest = anchorHours.reduce((prev, curr) =>
                  Math.abs(curr - v) < Math.abs(prev - v) ? curr : prev
                );
                setSelectedAnchorHour(nearest);
              }}
              className="flex-1 accent-vitalis-blue cursor-pointer"
            />
            <span className="text-sm font-mono font-bold text-vitalis-navy whitespace-nowrap min-w-[64px]">
              Hour {selectedAnchorHour}
            </span>
          </div>
          <div className="flex flex-wrap gap-1">
            {anchorHours.map((h) => (
              <button
                key={h}
                onClick={() => setSelectedAnchorHour(h)}
                className={cn(
                  'text-[10px] px-2 py-0.5 rounded font-mono border transition-all',
                  h === selectedAnchorHour
                    ? 'bg-vitalis-blue text-white border-vitalis-blue font-bold'
                    : 'bg-slate-50 text-vitalis-muted border-vitalis-border hover:border-vitalis-blue/50'
                )}
              >
                {h}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Patient Header ──────────────────────────────────────────────────── */}
      <div className="bg-card rounded-lg border border-vitalis-border p-5 shadow-subtle">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-vitalis-navy font-mono">
                {record.id}
              </h1>
              {record.source === 'synthetic' && (
                <span className="text-xs bg-slate-100 text-slate-500 px-2.5 py-0.5 rounded-full border border-slate-200 font-medium">
                  Simulated patient
                </span>
              )}
              {record.source !== 'synthetic' && (
                <span className="text-xs bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full border border-blue-200 font-medium">
                  {record.source}
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-vitalis-muted mt-2">
              <span>
                Age: <strong className="text-vitalis-text">{record.age} y/o</strong>
              </span>
              <span>•</span>
              <span>
                Gender: <strong className="text-vitalis-text">{genderLabel(record.gender)}</strong>
              </span>
              {record.note && (
                <>
                  <span>•</span>
                  <span className="italic text-slate-600">{record.note}</span>
                </>
              )}
            </div>
          </div>

          {/* Quick Patient Switcher */}
          <div className="flex items-center gap-4 self-start lg:self-center">
            <div className="border-l border-vitalis-border pl-4">
              <label className="block text-[10px] uppercase font-semibold text-vitalis-muted mb-1">
                Switch Patient
              </label>
              <div className="relative">
                <select
                  value={selectedPatientId}
                  onChange={(e) => setSelectedPatientId(e.target.value)}
                  className="bg-background border border-vitalis-border rounded-md px-2.5 py-1 text-xs text-vitalis-text focus:outline-none focus:border-vitalis-blue appearance-none pr-7"
                >
                  {patients.map((pt) => (
                    <option key={pt.id} value={pt.id}>
                      {pt.id}{pt.note ? ` — ${pt.note.slice(0, 30)}` : ''}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-vitalis-muted" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Overall Risk Card ───────────────────────────────────────────────── */}
      <div className="bg-card rounded-lg border border-vitalis-border p-5 shadow-subtle">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="text-[11px] font-semibold uppercase text-vitalis-muted tracking-wider mb-1">
              Overall Modelled Risk · 12 h Horizon
            </div>
            {!selectedAnchor ? (
              <div className="text-sm text-vitalis-muted italic">No anchor data for Hour {selectedAnchorHour}</div>
            ) : selectedAnchor.display_overall === 'shown' && selectedAnchor.risk_overall != null ? (
              <>
                <div className="flex items-baseline gap-2">
                  <span
                    className={cn(
                      'text-4xl font-bold font-mono',
                      selectedAnchor.risk_overall >= 0.8
                        ? 'text-vitalis-critical'
                        : selectedAnchor.risk_overall >= 0.5
                        ? 'text-vitalis-warning'
                        : 'text-emerald-700'
                    )}
                  >
                    {(selectedAnchor.risk_overall * 100).toFixed(1)}%
                  </span>
                  <span className="text-xs text-vitalis-muted">modelled risk</span>
                </div>
                <p className="text-[10px] text-vitalis-muted mt-1 max-w-md leading-relaxed">
                  12 h horizon · Calibrated model output on a proxy label; not a validated clinical probability.
                </p>
              </>
            ) : selectedAnchor.display_overall === 'data_insufficient' ? (
              <div className="text-sm text-vitalis-muted italic">Insufficient data at this anchor</div>
            ) : selectedAnchor.display_overall === 'not_applicable' ? (
              <div className="text-sm text-amber-700 font-medium">
                Not applicable: organ dysfunction already present
              </div>
            ) : null}
          </div>

          {selectedAnchor && (
            <div className="flex flex-col items-end gap-2">
              <div className="text-[10px] text-vitalis-muted uppercase tracking-wider">Trust</div>
              <span
                className={cn(
                  'text-xs font-semibold px-3 py-1 rounded-full border',
                  selectedAnchor.trust.level === 'high'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : selectedAnchor.trust.level === 'moderate' || selectedAnchor.trust.level === 'medium'
                    ? 'bg-blue-50 text-blue-800 border-blue-200'
                    : selectedAnchor.trust.level === 'low'
                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                    : 'bg-red-50 text-red-800 border-red-200'
                )}
              >
                Trust: {selectedAnchor.trust.level}
              </span>
              <div className="text-[10px] text-vitalis-muted text-right space-y-0.5">
                <div>Completeness: {(selectedAnchor.trust.completeness * 100).toFixed(0)}%</div>
                <div>Consistency: {(selectedAnchor.trust.consistency * 100).toFixed(0)}%</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── 4 Organ Cards ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {organKeys.map((key) => {
          const organ = selectedAnchor?.organs?.[key];
          if (!organ) {
            return (
              <div
                key={key}
                className="bg-card rounded-lg border border-vitalis-border p-4 shadow-subtle"
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className={cn('w-7 h-7 rounded flex items-center justify-center font-bold text-xs border', organIconBg(key))}>
                    {organIcon(key)}
                  </div>
                  <h2 className="text-xs font-bold text-vitalis-navy">{organLabel(key)}</h2>
                </div>
                <div className="text-[11px] text-vitalis-muted italic">No anchor data</div>
              </div>
            );
          }
          return (
            <OrganCard
              key={key}
              organKey={key}
              organ={organ}
              onNavigate={() => {
                setSelectedOrganTab(organTabKey(key) as any);
                setCurrentPage('organ-intelligence');
              }}
            />
          );
        })}
      </div>

      {/* ── Trend Charts ───────────────────────────────────────────────────── */}
      <div className="bg-card rounded-lg border border-vitalis-border p-5 shadow-subtle space-y-4">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-vitalis-blue" />
          <h2 className="text-sm font-bold text-vitalis-navy">Vital & Lab Trends</h2>
          <span className="text-[10px] text-vitalis-muted ml-auto">
            Blue dashed line = selected anchor hour · Grey dashed = personal baseline
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <MiniChart label="Heart Rate (HR)" seriesKey="HR" series={record.series} baselines={record.baselines} anchorHour={selectedAnchorHour} color="#2563EB" />
          <MiniChart label="Mean Arterial Pressure (MAP)" seriesKey="MAP" series={record.series} baselines={record.baselines} anchorHour={selectedAnchorHour} color="#123B82" />
          <MiniChart label="Respiratory Rate (Resp)" seriesKey="Resp" series={record.series} baselines={record.baselines} anchorHour={selectedAnchorHour} color="#0D9488" />
          <MiniChart label="O₂ Saturation (SpO₂)" seriesKey="O2Sat" series={record.series} baselines={record.baselines} anchorHour={selectedAnchorHour} color="#0891b2" />
          <MiniChart label="Creatinine" seriesKey="Creatinine" series={record.series} baselines={record.baselines} anchorHour={selectedAnchorHour} color="#7c3aed" />
          <MiniChart label="BUN" seriesKey="BUN" series={record.series} baselines={record.baselines} anchorHour={selectedAnchorHour} color="#b45309" />
        </div>
      </div>

      {/* ── Lower Grid: Why Flagged + Navigation ───────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Left: Explainability / Why Flagged */}
        <div className="bg-card rounded-lg border border-vitalis-border p-5 shadow-subtle space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-vitalis-navy" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-vitalis-navy">
                Why Flagged — Feature Attribution
              </h3>
            </div>
            <span className="text-[10px] font-semibold text-vitalis-muted bg-slate-100 px-2 py-0.5 rounded">
              Sorted by impact
            </span>
          </div>

          {!selectedAnchor ? (
            <div className="text-sm text-vitalis-muted italic py-4 text-center">
              No anchor selected
            </div>
          ) : sortedReasons.length === 0 ? (
            <div className="text-sm text-vitalis-muted italic py-4 text-center">
              No explainability factors available at this anchor.
            </div>
          ) : (
            <div className="space-y-3">
              {sortedReasons.map((reason, idx) => {
                const isHigher = reason.effect?.toLowerCase().includes('higher');
                const isLower = reason.effect?.toLowerCase().includes('lower');
                return (
                  <div
                    key={idx}
                    className="border-b border-vitalis-border/60 pb-2.5 last:border-0 last:pb-0 text-xs"
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <span className="font-semibold text-slate-800 leading-snug flex-1">
                        {reason.text}
                      </span>
                      <span
                        className={cn(
                          'shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded border',
                          isHigher
                            ? 'bg-red-50 text-red-700 border-red-200'
                            : isLower
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-slate-100 text-slate-600 border-slate-200'
                        )}
                      >
                        {reason.effect}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 bg-slate-100 h-1 rounded-full overflow-hidden">
                        <div
                          className={cn('h-full rounded-full', isHigher ? 'bg-red-400' : isLower ? 'bg-emerald-400' : 'bg-slate-400')}
                          style={{ width: `${Math.min(Math.abs(reason.impact) * 100, 100)}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-vitalis-muted font-mono shrink-0">
                        {reason.impact.toFixed(3)}
                      </span>
                    </div>
                    <div className="text-[10px] text-vitalis-muted mt-0.5 font-mono">{reason.feature}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Navigation + Data Trust quick stats */}
        <div className="space-y-6">

          {/* Navigation Cards */}
          <div className="bg-card rounded-lg border border-vitalis-border p-5 shadow-subtle space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-vitalis-navy flex items-center gap-2">
              <Network className="w-4 h-4" />
              Explore Further
            </h3>
            <div className="space-y-2">
              <button
                onClick={() => setCurrentPage('cascade-graph')}
                className="w-full flex items-center justify-between px-4 py-2.5 rounded-md border border-vitalis-border bg-slate-50 hover:bg-blue-50 hover:border-vitalis-blue/40 transition-all text-xs font-semibold text-vitalis-navy group"
              >
                <span className="flex items-center gap-2">
                  <Network className="w-3.5 h-3.5 text-vitalis-blue" />
                  Open Cascade Graph
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-vitalis-muted group-hover:text-vitalis-blue group-hover:translate-x-0.5 transition-transform" />
              </button>
              <button
                onClick={() => setCurrentPage('futurecast')}
                className="w-full flex items-center justify-between px-4 py-2.5 rounded-md border border-vitalis-border bg-slate-50 hover:bg-blue-50 hover:border-vitalis-blue/40 transition-all text-xs font-semibold text-vitalis-navy group"
              >
                <span className="flex items-center gap-2">
                  <TrendingUp className="w-3.5 h-3.5 text-vitalis-blue" />
                  Open FutureCast
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-vitalis-muted group-hover:text-vitalis-blue group-hover:translate-x-0.5 transition-transform" />
              </button>
              <button
                onClick={() => setCurrentPage('data-trust')}
                className="w-full flex items-center justify-between px-4 py-2.5 rounded-md border border-vitalis-border bg-slate-50 hover:bg-blue-50 hover:border-vitalis-blue/40 transition-all text-xs font-semibold text-vitalis-navy group"
              >
                <span className="flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-vitalis-teal" />
                  Open Data Trust
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-vitalis-muted group-hover:text-vitalis-blue group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>

          {/* Data Trust Quick Stats (from selected anchor trust) */}
          {selectedAnchor && (
            <div className="bg-card rounded-lg border border-vitalis-border p-5 shadow-subtle space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-vitalis-teal" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-vitalis-navy">
                    Data Trust — Hour {selectedAnchorHour}
                  </h3>
                </div>
                <button
                  onClick={() => setCurrentPage('data-trust')}
                  className="text-xs font-semibold text-vitalis-blue hover:underline flex items-center gap-1"
                >
                  Inspect <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-50 border border-vitalis-border rounded p-2.5">
                  <span className="text-[10px] text-vitalis-muted uppercase tracking-wider block">Completeness</span>
                  <span className="font-mono font-bold text-slate-800 text-base">
                    {(selectedAnchor.trust.completeness * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="bg-slate-50 border border-vitalis-border rounded p-2.5">
                  <span className="text-[10px] text-vitalis-muted uppercase tracking-wider block">Consistency</span>
                  <span className="font-mono font-bold text-slate-800 text-base">
                    {(selectedAnchor.trust.consistency * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
              {selectedAnchor.trust.reasons.length > 0 && (
                <div className="text-[11px] bg-amber-50 border border-amber-200 rounded p-2 text-amber-900 space-y-1">
                  <div className="font-semibold flex items-center gap-1 text-amber-800">
                    <AlertTriangle className="w-3 h-3 text-amber-700" />
                    <span>Trust notices:</span>
                  </div>
                  <ul className="list-disc pl-4 space-y-0.5 text-[10px]">
                    {selectedAnchor.trust.reasons.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
