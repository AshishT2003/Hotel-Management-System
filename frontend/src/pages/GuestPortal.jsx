import React from 'react';
import { GuestBookingWizard } from '../components/guest/GuestBookingWizard';
import { Sparkles, Calendar, ShieldCheck, Phone, MapPin, ArrowRight, User } from 'lucide-react';

export function GuestPortal({ onNavigateToDashboard, onNavigateToLogin }) {
  return (
    <div className="min-h-screen bg-[#070b13] text-[#f1f5f9] flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* Top Luxury Navbar */}
      <header className="sticky top-0 z-50 bg-[#070b13]/90 backdrop-blur-md border-b border-[#182337]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-slate-950 shadow-lg shadow-emerald-500/20">
              <Sparkles className="w-5 h-5 fill-current" />
            </div>
            <div>
              <div className="text-lg font-black tracking-tight text-white leading-none">
                <span className="maharaja-brand-animated">MAHARAJA Hotel</span>
              </div>
              <div className="text-[10px] uppercase font-bold tracking-widest text-emerald-400 mt-0.5">
                Palace &amp; Resort
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              type="button"
              onClick={onNavigateToDashboard}
              className="py-2 px-3.5 sm:px-4 rounded-xl text-xs sm:text-sm font-semibold text-slate-200 hover:text-white bg-[#0f1b2e] hover:bg-[#16253c] border border-[#1e2a40] transition flex items-center gap-2"
            >
              <Calendar className="w-4 h-4 text-emerald-400" />
              <span>Manage My Bookings</span>
            </button>

            <button
              type="button"
              onClick={onNavigateToLogin}
              className="py-2 px-3.5 sm:px-4 rounded-xl text-xs sm:text-sm font-semibold text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 border border-emerald-500/30 transition flex items-center gap-1.5"
            >
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Staff Sign In</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <GuestBookingWizard
          onNavigateToDashboard={onNavigateToDashboard}
          onNavigateToLogin={onNavigateToLogin}
        />
      </main>

      {/* Luxury Footer */}
      <footer className="bg-[#050911] border-t border-[#152030] py-8 text-xs text-slate-400 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              <span>742 Horizon Boulevard, Luxury District</span>
            </div>
            <div className="hidden sm:flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              <span>Concierge: +1 (800) 555-PALACE</span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-slate-500">
            <span>Deterministic 7% Tax Rate</span>
            <span>•</span>
            <span>Guaranteed Direct Rates</span>
            <span>•</span>
            <span>© {new Date().getFullYear()} MAHARAJA Hotel</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
