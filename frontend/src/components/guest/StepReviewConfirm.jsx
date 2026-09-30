import React, { useState } from 'react';
import { calculateBillBreakdown } from '../../services/guestBookingService';
import { 
  ShieldCheck, CreditCard, Building2, Calendar, Users, 
  ArrowLeft, CheckCircle2, AlertCircle, FileText, Lock
} from 'lucide-react';

export function StepReviewConfirm({
  selectedRoom,
  searchCriteria,
  guestInfo,
  diningPerks,
  amenities,
  onConfirmBooking,
  onBack,
  isSubmitting
}) {
  const [paymentMethod, setPaymentMethod] = useState('PayAtHotel');
  const [agreedToTerms, setAgreedToTerms] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const bill = calculateBillBreakdown({
    baseRate: selectedRoom.baseRate,
    checkIn: searchCriteria.checkIn,
    checkOut: searchCriteria.checkOut,
    guests: searchCriteria.guests,
    diningPerks,
    amenities
  });

  const handleFinalSubmit = () => {
    if (!agreedToTerms) {
      setErrorMsg('Please agree to the hotel policy and cancellation terms before completing your reservation.');
      return;
    }
    setErrorMsg('');
    onConfirmBooking({ paymentMethod });
  };

  const totalGuests = (searchCriteria.guests?.adults || 1) + (searchCriteria.guests?.children || 0);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2">
          Review &amp; Confirm Your Reservation
        </h2>
        <p className="text-sm text-slate-400">
          Please review your stay details and billing summary before confirming.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Card: Stay & Guest Overview */}
        <div className="bg-[#0b1424] border border-[#1e2a40] rounded-2xl p-6 shadow-xl space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-[#182337]">
            <Building2 className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold text-white">Accommodations &amp; Guest</h3>
          </div>

          {/* Room Banner */}
          <div className="flex gap-4 items-center p-3.5 rounded-xl bg-[#070d18] border border-[#1a2639]">
            <img
              src={selectedRoom.image}
              alt="Room"
              className="w-20 h-20 rounded-lg object-cover border border-[#1e2a40]"
            />
            <div>
              <div className="text-xs uppercase font-bold text-emerald-400">Floor {selectedRoom.floor}</div>
              <div className="text-base font-bold text-white">Room {selectedRoom.roomNumber} • {selectedRoom.type}</div>
              <div className="text-xs text-slate-400">{selectedRoom.bed} • {selectedRoom.size}</div>
            </div>
          </div>

          {/* Stay Dates */}
          <div className="space-y-2 text-xs text-slate-300">
            <div className="flex items-center justify-between py-1.5 border-b border-[#152030]">
              <span className="flex items-center gap-1.5 text-slate-400">
                <Calendar className="w-3.5 h-3.5 text-emerald-400" /> Check-In
              </span>
              <strong className="text-white">{searchCriteria.checkIn} (From 3:00 PM)</strong>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-[#152030]">
              <span className="flex items-center gap-1.5 text-slate-400">
                <Calendar className="w-3.5 h-3.5 text-emerald-400" /> Check-Out
              </span>
              <strong className="text-white">{searchCriteria.checkOut} (Until 11:00 AM)</strong>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-[#152030]">
              <span className="flex items-center gap-1.5 text-slate-400">
                <Users className="w-3.5 h-3.5 text-emerald-400" /> Occupancy
              </span>
              <strong className="text-white">
                {totalGuests} Guests ({searchCriteria.guests?.adults} Adults, {searchCriteria.guests?.children} Children)
              </strong>
            </div>
          </div>

          {/* Guest Contact */}
          <div className="pt-2">
            <div className="text-xs uppercase font-semibold text-slate-400 mb-2">Registered Guest</div>
            <div className="bg-[#070d18] border border-[#1a2639] rounded-xl p-3.5 text-xs space-y-1">
              <div className="font-bold text-white text-sm">{guestInfo.firstName} {guestInfo.lastName}</div>
              <div className="text-slate-400">{guestInfo.email}</div>
              <div className="text-slate-400">{guestInfo.phone}</div>
              {guestInfo.specialRequests && (
                <div className="text-slate-300 italic pt-1 border-t border-[#152030] mt-2">
                  "{guestInfo.specialRequests}"
                </div>
              )}
            </div>
          </div>

          {/* Dining & Amenities list */}
          {(diningPerks?.length > 0 || amenities?.length > 0) && (
            <div className="pt-2">
              <div className="text-xs uppercase font-semibold text-slate-400 mb-2">Selected Add-Ons</div>
              <div className="bg-[#070d18] border border-[#1a2639] rounded-xl p-3.5 text-xs space-y-1 text-slate-300">
                {diningPerks?.map((d, i) => (
                  <div key={i} className="flex justify-between">
                    <span>{d.quantity}× {d.type} Dining Package</span>
                    <span className="text-emerald-400 font-semibold">+${d.quantity * (d.type === 'Breakfast' ? 7 : d.type === 'Lunch' ? 12 : 15)}</span>
                  </div>
                ))}
                {amenities?.map((a, i) => (
                  <div key={i} className="flex justify-between">
                    <span>{a}</span>
                    <span className="text-emerald-400 font-semibold">{a.includes('Surprise') ? '+$25' : 'Included'}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Card: Itemized Bill & Payment Selection */}
        <div className="bg-[#0b1424] border border-[#1e2a40] rounded-2xl p-6 shadow-xl space-y-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 pb-3 border-b border-[#182337] mb-4">
              <FileText className="w-5 h-5 text-emerald-400" />
              <h3 className="text-base font-bold text-white">Itemized Invoice Breakdown</h3>
            </div>

            {/* Calculations Table */}
            <div className="space-y-2 text-xs text-slate-300 mb-6">
              <div className="flex justify-between py-1 border-b border-[#152030]">
                <span>Room Base Rate ({bill.nights} nights @ ${selectedRoom.baseRate})</span>
                <span className="font-semibold text-white">${bill.roomTotal.toFixed(2)}</span>
              </div>

              {bill.extraGuestSurcharge > 0 && (
                <div className="flex justify-between py-1 border-b border-[#152030] text-amber-400">
                  <span>Extra Guest Surcharge ({bill.extraGuests} guest × $25 × {bill.nights}n)</span>
                  <span className="font-semibold">+${bill.extraGuestSurcharge.toFixed(2)}</span>
                </div>
              )}

              {bill.diningTotal > 0 && (
                <div className="flex justify-between py-1 border-b border-[#152030]">
                  <span>Dining Packages Subtotal</span>
                  <span className="font-semibold text-white">+${bill.diningTotal.toFixed(2)}</span>
                </div>
              )}

              {bill.amenitiesTotal > 0 && (
                <div className="flex justify-between py-1 border-b border-[#152030]">
                  <span>Sweet Surprise Welcome Pack</span>
                  <span className="font-semibold text-white">+${bill.amenitiesTotal.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between py-1.5 text-slate-400 font-medium">
                <span>Subtotal (Net Amount)</span>
                <span className="text-slate-200">${bill.subtotal.toFixed(2)}</span>
              </div>

              <div className="flex justify-between py-1.5 text-slate-400 font-medium">
                <span>Hospitality Occupancy Tax (Exact 7%)</span>
                <span className="text-slate-200">${bill.tax.toFixed(2)}</span>
              </div>

              <div className="flex justify-between items-baseline pt-3 border-t border-[#182337]">
                <div>
                  <div className="text-sm font-bold text-white">Total Amount Due</div>
                  <div className="text-[11px] text-slate-500">Guaranteed fixed price</div>
                </div>
                <div className="text-3xl font-black text-emerald-400">
                  ${bill.total.toFixed(2)}
                </div>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-3 mb-6">
              <label className="block text-xs uppercase font-semibold text-slate-300">
                Select Payment Preference
              </label>

              <div
                onClick={() => setPaymentMethod('PayAtHotel')}
                className={`p-3.5 rounded-xl border cursor-pointer transition flex items-center gap-3 ${
                  paymentMethod === 'PayAtHotel'
                    ? 'bg-emerald-500/10 border-emerald-500/60 ring-1 ring-emerald-500/30'
                    : 'bg-[#070d18] border-[#1a2639] hover:border-[#223554]'
                }`}
              >
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                  paymentMethod === 'PayAtHotel' ? 'border-emerald-400 bg-emerald-500' : 'border-slate-500'
                }`}>
                  {paymentMethod === 'PayAtHotel' && <div className="w-1.5 h-1.5 rounded-full bg-slate-950" />}
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">Pay at Front Desk upon Arrival</div>
                  <div className="text-xs text-slate-400">Cash or physical credit card accepted at check-in</div>
                </div>
              </div>

              <div
                onClick={() => setPaymentMethod('CreditCard')}
                className={`p-3.5 rounded-xl border cursor-pointer transition flex items-center gap-3 ${
                  paymentMethod === 'CreditCard'
                    ? 'bg-emerald-500/10 border-emerald-500/60 ring-1 ring-emerald-500/30'
                    : 'bg-[#070d18] border-[#1a2639] hover:border-[#223554]'
                }`}
              >
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                  paymentMethod === 'CreditCard' ? 'border-emerald-400 bg-emerald-500' : 'border-slate-500'
                }`}>
                  {paymentMethod === 'CreditCard' && <div className="w-1.5 h-1.5 rounded-full bg-slate-950" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-white">Instant Card Authorization</span>
                    <CreditCard className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-xs text-slate-400">Simulated instant approval • No immediate charge</div>
                </div>
              </div>
            </div>

            {/* Terms Checkbox */}
            <div className="bg-[#070d18] border border-[#1a2639] rounded-xl p-3 mb-4">
              <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-300 select-none">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-0.5 rounded border-[#1e2a40] text-emerald-500 focus:ring-0 bg-[#0b1424]"
                />
                <span>
                  I agree to the hotel policies. I understand that cancellation is 100% free up to 48 hours prior to check-in, after which room rates are non-refundable.
                </span>
              </label>
            </div>

            {errorMsg && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs mb-4">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-3">
            <button
              type="button"
              onClick={handleFinalSubmit}
              disabled={isSubmitting}
              className="w-full py-4 px-6 rounded-xl font-bold text-base text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 transition-all duration-200 shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>Securing Your Reservation...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Confirm &amp; Complete Reservation (${bill.total.toFixed(2)})</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onBack}
              disabled={isSubmitting}
              className="w-full py-2.5 text-xs text-slate-400 hover:text-white flex items-center justify-center gap-1.5 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Edit Guest Details</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
