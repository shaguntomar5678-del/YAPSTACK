import React, { useState, useMemo } from 'react';
import {
  BellRing,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldAlert,
  AlertTriangle,
  User,
  Filter,
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { Badge } from '../../common/Badge';
import { Modal } from '../../common/Modal';
import {
  formatRiskCaption,
  RISK_DISCLAIMER_CAPTION,
} from '../../../utils/formatters';
import { cn } from '../../../utils/cn';

interface AlertItem {
  id: string;
  patientId: string;
  patientName: string;
  bed: string;
  risk_overall: number | null;
  display_overall: 'shown' | 'data_insufficient' | 'not_applicable';
  trust: string;
  top_reason: string;
  first_change: { organ: string; hour: number } | null;
  organs: Record<string, { status: string; risk?: number | null }>;
  hour: number;
  acknowledged: boolean;
  acknowledgedAt?: string;
  acknowledgedBy?: string;
  notes?: string;
}

export const AlertCenter: React.FC = () => {
  const { patients, navigateToPatient, language, t } = useApp();

  // Local state for acknowledgements
  const [acknowledgedMap, setAcknowledgedMap] = useState<
    Record<string, { by: string; at: string; notes: string }>
  >({});

  const [statusFilter, setStatusFilter] = useState<'all' | 'unacknowledged' | 'acknowledged'>('all');
  const [reviewModalAlert, setReviewModalAlert] = useState<AlertItem | null>(null);
  const [clinicianName, setClinicianName] = useState<string>('Dr. Aditi Mukherjee, MD');
  const [reviewNotes, setReviewNotes] = useState<string>('');

  // Build alerts list from elevated patients
  const alerts: AlertItem[] = useMemo(() => {
    if (!patients) return [];
    return patients
      .filter((p) => p.elevated)
      .sort((a, b) => (b.risk_overall ?? 0) - (a.risk_overall ?? 0))
      .map((p) => {
        const ack = acknowledgedMap[p.id];
        return {
          id: `ALT-${p.id}`,
          patientId: p.id,
          patientName: p.name ?? `Patient ${p.id}`,
          bed: p.bed ?? 'ICU',
          risk_overall: p.risk_overall,
          display_overall: p.display_overall,
          trust: p.trust,
          top_reason: p.top_reason ?? 'Elevated acute multi-organ deterioration risk detected',
          first_change: p.first_change ?? null,
          organs: p.organs,
          hour: p.hour ?? 92,
          acknowledged: !!ack,
          acknowledgedAt: ack?.at,
          acknowledgedBy: ack?.by,
          notes: ack?.notes,
        };
      });
  }, [patients, acknowledgedMap]);

  const filteredAlerts = useMemo(() => {
    return alerts.filter((a) => {
      if (statusFilter === 'unacknowledged' && a.acknowledged) return false;
      if (statusFilter === 'acknowledged' && !a.acknowledged) return false;
      return true;
    });
  }, [alerts, statusFilter]);

  const unackCount = useMemo(() => {
    return alerts.filter((a) => !a.acknowledged).length;
  }, [alerts]);

  const handleOpenReview = (alert: AlertItem) => {
    setReviewModalAlert(alert);
    setReviewNotes(alert.notes || '');
  };

  const handleConfirmAcknowledge = () => {
    if (!reviewModalAlert) return;
    setAcknowledgedMap((prev) => ({
      ...prev,
      [reviewModalAlert.patientId]: {
        by: clinicianName,
        at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        notes: reviewNotes || (language === 'hi' ? 'समीक्षा संपन्न एवं योजना अनुमोदित।' : 'Evaluated and management plan verified.'),
      },
    }));
    setReviewModalAlert(null);
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-vitalis-text flex items-center gap-2">
            <BellRing className="w-5 h-5 text-vitalis-critical" />
            <span>{language === 'hi' ? 'चिकित्सकीय चेतावनी केंद्र' : 'Clinical Deterioration Alert Center'}</span>
            {unackCount > 0 && (
              <span className="text-xs bg-vitalis-critical/10 text-vitalis-critical font-bold px-2 py-0.5 rounded-full">
                {unackCount} {language === 'hi' ? 'लंबित' : 'Pending Review'}
              </span>
            )}
          </h1>
          <p className="text-xs text-vitalis-muted mt-0.5">
            Surveillance queue for monitored patients exceeding clinical escalation thresholds
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center bg-card border border-vitalis-border rounded-lg p-0.5 text-xs shadow-subtle">
          <button
            onClick={() => setStatusFilter('all')}
            className={cn(
              'px-3 py-1.5 rounded transition-colors font-medium',
              statusFilter === 'all'
                ? 'bg-vitalis-navy text-white font-semibold'
                : 'text-vitalis-muted hover:text-vitalis-text'
            )}
          >
            All Alerts ({alerts.length})
          </button>
          <button
            onClick={() => setStatusFilter('unacknowledged')}
            className={cn(
              'px-3 py-1.5 rounded transition-colors font-medium',
              statusFilter === 'unacknowledged'
                ? 'bg-vitalis-critical text-white font-semibold'
                : 'text-vitalis-muted hover:text-vitalis-text'
            )}
          >
            Unacknowledged ({unackCount})
          </button>
          <button
            onClick={() => setStatusFilter('acknowledged')}
            className={cn(
              'px-3 py-1.5 rounded transition-colors font-medium',
              statusFilter === 'acknowledged'
                ? 'bg-emerald-600 text-white font-semibold'
                : 'text-vitalis-muted hover:text-vitalis-text'
            )}
          >
            Acknowledged ({alerts.length - unackCount})
          </button>
        </div>
      </div>

      {/* Alerts Queue */}
      <div className="space-y-3">
        {filteredAlerts.map((alert) => (
          <div
            key={alert.id}
            className={cn(
              'bg-card rounded-lg border p-4 shadow-subtle transition-all space-y-3',
              alert.acknowledged
                ? 'border-vitalis-border opacity-80'
                : 'border-l-4 border-l-vitalis-critical border-vitalis-border'
            )}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <span className="font-mono text-sm font-bold text-vitalis-navy">
                  {alert.patientId}
                </span>
                <span className="font-semibold text-vitalis-text text-sm">
                  {alert.patientName}
                </span>
                <span className="text-xs font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                  {alert.bed}
                </span>
                <Badge variant={getTrustBadgeVariant(alert.trust)} size="xs" className="capitalize">
                  Trust: {alert.trust}
                </Badge>
                <span className="text-[10px] text-slate-500 italic">Simulated patient</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-vitalis-critical">
                  {formatRiskCaption(alert.display_overall, alert.risk_overall, alert.trust)}
                </span>
                <span className="text-[10px] text-vitalis-muted">
                  (12h horizon)
                </span>
              </div>
            </div>

            {/* Middle: Reason & Organs Involved */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-slate-50/70 border border-slate-200/80 rounded-lg p-3 text-xs">
              <div className="md:col-span-2 space-y-1">
                <span className="text-[10px] font-semibold text-vitalis-muted uppercase tracking-wider block">
                  Top Deterioration Factor
                </span>
                <p className="text-slate-800 font-medium">
                  {alert.top_reason}
                </p>
                {alert.first_change && (
                  <div className="text-[10px] text-vitalis-muted pt-0.5">
                    Earliest divergence:{' '}
                    <strong className="text-vitalis-navy uppercase">
                      {alert.first_change.organ}
                    </strong>{' '}
                    at hour <strong>{alert.first_change.hour}h</strong>
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-semibold text-vitalis-muted uppercase tracking-wider block">
                  Organ Status (R | H | C | P)
                </span>
                <div className="flex items-center gap-1.5 pt-1">
                  {(['renal', 'hepatic', 'cardio', 'resp'] as const).map((orgKey) => {
                    const org = alert.organs[orgKey];
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
                          'w-6 h-6 rounded flex items-center justify-center font-bold text-xs shadow-xs',
                          organDotColor(org?.status)
                        )}
                        title={`${orgKey.toUpperCase()}: ${org?.status || 'normal'}`}
                      >
                        {letterMap[orgKey]}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Bottom Controls / Acknowledge State */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 border-t border-vitalis-border/60">
              <div className="text-[11px] text-vitalis-muted flex items-center gap-2">
                {alert.acknowledged ? (
                  <span className="flex items-center gap-1 text-emerald-700 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Acknowledged by {alert.acknowledgedBy} at {alert.acknowledgedAt}: &ldquo;{alert.notes}&rdquo;
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-amber-700">
                    <Clock className="w-3.5 h-3.5" />
                    Requires physician review and acknowledgement
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                {!alert.acknowledged && (
                  <button
                    type="button"
                    onClick={() => handleOpenReview(alert)}
                    className="px-3 py-1.5 bg-vitalis-navy hover:bg-vitalis-blue text-white rounded text-xs font-semibold transition-colors shadow-subtle"
                  >
                    Acknowledge &amp; Document
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => navigateToPatient(alert.patientId, 'patient-360')}
                  className="px-3 py-1.5 border border-vitalis-border hover:border-vitalis-blue bg-white text-vitalis-navy rounded text-xs font-semibold transition-colors flex items-center gap-1"
                >
                  <span>Open 360°</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredAlerts.length === 0 && (
          <div className="bg-card rounded-lg border border-vitalis-border p-12 text-center text-vitalis-muted space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
            <h3 className="text-sm font-bold text-vitalis-text">
              No Unacknowledged Alerts
            </h3>
            <p className="text-xs">
              All monitored patients in this queue are currently verified or within safe operating limits.
            </p>
          </div>
        )}
      </div>

      {/* Review Modal */}
      {reviewModalAlert && (
        <Modal
          isOpen={!!reviewModalAlert}
          onClose={() => setReviewModalAlert(null)}
          title={`Clinical Review: Patient ${reviewModalAlert.patientId} (${reviewModalAlert.patientName})`}
        >
          <div className="space-y-4 text-xs">
            <div className="bg-amber-50 border border-amber-200 rounded p-3 text-amber-900 space-y-1">
              <span className="font-bold block">Attribution Summary</span>
              <p>{reviewModalAlert.top_reason}</p>
              <p className="text-[11px] text-amber-800 italic">
                {RISK_DISCLAIMER_CAPTION}
              </p>
            </div>

            <div>
              <label className="font-semibold text-vitalis-text block mb-1">
                Attending Physician Name / ID
              </label>
              <input
                type="text"
                value={clinicianName}
                onChange={(e) => setClinicianName(e.target.value)}
                className="w-full bg-slate-50 border border-vitalis-border rounded p-2 text-xs text-vitalis-text"
              />
            </div>

            <div>
              <label className="font-semibold text-vitalis-text block mb-1">
                Clinical Assessment &amp; Escalation Notes
              </label>
              <textarea
                rows={3}
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder="Enter clinical assessment, bedside telemetry review notes, or management steps..."
                className="w-full bg-slate-50 border border-vitalis-border rounded p-2 text-xs text-vitalis-text"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-vitalis-border">
              <button
                type="button"
                onClick={() => setReviewModalAlert(null)}
                className="px-3 py-1.5 border border-vitalis-border rounded text-vitalis-muted hover:text-vitalis-text"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmAcknowledge}
                className="px-4 py-1.5 bg-vitalis-navy text-white rounded font-semibold hover:bg-vitalis-blue"
              >
                Sign &amp; Acknowledge
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
