import React from 'react';
import { Invoice } from '../../types';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { formatCurrency, maskCardNumber } from '../../utils/formatters';
import { Printer, Download, Hotel, CheckCircle } from 'lucide-react';

export interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice | null;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ isOpen, onClose, invoice }) => {
  if (!invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="2xl">
      <div id="printable-invoice" className="p-2 space-y-6">
        {/* Luxury Hotel Header */}
        <div className="flex items-start justify-between border-b-2 border-slate-900 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-slate-900 text-white">
                <Hotel className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold font-serif text-slate-900 tracking-tight">
                Grand Horizon Luxury Hotel
              </h2>
            </div>
            <p className="text-xs text-slate-500">
              770 Fifth Avenue • Manhattan, NY 10022 • reservations@grandhorizon.com
            </p>
          </div>
          <div className="text-right">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Folio Invoice
            </div>
            <div className="text-lg font-bold font-mono text-slate-900">
              INV-{invoice.reservationId}
            </div>
            <div className="text-xs text-slate-500">
              Date: {new Date().toLocaleDateString()}
            </div>
          </div>
        </div>

        {/* Guest & Stay Details */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
          <div>
            <span className="text-[11px] text-slate-400 uppercase font-semibold block">Guest Name</span>
            <span className="font-bold text-slate-900 text-sm">{invoice.guestName}</span>
          </div>
          <div>
            <span className="text-[11px] text-slate-400 uppercase font-semibold block">Room Assigned</span>
            <span className="font-bold text-slate-900 text-sm">
              Room #{invoice.roomNumber} ({invoice.roomType})
            </span>
          </div>
          <div>
            <span className="text-[11px] text-slate-400 uppercase font-semibold block">Duration of Stay</span>
            <span className="font-bold text-slate-900 text-sm">
              {invoice.nights} Night{invoice.nights > 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {/* Itemized Table */}
        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-4">Description</th>
                <th className="py-2.5 px-4 text-center">Qty / Rate</th>
                <th className="py-2.5 px-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="py-3 px-4 font-medium text-slate-900">
                  {invoice.roomType} Tier Room Accommodation
                </td>
                <td className="py-3 px-4 text-center text-slate-600">
                  {invoice.nights} nights @ {formatCurrency(invoice.baseRate)}/night
                </td>
                <td className="py-3 px-4 text-right font-mono font-medium text-slate-900">
                  {formatCurrency(invoice.roomSubtotal)}
                </td>
              </tr>

              {invoice.guestSurcharge > 0 && (
                <tr>
                  <td className="py-3 px-4 font-medium text-slate-900">
                    Additional Guest Surcharge (Over 2 Guests)
                  </td>
                  <td className="py-3 px-4 text-center text-slate-600">
                    $25.00/guest per night
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-medium text-slate-900">
                    {formatCurrency(invoice.guestSurcharge)}
                  </td>
                </tr>
              )}

              {invoice.breakfastTotal > 0 && (
                <tr>
                  <td className="py-3 px-4 text-slate-700">Breakfast Dining Service</td>
                  <td className="py-3 px-4 text-center text-slate-600">$7.00 per portion</td>
                  <td className="py-3 px-4 text-right font-mono text-slate-800">
                    {formatCurrency(invoice.breakfastTotal)}
                  </td>
                </tr>
              )}

              {invoice.lunchTotal > 0 && (
                <tr>
                  <td className="py-3 px-4 text-slate-700">Lunch Dining Service</td>
                  <td className="py-3 px-4 text-center text-slate-600">$12.00 per portion</td>
                  <td className="py-3 px-4 text-right font-mono text-slate-800">
                    {formatCurrency(invoice.lunchTotal)}
                  </td>
                </tr>
              )}

              {invoice.dinnerTotal > 0 && (
                <tr>
                  <td className="py-3 px-4 text-slate-700">Dinner Dining Service</td>
                  <td className="py-3 px-4 text-center text-slate-600">$15.00 per portion</td>
                  <td className="py-3 px-4 text-right font-mono text-slate-800">
                    {formatCurrency(invoice.dinnerTotal)}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Totals & Tax */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2">
          {/* Payment Method Stamp */}
          <div className="flex items-center gap-3 p-3 rounded-xl border border-emerald-200 bg-emerald-50/50">
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
            <div className="text-xs">
              <span className="font-bold text-emerald-900 block">PAID & SETTLED</span>
              <span className="text-emerald-700">
                {invoice.paymentType} • {maskCardNumber(invoice.cardLast4)}
              </span>
            </div>
          </div>

          <div className="w-full sm:w-64 space-y-1.5 text-xs text-slate-600">
            <div className="flex justify-between">
              <span>Room Subtotal:</span>
              <span className="font-mono">{formatCurrency(invoice.roomSubtotal)}</span>
            </div>
            {invoice.guestSurcharge > 0 && (
              <div className="flex justify-between">
                <span>Guest Surcharge:</span>
                <span className="font-mono">{formatCurrency(invoice.guestSurcharge)}</span>
              </div>
            )}
            {invoice.foodTotal > 0 && (
              <div className="flex justify-between">
                <span>Dining Total:</span>
                <span className="font-mono">{formatCurrency(invoice.foodTotal)}</span>
              </div>
            )}
            <div className="flex justify-between font-medium text-slate-700">
              <span>Hotel & NY Tax (7.00%):</span>
              <span className="font-mono">{formatCurrency(invoice.taxAmount)}</span>
            </div>
            <div className="pt-2 border-t-2 border-slate-900 flex justify-between text-base font-bold text-slate-900">
              <span>Grand Total:</span>
              <span className="font-mono text-emerald-700">{formatCurrency(invoice.finalTotal)}</span>
            </div>
          </div>
        </div>

        {/* Modal Buttons (Hidden in Print) */}
        <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200 print:hidden">
          <Button variant="outline" size="sm" icon={<Printer className="w-4 h-4" />} onClick={handlePrint}>
            Print Folio Invoice
          </Button>
          <Button variant="primary" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};
