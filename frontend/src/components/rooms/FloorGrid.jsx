import React, { useState } from 'react';
import { useHotel } from '../../context/HotelContext';
import { FLOORS } from '../../utils/roomData';
import { Badge } from '../common/Badge';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { BedDouble, User, CheckCircle2, AlertCircle, PlusCircle, ShieldAlert } from 'lucide-react';

export function FloorGrid({ onBookRoom }) {
  const { roomStatusMap, showToast } = useHotel();
  const [selectedFloor, setSelectedFloor] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const visibleFloors = FLOORS.filter(f => selectedFloor === 'ALL' || f.floor === Number(selectedFloor));

  const handleCardClick = (floorType, roomNum, info) => {
    if (info.status === 'Occupied') {
      if (showToast) {
        showToast(`Room ${roomNum} is currently occupied by ${info.reservation?.firstName || 'guest'}. Double booking prevented.`, 'error');
      }
      return;
    }
    if (info.status === 'Reserved') {
      if (showToast) {
        showToast(`Room ${roomNum} is already reserved for ${info.reservation?.firstName || 'guest'}. Double booking prevented.`, 'error');
      }
      return;
    }
    if (info.status === 'Available') {
      if (info.housekeepingStatus && info.housekeepingStatus !== 'Ready') {
        const actionLabel = info.housekeepingStatus === 'Inspection' 
          ? 'supervisor inspection' 
          : info.housekeepingStatus === 'Cleaning' 
          ? 'housekeeping cleaning' 
          : 'turnover cleaning';
        if (showToast) {
          showToast(`Room ${roomNum} is currently undergoing ${actionLabel}. Housekeeping clearance required before booking.`, 'error');
        }
        return;
      }
      if (onBookRoom) {
        onBookRoom(floorType, roomNum);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Controls & Legend Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 rounded-xl border border-hotel-200 dark:border-hotel-800 bg-white dark:bg-hotel-900 shadow-sm">
        {/* Floor Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-bold text-hotel-400 uppercase tracking-wider mr-2">Floor:</span>
          <button
            onClick={() => setSelectedFloor('ALL')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1 dark:focus:ring-offset-hotel-900 ${
              selectedFloor === 'ALL'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-hotel-100 dark:bg-hotel-800 text-hotel-600 dark:text-hotel-300 hover:bg-hotel-200'
            }`}
          >
            All Floors (1-5)
          </button>
          {FLOORS.map(f => (
            <button
              key={f.floor}
              onClick={() => setSelectedFloor(String(f.floor))}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1 dark:focus:ring-offset-hotel-900 ${
                selectedFloor === String(f.floor)
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-hotel-100 dark:bg-hotel-800 text-hotel-600 dark:text-hotel-300 hover:bg-hotel-200'
              }`}
            >
              Floor {f.floor} ({f.type})
            </button>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs font-medium border-t lg:border-t-0 pt-3 lg:pt-0 border-hotel-100 dark:border-hotel-800">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
            <span className="text-hotel-700 dark:text-hotel-300">Available</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-amber-500 shadow-sm shadow-amber-500/50" />
            <span className="text-hotel-700 dark:text-hotel-300">Reserved (Pending)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-500 shadow-sm shadow-rose-500/50" />
            <span className="text-hotel-700 dark:text-hotel-300">Occupied (In Room)</span>
          </div>
        </div>
      </div>

      {/* Floors Display */}
      <div className="space-y-6">
        {visibleFloors.map(floor => (
          <div key={floor.floor} className="rounded-2xl border border-hotel-200 dark:border-hotel-800 bg-white dark:bg-hotel-900 p-5 shadow-sm space-y-4">
            {/* Floor Header */}
            <div className="flex items-center justify-between pb-3 border-b border-hotel-100 dark:border-hotel-800">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-hotel-100 dark:bg-hotel-800 flex items-center justify-center text-hotel-900 dark:text-white font-extrabold text-sm">
                  F{floor.floor}
                </div>
                <div>
                  <h3 className="text-base font-bold text-hotel-950 dark:text-white flex items-center gap-2">
                    Floor {floor.floor} • {floor.type} Tier
                  </h3>
                  <p className="text-xs text-hotel-400 font-medium">
                    Rate: {formatCurrency(floor.price)} / night • 10 Rooms
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="text-hotel-400">Available:</span>
                <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                  {floor.rooms.filter(r => roomStatusMap[r]?.status === 'Available').length} / 10
                </span>
              </div>
            </div>

            {/* Room Cards Grid (10 per floor) */}
            <div className="grid grid-cols-2 sm:grid-cols-5 md:grid-cols-5 lg:grid-cols-10 gap-3">
              {floor.rooms.map(roomNum => {
                const info = roomStatusMap[roomNum] || { status: 'Available', reservation: null };
                const isOccupied = info.status === 'Occupied';
                const isReserved = info.status === 'Reserved';
                const isAvailable = info.status === 'Available';
                const isReadyToBook = isAvailable && (info.housekeepingStatus === 'Ready' || !info.housekeepingStatus);

                return (
                  <div
                    key={roomNum}
                    tabIndex={isReadyToBook ? 0 : -1}
                    role={isReadyToBook ? "button" : undefined}
                    aria-label={`Room ${roomNum}, ${floor.type}, Status: ${info.status}${!isReadyToBook && isAvailable ? ` (${info.housekeepingStatus})` : ''}`}
                    className={`relative rounded-xl border p-3 flex flex-col justify-between transition-all duration-200 min-h-[110px] focus:outline-none ${
                      isOccupied
                        ? 'border-rose-200 bg-rose-50/60 dark:border-rose-900/60 dark:bg-rose-950/20 cursor-default'
                        : isReserved
                        ? 'border-amber-200 bg-amber-50/60 dark:border-amber-900/60 dark:bg-amber-950/20 cursor-default'
                        : isReadyToBook
                        ? 'border-emerald-200 bg-emerald-50/40 dark:border-emerald-900/50 dark:bg-emerald-950/20 hover:border-emerald-400 hover:shadow-md cursor-pointer focus:ring-2 focus:ring-emerald-500'
                        : 'border-hotel-200 dark:border-hotel-800 bg-hotel-50/50 dark:bg-hotel-900/30 cursor-pointer opacity-90 hover:border-hotel-400'
                    }`}
                    onClick={() => handleCardClick(floor.type, roomNum, info)}
                    onKeyDown={(e) => {
                      if ((e.key === 'Enter' || e.key === ' ') && isReadyToBook) {
                        e.preventDefault();
                        handleCardClick(floor.type, roomNum, info);
                      }
                    }}
                  >
                    {/* Top status indicator & number */}
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-sm text-hotel-900 dark:text-hotel-100">
                        {roomNum}
                      </span>
                      <span
                        className={`w-2 h-2 rounded-full ${
                          isOccupied
                            ? 'bg-rose-500'
                            : isReserved
                            ? 'bg-amber-500'
                            : isReadyToBook
                            ? 'bg-emerald-500 animate-pulse'
                            : info.housekeepingStatus === 'Cleaning'
                            ? 'bg-sky-400 animate-pulse'
                            : info.housekeepingStatus === 'Inspection'
                            ? 'bg-amber-400 animate-pulse'
                            : 'bg-rose-400'
                        }`}
                      />
                    </div>

                    {/* Middle info */}
                    <div className="my-1.5">
                      {isAvailable ? (
                        <div>
                          {info.housekeepingStatus === 'Dirty' ? (
                            <span className="text-[10px] text-rose-400 font-bold flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-400" /> Turnover
                            </span>
                          ) : info.housekeepingStatus === 'Cleaning' ? (
                            <span className="text-[10px] text-sky-400 font-bold flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-sky-400" /> Cleaning
                            </span>
                          ) : info.housekeepingStatus === 'Inspection' ? (
                            <span className="text-[10px] text-amber-400 font-bold flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" /> Inspect
                            </span>
                          ) : (
                            <div className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1">
                              <PlusCircle className="w-3 h-3" /> Book Now
                            </div>
                          )}
                        </div>
                      ) : (
                        <div>
                          <p className="text-xs font-bold text-hotel-900 dark:text-hotel-100 truncate">
                            {info.reservation?.firstName} {info.reservation?.lastName?.charAt(0)}.
                          </p>
                          <p className="text-[10px] text-hotel-500 truncate">
                            until {formatDate(info.reservation?.leavingTime)}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Bottom badge */}
                    <div className="text-[10px]">
                      {isOccupied && (
                        <span className="font-bold text-rose-600 dark:text-rose-400">Occupied</span>
                      )}
                      {isReserved && (
                        <span className="font-bold text-amber-600 dark:text-amber-400">Reserved</span>
                      )}
                      {isAvailable && (
                        <span className="font-medium text-hotel-400">{formatCurrency(floor.price)}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
