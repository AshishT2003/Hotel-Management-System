import React from 'react';
import { RoomType, RoomStatus } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { formatCurrency } from '../../utils/formatters';
import { BedDouble, User } from 'lucide-react';

export interface RoomCardProps {
  roomNumber: string;
  floor: number;
  type: RoomType;
  price: number;
  status: RoomStatus;
  occupantName?: string | null;
  onSelect: (roomNumber: string, type: string) => void;
}

export const RoomCard: React.FC<RoomCardProps> = ({
  roomNumber,
  floor,
  type,
  price,
  status,
  occupantName,
  onSelect,
}) => {
  const isAvailable = status === 'Available';

  const borderClasses = {
    Available: 'hover:border-emerald-400 hover:shadow-glow-emerald',
    Reserved: 'hover:border-amber-400 hover:shadow-glow-amber',
    Occupied: 'hover:border-rose-400 hover:shadow-glow-rose',
  }[status];

  return (
    <div
      onClick={() => onSelect(roomNumber, type)}
      role="button"
      tabIndex={0}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(roomNumber, type);
        }
      }}
      className={`relative group bg-white rounded-xl border border-slate-200 p-4 transition-all duration-200 cursor-pointer shadow-sm hover:-translate-y-0.5 ${borderClasses}`}
      aria-label={`Room ${roomNumber}, ${type}, ${status}`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5">
          <span className="text-lg font-bold text-slate-900 tracking-tight font-mono">
            #{roomNumber}
          </span>
          <span className="text-xs text-slate-400 font-medium">Fl.{floor}</span>
        </div>
        <StatusBadge status={status} size="sm" />
      </div>

      <div className="flex items-center gap-1.5 text-xs text-slate-600 mb-3">
        <BedDouble className="w-3.5 h-3.5 text-slate-400" />
        <span className="font-medium">{type} Room</span>
      </div>

      {occupantName ? (
        <div className="flex items-center gap-1.5 text-xs text-slate-700 bg-slate-50 rounded-md px-2 py-1 mb-3 border border-slate-100">
          <User className="w-3 h-3 text-slate-400 shrink-0" />
          <span className="truncate font-medium">{occupantName}</span>
        </div>
      ) : (
        <div className="h-6 mb-3" />
      )}

      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
        <span className="text-xs font-semibold text-slate-900">
          {formatCurrency(price)}
          <span className="text-slate-400 font-normal text-[10px]"> / night</span>
        </span>
        <span className="text-[11px] font-medium text-slate-500 group-hover:text-slate-900 transition-colors">
          {isAvailable ? 'Book Room →' : 'View Details →'}
        </span>
      </div>
    </div>
  );
};
