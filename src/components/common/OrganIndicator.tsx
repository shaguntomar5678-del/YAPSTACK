import React from 'react';
import { OrganStatus } from '../../types/organ';
import { cn } from '../../utils/cn';

interface OrganIndicatorProps {
  organStatuses: {
    renal: OrganStatus;
    hepatic: OrganStatus;
    cardiac: OrganStatus;
    respiratory: OrganStatus;
  };
  size?: 'sm' | 'md';
  onOrganClick?: (organ: 'renal' | 'hepatic' | 'cardiac' | 'respiratory') => void;
}

export const OrganIndicator: React.FC<OrganIndicatorProps> = ({
  organStatuses,
  size = 'md',
  onOrganClick,
}) => {
  const organs: {
    key: 'renal' | 'hepatic' | 'cardiac' | 'respiratory';
    label: string;
    letter: string;
    status: OrganStatus;
  }[] = [
    { key: 'renal', label: 'Renal', letter: 'R', status: organStatuses.renal },
    { key: 'hepatic', label: 'Hepatic', letter: 'H', status: organStatuses.hepatic },
    { key: 'cardiac', label: 'Cardiac', letter: 'C', status: organStatuses.cardiac },
    { key: 'respiratory', label: 'Respiratory', letter: 'P', status: organStatuses.respiratory }, // P for Pulmo/Resp
  ];

  const statusColors = {
    critical: 'bg-red-50 text-red-700 border-red-300 ring-1 ring-red-400/40 font-bold',
    warning: 'bg-amber-50 text-amber-800 border-amber-300 ring-1 ring-amber-400/30 font-semibold',
    watch: 'bg-yellow-50 text-yellow-800 border-yellow-300 font-medium',
    stable: 'bg-slate-50 text-slate-600 border-slate-200 font-normal hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200',
  };

  const statusDot = {
    critical: 'bg-vitalis-critical',
    warning: 'bg-vitalis-warning',
    watch: 'bg-yellow-500',
    stable: 'bg-emerald-500',
  };

  const sizeBox = size === 'sm' ? 'w-6 h-6 text-[10px]' : 'w-7 h-7 text-xs';

  return (
    <div className="flex items-center gap-1.5" title="Renal (R) | Hepatic (H) | Cardiac (C) | Pulm/Resp (P)">
      {organs.map((org) => {
        const isClickable = !!onOrganClick;
        return (
          <button
            key={org.key}
            type="button"
            disabled={!isClickable}
            onClick={(e) => {
              if (onOrganClick) {
                e.stopPropagation();
                onOrganClick(org.key);
              }
            }}
            className={cn(
              'relative flex items-center justify-center rounded border transition-all select-none',
              sizeBox,
              statusColors[org.status.status],
              isClickable && 'hover:scale-105 cursor-pointer',
              !isClickable && 'cursor-default'
            )}
            title={`${org.label}: ${org.status.status.toUpperCase()} (${org.status.trend}) - ${org.status.primaryConcerns[0] || 'Nominal'}`}
          >
            <span>{org.letter}</span>
            <span
              className={cn(
                'absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full border border-white',
                statusDot[org.status.status]
              )}
            />
          </button>
        );
      })}
    </div>
  );
};
