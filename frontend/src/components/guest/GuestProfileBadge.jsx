import React, { useState } from 'react';
import { Crown, Star, Shield, Sparkles, X, Heart, Bed, Utensils } from 'lucide-react';

export function GuestProfileBadge({ tier = 'Silver', profile = null, showDetailsModal = true }) {
  const [isOpen, setIsOpen] = useState(false);

  const normalizedTier = tier?.toLowerCase() || 'silver';

  const config = {
    platinum: {
      label: 'Platinum VIP',
      badgeClass: 'bg-gradient-to-r from-purple-950/80 via-indigo-950/80 to-purple-900/80 text-purple-300 border-purple-500/50 shadow-sm shadow-purple-900/40',
      icon: Crown,
      multiplier: '1.5x Points',
      glow: 'rgba(168, 85, 247, 0.4)'
    },
    gold: {
      label: 'Gold Member',
      badgeClass: 'bg-gradient-to-r from-amber-950/80 via-yellow-950/80 to-amber-900/80 text-amber-300 border-amber-500/50 shadow-sm shadow-amber-900/40',
      icon: Star,
      multiplier: '1.25x Points',
      glow: 'rgba(245, 158, 11, 0.4)'
    },
    silver: {
      label: 'Silver Tier',
      badgeClass: 'bg-gradient-to-r from-slate-900/80 via-sky-950/60 to-slate-800/80 text-sky-300 border-sky-600/40',
      icon: Shield,
      multiplier: '1.0x Points',
      glow: 'rgba(56, 189, 248, 0.3)'
    }
  }[normalizedTier] || {
    label: 'Silver Tier',
    badgeClass: 'bg-slate-900 text-slate-300 border-slate-700',
    icon: Shield,
    multiplier: '1.0x Points',
    glow: 'transparent'
  };

  const Icon = config.icon;

  const handleClick = (e) => {
    if (showDetailsModal && profile) {
      e.stopPropagation();
      setIsOpen(true);
    }
  };

  return (
    <>
      <span
        onClick={handleClick}
        title={profile ? `Click to view ${config.label} 360° Profile & Preferences` : config.label}
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border select-none transition-all ${config.badgeClass} ${profile ? 'cursor-pointer hover:scale-105 active:scale-95' : ''}`}
      >
        <Icon className="w-3 h-3 shrink-0" />
        <span>{config.label}</span>
      </span>

      {/* 360° Profile Preferences Modal */}
      {isOpen && profile && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn"
          onClick={() => setIsOpen(false)}
        >
          <div 
            className="w-full max-w-md bg-[#0d1527] border border-[#1e2a40] rounded-2xl shadow-2xl p-6 text-white space-y-4 relative"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${config.badgeClass}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">
                    {profile.firstName} {profile.lastName}
                  </h3>
                  <p className="text-xs text-[#94a3b8] flex items-center gap-2">
                    <span>{profile.email}</span>
                    <span>•</span>
                    <span className="font-bold text-amber-400">{profile.loyaltyPoints?.toLocaleString() || 0} pts</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-[#94a3b8] hover:text-white p-1 rounded-lg hover:bg-[#131e36]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Metrics Ribbon */}
            <div className="grid grid-cols-3 gap-2 py-3 px-3.5 rounded-xl bg-[#070b13] border border-[#1e2a40] text-center">
              <div>
                <p className="text-[10px] uppercase font-bold text-[#64748b]">Tier</p>
                <p className="text-xs font-extrabold text-white">{config.label}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-[#64748b]">Multiplier</p>
                <p className="text-xs font-extrabold text-emerald-400">{config.multiplier}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-[#64748b]">Stay Nights</p>
                <p className="text-xs font-extrabold text-white">{profile.totalNights || 0} nights</p>
              </div>
            </div>

            {/* Guest 360° Preferences */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#94a3b8] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Curated Luxury Preferences
              </h4>

              {profile.preferences && Object.keys(profile.preferences).length > 0 ? (
                <div className="space-y-2 bg-[#0a1120] border border-[#1e2a40] rounded-xl p-3 text-xs">
                  {Object.entries(profile.preferences).map(([key, value]) => (
                    <div key={key} className="flex items-start justify-between gap-2 border-b border-[#1e2a40]/50 pb-1.5 last:border-0 last:pb-0">
                      <span className="text-[#64748b] capitalize font-medium">{key.replace(/([A-Z])/g, ' $1')}:</span>
                      <span className="text-white font-semibold text-right">{value}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-[#0a1120] border border-[#1e2a40] rounded-xl p-3 text-center text-xs text-[#64748b]">
                  Standard guest hospitality profile. No custom preferences logged yet.
                </div>
              )}
            </div>

            {/* Close Button */}
            <div className="pt-2">
              <button
                onClick={() => setIsOpen(false)}
                className="w-full py-2.5 rounded-xl bg-[#1e2a40] hover:bg-[#283854] text-white text-xs font-bold transition-all"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default GuestProfileBadge;
