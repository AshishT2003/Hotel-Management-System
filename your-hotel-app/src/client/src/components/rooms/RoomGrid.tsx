import React, { useState } from 'react';
import { useHotel } from '../../context/HotelContext';
import { RoomCard } from './RoomCard';
import { RoomType, RoomStatus } from '../../types';
import { Layers } from 'lucide-react';

export const RoomGrid: React.FC = () => {
  const { rooms, setIsReservationModalOpen, setSelectedRoom, openInvoiceForReservation } = useHotel();
  const [floorFilter, setFloorFilter] = useState<number | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<RoomStatus | 'all'>('all');

  const filteredRooms = rooms.filter(room => {
    if (floorFilter !== 'all' && room.floor !== floorFilter) return false;
    if (statusFilter !== 'all' && room.status !== statusFilter) return false;
    return true;
  });

  const floors = [1, 2, 3, 4, 5];

  const handleSelectRoom = (roomNumber: string, _type: string) => {
    const room = rooms.find(r => r.roomNumber === roomNumber);
    if (!room) return;

    if (room.status === 'Available') {
      setSelectedRoom(roomNumber);
      setIsReservationModalOpen(true);
    } else if (room.reservationId) {
      openInvoiceForReservation(room.reservationId);
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters and Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        {/* Floor Selection */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 w-full sm:w-auto">
          <span className="text-xs font-semibold text-slate-500 mr-2 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5" /> Floor:
          </span>
          <button
            onClick={() => setFloorFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              floorFilter === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Floors
          </button>
          {floors.map(f => (
            <button
              key={f}
              onClick={() => setFloorFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                floorFilter === f
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Floor {f}
            </button>
          ))}
        </div>

        {/* Status Selection */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-semibold text-slate-500 mr-1">Status:</span>
          {(['all', 'Available', 'Reserved', 'Occupied'] as const).map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                statusFilter === s
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {s === 'all' ? 'All' : s}
            </button>
          ))}
        </div>
      </div>

      {/* Grid rendering grouped by floor if 'all' is selected */}
      {floorFilter === 'all' ? (
        floors.map(floorNum => {
          const floorRooms = filteredRooms.filter(r => r.floor === floorNum);
          if (floorRooms.length === 0) return null;

          const floorType = floorRooms[0]?.type || 'Standard';
          const availableCount = floorRooms.filter(r => r.status === 'Available').length;

          return (
            <section key={floorNum} className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <div className="flex items-center gap-3">
                  <h3 className="text-base font-bold text-slate-900 font-serif">
                    Floor {floorNum} — {floorType} Tier
                  </h3>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
                    10 Rooms
                  </span>
                </div>
                <div className="text-xs text-slate-500 font-medium">
                  <span className="text-emerald-600 font-semibold">{availableCount} Available</span> / 10
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
                {floorRooms.map(room => (
                  <RoomCard
                    key={room.roomNumber}
                    roomNumber={room.roomNumber}
                    floor={room.floor}
                    type={room.type}
                    price={room.price}
                    status={room.status}
                    occupantName={room.guestName}
                    onSelect={handleSelectRoom}
                  />
                ))}
              </div>
            </section>
          );
        })
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
          {filteredRooms.map(room => (
            <RoomCard
              key={room.roomNumber}
              roomNumber={room.roomNumber}
              floor={room.floor}
              type={room.type}
              price={room.price}
              status={room.status}
              occupantName={room.guestName}
              onSelect={handleSelectRoom}
            />
          ))}
        </div>
      )}
    </div>
  );
};
