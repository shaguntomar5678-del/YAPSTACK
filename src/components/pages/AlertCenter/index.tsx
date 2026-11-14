import React, { useState, useMemo } from 'react';
import {
  BellRing,
  CheckCircle2,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { ClinicalAlert, AlertPriority } from '../../../types/alert';
import { Badge } from '../../common/Badge';
import { Modal } from '../../common/Modal';
import { formatDateTime } from '../../../utils/formatters';
import { cn } from '../../../utils/cn';

export const AlertCenter: React.FC = () => {
  const {
    alerts,
    acknowledgeAlert,
    navigateToPatient,
    unacknowledgedAlertCount,
    language,
    t,
  } = useApp();

  const [priorityFilter, setPriorityFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<'all' | 'unacknowledged' | 'acknowledged'>('all');
  const [organFilter, setOrganFilter] = useState<string>('All');

  const [reviewModalAlert, setReviewModalAlert] = useState<ClinicalAlert | null>(null);
  const [clinicianName, setClinicianName] = useState<string>('Dr. Aditi Mukherjee, MD');
  const [reviewNotes, setReviewNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const ta = t.alerts;

  const filteredAlerts = useMemo(() => {
    return alerts.filter((a) => {
      if (priorityFilter !== 'All' && a.priority !== priorityFilter) return false;
      if (statusFilter === 'unacknowledged' && a.acknowledged) return false;
      if (statusFilter === 'acknowledged' && !a.acknowledged) return false;
      if (organFilter !== 'All' && !a.organSystems.includes(organFilter.toLowerCase() as any)) return false;
      return true;
    });
  }, [alerts, priorityFilter, statusFilter, organFilter]);

  const handleOpenReview = (alert: ClinicalAlert) => {
    setReviewModalAlert(alert);
    setReviewNotes(alert.reviewNotes || '');
  };

  const handleConfirmAcknowledge = async () => {
    if (!reviewModalAlert) return;
    setIsSubmitting(true);
    await acknowledgeAlert(
      reviewModalAlert.id,
      clinicianName,
      reviewNotes || (language === 'hi' ? 'समीक्षा संपन्न एवं उपचार योजना स्वीकृत।' : 'Reviewed and clinical plan verified.')
    );
    setIsSubmitting(false);
    setReviewModalAlert(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-card rounded-lg border border-vitalis-border p-5 shadow-subtle flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-vitalis-navy flex items-center gap-2">
              <BellRing className="w-5 h-5 text-vitalis-critical" />
              {ta.title}
            </h1>
            {unacknowledgedAlertCount > 0 ? (
              <span className="bg-red-50 text-red-700 text-xs px-2.5 py-0.5 rounded-full font-bold border border-red-200">
                {unacknowledgedAlertCount} {ta.pendingReview}
              </span>
            ) : (
              <span className="bg-emerald-50 text-emerald-800 text-xs px-2.5 py-0.5 rounded-full font-bold border border-emerald-200">
                {ta.allCleared}
              </span>
            )}
          </div>
          <p className="text-xs text-vitalis-muted mt-0.5">
            {ta.subtitle}
          </p>
        </div>

        {/* Quick Triage Counters */}
        <div className="flex items-center gap-3 text-xs">
          <div className="text-right">
            <span className="text-[10px] uppercase font-semibold text-vitalis-muted block">{ta.criticalQueue}</span>
            <span className="font-mono font-bold text-red-700 text-sm">
              {alerts.filter((a) => a.priority === 'Critical' && !a.acknowledged).length} {language === 'hi' ? 'सक्रिय' : 'active'}
            </span>
          </div>
          <div className="text-right border-l border-vitalis-border pl-3">
            <span className="text-[10px] uppercase font-semibold text-vitalis-muted block">{ta.acknowledged}</span>
            <span className="font-mono font-bold text-emerald-700 text-sm">
              {alerts.filter((a) => a.acknowledged).length} {language === 'hi' ? 'लॉग किए' : 'logged'}
            </span>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-card rounded-lg border border-vitalis-border p-3.5 shadow-subtle flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Priority filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="bg-background border border-vitalis-border rounded-md px-2.5 py-1.5 text-xs text-vitalis-text focus:outline-none focus:border-vitalis-blue"
          >
            <option value="All">{ta.allPriorities}</option>
            <option value="Critical">{language === 'hi' ? 'अति-गंभीर (Critical)' : 'Critical'}</option>
            <option value="High">{language === 'hi' ? 'उच्च (High)' : 'High'}</option>
            <option value="Moderate">{language === 'hi' ? 'मध्यम (Moderate)' : 'Moderate'}</option>
          </select>

          {/* Status filter */}
          <div className="flex items-center bg-[#F3F6FA] p-0.5 rounded-md border border-vitalis-border text-xs">
            <button
              onClick={() => setStatusFilter('all')}
              className={cn(
                'px-2.5 py-1 rounded transition-colors',
                statusFilter === 'all' ? 'bg-white font-semibold text-vitalis-navy shadow-subtle' : 'text-vitalis-muted'
              )}
            >
              {language === 'hi' ? 'सभी' : 'All'} ({alerts.length})
            </button>
            <button
              onClick={() => setStatusFilter('unacknowledged')}
              className={cn(
                'px-2.5 py-1 rounded transition-colors',
                statusFilter === 'unacknowledged' ? 'bg-white font-semibold text-vitalis-navy shadow-subtle' : 'text-vitalis-muted'
              )}
            >
              {ta.unreviewed} ({unacknowledgedAlertCount})
            </button>
            <button
              onClick={() => setStatusFilter('acknowledged')}
              className={cn(
                'px-2.5 py-1 rounded transition-colors',
                statusFilter === 'acknowledged' ? 'bg-white font-semibold text-vitalis-navy shadow-subtle' : 'text-vitalis-muted'
              )}
            >
              {ta.reviewed} ({alerts.length - unacknowledgedAlertCount})
            </button>
          </div>

          {/* Organ Filter */}
          <select
            value={organFilter}
            onChange={(e) => setOrganFilter(e.target.value)}
            className="bg-background border border-vitalis-border rounded-md px-2.5 py-1.5 text-xs text-vitalis-text focus:outline-none focus:border-vitalis-blue"
          >
            <option value="All">{ta.allOrgans}</option>
            <option value="Renal">{language === 'hi' ? 'वृक्क (Renal)' : 'Renal'}</option>
            <option value="Cardiac">{language === 'hi' ? 'हृदय (Cardiac)' : 'Cardiac'}</option>
            <option value="Respiratory">{language === 'hi' ? 'श्वसन (Respiratory)' : 'Respiratory'}</option>
            <option value="Hepatic">{language === 'hi' ? 'यकृत (Hepatic)' : 'Hepatic'}</option>
          </select>
        </div>

        <div className="text-xs text-vitalis-muted">
          {language === 'hi' ? 'प्रदर्शित रिकॉर्ड्स:' : 'Showing'}{' '}
          <span className="font-mono font-bold text-vitalis-text">{filteredAlerts.length}</span>{' '}
          {language === 'hi' ? 'चेतावनियां' : 'alert records'}
        </div>
      </div>

      {/* Alert Cards Queue */}
      <div className="space-y-3">
        {filteredAlerts.map((alert) => {
          const priorityBadges: Record<AlertPriority, 'critical' | 'warning' | 'watch' | 'info'> = {
            Critical: 'critical',
            High: 'warning',
            Moderate: 'watch',
            Informational: 'info',
          };

          return (
            <div
              key={alert.id}
              className={cn(
                'bg-card rounded-lg border p-4 shadow-subtle transition-all space-y-3',
                alert.acknowledged
                  ? 'border-vitalis-border/80 opacity-90'
                  : alert.priority === 'Critical'
                  ? 'border-l-4 border-l-vitalis-critical border-vitalis-border bg-red-50/15'
                  : 'border-l-4 border-l-vitalis-warning border-vitalis-border'
              )}
            >
              {/* Alert Top Row */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={priorityBadges[alert.priority]} dot size="sm">
                    {alert.priority}
                  </Badge>

                  <span className="font-bold text-sm text-vitalis-navy">
                    {alert.patientName} ({alert.patientBed})
                  </span>

                  <span className="text-xs font-mono text-vitalis-muted">
                    {alert.patientId}
                  </span>

                  {/* Organ tags */}
                  <div className="flex items-center gap-1">
                    {alert.organSystems.map((org) => (
                      <span
                        key={org}
                        className="text-[10px] uppercase font-bold px-1.5 py-0.2 rounded border bg-slate-50 text-slate-700 border-slate-200"
                      >
                        {org}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-vitalis-muted">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{formatDateTime(alert.timestamp)}</span>
                </div>
              </div>

              {/* Alert Title & Message */}
              <div>
                <h3 className="text-sm font-bold text-vitalis-text">
                  {alert.title}
                </h3>
                <p className="text-xs text-slate-700 leading-relaxed mt-1">
                  {alert.message}
                </p>
              </div>

              {/* Evidence Row */}
              <div className="bg-slate-50 border border-vitalis-border rounded-md p-3 text-xs space-y-2">
                <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-vitalis-muted">
                  <span>{ta.groundingEvidence}</span>
                  <span className="flex items-center gap-1 text-slate-700 font-sans normal-case">
                    {ta.dataReliability}: <strong className="text-vitalis-navy font-semibold">{alert.dataReliability}</strong>
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {alert.evidence.map((ev, evIdx) => (
                    <div key={evIdx} className="bg-white border border-vitalis-border/80 rounded p-2 text-[11px]">
                      <span className="text-vitalis-muted block truncate">{ev.indicator}</span>
                      <div className="flex items-baseline justify-between mt-0.5">
                        <span className="font-mono font-bold text-slate-900">{ev.value}</span>
                        <span className="text-[10px] text-vitalis-critical font-medium">Threshold: {ev.threshold}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommended Action */}
              {alert.recommendedAction && (
                <div className="text-xs bg-sky-50 border border-sky-100 rounded p-2.5 text-sky-950 flex items-start gap-2">
                  <span className="font-semibold text-vitalis-navy shrink-0">{ta.protocolRecommendation}:</span>
                  <span>{alert.recommendedAction}</span>
                </div>
              )}

              {/* Acknowledged status details */}
              {alert.acknowledged && (
                <div className="text-xs bg-emerald-50 border border-emerald-200 rounded p-2.5 text-emerald-950 flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-1.5 font-semibold text-emerald-900">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>{language === 'hi' ? 'समीक्षित द्वारा' : 'Reviewed by'} {alert.acknowledgedBy} at {formatDateTime(alert.acknowledgedAt || '')}</span>
                    </div>
                    {alert.reviewNotes && (
                      <p className="text-[11px] text-emerald-800 mt-1 pl-5">
                        {language === 'hi' ? 'टिप्पणी:' : 'Notes:'} "{alert.reviewNotes}"
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-vitalis-border/60">
                <button
                  onClick={() => navigateToPatient(alert.patientId, 'patient-360')}
                  className="text-xs font-semibold text-vitalis-blue hover:underline flex items-center gap-1"
                >
                  {language === 'hi' ? 'रोगी ३६०° प्रोफाइल देखें' : 'Inspect Full Patient 360'} <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <div className="flex items-center gap-2">
                  {!alert.acknowledged ? (
                    <button
                      onClick={() => handleOpenReview(alert)}
                      className="px-3 py-1.5 text-xs font-semibold rounded bg-vitalis-navy text-white hover:bg-vitalis-navy-dark transition-colors shadow-subtle"
                    >
                      {ta.reviewAndAcknowledge}
                    </button>
                  ) : (
                    <button
                      onClick={() => handleOpenReview(alert)}
                      className="px-2.5 py-1 text-xs font-medium rounded border border-vitalis-border text-vitalis-muted hover:bg-slate-100"
                    >
                      {ta.editNotes}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {filteredAlerts.length === 0 && (
          <div className="p-12 text-center bg-card rounded-lg border border-vitalis-border text-vitalis-muted">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <p className="text-sm font-semibold text-vitalis-text">{ta.allCleared}</p>
          </div>
        )}
      </div>

      {/* Review & Acknowledge Modal */}
      <Modal
        isOpen={!!reviewModalAlert}
        onClose={() => setReviewModalAlert(null)}
        title={ta.modalTitle}
        subtitle={reviewModalAlert ? `${reviewModalAlert.title} • ${reviewModalAlert.patientName} (${reviewModalAlert.patientBed})` : ''}
        footer={
          <>
            <button
              onClick={() => setReviewModalAlert(null)}
              className="px-3 py-1.5 text-xs rounded border border-vitalis-border text-vitalis-muted hover:bg-slate-100"
            >
              {ta.cancel}
            </button>
            <button
              onClick={handleConfirmAcknowledge}
              disabled={isSubmitting}
              className="px-4 py-1.5 text-xs font-semibold rounded bg-vitalis-navy text-white hover:bg-vitalis-navy-dark shadow-subtle flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{isSubmitting ? (language === 'hi' ? 'दर्ज हो रहा है...' : 'Recording...') : ta.signAndAcknowledge}</span>
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="bg-slate-50 border border-vitalis-border rounded p-3 text-xs space-y-1">
            <span className="font-semibold text-vitalis-navy">{language === 'hi' ? 'चेतावनी सारांश:' : 'Alert Summary:'}</span>
            <p className="text-slate-700">{reviewModalAlert?.message}</p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-vitalis-navy block">
              {ta.attendingClinician}
            </label>
            <input
              type="text"
              value={clinicianName}
              onChange={(e) => setClinicianName(e.target.value)}
              className="w-full bg-background border border-vitalis-border rounded px-3 py-1.5 text-xs text-vitalis-text focus:outline-none focus:border-vitalis-blue"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-vitalis-navy block">
              {ta.assessmentNotes}
            </label>
            <textarea
              rows={4}
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
              placeholder={language === 'hi' ? 'उदा. बेडसाइड POCUS किया गया; द्रव बोलस रोका गया; नेफ्रोलॉजी परामर्श...' : 'e.g. Bedside POCUS performed; fluid bolus held; nephrology consult placed for urgent CRRT clearance...'}
              className="w-full bg-background border border-vitalis-border rounded p-3 text-xs text-vitalis-text placeholder:text-vitalis-muted focus:outline-none focus:border-vitalis-blue"
            />
          </div>

          <div className="text-[11px] text-vitalis-muted bg-slate-50 p-2.5 rounded border border-vitalis-border">
            {language === 'hi'
              ? 'सूचना: स्वीकृति लॉग आपके टाइमस्टैम्प एवं इलेक्ट्रॉनिक हस्ताक्षर के साथ सुरक्षित ऑडिट ट्रेल में दर्ज की जाएगी।'
              : 'Note: Acknowledgement logs will be immutably recorded in the clinical telemetry audit trail with your timestamp and electronic identifier.'}
          </div>
        </div>
      </Modal>
    </div>
  );
};
