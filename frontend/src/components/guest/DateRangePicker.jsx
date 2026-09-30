import React from 'react';
import { Calendar, Moon } from 'lucide-react';

export function DateRangePicker({ checkIn, checkOut, onChange, errors = {} }) {
  const todayStr = new Date().toISOString().split('T')[0];

  const handleCheckInChange = (e) => {
    const newCheckIn = e.target.value;
    let newCheckOut = checkOut;
    if (newCheckOut && newCheckOut <= newCheckIn) {
      const nextDay = new Date(newCheckIn);
      nextDay.setDate(nextDay.getDate() + 1);
      newCheckOut = nextDay.toISOString().split('T')[0];
    }
    onChange({ checkIn: newCheckIn, checkOut: newCheckOut });
  };

  const handleCheckOutChange = (e) => {
    onChange({ checkIn, checkOut: e.target.value });
  };

  const calculateNights = () => {
    if (!checkIn || !checkOut) return 0;
    const diff = (new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24);
    return Math.max(0, Math.round(diff));
  };

  const nights = calculateNights();

  return (
    <div className="bg-[#0b1424] border border-[#1e2a40] rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-slate-300 text-sm font-semibold">
          <Calendar className="w-4 h-4 text-emerald-400" />
          <span>STAY DATES</span>
        </div>
        {nights > 0 && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <Moon className="w-3 h-3" />
            {nights} {nights === 1 ? 'Night' : 'Nights'}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Check-In */}
        <div>
          <label className="block text-xs uppercase font-medium text-slate-400 mb-1.5">
            Check-In Date *
          </label>
          <div className="relative">
            <input
              type="date"
              min={todayStr}
              value={checkIn}
              onChange={handleCheckInChange}
              className={`w-full bg-[#070d18] border ${
                errors.checkIn ? 'border-rose-500 ring-1 ring-rose-500' : 'border-[#1a2639] focus:border-emerald-500'
              } text-white text-sm rounded-lg px-3.5 py-2.5 focus:outline-none transition`}
            />
          </div>
          {errors.checkIn && <p className="text-xs text-rose-400 mt-1">{errors.checkIn}</p>}
        </div>

        {/* Check-Out */}
        <div>
          <label className="block text-xs uppercase font-medium text-slate-400 mb-1.5">
            Check-Out Date *
          </label>
          <div className="relative">
            <input
              type="date"
              min={checkIn || todayStr}
              value={checkOut}
              onChange={handleCheckOutChange}
              className={`w-full bg-[#070d18] border ${
                errors.checkOut ? 'border-rose-500 ring-1 ring-rose-500' : 'border-[#1a2639] focus:border-emerald-500'
              } text-white text-sm rounded-lg px-3.5 py-2.5 focus:outline-none transition`}
            />
          </div>
          {errors.checkOut && <p className="text-xs text-rose-400 mt-1">{errors.checkOut}</p>}
        </div>
      </div>
    </div>
  );
}
