'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  BookOpen,
  Network,
  AlertTriangle,
  FolderLock,
  History,
  Settings,
  ShieldCheck,
  Building2,
  ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { MOCK_ALERTS } from '@/lib/mock-data';

const NAV_ITEMS = [
  {
    name: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
  },
  {
    name: 'Applications',
    href: '/applications',
    icon: FileText,
  },
  {
    name: 'Regulatory Rules',
    href: '/rules',
    icon: BookOpen,
  },
  {
    name: 'Impact Analysis',
    href: '/impact-analysis',
    icon: Network,
    badge: 'NetworkX',
  },
  {
    name: 'Compliance Alerts',
    href: '/alerts',
    icon: AlertTriangle,
    alertCount: MOCK_ALERTS.filter((a) => !a.isResolved && a.severity === 'critical').length,
  },
  {
    name: 'Evidence Repository',
    href: '/evidence',
    icon: FolderLock,
  },
  {
    name: 'Audit Logs',
    href: '/audit-logs',
    icon: History,
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: Settings,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 flex-shrink-0 bg-slate-900 border-r border-slate-800 flex flex-col justify-between min-h-screen">
      {/* Brand & Portal Header */}
      <div>
        <div className="h-16 flex items-center px-6 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-teal-600 flex items-center justify-center text-white shadow-xs">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-bold text-white tracking-wide">RULIQ</span>
                <span className="text-[10px] font-semibold uppercase tracking-wider bg-teal-950 text-teal-300 border border-teal-800/80 px-1.5 py-0.2 rounded">
                  APH-2026
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium leading-none">
                AICTE Approval & Compliance
              </p>
            </div>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="p-3 space-y-1">
          <p className="px-3 pt-2 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Workflow Portal
          </p>

          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'group flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
                  isActive
                    ? 'bg-teal-600 text-white font-semibold shadow-xs'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={cn(
                      'h-4 w-4 transition-colors',
                      isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'
                    )}
                  />
                  <span>{item.name}</span>
                </div>

                {item.alertCount !== undefined && item.alertCount > 0 && (
                  <span className="inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white bg-rose-600 rounded-full">
                    {item.alertCount}
                  </span>
                )}

                {item.badge && (
                  <span className={cn(
                    'text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded tracking-wide',
                    isActive ? 'bg-teal-700 text-teal-100' : 'bg-slate-800 text-teal-400 border border-teal-900/50'
                  )}>
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Institutional Disclaimer Footer */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/30">
        <div className="rounded-lg bg-slate-800/60 p-3 border border-slate-700/60">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
            <Building2 className="h-3.5 w-3.5 text-teal-400" />
            <span>SIH26262 Prototype</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400 leading-tight">
            Demonstration mode: all institutional data and regulatory runs are fictional.
          </p>
          <div className="mt-2.5 pt-2 border-t border-slate-700/40 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Engine Online
            </span>
            <span className="text-[10px] text-slate-400">v1.0.0</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
