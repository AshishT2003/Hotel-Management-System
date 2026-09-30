import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useHotel } from '../../context/HotelContext';
import { Hotel, LogOut, Clock, UtensilsCrossed, Sparkles } from 'lucide-react';

export function Navbar({ onNavigate }) {
  const { currentUser, logout } = useAuth();
  const { stats } = useHotel();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedDate = time.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  const formattedTime = time.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  return (
    <header className="h-16 shrink-0 border-b border-[#1e2a40] bg-[#070b13]/95 backdrop-blur-xl sticky top-0 z-40 px-4 sm:px-6 flex items-center justify-between select-none">
      {/* Brand & Identity */}
      <div
        onClick={() => onNavigate && onNavigate('dashboard')}
        className="flex items-center gap-3.5 min-w-0 cursor-pointer group"
        title="Return to Executive Dashboard"
      >
        <div className="relative group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-[#052e22] shadow-[0_0_20px_rgba(16,185,129,0.25)] shrink-0 transition-transform group-hover:scale-105 duration-200">
            <Hotel className="w-5 h-5" />
          </div>
          <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-[#070b13]" />
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-base font-extrabold text-white tracking-tight truncate font-sans">
              <span className="maharaja-brand-animated">MAHARAJA Hotel</span>
            </h1>
            <span className="hidden xs:inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 shadow-sm shrink-0">
              <Sparkles className="w-2.5 h-2.5" />
              Enterprise Suite
            </span>
          </div>
          <p className="text-[11px] text-[#94a3b8] font-medium truncate tracking-tight">
            Hotel &amp; Guest Management System
          </p>
        </div>
      </div>

      {/* Center Operational Status Bar */}
      <div className="hidden lg:flex items-center gap-5">
        {/* Live Clock Widget */}
        <div className="flex items-center gap-2.5 text-xs font-semibold text-[#c2cddc] bg-[#0d1527] px-3.5 py-1.5 rounded-xl border border-[#1e2a40] shadow-sm">
          <Clock className="w-3.5 h-3.5 text-emerald-400" />
          <span className="tabular-nums">
            {formattedDate} · <span className="text-white font-bold">{formattedTime}</span>
          </span>
        </div>

        {/* Occupancy Live Gauge (Hidden for Guests) */}
        {currentUser?.role !== 'guest' ? (
          <div className="flex items-center gap-3 text-xs bg-[#0d1527] px-3.5 py-1.5 rounded-xl border border-[#1e2a40] shadow-sm">
            <span className="text-[#94a3b8] font-semibold">Occupancy:</span>
            <div className="flex items-center gap-2">
              <div className="w-24 bg-[#1e2a40] h-2 rounded-full overflow-hidden p-0.5">
                <div 
                  className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" 
                  style={{ width: `${stats.occupancyRate}%` }}
                />
              </div>
              <span className="font-extrabold text-white tabular-nums">{stats.occupancyRate}%</span>
              <span className="text-[10px] text-[#64748b] font-medium">({stats.occupiedCount}/50)</span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-300 bg-emerald-950/40 px-3.5 py-1.5 rounded-xl border border-emerald-800/50 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>MAHARAJA Hotel Guest Experience</span>
          </div>
        )}
      </div>

      {/* Right Controls & User Identity */}
      <div className="flex items-center gap-3">
        {/* Active Kitchen Orders Pill */}
        {(currentUser?.role === 'frontend' || currentUser?.role === 'admin' || currentUser?.role === 'manager' || currentUser?.username === 'admin') && stats.pendingKitchenOrders > 0 && (
          <button
            type="button"
            onClick={() => onNavigate && onNavigate('kitchen')}
            title="Open Kitchen & Room Service Queue"
            className="flex items-center gap-2 text-xs text-amber-300 bg-amber-950/40 px-3 py-1.5 rounded-full border border-amber-800/60 font-semibold shadow-sm hover:scale-[1.02] hover:bg-amber-900/40 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-400"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
            </span>
            <UtensilsCrossed className="w-3.5 h-3.5 text-amber-400" />
            <span className="tabular-nums">{stats.pendingKitchenOrders} orders in queue</span>
          </button>
        )}

        {/* User Identity Chip */}
        <div className="flex items-center gap-3 pl-3 border-l border-[#1e2a40]">
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#131e36] to-[#1e2a40] flex items-center justify-center text-white font-bold text-xs border border-[#2d3d5a] shadow-inner">
              {currentUser?.name?.trim() ? currentUser.name.trim().charAt(0).toUpperCase() : currentUser?.username?.charAt(0).toUpperCase() || 'G'}
            </div>
            <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-[#070b13]" />
          </div>

          <div className="hidden sm:block text-left">
            <p className="text-xs font-bold text-white leading-tight">
              {currentUser?.name || (currentUser?.role === 'guest' ? 'Valued Guest' : 'Eleanor Vance (Front Desk Admin)')}
            </p>
            <p className="text-[10px] text-[#94a3b8] font-medium">
              Role: {currentUser?.role === 'guest'
                ? 'VIP Hotel Guest'
                : currentUser?.role === 'kitchen'
                ? 'Kitchen Staff'
                : currentUser?.username === 'admin' || currentUser?.role === 'admin'
                ? 'Administrator'
                : currentUser?.role === 'manager'
                ? 'General Manager'
                : 'Front Desk Admin'}
            </p>
          </div>

          {/* Sign Out Button */}
          <button
            onClick={logout}
            title="Sign out of portal"
            className="p-1.5 rounded-xl text-[#94a3b8] hover:text-rose-400 hover:bg-rose-950/30 border border-transparent hover:border-rose-900/50 transition-all duration-150 active:scale-95 focus:outline-none focus:ring-2 focus:ring-rose-500"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
