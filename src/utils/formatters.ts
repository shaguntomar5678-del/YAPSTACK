export function formatDateTime(isoString: string): string {
  try {
    const date = new Date(isoString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  } catch {
    return isoString;
  }
}

export function formatTimeOnly(isoString: string): string {
  try {
    const date = new Date(isoString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  } catch {
    return isoString;
  }
}

export function formatValue(value: number | undefined | null, decimals = 1): string {
  if (value === undefined || value === null || isNaN(value)) return '--';
  return value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
}

export function getDeviationBadge(current: number, baseline: number, isHigherWorse = true): {
  pct: number;
  direction: 'up' | 'down' | 'neutral';
  severity: 'normal' | 'warning' | 'critical';
  text: string;
} {
  if (!baseline || baseline === 0) {
    return { pct: 0, direction: 'neutral', severity: 'normal', text: '0.0%' };
  }
  const pct = ((current - baseline) / baseline) * 100;
  const absPct = Math.abs(pct);
  const direction = pct > 0 ? 'up' : pct < 0 ? 'down' : 'neutral';

  let severity: 'normal' | 'warning' | 'critical' = 'normal';
  const isWorsening = isHigherWorse ? pct > 0 : pct < 0;

  if (isWorsening) {
    if (absPct >= 50) severity = 'critical';
    else if (absPct >= 20) severity = 'warning';
  }

  const sign = pct > 0 ? '+' : '';
  return {
    pct,
    direction,
    severity,
    text: `${sign}${pct.toFixed(1)}% vs baseline`
  };
}

/**
 * Formats modelled risk value with clinical guardrails.
 */
export function formatRiskPercent(risk: number | null | undefined): string {
  if (risk === null || risk === undefined || isNaN(risk)) return '--';
  return `${(risk * 100).toFixed(1)}%`;
}

/**
 * Returns plain-language text for organ status / not_applicable_reason
 */
export function formatNotApplicableReason(reason: string | null | undefined): string {
  if (!reason) return 'Dysfunction already present';
  switch (reason) {
    case 'dysfunction_present':
      return 'Organ dysfunction already present';
    case 'no_measurement':
      return 'No measurements available for evaluation';
    case 'prior_episode':
      return 'Prior dysfunction episode noted';
    default:
      return reason.replace(/_/g, ' ');
  }
}

/**
 * Clinical risk caption formatter compliant with safety guardrails:
 * - display_overall === "shown": displays modelled risk percentage and mandatory disclaimer caption
 * - display_overall === "data_insufficient": displays "Insufficient data"
 * - display_overall === "not_applicable": displays "Not applicable: organ dysfunction already present"
 */
export function formatRiskCaption(
  display_overall: 'shown' | 'data_insufficient' | 'not_applicable' | string,
  risk_overall: number | null | undefined,
  _trustLevel?: string
): string {
  if (display_overall === 'data_insufficient') {
    return 'Insufficient data';
  }
  if (display_overall === 'not_applicable') {
    return 'Not applicable: organ dysfunction already present';
  }
  if (risk_overall === null || risk_overall === undefined || isNaN(risk_overall)) {
    return 'Not available';
  }
  return `${(risk_overall * 100).toFixed(1)}% modelled risk`;
}

export const RISK_DISCLAIMER_CAPTION =
  '12 h horizon · Calibrated model output on a proxy label; not a validated clinical probability.';
