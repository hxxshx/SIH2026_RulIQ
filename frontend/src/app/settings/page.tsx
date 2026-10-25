'use client';

import React from 'react';
import { Settings, Shield, Server, Database, Sliders } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          System Configuration & AICTE Parameters
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Configure approval workflow thresholds, FastAPI service links, and engine behavior
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Backend & Database Connection Card */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Server className="h-4 w-4 text-teal-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Backend API & Engine Link
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-slate-500 block mb-1">FastAPI Service Endpoint</label>
              <input
                type="text"
                readOnly
                value="http://localhost:8000/api/v1"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-slate-700"
              />
            </div>

            <div>
              <label className="text-slate-500 block mb-1">PostgreSQL & pgvector Cluster</label>
              <input
                type="text"
                readOnly
                value="postgresql://ruliq_user:***@localhost:5432/ruliq_db"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-slate-700"
              />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <span className="text-slate-600">Engine Type:</span>
              <span className="font-semibold text-slate-900">NetworkX Deterministic DAG</span>
            </div>
          </div>
        </div>

        {/* Council Policy Parameters Card */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Sliders className="h-4 w-4 text-teal-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Regulatory Approval Thresholds
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-600">Default Scrutiny Window:</span>
              <span className="font-semibold text-slate-900">30 Calendar Days</span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-600">Grace Period for Missing Proofs:</span>
              <span className="font-semibold text-slate-900">14 Calendar Days</span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-600">Autonomous Decision Authority:</span>
              <span className="font-semibold text-rose-600">Disabled (Human Review Enforced)</span>
            </div>
            <div className="flex items-center justify-between py-1.5">
              <span className="text-slate-600">Active Academic Year:</span>
              <span className="font-semibold text-teal-700">AY 2026–2027</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
