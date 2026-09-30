import React, { useState, useMemo } from 'react';
import { RoomCard } from './RoomCard';
import { ArrowLeft, ArrowRight, Calendar, Users, SlidersHorizontal, Check } from 'lucide-react';

export function StepSelectRoom({
  rooms,
  selectedRoom,
  searchCriteria,
  onSelectRoom,
  onProceed,
  onBack
}) {
  const [activeTier, setActiveTier] = useState('All');
  const [availableOnly, setAvailableOnly] = useState(true);

  const tiers = ['All', 'Single', 'Double', 'Twin', 'Duplex', 'Suite'];

  const filteredRooms = useMemo(() => {
    return rooms.filter((room) => {
      const matchTier = activeTier === 'All' || room.type.toLowerCase() === activeTier.toLowerCase();
      const matchAvail = !availableOnly || room.available !== false;
      return matchTier && matchAvail;
    });
  }, [rooms, activeTier, availableOnly]);

  const calculateNights = () => {
    if (!searchCriteria.checkIn || !searchCriteria.checkOut) return 1;
    const diff = (new Date(searchCriteria.checkOut) - new Date(searchCriteria.checkIn)) / (1000 * 60 * 60 * 24);
    return Math.max(1, Math.round(diff));
  };

  const nights = calculateNights();
  const totalGuests = (searchCriteria.guests?.adults || 1) + (searchCriteria.guests?.children || 0);

  return (
    <div className="space-y-6">
      {/* Search Criteria Ribbon */}
      <div className="bg-[#0b1424] border border-[#1e2a40] rounded-2xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-sm text-slate-300">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-400" />
            <span>
              <strong className="text-white">{searchCriteria.checkIn}</strong> to{' '}
              <strong className="text-white">{searchCriteria.checkOut}</strong> ({nights} {nights === 1 ? 'Night' : 'Nights'})
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-400" />
            <span>
              <strong className="text-white">{totalGuests} Guests</strong> ({searchCriteria.guests?.adults} Adults, {searchCriteria.guests?.children} Children)
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={onBack}
          className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1.5 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Change Dates / Guests</span>
        </button>
      </div>

      {/* Filter Tabs & Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#182337] pb-4">
        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          {tiers.map((tier) => (
            <button
              key={tier}
              type="button"
              onClick={() => setActiveTier(tier)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTier === tier
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'bg-[#0d1627] text-slate-400 hover:text-white hover:bg-[#132038] border border-[#1e2a40]'
              }`}
            >
              {tier} {tier !== 'All' && 'Tier'}
            </button>
          ))}
        </div>

        <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={availableOnly}
            onChange={(e) => setAvailableOnly(e.target.checked)}
            className="rounded border-[#1e2a40] text-emerald-500 focus:ring-0 bg-[#0b1424]"
          />
          <span>Show available rooms only</span>
        </label>
      </div>

      {/* Room Matrix Grid */}
      {filteredRooms.length === 0 ? (
        <div className="bg-[#0b1424] border border-[#1e2a40] rounded-2xl p-12 text-center">
          <SlidersHorizontal className="w-10 h-10 text-slate-500 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white mb-1">No rooms match your filter</h3>
          <p className="text-sm text-slate-400 mb-4">
            Try selecting a different room tier or showing all rooms.
          </p>
          <button
            type="button"
            onClick={() => {
              setActiveTier('All');
              setAvailableOnly(false);
            }}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-500 text-slate-950"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRooms.map((room) => (
            <RoomCard
              key={room.roomNumber}
              room={room}
              isSelected={selectedRoom?.roomNumber === room.roomNumber}
              onSelect={onSelectRoom}
            />
          ))}
        </div>
      )}

      {/* Floating Bottom Selection Bar */}
      {selectedRoom && (
        <div className="sticky bottom-4 z-40 bg-[#0d172a]/95 backdrop-blur-md border border-emerald-500/40 rounded-2xl p-4 sm:p-5 shadow-2xl shadow-black/80 flex flex-wrap items-center justify-between gap-4 animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center font-bold text-base">
              <Check className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs uppercase font-bold tracking-wider text-emerald-400">
                Selected Room
              </div>
              <div className="text-white font-bold text-base">
                Room {selectedRoom.roomNumber} • {selectedRoom.type} Suite
                <span className="text-slate-400 font-normal text-sm ml-2">
                  (${selectedRoom.baseRate}/night × {nights} {nights === 1 ? 'night' : 'nights'} = ${selectedRoom.baseRate * nights})
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onProceed}
            className="py-3 px-6 rounded-xl font-bold text-sm text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 transition-all duration-200 shadow-lg shadow-emerald-500/25 flex items-center gap-2"
          >
            <span>Continue to Guest Details</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
