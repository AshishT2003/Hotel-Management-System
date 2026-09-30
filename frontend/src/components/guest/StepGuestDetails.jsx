import React, { useState } from 'react';
import { validateGuestDetails } from '../../utils/bookingValidator';
import { calculateBillBreakdown } from '../../services/guestBookingService';
import { 
  User, Mail, Phone, MessageSquare, Utensils, Gift, Sparkles, 
  ArrowLeft, ArrowRight, Minus, Plus, ShieldCheck, Check,
  Lock, Eye, EyeOff
} from 'lucide-react';

export function StepGuestDetails({
  selectedRoom,
  searchCriteria,
  guestInfo,
  diningPerks,
  amenities,
  onUpdateGuestInfo,
  onUpdateDiningPerks,
  onUpdateAmenities,
  onProceed,
  onBack
}) {
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  // Calculate live breakdown
  const bill = calculateBillBreakdown({
    baseRate: selectedRoom.baseRate,
    checkIn: searchCriteria.checkIn,
    checkOut: searchCriteria.checkOut,
    guests: searchCriteria.guests,
    diningPerks,
    amenities
  });

  const handleMealChange = (type, delta) => {
    const currentList = Array.isArray(diningPerks) ? [...diningPerks] : [];
    const itemIndex = currentList.findIndex(d => d.type.toLowerCase() === type.toLowerCase());
    
    if (itemIndex > -1) {
      const currentQty = currentList[itemIndex].quantity;
      const newQty = Math.max(0, currentQty + delta);
      if (newQty === 0) {
        currentList.splice(itemIndex, 1);
      } else {
        currentList[itemIndex] = { ...currentList[itemIndex], quantity: newQty };
      }
    } else if (delta > 0) {
      currentList.push({
        type,
        quantity: 1,
        price: type === 'Breakfast' ? 7 : type === 'Lunch' ? 12 : 15
      });
    }

    onUpdateDiningPerks(currentList);
  };

  const getMealQty = (type) => {
    const found = diningPerks?.find(d => d.type?.toLowerCase() === type.toLowerCase());
    return found?.quantity || 0;
  };

  const handleAmenityToggle = (amenityName) => {
    const current = Array.isArray(amenities) ? [...amenities] : [];
    const exists = current.includes(amenityName);
    if (exists) {
      onUpdateAmenities(current.filter(a => a !== amenityName));
    } else {
      onUpdateAmenities([...current, amenityName]);
    }
  };

  const hasAmenity = (name) => {
    return Array.isArray(amenities) && amenities.includes(name);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const val = validateGuestDetails(guestInfo);
    if (!val.isValid) {
      setErrors(val.errors);
      return;
    }
    setErrors({});
    onProceed();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left 2 Columns: Guest Info & Upsells */}
      <div className="lg:col-span-2 space-y-6">
        {/* Contact Information Card */}
        <div className="bg-[#0b1424] border border-[#1e2a40] rounded-2xl p-6 sm:p-7 shadow-xl shadow-black/40">
          <div className="flex items-center gap-2 mb-4">
            <User className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-bold text-white tracking-tight">
              Primary Guest Contact Information
            </h2>
          </div>
          <p className="text-xs text-slate-400 mb-6">
            We will send your instant booking confirmation code and invoice directly to this email address.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* First Name */}
            <div>
              <label className="block text-xs uppercase font-medium text-slate-300 mb-1.5">
                First Name <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={guestInfo.firstName || ''}
                onChange={(e) => {
                  onUpdateGuestInfo({ ...guestInfo, firstName: e.target.value });
                  setErrors((prev) => ({ ...prev, firstName: null }));
                }}
                placeholder="Eleanor"
                className={`w-full bg-[#070d18] border ${
                  errors.firstName ? 'border-rose-500 ring-1 ring-rose-500' : 'border-[#1e2a40] focus:border-emerald-500'
                } text-white text-sm rounded-xl px-4 py-3 focus:outline-none transition`}
              />
              {errors.firstName && <p className="text-xs text-rose-400 mt-1">{errors.firstName}</p>}
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-xs uppercase font-medium text-slate-300 mb-1.5">
                Last Name <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={guestInfo.lastName || ''}
                onChange={(e) => {
                  onUpdateGuestInfo({ ...guestInfo, lastName: e.target.value });
                  setErrors((prev) => ({ ...prev, lastName: null }));
                }}
                placeholder="Vance"
                className={`w-full bg-[#070d18] border ${
                  errors.lastName ? 'border-rose-500 ring-1 ring-rose-500' : 'border-[#1e2a40] focus:border-emerald-500'
                } text-white text-sm rounded-xl px-4 py-3 focus:outline-none transition`}
              />
              {errors.lastName && <p className="text-xs text-rose-400 mt-1">{errors.lastName}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs uppercase font-medium text-slate-300 mb-1.5">
                Email Address <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={guestInfo.email || ''}
                  onChange={(e) => {
                    onUpdateGuestInfo({ ...guestInfo, email: e.target.value });
                    setErrors((prev) => ({ ...prev, email: null }));
                  }}
                  placeholder="eleanor.vance@example.com"
                  className={`w-full bg-[#070d18] border ${
                    errors.email ? 'border-rose-500 ring-1 ring-rose-500' : 'border-[#1e2a40] focus:border-emerald-500'
                  } text-white text-sm rounded-xl px-4 py-3 pl-10 focus:outline-none transition`}
                />
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              </div>
              {errors.email && <p className="text-xs text-rose-400 mt-1">{errors.email}</p>}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs uppercase font-medium text-slate-300 mb-1.5">
                Phone Number <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <input
                  type="tel"
                  value={guestInfo.phone || ''}
                  onChange={(e) => {
                    onUpdateGuestInfo({ ...guestInfo, phone: e.target.value });
                    setErrors((prev) => ({ ...prev, phone: null }));
                  }}
                  placeholder="+1 (555) 019-2834"
                  className={`w-full bg-[#070d18] border ${
                    errors.phone ? 'border-rose-500 ring-1 ring-rose-500' : 'border-[#1e2a40] focus:border-emerald-500'
                  } text-white text-sm rounded-xl px-4 py-3 pl-10 focus:outline-none transition`}
                />
                <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              </div>
              {errors.phone && <p className="text-xs text-rose-400 mt-1">{errors.phone}</p>}
            </div>

            {/* Create Portal Password */}
            <div className="sm:col-span-2">
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs uppercase font-medium text-slate-300">
                  Create Portal Password <span className="text-rose-400">*</span>
                </label>
                <span className="text-[11px] text-emerald-400 font-medium">
                  Direct Guest Sign In
                </span>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={guestInfo.password || ''}
                  onChange={(e) => {
                    onUpdateGuestInfo({ ...guestInfo, password: e.target.value });
                    setErrors((prev) => ({ ...prev, password: null }));
                  }}
                  placeholder="Set your password (minimum 4 characters)"
                  className={`w-full bg-[#070d18] border ${
                    errors.password ? 'border-rose-500 ring-1 ring-rose-500' : 'border-[#1e2a40] focus:border-emerald-500'
                  } text-white text-sm rounded-xl px-4 py-3 pl-10 pr-10 focus:outline-none transition`}
                />
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-200 transition"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password ? (
                <p className="text-xs text-rose-400 mt-1">{errors.password}</p>
              ) : (
                <p className="text-[11px] text-slate-400 mt-1.5">
                  Use this password with your email to sign in directly, manage your room, order dining, and view folios.
                </p>
              )}
            </div>
          </div>

          {/* Special Requests */}
          <div className="mt-4">
            <label className="block text-xs uppercase font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
              <span>Special Requests &amp; Arrival Preferences (Optional)</span>
            </label>
            <textarea
              rows={2}
              value={guestInfo.specialRequests || ''}
              onChange={(e) => onUpdateGuestInfo({ ...guestInfo, specialRequests: e.target.value })}
              placeholder="e.g. Quiet room preferred, high floor, allergy to down pillows..."
              className="w-full bg-[#070d18] border border-[#1e2a40] focus:border-emerald-500 text-white text-sm rounded-xl p-3 focus:outline-none transition resize-none"
            />
          </div>
        </div>

        {/* Dining Add-Ons */}
        <div className="bg-[#0b1424] border border-[#1e2a40] rounded-2xl p-6 sm:p-7 shadow-xl shadow-black/40">
          <div className="flex items-center gap-2 mb-2">
            <Utensils className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold text-white tracking-tight">
              Culinary Dining Packages
            </h2>
          </div>
          <p className="text-xs text-slate-400 mb-5">
            Add gourmet meals prepared fresh daily by MAHARAJA Hotel Executive Chefs. Orders sync directly with our live kitchen line.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Breakfast */}
            <div className="bg-[#070d18] border border-[#1a2639] rounded-xl p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-bold text-white">Artisan Breakfast</span>
                  <span className="text-xs font-semibold text-emerald-400">$7 / meal</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed mb-4">
                  Fresh pastries, cage-free eggs, espresso, and organic cold-pressed juices.
                </p>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-[#152030]">
                <span className="text-xs text-slate-300">Portions:</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleMealChange('Breakfast', -1)}
                    disabled={getMealQty('Breakfast') <= 0}
                    className="w-7 h-7 rounded-lg bg-[#142034] text-slate-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-5 text-center font-bold text-white text-xs">{getMealQty('Breakfast')}</span>
                  <button
                    type="button"
                    onClick={() => handleMealChange('Breakfast', 1)}
                    className="w-7 h-7 rounded-lg bg-[#142034] text-slate-300 hover:text-white flex items-center justify-center transition"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>

            {/* Lunch */}
            <div className="bg-[#070d18] border border-[#1a2639] rounded-xl p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-bold text-white">Executive Lunch</span>
                  <span className="text-xs font-semibold text-emerald-400">$12 / meal</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed mb-4">
                  Mediterranean bowls, artisan paninis, fresh soups, and seasonal salads.
                </p>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-[#152030]">
                <span className="text-xs text-slate-300">Portions:</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleMealChange('Lunch', -1)}
                    disabled={getMealQty('Lunch') <= 0}
                    className="w-7 h-7 rounded-lg bg-[#142034] text-slate-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-5 text-center font-bold text-white text-xs">{getMealQty('Lunch')}</span>
                  <button
                    type="button"
                    onClick={() => handleMealChange('Lunch', 1)}
                    className="w-7 h-7 rounded-lg bg-[#142034] text-slate-300 hover:text-white flex items-center justify-center transition"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>

            {/* Dinner */}
            <div className="bg-[#070d18] border border-[#1a2639] rounded-xl p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-bold text-white">Chef's Dinner</span>
                  <span className="text-xs font-semibold text-emerald-400">$15 / meal</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed mb-4">
                  3-course chef creation, prime cuts, handmade pasta, and decadent dessert.
                </p>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-[#152030]">
                <span className="text-xs text-slate-300">Portions:</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleMealChange('Dinner', -1)}
                    disabled={getMealQty('Dinner') <= 0}
                    className="w-7 h-7 rounded-lg bg-[#142034] text-slate-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-5 text-center font-bold text-white text-xs">{getMealQty('Dinner')}</span>
                  <button
                    type="button"
                    onClick={() => handleMealChange('Dinner', 1)}
                    className="w-7 h-7 rounded-lg bg-[#142034] text-slate-300 hover:text-white flex items-center justify-center transition"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Exclusive Amenities & Perks */}
        <div className="bg-[#0b1424] border border-[#1e2a40] rounded-2xl p-6 sm:p-7 shadow-xl shadow-black/40">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-bold text-white tracking-tight">
              Hospitality Amenities &amp; Upsell Perks
            </h2>
          </div>
          <p className="text-xs text-slate-400 mb-5">
            Select personalized room service preparations before arrival.
          </p>

          <div className="space-y-3">
            {/* Daily Housekeeping (Free) */}
            <div
              onClick={() => handleAmenityToggle('Daily Housekeeping')}
              className={`p-4 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                hasAmenity('Daily Housekeeping')
                  ? 'bg-emerald-500/10 border-emerald-500/50'
                  : 'bg-[#070d18] border-[#1a2639] hover:border-[#223554]'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-md flex items-center justify-center border ${
                  hasAmenity('Daily Housekeeping') ? 'bg-emerald-500 border-emerald-400 text-slate-950' : 'border-slate-600'
                }`}>
                  {hasAmenity('Daily Housekeeping') && <Check className="w-4 h-4 stroke-[3]" />}
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">Daily Housekeeping &amp; Turndown</div>
                  <div className="text-xs text-slate-400">Fresh linens and afternoon room refresh</div>
                </div>
              </div>
              <span className="text-xs font-semibold text-emerald-400">Complimentary</span>
            </div>

            {/* Fresh Luxury Towels (Free) */}
            <div
              onClick={() => handleAmenityToggle('Fresh Luxury Towels')}
              className={`p-4 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                hasAmenity('Fresh Luxury Towels')
                  ? 'bg-emerald-500/10 border-emerald-500/50'
                  : 'bg-[#070d18] border-[#1a2639] hover:border-[#223554]'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-md flex items-center justify-center border ${
                  hasAmenity('Fresh Luxury Towels') ? 'bg-emerald-500 border-emerald-400 text-slate-950' : 'border-slate-600'
                }`}>
                  {hasAmenity('Fresh Luxury Towels') && <Check className="w-4 h-4 stroke-[3]" />}
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">Extra Plush Egyptian Towel Set</div>
                  <div className="text-xs text-slate-400">Extra bath towels and premium velour robes</div>
                </div>
              </div>
              <span className="text-xs font-semibold text-emerald-400">Complimentary</span>
            </div>

            {/* Sweet Surprise ($25) */}
            <div
              onClick={() => handleAmenityToggle('Sweet Surprise Pack')}
              className={`p-4 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                hasAmenity('Sweet Surprise Pack')
                  ? 'bg-amber-500/10 border-amber-500/50'
                  : 'bg-[#070d18] border-[#1a2639] hover:border-[#223554]'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-md flex items-center justify-center border ${
                  hasAmenity('Sweet Surprise Pack') ? 'bg-amber-500 border-amber-400 text-slate-950' : 'border-slate-600'
                }`}>
                  {hasAmenity('Sweet Surprise Pack') && <Check className="w-4 h-4 stroke-[3]" />}
                </div>
                <div className="flex items-center gap-2">
                  <Gift className="w-4 h-4 text-amber-400" />
                  <div>
                    <div className="text-sm font-semibold text-white">Sweet Surprise Welcome Amenity</div>
                    <div className="text-xs text-slate-400">Belgian artisan chocolates, orchard fruit basket, &amp; chilled sparkling cider</div>
                  </div>
                </div>
              </div>
              <span className="text-xs font-bold text-amber-400">+$25 One-Time</span>
            </div>
          </div>
        </div>

        {/* Back and Continue Buttons */}
        <div className="flex items-center justify-between pt-4">
          <button
            type="button"
            onClick={onBack}
            className="py-3 px-5 rounded-xl font-semibold text-xs sm:text-sm text-slate-300 hover:text-white bg-[#0f1b2e] hover:bg-[#15233a] border border-[#1e2a40] flex items-center gap-2 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Room Selection</span>
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            className="py-3 px-6 rounded-xl font-bold text-sm text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 transition-all duration-200 shadow-lg shadow-emerald-500/25 flex items-center gap-2"
          >
            <span>Review &amp; Confirm Booking</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Right Column: Live Bill Summary Sidecard */}
      <div className="lg:col-span-1">
        <div className="sticky top-6 bg-[#0b1424] border border-[#1e2a40] rounded-2xl p-6 shadow-xl shadow-black/40">
          <div className="flex items-center justify-between pb-4 border-b border-[#182337] mb-4">
            <h3 className="text-base font-bold text-white tracking-tight">
              Live Reservation Summary
            </h3>
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Deterministic 7% Tax
            </span>
          </div>

          {/* Room info mini-preview */}
          <div className="flex gap-3 items-center pb-4 border-b border-[#182337] mb-4">
            <img
              src={selectedRoom.image}
              alt="Room"
              className="w-16 h-16 rounded-xl object-cover border border-[#1e2a40]"
            />
            <div>
              <div className="text-sm font-bold text-white">
                Room {selectedRoom.roomNumber} ({selectedRoom.type})
              </div>
              <div className="text-xs text-slate-400">
                Floor {selectedRoom.floor} • Up to {selectedRoom.capacity} Guests
              </div>
              <div className="text-xs text-emerald-400 font-semibold mt-0.5">
                ${selectedRoom.baseRate} / night
              </div>
            </div>
          </div>

          {/* Stay Specs */}
          <div className="space-y-1.5 text-xs text-slate-400 pb-4 border-b border-[#182337] mb-4">
            <div className="flex justify-between">
              <span>Check-In:</span>
              <strong className="text-slate-200">{searchCriteria.checkIn}</strong>
            </div>
            <div className="flex justify-between">
              <span>Check-Out:</span>
              <strong className="text-slate-200">{searchCriteria.checkOut}</strong>
            </div>
            <div className="flex justify-between">
              <span>Duration:</span>
              <strong className="text-slate-200">{bill.nights} {bill.nights === 1 ? 'Night' : 'Nights'}</strong>
            </div>
            <div className="flex justify-between">
              <span>Guests:</span>
              <strong className="text-slate-200">
                {(searchCriteria.guests?.adults || 1) + (searchCriteria.guests?.children || 0)} Guests
              </strong>
            </div>
          </div>

          {/* Itemized Calculation */}
          <div className="space-y-2 text-xs pb-4 border-b border-[#182337] mb-4">
            <div className="flex justify-between text-slate-300">
              <span>Room Total ({bill.nights} nights @ ${selectedRoom.baseRate})</span>
              <span className="font-semibold text-white">${bill.roomTotal.toFixed(2)}</span>
            </div>

            {bill.extraGuestSurcharge > 0 && (
              <div className="flex justify-between text-amber-400">
                <span>Extra Guest Surcharge ({bill.extraGuests} guest × $25 × {bill.nights}n)</span>
                <span className="font-semibold">+${bill.extraGuestSurcharge.toFixed(2)}</span>
              </div>
            )}

            {bill.diningTotal > 0 && (
              <div className="flex justify-between text-slate-300">
                <span>Dining Package Total</span>
                <span className="font-semibold text-white">+${bill.diningTotal.toFixed(2)}</span>
              </div>
            )}

            {bill.amenitiesTotal > 0 && (
              <div className="flex justify-between text-slate-300">
                <span>Amenities (Sweet Surprise)</span>
                <span className="font-semibold text-white">+${bill.amenitiesTotal.toFixed(2)}</span>
              </div>
            )}

            <div className="flex justify-between text-slate-400 pt-2 border-t border-[#152030]">
              <span>Subtotal</span>
              <span className="font-semibold text-slate-200">${bill.subtotal.toFixed(2)}</span>
            </div>

            <div className="flex justify-between text-slate-400">
              <span>Hotel Occupancy Tax (7%)</span>
              <span className="font-semibold text-slate-200">${bill.tax.toFixed(2)}</span>
            </div>
          </div>

          {/* Total Amount Due */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-xs uppercase font-bold text-slate-400">Total Price Due</div>
              <div className="text-xs text-slate-500">Taxes &amp; surcharges included</div>
            </div>
            <div className="text-2xl font-black text-emerald-400">
              ${bill.total.toFixed(2)}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#070d18] border border-[#1a2639] text-[11px] text-slate-400 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            <span>
              Free cancellation up to 48 hours prior to arrival. Pay at the front desk upon check-in or via contactless card.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
