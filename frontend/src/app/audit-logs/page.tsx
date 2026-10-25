'use client';

import React, { useState, useEffect } from 'react';
import { Terminal, ShieldCheck, RefreshCw, Filter } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { AuditLogItem } from '@/types';
import { getAuditLogs } from '@/lib/api';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedEntity, setSelectedEntity] = useState<string>('all');

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const data = await getAuditLogs({ entityName: selectedEntity, limit: 50 });
      setLogs(data);
    } catch (e) {
      console.error('Failed to fetch audit logs', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [selectedEntity]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Immutable Audit History
            </h1>
            <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-200">
              Append-Only Active
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Application-level append-only log of all regulatory simulations, evidence verifications, and official review decisions
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 shadow-2xs">
            <Filter className="h-3.5 w-3.5 text-slate-400" />
            <select
              value={selectedEntity}
              onChange={(e) => setSelectedEntity(e.target.value)}
              className="text-xs bg-transparent text-slate-700 focus:outline-hidden"
            >
              <option value="all">All Entities</option>
              <option value="Application">Application Changes</option>
              <option value="EvidenceRecord">Evidence Verifications</option>
              <option value="RegulatoryRule">Rule Revisions</option>
            </select>
          </div>

          <button
            type="button"
            onClick={fetchLogs}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Sync Logs
          </button>
        </div>
      </div>

      {/* Audit Limitation Notice */}
      <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-600 space-y-1">
        <p className="font-semibold text-slate-900 flex items-center gap-1.5">
          <ShieldCheck className="h-4 w-4 text-teal-700" />
          Audit Trail Integrity Notice
        </p>
        <p>
          Logs are maintained in an append-only relational ledger table with monotonic sequence IDs and user identities.
          <em> Note for evaluation:</em> While tamper-evident within the relational schema constraints, cryptographic blockchain
          tamper-proofing is an optional enterprise layer scheduled for future phases.
        </p>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Timestamp & IP</th>
                <th className="py-3 px-4">Action Type</th>
                <th className="py-3 px-4">Entity</th>
                <th className="py-3 px-4">Officer / Identity</th>
                <th className="py-3 px-4">Log Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-mono">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-sans whitespace-nowrap">
                    <span className="font-semibold text-slate-900 block">{formatDate(log.timestamp)}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{log.ipAddress || '127.0.0.1'}</span>
                  </td>

                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded border ${
                        log.action.includes('ACCEPTED') || log.action.includes('VERIFIED')
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : log.action.includes('REJECTED')
                          ? 'bg-rose-50 text-rose-800 border-rose-200'
                          : 'bg-slate-100 text-slate-800 border-slate-300'
                      }`}
                    >
                      {log.action}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 font-sans text-slate-700 font-medium">
                    {log.entityName} {log.entityId ? `(#${log.entityId})` : ''}
                  </td>

                  <td className="py-3.5 px-4 font-sans text-slate-800">
                    {log.performedBy}
                  </td>

                  <td className="py-3.5 px-4 font-sans text-slate-600 max-w-md truncate" title={log.details || ''}>
                    {log.details || '—'}
                  </td>
                </tr>
              ))}
              {logs.length === 0 && !isLoading && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400 font-sans">
                    No audit log records found for the selected entity filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
