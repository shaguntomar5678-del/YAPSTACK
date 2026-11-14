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
