import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  Clock,
  Activity,
  Server,
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { dataTrustService } from '../../../services/dataTrustService';
import { DataQualityAudit } from '../../../types/dataTrust';
import { Badge } from '../../common/Badge';
import { MetricCard } from '../../common/MetricCard';
import { cn } from '../../../utils/cn';

export const DataTrust: React.FC = () => {
  const { selectedPatient, patients, setSelectedPatientId, language, t } = useApp();
  const [audit, setAudit] = useState<DataQualityAudit | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (selectedPatient) {
      setLoading(true);
      dataTrustService.getAuditForPatient(selectedPatient.id).then((res) => {
        setAudit(res);
        setLoading(false);
      });
    }
  }, [selectedPatient]);

  if (!selectedPatient) return null;

  const td = t.dataTrust;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-card rounded-lg border border-vitalis-border p-5 shadow-subtle flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-vitalis-navy flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-vitalis-teal" />
              {td.title}
            </h1>
            <Badge variant="teal" size="xs">
              {language === 'hi' ? 'गुणवत्ता आश्वासन' : 'Quality Assurance'}
            </Badge>
          </div>
          <p className="text-xs text-vitalis-muted mt-0.5">
            {td.subtitle} • {selectedPatient.name} ({selectedPatient.bed})
          </p>
        </div>

        {/* Patient Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-vitalis-muted font-medium">{language === 'hi' ? 'रोगी:' : 'Patient:'}</span>
          <select
            value={selectedPatient.id}
            onChange={(e) => setSelectedPatientId(e.target.value)}
            className="bg-background border border-vitalis-border rounded-md px-2.5 py-1 text-xs text-vitalis-text focus:outline-none focus:border-vitalis-blue"
          >
            {patients.map((pt) => (
              <option key={pt.id} value={pt.id}>
                {pt.name} ({pt.bed})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Top 4 Trust KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          title={td.overallTrust}
          value={audit ? `${audit.overallTrustScore}%` : '--'}
          subtitle={language === 'hi' ? 'मानकीकृत समग्र स्कोर' : 'Enterprise calibrated composite'}
          deltaText={language === 'hi' ? 'उच्च गुणवत्ता श्रेणी' : 'High Data Quality Tier'}
          deltaSeverity="normal"
        />
        <MetricCard
          title={td.completenessRate}
          value={audit ? `${audit.completenessScore}%` : '--'}
          subtitle={language === 'hi' ? 'निरंतर एवं आवधिक डेटा' : 'Across continuous & intermittent feeds'}
          deltaText={language === 'hi' ? 'न्यूनतम टेलीमेट्री अंतराल' : 'Minimal telemetry drops'}
          deltaSeverity="normal"
        />
        <MetricCard
          title={td.consistency}
          value={audit ? `${audit.consistencyScore}%` : '--'}
          subtitle={language === 'hi' ? 'सेंसर विचलन एवं शोर' : 'Artifact & noise detection'}
          deltaText={language === 'hi' ? 'स्थिर ट्रांसड्यूसर सिग्नल' : 'Stable transducer signals'}
          deltaSeverity="normal"
        />
        <MetricCard
          title={td.baselineIntegrity}
          value={audit ? `${audit.baselineIntegrityScore}%` : '--'}
          subtitle={language === 'hi' ? 'प्रवेश पूर्व एवं भर्ती सत्यापित' : 'Pre-admission & admission validated'}
          deltaText={language === 'hi' ? 'पूर्ण आधारभूत प्रोफ़ाइल' : 'Full baseline profile available'}
          deltaSeverity="normal"
        />
      </div>

      {/* Quality Flags & Alert Notifications */}
      {audit && audit.activeQualityFlags.length > 0 && (
        <div className="bg-card rounded-lg border border-vitalis-border p-5 shadow-subtle space-y-3 border-l-4 border-l-vitalis-warning">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-vitalis-navy flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-vitalis-warning" />
              {td.qualityFlags} ({audit.activeQualityFlags.length})
            </h3>
            <span className="text-[10px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded font-semibold border border-amber-200">
              {td.attentionRecommended}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {audit.activeQualityFlags.map((flag) => (
              <div key={flag.id} className="bg-slate-50 border border-vitalis-border rounded-md p-3 text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">{flag.title}</span>
                  <Badge variant="warning" size="xs">
                    {flag.level.toUpperCase()}
                  </Badge>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  {flag.description}
                </p>
                <div className="text-[10px] text-vitalis-blue font-semibold pt-1 border-t border-vitalis-border/60">
                  {language === 'hi' ? 'अनुशंसित कार्यवाही:' : 'Recommended Action:'} {flag.suggestedVerification}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Telemetry Ingestion Streams Table */}
      <div className="bg-card rounded-lg border border-vitalis-border p-5 shadow-subtle space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-vitalis-navy flex items-center gap-2">
            <Server className="w-4 h-4 text-vitalis-navy" />
            {td.connectedStreams}
          </h3>
          <span className="text-xs text-vitalis-muted">HL7 / FHIR / Continuous Telemetry Pipeline</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-vitalis-border text-vitalis-muted uppercase tracking-wider text-[10px] bg-slate-50/60">
                <th className="py-2.5 px-3">{language === 'hi' ? 'डेटा स्रोत' : 'Modality / Ingestion Feed'}</th>
                <th className="py-2.5 px-3">{language === 'hi' ? 'हार्डवेयर / प्रणाली' : 'Source Hardware / LIS'}</th>
                <th className="py-2.5 px-3">{language === 'hi' ? 'आवृत्ति' : 'Sampling Cadence'}</th>
                <th className="py-2.5 px-3">{language === 'hi' ? 'पूर्णता' : 'Completeness'}</th>
                <th className="py-2.5 px-3">{language === 'hi' ? 'विलंबता' : 'Ingest Latency'}</th>
                <th className="py-2.5 px-3">{language === 'hi' ? 'शोर/आर्टिफैक्ट्स' : 'Artifacts (24h)'}</th>
                <th className="py-2.5 px-3 text-right">{language === 'hi' ? 'स्थिति' : 'Stream Status'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-vitalis-border/60">
              {audit?.modalities.map((m, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50">
                  <td className="py-2.5 px-3 font-semibold text-vitalis-navy">{m.name}</td>
                  <td className="py-2.5 px-3 text-vitalis-muted font-mono">{m.sourceSystem}</td>
                  <td className="py-2.5 px-3 text-slate-700">{m.samplingFrequency}</td>
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-800">{m.completenessRate}%</td>
                  <td className="py-2.5 px-3 font-mono text-slate-700">{m.latencySeconds}s</td>
                  <td className="py-2.5 px-3 font-mono text-slate-700">{m.artifactsCount24h}</td>
                  <td className="py-2.5 px-3 text-right">
                    <Badge
                      variant={m.status === 'Optimal' ? 'stable' : m.status === 'Delayed' ? 'warning' : 'critical'}
                      size="xs"
                      dot
                    >
                      {m.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Missing Measurements Tracker & 24h Availability Matrix Dual Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Missing Measurements Tracker */}
        <div className="bg-card rounded-lg border border-vitalis-border p-5 shadow-subtle space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-vitalis-navy flex items-center gap-2">
              <Clock className="w-4 h-4 text-vitalis-blue" />
              {td.missingTracker}
            </h3>
            <span className="text-[10px] text-vitalis-muted">Expected Frequency Surveillance</span>
          </div>

          <div className="space-y-2.5">
            {audit?.missingMeasurements.map((item, idx) => (
              <div key={idx} className="border border-vitalis-border rounded-md p-3 text-xs space-y-1.5 bg-slate-50/50">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-slate-900">{item.testOrVital}</span>
                  <Badge variant={item.clinicalImpactTier === 'High' ? 'critical' : 'warning'} size="xs">
                    {item.clinicalImpactTier} Impact
                  </Badge>
                </div>
                <div className="flex justify-between items-center text-[11px] text-vitalis-muted">
                  <span>Category: <strong className="text-slate-700">{item.category}</strong></span>
                  <span>{language === 'hi' ? 'अंतिम परीक्षण:' : 'Last drawn:'} <strong className="font-mono text-slate-700">{item.hoursSinceLastMeasurement}h ago</strong> (Expected q{item.expectedFrequencyHours}h)</span>
                </div>
              </div>
            ))}

            {(!audit || audit.missingMeasurements.length === 0) && (
              <div className="py-8 text-center text-xs text-vitalis-muted">
                {language === 'hi' ? 'कोई छूटा हुआ परीक्षण नहीं मिला।' : 'No overdue measurements detected. All protocolized lab draws are current.'}
              </div>
            )}
          </div>
        </div>

        {/* 24-Hour Telemetry Availability Timeline Matrix */}
        <div className="bg-card rounded-lg border border-vitalis-border p-5 shadow-subtle space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-vitalis-navy flex items-center gap-2">
              <Activity className="w-4 h-4 text-vitalis-teal" />
              {td.continuityMatrix}
            </h3>
            <span className="text-[10px] text-vitalis-muted">Continuous (60s bins)</span>
          </div>

          <p className="text-[11px] text-vitalis-muted">
            {language === 'hi'
              ? 'विगत २४ घंटों में प्रति घंटा डेटा घनत्व। हरे ब्लॉक निर्बाध निरंतर टेलीमेट्री दर्शाते हैं।'
              : 'Sampling density per hour over the previous 24-hour cycle. Green blocks indicate uninterrupted continuous telemetry ingestion.'}
          </p>

          <div className="grid grid-cols-12 gap-1.5 pt-2">
            {audit?.timeline24h.map((t, idx) => (
              <div
                key={idx}
                className={cn(
                  'h-12 rounded border flex flex-col items-center justify-center text-[9px] font-mono transition-all',
                  t.gapsDetected
                    ? 'bg-amber-100 border-amber-300 text-amber-900 font-bold'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                )}
                title={`Hour ${t.hour}: ${t.vitalsRecorded} vitals recorded, ${t.labsRecorded} labs. ${t.gapsDetected ? 'Intermittent sampling gap flagged.' : 'Nominal continuity.'}`}
              >
                <span>{t.hour.split(':')[0]}h</span>
                <span className="text-[8px] opacity-75">{t.gapsDetected ? 'GAP' : '100%'}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between text-[10px] text-vitalis-muted pt-2 border-t border-vitalis-border">
            <span>{language === 'hi' ? '२४ घंटे पूर्व' : '24 Hours Ago'}</span>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 bg-emerald-100 border border-emerald-300 rounded-sm" /> 100% Continuous
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 bg-amber-100 border border-amber-300 rounded-sm" /> Sampling Gap
              </span>
            </div>
            <span>{language === 'hi' ? 'वर्तमान घंटा' : 'Current Hour'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
