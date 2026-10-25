'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getRegulatoryRules } from '@/lib/api';
import { MOCK_RULES } from '@/lib/mock-data';
import { formatDate } from '@/lib/utils';
import { BookOpen, Network, History, Plus, AlertCircle, RefreshCw } from 'lucide-react';
import { RegulatoryRule } from '@/types';

export default function RulesPage() {
  const [rules, setRules] = useState<RegulatoryRule[]>(MOCK_RULES);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchRules = async () => {
    setIsLoading(true);
    try {
      const data = await getRegulatoryRules();
      setRules(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRules();
  }, []);

  const filteredRules = rules.filter((rule) => {
    if (selectedCategory !== 'all' && rule.category !== selectedCategory) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Regulatory Rules Management
            </h1>
            <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
              Live Rules Loaded
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Maintain statutory AICTE Approval Process Handbook (APH) rules, versions, and requirement dependencies
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchRules}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Sync Rules
          </button>
        </div>
      </div>

      {/* Demonstration Banner */}
      <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 flex items-center gap-3 text-xs text-amber-800">
        <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0" />
        <p>
          <strong>Demonstration Data:</strong> The parameters below represent sample benchmark rules for testing the NetworkX dependency engine. They are not official AICTE notifications.
        </p>
      </div>

      {/* Category Filter */}
      <div className="flex items-center gap-2">
        {['all', 'faculty', 'infrastructure', 'safety', 'finance'].map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg capitalize transition-colors ${
              selectedCategory === cat
                ? 'bg-slate-900 text-white font-semibold'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Rules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredRules.map((rule) => (
          <div
            key={rule.id}
            className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-teal-800 bg-teal-50 border border-teal-200 px-2.5 py-0.5 rounded">
                  {rule.ruleCode}
                </span>
                <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                  Active: {rule.currentVersion}
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-900 mt-3">
                {rule.title}
              </h3>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                {rule.description}
              </p>

              {/* Parameters Breakdown */}
              <div className="mt-4 p-3 rounded-lg bg-slate-50 border border-slate-100 space-y-1.5">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Current Rule Parameters
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {Object.entries(rule.parameters || {}).map(([key, val]) => (
                    <div key={key} className="bg-white p-2 rounded border border-slate-200/70">
                      <span className="text-[10px] text-slate-500 block capitalize">
                        {key.replace(/_/g, ' ')}
                      </span>
                      <span className="font-semibold text-slate-900">
                        {String(val)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Effective: {formatDate(rule.effectiveDate)}
              </span>

              <div className="flex items-center gap-2">
                <Link
                  href={`/impact-analysis?simulateRuleId=${rule.id}`}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-teal-600 text-white hover:bg-teal-700 transition-colors"
                >
                  <Network className="h-3.5 w-3.5" />
                  Simulate Change
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
