import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/layout/Header';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'RULIQ — Rule Intelligence and Compliance | AICTE Regulatory Platform',
  description:
    'RULIQ is an AI-assisted regulatory intelligence platform for AICTE that traces changes in approval rules to affected applications, identifies unmet compliance requirements, and recommends evidence-backed recovery actions (SIH 2026).',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.className}>
      <body className="min-h-screen antialiased flex flex-col selection:bg-orange-500 selection:text-white">
        {/* Top Header matching User Sketch & PPT */}
        <Header />

        {/* Main Application Container */}
        <main className="flex-1 max-w-[1720px] w-full mx-auto px-4 sm:px-8 lg:px-12 py-4 sm:py-6">
          {children}
        </main>

        {/* SIH 2026 Footer matching GovTech presentation */}
        <footer className="w-full border-t border-[#ded8cb] bg-[#fbf9f4] py-4 mt-8 text-center text-xs text-slate-500">
          <div className="max-w-[1720px] mx-auto px-4 sm:px-8 lg:px-12 flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="font-medium text-slate-700">
              <strong className="text-[#7c1a2d] font-bold">RULIQ</strong> • Developed by Team <span className="font-semibold text-slate-900">Tech Divas</span> for <span className="font-semibold text-emerald-700">Smart India Hackathon 2026</span>
            </p>
            <p className="text-[11px] text-slate-500">
              AICTE Regulatory Change-Impact Tracing & Constraint-Aware Recovery Architecture (Problem SIH26262)
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
