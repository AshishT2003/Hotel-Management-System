import { calculateBilling } from '../../src/client/src/utils/billing.ts';
import { ROOM_PRICES, MEAL_PRICES, TAX_RATE } from '../../src/client/src/constants/index.ts';

export function runBillingTests() {
  const results: { name: string; passed: boolean; error?: string }[] = [];

  function test(name: string, fn: () => void) {
    try {
      fn();
      results.push({ name, passed: true });
    } catch (e: any) {
      results.push({ name, passed: false, error: e?.message || String(e) });
    }
  }

  function assertEqual(actual: any, expected: any, message: string) {
    if (actual !== expected) {
      throw new Error(`${message}: Expected ${expected}, got ${actual}`);
    }
  }

  function assertCloseTo(actual: number, expected: number, delta: number, message: string) {
    if (Math.abs(actual - expected) > delta) {
      throw new Error(`${message}: Expected ~${expected}, got ${actual}`);
    }
  }

  // 1. Single room base rate
  test('Single room base rate for 1 night', () => {
    const calc = calculateBilling('Single', 1, '2026-10-01', '2026-10-02');
    assertEqual(calc.baseRate, 149.0, 'Base rate');
    assertEqual(calc.nights, 1, 'Nights');
    assertEqual(calc.roomSubtotal, 149.0, 'Room subtotal');
    assertEqual(calc.guestSurcharge, 0, 'Guest surcharge');
    assertEqual(calc.foodTotal, 0, 'Food total');
    assertCloseTo(calc.taxAmount, 10.43, 0.01, 'Tax amount 7%');
    assertCloseTo(calc.finalTotal, 159.43, 0.01, 'Final total');
  });

  // 2. Multi-night scaling
  test('Multi-night scaling: 3 nights of Double', () => {
    const calc = calculateBilling('Double', 2, '2026-10-01', '2026-10-04');
    assertEqual(calc.nights, 3, 'Nights');
    assertEqual(calc.roomSubtotal, 299.0 * 3, 'Room subtotal (897)');
    assertEqual(calc.guestSurcharge, 0, 'Guest surcharge');
    assertCloseTo(calc.taxAmount, 897.0 * 0.07, 0.01, 'Tax amount');
    assertCloseTo(calc.finalTotal, 897.0 * 1.07, 0.01, 'Final total');
  });

  // 3. Extra guest surcharge (>2 guests = +$25/night each)
  test('Extra guest surcharge: 4 guests in Suite for 2 nights', () => {
    // 4 guests -> (4 - 2) = 2 extra guests * $25 * 2 nights = $100
    const calc = calculateBilling('Suite', 4, '2026-10-01', '2026-10-03');
    assertEqual(calc.nights, 2, 'Nights');
    assertEqual(calc.roomSubtotal, 499.0 * 2, 'Room subtotal (998)');
    assertEqual(calc.guestSurcharge, 100.0, 'Guest surcharge (100)');
    const expectedSubtotal = 998.0 + 100.0;
    assertCloseTo(calc.taxAmount, expectedSubtotal * 0.07, 0.01, 'Tax amount');
    assertCloseTo(calc.finalTotal, expectedSubtotal * 1.07, 0.01, 'Final total');
  });

  // 4. Food bill itemization
  test('Food bill itemization: breakfast $7, lunch $12, dinner $15', () => {
    const calc = calculateBilling('Twin', 2, '2026-10-01', '2026-10-02', 3, 2, 1);
    assertEqual(calc.breakfastTotal, 21.0, '3 breakfasts @ $7');
    assertEqual(calc.lunchTotal, 24.0, '2 lunches @ $12');
    assertEqual(calc.dinnerTotal, 15.0, '1 dinner @ $15');
    assertEqual(calc.foodTotal, 60.0, 'Food total');
    const taxable = 349.0 + 60.0;
    assertCloseTo(calc.taxAmount, taxable * 0.07, 0.01, 'Tax amount');
    assertCloseTo(calc.finalTotal, taxable * 1.07, 0.01, 'Final total');
  });

  // 5. TC-04 exact formula verification matching backend
  test('TC-04 formula accuracy: Suite 2 nights, 3 guests, 2 breakfasts, 1 dinner', () => {
    const calc = calculateBilling('Suite', 3, '2026-10-01', '2026-10-03', 2, 0, 1);
    assertEqual(calc.roomSubtotal, 998.0, 'Room subtotal');
    assertEqual(calc.foodTotal, 29.0, 'Food bill: (2 * 7) + 15 = 29');
    // Formula verifies $1.07 * (R + E + M)
    assertCloseTo(calc.taxAmount, calc.taxableSubtotal * 0.07, 0.01, '7% tax');
    assertCloseTo(calc.finalTotal, calc.taxableSubtotal * 1.07, 0.01, 'Final total');
  });

  // 6. Edge cases: 0 nights clamped to 1, negative guest count clamped
  test('Edge cases: same-day check-in/out clamped to 1 night', () => {
    const calc = calculateBilling('Single', 0, '2026-10-01', '2026-10-01');
    assertEqual(calc.nights, 1, 'Clamped to 1 night');
    assertEqual(calc.guestSurcharge, 0, 'No surcharge for <=2 guests');
    assertEqual(calc.roomSubtotal, 149.0, 'Base 1 night');
  });

  return results;
}
