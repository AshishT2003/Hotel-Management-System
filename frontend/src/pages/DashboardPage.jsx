import React from 'react';
import { useHotel } from '../context/HotelContext';
import { Card, StatBox } from '../components/common/Card';
import { FLOORS } from '../utils/roomData';
import { formatCurrency, formatDate } from '../utils/formatters';
import { 
  DollarSign, 
  BedDouble, 
  CalendarCheck, 
  UtensilsCrossed, 
  PlusCircle, 
  ArrowRight,
  TrendingUp,
  Users
} from 'lucide-react';

export function DashboardPage({ onNavigate, onOpenNewReservation }) {
  const { stats, reservations, roomStatusMap } = useHotel();

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
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 transition-all active:scale-98 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-[#070b13]"
            >
              <PlusCircle className="w-4 h-4" />
              <span>New Reservation</span>
            </button>
            <button
              onClick={() => onNavigate('rooms')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[#2d3d5a] bg-[#0d1527] hover:bg-[#131e36] text-white font-semibold text-sm transition-all focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-[#070b13]"
            >
              <BedDouble className="w-4 h-4" />
              <span>View Room Matrix</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Stat Boxes (KPI Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatBox
          title="Total Gross Revenue"
          value={formatCurrency(stats.totalRevenue)}
          subtext="Includes room rates, dining & 7% tax"
          icon={DollarSign}
          color="emerald"
          onClick={() => onNavigate('reservations')}
        />
        <StatBox
          title="In-House Occupancy"
          value={`${stats.occupiedCount} Rooms`}
          subtext={`${stats.occupancyRate}% of total 50 capacity`}
          icon={BedDouble}
          color="indigo"
          onClick={() => onNavigate('rooms')}
        />
        <StatBox
          title="Reserved (Pending Check-in)"
          value={`${stats.reservedCount} Bookings`}
          subtext={`${stats.availableCount} rooms vacant for walk-ins`}
          icon={CalendarCheck}
          color="amber"
          onClick={() => onNavigate('reservations')}
        />
        <StatBox
          title="Active Kitchen Orders"
          value={`${stats.pendingKitchenOrders} Orders`}
          subtext="Waiting in 'On The Line' queue"
          icon={UtensilsCrossed}
          color="rose"
          onClick={() => onNavigate('kitchen')}
        />
      </div>

      {/* 2 Column Layout: Floor Status & Recent Bookings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Floor-by-floor occupancy overview */}
        <Card className="lg:col-span-1 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#1e2a40]">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              Floor Occupancy Rates
            </h3>
            <button
              onClick={() => onNavigate('rooms')}
              className="text-xs text-emerald-400 font-semibold hover:underline flex items-center gap-1 transition-all"
            >
              Matrix <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-4">
            {FLOORS.map(floor => {
              const occupied = floor.rooms.filter(r => roomStatusMap[r]?.status === 'Occupied').length;
              const reserved = floor.rooms.filter(r => roomStatusMap[r]?.status === 'Reserved').length;

              return (
                <div key={floor.floor} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-[#f1f5f9]">
                      Floor {floor.floor} ({floor.type})
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
              Overall Vacant: <strong className="text-emerald-400 font-semibold tabular-nums">{stats.availableCount} rooms</strong>
            </span>
            <span>
              Total Units: <strong className="text-white font-semibold tabular-nums">50 rooms</strong>
            </span>
          </div>
        </Card>

        {/* Right Column: Recent Bookings */}
        <Card className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#1e2a40]">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-400" />
              Latest Reservations
            </h3>
            <button
              onClick={() => onNavigate('reservations')}
              className="text-xs text-emerald-400 font-semibold hover:underline flex items-center gap-1 transition-all"
            >
              All Bookings <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="divide-y divide-[#1e2a40]">
            {reservations.filter(r => r.status !== 'Cancelled').length === 0 ? (
              <div className="py-8 text-center text-[#64748b]">
                <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-xs font-semibold">No recent bookings recorded</p>
              </div>
            ) : (
              reservations.filter(r => r.status !== 'Cancelled').slice(0, 5).map(r => (
                <div
                  key={r.id}
                  onClick={() => onNavigate('reservations')}
                  className="py-3 flex items-center justify-between gap-4 hover:bg-[#131e36]/50 px-2 rounded-xl transition-colors cursor-pointer group"
                  title={`View reservation #${r.id} in Reservations Hub`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-[#131e36] border border-[#2d3d5a] flex items-center justify-center font-bold text-xs text-[#c2cddc] shrink-0 tabular-nums">
                      #{r.id}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-white truncate">
                        {r.firstName} {r.lastName}
                      </p>
                      <p className="text-xs text-[#94a3b8] truncate">
                        Room {r.roomNumber} ({r.roomType}) • {formatDate(r.arrivalTime)} → {formatDate(r.leavingTime)}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0 space-y-1">
                    <p className="text-sm font-extrabold text-white tabular-nums">
                      {formatCurrency(r.totalBill)}
                    </p>
                    <span
                      className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                        r.status === 'Checked-Out'
                          ? 'bg-sky-950/80 text-sky-400 border border-sky-800/60'
                          : r.checkIn || r.status === 'Checked-In'
                          ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/60'
                          : 'bg-amber-950/80 text-amber-400 border border-amber-800/60'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          r.status === 'Checked-Out'
                            ? 'bg-sky-400'
                            : r.checkIn || r.status === 'Checked-In'
                            ? 'bg-emerald-400'
                            : 'bg-amber-400'
                        }`}
                      />
                      {r.status === 'Checked-Out' ? 'Departed' : (r.checkIn || r.status === 'Checked-In') ? 'In Room' : 'Reserved'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

export default DashboardPage;
