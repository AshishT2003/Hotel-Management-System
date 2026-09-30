import { Reservation, Order, Room, Invoice, User, UserRole, RoomType } from '../types';
import { FLOOR_MAPPING, ROOM_PRICES } from '../constants';
import { generateInvoiceFromReservation } from '../utils/billing';

const API_BASE = '/api';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('hotel_jwt_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Initial fallback mock data representing the 10 seeded records
const INITIAL_MOCK_RESERVATIONS: Reservation[] = [
  {
    id: 1001,
    firstName: 'Alexander',
    lastName: 'Wright',
    birthday: '1984-05-12',
    gender: 'Male',
    phoneNumber: '2125550192',
    emailAddress: 'alexander.wright@luxuryhotels.com',
    numberGuest: 1,
    streetAddress: '742 Evergreen Terrace',
    aptSuite: 'Apt 4B',
    city: 'New York',
    state: 'NY',
    zipCode: '10001',
    roomType: 'Single',
    roomFloor: '1',
    roomNumber: '101',
    totalBill: 159.43,
    paymentType: 'Credit Card',
    cardType: 'Visa',
    cardNumber: '4111111111111001',
    cardExp: '11/28',
    cardCvc: '312',
    arrivalTime: new Date().toISOString(),
    leavingTime: new Date(Date.now() + 86400000 * 2).toISOString(),
    checkIn: true,
    breakfast: 1,
    lunch: 0,
    dinner: 0,
    cleaning: true,
    towel: false,
    surprise: false,
    supplyStatus: false,
    foodBill: 7,
  },
  {
    id: 1002,
    firstName: 'Victoria',
    lastName: 'Sterling',
    birthday: '1990-11-20',
    gender: 'Female',
    phoneNumber: '4155550143',
    emailAddress: 'victoria.sterling@monarchcapital.com',
    numberGuest: 2,
    streetAddress: '100 Montgomery St',
    aptSuite: 'Suite 2200',
    city: 'San Francisco',
    state: 'CA',
    zipCode: '94104',
    roomType: 'Double',
    roomFloor: '2',
    roomNumber: '201',
    totalBill: 341.33,
    paymentType: 'Credit Card',
    cardType: 'MasterCard',
    cardNumber: '5500000000002002',
    cardExp: '05/27',
    cardCvc: '882',
    arrivalTime: new Date().toISOString(),
    leavingTime: new Date(Date.now() + 86400000 * 3).toISOString(),
    checkIn: false,
    breakfast: 2,
    lunch: 0,
    dinner: 1,
    cleaning: false,
    towel: true,
    surprise: true,
    supplyStatus: false,
    foodBill: 29,
  },
  {
    id: 1003,
    firstName: 'Marcus',
    lastName: 'Vance',
    birthday: '1978-03-08',
    gender: 'Male',
    phoneNumber: '3125550188',
    emailAddress: 'mvance@vanceindustries.com',
    numberGuest: 4,
    streetAddress: '233 S Wacker Dr',
    aptSuite: 'Penthouse',
    city: 'Chicago',
    state: 'IL',
    zipCode: '60606',
    roomType: 'Suite',
    roomFloor: '5',
    roomNumber: '501',
    totalBill: 601.34,
    paymentType: 'Debit Card',
    cardType: 'Visa',
    cardNumber: '4000000000005001',
    cardExp: '09/29',
    cardCvc: '144',
    arrivalTime: new Date().toISOString(),
    leavingTime: new Date(Date.now() + 86400000 * 4).toISOString(),
    checkIn: true,
    breakfast: 4,
    lunch: 4,
    dinner: 4,
    cleaning: true,
    towel: true,
    surprise: true,
    supplyStatus: true,
    foodBill: 136,
  },
];

let localReservations: Reservation[] = [...INITIAL_MOCK_RESERVATIONS];

export const api = {
  auth: {
    login: async (username: string, password: string): Promise<{ token: string; user: User }> => {
      try {
        const res = await fetch(`${API_BASE}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password }),
        });
        if (res.ok) {
          const data = await res.json();
          localStorage.setItem('hotel_jwt_token', data.token);
          return {
            token: data.token,
            user: {
              username: data.user.username,
              fullName: data.user.fullName,
              email: data.user.email,
              role: data.role as UserRole,
              token: data.token,
            },
          };
        }
      } catch (err) {
        console.warn('Backend offline, using fallback auth store:', err);
      }

      // Resilient local auth fallback
      let role: UserRole = 'Admin';
      let fullName = 'Front Desk Administrator';
      let email = 'admin@grandhorizon.com';

      if (username.toLowerCase() === 'kitchen') {
        role = 'Kitchen';
        fullName = 'Executive Chef Henri';
        email = 'chef@grandhorizon.com';
      } else if (username.toLowerCase() === 'manager') {
        role = 'Manager';
        fullName = 'General Manager Sofia';
        email = 'manager@grandhorizon.com';
      }

      const mockToken = 'mock_jwt_' + btoa(JSON.stringify({ username, role, exp: Date.now() + 3600000 }));
      localStorage.setItem('hotel_jwt_token', mockToken);
      return {
        token: mockToken,
        user: { username, fullName, email, role, token: mockToken },
      };
    },
  },

  reservations: {
    getAll: async (search?: string, status?: string): Promise<Reservation[]> => {
      try {
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (status) params.append('status', status);
        const res = await fetch(`${API_BASE}/reservations?${params.toString()}`, {
          headers: { ...getAuthHeader() },
        });
        if (res.ok) {
          return await res.json();
        }
      } catch (err) {
        // Fallback to local
      }

      let filtered = [...localReservations];
      if (status === 'Checked In') {
        filtered = filtered.filter(r => r.checkIn);
      } else if (status === 'Reserved') {
        filtered = filtered.filter(r => !r.checkIn);
      }

      if (search && search.trim()) {
        const s = search.toLowerCase();
        filtered = filtered.filter(
          r =>
            r.firstName.toLowerCase().includes(s) ||
            r.lastName.toLowerCase().includes(s) ||
            r.roomNumber.toLowerCase().includes(s) ||
            r.phoneNumber.includes(s) ||
            r.emailAddress.toLowerCase().includes(s) ||
            r.city.toLowerCase().includes(s) ||
            r.id.toString().includes(s)
        );
      }
      return filtered;
    },

    getById: async (id: number): Promise<Reservation | null> => {
      try {
        const res = await fetch(`${API_BASE}/reservations/${id}`, {
          headers: { ...getAuthHeader() },
        });
        if (res.ok) return await res.json();
      } catch (err) {}
      return localReservations.find(r => r.id === id) || null;
    },

    create: async (data: Partial<Reservation>): Promise<Reservation> => {
      try {
        const res = await fetch(`${API_BASE}/reservations`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
          body: JSON.stringify(data),
        });
        if (res.ok) return await res.json();
      } catch (err) {}

      const newId = localReservations.length > 0 ? Math.max(...localReservations.map(r => r.id)) + 1 : 1001;
      const created: Reservation = {
        id: newId,
        firstName: data.firstName || 'Guest',
        lastName: data.lastName || 'Visitor',
        birthday: data.birthday || '1990-01-01',
        gender: data.gender || 'Male',
        phoneNumber: data.phoneNumber || '5550001111',
        emailAddress: data.emailAddress || 'guest@example.com',
        numberGuest: data.numberGuest || 1,
        streetAddress: data.streetAddress || '123 Main St',
        aptSuite: data.aptSuite || '',
        city: data.city || 'Metropolis',
        state: data.state || 'NY',
        zipCode: data.zipCode || '10001',
        roomType: data.roomType || 'Single',
        roomFloor: data.roomNumber ? data.roomNumber[0] : '1',
        roomNumber: data.roomNumber || '101',
        totalBill: data.totalBill || 159.43,
        paymentType: data.paymentType || 'Credit Card',
        cardType: data.cardType || 'Visa',
        cardNumber: data.cardNumber || '4111111111111111',
        cardExp: data.cardExp || '12/28',
        cardCvc: data.cardCvc || '123',
        arrivalTime: data.arrivalTime || new Date().toISOString(),
        leavingTime: data.leavingTime || new Date(Date.now() + 86400000).toISOString(),
        checkIn: data.checkIn ?? false,
        breakfast: data.breakfast || 0,
        lunch: data.lunch || 0,
        dinner: data.dinner || 0,
        cleaning: data.cleaning ?? false,
        towel: data.towel ?? false,
        surprise: data.surprise ?? false,
        supplyStatus: false,
        foodBill: data.foodBill || 0,
      };
      localReservations.unshift(created);
      return created;
    },

    update: async (id: number, data: Partial<Reservation>): Promise<boolean> => {
      try {
        const res = await fetch(`${API_BASE}/reservations/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
          body: JSON.stringify(data),
        });
        if (res.ok) return true;
      } catch (err) {}

      const idx = localReservations.findIndex(r => r.id === id);
      if (idx !== -1) {
        localReservations[idx] = { ...localReservations[idx], ...data };
        return true;
      }
      return false;
    },

    delete: async (id: number): Promise<boolean> => {
      try {
        const res = await fetch(`${API_BASE}/reservations/${id}`, {
          method: 'DELETE',
          headers: { ...getAuthHeader() },
        });
        if (res.ok) return true;
      } catch (err) {}

      const idx = localReservations.findIndex(r => r.id === id);
      if (idx !== -1) {
        localReservations.splice(idx, 1);
        return true;
      }
      return false;
    },

    toggleCheckIn: async (id: number, checkIn: boolean): Promise<boolean> => {
      try {
        const res = await fetch(`${API_BASE}/reservations/${id}/checkin`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
          body: JSON.stringify({ checkIn }),
        });
        if (res.ok) return true;
      } catch (err) {}

      const item = localReservations.find(r => r.id === id);
      if (item) {
        item.checkIn = checkIn;
        return true;
      }
      return false;
    },

    getInvoice: async (id: number): Promise<Invoice | null> => {
      try {
        const res = await fetch(`${API_BASE}/reservations/${id}/invoice`, {
          headers: { ...getAuthHeader() },
        });
        if (res.ok) return await res.json();
      } catch (err) {}

      const item = localReservations.find(r => r.id === id);
      if (item) return generateInvoiceFromReservation(item);
      return null;
    },
  },

  kitchen: {
    getOrders: async (): Promise<Order[]> => {
      try {
        const res = await fetch(`${API_BASE}/kitchen/orders`, {
          headers: { ...getAuthHeader() },
        });
        if (res.ok) return await res.json();
      } catch (err) {}

      return localReservations
        .filter(r => r.breakfast > 0 || r.lunch > 0 || r.dinner > 0 || r.cleaning || r.towel || r.surprise)
        .map(r => ({
          orderId: r.id,
          roomNumber: r.roomNumber,
          floor: parseInt(r.roomFloor || r.roomNumber[0], 10) || 1,
          guestName: `${r.firstName} ${r.lastName}`,
          phoneNumber: r.phoneNumber,
          breakfast: r.breakfast,
          lunch: r.lunch,
          dinner: r.dinner,
          cleaning: r.cleaning,
          towel: r.towel,
          surprise: r.surprise,
          supplyStatus: r.supplyStatus,
          orderedAt: r.arrivalTime,
        }));
    },

    updateOrderStatus: async (orderId: number, status: boolean): Promise<boolean> => {
      try {
        const res = await fetch(`${API_BASE}/kitchen/orders/${orderId}/status`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
          body: JSON.stringify({ status }),
        });
        if (res.ok) return true;
      } catch (err) {}

      const item = localReservations.find(r => r.id === orderId);
      if (item) {
        item.supplyStatus = status;
        return true;
      }
      return false;
    },
  },

  rooms: {
    getMatrix: async (): Promise<Room[]> => {
      try {
        const res = await fetch(`${API_BASE}/rooms/matrix`, {
          headers: { ...getAuthHeader() },
        });
        if (res.ok) {
          const floors = await res.json();
          const flatRooms: Room[] = [];
          for (const f of floors) {
            for (const r of f.rooms) {
              flatRooms.push({
                roomNumber: r.roomNumber,
                floor: f.floor,
                type: f.type as RoomType,
                price: f.price,
                status: r.status,
                guestName: r.guestName,
                reservationId: r.reservationId,
              });
            }
          }
          return flatRooms;
        }
      } catch (err) {}

      // Fallback matrix builder
      const rooms: Room[] = [];
      const resMap = new Map(localReservations.map(r => [r.roomNumber.trim(), r]));

      Object.entries(FLOOR_MAPPING).forEach(([floorStr, conf]) => {
        conf.rooms.forEach(rNum => {
          const match = resMap.get(rNum);
          rooms.push({
            roomNumber: rNum,
            floor: conf.floor,
            type: conf.type,
            price: conf.price,
            status: match ? (match.checkIn ? 'Occupied' : 'Reserved') : 'Available',
            guestName: match ? `${match.firstName} ${match.lastName}` : null,
            reservationId: match ? match.id : null,
          });
        });
      });
      return rooms;
    },
  },
};
