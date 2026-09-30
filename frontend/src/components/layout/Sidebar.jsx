import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, 
  CalendarCheck, 
  BedDouble, 
  ChefHat, 
  Sparkles,
  ShieldCheck,
  ChevronRight,
  UtensilsCrossed,
  Users,
  History
} from 'lucide-react';

export function Sidebar({ currentTab, onSelectTab }) {
  const { currentUser } = useAuth();
  const isGuest = currentUser?.role === 'guest';
  const isKitchen = currentUser?.role === 'kitchen';
  const isAdmin = currentUser?.username === 'admin' || currentUser?.role === 'admin';
  const isManager = currentUser?.role === 'manager';

  const menuItems = isGuest ? [
    { id: 'my-bookings', label: 'My Bookings & Stays', icon: CalendarCheck },
    { id: 'book-room', label: 'Book a New Room', icon: BedDouble },
    { id: 'guest-dining', label: 'Dining & Room Service', icon: UtensilsCrossed },
    { id: 'guest-housekeeping', label: 'Housekeeping & Perks', icon: Sparkles },
    { id: 'guest-profile', label: 'VIP Profile & Folio', icon: ShieldCheck },
  ] : isKitchen ? [
    { id: 'kitchen', label: 'Kitchen & Room Service', icon: ChefHat },
  ] : isAdmin ? [
    { id: 'dashboard', label: 'Executive Dashboard', icon: LayoutDashboard },
    { id: 'reservations', label: 'Reservations Hub', icon: CalendarCheck },
    { id: 'rooms', label: 'Room Matrix & Floors', icon: BedDouble },
    { id: 'housekeeping', label: 'Housekeeping & Turnover', icon: Sparkles },
    { id: 'kitchen', label: 'Kitchen & Room Service', icon: ChefHat },
    { id: 'users', label: 'Staff & User Management', icon: Users, badge: 'Admin' },
    { id: 'audit', label: 'System Audit Trail', icon: History, badge: 'Admin' },
  ] : [
    { id: 'dashboard', label: 'Executive Dashboard', icon: LayoutDashboard },
    { id: 'reservations', label: 'Reservations Hub', icon: CalendarCheck },
    { id: 'rooms', label: 'Room Matrix & Floors', icon: BedDouble },
    { id: 'housekeeping', label: 'Housekeeping & Turnover', icon: Sparkles },
    { id: 'kitchen', label: 'Kitchen & Room Service', icon: ChefHat },
  ];

  return (
    <aside className="w-64 h-full border-r border-[#1e2a40] bg-[#070b13] flex flex-col justify-between shrink-0 p-4 select-none overflow-y-auto overscroll-contain">
      <div className="space-y-6">
        {/* Navigation Group */}
        <div>
          <div className="flex items-center justify-between px-3 mb-2.5">
            <span className="text-[10px] font-bold text-[#64748b] uppercase tracking-widest">
              Navigation
            </span>
            <span className="text-[9px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-1.5 py-0.5 rounded">
              Live
            </span>
          </div>

          <nav className="space-y-1.5">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                    isActive
                      ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-lg shadow-emerald-600/25 border border-emerald-500/30'
                      : 'text-[#94a3b8] hover:text-white hover:bg-[#0d1527] hover:border-[#1e2a40] border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 shrink-0 transition-colors ${isActive ? 'text-white' : 'text-[#64748b] group-hover:text-emerald-400'}`} />
                    <span className="truncate">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {item.badge && !isActive && (
                      <span className="text-[9px] font-bold text-amber-400 bg-amber-950/60 border border-amber-800/40 px-1.5 py-0.5 rounded uppercase">
                        {item.badge}
                      </span>
                    )}
                    {isActive && <ChevronRight className="w-4 h-4 shrink-0 text-emerald-200" />}
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Branded Guest Amenities & Service Perks Widget */}
        <div className="relative overflow-hidden rounded-2xl border border-[#1e2a40] bg-gradient-to-b from-[#0d1527] to-[#091120] p-4 shadow-xl space-y-3 group">
          {/* Subtle Ambient Glow */}
          <div className="absolute -top-10 -right-10 w-24 h-24 rounded-full bg-emerald-500/10 blur-xl pointer-events-none" />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-bold text-white tracking-tight">Service Perks</span>
            </div>
            <span className="text-[9px] font-semibold text-amber-400/90 uppercase tracking-wider bg-amber-950/60 border border-amber-800/40 px-1.5 py-0.5 rounded">
              Amenity
            </span>
          </div>

          <ul className="text-[11px] text-[#94a3b8] space-y-2 leading-relaxed">
            <li
              onClick={() => onSelectTab && onSelectTab('kitchen')}
              className="flex items-start gap-2 hover:text-white cursor-pointer transition-colors group/perk"
              title="View Breakfast & Dining services in Kitchen module"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0 group-hover/perk:scale-125 transition-transform" />
              <span>Breakfast ($7) • Dining ($15)</span>
            </li>
            <li
              onClick={() => onSelectTab && onSelectTab('housekeeping')}
              className="flex items-start gap-2 hover:text-white cursor-pointer transition-colors group/perk"
              title="View Housekeeping & Turnover tasks"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0 group-hover/perk:scale-125 transition-transform" />
              <span>Housekeeping &amp; Fresh Towels</span>
            </li>
            <li
              onClick={() => onSelectTab && onSelectTab('kitchen')}
              className="flex items-start gap-2 hover:text-white cursor-pointer transition-colors group/perk"
              title="View VIP Sweet Surprise amenities in Kitchen module"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0 group-hover/perk:scale-125 transition-transform" />
              <span>Sweet Surprise Amenity</span>
            </li>
            <li
              onClick={() => onSelectTab && onSelectTab('reservations')}
              className="flex items-start gap-2 hover:text-white cursor-pointer transition-colors group/perk"
              title="Open Universal Guest Search in Reservations Hub"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0 group-hover/perk:scale-125 transition-transform" />
              <span>Universal Guest Search</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Role & Operational Security Footer */}
      <div className="pt-4 border-t border-[#1e2a40] space-y-2">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-[#94a3b8]">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Role:</span>
            <strong className="text-white font-semibold">
              {isGuest ? 'Hotel Guest' : isKitchen ? 'Kitchen Staff' : isAdmin ? 'Administrator' : isManager ? 'General Manager' : 'Front Desk Staff'}
            </strong>
          </div>
          <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Online
          </span>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
