import React from 'react';

// Tech Divas Logo matching PPT slide top-left
export function TechDivasLogo({ className = 'h-12 w-auto' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div className="relative flex items-center justify-center h-12 w-12 rounded-xl bg-gradient-to-br from-amber-50 to-orange-100 border border-orange-200/80 shadow-xs p-1.5">
        <svg viewBox="0 0 64 64" fill="none" className="h-full w-full">
          {/* Subtle tech background circle */}
          <circle cx="32" cy="32" r="28" fill="#FFF7ED" stroke="#FDBA74" strokeWidth="1.5" strokeDasharray="3 2" />
          
          {/* Three stylized female tech avatars */}
          {/* Center figure */}
          <circle cx="32" cy="22" r="6" fill="#D97706" />
          <path d="M22 38C22 32.5 26.5 29 32 29C37.5 29 42 32.5 42 38V42H22V38Z" fill="#EA580C" />
          {/* Left figure */}
          <circle cx="21" cy="25" r="4.5" fill="#2563EB" />
          <path d="M13 39C13 35 16.5 32 21 32C23.5 32 25.5 33.2 27 35L25 41H13V39Z" fill="#1D4ED8" />
          {/* Right figure */}
          <circle cx="43" cy="25" r="4.5" fill="#0D9488" />
          <path d="M51 39C51 35 47.5 32 43 32C40.5 32 38.5 33.2 37 35L39 41H51V39Z" fill="#0F766E" />
          
          {/* Laptop / code spark element */}
          <rect x="23" y="40" width="18" height="11" rx="1.5" fill="#1E293B" stroke="#F97316" strokeWidth="1.2" />
          <path d="M26 45L29 48L26 51" stroke="#38BDF8" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="31" y1="48" x2="37" y2="48" stroke="#34D399" strokeWidth="1.2" strokeLinecap="round" />
          
          {/* Team Star/Spark */}
          <path d="M48 14L49.5 18L53.5 19.5L49.5 21L48 25L46.5 21L42.5 19.5L46.5 18L48 14Z" fill="#F59E0B" />
        </svg>
      </div>
      <div className="flex flex-col">
        <span className="text-xs font-black tracking-widest uppercase text-slate-800 flex items-center gap-1 font-mono">
          TECH<span className="text-orange-600">DIVAS</span>
        </span>
        <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-tight">
          SIH 2026 Team
        </span>
      </div>
    </div>
  );
}

// AICTE Official Logo matching PPT slide
export function Aictelogo({ className = 'h-12 w-auto' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div className="relative flex items-center justify-center h-12 w-12 rounded-full bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-500/80 shadow-xs p-1">
        <svg viewBox="0 0 100 100" fill="none" className="h-full w-full">
          {/* Gear teeth ring */}
          <circle cx="50" cy="50" r="44" stroke="#D97706" strokeWidth="6" strokeDasharray="6 3.5" fill="#FEF3C7" />
          <circle cx="50" cy="50" r="36" stroke="#B45309" strokeWidth="2" fill="#FFFFFF" />
          
          {/* AICTE Inner Flaming Torch / Diya emblem */}
          {/* Lotus / Base */}
          <path d="M30 68 C 38 62, 62 62, 70 68 C 65 74, 35 74, 30 68 Z" fill="#DC2626" />
          <path d="M36 65 C 43 60, 57 60, 64 65 Z" fill="#F59E0B" />
          
          {/* Central Diya / Torch Body */}
          <path d="M45 48 L 55 48 L 53 64 L 47 64 Z" fill="#B45309" />
          
          {/* Triple Sacred Flame */}
          <path d="M50 20 C 53 28, 58 35, 54 44 C 50 48, 45 44, 46 36 C 47 28, 50 20, 50 20 Z" fill="#EA580C" />
          <path d="M50 25 C 52 30, 55 35, 52 41 C 50 44, 47 41, 48 35 C 48 30, 50 25, 50 25 Z" fill="#FBBF24" />
          {/* Left & Right flames */}
          <path d="M43 32 C 41 38, 44 42, 47 43 C 44 46, 39 42, 40 37 C 41 34, 43 32, 43 32 Z" fill="#F97316" />
          <path d="M57 32 C 59 38, 56 42, 53 43 C 56 46, 61 42, 60 37 C 59 34, 57 32, 57 32 Z" fill="#F97316" />
          
          {/* AICTE Arc Text Representation */}
          <circle cx="50" cy="50" r="28" stroke="#EF4444" strokeWidth="1" strokeDasharray="1 2" />
        </svg>
      </div>
      <div className="flex flex-col text-left">
        <span className="text-sm font-black tracking-wider text-red-700 leading-tight">
          AICTE
        </span>
        <span className="text-[10px] font-semibold text-slate-600 leading-tight">
          Govt. of India
        </span>
        <span className="text-[9px] text-amber-700 font-medium leading-none">
          Statutory Body
        </span>
      </div>
    </div>
  );
}

