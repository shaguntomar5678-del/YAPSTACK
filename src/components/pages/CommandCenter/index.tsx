import React, { useState, useMemo, useEffect } from 'react';
import {
  Users,
  AlertTriangle,
  GitMerge,
  ShieldAlert,
  Search,
  Filter,
  ArrowRight,
  Clock,
  Activity,
  Layers,
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { patientService, HospitalKPIs } from '../../../services/patientService';
import { Badge } from '../../common/Badge';
import { OrganIndicator } from '../../common/OrganIndicator';
import { formatTimeOnly } from '../../../utils/formatters';
import { cn } from '../../../utils/cn';
import { DeteriorationEvent } from '../../../types/patient';

export const CommandCenter: React.FC = () => {
  const {
    patients,
    searchQuery,
    setSearchQuery,
    navigateToPatient,
    setSelectedOrganTab,
    language,
    t,
  } = useApp();

  const [kpis, setKpis] = useState<HospitalKPIs | null>(null);
  const [unitFilter, setUnitFilter] = useState<string>('All Units');
  const [acuityFilter, setAcuityFilter] = useState<string>('All Tiers');
  const [requiresReviewOnly, setRequiresReviewOnly] = useState<boolean>(false);
  const [multiOrganOnly, setMultiOrganOnly] = useState<boolean>(false);

  useEffect(() => {
    patientService.getHospitalKPIs().then(setKpis);
  }, [patients]);

  // Filtered patients
  const filteredPatients = useMemo(() => {
    return patients.filter((p) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matches =
          p.name.toLowerCase().includes(q) ||
          p.id.toLowerCase().includes(q) ||
          p.mrn.toLowerCase().includes(q) ||
          p.primaryDiagnosis.toLowerCase().includes(q) ||
          p.bed.toLowerCase().includes(q);
        if (!matches) return false;
      }
      if (unitFilter !== 'All Units' && p.unit !== unitFilter) return false;
      if (acuityFilter !== 'All Tiers' && p.acuityTier !== acuityFilter) return false;
      if (requiresReviewOnly && !p.requiresReview) return false;
      if (multiOrganOnly && !p.multiOrganPatternDetected) return false;
      return true;
    });
  }, [patients, searchQuery, unitFilter, acuityFilter, requiresReviewOnly, multiOrganOnly]);

  // Aggregate recent deterioration events across all monitored patients
  const recentDeteriorationEvents = useMemo(() => {
    const events: (DeteriorationEvent & { patientName: string; patientBed: string; patientId: string })[] = [];
    patients.forEach((p) => {
      p.deteriorationEvents.forEach((ev) => {
        events.push({
          ...ev,
          patientName: p.name,
          patientBed: p.bed,
          patientId: p.id,
        });
      });
    });
    return events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [patients]);

  const tc = t.commandCenter;

  return (
    <div className="space-y-6">
      {/* Page Title & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-vitalis-navy">
            {tc.title}
          </h1>
          <p className="text-xs text-vitalis-muted mt-0.5">
            {tc.subtitle}
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-vitalis-muted">
          <Clock className="w-3.5 h-3.5" />
          <span>{tc.telemetryCycle}</span>
        </div>
      </div>

      {/* Top 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="bg-card rounded-lg border border-vitalis-border p-4 shadow-subtle">
          <div className="flex items-center justify-between text-vitalis-muted mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              {tc.kpiMonitored}
            </span>
            <Users className="w-4 h-4 text-vitalis-navy" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-vitalis-text font-mono">
              {kpis?.monitoredPatients ?? patients.length}
            </span>
            <span className="text-xs text-vitalis-muted">{tc.kpiMonitoredSub}</span>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-[11px] text-vitalis-muted">
            <span className="inline-block w-2 h-2 rounded-full bg-red-500" /> {kpis?.criticalCount ?? 2} {language === 'hi' ? 'अति-गंभीर' : 'Critical'}
            <span className="text-slate-300">•</span>
            <span className="inline-block w-2 h-2 rounded-full bg-amber-500" /> {kpis?.urgentCount ?? 2} {language === 'hi' ? 'गंभीर' : 'Urgent'}
            <span className="text-slate-300">•</span>
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" /> {kpis?.stableCount ?? 2} {language === 'hi' ? 'स्थिर' : 'Stable'}
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-card rounded-lg border border-vitalis-border p-4 shadow-subtle border-l-4 border-l-vitalis-critical">
          <div className="flex items-center justify-between text-vitalis-muted mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-red-700">
              {tc.kpiReview}
            </span>
            <AlertTriangle className="w-4 h-4 text-vitalis-critical" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-vitalis-critical font-mono">
              {kpis?.requiringReview ?? 4}
            </span>
            <span className="text-xs text-vitalis-muted">{tc.kpiReviewSub}</span>
          </div>
          <div className="mt-3 text-[11px] text-red-700 font-medium">
            {language === 'hi' ? '२ आपातकालीन बहु-अङ्ग मूल्यांकन लंबित' : '2 pending emergent multi-organ evaluations'}
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-card rounded-lg border border-vitalis-border p-4 shadow-subtle border-l-4 border-l-vitalis-navy">
          <div className="flex items-center justify-between text-vitalis-muted mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-vitalis-navy">
              {tc.kpiPatterns}
            </span>
            <GitMerge className="w-4 h-4 text-vitalis-navy" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-vitalis-navy font-mono">
              {kpis?.multiOrganPatterns ?? 4}
            </span>
            <span className="text-xs text-vitalis-muted">{tc.kpiPatternsSub}</span>
          </div>
          <div className="mt-3 text-[11px] text-vitalis-muted">
            {language === 'hi' ? 'कार्डियोरीनल, सेप्टिक शॉक एवं ARDS सोपान' : 'Cardiorenal, Septic Shock & ARDS cascades'}
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-card rounded-lg border border-vitalis-border p-4 shadow-subtle">
          <div className="flex items-center justify-between text-vitalis-muted mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              {tc.kpiTrust}
            </span>
            <ShieldAlert className="w-4 h-4 text-vitalis-warning" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-amber-700 font-mono">
              {kpis?.dataQualityIssues ?? 2}
            </span>
            <span className="text-xs text-vitalis-muted">{tc.kpiTrustSub}</span>
          </div>
          <div className="mt-3 text-[11px] text-vitalis-muted">
            {language === 'hi' ? '१ एबीजी विलंबता; १ यूरिमीटर अंतराल' : '1 ABG latency warning; 1 urimeter gap'}
          </div>
        </div>
      </div>

      {/* Main Grid: Priority Table & Deterioration Events Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left 3 Cols: Patient Priority Table */}
        <div className="lg:col-span-3 space-y-3">
          {/* Filter Bar */}
          <div className="bg-card rounded-lg border border-vitalis-border p-3 shadow-subtle flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              {/* Unit Dropdown */}
              <select
                value={unitFilter}
                onChange={(e) => setUnitFilter(e.target.value)}
                className="bg-background border border-vitalis-border rounded-md px-2.5 py-1.5 text-xs text-vitalis-text focus:outline-none focus:border-vitalis-blue"
              >
                <option value="All Units">{tc.allUnits} ({patients.length})</option>
                <option value="Medical ICU">Medical ICU</option>
                <option value="Cardiac ICU">Cardiac ICU</option>
                <option value="Surgical ICU">Surgical ICU</option>
                <option value="Step-Down Unit">Step-Down Unit</option>
                <option value="Telemetry">Telemetry</option>
              </select>

              {/* Acuity Dropdown */}
              <select
                value={acuityFilter}
                onChange={(e) => setAcuityFilter(e.target.value)}
                className="bg-background border border-vitalis-border rounded-md px-2.5 py-1.5 text-xs text-vitalis-text focus:outline-none focus:border-vitalis-blue"
              >
                <option value="All Tiers">{tc.allTiers}</option>
                <option value="Critical">{language === 'hi' ? 'अति-गंभीर (Critical)' : 'Critical'}</option>
                <option value="Urgent">{language === 'hi' ? 'गंभीर (Urgent)' : 'Urgent'}</option>
                <option value="Guarded">{language === 'hi' ? 'सावधान (Guarded)' : 'Guarded'}</option>
                <option value="Stable">{language === 'hi' ? 'स्थिर (Stable)' : 'Stable'}</option>
              </select>

              {/* Requires Review Filter */}
              <button
                onClick={() => setRequiresReviewOnly(!requiresReviewOnly)}
                className={cn(
                  'px-2.5 py-1.5 rounded-md text-xs font-medium border transition-colors',
                  requiresReviewOnly
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
              {tc.showing} <span className="font-mono text-vitalis-text font-bold">{filteredPatients.length}</span> {tc.of}{' '}
              {patients.length} {tc.patients}
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-card rounded-lg border border-vitalis-border shadow-subtle overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-vitalis-border text-[11px] font-semibold text-vitalis-muted uppercase tracking-wider">
                    <th className="py-2.5 px-4">{tc.thPatientBed}</th>
                    <th className="py-2.5 px-3">{tc.thAcuity}</th>
                    <th className="py-2.5 px-3">{tc.thRiskScore}</th>
                    <th className="py-2.5 px-3">
                      <span title="Renal, Hepatic, Cardiac, Respiratory">{tc.thOrgans}</span>
                    </th>
                    <th className="py-2.5 px-3">{tc.thDiagnosis}</th>
                    <th className="py-2.5 px-4 text-right">{tc.thAction}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-vitalis-border/60 text-xs">
                  {filteredPatients.map((patient) => {
                    const acuityVariants: Record<string, 'critical' | 'warning' | 'watch' | 'stable'> = {
                      Critical: 'critical',
                      Urgent: 'warning',
                      Guarded: 'watch',
                      Stable: 'stable',
                    };

                    const acuityLabel = language === 'hi'
                      ? (patient.acuityTier === 'Critical' ? 'अति-गंभीर' : patient.acuityTier === 'Urgent' ? 'गंभीर' : patient.acuityTier === 'Guarded' ? 'सावधान' : 'स्थिर')
                      : patient.acuityTier;

                    return (
                      <tr
                        key={patient.id}
                        onClick={() => navigateToPatient(patient.id, 'patient-360')}
                        className="hover:bg-slate-50/80 cursor-pointer transition-colors group"
                      >
                        {/* Patient info */}
                        <td className="py-3 px-4">
                          <div className="font-semibold text-vitalis-navy group-hover:text-vitalis-blue transition-colors text-sm">
                            {patient.name}
                          </div>
                          <div className="flex items-center gap-1.5 text-[11px] text-vitalis-muted mt-0.5">
                            <span className="font-mono font-medium">{patient.id}</span>
                            <span>•</span>
                            <span className="font-medium text-slate-700">{patient.bed}</span>
                            <span>•</span>
                            <span>{patient.unit}</span>
                          </div>
                        </td>

                        {/* Acuity */}
                        <td className="py-3 px-3">
                          <Badge variant={acuityVariants[patient.acuityTier]} dot size="sm">
                            {acuityLabel}
                          </Badge>
                          {patient.requiresReview && (
                            <span className="block mt-1 text-[10px] text-red-600 font-semibold">
                              {tc.needsReviewBadge}
                            </span>
                          )}
                        </td>

                        {/* Composite Risk Score */}
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            <span
                              className={cn(
                                'font-mono font-bold text-sm',
                                patient.riskScore >= 80
                                  ? 'text-vitalis-critical'
                                  : patient.riskScore >= 60
                                  ? 'text-vitalis-warning'
                                  : 'text-emerald-700'
                              )}
                            >
                              {patient.riskScore}
                            </span>
                            <div className="w-14 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className={cn(
                                  'h-full rounded-full',
                                  patient.riskScore >= 80
                                    ? 'bg-vitalis-critical'
                                    : patient.riskScore >= 60
                                    ? 'bg-vitalis-warning'
                                    : 'bg-emerald-500'
                                )}
                                style={{ width: `${patient.riskScore}%` }}
                              />
                            </div>
                          </div>
                          <span className="text-[10px] text-vitalis-muted">
                            {tc.dayInIcu.replace('{day}', String(patient.icuDay))}
                          </span>
                        </td>

                        {/* 4 Organ Status Indicators */}
                        <td className="py-3 px-3">
                          <OrganIndicator
                            organStatuses={patient.organStatuses}
                            size="sm"
                            onOrganClick={(organ) => {
                              setSelectedOrganTab(organ);
                              navigateToPatient(patient.id, 'organ-intelligence');
                            }}
                          />
                          {patient.multiOrganPatternDetected && (
                            <div className="mt-1 flex items-center gap-1 text-[10px] text-sky-800 font-medium">
                              <Layers className="w-3 h-3 text-vitalis-blue" />
                              <span>{tc.multiOrganLink}</span>
                            </div>
                          )}
                        </td>

                        {/* Primary Diagnosis */}
                        <td className="py-3 px-3 max-w-xs">
                          <div className="truncate font-medium text-vitalis-text" title={patient.primaryDiagnosis}>
                            {patient.primaryDiagnosis}
                          </div>
                          {patient.patternDescription && (
                            <div className="text-[11px] text-vitalis-muted truncate mt-0.5" title={patient.patternDescription}>
                              {patient.patternDescription}
                            </div>
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
                    setUnitFilter('All Units');
                    setAcuityFilter('All Tiers');
                    setRequiresReviewOnly(false);
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

        {/* Right 1 Col: Recent Deterioration Event Timeline */}
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
            {recentDeteriorationEvents.map((evt) => {
              return (
                <div
                  key={evt.id}
                  onClick={() => navigateToPatient(evt.patientId, 'patient-360')}
                  className="group cursor-pointer border-l-2 border-vitalis-critical pl-3 py-1 space-y-1.5 hover:bg-slate-50 rounded-r transition-colors"
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-vitalis-navy group-hover:text-vitalis-blue text-xs">
                      {evt.patientName} ({evt.patientBed})
                    </span>
                    <span className="font-mono text-[10px] text-vitalis-muted">
                      {formatTimeOnly(evt.timestamp)}
                    </span>
                  </div>

                  <div className="text-xs font-semibold text-slate-800">
                    {evt.title}
                  </div>

                  <p className="text-[11px] text-vitalis-muted leading-relaxed line-clamp-2">
                    {evt.description}
                  </p>

                  <div className="flex flex-wrap gap-1 pt-1">
                    {evt.observedParameters.slice(0, 2).map((p, pIdx) => (
                      <span
                        key={pIdx}
                        className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded font-mono text-slate-700 border border-slate-200"
                      >
                        {p.name}: <strong>{p.value}</strong>
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}

            {recentDeteriorationEvents.length === 0 && (
              <div className="py-6 text-center text-xs text-vitalis-muted">
                {language === 'hi' ? 'वर्तमान अंतराल में कोई घटना नहीं।' : 'No active deterioration events logged in current window.'}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
