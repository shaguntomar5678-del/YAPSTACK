import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ReferenceLine,
} from 'recharts';
import {
  Droplets,
  Heart,
  Wind,
  Activity,
  ArrowRight,
  Layers,
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { OrganType } from '../../../types/organ';
import { Badge } from '../../common/Badge';
import { MetricCard } from '../../common/MetricCard';
import { formatTimeOnly, getDeviationBadge } from '../../../utils/formatters';
import { cn } from '../../../utils/cn';

export const OrganIntelligence: React.FC = () => {
  const {
    selectedPatient,
    selectedOrganTab,
    setSelectedOrganTab,
    setCurrentPage,
    language,
    t,
  } = useApp();

  if (!selectedPatient) {
    return (
      <div className="p-8 text-center text-vitalis-muted">
        <p>{language === 'hi' ? 'कोई रोगी चयनित नहीं है।' : 'No patient selected.'}</p>
      </div>
    );
  }

  const p = selectedPatient;

  // Chart data extraction
  const organChartData = p.timeSeries.map((pt) => ({
    time: formatTimeOnly(pt.timestamp),
    creatinine: pt.creatinine,
    eGFR: pt.eGFR,
    urineOutput: pt.urineOutput,
    fluidBalance: pt.fluidBalance,
    alt: pt.alt,
    ast: pt.ast,
    bilirubin: pt.bilirubin,
    albumin: pt.albumin,
    heartRate: pt.heartRate,
    map: pt.map,
    troponin: pt.troponin,
    spO2: pt.spO2,
    respiratoryRate: pt.respiratoryRate,
    fiO2: pt.fiO2,
  }));

  const tabs: { id: OrganType; labelEn: string; labelHi: string; icon: React.ReactNode; letter: string }[] = [
    { id: 'renal', labelEn: 'Renal Function', labelHi: 'वृक्क कार्यप्रणाली (Renal)', icon: <Droplets className="w-4 h-4" />, letter: 'R' },
    { id: 'cardiac', labelEn: 'Cardiac & Hemodynamics', labelHi: 'हृदय एवं रक्तचाप (Cardiac)', icon: <Heart className="w-4 h-4" />, letter: 'C' },
    { id: 'respiratory', labelEn: 'Respiratory & Pulm', labelHi: 'श्वसन एवं फेफड़े (Respiratory)', icon: <Wind className="w-4 h-4" />, letter: 'P' },
    { id: 'hepatic', labelEn: 'Hepatic Function', labelHi: 'यकृत कार्यप्रणाली (Hepatic)', icon: <Activity className="w-4 h-4" />, letter: 'H' },
  ];

  const currentTab = tabs.find((tb) => tb.id === selectedOrganTab);

  return (
    <div className="space-y-6">
      {/* Header with Patient Summary & Organ Switcher */}
      <div className="bg-card rounded-lg border border-vitalis-border p-4 shadow-subtle flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-vitalis-navy">
              {language === 'hi'
                ? `अङ्ग प्रज्ञा: ${currentTab?.labelHi}`
                : `Organ Intelligence: ${currentTab?.labelEn}`}
            </h1>
            <Badge
              variant={
                p.organStatuses[selectedOrganTab].status === 'critical'
                  ? 'critical'
                  : p.organStatuses[selectedOrganTab].status === 'warning'
                  ? 'warning'
                  : 'stable'
              }
              dot
              size="sm"
            >
              {p.organStatuses[selectedOrganTab].status.toUpperCase()}
            </Badge>
          </div>
          <p className="text-xs text-vitalis-muted mt-0.5">
            {language === 'hi'
              ? `${p.name} (${p.bed}) हेतु लक्षित बायोमार्कर गतिशीलता एवं सोपान संबंध`
              : `Focused biomarker dynamics, observation log, and cross-organ physiological coupling for ${p.name} (${p.bed})`}
          </p>
        </div>

        {/* Organ Tab Navigation Bar */}
        <div className="flex items-center gap-1.5 bg-[#F3F6FA] p-1.5 rounded-lg border border-vitalis-border">
          {tabs.map((tab) => {
            const isActive = selectedOrganTab === tab.id;
            const orgStatus = p.organStatuses[tab.id];
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedOrganTab(tab.id)}
                className={cn(
                  'flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold transition-all',
                  isActive
                    ? 'bg-vitalis-navy text-white shadow-subtle'
                    : 'text-vitalis-muted hover:text-vitalis-navy hover:bg-slate-200/60'
                )}
              >
                <span>{tab.letter}</span>
                <span className="hidden sm:inline">
                  {language === 'hi' ? tab.labelHi.split(' ')[0] : tab.labelEn.split(' ')[0]}
                </span>
                <span
                  className={cn(
                    'w-2 h-2 rounded-full',
                    orgStatus.status === 'critical'
                      ? 'bg-red-400'
                      : orgStatus.status === 'warning'
                      ? 'bg-amber-400'
                      : 'bg-emerald-400'
                  )}
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* RENAL VIEW */}
      {selectedOrganTab === 'renal' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricCard
              title={language === 'hi' ? 'सीरम क्रिएटीनिन' : 'Serum Creatinine'}
              value={p.renal.creatinine}
              unit="mg/dL"
              baseline={p.renal.creatinineBaseline}
              deltaText={getDeviationBadge(p.renal.creatinine, p.renal.creatinineBaseline, true).text}
              deltaDirection="up"
              deltaSeverity="critical"
            />
            <MetricCard
              title={language === 'hi' ? 'अनुमानित GFR' : 'Estimated GFR'}
              value={p.renal.eGFR}
              unit="mL/min"
              baseline={p.renal.eGFRBaseline}
              deltaText={getDeviationBadge(p.renal.eGFR, p.renal.eGFRBaseline, false).text}
              deltaDirection="down"
              deltaSeverity="critical"
            />
            <MetricCard
              title={language === 'hi' ? 'मूत्र निष्कासन (४ घंटे)' : 'Urine Output (4h Avg)'}
              value={p.renal.urineOutput}
              unit="mL/kg/h"
              baseline={p.renal.urineOutputBaseline}
              deltaText={language === 'hi' ? 'अल्पमूत्र सीमा (< 0.5)' : 'Oliguric range (< 0.5)'}
              deltaDirection="down"
              deltaSeverity="critical"
            />
            <MetricCard
              title={language === 'hi' ? '२४-घंटे संचयी द्रव' : 'Cumulative 24h Fluid'}
              value={p.renal.cumulativeFluidBalance24h > 0 ? `+${p.renal.cumulativeFluidBalance24h}` : p.renal.cumulativeFluidBalance24h}
              unit="mL"
              baseline="+250"
              deltaText={language === 'hi' ? 'गंभीर द्रव अधिभार' : 'Significant Fluid Overload'}
              deltaDirection="up"
              deltaSeverity="warning"
              alertBadge={p.renal.kdigoStage}
            />
          </div>

          <div className="bg-card rounded-lg border border-vitalis-border p-5 shadow-subtle space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-vitalis-navy flex items-center gap-2">
                <Activity className="w-4 h-4 text-vitalis-blue" />
                {language === 'hi' ? 'वृक्क निस्यंदन गतिशीलता (क्रिएटीनिन बनाम मूत्र निष्कासन)' : 'Renal Filtration Dynamics (Creatinine vs Urine Output over 48h)'}
              </h3>
              <span className="text-[11px] text-vitalis-muted">KDIGO Criteria: {p.renal.kdigoStage}</span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={organChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#DCE4EF" vertical={false} />
                  <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#64748B' }} stroke="#DCE4EF" />
                  <YAxis yAxisId="left" domain={[0, 4]} tick={{ fontSize: 11, fill: '#2563EB' }} stroke="#2563EB" />
                  <YAxis yAxisId="right" orientation="right" domain={[0, 1.5]} tick={{ fontSize: 11, fill: '#0D9488' }} stroke="#0D9488" />
                  <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#DCE4EF', fontSize: '12px' }} />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                  <ReferenceLine yAxisId="right" y={0.5} stroke="#DC2626" strokeDasharray="3 3" label={{ value: 'Oliguria Cutoff (0.5)', fill: '#DC2626', fontSize: 10 }} />
                  <Line yAxisId="left" type="monotone" dataKey="creatinine" name="Creatinine (mg/dL)" stroke="#2563EB" strokeWidth={2.5} dot={false} />
                  <Line yAxisId="right" type="monotone" dataKey="urineOutput" name="Urine Output (mL/kg/h)" stroke="#0D9488" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Observations Table */}
          <div className="bg-card rounded-lg border border-vitalis-border p-5 shadow-subtle space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-vitalis-navy">
              {language === 'hi' ? 'वृक्क प्रयोगशाला परीक्षण एवं प्रेक्षण' : 'Renal Lab Observations & Clinical Markers'}
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-vitalis-border text-vitalis-muted uppercase tracking-wider text-[10px] bg-slate-50/60">
                    <th className="py-2 px-3">{language === 'hi' ? 'परीक्षण' : 'Measurement'}</th>
                    <th className="py-2 px-3">{language === 'hi' ? 'वर्तमान मान' : 'Current'}</th>
                    <th className="py-2 px-3">{language === 'hi' ? 'संदर्भ सीमा' : 'Reference Range'}</th>
                    <th className="py-2 px-3">{language === 'hi' ? 'आधारभूत' : 'Baseline'}</th>
                    <th className="py-2 px-3">{language === 'hi' ? 'स्थिति' : 'Status'}</th>
                    <th className="py-2 px-3">{language === 'hi' ? 'चिकित्सकीय मूल्यांकन' : 'Clinical Evaluation'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-vitalis-border/60">
                  <tr>
                    <td className="py-2 px-3 font-semibold text-vitalis-text">Serum Creatinine</td>
                    <td className="py-2 px-3 font-mono font-bold text-red-700">{p.renal.creatinine} mg/dL</td>
                    <td className="py-2 px-3 text-vitalis-muted font-mono">0.6 - 1.1 mg/dL</td>
                    <td className="py-2 px-3 font-mono">{p.renal.creatinineBaseline} mg/dL</td>
                    <td className="py-2 px-3"><Badge variant="critical" size="xs">Critical (+211%)</Badge></td>
                    <td className="py-2 px-3 text-slate-700">Fulfils KDIGO Stage 3 criteria based on 3x increase above admission baseline.</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-semibold text-vitalis-text">eGFR (CKD-EPI)</td>
                    <td className="py-2 px-3 font-mono font-bold text-red-700">{p.renal.eGFR} mL/min</td>
                    <td className="py-2 px-3 text-vitalis-muted font-mono">&gt; 90 mL/min</td>
                    <td className="py-2 px-3 font-mono">{p.renal.eGFRBaseline} mL/min</td>
                    <td className="py-2 px-3"><Badge variant="critical" size="xs">Severe Drop</Badge></td>
                    <td className="py-2 px-3 text-slate-700">Depressed filtration capability; nephrotoxic drug dosing adjustment required.</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-semibold text-vitalis-text">Blood Urea Nitrogen (BUN)</td>
                    <td className="py-2 px-3 font-mono font-bold text-amber-800">{p.renal.bloodUreaNitrogen} mg/dL</td>
                    <td className="py-2 px-3 text-vitalis-muted font-mono">7 - 20 mg/dL</td>
                    <td className="py-2 px-3 font-mono">18 mg/dL</td>
                    <td className="py-2 px-3"><Badge variant="warning" size="xs">High</Badge></td>
                    <td className="py-2 px-3 text-slate-700">BUN/Cr ratio ~23:1 indicating mixed prerenal azotemia and intrinsic tubular injury.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* CARDIAC VIEW */}
      {selectedOrganTab === 'cardiac' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricCard
              title={language === 'hi' ? 'माध्य धमनी दाब (MAP)' : 'Mean Arterial Pressure'}
              value={p.cardiac.meanArterialPressure}
              unit="mmHg"
              baseline={p.cardiac.mapBaseline}
              deltaText={getDeviationBadge(p.cardiac.meanArterialPressure, p.cardiac.mapBaseline, false).text}
              deltaDirection="down"
              deltaSeverity="critical"
            />
            <MetricCard
              title={language === 'hi' ? 'हृदय गति (HR)' : 'Heart Rate'}
              value={p.cardiac.heartRate}
              unit="bpm"
              baseline={p.cardiac.heartRateBaseline}
              deltaText={getDeviationBadge(p.cardiac.heartRate, p.cardiac.heartRateBaseline, true).text}
              deltaDirection="up"
              deltaSeverity="warning"
            />
            <MetricCard
              title="Troponin I"
              value={p.cardiac.troponinI}
              unit="ng/mL"
              baseline="< 0.04"
              deltaText="Myocardial Demand Stress"
              deltaSeverity="warning"
            />
            <MetricCard
              title={language === 'hi' ? 'वेसोप्रेसर अनुमापन' : 'Vasopressor Titration'}
              value={p.cardiac.vasopressorDose ? 'Active' : (language === 'hi' ? 'कोई नहीं' : 'None')}
              subtitle={p.cardiac.vasopressorDose || (language === 'hi' ? 'स्थिर' : 'Off inotropes')}
              deltaSeverity={p.cardiac.vasopressorDose ? 'critical' : 'normal'}
            />
          </div>

          <div className="bg-card rounded-lg border border-vitalis-border p-5 shadow-subtle space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-vitalis-navy flex items-center gap-2">
                <Heart className="w-4 h-4 text-red-600" />
                {language === 'hi' ? 'हेमोडायनामिक परफ्यूजन प्रोफ़ाइल (MAP बनाम हृदय गति)' : 'Hemodynamic Perfusion Profile (MAP vs Heart Rate over 48h)'}
              </h3>
              <span className="text-[11px] text-vitalis-muted">ECG: {p.cardiac.ecgRhythm}</span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={organChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#DCE4EF" vertical={false} />
                  <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#64748B' }} stroke="#DCE4EF" />
                  <YAxis yAxisId="left" domain={[40, 110]} tick={{ fontSize: 11, fill: '#123B82' }} stroke="#123B82" />
                  <YAxis yAxisId="right" orientation="right" domain={[50, 150]} tick={{ fontSize: 11, fill: '#DC2626' }} stroke="#DC2626" />
                  <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#DCE4EF', fontSize: '12px' }} />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                  <ReferenceLine yAxisId="left" y={65} stroke="#DC2626" strokeDasharray="3 3" label={{ value: 'Target MAP (65)', fill: '#DC2626', fontSize: 10 }} />
                  <Line yAxisId="left" type="monotone" dataKey="map" name="MAP (mmHg)" stroke="#123B82" strokeWidth={2.5} dot={false} />
                  <Line yAxisId="right" type="monotone" dataKey="heartRate" name="Heart Rate (bpm)" stroke="#DC2626" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* RESPIRATORY VIEW */}
      {selectedOrganTab === 'respiratory' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricCard
              title="Oxygen Saturation (SpO2)"
              value={p.respiratory.spO2}
              unit="%"
              baseline={p.respiratory.spO2Baseline}
              deltaText={`${p.respiratory.spO2}% on FiO2 ${p.respiratory.fiO2}%`}
              deltaSeverity="warning"
            />
            <MetricCard
              title="PaO2 / FiO2 Ratio"
              value={p.respiratory.paO2FiO2Ratio}
              unit="mmHg"
              baseline={p.respiratory.pfBaseline}
              deltaText="Moderate ARDS Range (< 200)"
              deltaSeverity="critical"
            />
            <MetricCard
              title={language === 'hi' ? 'श्वसन दर (RR)' : 'Respiratory Rate'}
              value={p.respiratory.respiratoryRate}
              unit="/min"
              baseline={p.respiratory.rrBaseline}
              deltaText="Tachypneic"
              deltaDirection="up"
              deltaSeverity="warning"
            />
            <MetricCard
              title={language === 'hi' ? 'ऑक्सीजन सपोर्ट' : 'Support Modality'}
              value={p.respiratory.oxygenSupportMode}
              subtitle={`Work of Breathing: ${p.respiratory.workOfBreathing}`}
              deltaSeverity="warning"
            />
          </div>

          <div className="bg-card rounded-lg border border-vitalis-border p-5 shadow-subtle space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-vitalis-navy flex items-center gap-2">
                <Wind className="w-4 h-4 text-teal-600" />
                {language === 'hi' ? 'ऑक्सीजनेशन गतिशीलता (SpO2 बनाम FiO2)' : 'Oxygenation & Alveolar Dynamics (SpO2 vs FiO2 over 48h)'}
              </h3>
              <span className="text-[11px] text-vitalis-muted">Mode: {p.respiratory.oxygenSupportMode}</span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={organChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#DCE4EF" vertical={false} />
                  <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#64748B' }} stroke="#DCE4EF" />
                  <YAxis yAxisId="left" domain={[85, 100]} tick={{ fontSize: 11, fill: '#0D9488' }} stroke="#0D9488" />
                  <YAxis yAxisId="right" orientation="right" domain={[20, 100]} tick={{ fontSize: 11, fill: '#2563EB' }} stroke="#2563EB" />
                  <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#DCE4EF', fontSize: '12px' }} />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                  <ReferenceLine yAxisId="left" y={92} stroke="#DC2626" strokeDasharray="3 3" label={{ value: 'SpO2 Threshold (92%)', fill: '#DC2626', fontSize: 10 }} />
                  <Line yAxisId="left" type="monotone" dataKey="spO2" name="SpO2 (%)" stroke="#0D9488" strokeWidth={2.5} dot={false} />
                  <Line yAxisId="right" type="monotone" dataKey="fiO2" name="FiO2 (%)" stroke="#2563EB" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* HEPATIC VIEW */}
      {selectedOrganTab === 'hepatic' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricCard
              title="Alanine Aminotransferase (ALT)"
              value={p.hepatic.alt}
              unit="U/L"
              baseline={p.hepatic.altBaseline}
              deltaText={getDeviationBadge(p.hepatic.alt, p.hepatic.altBaseline, true).text}
              deltaSeverity="warning"
            />
            <MetricCard
              title="Aspartate Aminotransferase (AST)"
              value={p.hepatic.ast}
              unit="U/L"
              baseline={p.hepatic.astBaseline}
              deltaText={getDeviationBadge(p.hepatic.ast, p.hepatic.astBaseline, true).text}
              deltaSeverity="warning"
            />
            <MetricCard
              title="Total Bilirubin"
              value={p.hepatic.totalBilirubin}
              unit="mg/dL"
              baseline={p.hepatic.totalBilirubinBaseline}
              deltaText="Elevated excretory marker"
              deltaSeverity="warning"
            />
            <MetricCard
              title="Albumin / INR"
              value={`${p.hepatic.albumin} / ${p.hepatic.inr}`}
              unit="g/dL | INR"
              baseline={`${p.hepatic.albuminBaseline} / 1.0`}
              deltaText="Impaired hepatic protein synthesis"
              deltaSeverity="warning"
            />
          </div>

          <div className="bg-card rounded-lg border border-vitalis-border p-5 shadow-subtle space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-vitalis-navy flex items-center gap-2">
                <Activity className="w-4 h-4 text-amber-600" />
                {language === 'hi' ? 'यकृत एंजाइम गतिशीलता (ALT बनाम AST)' : 'Hepatocellular Enzyme Dynamics (ALT vs AST over 48h)'}
              </h3>
              <span className="text-[11px] text-vitalis-muted">Pattern: {p.hepatic.pattern} Injury</span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={organChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#DCE4EF" vertical={false} />
                  <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#64748B' }} stroke="#DCE4EF" />
                  <YAxis domain={[0, 150]} tick={{ fontSize: 11, fill: '#D97706' }} stroke="#D97706" />
                  <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#DCE4EF', fontSize: '12px' }} />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                  <Line type="monotone" dataKey="alt" name="ALT (U/L)" stroke="#D97706" strokeWidth={2.5} dot={false} />
                  <Line type="monotone" dataKey="ast" name="AST (U/L)" stroke="#DC2626" strokeWidth={2} dot={false} strokeDasharray="4 2" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Cross-Organ Context Panel */}
      <div className="bg-card rounded-lg border border-vitalis-border p-5 shadow-subtle space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-vitalis-navy" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-vitalis-navy">
              {language === 'hi' ? 'परस्पर अङ्ग संबंध एवं अंतर-निर्भरता विश्लेषण' : 'Cross-Organ Context & Interdependency Analysis'}
            </h3>
          </div>
          <button
            onClick={() => setCurrentPage('cascade-graph')}
            className="text-xs font-semibold text-vitalis-blue hover:underline flex items-center gap-1"
          >
            {language === 'hi' ? 'सोपान आरेख में देखें' : 'Trace in Cascade Graph'} <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="bg-slate-50 border border-vitalis-border rounded-md p-3.5 space-y-1.5">
            <div className="font-semibold text-vitalis-navy flex items-center justify-between">
              <span>{language === 'hi' ? 'कार्डियोरीनल अक्ष' : 'Cardiorenal Axis'}</span>
              <span className="text-[10px] text-red-700 bg-red-100 px-1.5 py-0.5 rounded font-bold">
                {language === 'hi' ? 'दृढ़ संबंध' : 'Strong Link'}
              </span>
            </div>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              {language === 'hi'
                ? 'सेप्टिक शॉक (MAP < 60) के कारण वृक्क छिड़काव बाधित हुआ। स्वतः-नियमन की हानि से तीव्र नलिका इस्किमिया उत्पन्न हुआ।'
                : 'Distributive septic shock (MAP < 60 mmHg) abolished preglomerular driving pressure. Loss of auto-regulation precipitated acute tubular ischemia.'}
            </p>
          </div>

          <div className="bg-slate-50 border border-vitalis-border rounded-md p-3.5 space-y-1.5">
            <div className="font-semibold text-vitalis-navy flex items-center justify-between">
              <span>{language === 'hi' ? 'रीनो-पल्मोनरी द्रव अक्ष' : 'Reno-Pulmonary Volume Axis'}</span>
              <span className="text-[10px] text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded font-bold">
                {language === 'hi' ? 'धनात्मक फीडबैक' : 'Positive Feedback'}
              </span>
            </div>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              {language === 'hi'
                ? 'अल्पमूत्र AKI ने +३,८२० mL द्रव के निष्कासन को रोका, जिससे फेफड़ों में शोफ विकसित हुआ और P/F अनुपात गिरकर १९५ हो गया।'
                : 'Oliguric AKI prevented clearance of +3,820 mL net fluid resuscitation, generating hydrostatic pulmonary interstitial transudation that degraded P/F ratio to 195.'}
            </p>
          </div>

          <div className="bg-slate-50 border border-vitalis-border rounded-md p-3.5 space-y-1.5">
            <div className="font-semibold text-vitalis-navy flex items-center justify-between">
              <span>{language === 'hi' ? 'यकृत संकुलन (Hepatosplanchnic)' : 'Hepatosplanchnic Congestion'}</span>
              <span className="text-[10px] text-slate-700 bg-slate-200 px-1.5 py-0.5 rounded font-semibold">
                {language === 'hi' ? 'द्वितीयक' : 'Secondary'}
              </span>
            </div>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              {language === 'hi'
                ? 'अत्यधिक द्रव संचय एवं बढ़े हुए केंद्रीय शिरापरक दबाव ने यकृत में निष्क्रिय संकुलन उत्पन्न किया, जिससे एंजाइमों का रिसाव हुआ।'
                : 'Volume expansion and elevated right atrial filling pressure induced mild passive sinusoidal congestion, causing secondary transaminase and bilirubin leakage.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
