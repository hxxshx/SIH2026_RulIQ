'use client';

import React, { useState, useEffect } from 'react';
import { getApplications, updateApplicationStage } from '@/lib/api';
import { MOCK_APPLICATIONS } from '@/lib/mock-data';
import { StatusBadge } from '@/components/common/StatusBadge';
import { formatDate } from '@/lib/utils';
import { Search, Filter, Plus, RefreshCw, CheckCircle } from 'lucide-react';
import { Application } from '@/types';

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>(MOCK_APPLICATIONS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchApps = async () => {
    setIsLoading(true);
    try {
      const data = await getApplications({
        status: selectedStatus,
        type: selectedType,
        search: searchQuery,
      });
      setApplications(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApps();
  }, [selectedStatus, selectedType]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchApps();
  };

  const handleStageAdvance = async (appId: number, currentStatus: string) => {
    const nextStatus = currentStatus === 'submitted' ? 'under_scrutiny' : 'compliance_pending';
    const success = await updateApplicationStage(appId, nextStatus, 'Stage updated by official reviewer');
    if (success) {
      setApplications((prev) =>
        prev.map((a) => (a.id === appId ? { ...a, status: nextStatus as any } : a))
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
              Application Management
            </h1>
            <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
              Live API
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Browse, filter, and scrutinize AICTE approval applications across academic jurisdictions
          </p>
        </div>

        <button
          type="button"
          onClick={fetchApps}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors self-start sm:self-auto"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          Sync
        </button>
      </div>

      {/* Filter & Search Bar */}
      <form onSubmit={handleSearchSubmit} className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by application number, institution name, or state (press Enter)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-teal-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-hidden"
          >
            <option value="all">All Statuses</option>
            <option value="under_scrutiny">Under Scrutiny</option>
            <option value="compliance_pending">Compliance Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-hidden"
          >
            <option value="all">All Application Types</option>
            <option value="extension_of_approval">Extension of Approval</option>
            <option value="increase_intake">Increase in Intake</option>
            <option value="new_institute">New Institution</option>
            <option value="new_course">New Course</option>
          </select>

          <button
            type="submit"
            className="px-3 py-2 text-xs font-semibold bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
          >
            Filter
          </button>
        </div>
      </form>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">App ID</th>
                <th className="py-3 px-4">Institution Name</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Requirements</th>
                <th className="py-3 px-4">Deadline</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {applications.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No applications found matching the search criteria.
                  </td>
                </tr>
              ) : (
                applications.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-medium text-slate-900">
                      {app.applicationNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-slate-900">{app.institution.name}</p>
                      <p className="text-[11px] text-slate-500">
                        {app.institution.district}, {app.institution.state} · ID: {app.institution.aictePermanentId}
                      </p>
                    </td>
                    <td className="py-3.5 px-4 capitalize text-slate-600">
                      {app.applicationType.replace(/_/g, ' ')}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={app.status} type="application" />
                    </td>
                    <td className="py-3.5 px-4 font-medium">
                      {app.metRequirements} / {app.totalRequirements} Met
                      {app.missingEvidenceCount > 0 && (
                        <span className="block text-[10px] text-rose-600 font-semibold">
                          {app.missingEvidenceCount} Missing Proofs
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={app.isOverdue ? 'text-rose-600 font-bold' : 'text-slate-600'}>
                        {formatDate(app.deadline)}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {app.status === 'submitted' || app.status === 'under_scrutiny' ? (
                        <button
                          type="button"
                          onClick={() => handleStageAdvance(app.id, app.status)}
                          className="text-xs font-semibold text-teal-700 hover:text-teal-900 bg-teal-50 px-2.5 py-1 rounded transition-colors"
                        >
                          Advance Stage
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400">Recorded</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
