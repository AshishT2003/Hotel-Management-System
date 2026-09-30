import React, { useState } from 'react';
import { DateRangePicker } from './DateRangePicker';
import { GuestCounter } from './GuestCounter';
import { validateSearchCriteria } from '../../utils/bookingValidator';
import { Sparkles, Shield, Clock, Wifi, ArrowRight } from 'lucide-react';

export function StepSearchAvailability({ searchCriteria, onSearch, isLoading }) {
  const [dates, setDates] = useState({
    checkIn: searchCriteria.checkIn || new Date().toISOString().split('T')[0],
    checkOut: searchCriteria.checkOut || (() => {
      const d = new Date();
      d.setDate(d.getDate() + 2);
      return d.toISOString().split('T')[0];
    })()
  });

  const [guests, setGuests] = useState({
    adults: searchCriteria.guests?.adults || 2,
    children: searchCriteria.guests?.children || 0
  });

  const [errors, setErrors] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    const val = validateSearchCriteria(dates.checkIn, dates.checkOut, guests.adults);
    if (!val.isValid) {
      setErrors(val.errors);
      return;
    }
    setErrors({});
    onSearch({
      checkIn: dates.checkIn,
      checkOut: dates.checkOut,
      guests
    });
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Hero Welcome Banner */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Direct Guest Reservation</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-3">
          Discover Luxury at <span className="maharaja-brand-animated">MAHARAJA Hotel</span>
        </h1>
        <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto">
          Reserve your premier 5-star hotel room directly with guaranteed best rates, complimentary fiber WiFi, and transparent pricing.
        </p>
      </div>

      {/* Main Search Panel */}
      <form
        onSubmit={handleSubmit}
        className="bg-[#0d1627] border border-[#1e2a40] rounded-2xl p-6 sm:p-8 shadow-2xl shadow-black/60 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-6 relative z-10">
          <DateRangePicker
            checkIn={dates.checkIn}
            checkOut={dates.checkOut}
            onChange={(newDates) => {
              setDates(newDates);
              setErrors({});
            }}
            errors={errors}
          />

          <GuestCounter
            adults={guests.adults}
            children={guests.children}
            onChange={(newGuests) => {
              setGuests(newGuests);
              setErrors({});
            }}
          />

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 px-6 rounded-xl font-bold text-base text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 transition-all duration-200 shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                <span>Checking Room Inventory...</span>
              </>
            ) : (
              <>
                <span>Search Available Rooms</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </form>

      {/* Trust Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
        <div className="flex items-center gap-3 p-4 rounded-xl bg-[#0b1424] border border-[#1a2538] text-left">
          <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="text-white text-sm font-semibold">Best Rate Guaranteed</div>
            <div className="text-xs text-slate-400">Direct booking privilege</div>
          </div>
        </div>

        <div className="flex items-center gap-3 p-4 rounded-xl bg-[#0b1424] border border-[#1a2538] text-left">
          <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-white text-sm font-semibold">Flexible Cancellation</div>
            <div className="text-xs text-slate-400">Free up to 48 hours prior</div>
          </div>
        </div>

        <div className="flex items-center gap-3 p-4 rounded-xl bg-[#0b1424] border border-[#1a2538] text-left">
          <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Wifi className="w-5 h-5" />
          </div>
          <div>
            <div className="text-white text-sm font-semibold">Complimentary WiFi</div>
            <div className="text-xs text-slate-400">Gigabit fiber throughout</div>
          </div>
        </div>
      </div>
    </div>
  );
}
