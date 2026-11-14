import React, { useState } from 'react';
import { useModelCard } from '../../../lib/hooks';
import { ModelResultRow, AblationRow, PairedDeltaRow, M6ComparisonRow } from '../../../lib/schemas';
import { AlertTriangle, Info, ChevronDown, ChevronUp, Image } from 'lucide-react';
import { cn } from '../../../utils/cn';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const fmtPct = (v: number | null | undefined, decimals = 1): string => {
  if (v === null || v === undefined) return '—';
  return (v * 100).toFixed(decimals) + '%';
};

const fmtNum = (v: number | null | undefined, decimals = 3): string => {
  if (v === null || v === undefined) return '—';
  return v.toFixed(decimals);
};

const fmtDelta = (v: number | null | undefined): string => {
  if (v === null || v === undefined) return '—';
  const sign = v >= 0 ? '+' : '';
  return sign + (v * 100).toFixed(1) + 'pp';
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const SectionCard: React.FC<{ title: string; subtitle?: string; children: React.ReactNode }> = ({
  title, subtitle, children,
}) => (
  <div className="bg-white border border-vitalis-border rounded-lg shadow-subtle overflow-hidden">
    <div className="px-5 py-3 border-b border-vitalis-border bg-slate-50/60">
      <h3 className="text-sm font-semibold text-vitalis-navy">{title}</h3>
      {subtitle && <p className="text-xs text-vitalis-muted mt-0.5">{subtitle}</p>}
    </div>
    <div className="p-5">{children}</div>
  </div>
);

const TH: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <th className={cn('px-3 py-2 text-left text-[11px] font-semibold text-vitalis-muted uppercase tracking-wider bg-slate-50 border-b border-vitalis-border', className)}>
    {children}
  </th>
);

const TD: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <td className={cn('px-3 py-2 text-xs text-vitalis-text border-b border-vitalis-border/60', className)}>
    {children}
  </td>
);

