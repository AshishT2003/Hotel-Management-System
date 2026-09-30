import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useHotel } from '../context/HotelContext';
import { guestBookingService } from '../services/guestBookingService';
import { guestProfileService } from '../services/guestProfileService';
import { GuestBookingWizard } from '../components/guest/GuestBookingWizard';
import { BookingConfirmationReceipt } from '../components/guest/BookingConfirmationReceipt';
import { 
  CalendarCheck, 
  BedDouble, 
  UtensilsCrossed, 
  Sparkles, 
  ShieldCheck, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  AlertTriangle, 
  Printer, 
  Plus, 
  XCircle, 
  Coffee, 
  Award, 
  User, 
  Phone, 
  Mail, 
  DollarSign, 
  ArrowRight
} from 'lucide-react';

function mapReservationToReceipt(res, currentUser) {
  if (!res) return null;
  const checkInFormatted = res.arrivalTime || res.checkInDate 
    ? new Date(res.arrivalTime || res.checkInDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ', 3:00 PM'
    : '30 Sep 2026, 3:00 PM';
  const checkOutFormatted = res.leavingTime || res.checkOutDate
    ? new Date(res.leavingTime || res.checkOutDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ', 11:00 AM'
    : '02 Oct 2026, 11:00 AM';

  const total = Number(res.totalBill || 381.99);
  const tax = Number((total - (total / 1.07)).toFixed(2));
  const subtotal = total - tax;
  const foodTotal = Number(res.foodBill || (res.breakfast ? res.breakfast * 7 : 0) + (res.lunch ? res.lunch * 12 : 0) + (res.dinner ? res.dinner * 15 : 0) || 34.0);
  const roomCharges = Number((subtotal - foodTotal).toFixed(2));

  return {
    confirmationCode: res.confirmationCode || `GH-${res.id || '1017'}-2026`,
    status: res.status || 'Reserved',
    issuedAt: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ', 10:49 AM',
    guest: {
      fullName: res.firstName ? `${res.firstName} ${res.lastName || ''}`.trim() : (currentUser?.name || 'Hotel Guest'),
      phone: res.phoneNumber || currentUser?.phone || 'N/A',
      email: res.emailAddress || currentUser?.email || 'N/A',
    },
    stay: {
      roomNumber: res.roomNumber || '102',
      roomType: res.roomType ? `${res.roomType} Suite` : 'Single Suite',
      floor: String(res.roomFloor || '1'),
      checkIn: checkInFormatted,
      checkOut: checkOutFormatted,
    },
    charges: [
      { label: 'Room Charges', amount: roomCharges > 0 ? roomCharges : 298.0 },
      { label: 'Dining Packages', amount: foodTotal > 0 ? foodTotal : 34.0 },
      ...(res.surprise ? [{ label: 'Sweet Surprise Amenity', amount: 25.0 }] : [{ label: 'Sweet Surprise Amenity', amount: 25.0 }]),
      { label: 'Hotel Occupancy Tax (7%)', amount: tax > 0 ? tax : 24.99 },
    ],
    currency: 'USD',
    totalAmount: total,
    cancellationPolicy: 'You may cancel this booking with a 100% full refund up to 48 hours before check-in.'
  };
}

export function GuestHubPage({ currentTab, onSelectTab }) {
  const { currentUser } = useAuth();
  const { reservations, updateReservationDining, addToast } = useHotel();
  const [guestBookings, setGuestBookings] = useState([]);
  const [guestProfile, setGuestProfile] = useState(null);
  const [activeReservation, setActiveReservation] = useState(null);
  const [isOrdering, setIsOrdering] = useState(false);
  const [isRequestingHousekeeping, setIsRequestingHousekeeping] = useState(false);
  const [viewingReceiptRes, setViewingReceiptRes] = useState(null);

  // Dining form state
  const [diningOrder, setDiningOrder] = useState({
    breakfast: 0,
    lunch: 0,
    dinner: 0,
    notes: ''
  });

  // Load guest bookings and profile
  useEffect(() => {
    const email = currentUser?.email || 'guest@grandhorizon.com';
    const username = currentUser?.username?.toLowerCase() || '';

    // Filter reservations for this guest
    const allRes = reservations || [];
    let matched = allRes.filter(r => 
      (r.emailAddress && r.emailAddress.toLowerCase() === email.toLowerCase()) ||
      (r.emailAddress && r.emailAddress.toLowerCase() === username) ||
      (username === 'guest') // for generic guest user, show all self-booked or guest-tagged reservations
    );

    // If generic guest and no bookings yet, show recent guest portal reservations
    if (matched.length === 0 && username === 'guest') {
      matched = allRes.slice(0, 3);
    }

    setGuestBookings(matched);
    const primary = matched.find(r => r.status !== 'Cancelled') || matched[0] || null;
    setActiveReservation(primary);

    // Fetch guest profile
    guestProfileService.getProfile(email).then(profile => {
      if (profile) {
        setGuestProfile(profile);
      } else {
        const nameParts = (currentUser?.name || '').trim().split(' ');
        const first = nameParts[0] || 'Valued';
        const last = nameParts.slice(1).join(' ') || 'Guest';
        setGuestProfile({
          firstName: first,
          lastName: last,
          email: email,
          phoneNumber: currentUser?.phone || '',
          tierStatus: 'Gold',
          loyaltyPoints: 1200 + (matched.length * 350),
          totalNights: matched.length > 0 ? matched.length * 2 : 2,
          preferences: {
            pillow: 'Hypoallergenic Goose Feather',
            floorPreference: 'High Floor (4 or 5)',
            roomView: 'Skyline Panorama'
          }
        });
      }
    });
  }, [currentUser, reservations]);

  // Handle room service dining order
  const handlePlaceDiningOrder = (e) => {
    e.preventDefault();
    if (!activeReservation) {
      addToast('No active reservation found to deliver room service.', 'error');
      return;
    }

    const { breakfast, lunch, dinner } = diningOrder;
    if (breakfast === 0 && lunch === 0 && dinner === 0) {
      addToast('Please select at least one meal to order.', 'warning');
      return;
    }

    setIsOrdering(true);
    setTimeout(() => {
      const addedCost = (breakfast * 7) + (lunch * 12) + (dinner * 15);
      
      // Update in HotelContext
      if (updateReservationDining) {
        updateReservationDining(activeReservation.id, {
          breakfast: (activeReservation.breakfast || 0) + Number(breakfast),
          lunch: (activeReservation.lunch || 0) + Number(lunch),
          dinner: (activeReservation.dinner || 0) + Number(dinner),
          supplyStatus: false // Kitchen queue picks this up
        });
      }

      addToast(`Room service order sent to Executive Kitchen for Room ${activeReservation.roomNumber}!`, 'success');
      setDiningOrder({ breakfast: 0, lunch: 0, dinner: 0, notes: '' });
      setIsOrdering(false);
    }, 600);
  };

  // Handle housekeeping request
  const handleRequestHousekeeping = (serviceType) => {
    if (!activeReservation) {
      addToast('No active room reservation found.', 'error');
      return;
    }

    setIsRequestingHousekeeping(true);
    setTimeout(() => {
      addToast(`${serviceType} has been requested for Room ${activeReservation.roomNumber}. Our attendant will arrive shortly!`, 'success');
      setIsRequestingHousekeeping(false);
    }, 500);
  };

  // Handle booking cancellation
  const handleCancelReservation = async (resId) => {
    if (!window.confirm('Are you sure you want to cancel this reservation? Full refund applies if more than 48 hours before check-in.')) {
      return;
    }
    try {
      await guestBookingService.cancelBooking(resId, currentUser?.email || 'guest@grandhorizon.com');
      addToast('Reservation was successfully cancelled.', 'success');
      // Refresh local list
      setGuestBookings(prev => prev.map(r => r.id === resId ? { ...r, status: 'Cancelled' } : r));
    } catch (err) {
      addToast(err.message || 'Failed to cancel reservation.', 'error');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Guest Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-[#1e2a40] bg-gradient-to-r from-[#0d1627] via-[#091120] to-[#0a1526] p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <Award className="w-3.5 h-3.5" />
              <span>{guestProfile?.tierStatus || 'Gold'} VIP Guest</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Welcome, {currentUser?.name || 'Valued Guest'}
            </h1>
            <p className="text-sm text-slate-400 max-w-xl">
              Manage your luxury stays, order in-room dining, request amenities, and view your itemized folios.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            <div className="p-3.5 rounded-2xl bg-[#070b13]/80 border border-[#1a2639] text-center min-w-[90px]">
              <div className="text-xs text-slate-400 font-medium">Stays</div>
              <div className="text-xl font-black text-white mt-0.5">{guestBookings.length}</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-[#070b13]/80 border border-[#1a2639] text-center min-w-[100px]">
              <div className="text-xs text-slate-400 font-medium">VIP Tier</div>
              <div className="text-xl font-black text-emerald-400 mt-0.5">{guestProfile?.tierStatus || 'Gold'}</div>
            </div>
            <button
              type="button"
              onClick={() => onSelectTab('book-room')}
              className="py-3 px-5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-emerald-500/25 flex items-center gap-2 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Book New Stay</span>
            </button>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* MODULE 1: MY BOOKINGS & STAYS                           */}
      {/* ======================================================== */}
      {currentTab === 'my-bookings' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                <CalendarCheck className="w-5 h-5 text-emerald-400" />
                <span>My Reservations &amp; Folios</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Review your reserved rooms, check-in schedules, and financial breakdown.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onSelectTab('book-room')}
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1.5 transition"
            >
              <span>Book Another Room</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {guestBookings.length === 0 ? (
            <div className="rounded-3xl border border-[#1e2a40] bg-[#0b1424] p-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
                <BedDouble className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-white">No Active Reservations Found</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                You do not have any room bookings on file under this account yet. Reserve your first stay in seconds!
              </p>
              <button
                type="button"
                onClick={() => onSelectTab('book-room')}
                className="py-2.5 px-6 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Book a Luxury Room Now</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {guestBookings.map((res) => {
                const isCancelled = res.status === 'Cancelled';
                const checkInDate = new Date(res.arrivalTime || res.checkInDate || Date.now()).toLocaleDateString('en-US', {
                  month: 'short', day: 'numeric', year: 'numeric'
                });
                const checkOutDate = new Date(res.leavingTime || res.checkOutDate || Date.now()).toLocaleDateString('en-US', {
                  month: 'short', day: 'numeric', year: 'numeric'
                });

                return (
                  <div
                    key={res.id}
                    className={`rounded-2xl border p-6 sm:p-7 transition-all ${
                      isCancelled
                        ? 'border-rose-950/60 bg-[#090d15] opacity-75'
                        : 'border-[#1e2a40] bg-[#0b1424] hover:border-emerald-500/40 shadow-xl'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-[#182337] gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-black text-lg">
                          {res.roomNumber}
                        </div>
                        <div>
                          <div className="text-base font-bold text-white flex items-center gap-2">
                            <span>Room {res.roomNumber} — {res.roomType} Tier</span>
                            {res.roomFloor && (
                              <span className="text-[10px] uppercase font-bold text-slate-400 bg-[#141e30] px-2 py-0.5 rounded">
                                Floor {res.roomFloor}
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-400 font-mono mt-0.5">
                            Code: <span className="text-white font-semibold">{res.confirmationCode || `GH-${res.id}-2026`}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase ${
                            isCancelled
                              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                              : res.checkIn
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                              : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                          }`}
                        >
                          {isCancelled ? 'Cancelled' : res.checkIn ? 'In-House (Checked In)' : 'Reserved'}
                        </span>
                      </div>
                    </div>

                    {/* Stay & Billing Details */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-5 border-b border-[#182337] text-xs">
                      <div>
                        <span className="text-slate-500 block font-medium">Check-In Date</span>
                        <span className="text-slate-200 font-semibold mt-0.5 block">{checkInDate}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block font-medium">Check-Out Date</span>
                        <span className="text-slate-200 font-semibold mt-0.5 block">{checkOutDate}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block font-medium">Total Invoiced (Inc 7% Tax)</span>
                        <span className="text-emerald-400 font-bold text-sm mt-0.5 block font-mono">
                          ${Number(res.totalBill || 0).toFixed(2)}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block font-medium">Payment Method</span>
                        <span className="text-slate-200 font-semibold mt-0.5 block capitalize">
                          {res.paymentType || 'Pay at Hotel'}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-4 gap-3 flex-wrap">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setViewingReceiptRes(res)}
                          className="py-2 px-3.5 rounded-xl bg-[#0f1b2e] hover:bg-[#16253c] text-slate-300 border border-[#1e2a40] text-xs font-semibold flex items-center gap-1.5 transition"
                        >
                          <Printer className="w-3.5 h-3.5 text-slate-400" />
                          <span>Print Voucher</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onSelectTab('guest-dining')}
                          className="py-2 px-3.5 rounded-xl bg-[#0f1b2e] hover:bg-[#16253c] text-emerald-400 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1.5 transition"
                        >
                          <UtensilsCrossed className="w-3.5 h-3.5" />
                          <span>Order Room Service</span>
                        </button>
                      </div>

                      {!isCancelled && (
                        <button
                          type="button"
                          onClick={() => handleCancelReservation(res.id)}
                          className="py-2 px-3.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-semibold flex items-center gap-1.5 transition"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Cancel Stay (Free 48h)</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* MODULE 2: BOOK A ROOM / NEW STAY                        */}
      {/* ======================================================== */}
      {currentTab === 'book-room' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                <BedDouble className="w-5 h-5 text-emerald-400" />
                <span>Book a Luxury Room</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Reserve additional rooms with direct guaranteed member rates.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onSelectTab('my-bookings')}
              className="text-xs font-semibold text-slate-400 hover:text-white transition"
            >
              Back to My Bookings
            </button>
          </div>

          <div className="bg-[#0b1424] border border-[#1e2a40] rounded-3xl p-6 sm:p-8 shadow-xl">
            <GuestBookingWizard
              onNavigateToDashboard={() => onSelectTab('my-bookings')}
              onNavigateToLogin={() => onSelectTab('my-bookings')}
            />
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODULE 3: DINING & ROOM SERVICE                         */}
      {/* ======================================================== */}
      {currentTab === 'guest-dining' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <UtensilsCrossed className="w-5 h-5 text-emerald-400" />
              <span>In-Room Dining &amp; Culinary Orders</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Order gourmet meals prepared fresh by our Executive Chef and delivered to your room.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Dining Menu Cards */}
            <div className="lg:col-span-2 space-y-4">
              <div className="p-5 rounded-2xl border border-[#1e2a40] bg-[#0b1424] flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                    <Coffee className="w-7 h-7" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Artisan Continental Breakfast</h4>
                    <p className="text-xs text-slate-400 mt-0.5">Warm croissants, fresh farm eggs, artisan preserves, and Colombian roast.</p>
                    <span className="text-emerald-400 font-mono font-bold text-sm mt-1 inline-block">$7.00 per guest</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setDiningOrder(p => ({ ...p, breakfast: Math.max(0, p.breakfast - 1) }))}
                    className="w-8 h-8 rounded-lg bg-[#0f1a2e] border border-[#1e2a40] text-slate-200 font-bold hover:bg-[#16253c]"
                  >
                    -
                  </button>
                  <span className="w-6 text-center text-sm font-bold text-white">{diningOrder.breakfast}</span>
                  <button
                    type="button"
                    onClick={() => setDiningOrder(p => ({ ...p, breakfast: p.breakfast + 1 }))}
                    className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-bold hover:bg-emerald-500/30"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="p-5 rounded-2xl border border-[#1e2a40] bg-[#0b1424] flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                    <UtensilsCrossed className="w-7 h-7" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Executive Club Lunch</h4>
                    <p className="text-xs text-slate-400 mt-0.5">Smoked turkey club on toasted brioche, truffle parmesan frites, and green salad.</p>
                    <span className="text-emerald-400 font-mono font-bold text-sm mt-1 inline-block">$12.00 per guest</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setDiningOrder(p => ({ ...p, lunch: Math.max(0, p.lunch - 1) }))}
                    className="w-8 h-8 rounded-lg bg-[#0f1a2e] border border-[#1e2a40] text-slate-200 font-bold hover:bg-[#16253c]"
                  >
                    -
                  </button>
                  <span className="w-6 text-center text-sm font-bold text-white">{diningOrder.lunch}</span>
                  <button
                    type="button"
                    onClick={() => setDiningOrder(p => ({ ...p, lunch: p.lunch + 1 }))}
                    className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-bold hover:bg-emerald-500/30"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="p-5 rounded-2xl border border-[#1e2a40] bg-[#0b1424] flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
                    <Sparkles className="w-7 h-7" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Chef's Gourmet Dinner</h4>
                    <p className="text-xs text-slate-400 mt-0.5">Seared Atlantic salmon or prime rib with roasted asparagus and molten chocolate torte.</p>
                    <span className="text-emerald-400 font-mono font-bold text-sm mt-1 inline-block">$15.00 per guest</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setDiningOrder(p => ({ ...p, dinner: Math.max(0, p.dinner - 1) }))}
                    className="w-8 h-8 rounded-lg bg-[#0f1a2e] border border-[#1e2a40] text-slate-200 font-bold hover:bg-[#16253c]"
                  >
                    -
                  </button>
                  <span className="w-6 text-center text-sm font-bold text-white">{diningOrder.dinner}</span>
                  <button
                    type="button"
                    onClick={() => setDiningOrder(p => ({ ...p, dinner: p.dinner + 1 }))}
                    className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-bold hover:bg-emerald-500/30"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Room Service Order Summary */}
            <div className="rounded-3xl border border-[#1e2a40] bg-[#0b1424] p-6 shadow-xl flex flex-col justify-between space-y-6">
              <div>
                <h3 className="text-base font-bold text-white pb-3 border-b border-[#182337]">
                  Delivery Summary
                </h3>
                <div className="py-4 space-y-3 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Delivering To Room:</span>
                    <strong className="text-emerald-400 font-bold text-sm">
                      {activeReservation ? `Room ${activeReservation.roomNumber}` : 'Select Room'}
                    </strong>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Breakfast ({diningOrder.breakfast}x):</span>
                    <span className="text-white font-mono">${(diningOrder.breakfast * 7).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Lunch ({diningOrder.lunch}x):</span>
                    <span className="text-white font-mono">${(diningOrder.lunch * 12).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Dinner ({diningOrder.dinner}x):</span>
                    <span className="text-white font-mono">${(diningOrder.dinner * 15).toFixed(2)}</span>
                  </div>
                  <div className="pt-3 border-t border-[#182337] flex justify-between font-bold text-sm text-white">
                    <span>Order Total:</span>
                    <span className="text-emerald-400 font-mono">
                      ${((diningOrder.breakfast * 7) + (diningOrder.lunch * 12) + (diningOrder.dinner * 15)).toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Special Preparation Notes
                  </label>
                  <input
                    type="text"
                    value={diningOrder.notes}
                    onChange={(e) => setDiningOrder(p => ({ ...p, notes: e.target.value }))}
                    placeholder="e.g. Extra napkins, dressing on side..."
                    className="w-full h-10 px-3 rounded-xl bg-[#070b13] border border-[#1e2a40] text-xs text-white placeholder-slate-600 outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handlePlaceDiningOrder}
                disabled={isOrdering || (diningOrder.breakfast === 0 && diningOrder.lunch === 0 && diningOrder.dinner === 0)}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 disabled:opacity-50 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/20 transition flex items-center justify-center gap-2"
              >
                {isOrdering ? 'Dispatching to Kitchen...' : 'Send Order to Kitchen'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODULE 4: HOUSEKEEPING & AMENITIES                      */}
      {/* ======================================================== */}
      {currentTab === 'guest-housekeeping' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              <span>Housekeeping &amp; Luxury Amenities</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Request room refreshment, fresh linens, and special VIP amenities at your convenience.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl border border-[#1e2a40] bg-[#0b1424] flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h4 className="text-base font-bold text-white">Daily Turndown &amp; Cleaning</h4>
                <p className="text-xs text-slate-400">
                  Full room vacuuming, bed making, surface sanitization, and room fragrance.
                </p>
                <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40 inline-block">
                  Complimentary
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleRequestHousekeeping('Turndown & Cleaning')}
                className="py-2.5 px-4 rounded-xl bg-[#0f1b2e] hover:bg-[#16253c] text-white border border-[#1e2a40] text-xs font-semibold transition"
              >
                Request Cleaning
              </button>
            </div>

            <div className="p-6 rounded-2xl border border-[#1e2a40] bg-[#0b1424] flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
                  <BedDouble className="w-5 h-5" />
                </div>
                <h4 className="text-base font-bold text-white">Fresh Egyptian Towels</h4>
                <p className="text-xs text-slate-400">
                  Set of 4 plush bath towels, hand towels, and luxury bath sheets delivered to your door.
                </p>
                <span className="text-[11px] font-bold text-teal-400 uppercase tracking-wider bg-teal-950/60 px-2 py-0.5 rounded border border-teal-800/40 inline-block">
                  Complimentary
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleRequestHousekeeping('Fresh Egyptian Towels')}
                className="py-2.5 px-4 rounded-xl bg-[#0f1b2e] hover:bg-[#16253c] text-white border border-[#1e2a40] text-xs font-semibold transition"
              >
                Request Towels
              </button>
            </div>

            <div className="p-6 rounded-2xl border border-[#1e2a40] bg-[#0b1424] flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Award className="w-5 h-5" />
                </div>
                <h4 className="text-base font-bold text-white">Sweet Surprise VIP Package</h4>
                <p className="text-xs text-slate-400">
                  Artisan chocolate truffles, seasonal berry basket, and champagne presentation.
                </p>
                <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/40 inline-block">
                  $25.00 Invoiced
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleRequestHousekeeping('Sweet Surprise VIP Package')}
                className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs transition"
              >
                Order Surprise Package
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODULE 5: VIP PROFILE & FOLIO                           */}
      {/* ======================================================== */}
      {currentTab === 'guest-profile' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span>Guest 360° VIP Loyalty Profile</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Your verified hotel membership tier, personal hospitality preferences, and folio history.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-3xl border border-[#1e2a40] bg-[#0b1424] p-6 space-y-4 shadow-xl">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-black text-2xl mx-auto shadow-lg shadow-emerald-500/20">
                {currentUser?.name?.trim() ? currentUser.name.trim().charAt(0).toUpperCase() : 'G'}
              </div>
              <div className="text-center">
                <h3 className="text-lg font-bold text-white">{currentUser?.name || 'Valued Guest'}</h3>
                <p className="text-xs text-slate-400 mt-0.5">{currentUser?.email || (currentUser?.username?.includes('@') ? currentUser.username : 'guest@maharajahotel.com')}</p>
                <span className="mt-2 inline-block px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  {guestProfile?.tierStatus || 'Gold'} VIP Tier
                </span>
              </div>

              <div className="pt-4 border-t border-[#182337] space-y-2 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Loyalty Points:</span>
                  <span className="font-bold text-emerald-400">{guestProfile?.loyaltyPoints || 3450} pts</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Completed Stays:</span>
                  <span className="font-bold text-white">{guestBookings.length} stays</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Night Total:</span>
                  <span className="font-bold text-white">{guestProfile?.totalNights || 8} nights</span>
                </div>
              </div>
            </div>

            <div className="md:col-span-2 rounded-3xl border border-[#1e2a40] bg-[#0b1424] p-6 space-y-6 shadow-xl">
              <div>
                <h4 className="text-sm font-bold text-white pb-3 border-b border-[#182337]">
                  Curated Hospitality Preferences
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 text-xs">
                  <div className="p-3.5 rounded-xl bg-[#070b13] border border-[#182337]">
                    <span className="text-slate-500 block font-medium">Pillow Preference</span>
                    <span className="text-white font-semibold mt-0.5 block">
                      {guestProfile?.preferences?.pillow || 'Hypoallergenic Goose Feather'}
                    </span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[#070b13] border border-[#182337]">
                    <span className="text-slate-500 block font-medium">Floor Preference</span>
                    <span className="text-white font-semibold mt-0.5 block">
                      {guestProfile?.preferences?.floorPreference || 'High Floor (4 or 5)'}
                    </span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[#070b13] border border-[#182337]">
                    <span className="text-slate-500 block font-medium">Room View</span>
                    <span className="text-white font-semibold mt-0.5 block">
                      {guestProfile?.preferences?.roomView || 'Skyline Panorama'}
                    </span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[#070b13] border border-[#182337]">
                    <span className="text-slate-500 block font-medium">Dietary Request</span>
                    <span className="text-white font-semibold mt-0.5 block">
                      {guestProfile?.preferences?.dietary || 'Low Sodium, Gluten-Free'}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold text-white pb-3 border-b border-[#182337]">
                  VIP Membership Privileges Unlocked
                </h4>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 text-xs text-slate-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Guaranteed Direct Direct Rates</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Complimentary High-Speed WiFi</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Free Cancellation up to 48 Hours</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Priority Room Service Prep</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Printable Executive Receipt Modal */}
      {viewingReceiptRes && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 print:p-0 print:static print:bg-transparent">
          <div className="relative w-full max-w-4xl bg-transparent print:max-w-none">
            <div className="flex justify-end mb-3 print:hidden">
              <button
                type="button"
                onClick={() => setViewingReceiptRes(null)}
                className="py-1.5 px-4 rounded-xl bg-[#0f1b2e] hover:bg-[#16253c] text-white border border-[#1e2a40] text-xs font-semibold shadow-lg"
              >
                ✕ Close Preview
              </button>
            </div>
            <BookingConfirmationReceipt
              reservation={mapReservationToReceipt(viewingReceiptRes, currentUser)}
              onReset={() => setViewingReceiptRes(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default GuestHubPage;
