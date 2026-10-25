import React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  badgeText?: string;
  badgeVariant?: 'default' | 'critical' | 'warning' | 'success';
  className?: string;
}

export function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  badgeText,
  badgeVariant = 'default',
  className,
}: MetricCardProps) {
  return (
    <div
      className={cn(
        'relative bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs transition-all hover:shadow-md hover:border-slate-300',
        className
      )}
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {title}
        </p>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
          <Icon className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <h3 className="text-2xl font-bold tracking-tight text-slate-900">
          {value}
        </h3>
        {badgeText && (
          <span
            className={cn(
              'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium',
              badgeVariant === 'critical' && 'bg-rose-100 text-rose-800',
              badgeVariant === 'warning' && 'bg-amber-100 text-amber-800',
              badgeVariant === 'success' && 'bg-emerald-100 text-emerald-800',
              badgeVariant === 'default' && 'bg-slate-100 text-slate-700'
            )}
          >
            {badgeText}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="mt-1 text-xs text-slate-500">
          {subtitle}
        </p>
      )}
    </div>
  );
}
