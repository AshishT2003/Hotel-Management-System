export type UserRole = 'Admin' | 'Kitchen' | 'Manager';

export interface User {
  username: string;
  fullName: string;
  email: string;
  role: UserRole;
  token?: string;
}

export type RoomType = 'Single' | 'Double' | 'Twin' | 'Duplex' | 'Suite';
export type RoomStatus = 'Available' | 'Reserved' | 'Occupied';

export interface Room {
  roomNumber: string;
  floor: number;
  type: RoomType;
  price: number;
  status: RoomStatus;
  guestName?: string | null;
  reservationId?: number | null;
}

export interface Reservation {
  id: number;
  firstName: string;
  lastName: string;
  birthday: string;
  gender: string;
  phoneNumber: string;
  emailAddress: string;
  numberGuest: number;
  streetAddress: string;
  aptSuite: string;
  city: string;
  state: string;
  zipCode: string;
  roomType: RoomType;
  roomFloor: string;
  roomNumber: string;
  totalBill: number;
  paymentType: string;
  cardType: string;
  cardNumber: string;
  cardExp: string;
  cardCvc: string;
  arrivalTime: string;
  leavingTime: string;
  checkIn: boolean;
  breakfast: number;
  lunch: number;
  dinner: number;
  cleaning: boolean;
  towel: boolean;
  surprise: boolean;
  supplyStatus: boolean;
  foodBill: number;
}

export interface Order {
  orderId: number;
  roomNumber: string;
  floor: number;
  guestName: string;
  phoneNumber: string;
  breakfast: number;
  lunch: number;
  dinner: number;
  cleaning: boolean;
  towel: boolean;
  surprise: boolean;
  supplyStatus: boolean;
  orderedAt: string;
}

export interface Invoice {
  reservationId: number;
  guestName: string;
  roomNumber: string;
  roomType: string;
  nights: number;
  baseRate: number;
  roomSubtotal: number;
  guestSurcharge: number;
  breakfastTotal: number;
  lunchTotal: number;
  dinnerTotal: number;
  foodTotal: number;
  taxAmount: number;
  finalTotal: number;
  paymentType: string;
  cardLast4: string;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title?: string;
  message: string;
}

export interface AvailableRoom {
  roomId: number;
  roomNumber: string;
  type: string;
  floor: number;
  baseRate: number;
  capacity: number;
  size?: string;
  bed?: string;
  image?: string;
  description?: string;
  amenities: string[];
  available: boolean;
  urgencyBadge?: string | null;
}

export interface GuestParty {
  adults: number;
  children: number;
}

export interface GuestContactInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  specialRequests?: string;
}

export interface GuestMealItem {
  type: string;
  quantity: number;
  price?: number;
}

export interface BillingBreakdown {
  nights?: number;
  roomTotal: number;
  diningTotal: number;
  extraGuests?: number;
  extraGuestSurcharge: number;
  amenitiesTotal: number;
  subtotal: number;
  tax: number;
  total: number;
}

export interface GuestBookingRequest {
  checkIn: string;
  checkOut: string;
  roomNumber: string;
  roomType?: string;
  floor?: number;
  guests: GuestParty;
  guestInfo: GuestContactInfo;
  diningPerks?: GuestMealItem[];
  amenities?: string[];
  paymentMethod?: string;
}

export interface GuestBookingResponse {
  reservationId: number;
  confirmationCode: string;
  status: string;
  totalAmount: number;
  breakdown: BillingBreakdown;
  bookingSource: string;
  paymentStatus: string;
  cancellationPolicy: string;
}

export interface GuestBookingSummary {
  reservationId: number;
  confirmationCode: string;
  roomNumber: string;
  roomType: string;
  checkIn: string;
  checkOut: string;
  status: string;
  totalAmount: number;
  bookingSource: string;
  canCancel: boolean;
}

