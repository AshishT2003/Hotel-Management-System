import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, 
  CalendarCheck, 
  BedDouble, 
  ChefHat, 
  Sparkles,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenNewReservation?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
}) => {
  const { user } = useAuth();
  const isFrontDesk = user?.role === 'Admin' || user?.role === 'Manager' || !user?.role || user?.role === 'frontend';

  const menuItems = [
    ...(isFrontDesk ? [
      { id: 'dashboard', label: 'Executive Dashboard', icon: LayoutDashboard },
      { id: 'reservations', label: 'Reservations Hub', icon: CalendarCheck },
      { id: 'rooms', label: 'Room Matrix & Floors', icon: BedDouble },
    ] : []),
    { id: 'kitchen', label: 'Kitchen & Room Service', icon: ChefHat },
  ];

  return (
    <aside className="w-64 h-full border-r border-[#1e2a40] bg-[#070b13] flex flex-col justify-between shrink-0 p-4 select-none overflow-y-auto">
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
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                    isActive
                      ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-lg shadow-emerald-600/25 border border-emerald-500/30'
                      : 'text-[#94a3b8] hover:text-white hover:bg-[#0d1527] hover:border-[#1e2a40] border border-transparent hover:translate-x-0.5'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 shrink-0 transition-colors ${isActive ? 'text-white' : 'text-[#64748b] group-hover:text-emerald-400'}`} />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {isActive && <ChevronRight className="w-4 h-4 shrink-0 text-emerald-200" />}
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
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
              <span>Breakfast ($7) • Dining ($15)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
              <span>Housekeeping &amp; Fresh Towels</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
              <span>Sweet Surprise Amenity</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
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
              {isFrontDesk ? 'Front Desk' : 'Kitchen Staff'}
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
};

export default Sidebar;
