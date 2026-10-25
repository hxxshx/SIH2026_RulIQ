'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Bell, 
  Menu, 
  X, 
  Sparkles, 
  ExternalLink, 
  CheckCircle2, 
  ShieldAlert,
  Search,
  LayoutDashboard,
  FileText,
  BookOpen,
  Network,
  FolderLock,
  History,
  Settings
} from 'lucide-react';
import { TechDivasLogo, Aictelogo, SihLogo } from '@/components/common/Logos';
import { MOCK_ALERTS } from '@/lib/mock-data';

export function Header() {
  const pathname = usePathname();
  const [isNavOpen, setIsNavOpen] = useState(false);
  const unresolvedAlerts = MOCK_ALERTS.filter((a) => !a.isResolved);

  const navLinks = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Applications', href: '/applications', icon: FileText },
    { name: 'Regulatory Rules', href: '/rules', icon: BookOpen },
    { name: 'Impact Analysis', href: '/impact-analysis', icon: Network },
    { name: 'Alerts', href: '/alerts', icon: ShieldAlert, badge: unresolvedAlerts.length },
    { name: 'Evidence', href: '/evidence', icon: FolderLock },
    { name: 'Audit Logs', href: '/audit-logs', icon: History },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <header className="w-full bg-[#fbf9f4] border-b border-[#ded8cb] shadow-xs sticky top-0 z-40">
      {/* 1. Official Government Top Bar matching Screenshot */}
      <div className="bg-[#0e1e2d] text-slate-200 text-[11px] sm:text-xs py-1.5 px-4 sm:px-8 lg:px-12 border-b border-[#1b3452]">
        <div className="max-w-[1720px] mx-auto flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 font-medium tracking-wide">
            <span className="text-sm">🏛️</span>
            <span className="font-bold text-white tracking-wider">GOVERNMENT OF INDIA · MINISTRY OF EDUCATION</span>
            <span className="text-slate-500">|</span>
            <span className="text-slate-300">All India Council for Technical Education (AICTE)</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-emerald-400 font-semibold bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-700/60 text-[10px] sm:text-[11px]">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>RULIQ GovTech Secure Node Active</span>
            </div>
            <span className="text-slate-500">|</span>
            <span className="text-amber-300/90 font-medium text-[10px] sm:text-[11px]">SIH 2026 · Problem Statement 26262</span>
          </div>
        </div>
      </div>

      {/* 2. Main GovTech Suite Header matching Screenshot */}
      <div className="max-w-[1720px] mx-auto px-4 sm:px-8 lg:px-12 py-3 sm:py-3.5">
        <div className="w-full flex flex-col lg:flex-row items-center justify-between gap-4">
          
          {/* LEFT END: App Logo Mark & GovTech Suite */}
          <div className="flex items-center justify-between w-full lg:w-auto shrink-0">
            <Link href="/" className="group flex items-center gap-3.5 transition-transform hover:scale-[1.01]">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-[#0f2942] border border-[#1e3e5f] flex items-center justify-center text-white font-black tracking-wider text-sm shadow-sm group-hover:bg-[#153a5c] transition-colors">
                RULIQ
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#fef3c7] text-[#78350f] border border-[#fcd34d]">
                    GOVTECH SUITE
                  </span>
                  <span className="text-[10px] font-medium text-slate-600 flex items-center gap-1 bg-white px-2 py-0.5 rounded border border-slate-200 shadow-2xs">
                    🛡️ Defensible Rule-DAG™
                  </span>
                </div>
                <span className="text-[11px] font-semibold text-slate-700 tracking-tight mt-1">
                  Cross-Bureau Regulatory Architecture
                </span>
              </div>
            </Link>

            {/* Mobile Menu Toggle Button */}
            <div className="flex items-center gap-2 lg:hidden">
              <Link 
                href="/alerts"
                className="relative p-2 rounded-lg text-slate-700 hover:bg-slate-100"
              >
                <Bell className="h-5 w-5" />
                {unresolvedAlerts.length > 0 && (
                  <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-600 animate-pulse" />
                )}
              </Link>
              <button
                type="button"
                onClick={() => setIsNavOpen(!isNavOpen)}
                className="p-2 rounded-lg text-slate-700 hover:bg-slate-100 border border-slate-200"
                aria-label="Toggle navigation menu"
              >
                {isNavOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* CENTER: Burgundy Heading & Subtitle - Spacious & Elegantly Centered */}
          <div className="flex-1 flex flex-col items-center text-center px-4">
            <h1 className="text-xl sm:text-2xl lg:text-[25px] font-bold tracking-tight text-[#7c1a2d]">
              RULIQ: Rule Intelligence & Regulatory Compliance Dashboard
            </h1>
            <p className="mt-1 text-xs sm:text-sm italic font-medium text-slate-700">
              Integrated AICTE Multi-Bureau Grievance & Regulatory Coordination
            </p>
          </div>

          {/* RIGHT END: Officer Box & AICTE Council Node Seal */}
          <div className="hidden lg:flex items-center gap-3.5 shrink-0">
            <div className="text-right">
              <div className="text-xs font-bold text-slate-900 flex items-center justify-end gap-1">
                <span>👤 Officer: R. Sharma</span>
              </div>
              <div className="text-[11px] text-slate-600 font-medium mt-0.5">
                Regulation Bureau (HQ-Delhi)
              </div>
            </div>
            
            <div className="flex items-center gap-2 pl-3 border-l border-slate-200">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#7c1a2d] text-white flex flex-col items-center justify-center border-2 border-[#b93b48] shadow-xs">
                <span className="text-[9px] font-black tracking-tighter leading-none">AICTE</span>
              </div>
              <div className="flex flex-col text-[10px] text-slate-700 font-bold leading-tight">
                <span>AICTE HQ</span>
                <span className="text-slate-500 font-normal">Council Node</span>
              </div>
            </div>
          </div>

        </div>

        {/* 3. Secondary Route Navigation Strip (All original views preserved) */}
        <div className="mt-3 pt-2.5 border-t border-[#ded8cb] flex items-center justify-between flex-wrap gap-2 text-xs">
          <nav className="flex items-center flex-wrap gap-1">
            {navLinks.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-[#7c1a2d] text-white font-semibold shadow-xs'
                      : 'text-slate-700 hover:text-slate-900 hover:bg-[#eae4d5]'
                  }`}
                >
                  <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                  <span>{item.name}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className={`px-1.5 py-0.2 text-[10px] font-bold rounded-full ${
                      isActive ? 'bg-white text-[#7c1a2d]' : 'bg-red-100 text-red-700'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-600 bg-white px-2.5 py-0.5 rounded-full border border-[#ded8cb]">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse" />
              <span>AICTE Live Scrutiny Portal • AY 2026–27</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isNavOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-2">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <Aictelogo />
            <SihLogo />
          </div>
          <div className="grid grid-cols-2 gap-2 pt-2">
            {navLinks.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsNavOpen(false)}
                  className={`flex items-center gap-2 p-2 rounded-lg text-xs font-medium ${
                    isActive ? 'bg-orange-600 text-white' : 'text-slate-700 bg-slate-50 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}