// Results table for M1–M5
const ModelResultsTable: React.FC<{ rows: ModelResultRow[]; modelName: string }> = ({ rows, modelName }) => {
  const testA = rows.find((r) => r.set === 'test_A' || r.set?.includes('A'));
  const testB = rows.find((r) => r.set === 'test_B' || r.set?.includes('B'));
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr>
            <TH>Dataset</TH>
            <TH>AUROC</TH>
            <TH>AUPRC</TH>
            <TH>Brier Score</TH>
            <TH>Sensitivity @ Thr</TH>
            <TH>False Alerts / Pt-day</TH>
          </tr>
        </thead>
        <tbody>
          {[testA, testB].filter(Boolean).map((row, i) => (
            <tr key={i} className="hover:bg-slate-50/60">
              <TD className="font-medium text-vitalis-navy">{row!.set === 'test_A' ? 'Hospital A (Dev)' : 'Hospital B (Ext. Test)'}</TD>
              <TD>{fmtNum(row!.auroc)}</TD>
              <TD>{fmtNum(row!.auprc)}</TD>
              <TD>{fmtNum(row!.brier)}</TD>
              <TD>{row!.sensitivity_at_thr !== null && row!.sensitivity_at_thr !== undefined ? fmtPct(row!.sensitivity_at_thr) : '—'}</TD>
              <TD>{row!.false_alerts_per_patient_day !== null && row!.false_alerts_per_patient_day !== undefined ? row!.false_alerts_per_patient_day.toFixed(2) : '—'}</TD>
            </tr>
          ))}
          {rows.filter((r) => r !== testA && r !== testB).map((row, i) => (
            <tr key={`extra-${i}`} className="hover:bg-slate-50/60">
              <TD className="font-medium">{row.set}</TD>
              <TD>{fmtNum(row.auroc)}</TD>
              <TD>{fmtNum(row.auprc)}</TD>
              <TD>{fmtNum(row.brier)}</TD>
              <TD>{fmtPct(row.sensitivity_at_thr)}</TD>
              <TD>{row.false_alerts_per_patient_day?.toFixed(2) ?? '—'}</TD>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// M1–M5 accordion
const MODEL_META: Record<string, { name: string; proxy: string; color: string }> = {
  m1: { name: 'M1 — Overall Multi-organ (Primary)', proxy: 'Composite organ-failure proxy (PhysioNet 2019)', color: 'text-vitalis-navy' },
  m2: { name: 'M2 — Renal', proxy: 'Creatinine ≥ 2.0 mg/dL (proxy; requires clinician verification)', color: 'text-vitalis-teal' },
  m3: { name: 'M3 — Hepatic', proxy: 'Total bilirubin ≥ 2.0 mg/dL (proxy; requires clinician verification)', color: 'text-amber-600' },
  m4: { name: 'M4 — Cardiovascular', proxy: 'MAP < 65 mmHg on 2 consecutive hourly readings (no vasopressor data; requires clinician verification)', color: 'text-red-600' },
  m5: { name: 'M5 — Respiratory', proxy: 'SpO₂/FiO₂ < 315 or SpO₂ < 92% on 2 consecutive readings (no PaO₂ data; requires clinician verification)', color: 'text-indigo-600' },
};

// Collapsible section
const Collapsible: React.FC<{ title: string; defaultOpen?: boolean; children: React.ReactNode }> = ({
  title, defaultOpen = false, children,
}) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-vitalis-border rounded-lg overflow-hidden">
      <button
        className="w-full flex items-center justify-between px-5 py-3 bg-slate-50/80 hover:bg-slate-100 transition-colors text-left"
        onClick={() => setOpen(!open)}
      >
        <span className="text-sm font-semibold text-vitalis-navy">{title}</span>
        {open ? <ChevronUp className="w-4 h-4 text-vitalis-muted" /> : <ChevronDown className="w-4 h-4 text-vitalis-muted" />}
      </button>
      {open && <div className="p-5 bg-white">{children}</div>}
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

export const ModelCard: React.FC = () => {
  const { data: card, loading, error } = useModelCard();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-vitalis-muted text-sm">
        <span className="animate-pulse">Loading model validation data…</span>
      </div>
    );
  }

  if (error || !card) {
    return (
      <div className="flex items-center gap-3 p-6 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
        <AlertTriangle className="w-5 h-5 shrink-0" />
        <div>
          <strong>Failed to load model card.</strong>
          <p className="text-xs mt-0.5 text-red-600">{error || 'model_card.json could not be parsed.'}</p>
        </div>
      </div>
    );
  }

  const modelResults = {
    m1: card.m1_results,
    m2: card.m2_results,
    m3: card.m3_results,
    m4: card.m4_results,
    m5: card.m5_results,
  } as const;

  // Figures
  const figures = ['m1', 'm2', 'm3', 'm4', 'm5'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-vitalis-navy">Model Card</h1>
        <p className="text-xs text-vitalis-muted mt-0.5">
          Validation metrics, comparison baselines, feature ablation, and diagnostic plots for the AngaSutra ML models.
          Training: Hospital A (PhysioNet/CinC Challenge 2019) · External test: Hospital B.
        </p>
      </div>

      {/* Clinical Disclaimer Banner */}
      <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <p className="text-xs text-amber-800 leading-relaxed">
          <strong>Research prototype — not for clinical use.</strong>{' '}
          Labels are threshold-based proxies derived from Challenge 2019 variables (no vasopressors, PaO₂ or urine output);
          models were trained on hospital A and externally tested on hospital B; synthetic demo patients are for interface
          evaluation only and do not reflect real patient outcomes. Not for clinical decision-making.
        </p>
      </div>

      {/* Per-model results M1–M5 */}
      <div className="space-y-3">
        {(Object.entries(modelResults) as [string, typeof card.m1_results][]).map(([key, rows]) => {
          const meta = MODEL_META[key];
          return (
            <Collapsible key={key} title={meta.name} defaultOpen={key === 'm1'}>
              <p className="text-xs text-vitalis-muted mb-3 italic">Proxy label: {meta.proxy}</p>
              <ModelResultsTable rows={rows} modelName={meta.name} />
            </Collapsible>
          );
        })}
      </div>

      {/* M6 Comparison */}
      <SectionCard
        title="M6 — Comparison vs Clinical Baselines"
        subtitle="M1 vs fixed-threshold rule and current-values-only logistic regression (M6)"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr>
                <TH>Model / Baseline</TH>
                <TH>Dataset</TH>
                <TH>AUROC</TH>
                <TH>AUPRC</TH>
                <TH>Sensitivity @ Thr</TH>
                <TH>False Alerts / Pt-day</TH>
              </tr>
            </thead>
            <tbody>
              {card.m6_comparison.map((row: M6ComparisonRow, i: number) => (
                <tr key={i} className="hover:bg-slate-50/60">
                  <TD className="font-medium">{row.model}</TD>
                  <TD>{row.set === 'test_A' ? 'Hospital A' : 'Hospital B'}</TD>
                  <TD>{fmtNum(row.auroc)}</TD>
                  <TD>{fmtNum(row.auprc)}</TD>
                  <TD>{fmtPct(row.sensitivity_at_thr)}</TD>
                  <TD>{row.false_alerts_per_patient_day?.toFixed(2) ?? '—'}</TD>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {/* Paired Deltas */}
      <SectionCard
        title="Paired Bootstrap Deltas (M1 vs Baselines)"
        subtitle="95% bootstrap confidence intervals; excludes_zero = statistically meaningful improvement."
      >
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr>
                <TH>Comparison</TH>
                <TH>Dataset</TH>
                <TH>Metric</TH>
                <TH>Δ (percentage points)</TH>
                <TH>95% CI</TH>
                <TH>Excludes Zero?</TH>
              </tr>
            </thead>
            <tbody>
              {card.m6_paired_deltas.map((row: PairedDeltaRow, i: number) => (
                <tr key={i} className="hover:bg-slate-50/60">
                  <TD className="font-medium">{row.comparison}</TD>
                  <TD>{row.set === 'test_A' ? 'Hospital A' : 'Hospital B'}</TD>
                  <TD>{row.metric}</TD>
                  <TD className={cn(
                    'font-mono font-semibold',
                    row.delta !== null && row.delta > 0 ? 'text-emerald-700' : 'text-red-600'
                  )}>
                    {fmtDelta(row.delta)}
                  </TD>
                  <TD className="font-mono text-vitalis-muted">
                    [{fmtDelta(row.ci_low)}, {fmtDelta(row.ci_high)}]
                  </TD>
                  <TD>
                    {row.interval_excludes_zero === true ? (
                      <span className="text-emerald-700 font-semibold">Yes ✓</span>
                    ) : row.interval_excludes_zero === false ? (
                      <span className="text-vitalis-muted">No</span>
                    ) : '—'}
                  </TD>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {/* Ablation */}
      <SectionCard
        title="Feature Ablation Study"
        subtitle="Impact of progressively adding feature groups. All rows evaluated on internal (A) and external (B) test sets."
      >
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr>
                <TH>Feature Variant</TH>
                <TH>Dataset</TH>
                <TH>AUROC</TH>
                <TH>AUPRC</TH>
              </tr>
            </thead>
            <tbody>
              {card.m6_ablation.map((row: AblationRow, i: number) => (
                <tr key={i} className="hover:bg-slate-50/60">
                  <TD className="font-medium">{row.variant}</TD>
                  <TD>{row.set === 'test_A' ? 'Hospital A' : 'Hospital B'}</TD>
                  <TD className="font-mono">{fmtNum(row.auroc)}</TD>
                  <TD className="font-mono">{fmtNum(row.auprc)}</TD>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {/* Diagnostic Figures */}
      <SectionCard
        title="Diagnostic Plots"
        subtitle="Calibration curves and SHAP feature importance summaries for M1–M5."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {figures.map((m) => (
            <div key={m} className="space-y-3">
              <h4 className="text-xs font-semibold text-vitalis-navy uppercase tracking-wider">
                {MODEL_META[m]?.name ?? m.toUpperCase()}
              </h4>
              {/* Calibration plot */}
              <div>
                <p className="text-[10px] text-vitalis-muted mb-1">Calibration Curve</p>
                <div className="border border-vitalis-border rounded-md overflow-hidden bg-slate-50">
                  <img
                    src={`/data/figures/${m}_calibration.png`}
                    alt={`${m} calibration curve`}
                    className="w-full object-contain"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display = 'none';
                      (e.currentTarget.nextElementSibling as HTMLElement | null)?.style.setProperty('display', 'flex');
                    }}
                  />
                  <div
                    className="hidden items-center justify-center gap-2 py-8 text-xs text-vitalis-muted"
                    style={{ display: 'none' }}
                  >
                    <Image className="w-4 h-4" />
                    <span>Plot unavailable</span>
                  </div>
                </div>
              </div>
              {/* SHAP plot */}
              <div>
                <p className="text-[10px] text-vitalis-muted mb-1">SHAP Feature Importance</p>
                <div className="border border-vitalis-border rounded-md overflow-hidden bg-slate-50">
                  <img
                    src={`/data/figures/${m}_shap.png`}
                    alt={`${m} SHAP summary`}
                    className="w-full object-contain"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display = 'none';
                      (e.currentTarget.nextElementSibling as HTMLElement | null)?.style.setProperty('display', 'flex');
                    }}
                  />
                  <div
                    className="hidden items-center justify-center gap-2 py-8 text-xs text-vitalis-muted"
                    style={{ display: 'none' }}
                  >
                    <Image className="w-4 h-4" />
                    <span>Plot unavailable</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Verbatim Limitations */}
      <div className="p-5 bg-slate-50 border border-vitalis-border rounded-lg">
        <h3 className="text-sm font-semibold text-vitalis-navy mb-3">Model Limitations (Verbatim)</h3>
        <p className="text-xs text-vitalis-text leading-relaxed">
          Labels are threshold-based proxies derived from Challenge 2019 variables (no vasopressors, PaO₂ or urine output);
          models were trained on hospital A and externally tested on hospital B; synthetic demo patients are for interface
          evaluation only and do not reflect real patient outcomes. Not for clinical decision-making.
        </p>
      </div>
    </div>
  );
};

export default ModelCard;
