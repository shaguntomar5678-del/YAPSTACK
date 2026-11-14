import React, { useMemo } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  Clock,
  Activity,
  Server,
  CheckCircle2,
  XCircle,
  Database,
  ChevronDown,
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { usePatient } from '../../../lib/hooks';
import { Badge } from '../../common/Badge';
import { cn } from '../../../utils/cn';
import { RISK_DISCLAIMER_CAPTION } from '../../../utils/formatters';

export const DataTrust: React.FC = () => {
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

  const trust = currentAnchor?.trust;

  // Compute parameter availability within ±8 hours of active anchor
  const parameterAvailability = useMemo(() => {
    if (!patient?.series) return [];
    const anchorH = currentAnchor?.hour ?? 92;

    return Object.entries(patient.series).map(([key, pts]) => {
      // Find closest point to anchorH
      let closestDist = Infinity;
      let closestHour = -1;
      let hasRecent = false;

      pts.forEach(([h, val]) => {
        if (val !== null) {
          const dist = Math.abs(h - anchorH);
          if (dist <= 8) {
            hasRecent = true;
          }
          if (dist < closestDist) {
            closestDist = dist;
            closestHour = h;
          }
        }
      });

      return {
        parameter: key,
        available: hasRecent,
        lastObservedHour: closestHour >= 0 ? closestHour : null,
        distanceFromAnchor: closestHour >= 0 ? closestDist : null,
        totalMeasurements: pts.length,
      };
    });
  }, [patient?.series, currentAnchor?.hour]);

  const getTrustBadgeVariant = (level?: string): 'teal' | 'navy' | 'warning' | 'critical' => {
    switch (level) {
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

  if (loading) {
    return (
      <div className="p-8 text-center text-vitalis-muted">
        Loading data quality audit...
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div className="p-8 text-center text-vitalis-muted">
        <p className="text-vitalis-critical">
          {error || 'Patient data quality record could not be loaded.'}
        </p>
      </div>
    );
  }

  const td = t.dataTrust;

  return (
    <div className="space-y-6">
      {/* Header & Selectors */}
      <div className="bg-card rounded-lg border border-vitalis-border p-5 shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-vitalis-navy flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-vitalis-teal" />
              <span>{td.title}</span>
            </h1>
            <Badge variant={getTrustBadgeVariant(trust?.level)} size="xs" className="capitalize">
              Trust Level: {trust?.level ?? 'Unknown'}
            </Badge>
          </div>
          <p className="text-xs text-vitalis-muted mt-0.5">
            {td.subtitle} • {patientSummary?.name ?? patient.id} ({patientSummary?.bed ?? 'ICU'})
          </p>
        </div>

        {/* Patient & Anchor Selectors */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Patient Selector */}
          <div className="relative">
            <select
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
              className="appearance-none bg-slate-50 border border-vitalis-border rounded-lg pl-3 pr-8 py-1.5 text-xs font-semibold text-vitalis-navy focus:outline-none focus:border-vitalis-blue cursor-pointer"
            >
              {patients.map((pat) => (
                <option key={pat.id} value={pat.id}>
                  {pat.id} — {pat.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-vitalis-muted absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Anchor Selector */}
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

      {/* KPI Cards: Completeness, Consistency, Baseline Availability */}
      {trust && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Completeness */}
          <div className="bg-card rounded-lg border border-vitalis-border p-4 shadow-subtle space-y-2">
            <div className="flex items-center justify-between text-xs text-vitalis-muted uppercase tracking-wider font-semibold">
              <span>{td.completenessRate}</span>
              <Database className="w-4 h-4 text-vitalis-teal" />
            </div>
            <div className="text-2xl font-bold font-mono text-vitalis-text">
              {(trust.completeness * 100).toFixed(0)}%
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-vitalis-teal h-full rounded-full"
                style={{ width: `${Math.min(100, trust.completeness * 100)}%` }}
              />
            </div>
            <p className="text-[10px] text-vitalis-muted">
              Telemetry capture rate within sampling window
            </p>
          </div>

          {/* Consistency */}
          <div className="bg-card rounded-lg border border-vitalis-border p-4 shadow-subtle space-y-2">
            <div className="flex items-center justify-between text-xs text-vitalis-muted uppercase tracking-wider font-semibold">
              <span>{td.consistency}</span>
              <Activity className="w-4 h-4 text-vitalis-blue" />
            </div>
            <div className="text-2xl font-bold font-mono text-vitalis-text">
              {(trust.consistency * 100).toFixed(0)}%
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-vitalis-blue h-full rounded-full"
                style={{ width: `${Math.min(100, trust.consistency * 100)}%` }}
              />
            </div>
            <p className="text-[10px] text-vitalis-muted">
              Sensor stability and cross-parameter agreement
            </p>
          </div>

          {/* Baseline Availability */}
          <div className="bg-card rounded-lg border border-vitalis-border p-4 shadow-subtle space-y-2">
            <div className="flex items-center justify-between text-xs text-vitalis-muted uppercase tracking-wider font-semibold">
              <span>{td.baselineIntegrity}</span>
              <Server className="w-4 h-4 text-vitalis-navy" />
            </div>
            <div className="text-2xl font-bold font-mono text-vitalis-text">
              {typeof trust.baseline_availability === 'number'
                ? `${(trust.baseline_availability * 100).toFixed(0)}%`
                : trust.baseline_availability ? '100%' : '0%'}
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-vitalis-navy h-full rounded-full"
                style={{
                  width: `${
                    typeof trust.baseline_availability === 'number'
                      ? Math.min(100, trust.baseline_availability * 100)
                      : trust.baseline_availability ? 100 : 0
                  }%`,
                }}
              />
            </div>
            <p className="text-[10px] text-vitalis-muted">
              Historical baseline coverage available for deviation calculations
            </p>
          </div>
        </div>
      )}

      {/* Audit Notifications & Series Availability Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Audit Reasons / Notifications (1 Col) */}
        <div className="bg-card rounded-lg border border-vitalis-border p-5 shadow-subtle space-y-4">
          <div className="flex items-center gap-2 border-b border-vitalis-border pb-2.5">
            <AlertTriangle className="w-4 h-4 text-vitalis-warning" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-vitalis-text">
              Quality Audit Findings
            </h3>
          </div>

          <div className="space-y-2.5 text-xs">
            {trust?.reasons && trust.reasons.length > 0 ? (
              trust.reasons.map((reason, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg border border-amber-200 bg-amber-50/70 text-amber-900 space-y-1"
                >
                  <div className="font-semibold flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    <span>Telemetry Flag #{idx + 1}</span>
                  </div>
                  <p className="text-[11px] text-amber-800 leading-snug">
                    {reason}
                  </p>
                </div>
              ))
            ) : (
              <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-center space-y-1">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 mx-auto" />
                <div className="font-semibold text-xs">
                  Optimal Telemetry Quality
                </div>
                <p className="text-[11px] text-emerald-700">
                  No missing measurements, sensor dropouts, or calibration flags reported at anchor {currentAnchor?.hour}h.
                </p>
              </div>
            )}
          </div>

          {/* Model Safety Notice */}
          <div className="p-3 rounded-lg bg-slate-50 border border-vitalis-border text-[10px] text-vitalis-muted leading-relaxed">
            <strong>Data Integrity Policy:</strong> When data quality is insufficient, downstream predictive models automatically withhold numeric risk estimates and display &ldquo;Insufficient data&rdquo;.
          </div>
        </div>

        {/* Right: Parameter Telemetry Availability Grid (2 Cols) */}
        <div className="lg:col-span-2 bg-card rounded-lg border border-vitalis-border p-5 shadow-subtle space-y-4">
          <div className="flex items-center justify-between border-b border-vitalis-border pb-2.5">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-vitalis-text">
                Continuous Telemetry &amp; Lab Sampling Window
              </h3>
              <p className="text-[11px] text-vitalis-muted mt-0.5">
                Evaluation window: ±8 hours from active anchor ({currentAnchor?.hour}h)
              </p>
            </div>
            <span className="text-[11px] font-mono text-vitalis-navy font-semibold">
              {parameterAvailability.filter((p) => p.available).length} / {parameterAvailability.length} Active
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-vitalis-border bg-slate-50/80 text-[11px] font-semibold text-vitalis-muted uppercase tracking-wider">
                  <th className="py-2.5 px-3">Parameter</th>
                  <th className="py-2.5 px-3">Window Status (±8h)</th>
                  <th className="py-2.5 px-3">Closest Observation</th>
                  <th className="py-2.5 px-3">Total Series Samples</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-vitalis-border">
                {parameterAvailability.map((row) => (
                  <tr key={row.parameter} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-2.5 px-3 font-semibold text-vitalis-text">
                      {row.parameter}
                    </td>
                    <td className="py-2.5 px-3">
                      {row.available ? (
                        <span className="inline-flex items-center gap-1.5 text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded text-[11px] font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          Within Window
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded text-[11px] font-medium">
                          <XCircle className="w-3.5 h-3.5 text-amber-600" />
                          Missing in Window
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-slate-700">
                      {row.lastObservedHour !== null ? (
                        <span>
                          {row.lastObservedHour}h{' '}
                          <span className="text-vitalis-muted">
                            ({row.distanceFromAnchor}h from anchor)
                          </span>
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-slate-700">
                      {row.totalMeasurements}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
