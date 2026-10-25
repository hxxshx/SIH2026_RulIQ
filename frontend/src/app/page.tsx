'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Network,
  ShieldCheck,
  Search,
  Filter,
  Sparkles,
  Sliders,
  Play,
  ArrowRight,
  FileCheck,
  Building,
  GraduationCap,
  Calendar,
  Layers,
  Activity,
  AlertCircle,
  Eye,
  RefreshCw,
  XCircle,
  Check,
  ChevronRight,
  ChevronDown,
  Info,
  ShieldAlert,
  Send,
  Zap,
  SlidersHorizontal,
  Compass,
  Download,
  Building2,
  Share2,
  FileSpreadsheet,
  CheckCircle,
  Hash,
  ExternalLink,
  Printer,
  MapPin,
  Award
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  Legend
} from 'recharts';
import { MOCK_APPLICATIONS, MOCK_RULES, MOCK_ALERTS } from '@/lib/mock-data';
import { Application, RegulatoryRule, ComplianceAlert } from '@/types';

type ActiveTab = 'explorer' | 'deficits' | 'dossiers' | 'analytics' | 'impact' | 'workflow';

export default function DashboardPage() {
  // Navigation & Feature State
  const [activeTab, setActiveTab] = useState<ActiveTab>('explorer');
  
  // Applications State (8 Monitored Technical Institutions matching screenshot)
  const [applications, setApplications] = useState<Application[]>(MOCK_APPLICATIONS);
  const [selectedAppId, setSelectedAppId] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [bureauFilter, setBureauFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Recovery State
  const [acceptedPlans, setAcceptedPlans] = useState<Record<number, string>>({});
  const [signedReviewNotes, setSignedReviewNotes] = useState<Record<number, boolean>>({});
  const [showNoticeModal, setShowNoticeModal] = useState(false);
  const [showDossierModal, setShowDossierModal] = useState(false);
  const [showFlagshipModal, setShowFlagshipModal] = useState(false);
  const [flagshipStage, setFlagshipStage] = useState<number>(1);
  const [isAutoPlayingFlagship, setIsAutoPlayingFlagship] = useState(false);
  const [flagshipHighlighted, setFlagshipHighlighted] = useState(false);
  const [noticeDetails, setNoticeDetails] = useState<any>(null);

  // Prevent background scrolling when any modal is open
  useEffect(() => {
    if (showFlagshipModal || showDossierModal || showNoticeModal) {
      const originalBodyOverflow = document.body.style.overflow;
      const originalHtmlOverflow = document.documentElement.style.overflow;
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalBodyOverflow;
        document.documentElement.style.overflow = originalHtmlOverflow;
      };
    }
  }, [showFlagshipModal, showDossierModal, showNoticeModal]);

  // Simulation State (for Dynamic Impact Analysis)
  const [selectedRuleId, setSelectedRuleId] = useState<number>(1);
  const [simulatedFsr, setSimulatedFsr] = useState<number>(15);
  const [simulatedCarpetArea, setSimulatedCarpetArea] = useState<number>(4.5);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationRan, setSimulationRan] = useState(false);
  const [impactResults, setImpactResults] = useState<{
    totalScanned: number;
    affectedCount: number;
    highRiskCount: number;
    moderateRiskCount: number;
    compliantCount: number;
    flaggedInstitutions: string[];
  }>({
    totalScanned: 1420,
    affectedCount: 38,
    highRiskCount: 14,
    moderateRiskCount: 24,
    compliantCount: 1382,
    flaggedInstitutions: [
      'Demo Institute North (DEMO-PID-104)',
      'Venkateshwara College of Technology (1-7892104)',
      'Apex Institute of Engineering & Research (1-8921443)',
      'Kalinga Polytechnic Institute (1-7712390)',
      'Himalayan Institute of Applied Sciences (1-4512998)'
    ]
  });



  // Evidence Verification State
  const [evidenceList, setEvidenceList] = useState([
    {
      id: 1,
      appName: 'Demo Institute North',
      appNo: 'APP-2026-NR-0104',
      requirement: 'Cadre Ratio & Faculty Service Register',
      fileName: 'Faculty_Service_Register_2026.pdf',
      fileSize: '3.4 MB',
      status: 'pending',
      uploadedDate: '24 Oct 2026',
      notes: 'Contains biometric attendance ledger for 68 teaching staff.'
    },
    {
      id: 2,
      appName: 'Apex Institute of Engineering & Research',
      appNo: 'APP-2026-MH-0144',
      requirement: 'Institutional Land Ownership Certificate',
      fileName: 'Land_Use_Certificate_Khasra_901.pdf',
      fileSize: '5.1 MB',
      status: 'verified',
      uploadedDate: '22 Oct 2026',
      notes: '7.5 Acres contiguous campus verified with Revenue Dept stamp.'
    },
    {
      id: 3,
      appName: 'Kalinga Polytechnic Institute',
      appNo: 'APP-2026-MP-0077',
      requirement: 'State Fire Safety NOC Validity Certificate',
      fileName: 'State_Fire_Safety_NOC_Renewal.pdf',
      fileSize: '1.2 MB',
      status: 'rejected',
      uploadedDate: '20 Oct 2026',
      notes: 'NOC certificate validity expired on 30 Sept 2026. Renewal pending.'
    }
  ]);
  const [selectedEvidence, setSelectedEvidence] = useState<any>(evidenceList[0]);

  // Selected Application Computed
  const selectedApp = useMemo(() => {
    return applications.find((a) => a.id === selectedAppId) || applications[0];
  }, [applications, selectedAppId]);

  // Filtered Applications for Explorer & Table
  const filteredApps = useMemo(() => {
    return applications.filter((app) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        app.applicationNumber.toLowerCase().includes(q) ||
        app.institution.name.toLowerCase().includes(q) ||
        app.institution.state.toLowerCase().includes(q) ||
        app.institution.aictePermanentId.toLowerCase().includes(q);

      const matchesBureau =
        bureauFilter === 'all' ||
        app.institution.region?.toLowerCase().includes(bureauFilter.toLowerCase());

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'overlap' && (app.institution.deficitCount ?? 0) > 0) ||
        (statusFilter === 'verified' && app.institution.identityVerified) ||
        (statusFilter === 'unverified' && !app.institution.identityVerified) ||
        app.status === statusFilter;

      return matchesSearch && matchesBureau && matchesStatus;
    });
  }, [applications, searchQuery, bureauFilter, statusFilter]);

  // Stage transition action (Interactive Workflow)
  const handleStageChange = (appId: number, newStage: Application['status']) => {
    setApplications((prev) =>
      prev.map((app) => (app.id === appId ? { ...app, status: newStage } : app))
    );
  };

  // Run dynamic impact simulation
  const handleRunSimulation = () => {
    setIsSimulating(true);
    setTimeout(() => {
      const factor = simulatedFsr <= 15 ? 1.6 : simulatedFsr <= 18 ? 1.2 : 0.8;
      const baseAffected = Math.round(38 * factor);
      const highRisk = Math.round(baseAffected * 0.35);
      const moderate = baseAffected - highRisk;
      const compliant = 1420 - baseAffected;

      setImpactResults({
        totalScanned: 1420,
        affectedCount: baseAffected,
        highRiskCount: highRisk,
        moderateRiskCount: moderate,
        compliantCount: compliant,
        flaggedInstitutions: [
          'Demo Institute North (DEMO-PID-104)',
          'Venkateshwara College of Technology (1-7892104)',
          'Apex Institute of Engineering & Research (1-8921443)',
          'Kalinga Polytechnic Institute (1-7712390)',
          'Himalayan Institute of Applied Sciences (1-4512998)',
          ...(baseAffected > 45 ? ['Meghnad Saha Tech Campus (1-8910123)'] : [])
        ]
      });
      setIsSimulating(false);
      setSimulationRan(true);
    }, 600);
  };

  // Accept Recovery Plan
  const handleAcceptRecovery = (appId: number, planType: string) => {
    setAcceptedPlans((prev) => ({ ...prev, [appId]: planType }));
    setApplications((prev) =>
      prev.map((app) =>
        app.id === appId
          ? {
              ...app,
              status: 'compliance_pending',
              metRequirements: app.totalRequirements,
              institution: { ...app.institution, deficitCount: 0 }
            }
          : app
      )
    );
  };

  // Sign Review Note
  const handleSignReviewNote = (appId: number) => {
    setSignedReviewNotes((prev) => ({ ...prev, [appId]: true }));
  };

  // Verify / Reject Evidence
  const handleVerifyEvidence = (id: number, status: 'verified' | 'rejected') => {
    setEvidenceList((prev) =>
      prev.map((ev) => (ev.id === id ? { ...ev, status } : ev))
    );
    if (selectedEvidence?.id === id) {
      setSelectedEvidence((prev: any) => ({ ...prev, status }));
    }
  };

  // Flagship Test Case Launch Handler
  const handleLaunchFlagship = (stage: number = 1) => {
    setSelectedAppId(1);
    setFlagshipStage(stage);
    setShowFlagshipModal(true);
  };

  const handleAutoPlayFlagship = () => {
    setIsAutoPlayingFlagship(true);
    let s = 1;
    setFlagshipStage(1);
    const interval = setInterval(() => {
      s += 1;
      if (s > 5) {
        clearInterval(interval);
        setIsAutoPlayingFlagship(false);
        setFlagshipStage(5);
        handleAcceptRecovery(1, '60-Day Conditional Undertaking with Adjunct Credits');
        handleSignReviewNote(1);
      } else {
        setFlagshipStage(s);
      }
    }, 1300);
  };

  const handleJumpToExplorerInspector = () => {
    setShowFlagshipModal(false);
    setActiveTab('explorer');
    setSelectedAppId(1);
    setFlagshipHighlighted(true);
    setTimeout(() => {
      const el = document.getElementById('detailed-case-dossier');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }, 120);
    setTimeout(() => setFlagshipHighlighted(false), 3500);
  };

  // Reset filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setBureauFilter('all');
    setStatusFilter('all');
  };

  // Export CSV Action
  const handleExportCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [
        ['Permanent ID', 'Institution Name', 'Region', 'State', 'Category', 'Cases', 'Overlaps', 'Status'].join(','),
        ...applications.map((app) =>
          [
            `"${app.institution.aictePermanentId}"`,
            `"${app.institution.name}"`,
            `"${app.institution.region || 'HQ'}"`,
            `"${app.institution.state}"`,
            `"${app.institution.category}"`,
            app.institution.casesCount || 3,
            app.institution.deficitCount || 0,
            app.status
          ].join(',')
        )
      ].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'AICTE_Monitored_Institutions_Register.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Analytics Chart Data
  const regionalData = [
    { name: 'Northern', monitored: 420, overlaps: 14, resolved: 38 },
    { name: 'Western', monitored: 380, overlaps: 10, resolved: 32 },
    { name: 'South-Central', monitored: 290, overlaps: 8, resolved: 24 },
    { name: 'Central', monitored: 180, overlaps: 4, resolved: 16 },
    { name: 'South-Western', monitored: 150, overlaps: 2, resolved: 14 },
  ];

  const compliancePieData = [
    { name: 'Fully Compliant', value: 1382, color: '#16a34a' },
    { name: 'Explainable Overlaps', value: 24, color: '#eab308' },
    { name: 'Critical Deficits', value: 14, color: '#dc2626' },
  ];

  return (
    <div className="space-y-4 sm:space-y-5">

      {/* =========================================================================
          JOURNEY RIBBON: CORE 3-MINUTE JOURNEY (Quick Demo Path)
          Directly matches screenshot top ribbon bar
         ========================================================================= */}
      <div className="bg-[#fbf9f4] border border-[#ded8cb] rounded-xl px-3.5 py-2.5 shadow-2xs">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-2.5 text-xs">
          
          <div className="flex items-center flex-wrap gap-2">
            <span className="bg-[#7c1a2d] text-white font-bold px-2.5 py-1 rounded text-[11px] tracking-wide shrink-0">
              CORE 3-MINUTE JOURNEY
            </span>
            <span className="font-bold text-slate-800 shrink-0">
              Quick Demo Path:
            </span>

            {/* Stepper items with subtle arrows - fully functional */}
            <div className="flex items-center flex-wrap gap-1.5 text-slate-700 font-medium">
              <button
                type="button"
                onClick={() => handleLaunchFlagship(1)}
                className="hover:text-[#7c1a2d] font-bold text-slate-900 hover:underline cursor-pointer"
                title="Launch Stage 1: Verified AICTE PID Anchor"
              >
                1. Demo Institute North
              </button>
              <span className="text-slate-400 font-bold">→</span>

              <button
                type="button"
                onClick={() => handleLaunchFlagship(3)}
                className="hover:text-[#7c1a2d] hover:underline cursor-pointer"
                title="Launch Stage 3: Inspect 84% TF-IDF Cadre Deficit"
              >
                2. Inspect Overlap (84% TF-IDF)
              </button>
              <span className="text-slate-400 font-bold">→</span>

              <button
                type="button"
                onClick={() => handleLaunchFlagship(4)}
                className="hover:text-[#7c1a2d] hover:underline cursor-pointer"
                title="Launch Stage 4: NetworkX Traversal & Co-Docket Remediation"
              >
                3. Assemble Co-Docket™
              </button>
              <span className="text-slate-400 font-bold">→</span>

              <button
                type="button"
                onClick={() => handleLaunchFlagship(5)}
                className={`hover:text-[#7c1a2d] hover:underline cursor-pointer ${signedReviewNotes[1] ? 'text-emerald-700 font-bold' : ''}`}
                title="Launch Stage 5: Review Note Signing"
              >
                4. Sign Review Note {signedReviewNotes[1] && '✓'}
              </button>
              <span className="text-slate-400 font-bold">→</span>

              <button
                type="button"
                onClick={() => setShowDossierModal(true)}
                className="hover:text-[#7c1a2d] font-bold text-emerald-800 hover:underline cursor-pointer"
                title="Download Official Co-Docket™ PDF Dossier"
              >
                5. Download PDF
              </button>
            </div>
          </div>

          {/* Right link to launch Flagship Test Case - Prominent and 100% Functional */}
          <button
            type="button"
            onClick={() => handleLaunchFlagship(1)}
            className="text-[#7c1a2d] hover:text-[#5a111f] font-black underline text-xs flex items-center gap-1.5 shrink-0 bg-[#fef2f2] hover:bg-[#fee2e2] px-3 py-1.5 rounded-lg border border-[#fecaca] transition-all shadow-2xs hover:shadow-xs active:scale-95 cursor-pointer"
          >
            <Sparkles className="h-3.5 w-3.5 text-[#7c1a2d] animate-pulse" />
            <span>Click to Launch Flagship Test Case (&apos;DEMO-PID-104&apos;)</span>
            <span className="font-mono text-sm">→</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          ROW 1 · FEATURES EASY CLICK (3 Stat Action Cards)
          Matches screenshot pixel-for-pixel with gold label & card styles
         ========================================================================= */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="bg-[#fef3c7] text-[#78350f] border border-[#fcd34d] px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide">
            ROW 1 · FEATURES EASY CLICK
          </span>
          <span className="text-xs text-slate-600 font-medium">
            Direct navigation across core AICTE monitoring operational streams
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-4">
          
          {/* Card 1: All Monitored Institutions */}
          <div
            onClick={() => setActiveTab('explorer')}
            className={`bg-white border rounded-2xl p-4 sm:p-5 shadow-2xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between ${
              activeTab === 'explorer'
                ? 'border-[#7c1a2d] ring-2 ring-[#7c1a2d]/20 bg-[#fdfcf9]'
                : 'border-[#ded8cb] hover:border-[#7c1a2d]'
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-bold text-slate-700">
                  All Monitored Institutions
                </span>
                <div className="flex items-baseline gap-2 mt-1.5">
                  <span className="text-3xl sm:text-4xl font-black text-[#0f2942] tracking-tight">
                    1,420
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 bg-slate-100 text-slate-700 rounded uppercase">
                    ACTIVE
                  </span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-[#fef3c7] border border-[#fcd34d]/60 text-[#78350f] flex items-center justify-center shrink-0">
                <Building2 className="h-5 w-5" />
              </div>
            </div>

            <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">
                8 Seeded in Demo · 100% Verified Primary Anchors
              </span>
              <span className="font-bold text-[#7c1a2d] hover:underline flex items-center gap-0.5">
                Open ↗
              </span>
            </div>
          </div>

          {/* Card 2: Cross-Bureau Overlaps Flagged */}
          <div
            onClick={() => setActiveTab('deficits')}
            className={`bg-white border rounded-2xl p-4 sm:p-5 shadow-2xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between ${
              activeTab === 'deficits'
                ? 'border-[#7c1a2d] ring-2 ring-[#7c1a2d]/20 bg-[#fdfcf9]'
                : 'border-[#ded8cb] hover:border-[#7c1a2d]'
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-bold text-slate-700">
                  Cross-Bureau Overlaps Flagged
                </span>
                <div className="flex items-baseline gap-2 mt-1.5">
                  <span className="text-3xl sm:text-4xl font-black text-[#0f2942] tracking-tight">
                    38
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 bg-rose-100 text-rose-800 rounded uppercase">
                    ACTIVE
                  </span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-[#fee2e2] border border-[#fca5a5]/60 text-[#991b1b] flex items-center justify-center shrink-0">
                <AlertTriangle className="h-5 w-5" />
              </div>
            </div>

            <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">
                3 Active AICTE Overlaps · Explainable TF-IDF Matches
              </span>
              <span className="font-bold text-[#7c1a2d] hover:underline flex items-center gap-0.5">
                Open ↗
              </span>
            </div>
          </div>

          {/* Card 3: Co-Docket™ Review Packs */}
          <div
            onClick={() => setActiveTab('dossiers')}
            className={`bg-white border rounded-2xl p-4 sm:p-5 shadow-2xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between ${
              activeTab === 'dossiers'
                ? 'border-[#7c1a2d] ring-2 ring-[#7c1a2d]/20 bg-[#fdfcf9]'
                : 'border-[#ded8cb] hover:border-[#7c1a2d]'
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-bold text-slate-700">
                  Co-Docket™ Review Packs
                </span>
                <div className="flex items-baseline gap-2 mt-1.5">
                  <span className="text-3xl sm:text-4xl font-black text-[#0f2942] tracking-tight">
                    12
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded uppercase">
                    ACTIVE
                  </span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-[#fef3c7] border border-[#fcd34d]/60 text-[#78350f] flex items-center justify-center shrink-0">
                <FileText className="h-5 w-5" />
              </div>
            </div>

            <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">
                1 Ready Dossiers · Timestamped Context Receipts
              </span>
              <span className="font-bold text-[#7c1a2d] hover:underline flex items-center gap-0.5">
                Open ↗
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* =========================================================================
          ROW 2 · TAB NAVIGATION & FILTER TOOLBAR
          Matches screenshot button pill styles (maroon active, cream inactive)
         ========================================================================= */}
      <div className="bg-[#faf8f4] border border-[#ded8cb] rounded-2xl p-3 sm:p-4 shadow-2xs space-y-3">
        
        {/* Row of Action Tabs */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center flex-wrap gap-1.5 sm:gap-2">
            
            {/* Tab 1: Institution Explorer */}
            <button
              type="button"
              onClick={() => setActiveTab('explorer')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'explorer'
                  ? 'bg-[#7c1a2d] text-white shadow-xs'
                  : 'bg-white border border-[#ded8cb] text-slate-700 hover:bg-[#eae4d5]'
              }`}
            >
              <Building2 className="h-4 w-4" />
              <span>Institution Explorer</span>
            </button>

            {/* Tab 2: Explainable Overlaps TF-IDF */}
            <button
              type="button"
              onClick={() => setActiveTab('deficits')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'deficits'
                  ? 'bg-[#7c1a2d] text-white shadow-xs'
                  : 'bg-white border border-[#ded8cb] text-slate-700 hover:bg-[#eae4d5]'
              }`}
            >
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <span>Explainable Overlaps</span>
              <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded font-mono">
                TF-IDF
              </span>
            </button>

            {/* Tab 3: Co-Docket Dossiers */}
            <button
              type="button"
              onClick={() => setActiveTab('dossiers')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'dossiers'
                  ? 'bg-[#7c1a2d] text-white shadow-xs'
                  : 'bg-white border border-[#ded8cb] text-slate-700 hover:bg-[#eae4d5]'
              }`}
            >
              <FileCheck className="h-4 w-4" />
              <span>Co-Docket™ Dossiers</span>
              <span className="text-[10px] bg-sky-100 text-sky-800 px-1.5 py-0.2 rounded font-mono">
                PDF
              </span>
            </button>

            {/* Tab 4: Dashboard Analytics */}
            <button
              type="button"
              onClick={() => setActiveTab('analytics')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'analytics'
                  ? 'bg-[#7c1a2d] text-white shadow-xs'
                  : 'bg-white border border-[#ded8cb] text-slate-700 hover:bg-[#eae4d5]'
              }`}
            >
              <Activity className="h-4 w-4" />
              <span>Dashboard Analytics</span>
            </button>

            {/* Tab 5: Rule Simulation (DAG) */}
            <button
              type="button"
              onClick={() => setActiveTab('impact')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'impact'
                  ? 'bg-[#7c1a2d] text-white shadow-xs'
                  : 'bg-white border border-[#ded8cb] text-slate-700 hover:bg-[#eae4d5]'
              }`}
            >
              <Network className="h-4 w-4" />
              <span>Rule Simulation</span>
              <span className="text-[10px] bg-orange-100 text-orange-800 px-1.5 py-0.2 rounded font-mono">
                DAG
              </span>
            </button>

            {/* Tab 6: Full Case Register */}
            <button
              type="button"
              onClick={() => setActiveTab('workflow')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'workflow'
                  ? 'bg-[#7c1a2d] text-white shadow-xs'
                  : 'bg-white border border-[#ded8cb] text-slate-700 hover:bg-[#eae4d5]'
              }`}
            >
              <Layers className="h-4 w-4" />
              <span>Full Case Register</span>
            </button>

          </div>

          {/* Quick Engine Actions */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setActiveTab('impact');
                handleRunSimulation();
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#fef3c7] border border-[#f59e0b] text-[#78350f] text-xs font-bold hover:bg-[#fde68a] transition-colors shadow-2xs"
            >
              <RefreshCw className="h-3.5 w-3.5 text-[#78350f]" />
              <span>Run Engine Scan</span>
            </button>

            <button
              type="button"
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0f2942] text-white text-xs font-bold hover:bg-[#153a5c] transition-colors shadow-2xs"
            >
              <Download className="h-3.5 w-3.5 text-white" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Filter and Search Bar matching screenshot */}
        <div className="flex flex-col sm:flex-row items-center gap-2 text-xs pt-1">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by AICTE PID (e.g. DEMO-PID-104, 1-8921443) or College Name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-[#ded8cb] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#7c1a2d]/20 focus:border-[#7c1a2d] text-slate-900 placeholder:text-slate-400"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={bureauFilter}
              onChange={(e) => setBureauFilter(e.target.value)}
              className="px-3 py-2 bg-white border border-[#ded8cb] rounded-xl text-slate-700 font-medium focus:ring-2 focus:ring-[#7c1a2d]/20 focus:border-[#7c1a2d] text-xs"
            >
              <option value="all">All Bureaus / Regions</option>
              <option value="Northern">Northern Region</option>
              <option value="Western">Western Region</option>
              <option value="South-Central">South-Central Region</option>
              <option value="Central">Central Region</option>
              <option value="South-Western">South-Western Region</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-white border border-[#ded8cb] rounded-xl text-slate-700 font-medium focus:ring-2 focus:ring-[#7c1a2d]/20 focus:border-[#7c1a2d] text-xs"
            >
              <option value="all">All Statuses</option>
              <option value="overlap">Deficit Flagged / Overlaps</option>
              <option value="verified">Verified Identity</option>
              <option value="unverified">Identity Unverified</option>
              <option value="approved">Approved EoA</option>
              <option value="under_scrutiny">Under Scrutiny</option>
            </select>

            <button
              type="button"
              onClick={handleResetFilters}
              className="px-3 py-2 bg-white border border-[#ded8cb] hover:bg-[#eae4d5] text-slate-700 rounded-xl font-bold text-xs transition-colors shrink-0"
            >
              Reset
            </button>
          </div>
        </div>

      </div>

      {/* =========================================================================
          VIEW 1: INSTITUTION EXPLORER (The 8 Technical Institutions Grid)
          Exact match to screenshot bottom section
         ========================================================================= */}
      {activeTab === 'explorer' && (
        <div className="bg-white border border-[#ded8cb] rounded-3xl p-5 sm:p-6 shadow-xs space-y-6 animate-fadeIn">
          
          {/* Header Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[#7c1a2d]">🏛️</span>
                <h2 className="text-sm sm:text-base font-black tracking-wide text-slate-900 uppercase">
                  MONITORED TECHNICAL INSTITUTIONS ({filteredApps.length})
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Select an institution to inspect partitioned bureau cases and explainable overlap alerts
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="bg-[#fef3c7] text-[#78350f] border border-[#fcd34d] px-3 py-1 rounded-full text-[11px] font-bold">
                GovTech Principle 2: Verified PID Primary Anchor
              </span>
            </div>
          </div>

          {/* 3-Column Grid of 8 Institutions matching screenshot */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredApps.map((app) => {
              const isSelected = selectedAppId === app.id;
              const hasDeficit = (app.institution.deficitCount ?? 0) > 0;
              const isVerified = app.institution.identityVerified ?? true;

              return (
                <div
                  key={app.id}
                  onClick={() => setSelectedAppId(app.id)}
                  className={`bg-[#fdfcf9] border rounded-2xl p-4 transition-all duration-150 cursor-pointer flex flex-col justify-between gap-3 text-left ${
                    isSelected
                      ? 'border-[#7c1a2d] ring-2 ring-[#7c1a2d]/20 shadow-sm bg-white'
                      : 'border-[#e5dfd3] hover:border-[#7c1a2d] hover:shadow-xs'
                  }`}
                >
                  {/* Top row: Pill badge on left, Region on right */}
                  <div className="flex items-center justify-between text-xs">
                    {isVerified ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#ecfdf5] text-[#065f46] border border-[#a7f3d0]">
                        <Check className="h-3 w-3" />
                        PID: {app.institution.aictePermanentId}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#fef3c7] text-[#78350f] border border-[#fcd34d]">
                        <AlertTriangle className="h-3 w-3" />
                        Identity Unverified
                      </span>
                    )}

                    <span className="text-[11px] text-slate-500 font-medium">
                      {app.institution.region || 'Northern Region'}
                    </span>
                  </div>

                  {/* Middle: Institution Name and Location */}
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 line-clamp-1 hover:text-[#7c1a2d] transition-colors">
                      {app.institution.name}
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                      {app.institution.district}, {app.institution.state} · {app.institution.category}
                    </p>
                  </div>

                  {/* Bottom row: Badges on left, Inspect link on right */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {app.institution.casesCount || 3} Cases
                      </span>

                      {hasDeficit ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#fef2f2] text-[#991b1b] border border-[#fecaca] flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3 text-[#991b1b]" />
                          {app.institution.deficitCount} Overlap
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#ecfdf5] text-[#065f46] border border-[#a7f3d0] flex items-center gap-1">
                          <Check className="h-3 w-3 text-[#065f46]" />
                          0 Overlaps
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedAppId(app.id);
                      }}
                      className="text-xs font-bold text-[#7c1a2d] hover:underline flex items-center gap-0.5"
                    >
                      <span>Inspect</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* =========================================================================
              SELECTED INSTITUTION DETAILED SCRUTINY & CO-DOCKET INSPECTOR
             ========================================================================= */}
          <div
            id="detailed-case-dossier"
            className={`mt-6 pt-6 border-t-2 border-[#ded8cb] space-y-5 rounded-3xl transition-all duration-300 ${
              flagshipHighlighted ? 'ring-4 ring-[#7c1a2d] bg-[#fffaf5] p-5 sm:p-6 shadow-lg' : ''
            }`}
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#7c1a2d] bg-[#fbf9f4] px-2.5 py-1 rounded-md border border-[#ded8cb]">
                    PID ANCHOR: {selectedApp.institution.aictePermanentId}
                  </span>
                  <h3 className="text-base font-black text-slate-900">
                    {selectedApp.institution.name} — Detailed Case Dossier
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Application Ref: <strong className="font-mono text-slate-700">{selectedApp.applicationNumber}</strong> (AY {selectedApp.academicYear}) • Contact: {selectedApp.institution.contactEmail}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleSignReviewNote(selectedApp.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    signedReviewNotes[selectedApp.id]
                      ? 'bg-emerald-600 text-white'
                      : 'bg-[#fef3c7] border border-[#f59e0b] text-[#78350f] hover:bg-[#fde68a]'
                  }`}
                >
                  <Check className="h-3.5 w-3.5" />
                  <span>{signedReviewNotes[selectedApp.id] ? 'Review Note Signed ✓' : 'Sign Review Note'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowDossierModal(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-[#7c1a2d] text-white text-xs font-bold hover:bg-[#631423] transition-colors flex items-center gap-1.5 shadow-2xs"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Download Co-Docket™ PDF</span>
                </button>
              </div>
            </div>

            {/* 3 Partitioned Bureau Columns */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Bureau 1: Approval Bureau (HQ-Delhi) */}
              <div className="p-4 rounded-2xl bg-[#faf8f4] border border-[#ded8cb] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wide">
                    1. Approval Bureau (HQ)
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200">
                    EoA Scrutiny
                  </span>
                </div>
                <div className="text-xs space-y-1.5 text-slate-600">
                  <div className="flex justify-between">
                    <span>Application Type:</span>
                    <strong className="text-slate-800 uppercase text-[11px]">{selectedApp.applicationType.replace(/_/g, ' ')}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Requirements Met:</span>
                    <strong className="text-slate-800">{selectedApp.metRequirements} of {selectedApp.totalRequirements}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Scrutiny Stage:</span>
                    <strong className="text-slate-800 capitalize">{selectedApp.status.replace(/_/g, ' ')}</strong>
                  </div>
                </div>
              </div>

              {/* Bureau 2: Regulation Bureau (HQ-Delhi) */}
              <div className="p-4 rounded-2xl bg-[#faf8f4] border border-[#ded8cb] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wide">
                    2. Regulation Bureau (HQ)
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">
                    Norm Check (84% TF-IDF)
                  </span>
                </div>
                <div className="text-xs space-y-1.5 text-slate-600">
                  <div className="flex justify-between">
                    <span>FSR Mandate:</span>
                    <strong className="text-slate-800">1:20 UG Engineering</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Cadre Ratio:</span>
                    <strong className="text-rose-700">1 Prof : 2 Asso : 6 Asst (Deficit)</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Clause Match:</span>
                    <strong className="text-[#7c1a2d]">AICTE APH Ch 2 Cl 4.2</strong>
                  </div>
                </div>
              </div>

              {/* Bureau 3: Grievance / Vigilance Cell */}
              <div className="p-4 rounded-2xl bg-[#faf8f4] border border-[#ded8cb] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wide">
                    3. Grievance / Vigilance Cell
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                    Statutory NOCs
                  </span>
                </div>
                <div className="text-xs space-y-1.5 text-slate-600">
                  <div className="flex justify-between">
                    <span>Land Title Deed:</span>
                    <strong className="text-emerald-700">Verified (7.5 Acres)</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Fire Safety NOC:</span>
                    <strong className="text-slate-800">Valid till 30 Nov 2026</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Appeals Pending:</span>
                    <strong className="text-slate-800">0 Complaints</strong>
                  </div>
                </div>
              </div>

            </div>

            {/* Curative Remediation Actions (Pillar 3 from Original Solution) */}
            <div className="p-4 rounded-2xl bg-white border border-[#ded8cb] space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-emerald-700" />
                  <span>Curative Remediation & Recovery Options (Automated Decision Support)</span>
                </h4>
                {acceptedPlans[selectedApp.id] && (
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
                    Active Plan: {acceptedPlans[selectedApp.id]}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-[#fdfcf9] border border-emerald-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-800">Option A: 60-Day Undertaking with Adjunct Credits</span>
                    <button
                      type="button"
                      onClick={() => handleAcceptRecovery(selectedApp.id, '60-Day Conditional Undertaking')}
                      className="px-2.5 py-1 rounded-lg bg-emerald-700 text-white font-bold hover:bg-emerald-800 text-[11px]"
                    >
                      Accept Plan
                    </button>
                  </div>
                  <p className="text-slate-600 text-[11px]">
                    Allows provisional compliance by mapping accredited industry adjunct faculty credits while initiating formal recruitment for 2 Associate Professors within a statutory 60-day window.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-[#fdfcf9] border border-blue-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-blue-800">Option B: Fast-Track Regional EVC Re-Inspection</span>
                    <button
                      type="button"
                      onClick={() => handleAcceptRecovery(selectedApp.id, 'Fast-Track EVC Inspection')}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 text-[11px]"
                    >
                      Schedule EVC
                    </button>
                  </div>
                  <p className="text-slate-600 text-[11px]">
                    Dispatches a regional 2-member Expert Visiting Committee (EVC) to the physical campus for on-the-spot physical verification of biometric ledger and cadre registers.
                  </p>
                </div>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* =========================================================================
          VIEW 2: EXPLAINABLE OVERLAPS [TF-IDF / NETWORKX]
         ========================================================================= */}
      {activeTab === 'deficits' && (
        <div className="bg-white border border-[#ded8cb] rounded-3xl p-5 sm:p-6 shadow-xs space-y-6 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[#991b1b]">⚠️</span>
                <h2 className="text-sm sm:text-base font-black tracking-wide text-slate-900 uppercase">
                  CROSS-BUREAU REGULATORY OVERLAPS & STATUTORY DEFICITS (38)
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Explainable TF-IDF matching and NetworkX DAG traversal across technical institutions
              </p>
            </div>
            <span className="bg-[#fee2e2] text-[#991b1b] border border-[#fca5a5] px-3 py-1 rounded-full text-xs font-bold">
              3 Active Critical Deficits
            </span>
          </div>

          <div className="space-y-3">
            {applications.filter((a) => (a.institution.deficitCount ?? 0) > 0).map((app) => (
              <div
                key={app.id}
                className="p-4 rounded-2xl bg-[#fdfcf9] border border-[#ded8cb] hover:border-[#7c1a2d] transition-all space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                      {app.institution.aictePermanentId}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900">
                      {app.institution.name}
                    </h3>
                    <span className="text-[11px] text-slate-500 font-medium">
                      ({app.institution.region})
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-200">
                      84% TF-IDF Conflict Score
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedAppId(app.id);
                        setActiveTab('explorer');
                      }}
                      className="px-3 py-1 rounded-lg bg-[#7c1a2d] text-white font-bold text-xs hover:bg-[#631423]"
                    >
                      Examine in Explorer →
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs bg-white p-3.5 rounded-xl border border-slate-100">
                  <div>
                    <span className="text-slate-400 font-medium block text-[10px]">Overlapping Standard:</span>
                    <span className="font-semibold text-slate-800">AICTE APH Ch 2 Cl 4.2 (Cadre Norms)</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium block text-[10px]">Observed Deficiency:</span>
                    <span className="font-semibold text-rose-700">Shortfall of 2 Associate Professors</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium block text-[10px]">Recommended Resolution:</span>
                    <span className="font-semibold text-emerald-700">60-Day Provisional Undertaking</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW 3: CO-DOCKET™ REVIEW PACKS & EVIDENCE [PDF]
         ========================================================================= */}
      {activeTab === 'dossiers' && (
        <div className="bg-white border border-[#ded8cb] rounded-3xl p-5 sm:p-6 shadow-xs space-y-6 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[#0f2942]">📁</span>
                <h2 className="text-sm sm:text-base font-black tracking-wide text-slate-900 uppercase">
                  CO-DOCKET™ COMPLIANCE DOSSIERS & EVIDENCE REPOSITORY
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Timestamped context receipts, official evidentiary proofs, and cryptographic digital seals
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowDossierModal(true)}
              className="px-3.5 py-1.5 rounded-xl bg-[#7c1a2d] text-white text-xs font-bold hover:bg-[#631423] flex items-center gap-1.5 shadow-2xs"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print Flagship Review Pack</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                Evidence Documents Pending Scrutiny Review
              </span>

              {evidenceList.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedEvidence(item)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                    selectedEvidence?.id === item.id
                      ? 'border-[#7c1a2d] bg-[#fdfcf9] ring-2 ring-[#7c1a2d]/20'
                      : 'border-[#ded8cb] bg-white hover:border-[#7c1a2d]'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-xl bg-[#fef3c7] text-[#78350f] flex items-center justify-center shrink-0">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-xs">
                          {item.requirement}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500">
                          {item.appNo}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 font-medium mt-0.5">
                        {item.appName}
                      </p>
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                        <span>{item.fileName}</span>
                        <span>•</span>
                        <span>{item.fileSize}</span>
                        <span>•</span>
                        <span>{item.uploadedDate}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2 shrink-0">
                    {item.status === 'verified' && (
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                        Verified
                      </span>
                    )}
                    {item.status === 'rejected' && (
                      <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold border border-rose-200">
                        Rejected
                      </span>
                    )}
                    {item.status === 'pending' && (
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold border border-amber-200">
                        Awaiting Review
                      </span>
                    )}
                    <span className="text-xs font-bold text-[#7c1a2d]">
                      Inspect ➔
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Inspector Details */}
            <div className="lg:col-span-1 bg-[#faf8f4] p-5 rounded-2xl border border-[#ded8cb] space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Scrutiny Inspector
                </span>
                <span className="text-[10px] font-bold bg-[#fef3c7] text-[#78350f] border border-[#fcd34d] px-2 py-0.5 rounded">
                  Official Verification
                </span>
              </div>

              {selectedEvidence && (
                <div className="space-y-3">
                  <div className="p-3.5 rounded-xl bg-white border border-[#ded8cb] space-y-2">
                    <div className="font-bold text-slate-900 text-xs">
                      {selectedEvidence.requirement}
                    </div>
                    <p className="text-[11px] text-slate-500">
                      File: {selectedEvidence.fileName} ({selectedEvidence.fileSize})
                    </p>
                    <div className="p-2.5 rounded-lg bg-[#faf8f4] border border-slate-200 text-[11px] text-slate-600">
                      <strong>Context:</strong> {selectedEvidence.notes}
                    </div>
                  </div>

                  <div className="space-y-2 pt-1">
                    <button
                      type="button"
                      onClick={() => handleVerifyEvidence(selectedEvidence.id, 'verified')}
                      className="w-full py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 shadow-2xs"
                    >
                      <Check className="h-4 w-4" />
                      Approve Evidentiary Proof
                    </button>

                    <button
                      type="button"
                      onClick={() => handleVerifyEvidence(selectedEvidence.id, 'rejected')}
                      className="w-full py-2 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 font-bold text-xs hover:bg-rose-100 transition-colors flex items-center justify-center gap-2"
                    >
                      <XCircle className="h-4 w-4" />
                      Reject with Deficiency Memo
                    </button>
                  </div>

                  <div className="p-3 rounded-xl bg-white border border-[#ded8cb] text-center text-[10px] text-slate-500 space-y-1">
                    <div className="font-bold text-slate-800">
                      AICTE Defensible Co-Docket™ Node
                    </div>
                    <div>Receipt Hash: #AICTE-SEAL-2026-X89</div>
                    <div className="text-emerald-700 font-semibold">
                      🔒 Timestamped Immutable Audit Receipt
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW 4: DASHBOARD ANALYTICS (Recharts Charts)
         ========================================================================= */}
      {activeTab === 'analytics' && (
        <div className="bg-white border border-[#ded8cb] rounded-3xl p-5 sm:p-6 shadow-xs space-y-6 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[#0f2942]">📊</span>
                <h2 className="text-sm sm:text-base font-black tracking-wide text-slate-900 uppercase">
                  AICTE REGULATORY DASHBOARD ANALYTICS & APPROVAL METRICS
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Aggregate compliance velocity, regional deficit distribution, and institutional breakdown
              </p>
            </div>
            <span className="bg-[#fef3c7] text-[#78350f] border border-[#fcd34d] px-3 py-1 rounded-full text-xs font-bold">
              1,420 Active Monitored Applications
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Chart 1: Regional Overlaps & Resolutions */}
            <div className="p-4 rounded-2xl bg-[#faf8f4] border border-[#ded8cb] space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Regional Distribution of Monitored Institutions
              </h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={regionalData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2dcd0" />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                    <YAxis stroke="#64748b" fontSize={11} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="monitored" name="Total Monitored" fill="#0f2942" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="overlaps" name="Overlaps / Deficits" fill="#dc2626" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Compliance Breakdown Pie */}
            <div className="p-4 rounded-2xl bg-[#faf8f4] border border-[#ded8cb] space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Regulatory Compliance Status Breakdown
              </h3>
              <div className="h-64 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={compliancePieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={({ name, percent }: { name?: string; percent?: number }) => `${name ?? ''}: ${((percent ?? 0) * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {compliancePieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW 5: RULE SIMULATION (Interactive DAG Simulation Engine)
          Preserved 100% of the original solution capability
         ========================================================================= */}
      {activeTab === 'impact' && (
        <div className="bg-white border border-[#ded8cb] rounded-3xl p-5 sm:p-6 shadow-xs space-y-6 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[#ea580c]">🔄</span>
                <h2 className="text-sm sm:text-base font-black tracking-wide text-slate-900 uppercase">
                  REGULATORY CHANGE-IMPACT TRACING & AMENDMENT SIMULATOR
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Deterministic NetworkX Directed Acyclic Graph (DAG) simulation of proposed rule amendments
              </p>
            </div>
            <span className="bg-[#fef3c7] text-[#78350f] border border-[#fcd34d] px-3 py-1 rounded-full text-xs font-bold">
              NetworkX Traversal Engine Active
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Parameter adjusters */}
            <div className="lg:col-span-1 bg-[#faf8f4] p-5 rounded-2xl border border-[#ded8cb] space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Simulate Rule Amendment
                </h3>
                <span className="text-[10px] font-bold text-[#7c1a2d] bg-[#fee2e2] px-2 py-0.5 rounded border border-[#fca5a5]">
                  Live Dynamic
                </span>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Select AICTE Approval Rule:
                </label>
                <select
                  value={selectedRuleId}
                  onChange={(e) => setSelectedRuleId(Number(e.target.value))}
                  className="w-full text-xs bg-white border border-[#ded8cb] rounded-xl px-3 py-2 text-slate-900 font-medium focus:ring-2 focus:ring-[#7c1a2d]/20 focus:border-[#7c1a2d]"
                >
                  <option value={1}>AICTE-APH-CH2-FAC: Faculty-Student Ratio (FSR)</option>
                  <option value={2}>AICTE-APH-CH1-LND: Institutional Built-up Carpet Area</option>
                  <option value={3}>AICTE-APH-CH4-CSE: AI & Data Science Emerging Lab Setup</option>
                  <option value={4}>AICTE-APH-CH3-NOC: Fire Safety & Structural Soundness NOC</option>
                </select>
              </div>

              {/* Slider 1: FSR */}
              <div className="space-y-1.5 pt-2 border-t border-slate-200">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700">Mandated FSR Ratio:</span>
                  <span className="font-bold text-[#7c1a2d] bg-[#fef2f2] px-2 py-0.5 rounded">
                    1 : {simulatedFsr}
                  </span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={25}
                  step={1}
                  value={simulatedFsr}
                  onChange={(e) => setSimulatedFsr(Number(e.target.value))}
                  className="w-full accent-[#7c1a2d] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>1:10 (Strict)</span>
                  <span>1:20 (Baseline)</span>
                  <span>1:25 (Relaxed)</span>
                </div>
              </div>

              {/* Slider 2: Carpet Area */}
              <div className="space-y-1.5 pt-2 border-t border-slate-200">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700">Minimum Carpet Area / Student:</span>
                  <span className="font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                    {simulatedCarpetArea} m²
                  </span>
                </div>
                <input
                  type="range"
                  min={3.0}
                  max={6.0}
                  step={0.5}
                  value={simulatedCarpetArea}
                  onChange={(e) => setSimulatedCarpetArea(Number(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>3.0 m²</span>
                  <span>4.0 m² (Baseline)</span>
                  <span>6.0 m²</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleRunSimulation}
                disabled={isSimulating}
                className="w-full py-2.5 px-4 rounded-xl bg-[#7c1a2d] text-white font-bold text-xs hover:bg-[#631423] transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
              >
                {isSimulating ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Calculating NetworkX Graph...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 fill-white" />
                    Run Dynamic Impact Simulation
                  </>
                )}
              </button>
            </div>

            {/* Results Column */}
            <div className="lg:col-span-2 space-y-4">
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl bg-[#faf8f4] border border-[#ded8cb] text-center">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Scanned</span>
                  <div className="text-xl font-black text-slate-900 mt-0.5 font-mono">
                    {impactResults.totalScanned}
                  </div>
                </div>
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-center">
                  <span className="text-[10px] font-bold text-rose-700 uppercase">Non-Compliant</span>
                  <div className="text-xl font-black text-rose-600 mt-0.5 font-mono">
                    {impactResults.affectedCount}
                  </div>
                </div>
                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-center">
                  <span className="text-[10px] font-bold text-amber-800 uppercase">High Risk</span>
                  <div className="text-xl font-black text-amber-700 mt-0.5 font-mono">
                    {impactResults.highRiskCount}
                  </div>
                </div>
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
                  <span className="text-[10px] font-bold text-emerald-800 uppercase">Compliant</span>
                  <div className="text-xl font-black text-emerald-600 mt-0.5 font-mono">
                    {impactResults.compliantCount}
                  </div>
                </div>
              </div>

              {/* Visual SVG Dependency Graph */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-[#0f2942] text-white shadow-inner border border-slate-700 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="font-bold tracking-wide uppercase text-slate-200">
                      Rule Dependency Traversal Graph (NetworkX DAG)
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-teal-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                    Depth: 3 Levels • Direct Trace
                  </span>
                </div>

                <div className="w-full bg-slate-950/60 rounded-xl p-3 border border-slate-800">
                  <svg viewBox="0 0 700 180" className="w-full h-auto">
                    <path d="M120 90 L 260 50" stroke="#F97316" strokeWidth="2" strokeDasharray="4 2" />
                    <path d="M120 90 L 260 130" stroke="#F97316" strokeWidth="2" strokeDasharray="4 2" />
                    <path d="M380 50 L 510 50" stroke="#38BDF8" strokeWidth="2" />
                    <path d="M380 130 L 510 130" stroke="#38BDF8" strokeWidth="2" />
                    <path d="M570 50 L 630 90" stroke="#34D399" strokeWidth="2" />
                    <path d="M570 130 L 630 90" stroke="#34D399" strokeWidth="2" />

                    <g transform="translate(20, 65)">
                      <rect width="110" height="50" rx="8" fill="#7C1A2D" stroke="#FCA5A5" strokeWidth="1.5" />
                      <text x="55" y="22" fill="#FFFFFF" fontSize="10" fontWeight="bold" textAnchor="middle">AICTE Rule</text>
                      <text x="55" y="38" fill="#FFF7ED" fontSize="9" textAnchor="middle">APH-2026-FSR</text>
                    </g>

                    <g transform="translate(250, 25)">
                      <rect width="130" height="48" rx="8" fill="#1E293B" stroke="#F97316" strokeWidth="1.5" />
                      <text x="65" y="20" fill="#FDBA74" fontSize="9" fontWeight="bold" textAnchor="middle">Parameter Shift</text>
                      <text x="65" y="35" fill="#FFFFFF" fontSize="9" textAnchor="middle">Ratio 1:20 ➔ 1:{simulatedFsr}</text>
                    </g>

                    <g transform="translate(250, 105)">
                      <rect width="130" height="48" rx="8" fill="#1E293B" stroke="#0D9488" strokeWidth="1.5" />
                      <text x="65" y="20" fill="#5EEAD4" fontSize="9" fontWeight="bold" textAnchor="middle">Cadre Constraint</text>
                      <text x="65" y="35" fill="#FFFFFF" fontSize="9" textAnchor="middle">1 Prof : 2 Asso : 6 Asst</text>
                    </g>

                    <g transform="translate(500, 25)">
                      <rect width="130" height="48" rx="8" fill="#881337" stroke="#F43F5E" strokeWidth="1.5" />
                      <text x="65" y="20" fill="#FECDD3" fontSize="9" fontWeight="bold" textAnchor="middle">Impacted Inst.</text>
                      <text x="65" y="35" fill="#FFFFFF" fontSize="9" fontWeight="bold" textAnchor="middle">{impactResults.affectedCount} Deficient</text>
                    </g>

                    <g transform="translate(500, 105)">
                      <rect width="130" height="48" rx="8" fill="#14532D" stroke="#22C55E" strokeWidth="1.5" />
                      <text x="65" y="20" fill="#BBF7D0" fontSize="9" fontWeight="bold" textAnchor="middle">Evidence Blocker</text>
                      <text x="65" y="35" fill="#FFFFFF" fontSize="9" textAnchor="middle">Faculty Register PDF</text>
                    </g>

                    <g transform="translate(620, 65)">
                      <rect width="70" height="50" rx="8" fill="#047857" stroke="#6EE7B7" strokeWidth="1.5" />
                      <text x="35" y="22" fill="#FFFFFF" fontSize="9" fontWeight="bold" textAnchor="middle">Recovery</text>
                      <text x="35" y="38" fill="#ECFDF5" fontSize="8" textAnchor="middle">Auto-Plan</text>
                    </g>
                  </svg>
                </div>

                <div>
                  <span className="text-[11px] font-semibold text-slate-300 block mb-1">
                    Affected Institutions Requiring Recovery Intervention:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {impactResults.flaggedInstitutions.map((inst, i) => (
                      <span key={i} className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-800 text-amber-300 border border-amber-500/30">
                        ⚠️ {inst}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW 6: FULL CASE REGISTER (Interactive Table View)
         ========================================================================= */}
      {activeTab === 'workflow' && (
        <div className="bg-white border border-[#ded8cb] rounded-3xl p-5 sm:p-6 shadow-xs space-y-6 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[#0f2942]">📋</span>
                <h2 className="text-sm sm:text-base font-black tracking-wide text-slate-900 uppercase">
                  AICTE APPROVAL APPLICATIONS CASE REGISTER
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Complete institutional applications directory with verification status and quick actions
              </p>
            </div>
            <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
              Showing {filteredApps.length} Applications
            </span>
          </div>

          <div className="border border-[#ded8cb] rounded-2xl overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#faf8f4] border-b border-[#ded8cb] text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="px-4 py-3">PID & Institution</th>
                    <th className="px-4 py-3">Region / State</th>
                    <th className="px-4 py-3">Discipline</th>
                    <th className="px-4 py-3">Compliance Met</th>
                    <th className="px-4 py-3">Stage Status</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredApps.map((app) => (
                    <tr key={app.id} className="hover:bg-[#fbf9f4] transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-[#7c1a2d] font-mono">
                          {app.institution.aictePermanentId}
                        </div>
                        <div className="text-slate-900 font-semibold text-xs mt-0.5">
                          {app.institution.name}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          App Ref: {app.applicationNumber}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-slate-700">
                        <div>{app.institution.region}</div>
                        <div className="text-[10px] text-slate-500">{app.institution.state}</div>
                      </td>
                      <td className="px-4 py-3.5 text-slate-600">
                        {app.institution.category}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-slate-200 h-2 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                app.metRequirements === app.totalRequirements
                                  ? 'bg-emerald-500'
                                  : 'bg-amber-500'
                              }`}
                              style={{
                                width: `${(app.metRequirements / app.totalRequirements) * 100}%`
                              }}
                            />
                          </div>
                          <span className="font-bold text-slate-700">
                            {app.metRequirements}/{app.totalRequirements}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        {app.status === 'approved' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            Approved EoA
                          </span>
                        )}
                        {app.status === 'compliance_pending' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                            Compliance Pending
                          </span>
                        )}
                        {app.status === 'under_scrutiny' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                            Under Scrutiny
                          </span>
                        )}
                        {app.status === 'rejected' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                            Deficit Flagged
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedAppId(app.id);
                              setActiveTab('explorer');
                            }}
                            className="px-2.5 py-1 rounded-lg bg-[#fef3c7] text-[#78350f] border border-[#f59e0b] font-bold text-[11px] hover:bg-[#fde68a]"
                          >
                            Examine ➔
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: OFFICIAL CO-DOCKET™ DOSSIER PDF PREVIEW & DOWNLOAD
         ========================================================================= */}
      {showDossierModal && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4 overflow-hidden overscroll-none"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowDossierModal(false);
          }}
        >
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-[#ded8cb] space-y-5 animate-scaleUp max-h-[92vh] overflow-y-auto overscroll-contain">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#7c1a2d] text-white flex items-center justify-center text-xs font-black">
                  AICTE
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Defensible Co-Docket™ Review Pack (Official PDF)
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Cryptographic Context Receipt • AICTE Regulation & Approval Bureaus
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowDossierModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            {/* Document Body */}
            <div className="p-5 rounded-2xl bg-[#faf8f4] border border-[#ded8cb] space-y-3.5 text-xs text-slate-700 font-sans">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <div>
                  <strong className="text-slate-900 block text-sm">CO-DOCKET™ COMPLIANCE RECEIPT</strong>
                  <span className="text-[10px] text-slate-500">Ref: AICTE-CODOCKET-2026-HQ-0912</span>
                </div>
                <div className="text-right">
                  <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[10px]">
                    STATUS: DEFENSE-READY
                  </span>
                  <div className="text-[10px] text-slate-400 mt-0.5">24 Oct 2026, 22:45 IST</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-[11px]">
                <div>
                  <span className="text-slate-400 block">Primary Institution:</span>
                  <strong className="text-slate-900">{selectedApp.institution.name}</strong>
                  <div className="text-slate-500 font-mono text-[10px]">PID: {selectedApp.institution.aictePermanentId}</div>
                </div>
                <div>
                  <span className="text-slate-400 block">Reviewing Authority:</span>
                  <strong className="text-slate-900">Officer: R. Sharma</strong>
                  <div className="text-slate-500 text-[10px]">Regulation Bureau (HQ-Delhi)</div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white border border-[#ded8cb] space-y-1.5 text-[11px]">
                <strong className="text-slate-800">Partitioned Bureau Synthesis:</strong>
                <p className="text-slate-600 leading-relaxed">
                  Cross-bureau automated scan executed across Approval Bureau (EoA Scrutiny) and Regulation Bureau (Cadre & FSR standard). An explainable 84% TF-IDF match flagged a temporary shortage in Associate Professors under AICTE APH Chapter 2 Clause 4.2.
                </p>
                <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
                  <span>Authorized Plan: <strong>{acceptedPlans[selectedApp.id] || '60-Day Provisional Undertaking'}</strong></span>
                  <span className="text-emerald-700 font-bold">Risk Factor: 0.12 (Negligible)</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-[10px] text-slate-500 font-mono">
                <span>SHA-256 Digest: 8f4b...9a12c8e3</span>
                <span>Council Node: AICTE-HQ-CENTRAL</span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowDossierModal(false)}
                className="px-4 py-2 rounded-xl bg-white border border-[#ded8cb] text-slate-700 font-bold text-xs hover:bg-[#eae4d5]"
              >
                Close Preview
              </button>
              <button
                type="button"
                onClick={() => {
                  alert('Co-Docket™ Official Dossier PDF Generated and Signed with Officer Seal.');
                  setShowDossierModal(false);
                }}
                className="px-4 py-2 rounded-xl bg-[#7c1a2d] text-white font-bold text-xs hover:bg-[#631423] flex items-center gap-1.5 shadow-2xs"
              >
                <Download className="h-4 w-4" />
                <span>Confirm & Download PDF</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: FLAGSHIP TEST CASE INTERACTIVE CONTROL DECK ('DEMO-PID-104')
         ========================================================================= */}
      {showFlagshipModal && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-hidden overscroll-none"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowFlagshipModal(false);
          }}
        >
          <div className="bg-white rounded-3xl max-w-5xl lg:max-w-6xl w-full max-h-[92vh] shadow-2xl border border-[#ded8cb] flex flex-col overflow-hidden animate-scaleUp">
            
            {/* Modal Header */}
            <div className="p-5 sm:p-6 pb-4 border-b border-[#ded8cb] bg-gradient-to-r from-white via-[#faf8f4] to-white flex-shrink-0">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="bg-[#7c1a2d] text-white text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-xs flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                      SIH 2026 EVALUATOR LAB
                    </span>
                    <span className="bg-[#ecfdf5] text-[#065f46] border border-[#a7f3d0] text-[11px] font-bold px-2.5 py-1 rounded-md flex items-center gap-1.5 shadow-2xs">
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                      PRIMARY ANCHOR: DEMO-PID-104
                    </span>
                    <span className="bg-[#0f2942] text-amber-300 text-[11px] font-bold px-2.5 py-1 rounded-md hidden sm:inline-flex items-center gap-1">
                      <Zap className="h-3 w-3 text-amber-400" />
                      DETERMINISTIC SCRUTINY ACTIVE
                    </span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                    Flagship Test Case: Demo Institute North
                  </h3>

                  <div className="flex items-center gap-3 text-xs text-slate-600 flex-wrap pt-0.5">
                    <span className="flex items-center gap-1 font-medium">
                      <MapPin className="h-3.5 w-3.5 text-rose-600" />
                      Jaipur, Rajasthan
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="flex items-center gap-1 font-medium">
                      <Building2 className="h-3.5 w-3.5 text-[#0f2942]" />
                      Northern Regional Office
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="flex items-center gap-1 font-medium">
                      <GraduationCap className="h-3.5 w-3.5 text-emerald-600" />
                      Approved Intake: 360 UG Seats
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowFlagshipModal(false)}
                  className="p-2 rounded-2xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-all cursor-pointer flex-shrink-0"
                  title="Close Modal"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              {/* Stepper Progress Bar (Interactive Steps 1-5) */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-4">
                {[
                  { s: 1, label: '01. Ingestion Anchor', sub: 'Cryptographic PID' },
                  { s: 2, label: '02. Bureau Scrutiny', sub: '3 Active Partitions' },
                  { s: 3, label: '03. Deficit Isolation', sub: '84% TF-IDF Match' },
                  { s: 4, label: '04. NetworkX DAG', sub: 'Root-Cause Traversal' },
                  { s: 5, label: '05. Co-Docket™ Plan', sub: 'Remediation Sign-off' },
                ].map((step) => {
                  const isActive = flagshipStage === step.s;
                  const isPassed = flagshipStage > step.s;
                  return (
                    <button
                      key={step.s}
                      type="button"
                      onClick={() => setFlagshipStage(step.s)}
                      className={`p-2.5 rounded-xl text-left transition-all cursor-pointer border flex flex-col justify-between ${
                        isActive
                          ? 'bg-[#7c1a2d] text-white border-[#7c1a2d] shadow-md ring-2 ring-[#7c1a2d]/20'
                          : isPassed
                          ? 'bg-emerald-50 text-emerald-950 border-emerald-200 hover:bg-emerald-100'
                          : 'bg-white text-slate-600 border-[#ded8cb] hover:bg-[#fbf9f4]'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-1">
                        <span className={`text-[10px] font-black uppercase tracking-wider ${
                          isActive ? 'text-amber-300' : isPassed ? 'text-emerald-700' : 'text-slate-400'
                        }`}>
                          Stage 0{step.s}
                        </span>
                        {isPassed && <Check className="h-3.5 w-3.5 text-emerald-600 stroke-[3]" />}
                        {isActive && <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />}
                      </div>
                      <div className="font-bold text-xs truncate leading-tight">{step.label}</div>
                      <div className={`text-[10px] truncate ${
                        isActive ? 'text-rose-100' : isPassed ? 'text-emerald-700' : 'text-slate-400'
                      }`}>
                        {step.sub}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Scrollable Stage Content Body */}
            <div className="flex-1 overflow-y-auto overscroll-contain p-5 sm:p-7 bg-[#faf8f4] space-y-6">
              
              {/* STAGE 1: Anchor Ingestion */}
              {flagshipStage === 1 && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="flex items-center justify-between pb-2 border-b border-[#ded8cb]">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                        Stage 1: Verified PID Primary Anchor & Institutional Registry
                      </h4>
                    </div>
                    <span className="text-xs font-bold bg-[#ecfdf5] text-[#065f46] border border-[#a7f3d0] px-3 py-1 rounded-full shadow-2xs flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                      100% Cryptographic Match
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-1">
                      <span className="text-slate-400 text-[11px] font-bold uppercase tracking-wider block">
                        Institutional Entity
                      </span>
                      <strong className="text-slate-900 text-sm block">Demo Institute North</strong>
                      <div className="text-slate-500 text-xs flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-rose-500" /> Jaipur, Rajasthan
                      </div>
                    </div>

                    <div className="p-4 bg-white rounded-2xl border border-rose-200 shadow-2xs space-y-1">
                      <span className="text-slate-400 text-[11px] font-bold uppercase tracking-wider block">
                        Permanent ID (Master)
                      </span>
                      <strong className="text-[#7c1a2d] font-mono text-sm block">DEMO-PID-104</strong>
                      <div className="text-slate-500 text-xs">Region: Northern Regional Office</div>
                    </div>

                    <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-1">
                      <span className="text-slate-400 text-[11px] font-bold uppercase tracking-wider block">
                        Academic Program
                      </span>
                      <strong className="text-slate-900 text-sm block">Engineering & Technology</strong>
                      <div className="text-slate-500 text-xs">Approved Intake: 360 UG Seats</div>
                    </div>

                    <div className="p-4 bg-white rounded-2xl border border-emerald-200 shadow-2xs space-y-1">
                      <span className="text-slate-400 text-[11px] font-bold uppercase tracking-wider block">
                        Identity Security
                      </span>
                      <strong className="text-emerald-700 text-sm block">Zero Duplicate PIDs</strong>
                      <div className="text-slate-500 text-xs">1,420 Regional Nodes Verified</div>
                    </div>
                  </div>

                  <div className="p-4 bg-white rounded-2xl border border-[#ded8cb] shadow-xs flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                    <div className="space-y-1 text-xs text-slate-700">
                      <div className="font-bold text-slate-900 text-sm">Deterministic Entity Resolution Verified</div>
                      <p className="leading-relaxed text-slate-600">
                        Primary Anchor established across the central AICTE database. This institutional record serves as the root index across all multi-bureau operational records.
                        No entity identity fragmentation or conflicting institute codes were detected.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* STAGE 2: Multi-Bureau Scrutiny */}
              {flagshipStage === 2 && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="flex items-center justify-between pb-2 border-b border-[#ded8cb]">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                      <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                        Stage 2: Cross-Bureau Real-Time Scrutiny Scan
                      </h4>
                    </div>
                    <span className="text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200 px-3 py-1 rounded-full shadow-2xs">
                      3 Partitioned Bureau Divisions Active
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4.5 bg-white rounded-2xl border border-emerald-200 shadow-2xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 text-xs">1. Approval Bureau (HQ)</span>
                        <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md">Compliant</span>
                      </div>
                      <div className="text-emerald-700 font-bold text-sm">✓ 11 of 14 Norms Cleared</div>
                      <p className="text-slate-500 text-xs leading-relaxed">
                        Extension of Approval (EoA) AY 2026–27 evaluated. Built-up area, lab infrastructure, and fire safety NOC validated.
                      </p>
                    </div>

                    <div className="p-4.5 bg-white rounded-2xl border border-amber-300 shadow-2xs space-y-2 ring-1 ring-amber-400/30">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-amber-900 text-xs">2. Regulation Bureau (HQ)</span>
                        <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md">Shortfall</span>
                      </div>
                      <div className="text-rose-700 font-bold text-sm">⚠️ Cadre Shortfall Flagged</div>
                      <p className="text-slate-500 text-xs leading-relaxed">
                        Faculty-to-student ratio at 1:22 vs mandatory 1:20 norm. Associate Professor cadre deficit identified under APH Chapter II.
                      </p>
                    </div>

                    <div className="p-4.5 bg-white rounded-2xl border border-emerald-200 shadow-2xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 text-xs">3. Grievance & Vigilance</span>
                        <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md">Clear</span>
                      </div>
                      <div className="text-emerald-700 font-bold text-sm">✓ 0 Complaints / Valid NOC</div>
                      <p className="text-slate-500 text-xs leading-relaxed">
                        Title deeds, endowment fund deposit, and vigilance clearance confirmed with no pending disciplinary proceedings.
                      </p>
                    </div>
                  </div>

                  <div className="p-4 bg-blue-50/70 rounded-2xl border border-blue-200 shadow-xs flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-blue-100 text-blue-800">
                      <Layers className="h-5 w-5" />
                    </div>
                    <div className="space-y-1 text-xs text-blue-950">
                      <div className="font-bold text-sm">Inter-Departmental Silo Resolution</div>
                      <p className="leading-relaxed">
                        Traditionally, Approval and Regulation Bureaus operate on disconnected cycles, creating months of delay. RULIQ scans both simultaneously in real-time, surfacing the exact conflict for coordinated remediation.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* STAGE 3: 84% TF-IDF Deficit */}
              {flagshipStage === 3 && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="flex items-center justify-between pb-2 border-b border-[#ded8cb]">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                      <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                        Stage 3: Explainable Overlap Deficit (84% TF-IDF Statutory Match)
                      </h4>
                    </div>
                    <span className="text-xs font-bold bg-rose-50 text-rose-800 border border-rose-200 px-3 py-1 rounded-full shadow-2xs">
                      Statutory Deficit Detected
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4.5 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 text-xs">Mandated Cadre Norm</span>
                        <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                          AICTE APH Ch 2 Cl 4.2
                        </span>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-xl space-y-1 text-xs">
                        <div className="font-semibold text-slate-800">Prescribed Cadre Ratio:</div>
                        <div className="text-sm font-bold text-slate-900 font-mono">1 Prof : 2 Assoc. Prof : 6 Asst. Prof</div>
                        <div className="text-[11px] text-slate-500">Overall FSR Requirement: 1:20</div>
                      </div>
                    </div>

                    <div className="p-4.5 bg-white rounded-2xl border border-rose-200 shadow-2xs space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-rose-900 text-xs">Observed Institutional Cadre</span>
                        <span className="text-[10px] font-mono font-bold bg-rose-100 text-rose-800 px-2 py-0.5 rounded">
                          DEMO-PID-104 Audit
                        </span>
                      </div>
                      <div className="p-3 bg-rose-50 rounded-xl space-y-1 text-xs">
                        <div className="font-semibold text-rose-900">Current Distribution:</div>
                        <div className="text-sm font-bold text-rose-800 font-mono">1 Prof : 0 Assoc. Prof : 8 Asst. Prof</div>
                        <div className="text-[11px] font-bold text-rose-700">Deficit: -2 Associate Professors (Shortfall)</div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-white rounded-2xl border border-[#ded8cb] shadow-xs flex items-center justify-between flex-wrap gap-4">
                    <div className="space-y-1">
                      <div className="text-xs font-bold text-slate-900">TF-IDF Vector Regulatory Precedent Score</div>
                      <div className="text-xs text-slate-500">Similarity between institution non-compliance pattern and historical APH rulings</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-36 bg-slate-100 h-3 rounded-full overflow-hidden border border-slate-200">
                        <div className="bg-[#7c1a2d] h-full rounded-full" style={{ width: '84%' }} />
                      </div>
                      <span className="text-sm font-black text-[#7c1a2d] font-mono">84% Match</span>
                    </div>
                  </div>
                </div>
              )}

              {/* STAGE 4: NetworkX DAG */}
              {flagshipStage === 4 && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="flex items-center justify-between pb-2 border-b border-[#ded8cb]">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                      <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                        Stage 4: NetworkX Directed Acyclic Graph (DAG) Traversal
                      </h4>
                    </div>
                    <span className="text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 px-3 py-1 rounded-full shadow-2xs">
                      Graph Depth: 3 Nodes • Non-Fatal Severity
                    </span>
                  </div>

                  <div className="p-5 bg-[#0b1726] rounded-2xl text-white shadow-md border border-slate-700 space-y-4">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <div className="flex items-center gap-2 font-mono">
                        <Network className="h-4 w-4 text-emerald-400" />
                        <span>NETWORKX TRAVERSAL PIPELINE</span>
                      </div>
                      <span className="text-[11px] text-emerald-400 font-mono">Cycles: 0 (Acyclic) • Solution Paths: 1 Found</span>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap text-xs font-mono">
                      <div className="bg-slate-800/90 border border-slate-700 px-3 py-2 rounded-xl text-amber-300 font-bold shadow-xs">
                        [1] AICTE-APH-CH2-FAC
                        <span className="block text-[10px] text-slate-400 font-normal">Regulatory Anchor</span>
                      </div>
                      <ArrowRight className="h-4 w-4 text-slate-500" />
                      <div className="bg-slate-800/90 border border-rose-800/60 px-3 py-2 rounded-xl text-rose-300 font-bold shadow-xs">
                        [2] Cadre_Shortfall_Associate_Prof[n=2]
                        <span className="block text-[10px] text-slate-400 font-normal">Isolated Root Cause</span>
                      </div>
                      <ArrowRight className="h-4 w-4 text-slate-500" />
                      <div className="bg-slate-800/90 border border-slate-700 px-3 py-2 rounded-xl text-orange-300 font-bold shadow-xs">
                        [3] Approval_Blocked_EoA
                        <span className="block text-[10px] text-slate-400 font-normal">System Action Gate</span>
                      </div>
                      <ArrowRight className="h-4 w-4 text-slate-500" />
                      <div className="bg-emerald-950 border border-emerald-500 px-3 py-2 rounded-xl text-emerald-300 font-bold shadow-xs ring-2 ring-emerald-500/20">
                        [4] Curative_Recovery_Synthesizer
                        <span className="block text-[10px] text-emerald-400 font-normal">Provisional Remediation</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-white rounded-2xl border border-[#ded8cb] shadow-xs text-xs text-slate-700 space-y-1">
                    <strong className="text-slate-900 block text-sm">Root-Cause Analysis & Actionability</strong>
                    <p className="leading-relaxed text-slate-600">
                      The DAG traversal mathematically proves this deficit is <strong>non-fatal</strong>. It does not warrant denial or cancellation of institutional approval.
                      Instead, constraint-aware resolution allows a provisional undertaking with adjunct credits, protecting student academic continuity while ensuring statutory adherence.
                    </p>
                  </div>
                </div>
              )}

              {/* STAGE 5: Co-Docket Plan & Sign-off */}
              {flagshipStage === 5 && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="flex items-center justify-between pb-2 border-b border-[#ded8cb]">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                        Stage 5: Curative Remediation & Defensible Co-Docket™ Pack
                      </h4>
                    </div>
                    <span className="text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-full shadow-2xs">
                      Defense-Ready Remediation Plan
                    </span>
                  </div>

                  <div className="p-5 bg-white rounded-2xl border border-emerald-300 shadow-sm space-y-3">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block">
                          Recommended Remediation Plan
                        </span>
                        <strong className="text-base text-emerald-950">
                          60-Day Conditional Undertaking with Adjunct Credits
                        </strong>
                      </div>
                      {acceptedPlans[1] && (
                        <span className="text-xs font-black text-emerald-800 bg-emerald-100 border border-emerald-300 px-3 py-1 rounded-full flex items-center gap-1 shadow-2xs">
                          <Check className="h-3.5 w-3.5 stroke-[3]" /> Plan Authorized by Evaluator
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      Permits institution to satisfy cadre balance by mapping accredited industry adjunct faculty credits while formal recruitment for 2 Associate Professors is initiated within 60 days. Includes mandatory biometric attendance verification.
                    </p>

                    <div className="flex items-center gap-3 pt-2 flex-wrap">
                      <button
                        type="button"
                        onClick={() => handleAcceptRecovery(1, '60-Day Conditional Undertaking with Adjunct Credits')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5 ${
                          acceptedPlans[1]
                            ? 'bg-emerald-700 text-white'
                            : 'bg-emerald-600 text-white hover:bg-emerald-700'
                        }`}
                      >
                        <CheckCircle className="h-4 w-4" />
                        <span>{acceptedPlans[1] ? 'Plan Authorized ✓' : 'Authorize 60-Day Plan'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSignReviewNote(1)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5 ${
                          signedReviewNotes[1]
                            ? 'bg-[#0f2942] text-amber-300'
                            : 'bg-[#fef3c7] border border-[#f59e0b] text-[#78350f] hover:bg-[#fde68a]'
                        }`}
                      >
                        <Award className="h-4 w-4" />
                        <span>{signedReviewNotes[1] ? 'Signed by Officer R. Sharma ✓' : 'Sign Review Note as Officer Sharma'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setShowFlagshipModal(false);
                          setShowDossierModal(true);
                        }}
                        className="px-4 py-2 rounded-xl bg-[#7c1a2d] text-white text-xs font-bold hover:bg-[#631423] transition-all flex items-center gap-1.5 shadow-xs cursor-pointer ml-auto"
                      >
                        <Download className="h-4 w-4" />
                        <span>View & Download Official Co-Docket™</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Modal Bottom Actions */}
            <div className="p-4 sm:p-5 border-t border-[#ded8cb] bg-white flex flex-col sm:flex-row items-center justify-between gap-3 flex-shrink-0">
              <button
                type="button"
                onClick={handleAutoPlayFlagship}
                disabled={isAutoPlayingFlagship}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 text-white font-bold hover:from-orange-700 hover:to-amber-700 transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer text-xs"
              >
                {isAutoPlayingFlagship ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Auto-Playing Demo (Stage {flagshipStage}/5)...</span>
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 fill-white" />
                    <span>Run Automated 10-Second Live Demo</span>
                  </>
                )}
              </button>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={() => setShowFlagshipModal(false)}
                  className="px-5 py-2.5 rounded-xl bg-white border border-[#ded8cb] text-slate-700 font-bold hover:bg-[#fbf9f4] transition-colors cursor-pointer text-xs"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={handleJumpToExplorerInspector}
                  className="px-5 py-2.5 rounded-xl bg-[#0f2942] text-white font-bold hover:bg-[#153a5c] transition-all flex items-center gap-2 shadow-sm cursor-pointer text-xs"
                >
                  <span>Open in Main Explorer Dashboard</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
