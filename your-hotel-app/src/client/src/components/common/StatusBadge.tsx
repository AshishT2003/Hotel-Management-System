import React from 'react';
import { RoomStatus } from '../../types';

interface StatusBadgeProps {
  status: RoomStatus | 'Pending' | 'Served' | 'Checked In';
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  let config = {
    bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dot: 'bg-emerald-500',
    label: status,
  };

  switch (status) {
    case 'Available':
      config = {
        bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        dot: 'bg-emerald-500',
        label: 'Available',
      };
      break;
    case 'Reserved':
    case 'Pending':
      config = {
        bg: 'bg-amber-50 text-amber-800 border-amber-200',
        dot: 'bg-amber-500',
        label: status === 'Pending' ? 'Pending' : 'Reserved',
      };
      break;
    case 'Occupied':
    case 'Checked In':
      config = {
        bg: 'bg-rose-50 text-rose-700 border-rose-200',
        dot: 'bg-rose-500',
        label: status === 'Checked In' ? 'In House' : 'Occupied',
      };
      break;
    case 'Served':
      config = {
        bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        dot: 'bg-emerald-500',
        label: 'Served',
      };
      break;
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border shadow-2xs ${config.bg} ${sizeClasses}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${config.dot}`} aria-hidden="true" />
      <span>{config.label}</span>
    </span>
  );
};
