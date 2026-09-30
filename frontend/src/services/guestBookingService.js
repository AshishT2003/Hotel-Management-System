import { storageService } from './storageService';

const ROOM_CONFIG = [
  {
    floor: 1,
    type: 'Single',
    rate: 149,
    capacity: 1,
    size: '220 sq ft',
    bed: '1 Full Bed',
    image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80',
    description: 'Cozy and quiet sanctuary designed for solo executives and leisure travelers.',
    amenities: ['High-Speed WiFi', 'Air Conditioning', 'HD Smart TV', 'Work Desk'],
    rooms: ['101', '102', '103', '104', '105', '106', '107', '108', '109', '110']
  },
  {
    floor: 2,
    type: 'Double',
    rate: 299,
    capacity: 2,
    size: '350 sq ft',
    bed: '1 Queen Bed',
    image: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800&q=80',
    description: 'Elegant comfort with private balcony views and premium minibar refreshments.',
    amenities: ['High-Speed WiFi', 'Air Conditioning', 'HD Smart TV', 'Mini Bar', 'Balcony View'],
    rooms: ['201', '202', '203', '204', '205', '206', '207', '208', '209', '210']
  },
  {
    floor: 3,
    type: 'Twin',
    rate: 349,
    capacity: 2,
    size: '380 sq ft',
    bed: '2 Twin Queen Beds',
    image: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=800&q=80',
    description: 'Spacious dual-bed configuration with artisan espresso maker and garden courtyard views.',
    amenities: ['High-Speed WiFi', 'Dual Queen Beds', 'Air Conditioning', 'Mini Fridge', 'Espresso Maker'],
    rooms: ['301', '302', '303', '304', '305', '306', '307', '308', '309', '310']
  },
  {
    floor: 4,
    type: 'Duplex',
    rate: 399,
    capacity: 4,
    size: '540 sq ft',
    bed: '2 King Loft Beds',
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
    description: 'Architectural two-level loft with soaring ceilings and panoramic skyline vistas.',
    amenities: ['High-Speed WiFi', 'Two-Level Loft', 'Panoramic Skyline View', 'Mini Bar', 'Luxury Tub'],
    rooms: ['401', '402', '403', '404', '405', '406', '407', '408', '409', '410']
  },
  {
    floor: 5,
    type: 'Suite',
    rate: 499,
    capacity: 6,
    size: '780 sq ft',
    bed: 'Master King Suite + Living',
    image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80',
    description: 'The pinnacle of luxury hospitality featuring private jacuzzi, butler service, and fine champagne.',
    amenities: ['High-Speed WiFi', 'Executive Living Room', 'King Master Bed', 'Jacuzzi', 'Butler Service', 'Complimentary Champagne'],
    rooms: ['501', '502', '503', '504', '505', '506', '507', '508', '509', '510']
  }
];

export const calculateBillBreakdown = ({
  baseRate = 149,
  checkIn,
  checkOut,
  guests = { adults: 1, children: 0 },
  diningPerks = [],
  amenities = []
}) => {
  const dIn = new Date(checkIn);
  const dOut = new Date(checkOut);
  const diffMs = Math.max(86400000, dOut.getTime() - dIn.getTime());
  const nights = Math.max(1, Math.round(diffMs / (1000 * 60 * 60 * 24)));

  const roomTotal = baseRate * nights;

  const totalGuests = (Number(guests.adults) || 1) + (Number(guests.children) || 0);
  const extraGuests = Math.max(0, totalGuests - 2);
  const extraGuestSurcharge = extraGuests * 25 * nights;

  let diningTotal = 0;
  if (Array.isArray(diningPerks)) {
    diningPerks.forEach(item => {
      const q = Number(item.quantity) || 0;
      if (item.type?.toLowerCase() === 'breakfast') diningTotal += q * 7;
      if (item.type?.toLowerCase() === 'lunch') diningTotal += q * 12;
      if (item.type?.toLowerCase() === 'dinner') diningTotal += q * 15;
    });
  }

  const hasSurprise = Array.isArray(amenities) && amenities.some(a => 
    typeof a === 'string' && a.toLowerCase().includes('surprise')
  );
  const amenitiesTotal = hasSurprise ? 25 : 0;

  const subtotal = roomTotal + extraGuestSurcharge + diningTotal + amenitiesTotal;
  const tax = Math.round(subtotal * 0.07 * 100) / 100;
  const total = Math.round((subtotal + tax) * 100) / 100;

  return {
    nights,
    roomTotal,
    extraGuests,
    extraGuestSurcharge,
    diningTotal,
    amenitiesTotal,
    subtotal,
    tax,
    total
  };
};

