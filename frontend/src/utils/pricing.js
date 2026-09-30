export const ROOM_TYPES = {
  Single: { name: 'Single', floor: 1, basePrice: 149, description: 'Cozy room for solo travelers, premium single bed' },
  Double: { name: 'Double', floor: 2, basePrice: 299, description: 'Spacious queen room for couples or individuals' },
  Twin: { name: 'Twin', floor: 3, basePrice: 349, description: 'Two comfortable twin beds, ideal for friends or colleagues' },
  Duplex: { name: 'Duplex', floor: 4, basePrice: 399, description: 'Multi-level luxury suite with dedicated living area' },
  Suite: { name: 'Suite', floor: 5, basePrice: 499, description: 'Presidential panoramic luxury suite with supreme amenities' }
};

export const MEAL_PRICES = {
  breakfast: 7,
  lunch: 15,
  dinner: 15
};

export const TAX_RATE = 0.07; // 7% state & local hotel tax

export function calculateBill({
  roomType = 'Single',
  guests = 1,
  breakfastQty = 0,
  lunchQty = 0,
  dinnerQty = 0,
  nights = 1
}) {
  const roomConfig = ROOM_TYPES[roomType] || ROOM_TYPES.Single;
  let roomSubtotal = roomConfig.basePrice * Math.max(1, nights);

  // Extra guest surcharge from original system: >= 3 guests adds (guests * $5)
  const numGuests = Number(guests) || 1;
  const guestSurcharge = numGuests >= 3 ? numGuests * 5 : 0;
  const roomTotal = roomSubtotal + guestSurcharge;

  // Meal totals
  const breakfastTotal = (Number(breakfastQty) || 0) * MEAL_PRICES.breakfast;
  const lunchTotal = (Number(lunchQty) || 0) * MEAL_PRICES.lunch;
  const dinnerTotal = (Number(dinnerQty) || 0) * MEAL_PRICES.dinner;
  const foodBill = breakfastTotal + lunchTotal + dinnerTotal;

  // 7% tax on room charges
  const taxAmount = Number((roomTotal * TAX_RATE).toFixed(2));
  const finalTotal = Number((roomTotal + taxAmount + foodBill).toFixed(2));

  return {
    basePrice: roomConfig.basePrice,
    nights,
    roomSubtotal,
    guestSurcharge,
    roomTotal,
    breakfastTotal,
    lunchTotal,
    dinnerTotal,
    foodBill,
    taxAmount,
    finalTotal
  };
}
