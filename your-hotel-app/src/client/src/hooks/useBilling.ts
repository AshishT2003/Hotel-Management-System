import { useMemo } from 'react';
import { RoomType, Invoice, Reservation } from '../types';
import { calculateBilling, BillingCalculation, generateInvoiceFromReservation } from '../utils/billing';

export function useBilling(
  roomType: RoomType,
  numberGuests: number,
  arrivalDate: string | Date,
  leavingDate: string | Date,
  breakfast = 0,
  lunch = 0,
  dinner = 0
): BillingCalculation {
  return useMemo(() => {
    return calculateBilling(
      roomType,
      numberGuests,
      arrivalDate,
      leavingDate,
      breakfast,
      lunch,
      dinner
    );
  }, [roomType, numberGuests, arrivalDate, leavingDate, breakfast, lunch, dinner]);
}

export function useInvoice(reservation: Reservation | null): Invoice | null {
  return useMemo(() => {
    if (!reservation) return null;
    return generateInvoiceFromReservation(reservation);
  }, [reservation]);
}
