import React, { useState } from 'react';
import { Check, CheckCircle2, ShieldCheck, Printer, Copy, ArrowRight } from 'lucide-react';

const DEFAULT_RESERVATION = {
  confirmationCode: "GH-1017-2026",
  status: "Reserved",
  issuedAt: "30 Sep 2026, 10:49 AM",

  guest: {
    fullName: "Ashish Thombare",
    phone: "9322835251",
    email: "ashuthombare7503@gmail.com",
  },

  stay: {
    roomNumber: "102",
    roomType: "Single Suite",
    floor: "1",
    checkIn: "30 Sep 2026, 3:00 PM",
    checkOut: "02 Oct 2026, 11:00 AM",
  },

  charges: [
    { label: "Room Charges", amount: 298.0 },
    { label: "Dining Packages", amount: 34.0 },
    { label: "Sweet Surprise Amenity", amount: 25.0 },
    { label: "Hotel Occupancy Tax (7%)", amount: 24.99 },
  ],

  currency: "USD",
  totalAmount: 381.99,

  cancellationPolicy:
    "You may cancel this booking with a 100% full refund up to 48 hours before check-in.",
};

export function BookingConfirmationReceipt({
  reservation = DEFAULT_RESERVATION,
  onReset,
  onGoToDashboard,
  onGoToLogin
}) {
  const [copied, setCopied] = useState(false);

  const res = {
    ...DEFAULT_RESERVATION,
    ...reservation,
    guest: { ...DEFAULT_RESERVATION.guest, ...(reservation?.guest || {}) },
    stay: { ...DEFAULT_RESERVATION.stay, ...(reservation?.stay || {}) },
    charges: reservation?.charges?.length ? reservation.charges : DEFAULT_RESERVATION.charges
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopy = () => {
    if (res.confirmationCode) {
      navigator.clipboard.writeText(res.confirmationCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    }
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* Print-specific style tag ensuring single-page A4 output */}
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 14mm 16mm 14mm 16mm;
          }
          html, body {
            background: #ffffff !important;
            color: #0F172A !important;
            margin: 0 !important;
            padding: 0 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          /* Hide all page elements outside the receipt */
          header, nav, aside, footer, .print\\:hidden {
            display: none !important;
          }
          #booking-confirmation-receipt {
            box-shadow: none !important;
            border: 1px solid #E2E8F0 !important;
            max-width: 100% !important;
            width: 100% !important;
            margin: 0 auto !important;
            padding: 20px 24px !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
        }
      `}</style>

      {/* Screen Control Bar (Hidden on print) */}
      <div className="w-full max-w-3xl mb-5 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Executive A4 Invoice Ready
          </span>
          <span className="text-xs text-slate-400 hidden sm:inline">
            Single-page print optimized
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleCopy}
            className="py-2 px-3.5 rounded-xl bg-[#0f1b2e] hover:bg-[#16253c] text-slate-200 border border-[#1e2a40] text-xs font-semibold flex items-center gap-1.5 transition"
            title="Copy Confirmation Code"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-bold">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span>Copy Code</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="py-2 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 text-xs font-bold shadow-md shadow-emerald-500/20 flex items-center gap-1.5 transition"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Official Receipt</span>
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* THE LUXURY A4 EXECUTIVE INVOICE RECEIPT                        */}
      {/* ============================================================== */}
      <article
        id="booking-confirmation-receipt"
        className="w-full max-w-3xl bg-white text-[#0F172A] rounded-2xl border border-[#E2E8F0] shadow-xl p-6 sm:p-8 space-y-5 font-sans leading-relaxed selection:bg-emerald-100"
      >
        {/* 1. TOP HEADER */}
        <header className="pb-4 border-b border-[#B88A2A]/40 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="text-xl font-black tracking-wider text-[#0F172A] leading-none uppercase">
              <span className="maharaja-brand-animated">MAHARAJA Hotel</span>
            </div>
            <div className="text-[10px] font-bold tracking-[0.25em] text-[#B88A2A] uppercase mt-1">
              PALACE &amp; RESORT
            </div>
            <address className="not-italic text-xs text-[#64748B] mt-1.5 leading-snug">
              742 Horizon Boulevard, Luxury District
            </address>
          </div>

          <div className="sm:text-right">
            <div className="text-xs font-extrabold tracking-widest text-[#0F172A] uppercase">
              BOOKING CONFIRMATION
            </div>
            <div className="text-xs text-[#64748B] mt-1">
              Confirmation Code:{' '}
              <strong className="font-mono font-bold text-[#0F172A] text-sm">
                {res.confirmationCode}
              </strong>
            </div>
            <div className="text-[11px] text-[#94A3B8] mt-0.5">
              Issued: {res.issuedAt}
            </div>
          </div>
        </header>

        {/* 2. CONFIRMATION STATUS BANNER */}
        <section
          aria-label="Confirmation Status"
          className="bg-[#ECFDF5] border border-[#A7F3D0] rounded-xl p-3.5 sm:p-4 flex items-center justify-between gap-3"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#047857] text-white flex items-center justify-center shrink-0 shadow-sm">
              <Check className="w-4 h-4 stroke-[3]" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-[#065F46] leading-tight">
                Booking Successfully Confirmed
              </h2>
              <p className="text-xs text-[#047857] mt-0.5">
                We look forward to welcoming you.
              </p>
            </div>
          </div>

          <span className="bg-[#047857] text-white text-[11px] font-extrabold tracking-widest px-3 py-1 rounded-full uppercase shrink-0">
            {res.status || 'RESERVED'}
          </span>
        </section>

        {/* 3. GUEST AND STAY DETAILS */}
        <section aria-label="Guest and Stay Information" className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Guest Information Card */}
          <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-3.5 sm:p-4 space-y-2.5">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#64748B] pb-1.5 border-b border-[#E2E8F0]">
              GUEST INFORMATION
            </h3>
            <div className="space-y-1.5 text-xs">
              <div>
                <span className="text-[#64748B] text-[11px] block">Guest Name</span>
                <strong className="text-[#0F172A] text-sm font-bold block">
                  {res.guest.fullName}
                </strong>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div>
                  <span className="text-[#64748B] text-[11px] block">Phone</span>
                  <span className="text-[#0F172A] font-medium block">
                    {res.guest.phone}
                  </span>
                </div>
                <div>
                  <span className="text-[#64748B] text-[11px] block">Email</span>
                  <span className="text-[#0F172A] font-medium block truncate" title={res.guest.email}>
                    {res.guest.email}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Stay Information Card */}
          <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-3.5 sm:p-4 space-y-2.5">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#64748B] pb-1.5 border-b border-[#E2E8F0]">
              STAY INFORMATION
            </h3>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between items-baseline">
                <div>
                  <span className="text-[#64748B] text-[11px] block">Assigned Suite</span>
                  <strong className="text-[#0F172A] text-sm font-bold block">
                    Room {res.stay.roomNumber} — {res.stay.roomType}
                  </strong>
                </div>
                <span className="text-[11px] font-bold text-[#64748B] bg-white border border-[#E2E8F0] px-2 py-0.5 rounded">
                  Floor {res.stay.floor}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div>
                  <span className="text-[#64748B] text-[11px] block">Check-In</span>
                  <span className="text-[#0F172A] font-medium block">
                    {res.stay.checkIn}
                  </span>
                </div>
                <div>
                  <span className="text-[#64748B] text-[11px] block">Check-Out</span>
                  <span className="text-[#0F172A] font-medium block">
                    {res.stay.checkOut}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. ITEMIZED CHARGES / INVOICE TABLE */}
        <section aria-label="Stay Charges">
          <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#64748B] mb-2">
            STAY CHARGES
          </h3>

          <div className="overflow-hidden rounded-xl border border-[#E2E8F0]">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#64748B]">
                  <th scope="col" className="py-2.5 px-4 font-bold text-[11px] uppercase tracking-wider">
                    Description
                  </th>
                  <th scope="col" className="py-2.5 px-4 font-bold text-[11px] uppercase tracking-wider text-right">
                    Amount ({res.currency || 'USD'})
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9]">
                {res.charges.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-2.5 px-4 text-[#0F172A] font-medium">
                      {item.label}
                    </td>
                    <td className="py-2.5 px-4 text-[#0F172A] font-mono text-right tabular-nums">
                      ${Number(item.amount).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-[#E2E8F0] bg-[#F8FAFC]">
                  <td className="py-3 px-4 font-bold text-[#0F172A] text-xs uppercase tracking-wider">
                    TOTAL AMOUNT
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="font-mono text-xl sm:text-2xl font-black text-[#047857] tabular-nums">
                      ${Number(res.totalAmount).toFixed(2)}
                    </span>
                    <span className="text-[11px] font-semibold text-[#64748B] ml-1.5 uppercase">
                      {res.currency || 'USD'}
                    </span>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </section>

        {/* 5. CANCELLATION POLICY */}
        <section
          aria-label="Cancellation Policy"
          className="bg-[#F0FDF4] border border-[#BBF7D0] rounded-xl p-3 sm:p-3.5 flex items-start gap-2.5"
        >
          <ShieldCheck className="w-4 h-4 text-[#047857] mt-0.5 shrink-0" />
          <div className="text-xs">
            <span className="font-bold text-[#166534] block">
              Flexible Cancellation Policy
            </span>
            <p className="text-[11.5px] text-[#15803D] mt-0.5 leading-snug">
              {res.cancellationPolicy}
            </p>
          </div>
        </section>

        {/* 6. BOTTOM FOOTER */}
        <footer className="pt-3 border-t border-[#E2E8F0] space-y-1.5 text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[#64748B] gap-1">
            <span className="font-semibold text-[#0F172A]">
              Thank you for choosing MAHARAJA Hotel.
            </span>
            <span>
              Concierge:{' '}
              <strong className="text-[#0F172A] font-semibold">
                +1 (800) 555-PALACE
              </strong>
            </span>
          </div>

          <p className="text-[10.5px] text-[#64748B] leading-tight">
            Please present confirmation code{' '}
            <strong className="text-[#0F172A] font-mono font-bold">
              {res.confirmationCode}
            </strong>{' '}
            with a valid photo ID upon arrival at the Front Desk.
          </p>

          <div className="text-[10px] text-[#94A3B8] pt-1">
            &copy; {new Date().getFullYear()} MAHARAJA Hotel &middot; Palace &amp; Resort
          </div>
        </footer>
      </article>

      {/* Screen Navigation Actions (Hidden on print) */}
      <div className="w-full max-w-3xl mt-5 flex items-center justify-between gap-3 print:hidden">
        <button
          type="button"
          onClick={onReset}
          className="py-2.5 px-4 rounded-xl bg-[#0f1b2e] hover:bg-[#16253c] text-slate-200 border border-[#1e2a40] text-xs font-semibold transition"
        >
          Book Another Room
        </button>

        <div className="flex items-center gap-3">
          {onGoToDashboard && (
            <button
              type="button"
              onClick={onGoToDashboard}
              className="py-2.5 px-5 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 shadow-md shadow-emerald-500/20 flex items-center gap-1.5 transition"
            >
              <span>Go to My Guest Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}

          {onGoToLogin && (
            <button
              type="button"
              onClick={onGoToLogin}
              className="text-xs text-slate-400 hover:text-white transition underline"
            >
              Staff Portal Sign In
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default BookingConfirmationReceipt;
