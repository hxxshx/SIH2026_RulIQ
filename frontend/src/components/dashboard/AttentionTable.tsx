'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Application } from '@/types';
import { StatusBadge } from '@/components/common/StatusBadge';
import { formatDate } from '@/lib/utils';
import { AlertCircle, ArrowUpRight, Clock, FileWarning, Search } from 'lucide-react';

interface AttentionTableProps {
  applications: Application[];
}

export function AttentionTable({ applications }: AttentionTableProps) {
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Applications requiring attention: overdue OR missing evidence OR compliance_pending
  const attentionApps = applications.filter((app) => {
    const isAttention = app.isOverdue || app.missingEvidenceCount > 0 || app.status === 'compliance_pending';
    if (!isAttention) return false;

    if (filterType === 'overdue' && !app.isOverdue) return false;
    if (filterType === 'missing_evidence' && app.missingEvidenceCount === 0) return false;
    if (filterType === 'pending_compliance' && app.status !== 'compliance_pending') return false;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        app.applicationNumber.toLowerCase().includes(q) ||
        app.institution.name.toLowerCase().includes(q) ||
        app.institution.aictePermanentId.toLowerCase().includes(q)
      );
    }

    return true;
  });

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Header & Filter Controls */}
      <div className="p-5 border-b border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900">
                Applications Requiring Priority Attention
              </h3>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
                {attentionApps.length} Flagged
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Identified with overdue deadlines, unmet statutory requirements, or missing evidence documents
            </p>
          </div>

          {/* Quick Filter Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                filterType === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Flagged
            </button>
            <button
              onClick={() => setFilterType('overdue')}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                filterType === 'overdue'
                  ? 'bg-rose-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Overdue
            </button>
            <button
              onClick={() => setFilterType('missing_evidence')}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                filterType === 'missing_evidence'
                  ? 'bg-amber-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Missing Proofs
            </button>
          </div>
        </div>

        {/* Search within table */}
        <div className="mt-3 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter table by application number or institution..."
            className="w-full pl-8 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-teal-500"
          />
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/70 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <th className="py-3 px-4">Application No.</th>
              <th className="py-3 px-4">Institution & Category</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Requirement Compliance</th>
              <th className="py-3 px-4">Scrutiny Deadline</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {attentionApps.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-400">
                  No applications currently match the attention filter.
                </td>
              </tr>
            ) : (
              attentionApps.map((app) => {
                const compliancePct = Math.round((app.metRequirements / app.totalRequirements) * 100);

                return (
                  <tr key={app.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-medium text-slate-900">
                      {app.applicationNumber}
                      <span className="block text-[10px] text-slate-400 font-sans">
                        {app.applicationType.replace(/_/g, ' ')}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-slate-900 line-clamp-1">
                        {app.institution.name}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {app.institution.district}, {app.institution.state} · ID: {app.institution.aictePermanentId}
                      </p>
                    </td>

                    <td className="py-3.5 px-4">
                      <StatusBadge status={app.status} type="application" />
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="w-40">
                        <div className="flex items-center justify-between text-[11px] mb-1">
                          <span className="text-slate-600 font-medium">
                            {app.metRequirements}/{app.totalRequirements} Met
                          </span>
                          <span className="font-bold text-slate-800">{compliancePct}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              compliancePct >= 80 ? 'bg-emerald-500' : compliancePct >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                            }`}
                            style={{ width: `${compliancePct}%` }}
                          />
                        </div>
                        {app.missingEvidenceCount > 0 && (
                          <span className="inline-flex items-center gap-1 text-[10px] text-rose-600 font-medium mt-1">
                            <FileWarning className="h-3 w-3" />
                            {app.missingEvidenceCount} documents missing
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <Clock className={`h-3.5 w-3.5 ${app.isOverdue ? 'text-rose-600' : 'text-slate-400'}`} />
                        <span className={app.isOverdue ? 'font-bold text-rose-600' : 'text-slate-700'}>
                          {formatDate(app.deadline)}
                        </span>
                      </div>
                      {app.isOverdue && (
                        <span className="inline-block mt-0.5 text-[10px] font-bold text-rose-700 uppercase tracking-wider bg-rose-50 px-1 rounded">
                          Overdue
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href={`/applications`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-teal-700 hover:text-teal-900 bg-teal-50 hover:bg-teal-100 px-2.5 py-1 rounded-md transition-colors"
                      >
                        Review
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
