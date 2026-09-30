import { AvailableRoom, GuestBookingRequest, GuestBookingResponse, GuestBookingSummary, BillingBreakdown } from '../types';

export const ROOM_CONFIG = [
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
}: {
  baseRate?: number;
  checkIn: string;
  checkOut: string;
  guests?: { adults: number; children: number };
  diningPerks?: { type: string; quantity: number }[];
  amenities?: string[];
}): BillingBreakdown => {
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

export const guestBookingService = {
  getRoomConfigurations: () => ROOM_CONFIG,

  getAvailableRooms: async (checkIn: string, checkOut: string, guestCount = 1): Promise<AvailableRoom[]> => {
    try {
      const params = new URLSearchParams({
        checkIn: typeof checkIn === 'string' ? checkIn : new Date(checkIn).toISOString().split('T')[0],
        checkOut: typeof checkOut === 'string' ? checkOut : new Date(checkOut).toISOString().split('T')[0],
        guests: guestCount.toString()
      });
      const res = await fetch(`/api/guest/rooms/available?${params.toString()}`);
      if (res.ok) {
        const apiRooms: AvailableRoom[] = await res.json();
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
      // Fallback to static config
    }

    const result: AvailableRoom[] = [];
    ROOM_CONFIG.forEach(cfg => {
      cfg.rooms.forEach(num => {
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
          available: true
        });
      });
    });
    return result;
  },

  createBooking: async (payload: GuestBookingRequest): Promise<GuestBookingResponse> => {
    const res = await fetch('/api/guest/book', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to complete booking');
    }
    return res.json();
  },

  getBookingsByEmail: async (email: string): Promise<GuestBookingSummary[]> => {
    const res = await fetch(`/api/guest/bookings/${encodeURIComponent(email)}`);
    if (!res.ok) {
      throw new Error('Could not retrieve bookings for specified email.');
    }
    return res.json();
  },

  cancelBooking: async (id: number, email: string): Promise<boolean> => {
    const res = await fetch(`/api/guest/bookings/${id}/cancel?email=${encodeURIComponent(email)}`, {
      method: 'POST'
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to cancel booking.');
    }
    return true;
  }
};
