import React from 'react';
import { Minus, Plus, Users } from 'lucide-react';

export function GuestCounter({ adults, children, onChange }) {
  const handleAdultChange = (delta) => {
    const newVal = Math.max(1, Math.min(6, adults + delta));
    onChange({ adults: newVal, children });
  };

  const handleChildrenChange = (delta) => {
    const newVal = Math.max(0, Math.min(4, children + delta));
    onChange({ adults, children: newVal });
  };

  const totalGuests = adults + children;

  return (
    <div className="bg-[#0b1424] border border-[#1e2a40] rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3 text-slate-300 text-sm font-semibold">
        <Users className="w-4 h-4 text-emerald-400" />
        <span>GUEST OCCUPANCY ({totalGuests} Total)</span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Adults */}
        <div className="flex items-center justify-between bg-[#070d18] border border-[#1a2639] p-3 rounded-lg">
          <div>
            <div className="text-white text-sm font-medium">Adults</div>
            <div className="text-xs text-slate-400">Ages 13+</div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleAdultChange(-1)}
              disabled={adults <= 1}
              aria-label="Decrease adults"
              className="w-8 h-8 rounded-lg bg-[#142034] text-slate-300 hover:text-white hover:bg-emerald-600/30 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="w-6 text-center font-bold text-white text-sm">{adults}</span>
            <button
              type="button"
              onClick={() => handleAdultChange(1)}
              disabled={adults >= 6}
              aria-label="Increase adults"
              className="w-8 h-8 rounded-lg bg-[#142034] text-slate-300 hover:text-white hover:bg-emerald-600/30 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Children */}
        <div className="flex items-center justify-between bg-[#070d18] border border-[#1a2639] p-3 rounded-lg">
          <div>
            <div className="text-white text-sm font-medium">Children</div>
            <div className="text-xs text-slate-400">Ages 0 - 12</div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleChildrenChange(-1)}
              disabled={children <= 0}
              aria-label="Decrease children"
              className="w-8 h-8 rounded-lg bg-[#142034] text-slate-300 hover:text-white hover:bg-emerald-600/30 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="w-6 text-center font-bold text-white text-sm">{children}</span>
            <button
              type="button"
              onClick={() => handleChildrenChange(1)}
              disabled={children >= 4}
              aria-label="Increase children"
              className="w-8 h-8 rounded-lg bg-[#142034] text-slate-300 hover:text-white hover:bg-emerald-600/30 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {totalGuests > 2 && (
        <p className="mt-2.5 text-xs text-amber-400/90 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
          Extra guest surcharge applies ($25/night per guest over 2 guests).
        </p>
      )}
    </div>
  );
}
