import React from 'react';
import { Check, Users, BedDouble, Maximize2, ShieldCheck, Flame } from 'lucide-react';

export function RoomCard({ room, isSelected, onSelect }) {
  const isAvailable = room.available !== false;

  return (
    <div
      className={`group relative rounded-2xl overflow-hidden border transition-all duration-300 flex flex-col ${
        isSelected
          ? 'bg-[#0f1b31] border-emerald-500 shadow-xl shadow-emerald-500/10 ring-2 ring-emerald-500/30 -translate-y-1'
          : isAvailable
          ? 'bg-[#0a1222] border-[#1e2a40] hover:border-emerald-500/50 hover:bg-[#0c1628] hover:-translate-y-1'
          : 'bg-[#0a1222]/50 border-[#1a2333] opacity-60'
      }`}
    >
      {/* Room Image Container */}
      <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-slate-900">
        <img
          src={room.image}
          alt={`${room.type} Room`}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a1222] via-[#0a1222]/40 to-transparent" />

        {/* Badges on top of image */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
          <span className="px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-slate-900/80 backdrop-blur-md text-emerald-400 border border-emerald-500/30">
            Floor {room.floor}
          </span>
          <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-900/80 backdrop-blur-md text-slate-200 border border-slate-700">
            Room {room.roomNumber}
          </span>
        </div>

        {/* Urgency Badge */}
        {room.urgencyBadge && isAvailable && (
          <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-rose-500/90 text-white backdrop-blur-md animate-pulse">
            <Flame className="w-3.5 h-3.5 fill-current" />
            <span>{room.urgencyBadge}</span>
          </div>
        )}

        {/* Price tag pinned to bottom of image */}
        <div className="absolute bottom-3 right-3 text-right">
          <div className="text-xl sm:text-2xl font-black text-white leading-none drop-shadow-md">
            ${room.baseRate}
            <span className="text-xs font-normal text-slate-300 ml-1">/ night</span>
          </div>
        </div>
      </div>

      {/* Card Content Body */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-lg font-bold text-white tracking-tight">
              {room.type} Suite
            </h3>
          </div>

          <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed">
            {room.description || 'Spacious, elegantly furnished accommodations with personalized climate control and premium luxury bedding.'}
          </p>

          {/* Quick Specs */}
          <div className="grid grid-cols-3 gap-2 py-3 border-y border-[#182337] mb-4 text-xs text-slate-300">
            <div className="flex items-center gap-1.5" title="Guest Capacity">
              <Users className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
              <span>Up to {room.capacity}</span>
            </div>
            <div className="flex items-center gap-1.5" title="Bed Type">
              <BedDouble className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
              <span className="truncate">{room.bed || 'King Bed'}</span>
            </div>
            <div className="flex items-center gap-1.5" title="Room Size">
              <Maximize2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
              <span>{room.size || '350 sq ft'}</span>
            </div>
          </div>

          {/* Amenities Pills */}
          <div className="flex flex-wrap gap-1.5 mb-5">
            {room.amenities?.slice(0, 4).map((amenity, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] bg-[#121c2e] text-slate-300 border border-[#1e2a40]"
              >
                <Check className="w-3 h-3 text-emerald-400" />
                {amenity}
              </span>
            ))}
            {room.amenities?.length > 4 && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] bg-[#121c2e] text-slate-400 border border-[#1e2a40]">
                +{room.amenities.length - 4} more
              </span>
            )}
          </div>
        </div>

        {/* Select Action Button */}
        <div>
          {isAvailable ? (
            <button
              type="button"
              onClick={() => onSelect(room)}
              className={`w-full py-2.5 px-4 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
                isSelected
                  ? 'bg-emerald-500 text-[#041a12] shadow-lg shadow-emerald-500/25 ring-2 ring-emerald-400'
                  : 'bg-[#15233a] hover:bg-emerald-600 hover:text-white text-slate-200 border border-[#223554]'
              }`}
            >
              {isSelected ? (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Selected Room</span>
                </>
              ) : (
                <span>Select This Room</span>
              )}
            </button>
          ) : (
            <div className="w-full py-2.5 px-4 rounded-xl font-medium text-xs text-center bg-slate-800/40 text-slate-500 border border-slate-800">
              Unavailable for selected dates
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
