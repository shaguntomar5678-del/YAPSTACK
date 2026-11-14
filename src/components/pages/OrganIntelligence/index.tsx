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
  Droplets,
  Heart,
  Wind,
  Activity,
  ArrowRight,
  Layers,
  ChevronDown,
  Clock,
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { OrganType } from '../../../types/organ';
import { usePatient } from '../../../lib/hooks';
import { Badge } from '../../common/Badge';
import {
  formatRiskPercent,
  formatNotApplicableReason,
  RISK_DISCLAIMER_CAPTION,
} from '../../../utils/formatters';
import { cn } from '../../../utils/cn';

export const OrganIntelligence: React.FC = () => {
  const {
    selectedPatientId,
    setSelectedPatientId,
    selectedAnchorHour,
    setSelectedAnchorHour,
    selectedOrganTab,
    setSelectedOrganTab,
    patients,
    setCurrentPage,
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

  // Map OrganType ('renal' | 'hepatic' | 'cardiac' | 'respiratory') to JSON organ key
  const jsonOrganKey = useMemo(() => {
    switch (selectedOrganTab) {
      case 'cardiac':
        return 'cardio';
      case 'respiratory':
        return 'resp';
      case 'hepatic':
        return 'hepatic';
      case 'renal':
      default:
        return 'renal';
    }
  }, [selectedOrganTab]);

  const activeOrganData = currentAnchor?.organs?.[jsonOrganKey];

  // Chart data formatting
  const chartData = useMemo(() => {
    if (!patient?.series) return [];
    const hourSet = new Set<number>();
    Object.values(patient.series).forEach((pts) => {
      pts.forEach(([h]) => hourSet.add(h));
    });
    const sortedHours = Array.from(hourSet).sort((a, b) => a - b);

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

  const getOrganStatusBadge = (status?: string) => {
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

  const organDotColor = (status?: string) => {
    switch (status) {
      case 'elevated':
        return 'bg-vitalis-critical text-white';
      case 'dysfunction_present':
        return 'bg-vitalis-navy text-white';
      case 'low':
        return 'bg-emerald-500 text-white';
      case 'insufficient_data':
      default:
        return 'bg-slate-300 text-slate-700';
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-vitalis-muted">
        Loading organ telemetry...
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div className="p-8 text-center text-vitalis-muted">
        <p className="text-vitalis-critical">
          {error || 'Patient organ intelligence record could not be loaded.'}
        </p>
      </div>
    );
  }

  const organs = currentAnchor?.organs;

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="bg-card rounded-lg border border-vitalis-border p-5 shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-vitalis-navy flex items-center gap-2">
            <Activity className="w-5 h-5 text-vitalis-blue" />
            <span>{language === 'hi' ? 'अंग-विशिष्ट प्रज्ञा प्रणाली' : 'Organ System Intelligence'}</span>
          </h1>
          <p className="text-xs text-vitalis-muted mt-0.5">
            Individual organ failure trajectories, dynamic z-scores &amp; personal baseline calibration
          </p>
        </div>

        {/* Patient & Anchor Selector */}
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
                  Hour {anc.hour}h
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Cross-Organ Status Summary Banner */}
      {organs && (
        <div className="bg-card rounded-lg border border-vitalis-border p-3.5 shadow-subtle flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs font-bold text-vitalis-navy uppercase tracking-wider">
            Cross-Organ Telemetry (Anchor {currentAnchor?.hour}h):
          </span>
          <div className="flex flex-wrap items-center gap-4">
            {(
              [
                { key: 'renal', tab: 'renal', label: 'Renal', letter: 'R' },
                { key: 'hepatic', tab: 'hepatic', label: 'Hepatic', letter: 'H' },
                { key: 'cardio', tab: 'cardiac', label: 'Cardiovascular', letter: 'C' },
                { key: 'resp', tab: 'respiratory', label: 'Respiratory', letter: 'P' },
              ] as const
            ).map((item) => {
              const o = organs[item.key];
              const isSelected = selectedOrganTab === item.tab;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setSelectedOrganTab(item.tab)}
                  className={cn(
                    'flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs transition-all',
                    isSelected
                      ? 'bg-sky-50 border-vitalis-blue shadow-subtle'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                  )}
                >
                  <span
                    className={cn(
                      'w-5 h-5 rounded flex items-center justify-center font-bold text-[10px]',
                      organDotColor(o?.status)
                    )}
                  >
                    {item.letter}
                  </span>
                  <span className="font-semibold text-slate-800">{item.label}</span>
                  <span className="font-mono text-slate-600">
                    {formatRiskPercent(o?.risk)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Organ Navigation Tabs */}
      <div className="flex border-b border-vitalis-border">
        <button
          onClick={() => setSelectedOrganTab('renal')}
          className={cn(
            'flex items-center gap-2 py-3 px-6 text-xs font-bold uppercase tracking-wider border-b-2 transition-all',
            selectedOrganTab === 'renal'
              ? 'border-vitalis-blue text-vitalis-blue bg-card'
              : 'border-transparent text-vitalis-muted hover:text-vitalis-text'
          )}
        >
          <Droplets className="w-4 h-4" />
          Renal Intelligence
        </button>
        <button
          onClick={() => setSelectedOrganTab('hepatic')}
          className={cn(
            'flex items-center gap-2 py-3 px-6 text-xs font-bold uppercase tracking-wider border-b-2 transition-all',
            selectedOrganTab === 'hepatic'
              ? 'border-vitalis-blue text-vitalis-blue bg-card'
              : 'border-transparent text-vitalis-muted hover:text-vitalis-text'
          )}
        >
          <Activity className="w-4 h-4 text-amber-600" />
          Hepatic Intelligence
        </button>
        <button
          onClick={() => setSelectedOrganTab('cardiac')}
          className={cn(
            'flex items-center gap-2 py-3 px-6 text-xs font-bold uppercase tracking-wider border-b-2 transition-all',
            selectedOrganTab === 'cardiac'
              ? 'border-vitalis-blue text-vitalis-blue bg-card'
              : 'border-transparent text-vitalis-muted hover:text-vitalis-text'
          )}
        >
          <Heart className="w-4 h-4 text-vitalis-critical" />
          Cardiovascular Intelligence
        </button>
        <button
          onClick={() => setSelectedOrganTab('respiratory')}
          className={cn(
            'flex items-center gap-2 py-3 px-6 text-xs font-bold uppercase tracking-wider border-b-2 transition-all',
            selectedOrganTab === 'respiratory'
              ? 'border-vitalis-blue text-vitalis-blue bg-card'
              : 'border-transparent text-vitalis-muted hover:text-vitalis-text'
          )}
        >
          <Wind className="w-4 h-4 text-vitalis-teal" />
          Respiratory Intelligence
        </button>
      </div>

      {/* Active Organ Detail Cards & Trend Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Active Organ Metrics Card (1 Col) */}
        <div className="bg-card rounded-lg border border-vitalis-border p-5 shadow-subtle space-y-4">
          <div className="flex items-center justify-between border-b border-vitalis-border pb-2.5">
            <span className="text-xs font-bold uppercase tracking-wider text-vitalis-text">
              Organ Status @ Anchor {currentAnchor?.hour}h
            </span>
            {getOrganStatusBadge(activeOrganData?.status)}
          </div>

          <div className="space-y-3">
            <div className="bg-slate-50 border border-vitalis-border rounded-lg p-3 space-y-1">
              <span className="text-[10px] text-vitalis-muted uppercase tracking-wider font-semibold block">
                Modelled Risk Score
              </span>
              <div className="text-2xl font-bold font-mono text-vitalis-navy">
                {formatRiskPercent(activeOrganData?.risk)}
              </div>
              {activeOrganData?.threshold !== undefined && (
                <span className="text-[10px] text-vitalis-muted block">
                  Escalation threshold: {(activeOrganData.threshold * 100).toFixed(0)}%
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-slate-50 border border-vitalis-border rounded p-2.5">
                <span className="text-[10px] text-vitalis-muted uppercase tracking-wider block">
                  Z-Score
                </span>
                <span className="font-mono font-bold text-slate-800 text-sm">
                  {activeOrganData?.z_score !== null && activeOrganData?.z_score !== undefined
                    ? activeOrganData.z_score.toFixed(2)
                    : '--'}
                </span>
              </div>
              <div className="bg-slate-50 border border-vitalis-border rounded p-2.5">
                <span className="text-[10px] text-vitalis-muted uppercase tracking-wider block">
                  Baseline Divergence
                </span>
                <span className="font-semibold text-slate-800 text-sm">
                  {activeOrganData?.change_flag ? 'Flagged' : 'Stable'}
                </span>
              </div>
            </div>

            {activeOrganData?.not_applicable_reason && (
              <div className="p-2.5 rounded bg-amber-50 border border-amber-200 text-[11px] text-amber-900">
                <strong>Status Reason:</strong>{' '}
                {formatNotApplicableReason(activeOrganData.not_applicable_reason)}
              </div>
            )}
          </div>

          <div className="p-3 rounded-lg bg-amber-50/60 border border-amber-200 text-[10px] text-amber-800 leading-relaxed">
            <strong>Clinical Safety:</strong> {RISK_DISCLAIMER_CAPTION}
          </div>
        </div>

        {/* Right: Organ Longitudinal Parameter Charts (2 Cols) */}
        <div className="lg:col-span-2 bg-card rounded-lg border border-vitalis-border p-5 shadow-subtle space-y-4">
          <div className="flex items-center justify-between border-b border-vitalis-border pb-2.5">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-vitalis-text">
                {selectedOrganTab.toUpperCase()} Continuous Telemetry &amp; Baselines
              </h3>
              <p className="text-[11px] text-vitalis-muted mt-0.5">
                Dashed gray line: personal baseline • Vertical red line: active anchor ({selectedAnchorHour}h)
              </p>
            </div>
          </div>

          {/* Chart Display */}
          <div className="h-72 w-full">
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
                  }}
                  formatter={(val: any, name: string) => [
                    typeof val === 'number' ? val.toFixed(2) : '--',
                    name,
                  ]}
                  labelFormatter={(h) => `Hour ${h}h`}
                />

                <ReferenceLine
                  x={selectedAnchorHour}
                  stroke="#DC2626"
                  strokeDasharray="3 3"
                  label={{ value: `Anchor ${selectedAnchorHour}h`, fill: '#DC2626', fontSize: 10 }}
                />

                {/* Renal Charts */}
                {selectedOrganTab === 'renal' && (
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

                {/* Hepatic Charts */}
                {selectedOrganTab === 'hepatic' && (
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
                      name="Bilirubin Total (mg/dL)"
                      connectNulls
                    />
                    <Line
                      type="monotone"
                      dataKey="Platelets"
                      stroke="#0D9488"
                      strokeWidth={1.5}
                      dot={{ r: 2.5, fill: '#0D9488' }}
                      name="Platelets (10³/µL)"
                      connectNulls
                    />
                  </>
                )}

                {/* Cardiac Charts */}
                {selectedOrganTab === 'cardiac' && (
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

                {/* Respiratory Charts */}
                {selectedOrganTab === 'respiratory' && (
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
                    <Line
                      type="monotone"
                      dataKey="FiO2"
                      stroke="#D97706"
                      strokeWidth={1.5}
                      dot={false}
                      name="FiO2"
                      connectNulls
                    />
                  </>
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
