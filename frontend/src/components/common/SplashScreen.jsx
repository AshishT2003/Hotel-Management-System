import React from 'react';
import { 
  Sparkles, 
  ChevronRight, 
  ShieldCheck, 
  LayoutDashboard, 
  ChefHat, 
  BedDouble,
  CheckCircle2
} from 'lucide-react';

const ROLES = [
  { id: 'guest', label: 'Guest Experience', sub: 'Self-Service & Stays', icon: ShieldCheck },
  { id: 'admin', label: 'Front Desk Admin', sub: '50-Room Live Matrix', icon: LayoutDashboard },
  { id: 'kitchen', label: 'Executive Kitchen', sub: 'Live Dining Queue', icon: ChefHat },
  { id: 'housekeeping', label: 'Housekeeping', sub: 'Luxury Turnover', icon: BedDouble },
];

export function SplashScreen({ isFadingOut, roleStep = 0, onDismiss }) {
  // Phase status copy based on active step
  const phaseInfo = [
    { text: 'Initializing MAHARAJA Hotel Executive Suite…', progress: 18 },
    { text: 'Orchestrating Role: Guest Self-Service & VIP Stays…', progress: 42 },
    { text: 'Orchestrating Role: Front Desk 50-Room Occupancy Matrix…', progress: 68 },
    { text: 'Orchestrating Roles: Executive Kitchen & Housekeeping…', progress: 88 },
    { text: 'Platform Ready · Smoothly Connecting to Portal…', progress: 100 },
  ][Math.min(roleStep, 4)];

  return (
    <div
      id="maharaja-splash-screen"
      role="dialog"
      aria-label="Welcome to MAHARAJA Hotel"
      aria-modal="true"
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#040711] text-white overflow-hidden select-none transition-all duration-500 ease-out ${
        isFadingOut 
          ? 'opacity-0 scale-[1.03] filter blur-[3px] pointer-events-none' 
          : 'opacity-100 scale-100 filter blur-0'
      }`}
    >
      {/* Ambient Luxury Radial Aura */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-85 transition-opacity duration-700"
        style={{
          background: 'radial-gradient(ellipse 70% 60% at 50% 48%, rgba(251, 191, 36, 0.13) 0%, rgba(16, 185, 129, 0.05) 45%, transparent 75%)'
        }}
      />

      {/* Decorative Star Dust / Ambient Depth */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Center Branding & Process Showcase */}
      <div className={`relative z-10 flex flex-col items-center text-center px-4 max-w-xl mx-auto transition-transform duration-500 ease-out ${
        isFadingOut ? 'translate-y-[-16px] scale-[0.98]' : 'translate-y-0 scale-100'
      }`}>
        {/* Royal Crown Emblem with Backlight Glow */}
        <div 
          className="relative mb-5"
          style={{ animation: 'emblemGlow 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}
        >
          {/* Ambient Glow Disk */}
          <div className="absolute inset-0 bg-gradient-to-tr from-amber-400/25 via-emerald-400/20 to-amber-300/35 rounded-full blur-xl scale-125" />

          {/* Luxury Crown SVG Crest */}
          <div className="relative w-18 h-18 sm:w-22 sm:h-22 rounded-2xl bg-gradient-to-br from-[#0c1626] to-[#070c16] border border-amber-400/35 shadow-[0_0_30px_rgba(251,191,36,0.3)] flex items-center justify-center p-3">
            <svg 
              viewBox="0 0 48 48" 
              className="w-12 h-12 text-amber-400"
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Crown Silhouette */}
              <path 
                d="M8 34L11 16L19 25L24 12L29 25L37 16L40 34H8Z" 
                fill="url(#crownGoldGrad)" 
                stroke="#fef08a" 
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
              {/* Base Jewel Band */}
              <rect x="8" y="34" width="32" height="4" rx="1.5" fill="#d97706" stroke="#fbbf24" strokeWidth="1" />
              {/* Jewel Ornaments */}
              <circle cx="16" cy="36" r="1.2" fill="#34d399" />
              <circle cx="24" cy="36" r="1.5" fill="#fef08a" />
              <circle cx="32" cy="36" r="1.2" fill="#34d399" />
              <circle cx="24" cy="11.5" r="1.6" fill="#fef08a" />
              <circle cx="11" cy="15.5" r="1.4" fill="#fbbf24" />
              <circle cx="37" cy="15.5" r="1.4" fill="#fbbf24" />

              <defs>
                <linearGradient id="crownGoldGrad" x1="8" y1="12" x2="40" y2="34" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#fbbf24" />
                  <stop offset="0.5" stopColor="#fef08a" />
                  <stop offset="1" stopColor="#b45309" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>

        {/* Animated Horizon Beam */}
        <div className="w-48 sm:w-60 h-[1px] mb-3 relative overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto"
            style={{ animation: 'horizonDraw 0.9s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}
          />
        </div>

        {/* Hotel Name with Senior UI/UX Royal Gold Shimmer Sweep */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-none mb-1">
          <span className="maharaja-brand-animated">
            MAHARAJA Hotel
          </span>
        </h1>

        {/* Luxury Subtitle */}
        <div className="flex items-center gap-2 mt-2">
          <span className="h-[1px] w-6 bg-gradient-to-r from-transparent to-[#b88a2a]" />
          <span className="text-[10px] sm:text-xs font-bold tracking-[0.35em] text-[#d4af37] uppercase">
            Palace &amp; Resort
          </span>
          <span className="h-[1px] w-6 bg-gradient-to-l from-transparent to-[#b88a2a]" />
        </div>

        {/* Role Orchestration Process Section */}
        <div className="mt-8 w-full max-w-lg">
          {/* Animated Phase Status Copy */}
          <div className="flex items-center justify-center gap-2 text-xs font-semibold text-amber-300/90 mb-3 tracking-wide min-h-[22px]">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" style={{ animationDuration: '3.5s' }} />
            <span className="animate-in fade-in duration-300">
              {phaseInfo.text}
            </span>
          </div>

          {/* Sequential Role Transition Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
            {ROLES.map((role, idx) => {
              const Icon = role.icon;
              const isUnlocked = roleStep > idx;
              const isCurrent = roleStep === idx + 1;
              return (
                <div
                  key={role.id}
                  className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all duration-400 ${
                    isCurrent
                      ? 'bg-amber-400/15 border-amber-400 text-amber-300 shadow-[0_0_16px_rgba(251,191,36,0.35)] scale-102 ring-1 ring-amber-400/50'
                      : isUnlocked
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 opacity-95 scale-100'
                      : 'bg-[#0b1424]/60 border-[#1a2840] text-slate-500 opacity-40 scale-98'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <Icon className={`w-3.5 h-3.5 ${isCurrent ? 'text-amber-400 animate-bounce' : isUnlocked ? 'text-emerald-400' : 'text-slate-500'}`} />
                    {isUnlocked && <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />}
                  </div>
                  <span className="text-[11px] font-bold leading-tight line-clamp-1">{role.label}</span>
                  <span className="text-[9px] text-slate-400 mt-0.5 line-clamp-1">{role.sub}</span>
                </div>
              );
            })}
          </div>

          {/* High-Precision Progress Track */}
          <div className="w-full h-1 bg-[#131f33] rounded-full overflow-hidden p-[1px] border border-[#1e2f4a]">
            <div 
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-amber-400 to-teal-300 shadow-[0_0_10px_rgba(251,191,36,0.7)] transition-all duration-400 ease-out"
              style={{ width: `${phaseInfo.progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Bottom Corner Skip Control */}
      <div className="absolute bottom-6 right-6 z-20">
        <button
          type="button"
          onClick={onDismiss}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white bg-[#0e182a]/70 hover:bg-[#16233a] border border-[#1e2e48] px-3 py-1.5 rounded-xl transition backdrop-blur-sm cursor-pointer shadow-lg active:scale-95"
          title="Press Esc or click to skip intro"
        >
          <span>Skip Intro</span>
          <span className="hidden sm:inline-block text-[10px] text-slate-500 bg-[#070c16] px-1 py-0.5 rounded border border-[#1b283d]">
            Esc
          </span>
          <ChevronRight className="w-3.5 h-3.5 text-amber-400" />
        </button>
      </div>

      {/* Bottom Trust Watermark */}
      <div className="absolute bottom-6 left-6 text-[10px] text-slate-500 tracking-wider uppercase font-semibold hidden md:block">
        Five-Star Hospitality Orchestration
      </div>
    </div>
  );
}

export default SplashScreen;
