import React, { useState, useMemo } from 'react';
import {
  Users,
  AlertTriangle,
  GitMerge,
  ShieldAlert,
  Search,
  ArrowRight,
  Clock,
  Activity,
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { PatientSummary } from '../../../lib/schemas';
import { Badge } from '../../common/Badge';
import { cn } from '../../../utils/cn';

// ─── Helpers ────────────────────────────────────────────────────────────────

const ORGAN_KEYS: Array<keyof PatientSummary['organs']> = [
  'renal',
  'hepatic',
  'cardio',
  'resp',
];

const ORGAN_LABELS: Record<string, string> = {
  renal: 'R',
  hepatic: 'H',
  cardio: 'C',
  resp: 'P',
};

function organDotClass(status: string): string {
  switch (status) {
    case 'elevated':
      return 'bg-amber-400 border-amber-500';
    case 'dysfunction_present':
      return 'bg-red-500 border-red-600';
    case 'low':
      return 'bg-emerald-500 border-emerald-600';
    case 'insufficient_data':
    default:
      return 'bg-slate-300 border-slate-400';
  }
}

function trustBadgeClass(trust: string): string {
  switch (trust) {
    case 'high':
      return 'bg-teal-50 text-teal-800 border-teal-200';
    case 'moderate':
      return 'bg-blue-50 text-blue-800 border-blue-200';
    case 'medium':
      return 'bg-yellow-50 text-yellow-800 border-yellow-200';
    case 'low':
      return 'bg-amber-50 text-amber-800 border-amber-200';
    case 'insufficient':
    default:
      return 'bg-red-50 text-red-800 border-red-200';
  }
}

function isMultiOrgan(p: PatientSummary): boolean {
  return (
    Object.values(p.organs).filter(
      (o) => o.status === 'elevated' || o.status === 'dysfunction_present'
    ).length >= 2
  );
}

// ─── Component ──────────────────────────────────────────────────────────────

export const CommandCenter: React.FC = () => {
  const {
    patients,
    loadingPatients,
    searchQuery,
    setSearchQuery,
    navigateToPatient,
    language,
    t,
  } = useApp();

  const [elevatedOnly, setElevatedOnly] = useState<boolean>(false);
  const [multiOrganOnly, setMultiOrganOnly] = useState<boolean>(false);

  // ─── KPI values ───────────────────────────────────────────────────────────
  const kpiMonitored = patients.length;
  const kpiReview = useMemo(
    () => patients.filter((p) => p.elevated).length,
    [patients]
  );
  const kpiMultiOrgan = useMemo(
    () => patients.filter(isMultiOrgan).length,
    [patients]
  );
  const kpiDataQuality = useMemo(
    () =>
      patients.filter(
        (p) => p.trust === 'low' || p.trust === 'insufficient'
      ).length,
    [patients]
  );

  // ─── Filtered + sorted patient list ───────────────────────────────────────
  const filteredPatients = useMemo(() => {
    return patients
      .filter((p) => {
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          const matches =
            p.id.toLowerCase().includes(q) ||
            (p.note ?? '').toLowerCase().includes(q);
          if (!matches) return false;
        }
        if (elevatedOnly && !p.elevated) return false;
        if (multiOrganOnly && !isMultiOrgan(p)) return false;
        return true;
      })
      .sort((a, b) => {
        const ar = a.risk_overall ?? -1;
        const br = b.risk_overall ?? -1;
        return br - ar;
      });
  }, [patients, searchQuery, elevatedOnly, multiOrganOnly]);

  // ─── Deterioration timeline ────────────────────────────────────────────────
  const deteriorationPatients = useMemo(
    () =>
      patients
        .filter((p) => p.elevated)
        .sort((a, b) => (b.risk_overall ?? -1) - (a.risk_overall ?? -1)),
    [patients]
  );

  const tc = t.commandCenter;

  return (
    <div className="space-y-6">
      {/* Page Title & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-vitalis-navy">
            {tc.title}
          </h1>
          <p className="text-xs text-vitalis-muted mt-0.5">{tc.subtitle}</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-vitalis-muted">
          <Clock className="w-3.5 h-3.5" />
          <span>{tc.telemetryCycle}</span>
        </div>
      </div>

      {/* Top 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 – Monitored Patients */}
        <div className="bg-card rounded-lg border border-vitalis-border p-4 shadow-subtle">
          <div className="flex items-center justify-between text-vitalis-muted mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              {tc.kpiMonitored}
            </span>
            <Users className="w-4 h-4 text-vitalis-navy" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-vitalis-text font-mono">
              {loadingPatients ? '—' : kpiMonitored}
            </span>
            <span className="text-xs text-vitalis-muted">{tc.kpiMonitoredSub}</span>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-[11px] text-vitalis-muted">
            <span className="inline-block w-2 h-2 rounded-full bg-red-500" />{' '}
            {patients.filter((p) => p.elevated && (p.risk_overall ?? 0) >= 0.8).length}{' '}
            {language === 'hi' ? 'अति-गंभीर' : 'Critical'}
            <span className="text-slate-300">•</span>
            <span className="inline-block w-2 h-2 rounded-full bg-amber-500" />{' '}
            {patients.filter(
              (p) =>
                p.elevated &&
                (p.risk_overall ?? 0) >= 0.5 &&
                (p.risk_overall ?? 0) < 0.8
            ).length}{' '}
            {language === 'hi' ? 'गंभीर' : 'Elevated'}
            <span className="text-slate-300">•</span>
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />{' '}
            {patients.filter((p) => !p.elevated).length}{' '}
            {language === 'hi' ? 'स्थिर' : 'Stable'}
          </div>
        </div>

        {/* KPI 2 – Requiring Review */}
        <div className="bg-card rounded-lg border border-vitalis-border p-4 shadow-subtle border-l-4 border-l-vitalis-critical">
          <div className="flex items-center justify-between text-vitalis-muted mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-red-700">
              {tc.kpiReview}
            </span>
            <AlertTriangle className="w-4 h-4 text-vitalis-critical" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-vitalis-critical font-mono">
              {loadingPatients ? '—' : kpiReview}
            </span>
            <span className="text-xs text-vitalis-muted">{tc.kpiReviewSub}</span>
          </div>
          <div className="mt-3 text-[11px] text-red-700 font-medium">
            {language === 'hi'
              ? 'ऊंचे जोखिम वाले रोगी — चिकित्सक ध्यान आवश्यक'
              : 'Elevated-risk patients — physician attention required'}
          </div>
        </div>

        {/* KPI 3 – Multi-Organ Patterns */}
        <div className="bg-card rounded-lg border border-vitalis-border p-4 shadow-subtle border-l-4 border-l-vitalis-navy">
          <div className="flex items-center justify-between text-vitalis-muted mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-vitalis-navy">
              {tc.kpiPatterns}
            </span>
            <GitMerge className="w-4 h-4 text-vitalis-navy" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-vitalis-navy font-mono">
              {loadingPatients ? '—' : kpiMultiOrgan}
            </span>
            <span className="text-xs text-vitalis-muted">{tc.kpiPatternsSub}</span>
          </div>
          <div className="mt-3 text-[11px] text-vitalis-muted">
            {language === 'hi'
              ? '≥2 अंग-तंत्रों में बढ़ा हुआ या शिथिलता स्तर'
              : '≥2 organ systems at elevated or dysfunction status'}
          </div>
        </div>

        {/* KPI 4 – Data Quality Issues */}
        <div className="bg-card rounded-lg border border-vitalis-border p-4 shadow-subtle">
          <div className="flex items-center justify-between text-vitalis-muted mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              {tc.kpiTrust}
            </span>
            <ShieldAlert className="w-4 h-4 text-vitalis-warning" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-amber-700 font-mono">
              {loadingPatients ? '—' : kpiDataQuality}
            </span>
            <span className="text-xs text-vitalis-muted">{tc.kpiTrustSub}</span>
          </div>
          <div className="mt-3 text-[11px] text-vitalis-muted">
            {language === 'hi'
              ? 'निम्न या अपर्याप्त डेटा विश्वसनीयता'
              : 'Low or insufficient data trust level'}
          </div>
        </div>
      </div>

      {/* Main Grid: Priority Table & Deterioration Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left 3 Cols: Patient Priority Table */}
        <div className="lg:col-span-3 space-y-3">
          {/* Filter Bar */}
          <div className="bg-card rounded-lg border border-vitalis-border p-3 shadow-subtle flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-vitalis-muted" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={language === 'hi' ? 'ID या नोट खोजें…' : 'Search by ID or note…'}
                  className="pl-8 pr-3 py-1.5 bg-background border border-vitalis-border rounded-md text-xs text-vitalis-text focus:outline-none focus:border-vitalis-blue w-48"
                />
              </div>

              {/* Elevated Only Filter */}
              <button
                onClick={() => setElevatedOnly(!elevatedOnly)}
                className={cn(
                  'px-2.5 py-1.5 rounded-md text-xs font-medium border transition-colors',
                  elevatedOnly
                    ? 'bg-red-50 text-red-800 border-red-300'
                    : 'bg-background text-vitalis-muted border-vitalis-border hover:bg-slate-100'
                )}
              >
                {tc.requiresReviewOnly}
              </button>

              {/* Multi-Organ Filter */}
              <button
                onClick={() => setMultiOrganOnly(!multiOrganOnly)}
                className={cn(
                  'px-2.5 py-1.5 rounded-md text-xs font-medium border transition-colors',
                  multiOrganOnly
                    ? 'bg-sky-50 text-vitalis-navy border-sky-300'
                    : 'bg-background text-vitalis-muted border-vitalis-border hover:bg-slate-100'
                )}
              >
                {tc.multiOrganPatterns}
              </button>
            </div>

            <div className="text-xs text-vitalis-muted font-medium">
              {tc.showing}{' '}
              <span className="font-mono text-vitalis-text font-bold">
                {filteredPatients.length}
              </span>{' '}
              {tc.of} {patients.length} {tc.patients}
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-card rounded-lg border border-vitalis-border shadow-subtle overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-vitalis-border text-[11px] font-semibold text-vitalis-muted uppercase tracking-wider">
                    <th className="py-2.5 px-4">Patient / Note</th>
                    <th className="py-2.5 px-3">Trust</th>
                    <th className="py-2.5 px-3">
                      <div>{tc.thRiskScore}</div>
                      <div className="text-[9px] font-normal normal-case tracking-normal text-vitalis-muted mt-0.5">
                        12 h horizon · Calibrated model output on proxy label
                      </div>
                    </th>
                    <th className="py-2.5 px-3">
                      <span title="Renal, Hepatic, Cardio, Respiratory">
                        {tc.thOrgans}
                      </span>
                    </th>
                    <th className="py-2.5 px-3">First Change</th>
                    <th className="py-2.5 px-3">Top Reason</th>
                    <th className="py-2.5 px-4 text-right">{tc.thAction}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-vitalis-border/60 text-xs">
                  {filteredPatients.map((patient) => {
                    // Risk score display
                    let riskDisplay: React.ReactNode;
                    if (patient.display_overall === 'shown' && patient.risk_overall != null) {
                      const pct = (patient.risk_overall * 100).toFixed(1) + '%';
                      const riskVal = patient.risk_overall;
                      riskDisplay = (
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              'font-mono font-bold text-sm',
                              riskVal >= 0.8
                                ? 'text-vitalis-critical'
                                : riskVal >= 0.5
                                ? 'text-vitalis-warning'
                                : 'text-emerald-700'
                            )}
                          >
                            {pct}
                          </span>
                          <div className="w-14 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={cn(
                                'h-full rounded-full',
                                riskVal >= 0.8
                                  ? 'bg-vitalis-critical'
                                  : riskVal >= 0.5
                                  ? 'bg-vitalis-warning'
                                  : 'bg-emerald-500'
                              )}
                              style={{ width: `${riskVal * 100}%` }}
                            />
                          </div>
                        </div>
                      );
                    } else if (patient.display_overall === 'data_insufficient') {
                      riskDisplay = (
                        <span className="text-vitalis-muted italic">
                          Insufficient data
                        </span>
                      );
                    } else {
                      // not_applicable
                      riskDisplay = (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-orange-50 text-orange-700 border border-orange-200">
                          Dysfunction present
                        </span>
                      );
                    }

                    return (
                      <tr
                        key={patient.id}
                        onClick={() => navigateToPatient(patient.id, 'patient-360')}
                        className="hover:bg-slate-50/80 cursor-pointer transition-colors group"
                      >
                        {/* Patient ID + note */}
                        <td className="py-3 px-4">
                          <div className="font-semibold text-vitalis-navy group-hover:text-vitalis-blue transition-colors text-sm font-mono">
                            {patient.id}
                          </div>
                          {patient.note && (
                            <div className="text-[11px] text-vitalis-muted mt-0.5 truncate max-w-[180px]" title={patient.note}>
                              {patient.note}
                            </div>
                          )}
                          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                            <span className="text-[10px] text-vitalis-muted">
                              {patient.gender === 0 ? 'F' : 'M'}, {patient.age}y
                            </span>
                            {patient.source === 'synthetic' && (
                              <span className="text-[9px] text-vitalis-muted italic">
                                Simulated patient
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Trust badge */}
                        <td className="py-3 px-3">
                          <span
                            className={cn(
                              'inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold border capitalize',
                              trustBadgeClass(patient.trust)
                            )}
                          >
                            {patient.trust}
                          </span>
                        </td>

                        {/* Risk Score */}
                        <td className="py-3 px-3">{riskDisplay}</td>

                        {/* Organ dots */}
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-1">
                            {ORGAN_KEYS.map((organ) => {
                              const orgData = patient.organs[organ];
                              const status = orgData?.status ?? 'insufficient_data';
                              return (
                                <div
                                  key={organ}
                                  title={`${organ}: ${status}`}
                                  className={cn(
                                    'w-4 h-4 rounded-full border flex items-center justify-center',
                                    organDotClass(status)
                                  )}
                                >
                                  <span className="text-[8px] font-bold text-white leading-none">
                                    {ORGAN_LABELS[organ]}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </td>

                        {/* First Change */}
                        <td className="py-3 px-3 font-mono text-[11px] text-vitalis-text whitespace-nowrap">
                          {patient.first_change
                            ? `${patient.first_change.organ} h${patient.first_change.hour}`
                            : '—'}
                        </td>

                        {/* Top Reason */}
                        <td className="py-3 px-3 max-w-[160px]">
                          {patient.top_reason ? (
                            <div
                              className="truncate text-[11px] text-vitalis-muted"
                              title={patient.top_reason}
                            >
                              {patient.top_reason}
                            </div>
                          ) : (
                            <span className="text-[11px] text-slate-300">—</span>
                          )}
                        </td>

                        {/* Action */}
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigateToPatient(patient.id, 'patient-360');
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-vitalis-navy bg-vitalis-navy/5 hover:bg-vitalis-navy hover:text-white rounded border border-vitalis-navy/20 transition-all"
                          >
                            <span>{tc.view360}</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {filteredPatients.length === 0 && (
              <div className="p-8 text-center text-vitalis-muted">
                <Search className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                <p className="text-sm font-medium">{tc.noPatientsMatch}</p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setElevatedOnly(false);
                    setMultiOrganOnly(false);
                  }}
                  className="mt-2 text-xs text-vitalis-blue font-semibold hover:underline"
                >
                  {tc.resetFilters}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Col: Deterioration Timeline */}
        <div className="space-y-3">
          <div className="bg-card rounded-lg border border-vitalis-border p-3.5 shadow-subtle flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-vitalis-critical" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-vitalis-navy">
                {tc.deteriorationEvents}
              </h2>
            </div>
            <span className="text-[10px] bg-red-50 text-red-700 px-1.5 py-0.5 rounded font-semibold border border-red-200">
              {tc.liveFeed}
            </span>
          </div>

          <div className="bg-card rounded-lg border border-vitalis-border p-4 shadow-subtle space-y-4 max-h-[640px] overflow-y-auto">
            {deteriorationPatients.map((p) => (
              <div
                key={p.id}
                onClick={() => navigateToPatient(p.id, 'patient-360')}
                className="group cursor-pointer border-l-2 border-vitalis-critical pl-3 py-1 space-y-1.5 hover:bg-slate-50 rounded-r transition-colors"
              >
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-vitalis-navy group-hover:text-vitalis-blue text-xs font-mono">
                    {p.id}
                  </span>
                  {p.risk_overall != null && p.display_overall === 'shown' && (
                    <span className="font-mono text-[10px] text-vitalis-muted">
                      {(p.risk_overall * 100).toFixed(1)}%
                    </span>
                  )}
                </div>

                {p.note && (
                  <div className="text-[11px] text-slate-700 font-medium truncate">
                    {p.note}
                  </div>
                )}

                {p.top_reason && (
                  <p className="text-[11px] text-vitalis-muted leading-relaxed line-clamp-2">
                    {p.top_reason}
                  </p>
                )}

                {p.first_change && (
                  <div className="text-[10px] text-vitalis-muted font-mono">
                    First change: {p.first_change.organ} at h{p.first_change.hour}
                  </div>
                )}

                {p.source === 'synthetic' && (
                  <span className="text-[9px] text-vitalis-muted italic">
                    Simulated patient
                  </span>
                )}
              </div>
            ))}

            {deteriorationPatients.length === 0 && (
              <div className="py-6 text-center text-xs text-vitalis-muted">
                {language === 'hi'
                  ? 'वर्तमान अंतराल में कोई ऊंचे जोखिम वाले रोगी नहीं।'
                  : 'No elevated-risk patients in current window.'}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
