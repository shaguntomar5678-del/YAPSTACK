import React, { useState } from 'react';
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
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { Badge } from '../../common/Badge';
import { formatTimeOnly, formatDateTime, getDeviationBadge } from '../../../utils/formatters';
import { cn } from '../../../utils/cn';

export const Patient360: React.FC = () => {
  const {
    selectedPatient,
    setCurrentPage,
    setSelectedOrganTab,
    patients,
    setSelectedPatientId,
    language,
    t,
  } = useApp();

  const [activeChartMetric, setActiveChartMetric] = useState<'composite' | 'renal' | 'cardiac' | 'respiratory' | 'hepatic'>('composite');

  if (!selectedPatient) {
    return (
      <div className="p-8 text-center text-vitalis-muted">
        <p>{language === 'hi' ? 'कोई रोगी चयनित नहीं है।' : 'No patient selected. Return to the Command Center to choose a patient.'}</p>
      </div>
    );
  }

  const p = selectedPatient;
  const tp = t.patient360;

  // Chart data formatted
  const chartData = p.timeSeries.map((pt) => {
    const timeLabel = formatTimeOnly(pt.timestamp);
    return {
      time: timeLabel,
      fullTime: pt.timestamp,
      renal: pt.renalScore,
      hepatic: pt.hepaticScore,
      cardiac: pt.cardiacScore,
      respiratory: pt.respiratoryScore,
      composite: Math.round((pt.renalScore * 0.35 + pt.cardiacScore * 0.3 + pt.respiratoryScore * 0.25 + pt.hepaticScore * 0.1)),
      creatinine: pt.creatinine,
      map: pt.map,
      spO2: pt.spO2,
      urineOutput: pt.urineOutput,
    };
  });

  const renalDev = getDeviationBadge(p.renal.creatinine, p.renal.creatinineBaseline, true);
  const hepaticDev = getDeviationBadge(p.hepatic.alt, p.hepatic.altBaseline, true);
  const cardiacDev = getDeviationBadge(p.cardiac.meanArterialPressure, p.cardiac.mapBaseline, false);
  const respDev = getDeviationBadge(p.respiratory.paO2FiO2Ratio, p.respiratory.pfBaseline, false);

  const acuityLabel = language === 'hi'
    ? (p.acuityTier === 'Critical' ? 'अति-गंभीर' : p.acuityTier === 'Urgent' ? 'गंभीर' : p.acuityTier === 'Guarded' ? 'सावधान' : 'स्थिर')
    : p.acuityTier;

  return (
    <div className="space-y-6">
      {/* Patient Header & Quick Patient Selector */}
      <div className="bg-card rounded-lg border border-vitalis-border p-5 shadow-subtle">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-vitalis-navy">
                {p.name}
              </h1>
              <Badge
                variant={
                  p.acuityTier === 'Critical'
                    ? 'critical'
                    : p.acuityTier === 'Urgent'
                    ? 'warning'
                    : 'stable'
                }
                dot
                size="md"
              >
                {acuityLabel}
              </Badge>
              {p.requiresReview && (
                <span className="text-xs bg-red-50 text-red-700 px-2.5 py-0.5 rounded-full font-bold border border-red-200">
                  {tp.needsAttendingReview}
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-vitalis-muted mt-2">
              <span>
                MRN: <strong className="font-mono text-vitalis-text">{p.mrn}</strong>
              </span>
              <span>•</span>
              <span>
                {tp.age} / {tp.gender}: <strong className="text-vitalis-text">{p.age} y/o {p.gender}</strong>
              </span>
              <span>•</span>
              <span>
                {tp.location}: <strong className="text-vitalis-text">{p.unit} ({p.bed})</strong>
              </span>
              <span>•</span>
              <span>
                {tp.icuDay}: <strong className="text-vitalis-text">{p.icuDay}</strong> ({tp.admit}: {formatDateTime(p.admissionDate)})
              </span>
              <span>•</span>
              <span>
                {tp.codeStatus}: <strong className="text-vitalis-text">{p.codeStatus}</strong>
              </span>
            </div>

            <div className="mt-2 text-xs">
              <span className="font-semibold text-vitalis-navy">{tp.primaryDiagnosis}: </span>
              <span className="text-slate-800">{p.primaryDiagnosis}</span>
            </div>
          </div>

          {/* Quick Patient Switcher & Risk Gauge */}
          <div className="flex items-center gap-4 self-start lg:self-center">
            <div className="text-right">
              <div className="text-[11px] font-semibold uppercase text-vitalis-muted tracking-wider">
                {tp.overallDecompRisk}
              </div>
              <div className="flex items-baseline justify-end gap-1.5 mt-0.5">
                <span
                  className={cn(
                    'text-3xl font-bold font-mono',
                    p.riskScore >= 80
                      ? 'text-vitalis-critical'
                      : p.riskScore >= 60
                      ? 'text-vitalis-warning'
                      : 'text-emerald-700'
                  )}
                >
                  {p.riskScore}
                </span>
                <span className="text-xs text-vitalis-muted">/ 100</span>
              </div>
              <span className="text-[10px] text-vitalis-muted">{tp.calibratedIndex}</span>
            </div>

            <div className="border-l border-vitalis-border pl-4">
              <label className="block text-[10px] uppercase font-semibold text-vitalis-muted mb-1">
                {tp.switchPatient}
              </label>
              <select
                value={p.id}
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
        </div>
      </div>

      {/* 4 Organ Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Renal Card */}
        <div
          onClick={() => {
            setSelectedOrganTab('renal');
            setCurrentPage('organ-intelligence');
          }}
          className="bg-card rounded-lg border border-vitalis-border p-4 shadow-subtle hover:border-vitalis-blue/50 cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded bg-blue-50 text-vitalis-blue flex items-center justify-center font-bold text-xs border border-blue-100">
                R
              </div>
              <div>
                <h2 className="text-xs font-bold text-vitalis-navy group-hover:text-vitalis-blue">
                  {language === 'hi' ? 'वृक्क (Renal)' : 'Renal System'}
                </h2>
                <span className="text-[10px] text-vitalis-muted capitalize">{p.organStatuses.renal.trend}</span>
              </div>
            </div>
            <Badge
              variant={
                p.organStatuses.renal.status === 'critical'
                  ? 'critical'
                  : p.organStatuses.renal.status === 'warning'
                  ? 'warning'
                  : 'stable'
              }
              dot
              size="xs"
            >
              {p.organStatuses.renal.status}
            </Badge>
          </div>

          <div className="space-y-1.5 mt-3 pt-2 border-t border-vitalis-border/60 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-vitalis-muted text-[11px]">{language === 'hi' ? 'सीरम क्रिएटीनिन:' : 'Creatinine:'}</span>
              <span className="font-mono font-bold text-slate-900">
                {p.renal.creatinine} mg/dL
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-vitalis-muted text-[11px]">{language === 'hi' ? 'आधारभूत से अंतर:' : 'Baseline:'}</span>
              <span className="text-vitalis-critical text-[11px] font-semibold">
                {renalDev.text}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-vitalis-muted text-[11px]">{language === 'hi' ? 'मूत्र निष्कासन:' : 'Urine Output:'}</span>
              <span className="font-mono text-slate-800">{p.renal.urineOutput} mL/kg/h</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-vitalis-muted text-[11px]">{language === 'hi' ? '२४-घंटे द्रव संतुलन:' : '24h Fluid:'}</span>
              <span className="font-mono font-semibold text-amber-800">
                {p.renal.cumulativeFluidBalance24h > 0 ? '+' : ''}
                {p.renal.cumulativeFluidBalance24h} mL
              </span>
            </div>
          </div>
          <div className="mt-2 text-[10px] text-vitalis-blue flex items-center justify-end gap-1 font-medium group-hover:translate-x-0.5 transition-transform">
            <span>{tp.exploreRenal}</span>
            <ArrowRight className="w-3 h-3" />
          </div>
        </div>

        {/* Cardiac Card */}
        <div
          onClick={() => {
            setSelectedOrganTab('cardiac');
            setCurrentPage('organ-intelligence');
          }}
          className="bg-card rounded-lg border border-vitalis-border p-4 shadow-subtle hover:border-vitalis-blue/50 cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded bg-red-50 text-red-600 flex items-center justify-center font-bold text-xs border border-red-100">
                C
              </div>
              <div>
                <h2 className="text-xs font-bold text-vitalis-navy group-hover:text-vitalis-blue">
                  {language === 'hi' ? 'हृदय (Cardiac)' : 'Cardiac & Hemodynamics'}
                </h2>
                <span className="text-[10px] text-vitalis-muted capitalize">{p.organStatuses.cardiac.trend}</span>
              </div>
            </div>
            <Badge
              variant={
                p.organStatuses.cardiac.status === 'critical'
                  ? 'critical'
                  : p.organStatuses.cardiac.status === 'warning'
                  ? 'warning'
                  : 'stable'
              }
              dot
              size="xs"
            >
              {p.organStatuses.cardiac.status}
            </Badge>
          </div>

          <div className="space-y-1.5 mt-3 pt-2 border-t border-vitalis-border/60 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-vitalis-muted text-[11px]">MAP:</span>
              <span className="font-mono font-bold text-slate-900">{p.cardiac.meanArterialPressure} mmHg</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-vitalis-muted text-[11px]">{language === 'hi' ? 'आधारभूत:' : 'Baseline:'}</span>
              <span className="text-vitalis-critical text-[11px] font-semibold">
                {cardiacDev.text}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-vitalis-muted text-[11px]">{language === 'hi' ? 'हृदय गति:' : 'Heart Rate:'}</span>
              <span className="font-mono text-slate-800">{p.cardiac.heartRate} bpm</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-vitalis-muted text-[11px]">{language === 'hi' ? 'वेसोप्रेसर:' : 'Inotrope/Pressor:'}</span>
              <span className="text-[11px] font-medium text-slate-800 truncate max-w-[120px]">
                {p.cardiac.vasopressorDose || (language === 'hi' ? 'कोई नहीं' : 'None')}
              </span>
            </div>
          </div>
          <div className="mt-2 text-[10px] text-vitalis-blue flex items-center justify-end gap-1 font-medium group-hover:translate-x-0.5 transition-transform">
            <span>{tp.exploreCardiac}</span>
            <ArrowRight className="w-3 h-3" />
          </div>
        </div>

        {/* Respiratory Card */}
        <div
          onClick={() => {
            setSelectedOrganTab('respiratory');
            setCurrentPage('organ-intelligence');
          }}
          className="bg-card rounded-lg border border-vitalis-border p-4 shadow-subtle hover:border-vitalis-blue/50 cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-xs border border-teal-100">
                P
              </div>
              <div>
                <h2 className="text-xs font-bold text-vitalis-navy group-hover:text-vitalis-blue">
                  {language === 'hi' ? 'श्वसन (Pulmonary)' : 'Pulmonary & Resp'}
                </h2>
                <span className="text-[10px] text-vitalis-muted capitalize">{p.organStatuses.respiratory.trend}</span>
              </div>
            </div>
            <Badge
              variant={
                p.organStatuses.respiratory.status === 'critical'
                  ? 'critical'
                  : p.organStatuses.respiratory.status === 'warning'
                  ? 'warning'
                  : 'stable'
              }
              dot
              size="xs"
            >
              {p.organStatuses.respiratory.status}
            </Badge>
          </div>

          <div className="space-y-1.5 mt-3 pt-2 border-t border-vitalis-border/60 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-vitalis-muted text-[11px]">SpO2 / FiO2:</span>
              <span className="font-mono font-bold text-slate-900">{p.respiratory.spO2}% on {p.respiratory.fiO2}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-vitalis-muted text-[11px]">P/F Ratio:</span>
              <span className="text-vitalis-critical text-[11px] font-semibold">
                {p.respiratory.paO2FiO2Ratio} ({respDev.text})
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-vitalis-muted text-[11px]">{language === 'hi' ? 'श्वसन दर:' : 'Resp Rate:'}</span>
              <span className="font-mono text-slate-800">{p.respiratory.respiratoryRate} /min</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-vitalis-muted text-[11px]">{language === 'hi' ? 'सपोर्ट मोड:' : 'Support:'}</span>
              <span className="text-[11px] font-medium text-slate-800 truncate max-w-[120px]">
                {p.respiratory.oxygenSupportMode}
              </span>
            </div>
          </div>
          <div className="mt-2 text-[10px] text-vitalis-blue flex items-center justify-end gap-1 font-medium group-hover:translate-x-0.5 transition-transform">
            <span>{tp.explorePulmonary}</span>
            <ArrowRight className="w-3 h-3" />
          </div>
        </div>

        {/* Hepatic Card */}
        <div
          onClick={() => {
            setSelectedOrganTab('hepatic');
            setCurrentPage('organ-intelligence');
          }}
          className="bg-card rounded-lg border border-vitalis-border p-4 shadow-subtle hover:border-vitalis-blue/50 cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-xs border border-amber-100">
                H
              </div>
              <div>
                <h2 className="text-xs font-bold text-vitalis-navy group-hover:text-vitalis-blue">
                  {language === 'hi' ? 'यकृत (Hepatic)' : 'Hepatic Function'}
                </h2>
                <span className="text-[10px] text-vitalis-muted capitalize">{p.organStatuses.hepatic.trend}</span>
              </div>
            </div>
            <Badge
              variant={
                p.organStatuses.hepatic.status === 'critical'
                  ? 'critical'
                  : p.organStatuses.hepatic.status === 'warning'
                  ? 'warning'
                  : p.organStatuses.hepatic.status === 'watch'
                  ? 'watch'
                  : 'stable'
              }
              dot
              size="xs"
            >
              {p.organStatuses.hepatic.status}
            </Badge>
          </div>

          <div className="space-y-1.5 mt-3 pt-2 border-t border-vitalis-border/60 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-vitalis-muted text-[11px]">ALT / AST:</span>
              <span className="font-mono font-bold text-slate-900">{p.hepatic.alt} / {p.hepatic.ast} U/L</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-vitalis-muted text-[11px]">{language === 'hi' ? 'आधारभूत:' : 'Baseline:'}</span>
              <span className="text-amber-800 text-[11px] font-semibold">
                {hepaticDev.text}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-vitalis-muted text-[11px]">Total Bilirubin:</span>
              <span className="font-mono text-slate-800">{p.hepatic.totalBilirubin} mg/dL</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-vitalis-muted text-[11px]">Albumin / INR:</span>
              <span className="text-[11px] font-mono text-slate-800">
                {p.hepatic.albumin} g/dL | {p.hepatic.inr}
              </span>
            </div>
          </div>
          <div className="mt-2 text-[10px] text-vitalis-blue flex items-center justify-end gap-1 font-medium group-hover:translate-x-0.5 transition-transform">
            <span>{tp.exploreHepatic}</span>
            <ArrowRight className="w-3 h-3" />
          </div>
        </div>
      </div>

      {/* Main Longitudinal Trend Chart (Past 48 Hours) */}
      <div className="bg-card rounded-lg border border-vitalis-border p-5 shadow-subtle space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-vitalis-navy flex items-center gap-2">
              <Activity className="w-4 h-4 text-vitalis-blue" />
              {tp.trajectoryTitle}
            </h2>
            <p className="text-xs text-vitalis-muted mt-0.5">
              {tp.trajectorySubtitle}
            </p>
          </div>

          {/* Metric Selector Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 bg-[#F3F6FA] p-1 rounded-md border border-vitalis-border">
            {[
              { id: 'composite', label: language === 'hi' ? 'समग्र जोखिम (Composite)' : 'Composite Risk' },
              { id: 'renal', label: language === 'hi' ? 'वृक्क (Cr & Output)' : 'Renal (Cr & Output)' },
              { id: 'cardiac', label: language === 'hi' ? 'हृदय (MAP & HR)' : 'Cardiac (MAP & HR)' },
              { id: 'respiratory', label: language === 'hi' ? 'श्वसन (SpO2 & P/F)' : 'Resp (SpO2 & P/F)' },
              { id: 'hepatic', label: language === 'hi' ? 'यकृत (Enzymes)' : 'Hepatic (Transaminases)' },
            ].map((btn) => (
              <button
                key={btn.id}
                onClick={() => setActiveChartMetric(btn.id as any)}
                className={cn(
                  'px-2.5 py-1 text-xs rounded font-medium transition-all',
                  activeChartMetric === btn.id
                    ? 'bg-white text-vitalis-navy font-semibold shadow-subtle'
                    : 'text-vitalis-muted hover:text-vitalis-text'
                )}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>

        {/* Recharts Multi-line chart */}
        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#DCE4EF" vertical={false} />
              <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#64748B' }} stroke="#DCE4EF" />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748B' }} stroke="#DCE4EF" />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-white border border-vitalis-border p-3 rounded shadow-elevated text-xs space-y-1">
                        <div className="font-semibold text-vitalis-navy pb-1 border-b border-vitalis-border">
                          {language === 'hi' ? 'समय:' : 'Hour:'} {label}
                        </div>
                        {payload.map((entry, idx) => (
                          <div key={idx} className="flex justify-between gap-4 font-mono">
                            <span style={{ color: entry.color }}>{entry.name}:</span>
                            <span className="font-bold">{entry.value}</span>
                          </div>
                        ))}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <ReferenceLine y={80} stroke="#DC2626" strokeDasharray="3 3" label={{ value: language === 'hi' ? 'अति-गंभीर (80)' : 'Critical (80)', fill: '#DC2626', fontSize: 10, position: 'insideTopRight' }} />
              <ReferenceLine y={60} stroke="#D97706" strokeDasharray="3 3" label={{ value: language === 'hi' ? 'गंभीर चेतावनी (60)' : 'Warning (60)', fill: '#D97706', fontSize: 10, position: 'insideTopRight' }} />

              {activeChartMetric === 'composite' && (
                <>
                  <Line type="monotone" dataKey="composite" name={tp.compositeRisk} stroke="#123B82" strokeWidth={3} dot={false} />
                  <Line type="monotone" dataKey="renal" name="Renal Severity" stroke="#2563EB" strokeWidth={1.5} dot={false} strokeDasharray="4 2" />
                  <Line type="monotone" dataKey="cardiac" name="Cardiac Severity" stroke="#DC2626" strokeWidth={1.5} dot={false} strokeDasharray="4 2" />
                  <Line type="monotone" dataKey="respiratory" name="Resp Severity" stroke="#0D9488" strokeWidth={1.5} dot={false} strokeDasharray="4 2" />
                </>
              )}

              {activeChartMetric === 'renal' && (
                <>
                  <Line type="monotone" dataKey="renal" name="Renal Score" stroke="#2563EB" strokeWidth={2.5} dot={false} />
                  <Line type="monotone" dataKey="creatinine" name="Creatinine (mg/dL)" stroke="#0D9488" strokeWidth={2} dot={false} />
                </>
              )}

              {activeChartMetric === 'cardiac' && (
                <>
                  <Line type="monotone" dataKey="cardiac" name="Cardiac Score" stroke="#DC2626" strokeWidth={2.5} dot={false} />
                  <Line type="monotone" dataKey="map" name="MAP (mmHg)" stroke="#123B82" strokeWidth={1.5} dot={false} />
                </>
              )}

              {activeChartMetric === 'respiratory' && (
                <>
                  <Line type="monotone" dataKey="respiratory" name="Resp Score" stroke="#0D9488" strokeWidth={2.5} dot={false} />
                  <Line type="monotone" dataKey="spO2" name="SpO2 (%)" stroke="#2563EB" strokeWidth={1.5} dot={false} />
                </>
              )}

              {activeChartMetric === 'hepatic' && (
                <Line type="monotone" dataKey="hepatic" name="Hepatic Score" stroke="#D97706" strokeWidth={2.5} dot={false} />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Lower Dual Grid: Cascade & FutureCast Previews + Explainability & Data Trust */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Cascade Graph Preview & FutureCast Preview */}
        <div className="space-y-6">
          {/* Cascade Graph Preview */}
          <div className="bg-card rounded-lg border border-vitalis-border p-5 shadow-subtle space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Network className="w-4 h-4 text-vitalis-navy" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-vitalis-navy">
                  {tp.cascadePreviewTitle}
                </h3>
              </div>
              <button
                onClick={() => setCurrentPage('cascade-graph')}
                className="text-xs font-semibold text-vitalis-blue hover:underline flex items-center gap-1"
              >
                {tp.openFullGraph} <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="bg-slate-50 border border-vitalis-border rounded-md p-4 text-xs space-y-2.5">
              <div className="flex items-center justify-between pb-2 border-b border-vitalis-border">
                <span className="font-semibold text-slate-800">{language === 'hi' ? 'प्रारंभिक उत्तेजक अङ्ग:' : 'Primary Initiating Organ:'}</span>
                <span className="font-semibold text-vitalis-navy">{language === 'hi' ? 'रक्तचाप / सेप्टिक फैलाव (घंटा ०)' : 'Hemodynamics / Septic Vasodilation (Hour 0)'}</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-vitalis-border">
                <span className="font-semibold text-slate-800">{language === 'hi' ? 'द्वितीयक सोपान:' : 'Secondary Cascade:'}</span>
                <span className="font-semibold text-vitalis-critical">{language === 'hi' ? 'वृक्क नलिका इस्किमिया (घंटा +८)' : 'Renal Tubular Ischemia (Hour +8)'}</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-vitalis-border">
                <span className="font-semibold text-slate-800">{language === 'hi' ? 'तृतीयक संचय:' : 'Tertiary Accumulation:'}</span>
                <span className="font-semibold text-amber-800">{language === 'hi' ? 'द्रव अधिभार (+३.८L) → फेफड़ा शोफ (+२४)' : 'Fluid Overload (+3.8L) → Pulm Edema (Hour +24)'}</span>
              </div>
              <p className="text-[11px] text-vitalis-muted pt-1">
                {language === 'hi'
                  ? 'सोपान दिशात्मक कड़ियाँ दर्शाती हैं कि किस प्रकार रक्तचाप में गिरावट ने वृक्क निस्यंदन को बाधित किया और द्रव संचय को जन्म दिया।'
                  : 'Sequential temporal directional links demonstrate how vasoplegia impaired microvascular filtration, triggering positive fluid retention and alveolar leak.'}
              </p>
            </div>
          </div>

          {/* FutureCast Trajectory Preview */}
          <div className="bg-card rounded-lg border border-vitalis-border p-5 shadow-subtle space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-vitalis-navy" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-vitalis-navy">
                  {tp.futurecastPreviewTitle}
                </h3>
              </div>
              <button
                onClick={() => setCurrentPage('futurecast')}
                className="text-xs font-semibold text-vitalis-blue hover:underline flex items-center gap-1"
              >
                {tp.openFuturecast} <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="bg-slate-50 border border-vitalis-border rounded-md p-4 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-vitalis-muted">{language === 'hi' ? '२४-घंटे विफलता अनुमान:' : '24-Hour Predicted Decompensation:'}</span>
                <span className="font-mono font-bold text-sm text-vitalis-critical">84.5% {language === 'hi' ? 'जोखिम' : 'Risk'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-vitalis-muted">{language === 'hi' ? 'अनुमानित सीमा:' : 'Trajectory Projected Range:'}</span>
                <span className="font-mono text-slate-800 font-semibold">88 → 95 Score</span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mt-1">
                <div className="bg-vitalis-critical h-full rounded-full" style={{ width: '84.5%' }} />
              </div>
              <p className="text-[11px] text-vitalis-muted pt-1">
                {language === 'hi'
                  ? 'अनुरूप अनिश्चितता सीमा: ±१२.८%। प्रक्षेपवक्र को मोड़ने हेतु प्रारंभिक CRRT मूल्यांकन अनुशंसित।'
                  : 'Conformal uncertainty bound: ±12.8%. Model suggests aggressive fluid restriction or early CRRT evaluation to deflect trajectory.'}
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Explainability Panel & Data Trust Summary */}
        <div className="space-y-6">
          {/* Explainability Panel */}
          <div className="bg-card rounded-lg border border-vitalis-border p-5 shadow-subtle space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-vitalis-navy" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-vitalis-navy">
                  {tp.explainabilityTitle}
                </h3>
              </div>
              <span className="text-[10px] font-semibold text-vitalis-muted bg-slate-100 px-2 py-0.5 rounded">
                {tp.attributionWeights}
              </span>
            </div>

            <div className="space-y-3">
              {p.explainabilityFactors.map((factor, idx) => {
                return (
                  <div key={idx} className="border-b border-vitalis-border/60 pb-2.5 last:border-0 last:pb-0 text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-slate-800">
                        {factor.factor}
                      </span>
                      <span className="font-mono font-bold text-vitalis-navy">
                        {factor.weight}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mb-1.5">
                      <div
                        className={cn(
                          'h-full rounded-full',
                          factor.organ === 'renal'
                            ? 'bg-vitalis-blue'
                            : factor.organ === 'cardiac'
                            ? 'bg-vitalis-critical'
                            : factor.organ === 'respiratory'
                            ? 'bg-vitalis-teal'
                            : 'bg-amber-600'
                        )}
                        style={{ width: `${factor.weight}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-vitalis-muted leading-relaxed">
                      {factor.clinicalContext}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Data Trust Summary Card */}
          <div className="bg-card rounded-lg border border-vitalis-border p-5 shadow-subtle space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-vitalis-teal" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-vitalis-navy">
                  {tp.dataTrustTitle}
                </h3>
              </div>
              <button
                onClick={() => setCurrentPage('data-trust')}
                className="text-xs font-semibold text-vitalis-blue hover:underline flex items-center gap-1"
              >
                {tp.inspectQuality} <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-50 border border-vitalis-border rounded p-2.5">
                <span className="text-[10px] text-vitalis-muted uppercase tracking-wider block">{tp.completeness}</span>
                <span className="font-mono font-bold text-slate-800 text-base">{p.dataQuality.overallCompleteness}%</span>
                <span className="text-[10px] text-emerald-600 block mt-0.5">
                  {language === 'hi' ? 'निरंतर टेलीमेट्री उच्च सटीकता' : 'Continuous vitals high fidelity'}
                </span>
              </div>
              <div className="bg-slate-50 border border-vitalis-border rounded p-2.5">
                <span className="text-[10px] text-vitalis-muted uppercase tracking-wider block">{tp.consistency}</span>
                <span className="font-mono font-bold text-slate-800 text-base">{p.dataQuality.measurementConsistency}%</span>
                <span className="text-[10px] text-emerald-600 block mt-0.5">
                  {language === 'hi' ? 'कोई सेंसर विचलन नहीं' : 'No sensor drift observed'}
                </span>
              </div>
            </div>

            {p.dataQuality.flags.length > 0 && (
              <div className="text-[11px] bg-amber-50 border border-amber-200 rounded p-2 text-amber-900 space-y-1">
                <div className="font-semibold flex items-center gap-1 text-amber-800">
                  <AlertTriangle className="w-3 h-3 text-amber-700" />
                  <span>{language === 'hi' ? 'टेलीमेट्री ऑडिट सूचनाएं:' : 'Telemetry Audit Notifications:'}</span>
                </div>
                <ul className="list-disc pl-4 space-y-0.5 text-[10px]">
                  {p.dataQuality.flags.map((flag, fIdx) => (
                    <li key={fIdx}>{flag}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
