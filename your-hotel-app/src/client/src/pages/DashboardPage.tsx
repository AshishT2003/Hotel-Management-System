import React from 'react';
import { useHotel } from '../context/HotelContext';
import { formatCurrency, formatDate } from '../utils/formatters';
import {
  BedDouble,
  DollarSign,
  UtensilsCrossed,
  CalendarCheck,
  PlusCircle,
  ArrowRight,
  TrendingUp,
  Users
} from 'lucide-react';

interface DashboardPageProps {
  onNavigateTab: (tab: string) => void;
  onOpenNewReservation: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onNavigateTab,
  onOpenNewReservation,
}) => {
  const { reservations, rooms, orders } = useHotel();

  // Metrics
  const totalRooms = 50;
  const occupiedRooms = rooms.filter(r => r.status === 'Occupied').length;
  const reservedRooms = rooms.filter(r => r.status === 'Reserved').length;
  const vacantRooms = totalRooms - occupiedRooms - reservedRooms;
  const occupancyRate = Math.round((occupiedRooms / totalRooms) * 100);

  const totalRevenue = reservations.reduce((acc, r) => acc + (r.totalBill || 0), 0);
  const pendingOrders = orders.filter(o => !o.supplyStatus).length;

  const floorConfigs = [
    { floor: 1, type: 'Single' },
    { floor: 2, type: 'Double' },
    { floor: 3, type: 'Twin' },
    { floor: 4, type: 'Duplex' },
    { floor: 5, type: 'Suite' },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#070b13] via-[#092218] to-[#0a1529] border border-[#1e2a40] p-6 sm:p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2">
            <span className="text-[11px] font-black tracking-widest uppercase text-emerald-400">
              Live Operations Control
            </span>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Hospitality Executive Overview
            </h2>
            <p className="text-xs sm:text-sm text-[#94a3b8] max-w-xl leading-relaxed">
              Real-time room occupancy, dining service queues, and automated guest billing calculations.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenNewReservation}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 transition-all active:scale-98"
            >
              <PlusCircle className="w-4 h-4" />
              <span>New Reservation</span>
            </button>
            <button
              onClick={() => onNavigateTab('rooms')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[#2d3d5a] bg-[#0d1527] hover:bg-[#131e36] text-white font-semibold text-sm transition-all"
            >
              <BedDouble className="w-4 h-4" />
              <span>View Room Matrix</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Stat Boxes (KPI Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Gross Revenue */}
        <div className="bg-[#0d1527] border border-[#1e2a40] rounded-2xl p-5 sm:p-6 shadow-xl flex items-center justify-between transition-all duration-200 hover:-translate-y-0.5 hover:border-[#2d3d5a]">
          <div className="space-y-1">
            <p className="text-[11px] font-bold text-[#94a3b8] uppercase tracking-wider">Total Gross Revenue</p>
            <p className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight tabular-nums">{formatCurrency(totalRevenue)}</p>
            <p className="text-xs text-[#64748b] font-medium">Includes room rates, dining &amp; 7% tax</p>
          </div>
          <div className="p-3.5 rounded-2xl shrink-0 bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* In-House Occupancy */}
        <div className="bg-[#0d1527] border border-[#1e2a40] rounded-2xl p-5 sm:p-6 shadow-xl flex items-center justify-between transition-all duration-200 hover:-translate-y-0.5 hover:border-[#2d3d5a]">
          <div className="space-y-1">
            <p className="text-[11px] font-bold text-[#94a3b8] uppercase tracking-wider">In House Occupancy</p>
            <p className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight tabular-nums">{occupiedRooms} Rooms</p>
            <p className="text-xs text-[#64748b] font-medium">{occupancyRate}% of total 50 capacity</p>
          </div>
          <div className="p-3.5 rounded-2xl shrink-0 bg-indigo-500/15 text-indigo-400 border border-indigo-500/25">
            <BedDouble className="w-6 h-6" />
          </div>
        </div>

        {/* Reserved (Pending Check-in) */}
        <div className="bg-[#0d1527] border border-[#1e2a40] rounded-2xl p-5 sm:p-6 shadow-xl flex items-center justify-between transition-all duration-200 hover:-translate-y-0.5 hover:border-[#2d3d5a]">
          <div className="space-y-1">
            <p className="text-[11px] font-bold text-[#94a3b8] uppercase tracking-wider">Reserved (Pending Check In)</p>
            <p className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight tabular-nums">{reservedRooms} Bookings</p>
            <p className="text-xs text-[#64748b] font-medium">{vacantRooms} rooms vacant for walk-ins</p>
          </div>
          <div className="p-3.5 rounded-2xl shrink-0 bg-amber-500/15 text-amber-400 border border-amber-500/25">
            <CalendarCheck className="w-6 h-6" />
          </div>
        </div>

        {/* Active Kitchen Orders */}
        <div className="bg-[#0d1527] border border-[#1e2a40] rounded-2xl p-5 sm:p-6 shadow-xl flex items-center justify-between transition-all duration-200 hover:-translate-y-0.5 hover:border-[#2d3d5a]">
          <div className="space-y-1">
            <p className="text-[11px] font-bold text-[#94a3b8] uppercase tracking-wider">Active Kitchen Orders</p>
            <p className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight tabular-nums">{pendingOrders} Orders</p>
            <p className="text-xs text-[#64748b] font-medium">Waiting in &apos;On The Line&apos; queue</p>
          </div>
          <div className="p-3.5 rounded-2xl shrink-0 bg-rose-500/15 text-rose-400 border border-rose-500/25">
            <UtensilsCrossed className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 2 Column Layout: Floor Status & Recent Bookings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Floor-by-floor occupancy overview */}
        <div className="bg-[#0d1527] border border-[#1e2a40] rounded-2xl p-5 sm:p-6 shadow-xl lg:col-span-1 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#1e2a40]">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              Floor Occupancy Rates
            </h3>
            <button
              onClick={() => onNavigateTab('rooms')}
              className="text-xs text-emerald-400 font-semibold hover:underline flex items-center gap-1 transition-all"
            >
              Matrix <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-4">
            {floorConfigs.map(f => {
              const floorRooms = rooms.filter(r => r.floor === f.floor);
              const occupied = floorRooms.filter(r => r.status === 'Occupied').length;
              const reserved = floorRooms.filter(r => r.status === 'Reserved').length;

              return (
                <div key={f.floor} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-[#f1f5f9]">
                      Floor {f.floor} ({f.type})
                    </span>
                    <span className="text-[#94a3b8] text-[11px] tabular-nums">
                      {occupied} occupied • {reserved} reserved
                    </span>
                  </div>
                  <div className="w-full bg-[#131e36] h-2.5 rounded-full overflow-hidden flex border border-[#1e2a40]/60">
                    <div
                      className="bg-rose-500 h-full transition-all duration-300"
                      style={{ width: `${(occupied / 10) * 100}%` }}
                      title={`${occupied} Occupied`}
                    />
                    <div
                      className="bg-amber-400 h-full transition-all duration-300"
                      style={{ width: `${(reserved / 10) * 100}%` }}
                      title={`${reserved} Reserved`}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-3.5 border-t border-[#1e2a40] flex items-center justify-between text-xs text-[#94a3b8]">
            <span>
              Overall Vacant: <strong className="text-emerald-400 font-semibold tabular-nums">{vacantRooms} rooms</strong>
            </span>
            <span>
              Total Units: <strong className="text-white font-semibold tabular-nums">50 rooms</strong>
            </span>
          </div>
        </div>

        {/* Right Column: Recent Bookings */}
        <div className="bg-[#0d1527] border border-[#1e2a40] rounded-2xl p-5 sm:p-6 shadow-xl lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#1e2a40]">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-400" />
              Latest Reservations
            </h3>
            <button
              onClick={() => onNavigateTab('reservations')}
              className="text-xs text-emerald-400 font-semibold hover:underline flex items-center gap-1 transition-all"
            >
              All Bookings <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="divide-y divide-[#1e2a40]">
            {reservations.slice(0, 5).map(r => (
              <div key={r.id} className="py-3 flex items-center justify-between gap-4 hover:bg-[#131e36]/30 px-2 rounded-xl transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-[#131e36] border border-[#2d3d5a] flex items-center justify-center font-bold text-xs text-[#c2cddc] shrink-0 tabular-nums">
                    #{r.id}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-white truncate">
                      {r.firstName} {r.lastName}
                    </p>
                    <p className="text-xs text-[#94a3b8] truncate">
                      Room {r.roomNumber} ({r.roomType}) • {formatDate(r.checkInDate)} → {formatDate(r.checkOutDate)}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0 space-y-1">
                  <p className="text-sm font-extrabold text-white tabular-nums">
                    {formatCurrency(r.totalBill)}
                  </p>
                  <span
                    className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                      r.checkIn
                        ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/60'
                        : 'bg-amber-950/80 text-amber-400 border border-amber-800/60'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        r.checkIn ? 'bg-emerald-400' : 'bg-amber-400'
                      }`}
                    />
                    {r.checkIn ? 'In Room' : 'Reserved'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
