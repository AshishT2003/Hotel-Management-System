import React, { useState } from 'react';
import { FloorGrid } from '../components/rooms/FloorGrid';
import { ReservationModal } from '../components/reservation/ReservationModal';
import { useHotel } from '../context/HotelContext';
import { BedDouble } from 'lucide-react';

export function RoomsPage() {
  const { stats } = useHotel();
  const [modalOpen, setModalOpen] = useState(false);
  const [preselectedRoom, setPreselectedRoom] = useState(null);

  const handleBookRoom = (roomType, roomNumber) => {
    setPreselectedRoom({ roomType, roomNumber });
    setModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-hotel-200 dark:border-hotel-800">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-hotel-950 dark:text-white tracking-tight flex items-center gap-2">
            <BedDouble className="w-6 h-6 text-emerald-600" />
            Room Availability Matrix &amp; Floor Map
          </h2>
          <p className="text-xs sm:text-sm text-hotel-500 mt-1">
            Real-time visual map of all 50 rooms across 5 floors. Click any available room to book instantly.
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs font-semibold">
          <div className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            {stats.availableCount} Vacant Rooms
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
            {stats.occupiedCount} In-House
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            {stats.reservedCount} Reserved
          </div>
        </div>
      </div>

      {/* Main Floor Grid */}
      <FloorGrid onBookRoom={handleBookRoom} />

      {/* Booking Modal with preselected room */}
      <ReservationModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setPreselectedRoom(null);
        }}
        editingReservation={preselectedRoom ? {
          roomType: preselectedRoom.roomType,
          roomNumber: preselectedRoom.roomNumber,
          roomFloor: parseInt(preselectedRoom.roomNumber.charAt(0), 10)
        } : null}
      />
    </div>
  );
}

export default RoomsPage;
