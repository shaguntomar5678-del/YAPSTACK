import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus, AlertCircle } from 'lucide-react';
import { cn } from '../../utils/cn';

interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  baseline?: string | number;
  deltaText?: string;
  deltaDirection?: 'up' | 'down' | 'neutral';
  deltaSeverity?: 'normal' | 'warning' | 'critical';
  subtitle?: string;
  icon?: React.ReactNode;
  alertBadge?: string;
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  unit,
  baseline,
  deltaText,
  deltaDirection = 'neutral',
  deltaSeverity = 'normal',
  subtitle,
  icon,
  alertBadge,
  className,
}) => {
  const severityColors = {
    normal: 'text-vitalis-muted',
    warning: 'text-vitalis-warning font-semibold',
    critical: 'text-vitalis-critical font-bold',
  };

  return (
    <div
      className={cn(
        'bg-card rounded-lg border border-vitalis-border p-3.5 shadow-subtle hover:border-vitalis-border/80 transition-all',
        className
      )}
    >
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-medium text-vitalis-muted truncate uppercase tracking-wider">
          {title}
        </span>
        {icon && <span className="text-vitalis-navy/70">{icon}</span>}
      </div>

      <div className="flex items-baseline gap-1.5 mb-1">
        <span className="text-xl font-bold tracking-tight text-vitalis-text font-mono">
          {value}
        </span>
        {unit && <span className="text-xs text-vitalis-muted font-normal">{unit}</span>}
      </div>

      <div className="flex items-center justify-between gap-1 text-[11px] mt-1 border-t border-vitalis-border/40 pt-1.5">
        {deltaText && (
          <div className={cn('flex items-center gap-0.5', severityColors[deltaSeverity])}>
            {deltaDirection === 'up' && <ArrowUpRight className="w-3.5 h-3.5 shrink-0" />}
            {deltaDirection === 'down' && <ArrowDownRight className="w-3.5 h-3.5 shrink-0" />}
            {deltaDirection === 'neutral' && <Minus className="w-3 h-3 shrink-0" />}
            <span className="truncate">{deltaText}</span>
          </div>
        )}

        {baseline !== undefined && (
          <span className="text-vitalis-muted text-[11px] shrink-0">
            Base: <span className="font-mono text-vitalis-text">{baseline}</span>
          </span>
        )}

        {subtitle && !deltaText && (
          <span className="text-vitalis-muted truncate">{subtitle}</span>
        )}

        {alertBadge && (
          <span className="inline-flex items-center gap-1 text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
            <AlertCircle className="w-2.5 h-2.5" />
            {alertBadge}
          </span>
        )}
      </div>
    </div>
  );
};
