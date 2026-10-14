import React from 'react';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const normalized = status.toLowerCase();

  let styles = 'bg-slate-100 text-slate-700 border-slate-200';

  if (normalized === 'assigned' || normalized === 'active' || normalized === 'normal' || normalized === 'completed') {
    styles = 'bg-emerald-50 text-emerald-700 border-emerald-200/60';
  } else if (normalized === 'unassigned' || normalized === 'critical' || normalized === 'abnormal' || normalized === 'cancelled') {
    styles = 'bg-rose-50 text-rose-700 border-rose-200/60';
  } else if (normalized === 'pending' || normalized === 'in progress' || normalized === 'moderate') {
    styles = 'bg-amber-50 text-amber-700 border-amber-200/60';
  } else if (normalized === 'upcoming' || normalized === 'routine') {
    styles = 'bg-sky-50 text-sky-700 border-sky-200/60';
  }

  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-medium';

  return (
    <span
      className={`inline-flex items-center rounded-md border tracking-tight ${sizeClass} ${styles}`}
    >
      {status}
    </span>
  );
};
