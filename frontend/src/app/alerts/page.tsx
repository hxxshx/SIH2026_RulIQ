'use client';

import React, { useState, useEffect } from 'react';
import { getComplianceAlerts, resolveAlert, triggerComplianceScan } from '@/lib/api';
import { MOCK_ALERTS } from '@/lib/mock-data';
import { StatusBadge } from '@/components/common/StatusBadge';
import { formatDate } from '@/lib/utils';
import { CheckCircle2, RefreshCw, ShieldAlert, Sparkles } from 'lucide-react';
import { ComplianceAlert } from '@/types';

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<ComplianceAlert[]>(MOCK_ALERTS);
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanMessage, setScanMessage] = useState<string | null>(null);

  const fetchAlerts = async () => {
    setIsLoading(true);
    try {
      const data = await getComplianceAlerts(selectedSeverity);
      setAlerts(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [selectedSeverity]);

  const handleRunScan = async () => {
    setIsScanning(true);
    setScanMessage(null);
    try {
      const res = await triggerComplianceScan();
      if (res) {
        setScanMessage(`Scan complete: ${res.alerts_generated} new compliance breaches identified.`);
        fetchAlerts();
      } else {
        setScanMessage('Compliance scan completed. Current baseline evaluated.');
      }
    } catch (err) {
      console.error(err);
      setScanMessage('Scan error. Please try again.');
    } finally {
      setIsScanning(false);
      setTimeout(() => setScanMessage(null), 5000);
    }
  };

  const handleResolve = async (id: number) => {
    const success = await resolveAlert(id, 'Reviewed and resolved by official reviewer');
    if (success) {
      setAlerts((prev) =>
        prev.map((a) => (a.id === id ? { ...a, isResolved: true } : a))
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Compliance Alerts & Breach Monitoring
            </h1>
            <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
              Live Alerts
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Automated alerts for overdue scrutiny deadlines, missing statutory documents, and regulatory non-compliance
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-700 shadow-2xs focus:outline-hidden"
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
          </select>

          <button
            type="button"
            onClick={fetchAlerts}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Sync
          </button>

          <button
            type="button"
            onClick={handleRunScan}
            disabled={isScanning}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-teal-600 text-white hover:bg-teal-700 disabled:opacity-50 transition-colors shadow-xs"
          >
            <ShieldAlert className={`h-3.5 w-3.5 ${isScanning ? 'animate-spin' : ''}`} />
            {isScanning ? 'Scanning...' : 'Run Compliance Scan'}
          </button>
        </div>
      </div>

      {/* Scan Feedback Banner */}
      {scanMessage && (
        <div className="p-3.5 rounded-xl border border-teal-200 bg-teal-50 text-teal-800 text-xs font-medium flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-teal-600" />
          <span>{scanMessage}</span>
        </div>
      )}

      {/* Alerts List */}
      <div className="space-y-3">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`p-4 rounded-xl border transition-all ${
              alert.isResolved
                ? 'bg-slate-50/80 border-slate-200 opacity-60'
                : alert.severity === 'critical'
                ? 'bg-white border-rose-200 shadow-xs'
                : 'bg-white border-slate-200 shadow-xs'
            }`}
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2">
                  <StatusBadge status={alert.severity} type="alert" />
                  <span className="font-mono text-xs font-semibold text-slate-900">
                    {alert.applicationNumber}
                  </span>
                  <span className="text-xs text-slate-400">·</span>
                  <span className="text-xs font-medium text-slate-600">
                    {alert.institutionName}
                  </span>
                </div>

                <p className="text-sm font-semibold text-slate-900">
                  {alert.message}
                </p>

                <p className="text-xs text-slate-500">
                  <strong className="text-slate-700">Recommended Action:</strong> {alert.suggestedAction}
                </p>
              </div>

              <div className="flex items-center gap-3 self-end md:self-auto">
                <span className="text-[11px] text-slate-400">
                  {formatDate(alert.createdAt)}
                </span>

                {alert.isResolved ? (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Resolved
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleResolve(alert.id)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-2xs"
                  >
                    Mark Reviewed
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
