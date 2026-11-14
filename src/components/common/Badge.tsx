import React from 'react';
import { cn } from '../../utils/cn';

export type BadgeVariant =
  | 'critical'
  | 'warning'
  | 'watch'
  | 'stable'
  | 'info'
  | 'navy'
  | 'teal'
  | 'outline';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: 'xs' | 'sm' | 'md';
  dot?: boolean;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'outline',
  size = 'sm',
  dot = false,
  className,
}) => {
  const variantStyles: Record<BadgeVariant, string> = {
    critical: 'bg-red-50 text-red-700 border-red-200 font-medium',
    warning: 'bg-amber-50 text-amber-800 border-amber-200 font-medium',
    watch: 'bg-yellow-50 text-yellow-800 border-yellow-200 font-medium',
    stable: 'bg-emerald-50 text-emerald-800 border-emerald-200 font-medium',
    info: 'bg-blue-50 text-blue-700 border-blue-200 font-medium',
    navy: 'bg-[#123B82]/10 text-[#123B82] border-[#123B82]/20 font-medium',
    teal: 'bg-[#0D9488]/10 text-[#0D9488] border-[#0D9488]/20 font-medium',
    outline: 'bg-white text-vitalis-muted border-vitalis-border font-medium',
  };

  const dotColors: Record<BadgeVariant, string> = {
    critical: 'bg-vitalis-critical',
    warning: 'bg-vitalis-warning',
    watch: 'bg-yellow-500',
    stable: 'bg-vitalis-success',
    info: 'bg-vitalis-blue',
    navy: 'bg-vitalis-navy',
    teal: 'bg-vitalis-teal',
    outline: 'bg-slate-400',
  };

  const sizeStyles = {
    xs: 'px-1.5 py-0.5 text-[11px] leading-tight rounded',
    sm: 'px-2 py-0.5 text-xs rounded',
    md: 'px-2.5 py-1 text-xs rounded-md',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 border tracking-tight transition-colors',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {dot && (
        <span
          className={cn(
            'inline-block rounded-full',
            size === 'xs' ? 'w-1.5 h-1.5' : 'w-2 h-2',
            dotColors[variant]
          )}
        />
      )}
      {children}
    </span>
  );
};
