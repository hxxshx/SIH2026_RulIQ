import React from 'react';
import Link from 'next/link';
import { ComplianceAlert } from '@/types';
import { AlertOctagon, ArrowRight } from 'lucide-react';

interface AlertBannerProps {
  alerts: ComplianceAlert[];
}

export function AlertBanner({ alerts }: AlertBannerProps) {
  const criticalAlerts = alerts.filter((a) => !a.isResolved && a.severity === 'critical');

  if (criticalAlerts.length === 0) return null;

  const topAlert = criticalAlerts[0];

  return (
    <div className="bg-rose-50 border-l-4 border-rose-600 p-4 rounded-r-xl shadow-2xs mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-start gap-3">
          <AlertOctagon className="h-5 w-5 text-rose-600 flex-shrink-0 mt-0.5" />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-800">
                Action Required: {criticalAlerts.length} Critical Compliance Breaches
              </span>
              <span className="text-[10px] bg-rose-200 text-rose-900 px-1.5 py-0.2 rounded font-semibold">
                Urgent
              </span>
            </div>
            <p className="text-xs text-rose-700 mt-0.5">
              <strong className="font-semibold">{topAlert.institutionName} ({topAlert.applicationNumber}):</strong>{' '}
              {topAlert.message}
            </p>
          </div>
        </div>

        <Link
          href="/alerts"
          className="inline-flex items-center gap-1 text-xs font-bold text-rose-900 hover:text-rose-950 bg-rose-100 hover:bg-rose-200 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap self-end sm:self-auto"
        >
          Manage Alerts ({criticalAlerts.length})
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
