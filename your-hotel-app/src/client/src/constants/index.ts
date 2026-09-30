import { RoomType } from '../types';

export const ROOM_PRICES: Record<RoomType, number> = {
  Single: 149.0,
  Double: 299.0,
  Twin: 349.0,
  Duplex: 399.0,
  Suite: 499.0,
};

export const MEAL_PRICES = {
  breakfast: 7.0,
  lunch: 12.0,
  dinner: 15.0,
};

export const TAX_RATE = 0.07;
export const EXTRA_GUEST_SURCHARGE = 25.0;

export const FLOOR_MAPPING: Record<string, { floor: number; type: RoomType; price: number; rooms: string[] }> = {
  '1': {
    floor: 1,
    type: 'Single',
    price: 149.0,
    rooms: ['101', '102', '103', '104', '105', '106', '107', '108', '109', '110'],
  },
  '2': {
    floor: 2,
    type: 'Double',
    price: 299.0,
    rooms: ['201', '202', '203', '204', '205', '206', '207', '208', '209', '210'],
  },
  '3': {
    floor: 3,
    type: 'Twin',
    price: 349.0,
    rooms: ['301', '302', '303', '304', '305', '306', '307', '308', '309', '310'],
  },
  '4': {
    floor: 4,
    type: 'Duplex',
    price: 399.0,
    rooms: ['401', '402', '403', '404', '405', '406', '407', '408', '409', '410'],
  },
  '5': {
    floor: 5,
    type: 'Suite',
    price: 499.0,
    rooms: ['501', '502', '503', '504', '505', '506', '507', '508', '509', '510'],
  },
};

export const ALL_ROOM_NUMBERS = Object.values(FLOOR_MAPPING).flatMap(f => f.rooms);

export const DEMO_USERS = [
  {
    role: 'Admin' as const,
    label: 'Front Desk Admin',
    username: 'admin',
    password: 'password123',
    description: 'Full reservation CRUD, check-in/out, room matrix, billing',
  },
  {
    role: 'Kitchen' as const,
    label: 'Kitchen Staff',
    username: 'kitchen',
    password: 'password123',
    description: 'Real-time kitchen order queue, service fulfillment, mark served',
  },
  {
    role: 'Manager' as const,
    label: 'General Manager',
    username: 'manager',
    password: 'password123',
    description: 'Executive revenue reports, occupancy analytics, system oversight',
  },
];