// SIH 2026 Logo matching PPT slide top-right
export function SihLogo({ className = 'h-12 w-auto' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div className="relative flex items-center justify-center h-12 w-12 rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 shadow-xs p-1.5">
        <svg viewBox="0 0 64 64" fill="none" className="h-full w-full">
          {/* Digital Brain / SIH Circuit Pattern */}
          {/* Left Brain Half (Saffron/Orange) */}
          <path d="M30 14 C 20 14, 14 20, 14 28 C 14 34, 18 38, 18 42 C 18 48, 22 52, 30 52" stroke="#F97316" strokeWidth="3" strokeLinecap="round" />
          <circle cx="20" cy="24" r="2" fill="#FDBA74" />
          <circle cx="26" cy="34" r="2" fill="#FDBA74" />
          <line x1="20" y1="24" x2="26" y2="34" stroke="#FB923C" strokeWidth="1.5" />
          <line x1="26" y1="34" x2="30" y2="34" stroke="#FB923C" strokeWidth="1.5" />
          
          {/* Right Brain Half (Emerald/Green - Indian Tricolor) */}
          <path d="M34 14 C 44 14, 50 20, 50 28 C 50 34, 46 38, 46 42 C 46 48, 42 52, 34 52" stroke="#10B981" strokeWidth="3" strokeLinecap="round" />
          <circle cx="44" cy="24" r="2" fill="#6EE7B7" />
          <circle cx="38" cy="34" r="2" fill="#6EE7B7" />
          <line x1="44" y1="24" x2="38" y2="34" stroke="#34D399" strokeWidth="1.5" />
          <line x1="38" y1="34" x2="34" y2="34" stroke="#34D399" strokeWidth="1.5" />
          
          {/* Central Ashoka Chakra / Spark */}
          <circle cx="32" cy="34" r="4" fill="#38BDF8" />
          <circle cx="32" cy="18" r="2" fill="#F8FAFC" />
          <circle cx="32" cy="48" r="2" fill="#F8FAFC" />
        </svg>
      </div>
      <div className="flex flex-col text-left">
        <span className="text-xs font-black tracking-tight text-slate-900 leading-tight">
          SMART INDIA
        </span>
        <span className="text-[11px] font-black tracking-wide text-orange-600 leading-tight">
          HACKATHON
        </span>
        <span className="text-[11px] font-extrabold text-teal-700 leading-none">
          2026
        </span>
      </div>
    </div>
  );
}

// Statutory Hub Icon from PPT center
export function StatutoryHubIcon({ className = 'h-10 w-10' }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg viewBox="0 0 64 64" fill="none" className="h-full w-full">
        {/* Dome and AICTE colonnade building */}
        <path d="M32 10 C 26 10, 24 16, 24 18 L 40 18 C 40 16, 38 10, 32 10 Z" fill="#D97706" />
        <line x1="32" y1="6" x2="32" y2="10" stroke="#EA580C" strokeWidth="2" />
        <polygon points="32,6 36,8 32,10" fill="#EF4444" />
        
        {/* Pediment roof */}
        <polygon points="14,24 50,24 32,18" fill="#1E3A8A" />
        
        {/* Entablature */}
        <rect x="16" y="24" width="32" height="3" fill="#3B82F6" />
        
        {/* 4 Pillars */}
        <rect x="18" y="27" width="4" height="18" fill="#CBD5E1" />
        <rect x="26" y="27" width="4" height="18" fill="#94A3B8" />
        <rect x="34" y="27" width="4" height="18" fill="#CBD5E1" />
        <rect x="42" y="27" width="4" height="18" fill="#94A3B8" />
        
        {/* Base Steps */}
        <rect x="14" y="45" width="36" height="4" fill="#1E293B" rx="1" />
        <rect x="12" y="49" width="40" height="4" fill="#0F172A" rx="1" />
      </svg>
    </div>
  );
}
