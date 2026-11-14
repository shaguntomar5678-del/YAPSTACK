import React, { useState, useMemo } from 'react';
import {
  Users,
  AlertTriangle,
  GitMerge,
  ShieldAlert,
  Search,
  Filter,
  ArrowRight,
  Clock,
  Layers,
  Activity,
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { Badge } from '../../common/Badge';
import { formatRiskCaption, RISK_DISCLAIMER_CAPTION } from '../../../utils/formatters';
import { cn } from '../../../utils/cn';

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

  const [filterType, setFilterType] = useState<'all' | 'elevated' | 'trust'>('all');

  // KPI calculations directly from JSON summaries
  const kpis = useMemo(() => {
    if (!patients || patients.length === 0) {
      return { monitored: 0, requiringReview: 0, multiOrgan: 0, dataQualityIssues: 0 };
    }
    const monitored = patients.length;
    const requiringReview = patients.filter((p) => p.elevated).length;
    const multiOrgan = patients.filter((p) => {
      const activeOrgans = Object.values(p.organs || {}).filter(
        (o) => o.status === 'elevated' || o.status === 'dysfunction_present'
      );
      return activeOrgans.length >= 2;
    }).length;
    const dataQualityIssues = patients.filter(
      (p) => p.trust === 'low' || p.trust === 'insufficient'
    ).length;

    return { monitored, requiringReview, multiOrgan, dataQualityIssues };
  }, [patients]);

  // Filtered patients
  const filteredPatients = useMemo(() => {
    if (!patients) return [];
    return patients.filter((p) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matches =
          (p.name && p.name.toLowerCase().includes(q)) ||
          p.id.toLowerCase().includes(q) ||
          (p.bed && p.bed.toLowerCase().includes(q)) ||
          (p.note && p.note.toLowerCase().includes(q)) ||
          (p.top_reason && p.top_reason.toLowerCase().includes(q));
        if (!matches) return false;
      }
      if (filterType === 'elevated' && !p.elevated) return false;
      if (filterType === 'trust' && p.trust !== 'low' && p.trust !== 'insufficient') return false;
      return true;
    });
  }, [patients, searchQuery, filterType]);

  // Recent deterioration events from patient records
  const deteriorationFeed = useMemo(() => {
    if (!patients) return [];
    return patients
      .filter((p) => p.elevated || p.first_change)
      .sort((a, b) => (b.first_change?.hour ?? 0) - (a.first_change?.hour ?? 0))
      .slice(0, 5);
  }, [patients]);

  const organDotColor = (status?: string) => {
    switch (status) {
      case 'elevated':
        return 'bg-vitalis-critical text-white border-vitalis-critical';
      case 'dysfunction_present':
        return 'bg-vitalis-navy text-white border-vitalis-navy';
      case 'low':
        return 'bg-emerald-500 text-white border-emerald-600';
      case 'insufficient_data':
      default:
        return 'bg-slate-300 text-slate-700 border-slate-400';
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-vitalis-text flex items-center gap-2">
            <span>{t.commandCenter.title}</span>
            <span className="text-xs bg-vitalis-navy/10 text-vitalis-navy font-semibold px-2 py-0.5 rounded">
              {language === 'hi' ? 'गहन निगरानी' : 'Continuous Surveillance'}
            </span>
          </h1>
          <p className="text-xs text-vitalis-muted mt-0.5">
            {t.commandCenter.subtitle}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md shadow-subtle">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            {t.commandCenter.telemetryCycle}
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Monitored Patients */}
        <div className="bg-card rounded-lg border border-vitalis-border p-3.5 shadow-subtle">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-vitalis-muted uppercase tracking-wider">
              {t.commandCenter.kpiMonitored}
            </span>
            <Users className="w-4 h-4 text-vitalis-navy/70" />
          </div>
          <div className="text-2xl font-bold font-mono text-vitalis-text">
            {kpis.monitored}
          </div>
          <div className="text-[11px] text-vitalis-muted mt-1 border-t border-vitalis-border/40 pt-1.5">
            {t.commandCenter.kpiMonitoredSub}
          </div>
        </div>

        {/* Patients Requiring Review */}
        <div className="bg-card rounded-lg border border-vitalis-border p-3.5 shadow-subtle">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-vitalis-warning uppercase tracking-wider">
              {t.commandCenter.kpiReview}
            </span>
            <AlertTriangle className="w-4 h-4 text-vitalis-warning" />
          </div>
          <div className="text-2xl font-bold font-mono text-vitalis-warning">
            {kpis.requiringReview}
          </div>
          <div className="text-[11px] text-vitalis-muted mt-1 border-t border-vitalis-border/40 pt-1.5">
            {t.commandCenter.kpiReviewSub}
          </div>
        </div>

        {/* Multi-Organ Patterns */}
        <div className="bg-card rounded-lg border border-vitalis-border p-3.5 shadow-subtle">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-vitalis-navy uppercase tracking-wider">
              {t.commandCenter.kpiPatterns}
            </span>
            <GitMerge className="w-4 h-4 text-vitalis-navy/70" />
          </div>
          <div className="text-2xl font-bold font-mono text-vitalis-navy">
            {kpis.multiOrgan}
          </div>
          <div className="text-[11px] text-vitalis-muted mt-1 border-t border-vitalis-border/40 pt-1.5">
            {t.commandCenter.kpiPatternsSub}
          </div>
        </div>

        {/* Data Quality Issues */}
        <div className="bg-card rounded-lg border border-vitalis-border p-3.5 shadow-subtle">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-vitalis-critical uppercase tracking-wider">
              {t.commandCenter.kpiTrust}
            </span>
            <ShieldAlert className="w-4 h-4 text-vitalis-critical/80" />
          </div>
          <div className="text-2xl font-bold font-mono text-vitalis-critical">
            {kpis.dataQualityIssues}
          </div>
          <div className="text-[11px] text-vitalis-muted mt-1 border-t border-vitalis-border/40 pt-1.5">
            {t.commandCenter.kpiTrustSub}
          </div>
        </div>
      </div>

      {/* Main Grid: Patient Priority Table & Deterioration Events */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Patient Table - 3 Cols */}
        <div className="lg:col-span-3 bg-card rounded-lg border border-vitalis-border shadow-subtle overflow-hidden">
          {/* Controls Bar */}
          <div className="p-4 border-b border-vitalis-border flex flex-wrap items-center justify-between gap-3 bg-slate-50/50">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-vitalis-text uppercase tracking-wider">
                {language === 'hi' ? 'रोगी प्राथमिकता सूची' : 'Patient Priority Roster'}
              </span>
              <span className="text-xs text-vitalis-muted">
                ({filteredPatients.length} {t.commandCenter.patients})
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center bg-white border border-vitalis-border rounded-md p-0.5 text-xs">
                <button
                  onClick={() => setFilterType('all')}
                  className={cn(
                    'px-2.5 py-1 rounded transition-colors',
                    filterType === 'all'
                      ? 'bg-vitalis-navy text-white font-semibold'
                      : 'text-vitalis-muted hover:text-vitalis-text'
                  )}
                >
                  {language === 'hi' ? 'सभी रोगी' : 'All'}
                </button>
                <button
                  onClick={() => setFilterType('elevated')}
                  className={cn(
                    'px-2.5 py-1 rounded transition-colors',
                    filterType === 'elevated'
                      ? 'bg-vitalis-warning text-white font-semibold'
                      : 'text-vitalis-muted hover:text-vitalis-text'
                  )}
                >
                  {language === 'hi' ? 'समीक्षा आवश्यक' : 'Review Required'}
                </button>
                <button
                  onClick={() => setFilterType('trust')}
                  className={cn(
                    'px-2.5 py-1 rounded transition-colors',
                    filterType === 'trust'
                      ? 'bg-vitalis-critical text-white font-semibold'
                      : 'text-vitalis-muted hover:text-vitalis-text'
                  )}
                >
                  {language === 'hi' ? 'डेटा गुणवत्ता' : 'Data Flags'}
                </button>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-vitalis-border bg-slate-50/80 text-[11px] font-semibold text-vitalis-muted uppercase tracking-wider">
                  <th className="py-2.5 px-3">{t.commandCenter.thPatientBed}</th>
                  <th className="py-2.5 px-3">Trust</th>
                  <th className="py-2.5 px-3">{t.commandCenter.thRiskScore}</th>
                  <th className="py-2.5 px-3">{t.commandCenter.thOrgans}</th>
                  <th className="py-2.5 px-3">First Change</th>
                  <th className="py-2.5 px-3">Top Deterioration Factor</th>
                  <th className="py-2.5 px-3 text-right">{t.commandCenter.thAction}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-vitalis-border">
                {filteredPatients.map((patient) => {
                  const organs = patient.organs || {};
                  return (
                    <tr
                      key={patient.id}
                      onClick={() => navigateToPatient(patient.id, 'patient-360')}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    >
                      {/* Patient & Bed */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-vitalis-navy font-mono text-xs">
                            {patient.id}
                          </span>
                          <span className="font-semibold text-vitalis-text text-xs">
                            {patient.name}
                          </span>
                          <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono">
                            {patient.bed}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[10px] text-vitalis-muted">
                            {patient.gender === 1 ? 'Male' : 'Female'}, {patient.age}y
                          </span>
                          <span>•</span>
                          <span className="text-[10px] text-slate-500 italic">
                            Simulated patient
                          </span>
                        </div>
                      </td>

                      {/* Trust */}
                      <td className="py-3 px-3">
                        <Badge
                          variant={getTrustBadgeVariant(patient.trust)}
                          size="xs"
                          className="capitalize font-mono"
                        >
                          {patient.trust}
                        </Badge>
                      </td>

                      {/* Risk Score */}
                      <td className="py-3 px-3">
                        <div className="flex flex-col">
                          <span
                            className={cn(
                              'font-mono text-xs font-bold',
                              patient.display_overall === 'shown'
                                ? patient.elevated
                                  ? 'text-vitalis-critical'
                                  : 'text-vitalis-text'
                                : patient.display_overall === 'not_applicable'
                                ? 'text-amber-700 text-[11px]'
                                : 'text-slate-500 text-[11px]'
                            )}
                          >
                            {formatRiskCaption(patient.display_overall, patient.risk_overall, patient.trust)}
                          </span>
                          <span className="text-[10px] text-vitalis-muted">
                            12h horizon
                          </span>
                        </div>
                      </td>

                      {/* Organ Indicators: Renal, Hepatic, Cardio, Resp */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1">
                          {(['renal', 'hepatic', 'cardio', 'resp'] as const).map((orgKey) => {
                            const org = organs[orgKey];
                            const letterMap: Record<string, string> = {
                              renal: 'R',
                              hepatic: 'H',
                              cardio: 'C',
                              resp: 'P',
                            };
                            return (
                              <span
                                key={orgKey}
                                className={cn(
                                  'w-5 h-5 rounded flex items-center justify-center font-bold text-[10px] border shadow-xs',
                                  organDotColor(org?.status)
                                )}
                                title={`${orgKey.toUpperCase()}: ${org?.status || 'normal'}`}
                              >
                                {letterMap[orgKey]}
                              </span>
                            );
                          })}
                        </div>
                      </td>

                      {/* First Change */}
                      <td className="py-3 px-3">
                        {patient.first_change ? (
                          <div className="flex items-center gap-1 text-[11px]">
                            <span className="font-semibold text-vitalis-navy uppercase">
                              {patient.first_change.organ}
                            </span>
                            <span className="text-vitalis-muted">@</span>
                            <span className="font-mono text-slate-700 font-bold">
                              {patient.first_change.hour}h
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400 font-mono text-[11px]">—</span>
                        )}
                      </td>

                      {/* Top Reason */}
                      <td className="py-3 px-3 max-w-xs">
                        <span className="text-[11px] text-vitalis-text line-clamp-1" title={patient.top_reason ?? ''}>
                          {patient.top_reason || '—'}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="py-3 px-3 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigateToPatient(patient.id, 'patient-360');
                          }}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-vitalis-blue hover:text-vitalis-navy hover:underline group-hover:translate-x-0.5 transition-transform"
                        >
                          <span>{t.commandCenter.view360}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}

                {filteredPatients.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-vitalis-muted text-xs">
                      {loadingPatients
                        ? 'Loading patient cohort...'
                        : t.commandCenter.noPatientsMatch}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Live Feed / Recent Deteriorations Panel - 1 Col */}
        <div className="bg-card rounded-lg border border-vitalis-border p-4 shadow-subtle space-y-4">
          <div className="flex items-center justify-between border-b border-vitalis-border pb-2.5">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-vitalis-navy" />
              <span className="text-xs font-bold text-vitalis-text uppercase tracking-wider">
                {t.commandCenter.deteriorationEvents}
              </span>
            </div>
            <span className="text-[10px] text-vitalis-muted font-mono">
              {t.commandCenter.liveFeed}
            </span>
          </div>

          <div className="space-y-3">
            {deteriorationFeed.map((pat) => (
              <div
                key={pat.id}
                onClick={() => navigateToPatient(pat.id, 'patient-360')}
                className="p-3 rounded-lg border border-vitalis-border bg-slate-50/50 hover:bg-slate-100 hover:border-vitalis-blue transition-all cursor-pointer space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-vitalis-navy font-mono text-xs">
                      {pat.id}
                    </span>
                    <span className="text-xs font-semibold text-vitalis-text">
                      {pat.name}
                    </span>
                  </div>
                  {pat.elevated && (
                    <Badge variant="warning" size="xs">
                      Review
                    </Badge>
                  )}
                </div>

                <div className="text-[11px] text-slate-700 leading-snug">
                  {pat.top_reason || 'Multi-organ divergence observed'}
                </div>

                <div className="flex items-center justify-between text-[10px] text-vitalis-muted pt-1 border-t border-slate-200">
                  <span>
                    {pat.first_change
                      ? `Initial: ${pat.first_change.organ.toUpperCase()} @ ${pat.first_change.hour}h`
                      : 'Baseline continuous'}
                  </span>
                  <span className="font-mono text-vitalis-navy font-semibold flex items-center gap-0.5">
                    360° <ArrowRight className="w-2.5 h-2.5" />
                  </span>
                </div>
              </div>
            ))}

            {deteriorationFeed.length === 0 && (
              <div className="py-6 text-center text-xs text-vitalis-muted">
                {language === 'hi' ? 'कोई तीव्र घटना नहीं दर्ज' : 'No acute events active.'}
              </div>
            )}
          </div>

          <div className="p-2.5 rounded bg-amber-50/60 border border-amber-200 text-[10px] text-amber-800 leading-relaxed">
            <strong>Clinical Safety Notice:</strong> {RISK_DISCLAIMER_CAPTION}
          </div>
        </div>
      </div>
    </div>
  );
};
