import React from 'react';

export function Card({ children, className = '', hover = false, ...props }) {
  return (
    <div
      className={`bg-[#0d1527] border border-[#1e2a40] rounded-2xl p-5 sm:p-6 shadow-xl ${
        hover ? 'hover:shadow-2xl hover:border-[#2d3d5a] hover:-translate-y-0.5 transition-all duration-200' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function StatBox({ title, value, subtext, icon: Icon, color = 'emerald', onClick }) {
  const colorMap = {
    emerald: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25',
    amber: 'bg-amber-500/15 text-amber-400 border border-amber-500/25',
    indigo: 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/25',
    rose: 'bg-rose-500/15 text-rose-400 border border-rose-500/25',
    hotel: 'bg-slate-800 text-slate-300 border border-slate-700'
  };

  return (
    <div 
      onClick={onClick}
      className={`bg-[#0d1527] border border-[#1e2a40] rounded-2xl p-5 sm:p-6 shadow-xl flex items-center justify-between transition-all duration-200 hover:-translate-y-0.5 hover:border-[#2d3d5a] ${
        onClick ? 'cursor-pointer hover:border-emerald-500/40 hover:shadow-emerald-950/20 active:scale-[0.99]' : ''
      }`}
    >
      <div className="space-y-1">
        <p className="text-[11px] font-bold text-[#94a3b8] uppercase tracking-wider">{title}</p>
        <p className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight tabular-nums">{value}</p>
        {subtext && <p className="text-xs text-[#64748b] font-medium">{subtext}</p>}
      </div>
      {Icon && (
        <div className={`p-3.5 rounded-2xl shrink-0 ${colorMap[color] || colorMap.emerald}`}>
          <Icon className="w-6 h-6" />
        </div>
      )}
    </div>
  );
}
