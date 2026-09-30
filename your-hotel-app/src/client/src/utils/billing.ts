import { ROOM_PRICES, MEAL_PRICES, TAX_RATE, EXTRA_GUEST_SURCHARGE } from '../constants';
import { Reservation, RoomType, Invoice } from '../types';

export interface BillingCalculation {
  nights: number;
  baseRate: number;
  roomSubtotal: number;
  guestSurcharge: number;
  breakfastTotal: number;
  lunchTotal: number;
  dinnerTotal: number;
  foodTotal: number;
  taxableSubtotal: number;
  taxAmount: number;
  finalTotal: number;
}

export function calculateBilling(
  roomType: RoomType,
  numberGuests: number,
  arrivalDate: string | Date,
  leavingDate: string | Date,
  breakfast = 0,
  lunch = 0,
  dinner = 0
): BillingCalculation {
  const arrival = new Date(arrivalDate);
  const leaving = new Date(leavingDate);
  
  const diffTime = leaving.getTime() - arrival.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const nights = Math.max(1, isNaN(diffDays) ? 1 : diffDays);

  const baseRate = ROOM_PRICES[roomType] || 149.0;
  const roomSubtotal = baseRate * nights;

  // Extra guest surcharge: For G >= 3, add (G - 2) * $25 per night
  const extraGuests = Math.max(0, numberGuests - 2);
  const guestSurcharge = extraGuests * EXTRA_GUEST_SURCHARGE * nights;

  const breakfastTotal = breakfast * MEAL_PRICES.breakfast;
  const lunchTotal = lunch * MEAL_PRICES.lunch;
  const dinnerTotal = dinner * MEAL_PRICES.dinner;
  const foodTotal = breakfastTotal + lunchTotal + dinnerTotal;

  const taxableSubtotal = roomSubtotal + guestSurcharge + foodTotal;
  const taxAmount = Math.round(taxableSubtotal * TAX_RATE * 100) / 100;
  const finalTotal = Math.round((taxableSubtotal + taxAmount) * 100) / 100;

  return {
    nights,
    baseRate,
    roomSubtotal,
    guestSurcharge,
    breakfastTotal,
    lunchTotal,
    dinnerTotal,
    foodTotal,
    taxableSubtotal,
    taxAmount,
    finalTotal,
  };
}

export function generateInvoiceFromReservation(reservation: Reservation): Invoice {
  const calc = calculateBilling(
    reservation.roomType,
    reservation.numberGuest,
    reservation.arrivalTime,
    reservation.leavingTime,
    reservation.breakfast,
    reservation.lunch,
    reservation.dinner
  );

  const card = (reservation.cardNumber || '').trim();
  const cardLast4 = card.length >= 4 ? card.slice(-4) : '••••';

  return {
    reservationId: reservation.id,
    guestName: `${reservation.firstName} ${reservation.lastName}`.trim(),
    roomNumber: reservation.roomNumber,
    roomType: reservation.roomType,
    nights: calc.nights,
    baseRate: calc.baseRate,
    roomSubtotal: calc.roomSubtotal,
    guestSurcharge: calc.guestSurcharge,
    breakfastTotal: calc.breakfastTotal,
    lunchTotal: calc.lunchTotal,
    dinnerTotal: calc.dinnerTotal,
    foodTotal: calc.foodTotal,
    taxAmount: calc.taxAmount,
    finalTotal: calc.finalTotal,
    paymentType: reservation.paymentType || 'Credit Card',
    cardLast4,
  };
}