export function registerGuestAccount({ email, password, firstName, lastName, phone }) {
  if (!email) return;
  try {
    const KEY = 'hotel_guest_accounts';
    const raw = localStorage.getItem(KEY);
    const accounts = raw ? JSON.parse(raw) : [];
    const cleanEmail = email.trim().toLowerCase();
    const existingIndex = accounts.findIndex(a => a.email.toLowerCase() === cleanEmail);
    const record = {
      email: cleanEmail,
      username: cleanEmail,
      password: password || 'guest',
      name: `${firstName || ''} ${lastName || ''}`.trim() || 'Valued Guest',
      phone: phone || '',
      role: 'guest',
      updatedAt: new Date().toISOString()
    };
    if (existingIndex > -1) {
      accounts[existingIndex] = { ...accounts[existingIndex], ...record };
    } else {
      accounts.push(record);
    }
    localStorage.setItem(KEY, JSON.stringify(accounts));
  } catch (err) {
    console.error('Error saving guest account:', err);
  }
}

export const guestBookingService = {
  getRoomConfigurations: () => ROOM_CONFIG,

  getAvailableRooms: async (checkIn, checkOut, guestCount = 1) => {
    try {
      const params = new URLSearchParams({
        checkIn: typeof checkIn === 'string' ? checkIn : new Date(checkIn).toISOString().split('T')[0],
        checkOut: typeof checkOut === 'string' ? checkOut : new Date(checkOut).toISOString().split('T')[0],
        guests: guestCount.toString()
      });
      const res = await fetch(`/api/guest/rooms/available?${params.toString()}`);
      if (res.ok) {
        const apiRooms = await res.json();
        // Enrich API rooms with imagery and descriptive metadata
        return apiRooms.map(r => {
          const cfg = ROOM_CONFIG.find(c => c.type.toLowerCase() === r.type.toLowerCase()) || ROOM_CONFIG[0];
          return {
            ...r,
            image: cfg.image,
            size: cfg.size,
            bed: cfg.bed,
            description: cfg.description,
            amenities: r.amenities?.length ? r.amenities : cfg.amenities
          };
        });
      }
    } catch {
      // Backend unavailable, fallback to local storage
    }

    // Local DB calculation
    const reservations = storageService.getReservations();
    const dIn = new Date(checkIn).getTime();
    const dOut = new Date(checkOut).getTime();

    const overlappingRooms = new Set();
    reservations.forEach(r => {
      if (r.status === 'Cancelled') return;
      const rIn = new Date(r.arrivalTime).getTime();
      const rOut = new Date(r.leavingTime).getTime();
      // Overlap condition
      if (!(rOut <= dIn || rIn >= dOut)) {
        overlappingRooms.add(String(r.roomNumber).trim());
      }
    });

    const result = [];
    ROOM_CONFIG.forEach(cfg => {
      const freeOfType = cfg.rooms.filter(num => !overlappingRooms.has(num));
      cfg.rooms.forEach(num => {
        const isFree = !overlappingRooms.has(num);
        result.push({
          roomId: Number(num),
          roomNumber: num,
          type: cfg.type,
          floor: cfg.floor,
          baseRate: cfg.rate,
          capacity: cfg.capacity,
          size: cfg.size,
          bed: cfg.bed,
          image: cfg.image,
          description: cfg.description,
          amenities: cfg.amenities,
          available: isFree,
          urgencyBadge: isFree && freeOfType.length <= 2 ? `Only ${freeOfType.length} rooms left!` : null
        });
      });
    });

    return result;
  },

  createBooking: async (payload) => {
    // Automatically register/update guest account so user can log in with their email and chosen password
    if (payload?.guestInfo?.email) {
      registerGuestAccount({
        email: payload.guestInfo.email,
        password: payload.guestInfo.password,
        firstName: payload.guestInfo.firstName,
        lastName: payload.guestInfo.lastName,
        phone: payload.guestInfo.phone
      });
    }

    try {
      const res = await fetch('/api/guest/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const data = await res.json();
        // Also sync local storage so staff portal displays it immediately
        storageService.addReservation({
          firstName: payload.guestInfo.firstName,
          lastName: payload.guestInfo.lastName,
          phoneNumber: payload.guestInfo.phone,
          emailAddress: payload.guestInfo.email,
          password: payload.guestInfo.password,
          numberGuest: (payload.guests?.adults || 1) + (payload.guests?.children || 0),
          roomType: payload.roomType || 'Standard',
          roomFloor: payload.floor || 1,
          roomNumber: payload.roomNumber,
          totalBill: data.totalAmount,
          paymentType: payload.paymentMethod || 'PayAtHotel',
          arrivalTime: payload.checkIn,
          leavingTime: payload.checkOut,
          checkIn: false,
          breakfast: payload.diningPerks?.find(d => d.type === 'Breakfast')?.quantity || 0,
          lunch: payload.diningPerks?.find(d => d.type === 'Lunch')?.quantity || 0,
          dinner: payload.diningPerks?.find(d => d.type === 'Dinner')?.quantity || 0,
          cleaning: payload.amenities?.some(a => a.toLowerCase().includes('cleaning')) || false,
          towel: payload.amenities?.some(a => a.toLowerCase().includes('towel')) || false,
          surprise: payload.amenities?.some(a => a.toLowerCase().includes('surprise')) || false,
          supplyStatus: false,
          foodBill: data.breakdown?.diningTotal || 0,
          confirmationCode: data.confirmationCode,
          bookingSource: 'Guest Portal',
          status: 'Reserved'
        });
        return data;
      }
    } catch {
      // Backend down, use local fallback
    }

    // Fallback local booking
    const cfg = ROOM_CONFIG.find(c => c.rooms.includes(payload.roomNumber)) || ROOM_CONFIG[0];
    const bill = calculateBillBreakdown({
      baseRate: cfg.rate,
      checkIn: payload.checkIn,
      checkOut: payload.checkOut,
      guests: payload.guests,
      diningPerks: payload.diningPerks,
      amenities: payload.amenities
    });

    const newRes = storageService.addReservation({
      firstName: payload.guestInfo.firstName,
      lastName: payload.guestInfo.lastName,
      phoneNumber: payload.guestInfo.phone,
      emailAddress: payload.guestInfo.email.toLowerCase(),
      password: payload.guestInfo.password,
      numberGuest: (payload.guests?.adults || 1) + (payload.guests?.children || 0),
      roomType: cfg.type,
      roomFloor: cfg.floor,
      roomNumber: payload.roomNumber,
      totalBill: bill.total,
      paymentType: payload.paymentMethod || 'PayAtHotel',
      arrivalTime: payload.checkIn,
      leavingTime: payload.checkOut,
      checkIn: false,
      breakfast: payload.diningPerks?.find(d => d.type === 'Breakfast')?.quantity || 0,
      lunch: payload.diningPerks?.find(d => d.type === 'Lunch')?.quantity || 0,
      dinner: payload.diningPerks?.find(d => d.type === 'Dinner')?.quantity || 0,
      cleaning: payload.amenities?.some(a => a.toLowerCase().includes('cleaning')) || false,
      towel: payload.amenities?.some(a => a.toLowerCase().includes('towel')) || false,
      surprise: payload.amenities?.some(a => a.toLowerCase().includes('surprise')) || false,
      supplyStatus: false,
      foodBill: bill.diningTotal,
      bookingSource: 'Guest Portal',
      status: 'Reserved'
    });

    const confirmationCode = `GH-${newRes.id}-${new Date().getFullYear()}`;
    storageService.updateReservation(newRes.id, { confirmationCode });

    return {
      reservationId: newRes.id,
      confirmationCode,
      status: 'Reserved',
      totalAmount: bill.total,
      breakdown: bill,
      bookingSource: 'Guest Portal',
      paymentStatus: 'Pending',
      cancellationPolicy: 'Free cancellation up to 48 hours before check-in'
    };
  },

  getBookingsByEmail: async (email) => {
    try {
      const res = await fetch(`/api/guest/bookings/${encodeURIComponent(email)}`);
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Backend down, use local fallback
    }

    const cleanEmail = email.trim().toLowerCase();
    const list = storageService.getReservations();
    const nowMs = Date.now();
    const h48Ms = 48 * 60 * 60 * 1000;

    return list
      .filter(r => r.emailAddress?.toLowerCase() === cleanEmail)
      .map(r => {
        const arrivalMs = new Date(r.arrivalTime).getTime();
        return {
          reservationId: r.id,
          confirmationCode: r.confirmationCode || `GH-${r.id}-${new Date(r.arrivalTime).getFullYear()}`,
          roomNumber: r.roomNumber,
          roomType: r.roomType,
          checkIn: r.arrivalTime,
          checkOut: r.leavingTime,
          status: r.status || (r.checkIn ? 'In Room' : 'Reserved'),
          totalAmount: r.totalBill,
          bookingSource: r.bookingSource || 'Guest Portal',
          canCancel: arrivalMs - nowMs > h48Ms && r.status !== 'Cancelled'
        };
      })
      .sort((a, b) => b.reservationId - a.reservationId);
  },

  cancelBooking: async (id, email) => {
    try {
      const res = await fetch(`/api/guest/bookings/${id}/cancel?email=${encodeURIComponent(email)}`, {
        method: 'POST'
      });
      if (res.ok) {
        storageService.updateReservation(id, { status: 'Cancelled', checkIn: false });
        return true;
      }
    } catch {
      // Backend down, use local fallback
    }

    const reservations = storageService.getReservations();
    const target = reservations.find(r => r.id === Number(id));
    if (!target) throw new Error('Reservation not found.');

    if (target.emailAddress?.toLowerCase() !== email.trim().toLowerCase()) {
      throw new Error('Email does not match reservation record.');
    }

    const arrivalMs = new Date(target.arrivalTime).getTime();
    if (arrivalMs - Date.now() <= 48 * 60 * 60 * 1000) {
      throw new Error('Free cancellation window has passed (< 48 hours before check-in). Please contact the front desk.');
    }

    storageService.updateReservation(id, { status: 'Cancelled', checkIn: false });
    return true;
  }
};
