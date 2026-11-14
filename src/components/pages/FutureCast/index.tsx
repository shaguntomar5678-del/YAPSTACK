import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import {
  TrendingUp,
  ShieldAlert,
  Layers,
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { futurecastService } from '../../../services/futurecastService';
import { FutureCastPrediction, PredictionHorizon } from '../../../types/futurecast';
import { Badge } from '../../common/Badge';
import { MetricCard } from '../../common/MetricCard';
import { cn } from '../../../utils/cn';

export const FutureCast: React.FC = () => {
  const { selectedPatient, patients, setSelectedPatientId, language, t } = useApp();
  const [horizon, setHorizon] = useState<PredictionHorizon>('24h');
  const [prediction, setPrediction] = useState<FutureCastPrediction | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (selectedPatient) {
      setLoading(true);
      futurecastService.getPrediction(selectedPatient.id, horizon).then((res) => {
        setPrediction(res);
        setLoading(false);
      });
    }
  }, [selectedPatient, horizon]);

  if (!selectedPatient) return null;

  const tf = t.futurecast;

  // Chart data formatting with shaded uncertainty interval
  const chartPoints = prediction
    ? prediction.trajectory.map((p) => ({
        time: p.hourOffset === 0 ? (language === 'hi' ? 'वर्तमान' : 'Now') : p.hourOffset > 0 ? `+${p.hourOffset}h` : `${p.hourOffset}h`,
        actual: p.isHistorical ? p.actualRiskScore : undefined,
        median: !p.isHistorical || p.hourOffset === 0 ? p.projectedMedian : undefined,
        worsening: !p.isHistorical || p.hourOffset === 0 ? p.worseningScenario : undefined,
        stable: !p.isHistorical || p.hourOffset === 0 ? p.stableScenario : undefined,
        uncertaintyLower: !p.isHistorical ? p.uncertaintyLower : undefined,
        uncertaintyRange: !p.isHistorical ? [p.uncertaintyLower, p.uncertaintyUpper] : undefined,
        isHistorical: p.isHistorical,
      }))
    : [];

  return (
    <div className="space-y-6">
      {/* Header with Horizon Selector & Patient Switcher */}
      <div className="bg-card rounded-lg border border-vitalis-border p-5 shadow-subtle flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-vitalis-navy flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-vitalis-blue" />
              {tf.title}
            </h1>
            <Badge variant="navy" size="xs">
              {language === 'hi' ? 'अनुरूप पूर्वानुमान' : 'Conformal Forecast'}
            </Badge>
          </div>
          <p className="text-xs text-vitalis-muted mt-0.5">
            {tf.subtitle}
          </p>
        </div>

        {/* Controls: Horizon Selector & Patient Picker */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center bg-[#F3F6FA] p-1 rounded-md border border-vitalis-border text-xs">
            {(['6h', '12h', '24h', '48h'] as PredictionHorizon[]).map((hz) => (
              <button
                key={hz}
                onClick={() => setHorizon(hz)}
                className={cn(
                  'px-3 py-1 rounded font-medium transition-all',
                  horizon === hz
                    ? 'bg-vitalis-navy text-white shadow-subtle font-semibold'
                    : 'text-vitalis-muted hover:text-vitalis-navy'
                )}
              >
                {hz} {tf.horizon}
              </button>
            ))}
          </div>

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

      {/* 4 Summary Prediction Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          title={tf.decompRisk}
          value={prediction ? `${prediction.decompensationProbability}%` : '--'}
          subtitle={`Over next ${horizon}`}
          deltaText={language === 'hi' ? 'उच्च जोखिम प्रक्षेपवक्र' : 'High Risk Trajectory'}
          deltaSeverity="critical"
        />
        <MetricCard
          title={tf.projectedSeverity}
          value={prediction ? prediction.projectedRiskScoreMedian : '--'}
          unit="/ 100"
          baseline={prediction?.baselineRiskScore}
          deltaText={prediction ? `+${prediction.projectedRiskScoreMedian - prediction.baselineRiskScore} pts projected` : ''}
          deltaSeverity="warning"
        />
        <MetricCard
          title={tf.conformalUncertainty}
          value={prediction ? `±${prediction.conformalUncertaintyPercent}%` : '--'}
          subtitle="90% Coverage Guarantee"
          deltaText="Conformal quantile interval"
          deltaSeverity="normal"
        />
        <MetricCard
          title={tf.interventionWindow}
          value="4 - 6 Hours"
          subtitle={language === 'hi' ? 'अपरिवर्तनीय विफलता पूर्व' : 'Before irreversible tubular insult'}
          deltaText={language === 'hi' ? 'तत्काल हस्तक्षेप खिड़की' : 'Urgent window'}
          deltaSeverity="warning"
        />
      </div>

      {/* Main Trajectory Projection Chart */}
      <div className="bg-card rounded-lg border border-vitalis-border p-5 shadow-subtle space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-vitalis-navy">
              {language === 'hi' ? `दीर्घकालिक पूर्वानुमान एवं परिदृश्य अनुकरण (${horizon})` : `Longitudinal Forecast & Scenario Simulation (${horizon} Window)`}
            </h2>
            <p className="text-[11px] text-vitalis-muted mt-0.5">
              {language === 'hi' ? 'विगत १२ घंटों के प्रेक्षण एवं आगामी अनुमानित प्रक्षेपवक्र' : 'Historical telemetry observations (-12h to 0h) combined with illustrative future risk paths'}
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-vitalis-navy rounded-sm" />
              <span className="font-medium text-slate-800">{language === 'hi' ? 'वास्तविक प्रेक्षित' : 'Historical Actual'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-vitalis-blue inline-block border-t-2 border-dashed border-vitalis-blue" />
              <span className="font-medium text-vitalis-blue">{language === 'hi' ? 'अनुमानित माध्यिका' : 'Projected Median'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-red-600 inline-block" />
              <span className="font-medium text-red-600">{language === 'hi' ? 'गंभीरता पथ' : 'Worsening Path'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-emerald-600 inline-block" />
              <span className="font-medium text-emerald-600">{language === 'hi' ? 'उपचारित पथ' : 'Mitigated Path'}</span>
            </div>
          </div>
        </div>

        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartPoints} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#DCE4EF" vertical={false} />
              <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#64748B' }} stroke="#DCE4EF" />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748B' }} stroke="#DCE4EF" />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-white border border-vitalis-border p-3 rounded shadow-elevated text-xs space-y-1">
                        <div className="font-semibold text-vitalis-navy border-b border-vitalis-border pb-1">
                          {language === 'hi' ? 'समय अंतराल:' : 'Offset:'} {label}
                        </div>
                        {payload.map((e, idx) => (
                          e.value !== undefined && (
                            <div key={idx} className="flex justify-between gap-4 font-mono">
                              <span style={{ color: e.color }}>{e.name}:</span>
                              <span className="font-bold">{Array.isArray(e.value) ? `${e.value[0]} - ${e.value[1]}` : e.value}</span>
                            </div>
                          )
                        ))}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <ReferenceLine x={language === 'hi' ? 'वर्तमान' : 'Now'} stroke="#123B82" strokeWidth={1.5} label={{ value: language === 'hi' ? 'वर्तमान समय' : 'CURRENT HOUR', fill: '#123B82', fontSize: 10, position: 'top' }} />

              <Area type="monotone" dataKey="uncertaintyRange" name={tf.conformalUncertainty} fill="#2563EB" fillOpacity={0.10} stroke="none" />
              <Line type="monotone" dataKey="actual" name="Historical Observed" stroke="#123B82" strokeWidth={3} dot={{ r: 3, fill: '#123B82' }} connectNulls={false} />
              <Line type="monotone" dataKey="median" name="Projected Median" stroke="#2563EB" strokeWidth={2.5} strokeDasharray="5 3" dot={false} connectNulls={false} />
              <Line type="monotone" dataKey="worsening" name="Worsening Trajectory" stroke="#DC2626" strokeWidth={2} strokeDasharray="2 2" dot={false} connectNulls={false} />
              <Line type="monotone" dataKey="stable" name="Mitigated Path" stroke="#059669" strokeWidth={2} strokeDasharray="3 3" dot={false} connectNulls={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Evidence & Model Limitations Dual Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Primary Risk Drivers */}
        <div className="bg-card rounded-lg border border-vitalis-border p-5 shadow-subtle space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-vitalis-navy flex items-center gap-2">
              <Layers className="w-4 h-4 text-vitalis-navy" />
              {tf.keyDrivers}
            </h3>
            <span className="text-[10px] text-vitalis-muted">Ranked by Model Influence</span>
          </div>

          <div className="space-y-3">
            {prediction?.primaryRiskDrivers.map((driver, idx) => {
              const organColors = {
                renal: 'text-vitalis-blue border-blue-200 bg-blue-50',
                cardiac: 'text-red-700 border-red-200 bg-red-50',
                respiratory: 'text-teal-700 border-teal-200 bg-teal-50',
                hepatic: 'text-amber-800 border-amber-200 bg-amber-50',
              };

              return (
                <div key={idx} className="border border-vitalis-border rounded-md p-3 text-xs space-y-1.5 bg-slate-50/40">
                  <div className="flex items-center justify-between">
                    <span className={cn('px-2 py-0.5 rounded font-semibold text-[10px] border uppercase', organColors[driver.organ])}>
                      {driver.organ} SYSTEM
                    </span>
                    <span className="font-mono text-[11px] text-vitalis-muted">
                      CI: <strong className="text-slate-800">{driver.confidenceInterval}</strong>
                    </span>
                  </div>
                  <div className="font-semibold text-slate-800">
                    {driver.factor}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-2 border-t border-vitalis-border space-y-1.5">
            <span className="text-[11px] font-bold text-vitalis-navy uppercase tracking-wider">
              {language === 'hi' ? 'नैदानिक दिशानिर्देश आधार:' : 'Consensus Diagnostic Criteria Grounding:'}
            </span>
            <ul className="list-disc pl-4 space-y-1 text-[11px] text-slate-600">
              {prediction?.clinicalEvidencePoints.map((pt, i) => (
                <li key={i}>{pt}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Model Limitations & Regulatory Governance */}
        <div className="bg-card rounded-lg border border-vitalis-border p-5 shadow-subtle space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-vitalis-navy flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-700" />
              {tf.algorithmicLimitations}
            </h3>
            <span className="text-[10px] bg-amber-100 text-amber-900 px-2 py-0.5 rounded font-semibold">
              AngaSutra Research
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="p-3 bg-slate-50 border border-vitalis-border rounded-md space-y-1.5">
              <span className="font-bold text-slate-800">{language === 'hi' ? 'मान्यता एवं सीमाएं:' : 'Assumptions & Caveats:'}</span>
              <ul className="list-disc pl-4 space-y-1 text-[11px] text-vitalis-muted">
                {prediction?.modelLimitations.map((lim, i) => (
                  <li key={i}>{lim}</li>
                ))}
              </ul>
            </div>

            <div className="p-3 bg-sky-50 border border-sky-100 rounded-md text-[11px] text-sky-950 leading-relaxed space-y-1">
              <span className="font-bold text-vitalis-navy block">{tf.clinicianInTheLoop}:</span>
              {language === 'hi'
                ? 'अङ्गसूत्र प्रक्षेपवक्र नैदानिक शोध एवं दृश्यता हेतु तैयार किए गए हैं। किसी भी स्थिति में एल्गोरिथम अनुमान चिकित्सक के प्रत्यक्ष परीक्षण से ऊपर नहीं हो सकते।'
                : 'FutureCast trajectories are generated for clinical visualization and interface research only. Under no circumstances should algorithmic predictions override bedside hemodynamic assessment or diagnostic protocols.'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
