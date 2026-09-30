import React, { useState } from 'react';
import { useHotel } from '../../context/HotelContext';
import { Reservation } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { Button } from '../common/Button';
import { formatCurrency, formatDate, formatPhone } from '../../utils/formatters';
import { FileText, Edit, Trash2, ArrowUpDown, LogIn, LogOut } from 'lucide-react';

export const ReservationTable: React.FC = () => {
  const {
    filteredReservations,
    toggleCheckIn,
    deleteReservation,
    openInvoiceForReservation,
    setEditingReservation,
    setIsReservationModalOpen,
  } = useHotel();

  const [sortField, setSortField] = useState<keyof Reservation>('id');
  const [sortAsc, setSortAsc] = useState(false);

  const handleSort = (field: keyof Reservation) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const sorted = [...filteredReservations].sort((a, b) => {
    let aVal = a[sortField];
    let bVal = b[sortField];

    if (typeof aVal === 'string') {
      aVal = (aVal as string).toLowerCase();
      bVal = (bVal as string).toLowerCase();
    }

    if (aVal < bVal) return sortAsc ? -1 : 1;
    if (aVal > bVal) return sortAsc ? 1 : -1;
    return 0;
  });

  const handleEdit = (res: Reservation) => {
    setEditingReservation(res);
    setIsReservationModalOpen(true);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
              <th
                onClick={() => handleSort('id')}
                className="py-3 px-4 cursor-pointer hover:text-slate-900 transition-colors whitespace-nowrap"
              >
                <div className="flex items-center gap-1">
                  <span>Res ID</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort('lastName')}
                className="py-3 px-4 cursor-pointer hover:text-slate-900 transition-colors whitespace-nowrap"
              >
                <div className="flex items-center gap-1">
                  <span>Guest Details</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort('roomNumber')}
                className="py-3 px-4 cursor-pointer hover:text-slate-900 transition-colors whitespace-nowrap"
              >
                <div className="flex items-center gap-1">
                  <span>Room Tier</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-3 px-4 whitespace-nowrap">Stay Dates</th>
              <th className="py-3 px-4 whitespace-nowrap">Dining Perks</th>
              <th
                onClick={() => handleSort('totalBill')}
                className="py-3 px-4 cursor-pointer hover:text-slate-900 transition-colors whitespace-nowrap"
              >
                <div className="flex items-center gap-1">
                  <span>Total Bill</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-3 px-4 whitespace-nowrap text-center">Status / Check-in</th>
              <th className="py-3 px-4 whitespace-nowrap text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sorted.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-400">
                  <div className="max-w-xs mx-auto space-y-1">
                    <p className="text-sm font-semibold text-slate-600">No reservations found</p>
                    <p className="text-xs text-slate-400">Try changing your search query or status filter.</p>
                  </div>
                </td>
              </tr>
            ) : (
              sorted.map(res => (
                <tr key={res.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-medium text-slate-900">
                    #{res.id}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-900 text-sm">
                      {res.firstName} {res.lastName}
                    </div>
                    <div className="text-slate-500 text-[11px] flex items-center gap-2 mt-0.5">
                      <span>{formatPhone(res.phoneNumber)}</span>
                      <span>•</span>
                      <span>{res.emailAddress}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-medium text-slate-900">
                      Room {res.roomNumber}
                    </div>
                    <div className="text-slate-500 text-[11px]">
                      {res.roomType} (Fl. {res.roomFloor}) • {res.numberGuest} Guest{res.numberGuest > 1 ? 's' : ''}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-700 whitespace-nowrap">
                    <div>{formatDate(res.arrivalTime)}</div>
                    <div className="text-slate-400 text-[11px]">to {formatDate(res.leavingTime)}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    {res.breakfast > 0 || res.lunch > 0 || res.dinner > 0 ? (
                      <div className="flex items-center gap-1 text-[11px] font-medium text-slate-700">
                        {res.breakfast > 0 && <span className="bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">B:{res.breakfast}</span>}
                        {res.lunch > 0 && <span className="bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">L:{res.lunch}</span>}
                        {res.dinner > 0 && <span className="bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded">D:{res.dinner}</span>}
                      </div>
                    ) : (
                      <span className="text-slate-400 text-[11px]">None</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-semibold text-slate-900">
                    {formatCurrency(res.totalBill)}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <button
                      onClick={() => toggleCheckIn(res.id, !res.checkIn)}
                      title={res.checkIn ? 'Click to Check Out' : 'Click to Check In'}
                      className="inline-flex items-center gap-1.5 transition-transform active:scale-95"
                    >
                      <StatusBadge status={res.checkIn ? 'Occupied' : 'Reserved'} size="sm" />
                      <span className="text-[10px] text-slate-400 hover:text-slate-600">
                        {res.checkIn ? <LogOut className="w-3 h-3 text-rose-500 inline" /> : <LogIn className="w-3 h-3 text-emerald-500 inline" />}
                      </span>
                    </button>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="inline-flex items-center gap-1">
                      <button
                        onClick={() => openInvoiceForReservation(res.id)}
                        title="View & Print Invoice"
                        className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
                      >
                        <FileText className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(res)}
                        title="Edit Reservation"
                        className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Cancel and delete reservation #${res.id} for ${res.firstName} ${res.lastName}?`)) {
                            deleteReservation(res.id);
                          }
                        }}
                        title="Delete Reservation"
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
