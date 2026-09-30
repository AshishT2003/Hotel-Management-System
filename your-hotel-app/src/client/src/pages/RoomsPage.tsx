import React from 'react';
import { useHotel } from '../context/HotelContext';
import { RoomGrid } from '../components/rooms/RoomGrid';
import { Button } from '../components/common/Button';
import { BedDouble, PlusCircle } from 'lucide-react';

interface RoomsPageProps {
  onOpenNewReservation: () => void;
}

export const RoomsPage: React.FC<RoomsPageProps> = ({ onOpenNewReservation }) => {
  const { rooms } = useHotel();

  const availableCount = rooms.filter(r => r.status === 'Available').length;
  const reservedCount = rooms.filter(r => r.status === 'Reserved').length;
  const occupiedCount = rooms.filter(r => r.status === 'Occupied').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold font-serif text-slate-900">
              50-Room Floor Matrix
            </h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
              5 Floors • 10 Units/Floor
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Click any available room to initiate an immediate booking, or select an occupied unit to view the folio.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="gold"
            size="sm"
            icon={<PlusCircle className="w-4 h-4" />}
            onClick={onOpenNewReservation}
          >
            Book Room
          </Button>
        </div>
      </div>

      {/* Occupancy Legend Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="flex items-center justify-between bg-emerald-50/60 border border-emerald-200 rounded-xl p-3">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500 shrink-0" />
            <span className="text-xs font-semibold text-emerald-900">Available</span>
          </div>
          <span className="text-sm font-bold font-mono text-emerald-800">{availableCount} Rooms</span>
        </div>

        <div className="flex items-center justify-between bg-amber-50/60 border border-amber-200 rounded-xl p-3">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-500 shrink-0" />
            <span className="text-xs font-semibold text-amber-900">Reserved (Pending)</span>
          </div>
          <span className="text-sm font-bold font-mono text-amber-800">{reservedCount} Rooms</span>
        </div>

        <div className="flex items-center justify-between bg-rose-50/60 border border-rose-200 rounded-xl p-3">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-rose-500 shrink-0" />
            <span className="text-xs font-semibold text-rose-900">Occupied (In House)</span>
          </div>
          <span className="text-sm font-bold font-mono text-rose-800">{occupiedCount} Rooms</span>
        </div>
      </div>

      {/* Visual Room Grid */}
      <RoomGrid />
    </div>
  );
};
