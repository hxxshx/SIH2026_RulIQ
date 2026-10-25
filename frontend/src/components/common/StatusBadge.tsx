import React from 'react';
import { cn } from '@/lib/utils';
import { AlertSeverity, ApplicationStatus, ImpactStatus } from '@/types';

interface StatusBadgeProps {
  status: ApplicationStatus | AlertSeverity | ImpactStatus | string;
  type?: 'application' | 'alert' | 'impact';
  className?: string;
}

export function StatusBadge({ status, type = 'application', className }: StatusBadgeProps) {
  // Application statuses
  if (type === 'application') {
    switch (status) {
      case 'approved':
        return (
          <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200', className)}>
            Approved
          </span>
        );
      case 'rejected':
        return (
          <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200', className)}>
            Rejected
          </span>
        );
      case 'compliance_pending':
        return (
          <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200', className)}>
            Compliance Pending
          </span>
        );
      case 'under_scrutiny':
        return (
          <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200', className)}>
            Under Scrutiny
          </span>
        );
      case 'submitted':
        return (
          <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-300', className)}>
            Submitted
          </span>
        );
      default:
        return (
          <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600', className)}>
            {status}
          </span>
        );
    }
  }

  // Alert Severities
  if (type === 'alert') {
    switch (status) {
      case 'critical':
        return (
          <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-300 animate-pulse', className)}>
            Critical Alert
          </span>
        );
      case 'high':
        return (
          <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300', className)}>
            High Warning
          </span>
        );
      case 'medium':
        return (
          <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-50 text-yellow-800 border border-yellow-200', className)}>
            Notice
          </span>
        );
      default:
        return (
          <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700', className)}>
            Info
          </span>
        );
    }
  }

  // Impact Statuses
  if (type === 'impact') {
    switch (status) {
      case 'impacted_non_compliant':
        return (
          <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-300', className)}>
            Impacted (Non-Compliant)
          </span>
        );
      case 'conditionally_impacted':
        return (
          <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-300', className)}>
            Conditional (Evidence Required)
          </span>
        );
      case 'unaffected':
        return (
          <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-50 text-teal-700 border border-teal-200', className)}>
            Unaffected
          </span>
        );
      default:
        return (
          <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700', className)}>
            {status}
          </span>
        );
    }
  }

  return <span>{status}</span>;
}
