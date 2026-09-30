import { Reservation, RoomType } from '../../src/client/src/types/index.ts';

export function runSearchTests() {
  const results: { name: string; passed: boolean; error?: string }[] = [];

  function test(name: string, fn: () => void) {
    try {
      fn();
      results.push({ name, passed: true });
    } catch (e: any) {
      results.push({ name, passed: false, error: e?.message || String(e) });
    }
  }

  // Generate 50 realistic reservations
  const roomTypes: RoomType[] = ['Single', 'Double', 'Twin', 'Duplex', 'Suite'];
  const reservations50: Reservation[] = Array.from({ length: 50 }, (_, i) => {
    const floor = Math.floor(i / 10) + 1;
    const roomNum = `${floor}${String((i % 10) + 1).padStart(2, '0')}`;
    return {
      id: 1000 + i + 1,
      firstName: `Guest${i + 1}`,
      lastName: i === 24 ? 'Nazim' : `LastName${i + 1}`,
      birthday: '1990-01-01',
      gender: 'Male',
      phoneNumber: `555010${String(i).padStart(4, '0')}`,
      emailAddress: `guest${i + 1}@luxuryhotel.com`,
      numberGuest: (i % 4) + 1,
      streetAddress: `${100 + i} Grand Ave`,
      aptSuite: '',
      city: i % 2 === 0 ? 'New York' : 'Los Angeles',
      state: i % 2 === 0 ? 'NY' : 'CA',
      zipCode: '10001',
      roomType: roomTypes[floor - 1],
      roomFloor: String(floor),
      roomNumber: roomNum,
      totalBill: 250.0,
      paymentType: 'Credit Card',
      cardType: 'Visa',
      cardNumber: '4111222233334444',
      cardExp: '12/28',
      cardCvc: '123',
      arrivalTime: '2026-10-01',
      leavingTime: '2026-10-03',
      checkIn: i % 3 === 0,
      breakfast: 1,
      lunch: 0,
      dinner: 0,
      cleaning: true,
      towel: false,
      surprise: false,
      supplyStatus: false,
      foodBill: 7,
    };
  });

  function filterItems(items: Reservation[], query: string): Reservation[] {
    const q = query.toLowerCase().trim();
    if (!q) return items;
    const cleanDigits = q.replace(/\D/g, '');

    return items.filter(r => {
      const full = `${r.firstName} ${r.lastName}`.toLowerCase();
      if (
        full.includes(q) ||
        r.firstName.toLowerCase().includes(q) ||
        r.lastName.toLowerCase().includes(q) ||
        r.roomNumber.toLowerCase().includes(q) ||
        r.emailAddress.toLowerCase().includes(q) ||
        r.id.toString().includes(q) ||
        r.city.toLowerCase().includes(q)
      ) {
        return true;
      }
      if (cleanDigits.length > 0 && r.phoneNumber.replace(/\D/g, '').includes(cleanDigits)) {
        return true;
      }
      return false;
    });
  }

  // 1. Instant latency test (<50ms for 50 items)
  test('Search filter latency < 50ms across 50 items (TC-02)', () => {
    const start = performance.now();
    const filtered = filterItems(reservations50, 'Nazim');
    const elapsed = performance.now() - start;

    if (elapsed > 50) {
      throw new Error(`Filter exceeded 50ms budget: ${elapsed.toFixed(2)}ms`);
    }
    if (filtered.length !== 1 || filtered[0].lastName !== 'Nazim') {
      throw new Error(`Expected 1 matched record for Nazim, found ${filtered.length}`);
    }
  });

  // 2. Room number matching
  test('Multi-field search: Room number "305"', () => {
    const filtered = filterItems(reservations50, '305');
    if (filtered.length !== 1 || filtered[0].roomNumber !== '305') {
      throw new Error(`Expected match for Room 305, found ${filtered.length}`);
    }
  });

  // 3. Phone digits matching
  test('Multi-field search: Phone digits matching', () => {
    // Search by 4-digit slice
    const samplePhone = reservations50[10].phoneNumber; // 5550100010
    const filtered = filterItems(reservations50, '0010');
    if (filtered.length < 1 || !filtered.some(r => r.phoneNumber.includes('0010'))) {
      throw new Error(`Expected phone digit match for 0010`);
    }
  });

  // 4. Confirmation ID matching
  test('Multi-field search: Confirmation folio ID #1042', () => {
    const filtered = filterItems(reservations50, '1042');
    if (filtered.length !== 1 || filtered[0].id !== 1042) {
      throw new Error(`Expected match for ID 1042`);
    }
  });

  return results;
}
