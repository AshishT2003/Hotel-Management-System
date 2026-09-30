import React, { useState, useEffect } from 'react';
import { guestBookingService } from '../services/guestBookingService';
import { 
  Search, Calendar, Building, ShieldAlert, CheckCircle2, 
  XCircle, ArrowLeft, Plus, Clock, AlertTriangle, Sparkles, MapPin
} from 'lucide-react';

export function GuestDashboard({ onNavigateToBooking, onNavigateToLogin }) {
  const [email, setEmail] = useState('');
  const [searchedEmail, setSearchedEmail] = useState('');
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [cancellingId, setCancellingId] = useState(null);
  const [confirmModalData, setConfirmModalData] = useState(null);
  const [notification, setNotification] = useState(null);

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);
    setSearchedEmail(email.trim());
    try {
      const results = await guestBookingService.getBookingsByEmail(email.trim());
      setBookings(results);
      setHasSearched(true);
    } catch (err) {
      console.error('Error fetching bookings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmCancel = async () => {
    if (!confirmModalData) return;
    setCancellingId(confirmModalData.reservationId);
    try {
      await guestBookingService.cancelBooking(confirmModalData.reservationId, searchedEmail);
      setNotification({
        type: 'success',
        message: `Reservation ${confirmModalData.confirmationCode} was successfully cancelled.`
      });
      setConfirmModalData(null);
      // Refresh list
      const results = await guestBookingService.getBookingsByEmail(searchedEmail);
      setBookings(results);
    } catch (err) {
      setNotification({
        type: 'error',
        message: err.message || 'Failed to cancel reservation.'
      });
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#070b13] text-[#f1f5f9] flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 bg-[#070b13]/90 backdrop-blur-md border-b border-[#182337]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-slate-950 shadow-lg shadow-emerald-500/20">
              <Sparkles className="w-5 h-5 fill-current" />
            </div>
            <div>
              <div className="text-lg font-black tracking-tight text-white leading-none">
                <span className="maharaja-brand-animated">MAHARAJA Hotel</span>
              </div>
              <div className="text-[10px] uppercase font-bold tracking-widest text-emerald-400 mt-0.5">
                Guest Self-Service Portal
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onNavigateToBooking}
              className="py-2 px-4 rounded-xl text-xs sm:text-sm font-bold text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 shadow-md shadow-emerald-500/20 flex items-center gap-1.5 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Book New Stay</span>
            </button>

            <button
              type="button"
              onClick={onNavigateToLogin}
              className="py-2 px-3 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition"
            >
              Staff Sign In
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* Title */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-2">
            My Reservations &amp; Stays
          </h1>
          <p className="text-sm text-slate-400">
            View active bookings, itemized receipts, and manage your reservation details.
          </p>
        </div>

        {/* Notifications */}
        {notification && (
          <div
            className={`p-4 rounded-2xl mb-6 flex items-center justify-between text-xs sm:text-sm ${
              notification.type === 'success'
                ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
                : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
            }`}
          >
            <span>{notification.message}</span>
            <button
              type="button"
              onClick={() => setNotification(null)}
              className="text-slate-400 hover:text-white ml-4 font-bold"
            >
              ✕
            </button>
          </div>
        )}

        {/* Email Lookup Card */}
        <div className="bg-[#0b1424] border border-[#1e2a40] rounded-2xl p-6 sm:p-7 shadow-xl shadow-black/40 mb-8">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter the email address used during booking..."
                className="w-full bg-[#070d18] border border-[#1e2a40] focus:border-emerald-500 text-white text-sm rounded-xl px-4 py-3.5 pl-11 focus:outline-none transition"
              />
              <Search className="w-5 h-5 text-slate-500 absolute left-3.5 top-3.5" />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="py-3.5 px-6 rounded-xl font-bold text-sm text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 transition shadow-lg shadow-emerald-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>Searching...</span>
                </>
              ) : (
                <span>Find My Reservations</span>
              )}
            </button>
          </form>
          <div className="text-xs text-slate-500 mt-2.5">
            Demo sample emails: <code className="text-slate-400">sophia.loren@luxury.com</code>, <code className="text-slate-400">ceaser.krit@example.com</code>, or your newly booked email.
          </div>
        </div>

        {/* Results List */}
        {hasSearched && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-400 px-1">
              <span>Found {bookings.length} reservations for <strong>{searchedEmail}</strong></span>
            </div>

            {bookings.length === 0 ? (
              <div className="bg-[#0b1424] border border-[#1e2a40] rounded-2xl p-10 text-center">
                <ShieldAlert className="w-10 h-10 text-slate-500 mx-auto mb-3" />
                <h3 className="text-base font-bold text-white mb-1">No Bookings Found</h3>
                <p className="text-xs text-slate-400 mb-4">
                  We couldn't find any reservations associated with this email address.
                </p>
                <button
                  type="button"
                  onClick={onNavigateToBooking}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 transition"
                >
                  Create a New Reservation
                </button>
              </div>
            ) : (
              bookings.map((booking) => {
                const isCancelled = booking.status?.toLowerCase() === 'cancelled';
                const isInRoom = booking.status?.toLowerCase() === 'in room';

                return (
                  <div
                    key={booking.reservationId}
                    className={`bg-[#0b1424] border rounded-2xl p-6 transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 ${
                      isCancelled ? 'border-[#1a2333] opacity-60' : 'border-[#1e2a40] hover:border-emerald-500/40'
                    }`}
                  >
                    {/* Left Column: Room info & Code */}
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-base font-black text-emerald-400 tracking-wider">
                          {booking.confirmationCode}
                        </span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            isCancelled
                              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                              : isInRoom
                              ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                              : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          }`}
                        >
                          {booking.status}
                        </span>
                      </div>

                      <div className="text-lg font-bold text-white">
                        Room {booking.roomNumber} • {booking.roomType}
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                          <span>
                            {typeof booking.checkIn === 'string' ? booking.checkIn.split('T')[0] : booking.checkIn} to{' '}
                            {typeof booking.checkOut === 'string' ? booking.checkOut.split('T')[0] : booking.checkOut}
                          </span>
                        </div>
                        <div>•</div>
                        <div>Total: <strong className="text-white">${Number(booking.totalAmount).toFixed(2)}</strong></div>
                      </div>
                    </div>

                    {/* Right Column: Actions */}
                    <div className="flex flex-col sm:items-end gap-2 w-full sm:w-auto">
                      {!isCancelled && (
                        <>
                          {booking.canCancel ? (
                            <button
                              type="button"
                              onClick={() => setConfirmModalData(booking)}
                              disabled={cancellingId === booking.reservationId}
                              className="py-2.5 px-4 rounded-xl text-xs font-bold text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 transition flex items-center justify-center gap-1.5"
                            >
                              <XCircle className="w-4 h-4" />
                              <span>Cancel Reservation</span>
                            </button>
                          ) : (
                            <div className="text-[11px] text-slate-400 bg-[#070d18] border border-[#1a2639] px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-amber-400" />
                              <span>Within 48h (Contact Front Desk)</span>
                            </div>
                          )}
                        </>
                      )}

                      {isCancelled && (
                        <div className="text-xs text-slate-500 italic">
                          Reservation has been cancelled.
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </main>

      {/* Cancellation Confirmation Modal */}
      {confirmModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#0d1627] border border-rose-500/40 rounded-2xl p-6 sm:p-7 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-white mb-1">
                Cancel Reservation?
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Are you sure you want to cancel reservation{' '}
                <strong className="text-white">{confirmModalData.confirmationCode}</strong> for Room{' '}
                {confirmModalData.roomNumber}?
              </p>
              <div className="mt-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-400">
                ✓ Free Cancellation applies (more than 48 hours prior to check-in). A full refund or release will be processed immediately.
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmModalData(null)}
                className="py-2.5 px-4 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-[#0f1b2e] hover:bg-[#15233a] border border-[#1e2a40] transition"
              >
                Keep Reservation
              </button>

              <button
                type="button"
                onClick={handleConfirmCancel}
                className="py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 transition shadow-lg shadow-rose-600/30"
              >
                Yes, Cancel Reservation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
