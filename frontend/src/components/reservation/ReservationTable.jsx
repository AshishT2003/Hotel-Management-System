import React, { useState, useMemo } from 'react';
import { useHotel } from '../../context/HotelContext';
import { Badge } from '../common/Badge';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { 
  Search, 
  LogIn, 
  LogOut, 
  Edit2, 
  Trash2, 
  Utensils, 
  Sparkles,
  Phone, 
  MapPin,
  CheckCircle,
  Clock
} from 'lucide-react';
import { GuestProfileBadge } from '../guest/GuestProfileBadge';

export function ReservationTable({ onEditReservation }) {
  const { reservations, guestProfiles = [], toggleCheckIn, deleteReservation } = useHotel();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filteredReservations = useMemo(() => {
    return reservations.filter((r) => {
      // Exclude cancelled bookings from table
      if (r.status === 'Cancelled') return false;

      // Status filter
      if (statusFilter === 'CHECKED_IN' && !(r.status === 'Checked-In' || (r.checkIn && r.status !== 'Checked-Out'))) return false;
      if (statusFilter === 'RESERVED' && !(r.status === 'Reserved' || (!r.checkIn && r.status !== 'Checked-Out'))) return false;
      if (statusFilter === 'KITCHEN_ORDER' && !(r.breakfast > 0 || r.lunch > 0 || r.dinner > 0)) return false;

      // Universal Search filter
      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();
      const fullName = `${r.firstName} ${r.lastName}`.toLowerCase();
      return (
        String(r.id).includes(term) ||
        fullName.includes(term) ||
        String(r.roomNumber).toLowerCase().includes(term) ||
        String(r.roomType).toLowerCase().includes(term) ||
        String(r.phoneNumber).toLowerCase().includes(term) ||
        String(r.emailAddress).toLowerCase().includes(term) ||
        String(r.city).toLowerCase().includes(term) ||
        String(r.state).toLowerCase().includes(term)
      );
    });
  }, [reservations, searchTerm, statusFilter]);

  const handleDelete = (id, guestName) => {
    if (window.confirm(`Are you sure you want to cancel and delete reservation #${id} for ${guestName}?`)) {
      deleteReservation(id);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        {/* Universal Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-hotel-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Universal Search by Guest, Room, ID, Phone, City..."
            className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-hotel-200 dark:border-hotel-700 bg-white dark:bg-hotel-900 text-hotel-900 dark:text-hotel-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-hotel-100 dark:bg-hotel-800 rounded-xl">
          {[
            { id: 'ALL', label: `All (${reservations.filter(r => r.status !== 'Cancelled').length})` },
            { id: 'CHECKED_IN', label: `Checked-In (${reservations.filter(r => (r.status === 'Checked-In' || (r.checkIn && r.status !== 'Checked-Out')) && r.status !== 'Cancelled').length})` },
            { id: 'RESERVED', label: `Reserved (${reservations.filter(r => (r.status === 'Reserved' || (!r.checkIn && r.status !== 'Checked-Out')) && r.status !== 'Cancelled').length})` },
            { id: 'KITCHEN_ORDER', label: `With Dining (${reservations.filter(r => (r.breakfast > 0 || r.lunch > 0 || r.dinner > 0) && r.status !== 'Cancelled').length})` }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                statusFilter === tab.id
                  ? 'bg-white dark:bg-hotel-900 text-hotel-900 dark:text-hotel-100 shadow-sm'
                  : 'text-hotel-500 hover:text-hotel-800 dark:hover:text-hotel-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto rounded-xl border border-hotel-200 dark:border-hotel-800 bg-white dark:bg-hotel-900 shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="bg-hotel-50 dark:bg-hotel-850/60 border-b border-hotel-200 dark:border-hotel-800 text-[11px] font-bold text-hotel-500 uppercase tracking-wider">
            <tr>
              <th className="py-3 px-4">Booking</th>
              <th className="py-3 px-4">Guest Details</th>
              <th className="py-3 px-4">Room &amp; Type</th>
              <th className="py-3 px-4">Dates</th>
              <th className="py-3 px-4">Add-ons</th>
              <th className="py-3 px-4">Total Bill</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-hotel-100 dark:divide-hotel-800 font-medium">
            {filteredReservations.length === 0 ? (
              <tr>
                <td colSpan="8" className="py-12 text-center text-hotel-400">
                  <p className="text-sm font-semibold">No guest found matching your query.</p>
                  <p className="text-xs mt-1">Try clearing filters or search terms.</p>
                </td>
              </tr>
            ) : (
              filteredReservations.map((r) => {
                const hasMeals = r.breakfast > 0 || r.lunch > 0 || r.dinner > 0;
                const hasServices = r.cleaning || r.towel || r.surprise;
                return (
                  <tr key={r.id} className="hover:bg-hotel-50/50 dark:hover:bg-hotel-800/30 transition-colors">
                    {/* Booking ID */}
                    <td className="py-3 px-4 font-mono font-bold text-hotel-900 dark:text-hotel-100">
                      #{r.id}
                    </td>

                    {/* Guest Details */}
                    <td className="py-3 px-4">
                      {(() => {
                        const matchingProfile = guestProfiles.find(
                          p => (r.emailAddress && p.email?.toLowerCase() === r.emailAddress?.toLowerCase()) ||
                               (p.lastName?.toLowerCase() === r.lastName?.toLowerCase())
                        ) || {
                          firstName: r.firstName,
                          lastName: r.lastName,
                          email: r.emailAddress || `${r.firstName.toLowerCase()}.${r.lastName.toLowerCase()}@luxuryguest.com`,
                          tierStatus: r.totalBill > 800 ? 'Platinum' : r.totalBill > 400 ? 'Gold' : 'Silver',
                          loyaltyPoints: Math.round((Number(r.totalBill) || 100) * 10),
                          totalNights: Math.max(1, Math.round((new Date(r.leavingTime) - new Date(r.arrivalTime)) / (1000 * 60 * 60 * 24))) || 2,
                          preferences: {
                            pillow: r.roomType === 'Suite' ? 'Hypoallergenic Goose Feather' : 'Firm Memory Foam',
                            floorPreference: `Floor ${r.roomFloor}`,
                            diningPackage: r.breakfast ? 'Artisan Breakfast' : r.dinner ? 'Chef Dinner' : 'Standard In-Room Dining'
                          }
                        };

                        return (
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <p className="font-bold text-hotel-900 dark:text-white text-sm">
                                {r.firstName} {r.lastName}
                              </p>
                              <GuestProfileBadge tier={matchingProfile.tierStatus} profile={matchingProfile} />
                            </div>
                          </div>
                        );
                      })()}
                      <div className="flex items-center gap-3 text-hotel-400 mt-0.5 text-[11px]">
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3" /> {r.phoneNumber}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {r.city || '—'}, {r.state || '—'}
                        </span>
                      </div>
                    </td>

                    {/* Room & Type */}
                    <td className="py-3 px-4">
                      <span className="font-extrabold text-sm text-emerald-600 dark:text-emerald-400">
                        Room {r.roomNumber}
                      </span>
                      <p className="text-[11px] text-hotel-500 font-normal">
                        {r.roomType} (Floor {r.roomFloor})
                      </p>
                    </td>

                    {/* Dates */}
                    <td className="py-3 px-4 text-[11px] text-hotel-600 dark:text-hotel-300">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-hotel-400" />
                        <span>{formatDate(r.arrivalTime)} → {formatDate(r.leavingTime)}</span>
                      </div>
                      <span className="text-[10px] text-hotel-400">{r.numberGuest} Guest(s)</span>
                    </td>

                    {/* Add-ons & Perks */}
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        {hasMeals && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                            <Utensils className="w-2.5 h-2.5" />
                            Meals ({r.breakfast + r.lunch + r.dinner})
                          </span>
                        )}
                        {r.cleaning && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                            Clean
                          </span>
                        )}
                        {r.towel && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                            Towels
                          </span>
                        )}
                        {r.surprise && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                            <Sparkles className="w-2.5 h-2.5 text-rose-500" /> Surprise
                          </span>
                        )}
                        {!hasMeals && !hasServices && (
                          <span className="text-[11px] text-hotel-400 font-normal">None</span>
                        )}
                      </div>
                    </td>

                    {/* Total Bill */}
                    <td className="py-3 px-4">
                      <p className="font-extrabold text-sm text-hotel-950 dark:text-white">
                        {formatCurrency(r.totalBill)}
                      </p>
                      <p className="text-[10px] text-hotel-400">{r.paymentType}</p>
                    </td>

                    {/* CheckIn Status */}
                    <td className="py-3 px-4">
                      <Badge
                        variant={
                          r.status === 'Checked-Out'
                            ? 'info'
                            : r.checkIn || r.status === 'Checked-In'
                            ? 'success'
                            : 'warning'
                        }
                        dot
                      >
                        {r.status === 'Checked-Out'
                          ? 'Checked-Out'
                          : r.checkIn || r.status === 'Checked-In'
                          ? 'Checked-In'
                          : 'Reserved'}
                      </Badge>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        {r.status === 'Checked-Out' ? (
                          <button
                            disabled
                            title="Stay completed (Checked-Out)"
                            className="p-1.5 rounded-lg border border-[#2d3d5a] bg-[#131e36]/40 text-[#64748b] text-xs font-semibold flex items-center gap-1 cursor-not-allowed opacity-60"
                          >
                            <CheckCircle className="w-3.5 h-3.5 text-sky-400" />
                            <span className="hidden xl:inline">Departed</span>
                          </button>
                        ) : r.checkIn || r.status === 'Checked-In' ? (
                          <button
                            onClick={() => toggleCheckIn(r.id)}
                            title="Check out guest (Release room & mark Dirty)"
                            className="p-1.5 rounded-lg border border-amber-500/70 bg-amber-950/40 text-amber-300 hover:bg-amber-900/50 hover:border-amber-400 hover:text-white text-xs font-semibold flex items-center gap-1 transition-all shadow-sm cursor-pointer active:scale-95"
                          >
                            <LogOut className="w-3.5 h-3.5 text-amber-400" />
                            <span className="hidden xl:inline">Check Out</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => toggleCheckIn(r.id)}
                            title="Check in guest to room"
                            className="p-1.5 rounded-lg border border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer active:scale-95"
                          >
                            <LogIn className="w-3.5 h-3.5" />
                            <span className="hidden xl:inline">Check In</span>
                          </button>
                        )}

                        <button
                          onClick={() => onEditReservation(r)}
                          title="Edit reservation"
                          className="p-1.5 rounded-lg border border-hotel-300 dark:border-hotel-700 text-hotel-600 dark:text-hotel-300 hover:bg-hotel-100 dark:hover:bg-hotel-800 transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleDelete(r.id, `${r.firstName} ${r.lastName}`)}
                          title="Delete reservation"
                          className="p-1.5 rounded-lg border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ReservationTable;
