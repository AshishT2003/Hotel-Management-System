import React from 'react';
import { Button } from '../common/Button';
import { StatusBadge } from '../common/StatusBadge';
import { Utensils, Sparkles, Check, Phone } from 'lucide-react';
import { formatPhone } from '../../utils/formatters';

export interface KitchenQueueCardProps {
  orderId: number;
  roomNumber: string;
  floor: number;
  guestName: string;
  phoneNumber?: string;
  breakfastCount: number;
  lunchCount: number;
  dinnerCount: number;
  housekeepingRequested: boolean;
  freshTowelsRequested: boolean;
  sweetSurpriseRequested: boolean;
  isServed: boolean;
  onMarkServed: (orderId: number) => void;
}

export const KitchenQueueCard: React.FC<KitchenQueueCardProps> = ({
  orderId,
  roomNumber,
  floor,
  guestName,
  phoneNumber,
  breakfastCount,
  lunchCount,
  dinnerCount,
  housekeepingRequested,
  freshTowelsRequested,
  sweetSurpriseRequested,
  isServed,
  onMarkServed,
}) => {
  return (
    <div
      className={`rounded-xl border p-4.5 transition-all duration-200 ${
        isServed
          ? 'bg-slate-50/70 border-slate-200 opacity-75'
          : 'bg-white border-amber-200/80 shadow-luxury-sm hover:border-amber-300'
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-base font-bold text-slate-900 font-mono">
              Room #{roomNumber}
            </span>
            <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
              Fl. {floor}
            </span>
          </div>
          <div className="text-xs font-semibold text-slate-700 mt-0.5">
            {guestName}
          </div>
          {phoneNumber && (
            <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
              <Phone className="w-3 h-3" />
              <span>{formatPhone(phoneNumber)}</span>
            </div>
          )}
        </div>
        <StatusBadge status={isServed ? 'Served' : 'Pending'} size="sm" />
      </div>

      {/* Dining Counts */}
      <div className="space-y-2 mb-4 bg-slate-50 rounded-lg p-2.5 border border-slate-100 text-xs">
        <div className="font-semibold text-slate-700 flex items-center gap-1.5 text-[11px] uppercase tracking-wide">
          <Utensils className="w-3.5 h-3.5 text-slate-400" /> Dining Portions
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-white rounded p-1.5 border border-slate-100">
            <span className="text-[10px] text-slate-400 block">Breakfast</span>
            <span className="text-sm font-bold text-slate-900">{breakfastCount}</span>
          </div>
          <div className="bg-white rounded p-1.5 border border-slate-100">
            <span className="text-[10px] text-slate-400 block">Lunch</span>
            <span className="text-sm font-bold text-slate-900">{lunchCount}</span>
          </div>
          <div className="bg-white rounded p-1.5 border border-slate-100">
            <span className="text-[10px] text-slate-400 block">Dinner</span>
            <span className="text-sm font-bold text-slate-900">{dinnerCount}</span>
          </div>
        </div>

        {/* Room Services Checklist */}
        <div className="pt-2 border-t border-slate-200/60 flex flex-wrap gap-1.5">
          {housekeepingRequested && (
            <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              ✓ Housekeeping
            </span>
          )}
          {freshTowelsRequested && (
            <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
              ✓ Fresh Towels
            </span>
          )}
          {sweetSurpriseRequested && (
            <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
              <Sparkles className="w-3 h-3 text-amber-500" /> VIP Sweet Surprise
            </span>
          )}
        </div>
      </div>

      {/* Action */}
      {!isServed ? (
        <Button
          variant="gold"
          size="sm"
          className="w-full"
          icon={<Check className="w-4 h-4" />}
          onClick={() => onMarkServed(orderId)}
        >
          Mark Order as Served
        </Button>
      ) : (
        <button
          onClick={() => onMarkServed(orderId)}
          className="w-full text-center text-xs text-slate-400 hover:text-slate-600 font-medium py-1 transition-colors"
        >
          Undo (Re-queue as Pending)
        </button>
      )}
    </div>
  );
};
