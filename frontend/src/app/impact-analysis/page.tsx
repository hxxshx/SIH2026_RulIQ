'use client';

import React, { useState, useEffect } from 'react';
import { getRegulatoryRules, runImpactSimulation, getRuleDependencyGraph, recordReviewDecision } from '@/lib/api';
import { MOCK_RULES } from '@/lib/mock-data';
import { StatusBadge } from '@/components/common/StatusBadge';
import {
  Network,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  FileQuestion,
  ShieldAlert,
  ArrowRight,
  RefreshCw,
  GitBranch,
} from 'lucide-react';
import { RegulatoryRule, SimulationReport, SimulationResultItem } from '@/types';

export default function ImpactAnalysisPage() {
  const [rules, setRules] = useState<RegulatoryRule[]>(MOCK_RULES);
  const [selectedRuleId, setSelectedRuleId] = useState<number>(1);
  const [simulatedRatio, setSimulatedRatio] = useState<number>(15);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [simulationReport, setSimulationReport] = useState<SimulationReport | null>(null);
  const [reviewActions, setReviewActions] = useState<Record<number, string>>({});

  useEffect(() => {
    getRegulatoryRules().then((res) => {
      if (res && res.length > 0) {
        setRules(res);
        setSelectedRuleId(res[0].id);
      }
    });
  }, []);

  const executeSimulation = async () => {
    setIsRunning(true);
    try {
      const data = await runImpactSimulation(selectedRuleId, {
        student_faculty_ratio_ug: simulatedRatio,
      });
      if (data) {
        setSimulationReport(data);
      }
    } catch (e) {
      console.error('Simulation error:', e);
    } finally {
      setIsRunning(false);
    }
  };

  useEffect(() => {
    executeSimulation();
  }, [selectedRuleId]);

  const activeRule = rules.find((r) => r.id === selectedRuleId) || rules[0];

  const handleReviewDecision = async (appId: number, decision: 'accepted' | 'rejected') => {
    const remarks =
      decision === 'accepted'
        ? 'Official scrutiny panel accepted compliance remediation schedule.'
        : 'Reviewer rejected simulated relaxation; statutory baseline must be upheld.';
    setReviewActions((prev) => ({ ...prev, [appId]: decision }));
    await recordReviewDecision(appId, decision, remarks);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Rule-Change Impact Analysis Engine
          </h1>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 border border-teal-200">
            NetworkX Deterministic DAG Active
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Simulate regulatory amendments on the in-memory dependency graph to evaluate impact on active applications
        </p>
      </div>

      {/* Simulator Control Panel */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
          Configure Simulation Scenario
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select Regulatory Rule
            </label>
            <select
              value={selectedRuleId}
              onChange={(e) => setSelectedRuleId(Number(e.target.value))}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium focus:outline-hidden"
            >
              {rules.map((rule) => (
                <option key={rule.id} value={rule.id}>
                  {rule.ruleCode} — {rule.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Simulated Parameter: Student-Faculty Ratio (UG)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="10"
                max="25"
                step="1"
                value={simulatedRatio}
                onChange={(e) => setSimulatedRatio(Number(e.target.value))}
                className="w-full accent-teal-600 cursor-pointer"
              />
              <span className="font-mono text-xs font-bold text-teal-800 bg-teal-50 px-2.5 py-1 rounded border border-teal-200 whitespace-nowrap">
                1:{simulatedRatio}
              </span>
            </div>
            <span className="text-[10px] text-slate-400 mt-0.5 block">
              Baseline Statutory AICTE APH Norm: 1:20
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={executeSimulation}
              disabled={isRunning}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-teal-600 text-white hover:bg-teal-700 transition-colors shadow-xs"
            >
              <Play className={`h-3.5 w-3.5 ${isRunning ? 'animate-spin' : ''}`} />
              Run DAG Simulation
            </button>
            <button
              type="button"
              onClick={() => {
                setSimulatedRatio(20);
                setTimeout(executeSimulation, 50);
              }}
              className="px-3 py-2 text-xs font-medium rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
              title="Reset to statutory baseline"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-rose-200/80 bg-rose-50/20">
          <p className="text-xs font-bold uppercase tracking-wider text-rose-700">
            Impacted (Non-Compliant)
          </p>
          <p className="text-2xl font-bold text-rose-900 mt-1">
            {simulationReport ? simulationReport.totalImpacted : 2}
          </p>
          <p className="text-[11px] text-rose-600 mt-0.5">
            Applications failing proposed 1:{simulatedRatio} threshold
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-amber-200/80 bg-amber-50/20">
          <p className="text-xs font-bold uppercase tracking-wider text-amber-700">
            Conditionally Impacted
          </p>
          <p className="text-2xl font-bold text-amber-900 mt-1">
            {simulationReport ? simulationReport.totalConditionallyImpacted : 1}
          </p>
          <p className="text-[11px] text-amber-600 mt-0.5">
            Missing evidence documents prevent mathematical evaluation
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-teal-200/80 bg-teal-50/20">
          <p className="text-xs font-bold uppercase tracking-wider text-teal-700">
            Unaffected (Compliant)
          </p>
          <p className="text-2xl font-bold text-teal-900 mt-1">
            {simulationReport ? simulationReport.totalUnaffected : 3}
          </p>
          <p className="text-[11px] text-teal-600 mt-0.5">
            Already meet stricter proposed threshold or out of scope
          </p>
        </div>
      </div>

      {/* Dependency Graph Topology from NetworkX */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              NetworkX In-Memory Dependency Graph
            </h3>
            <p className="text-xs text-slate-500">
              Active traversal path: {activeRule?.ruleCode} &rarr; Compliance Requirement &rarr; Applications &rarr; Verified Evidence
            </p>
          </div>
          <span className="text-xs font-mono font-semibold px-2 py-0.5 bg-teal-50 text-teal-700 border border-teal-200 rounded">
            {simulationReport?.graph?.nodes?.length || 8} Graph Nodes Loaded
          </span>
        </div>

        {/* Visual Node Representation */}
        <div className="p-4 rounded-xl bg-slate-900 text-white font-mono text-xs overflow-x-auto">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-teal-700 border border-teal-500 text-center min-w-36">
              <span className="text-[10px] text-teal-200 block uppercase">Target Rule</span>
              <span className="font-bold text-white">{activeRule?.ruleCode}</span>
            </div>
            <ArrowRight className="h-4 w-4 text-slate-500" />
            <div className="p-3 rounded-lg bg-blue-700 border border-blue-500 text-center min-w-36">
              <span className="text-[10px] text-blue-200 block uppercase">Proposed Norm</span>
              <span className="font-bold text-white">REQ &le; 1:{simulatedRatio}</span>
            </div>
            <ArrowRight className="h-4 w-4 text-slate-500" />
            <div className="p-3 rounded-lg bg-purple-700 border border-purple-500 text-center min-w-36">
              <span className="text-[10px] text-purple-200 block uppercase">Applications</span>
              <span className="font-bold text-white">
                {simulationReport ? `${simulationReport.totalEvaluated} Evaluated` : '6 Evaluated'}
              </span>
            </div>
            <ArrowRight className="h-4 w-4 text-slate-500" />
            <div className="p-3 rounded-lg bg-emerald-700 border border-emerald-500 text-center min-w-36">
              <span className="text-[10px] text-emerald-200 block uppercase">Evidence Proofs</span>
              <span className="font-bold text-white">Faculty Rosters</span>
            </div>
          </div>
        </div>
      </div>

      {/* Granular Results Table with Human Review */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">
            Granular Impact Classification & Explainable Reasons
          </h3>
          <span className="text-xs text-slate-500">
            Mandatory human review authorization (No auto-approval)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Application</th>
                <th className="py-3 px-4">Impact Classification</th>
                <th className="py-3 px-4">Deterministic Explanation</th>
                <th className="py-3 px-4">Constraint-Aware Action</th>
                <th className="py-3 px-4 text-right">Human Review</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {simulationReport?.results?.map((item) => (
                <tr key={item.applicationId} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4">
                    <p className="font-mono font-medium text-slate-900">{item.applicationNumber}</p>
                    <p className="text-[11px] text-slate-500">{item.institutionName}</p>
                  </td>

                  <td className="py-3.5 px-4">
                    <StatusBadge status={item.impactStatus} type="impact" />
                  </td>

                  <td className="py-3.5 px-4 max-w-xs text-slate-700 leading-relaxed">
                    {item.reasonExplanation}
                  </td>

                  <td className="py-3.5 px-4 max-w-xs text-slate-600 text-[11px]">
                    {item.recommendations && item.recommendations.length > 0 ? (
                      <div>
                        <strong className="block text-slate-800">{item.recommendations[0].actionTitle}</strong>
                        {item.recommendations[0].recommendedAction}
                      </div>
                    ) : (
                      <span className="text-slate-400">No corrective action required</span>
                    )}
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    {reviewActions[item.applicationId] ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded">
                        <CheckCircle2 className="h-3 w-3" />
                        Decision: {reviewActions[item.applicationId]}
                      </span>
                    ) : (
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleReviewDecision(item.applicationId, 'accepted')}
                          className="px-2.5 py-1 text-[11px] font-semibold rounded bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
                        >
                          Accept
                        </button>
                        <button
                          type="button"
                          onClick={() => handleReviewDecision(item.applicationId, 'rejected')}
                          className="px-2.5 py-1 text-[11px] font-semibold rounded bg-rose-600 text-white hover:bg-rose-700 transition-colors"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
