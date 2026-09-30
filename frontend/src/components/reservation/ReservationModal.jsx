import React, { useState, useEffect, useMemo } from 'react';
import { Modal } from '../common/Modal';
import { Input, Select } from '../common/Input';
import { Button } from '../common/Button';
import { useHotel } from '../../context/HotelContext';
import { ROOM_TYPES, calculateBill } from '../../utils/pricing';
import { FLOORS } from '../../utils/roomData';
import { formatCurrency } from '../../utils/formatters';
import { 
  User, 
  MapPin, 
  BedDouble, 
  Utensils, 
  CreditCard, 
  Sparkles,
  Calculator,
  CheckCircle2
} from 'lucide-react';

const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
];

export function ReservationModal({ isOpen, onClose, editingReservation = null }) {
  const { addReservation, updateReservation, roomStatusMap, showToast } = useHotel();

  // Form State
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    birthday: '1995-01-01',
    gender: 'Male',
    phoneNumber: '',
    emailAddress: '',
    numberGuest: 1,
    streetAddress: '',
    aptSuite: '',
    city: '',
    state: 'NY',
    zipCode: '',
    roomType: 'Single',
    roomFloor: 1,
    roomNumber: '101',
    paymentType: 'Credit Card',
    cardType: 'Visa',
    cardNumber: '4111222233334444',
    cardExp: '12/28',
    cardCvc: '123',
    arrivalTime: new Date().toISOString().split('T')[0],
    leavingTime: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    checkIn: false,
    breakfast: 0,
    lunch: 0,
    dinner: 0,
    cleaning: false,
    towel: false,
    surprise: false,
    supplyStatus: false
  });

  // Load existing reservation if editing
  useEffect(() => {
    if (editingReservation) {
      setFormData({
        ...editingReservation,
        birthday: editingReservation.birthday ? editingReservation.birthday.split('T')[0] : '1995-01-01',
        arrivalTime: editingReservation.arrivalTime ? editingReservation.arrivalTime.split('T')[0] : '',
        leavingTime: editingReservation.leavingTime ? editingReservation.leavingTime.split('T')[0] : ''
      });
    } else {
      // Find first available room on Floor 1
      const floor1Rooms = FLOORS[0].rooms;
      const firstAvailable = floor1Rooms.find(r => roomStatusMap[r]?.status === 'Available') || floor1Rooms[0];
      setFormData(prev => ({
        ...prev,
        roomType: 'Single',
        roomFloor: 1,
        roomNumber: firstAvailable
      }));
    }
  }, [editingReservation, isOpen, roomStatusMap]);

  // When room type changes, update floor and default room
  const handleRoomTypeChange = (newType) => {
    const floorInfo = FLOORS.find(f => f.type === newType) || FLOORS[0];
    const availableRoom = floorInfo.rooms.find(r => 
      (roomStatusMap[r]?.status === 'Available' && (!roomStatusMap[r]?.housekeepingStatus || roomStatusMap[r]?.housekeepingStatus === 'Ready')) || (editingReservation && r === editingReservation.roomNumber)
    ) || floorInfo.rooms.find(r => roomStatusMap[r]?.status === 'Available') || floorInfo.rooms[0];

    setFormData(prev => ({
      ...prev,
      roomType: newType,
      roomFloor: floorInfo.floor,
      roomNumber: availableRoom
    }));
  };

  // Available rooms for current floor
  const floorRooms = useMemo(() => {
    const floorInfo = FLOORS.find(f => f.floor === Number(formData.roomFloor));
    return floorInfo ? floorInfo.rooms : [];
  }, [formData.roomFloor]);

  // Nights calculation
  const nightsCount = useMemo(() => {
    if (!formData.arrivalTime || !formData.leavingTime) return 1;
    const start = new Date(formData.arrivalTime);
    const end = new Date(formData.leavingTime);
    const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 1;
  }, [formData.arrivalTime, formData.leavingTime]);

  // Live bill computation
  const bill = useMemo(() => {
    return calculateBill({
      roomType: formData.roomType,
      guests: formData.numberGuest,
      breakfastQty: formData.breakfast,
      lunchQty: formData.lunch,
      dinnerQty: formData.dinner,
      nights: nightsCount
    });
  }, [formData.roomType, formData.numberGuest, formData.breakfast, formData.lunch, formData.dinner, nightsCount]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (new Date(formData.leavingTime) <= new Date(formData.arrivalTime)) {
      if (showToast) {
        showToast('Departure date must be after arrival date.', 'error');
      } else {
        alert('Departure date must be after arrival date.');
      }
      return;
    }

    const targetRoom = roomStatusMap[String(formData.roomNumber).trim()];
    if (!editingReservation && targetRoom) {
      if (targetRoom.status === 'Occupied') {
        if (showToast) {
          showToast(`Room ${formData.roomNumber} is currently occupied and cannot be booked.`, 'error');
        } else {
          alert(`Room ${formData.roomNumber} is currently occupied and cannot be booked.`);
        }
        return;
      }
      if (targetRoom.status === 'Reserved') {
        if (showToast) {
          showToast(`Room ${formData.roomNumber} is already reserved. Double booking prevented.`, 'error');
        } else {
          alert(`Room ${formData.roomNumber} is already reserved. Double booking prevented.`);
        }
        return;
      }
      if (targetRoom.housekeepingStatus && targetRoom.housekeepingStatus !== 'Ready') {
        const actionLabel = targetRoom.housekeepingStatus === 'Inspection' ? 'supervisor inspection' : targetRoom.housekeepingStatus === 'Cleaning' ? 'housekeeping cleaning' : 'turnover cleaning';
        if (showToast) {
          showToast(`Room ${formData.roomNumber} is undergoing ${actionLabel}. Housekeeping clearance required before booking.`, 'error');
        } else {
          alert(`Room ${formData.roomNumber} is undergoing ${actionLabel}. Housekeeping clearance required before booking.`);
        }
        return;
      }
    }

    const submission = {
      ...formData,
      roomNumber: String(formData.roomNumber).trim(),
      totalBill: bill.finalTotal,
      foodBill: bill.foodBill
    };

    if (editingReservation) {
      updateReservation(editingReservation.id, submission);
    } else {
      addReservation(submission);
    }

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingReservation ? `Edit Reservation #${editingReservation.id}` : 'New Guest Reservation'}
      maxWidth="max-w-4xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6 max-h-[80vh] overflow-y-auto pr-1">
        {/* Step 1: Guest Personal Info */}
        <div>
          <div className="flex items-center gap-2 mb-3 pb-1 border-b border-hotel-100 dark:border-hotel-800">
            <User className="w-4 h-4 text-emerald-600" />
            <h4 className="text-sm font-bold text-hotel-900 dark:text-hotel-100">Guest Information</h4>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              label="First Name"
              required
              value={formData.firstName}
              onChange={e => setFormData({ ...formData, firstName: e.target.value })}
              placeholder="e.g. Eleanor"
            />
            <Input
              label="Last Name"
              required
              value={formData.lastName}
              onChange={e => setFormData({ ...formData, lastName: e.target.value })}
              placeholder="e.g. Vance"
            />
            <Select
              label="Gender"
              value={formData.gender}
              onChange={e => setFormData({ ...formData, gender: e.target.value })}
              options={['Male', 'Female', 'Other']}
            />
            <Input
              label="Phone Number"
              required
              value={formData.phoneNumber}
              onChange={e => setFormData({ ...formData, phoneNumber: e.target.value })}
              placeholder="(555) 000-0000"
            />
            <Input
              label="Email Address"
              type="email"
              required
              value={formData.emailAddress}
              onChange={e => setFormData({ ...formData, emailAddress: e.target.value })}
              placeholder="guest@domain.com"
            />
            <Input
              label="Date of Birth"
              type="date"
              value={formData.birthday}
              onChange={e => setFormData({ ...formData, birthday: e.target.value })}
            />
          </div>
        </div>

        {/* Step 2: Address */}
        <div>
          <div className="flex items-center gap-2 mb-3 pb-1 border-b border-hotel-100 dark:border-hotel-800">
            <MapPin className="w-4 h-4 text-emerald-600" />
            <h4 className="text-sm font-bold text-hotel-900 dark:text-hotel-100">Billing & Street Address</h4>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="sm:col-span-2">
              <Input
                label="Street Address"
                value={formData.streetAddress}
                onChange={e => setFormData({ ...formData, streetAddress: e.target.value })}
                placeholder="123 Luxury Way"
              />
            </div>
            <Input
              label="Apt / Suite"
              value={formData.aptSuite}
              onChange={e => setFormData({ ...formData, aptSuite: e.target.value })}
              placeholder="Apt 4B"
            />
            <Input
              label="City"
              value={formData.city}
              onChange={e => setFormData({ ...formData, city: e.target.value })}
              placeholder="New York"
            />
            <Select
              label="State"
              value={formData.state}
              onChange={e => setFormData({ ...formData, state: e.target.value })}
              options={US_STATES}
            />
            <Input
              label="ZIP Code"
              value={formData.zipCode}
              onChange={e => setFormData({ ...formData, zipCode: e.target.value })}
              placeholder="10001"
            />
            <Select
              label="Number of Guests"
              value={formData.numberGuest}
              onChange={e => setFormData({ ...formData, numberGuest: Number(e.target.value) })}
              options={[1, 2, 3, 4, 5, 6]}
            />
            <div className="flex items-end pb-2">
              <label className="flex items-center gap-2 text-xs font-semibold text-hotel-700 dark:text-hotel-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.checkIn}
                  onChange={e => setFormData({ ...formData, checkIn: e.target.checked })}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
                <span>Direct Check-in Now</span>
              </label>
            </div>
          </div>
        </div>

        {/* Step 3: Room & Stay Dates */}
        <div>
          <div className="flex items-center gap-2 mb-3 pb-1 border-b border-hotel-100 dark:border-hotel-800">
            <BedDouble className="w-4 h-4 text-emerald-600" />
            <h4 className="text-sm font-bold text-hotel-900 dark:text-hotel-100">Room Selection & Stay Dates</h4>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <Select
              label="Room Category"
              value={formData.roomType}
              onChange={e => handleRoomTypeChange(e.target.value)}
              options={Object.keys(ROOM_TYPES).map(k => ({
                value: k,
                label: `${k} ($${ROOM_TYPES[k].basePrice}/nt - Floor ${ROOM_TYPES[k].floor})`
              }))}
            />
            <Select
              label="Assigned Room #"
              value={formData.roomNumber}
              onChange={e => setFormData({ ...formData, roomNumber: e.target.value })}
            >
              {floorRooms.map(r => {
                const roomInfo = roomStatusMap[r];
                const isOccupied = roomInfo?.status === 'Occupied';
                const isReserved = roomInfo?.status === 'Reserved' && (!editingReservation || editingReservation.roomNumber !== r);
                const isHousekeepingUnready = roomInfo?.housekeepingStatus && roomInfo.housekeepingStatus !== 'Ready';
                const isUnavailable = isOccupied || isReserved || isHousekeepingUnready;
                const statusTag = isOccupied 
                  ? 'Occupied' 
                  : isReserved 
                  ? 'Reserved' 
                  : isHousekeepingUnready 
                  ? roomInfo.housekeepingStatus 
                  : null;

                return (
                  <option key={r} value={r} disabled={isUnavailable}>
                    Room {r} {statusTag ? `(${statusTag})` : '• Available'}
                  </option>
                );
              })}
            </Select>
            <Input
              label="Arrival Date"
              type="date"
              required
              value={formData.arrivalTime}
              onChange={e => setFormData({ ...formData, arrivalTime: e.target.value })}
            />
            <Input
              label="Departure Date"
              type="date"
              required
              value={formData.leavingTime}
              onChange={e => setFormData({ ...formData, leavingTime: e.target.value })}
            />
          </div>
        </div>

        {/* Step 4: Food & Room Services */}
        <div className="p-4 rounded-xl bg-hotel-50 dark:bg-hotel-850 border border-hotel-200 dark:border-hotel-800">
          <div className="flex items-center gap-2 mb-3">
            <Utensils className="w-4 h-4 text-amber-500" />
            <h4 className="text-sm font-bold text-hotel-900 dark:text-hotel-100">Kitchen Orders & Hospitality Perks</h4>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
            <Input
              label="Breakfast ($7 / order)"
              type="number"
              min="0"
              value={formData.breakfast}
              onChange={e => setFormData({ ...formData, breakfast: Math.max(0, parseInt(e.target.value) || 0) })}
            />
            <Input
              label="Lunch ($15 / order)"
              type="number"
              min="0"
              value={formData.lunch}
              onChange={e => setFormData({ ...formData, lunch: Math.max(0, parseInt(e.target.value) || 0) })}
            />
            <Input
              label="Dinner ($15 / order)"
              type="number"
              min="0"
              value={formData.dinner}
              onChange={e => setFormData({ ...formData, dinner: Math.max(0, parseInt(e.target.value) || 0) })}
            />
          </div>

          <div className="flex flex-wrap gap-6 pt-2 border-t border-hotel-200 dark:border-hotel-700/60">
            <label className="flex items-center gap-2 text-xs font-semibold text-hotel-700 dark:text-hotel-300 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.cleaning}
                onChange={e => setFormData({ ...formData, cleaning: e.target.checked })}
                className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
              />
              <span>Housekeeping Service</span>
            </label>
            <label className="flex items-center gap-2 text-xs font-semibold text-hotel-700 dark:text-hotel-300 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.towel}
                onChange={e => setFormData({ ...formData, towel: e.target.checked })}
                className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
              />
              <span>Fresh Towels Delivery</span>
            </label>
            <label className="flex items-center gap-2 text-xs font-semibold text-hotel-700 dark:text-hotel-300 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.surprise}
                onChange={e => setFormData({ ...formData, surprise: e.target.checked })}
                className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
              />
              <span>Sweet Surprise Gift Basket</span>
            </label>
          </div>
        </div>

        {/* Step 5: Payment & Bill Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl border border-hotel-200 dark:border-hotel-800 space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <CreditCard className="w-4 h-4 text-emerald-600" />
              <h4 className="text-sm font-bold text-hotel-900 dark:text-hotel-100">Payment Method</h4>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Select
                label="Payment Method"
                value={formData.paymentType}
                onChange={e => setFormData({ ...formData, paymentType: e.target.value })}
                options={['Credit Card', 'Debit Card', 'Cash']}
              />
              <Select
                label="Card Brand"
                value={formData.cardType}
                onChange={e => setFormData({ ...formData, cardType: e.target.value })}
                options={['Visa', 'MasterCard', 'Amex', 'Discover']}
              />
            </div>
            <Input
              label="Card Number"
              value={formData.cardNumber}
              onChange={e => setFormData({ ...formData, cardNumber: e.target.value })}
              placeholder="•••• •••• •••• ••••"
            />
            <div className="grid grid-cols-2 gap-2">
              <Input
                label="Expiry (MM/YY)"
                value={formData.cardExp}
                onChange={e => setFormData({ ...formData, cardExp: e.target.value })}
                placeholder="12/28"
              />
              <Input
                label="CVC / CVV"
                value={formData.cardCvc}
                onChange={e => setFormData({ ...formData, cardCvc: e.target.value })}
                placeholder="123"
              />
            </div>
          </div>

          {/* Pricing Breakdown Card */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-hotel-900 to-hotel-950 text-white flex flex-col justify-between shadow-lg">
            <div>
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-hotel-800">
                <Calculator className="w-4 h-4 text-emerald-400" />
                <h4 className="text-sm font-bold tracking-tight">Finalized Bill Calculation</h4>
              </div>
              <div className="space-y-1.5 text-xs text-hotel-300">
                <div className="flex justify-between">
                  <span>Room ({formData.roomType} x {nightsCount} night{nightsCount > 1 ? 's' : ''}):</span>
                  <span className="font-semibold text-white">{formatCurrency(bill.roomSubtotal)}</span>
                </div>
                {bill.guestSurcharge > 0 && (
                  <div className="flex justify-between text-amber-300">
                    <span>Extra Guest Surcharge:</span>
                    <span className="font-semibold">+{formatCurrency(bill.guestSurcharge)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>State & Hotel Tax (7%):</span>
                  <span className="font-semibold text-white">{formatCurrency(bill.taxAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Food & Dining Total:</span>
                  <span className="font-semibold text-emerald-400">+{formatCurrency(bill.foodBill)}</span>
                </div>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-hotel-800 flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase font-bold tracking-wider text-hotel-400">Total Charged</p>
                <p className="text-2xl font-black text-emerald-400">{formatCurrency(bill.finalTotal)}</p>
              </div>
              <Button type="submit" variant="primary" size="lg">
                {editingReservation ? 'Save Changes' : 'Confirm & Book'}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </Modal>
  );
}
