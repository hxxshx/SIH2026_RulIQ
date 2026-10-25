import React from 'react';
import Link from 'next/link';
import { RegulatoryRule } from '@/types';
import { formatDate } from '@/lib/utils';
import { BookOpen, Network, Sparkles, Layers } from 'lucide-react';

interface RecentRulesWidgetProps {
  rules: RegulatoryRule[];
}

export function RecentRulesWidget({ rules }: RecentRulesWidgetProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-1.5">
            <h3 className="text-sm font-bold text-slate-900">
              Active Regulatory Framework (APH)
            </h3>
            <span className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
              Mock Norms
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Current AICTE statutory rules mapped into the NetworkX dependency graph
          </p>
        </div>

        <Link
          href="/rules"
          className="text-xs font-semibold text-teal-700 hover:text-teal-900 flex items-center gap-1"
        >
          View All Rules &rarr;
        </Link>
      </div>

      <div className="space-y-3">
        {rules.slice(0, 3).map((rule) => (
          <div
            key={rule.id}
            className="p-3.5 rounded-lg border border-slate-200/90 hover:border-slate-300 hover:bg-slate-50/50 transition-all flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
          >
            <div className="space-y-1 max-w-lg">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                  {rule.ruleCode}
                </span>
                <span className="text-xs font-semibold text-slate-800">
                  {rule.title}
                </span>
                <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded">
                  {rule.currentVersion}
                </span>
              </div>
              <p className="text-xs text-slate-500 line-clamp-1">
                {rule.description}
              </p>
            </div>

            <div className="flex items-center gap-3 self-end sm:self-auto">
              <div className="text-right hidden md:block">
                <span className="text-[11px] font-semibold text-slate-700 block">
                  {rule.applicableRequirementsCount} Requirements
                </span>
                <span className="text-[10px] text-slate-400">
                  Effective: {formatDate(rule.effectiveDate)}
                </span>
              </div>

              <Link
                href={`/impact-analysis?simulateRuleId=${rule.id}`}
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-teal-600 text-white hover:bg-teal-700 transition-colors shadow-2xs"
              >
                <Network className="h-3.5 w-3.5" />
                Simulate Impact
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
