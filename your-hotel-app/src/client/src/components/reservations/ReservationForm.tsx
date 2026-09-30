import React, { useState, useEffect, useMemo } from 'react';
import { useHotel } from '../../context/HotelContext';
import { Reservation, RoomType } from '../../types';
import { FLOOR_MAPPING, ALL_ROOM_NUMBERS, ROOM_PRICES } from '../../constants';
import { calculateBilling } from '../../utils/billing';
import { formatCurrency } from '../../utils/formatters';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { User, Calendar, Coffee, CreditCard, Sparkles } from 'lucide-react';

interface ReservationFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  initialData?: Reservation | null;
  defaultRoomNumber?: string | null;
}

export const ReservationForm: React.FC<ReservationFormProps> = ({
  onSuccess,
  onCancel,
  initialData,
  defaultRoomNumber,
}) => {
  const { createReservation, updateReservation, rooms } = useHotel();
  const [activeTab, setActiveTab] = useState<'guest' | 'room' | 'dining' | 'payment'>('guest');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state holding all 33 columns
  const [formData, setFormData] = useState({
    firstName: initialData?.firstName || '',
    lastName: initialData?.lastName || '',
    birthday: initialData?.birthday || '1990-01-01',
    gender: initialData?.gender || 'Male',
    phoneNumber: initialData?.phoneNumber || '',
    emailAddress: initialData?.emailAddress || '',
    numberGuest: initialData?.numberGuest || 1,
    streetAddress: initialData?.streetAddress || '',
    aptSuite: initialData?.aptSuite || '',
    city: initialData?.city || '',
    state: initialData?.state || 'NY',
    zipCode: initialData?.zipCode || '',
    roomType: initialData?.roomType || ('Single' as RoomType),
    roomFloor: initialData?.roomFloor || '1',
    roomNumber: initialData?.roomNumber || defaultRoomNumber || '101',
    paymentType: initialData?.paymentType || 'Credit Card',
    cardType: initialData?.cardType || 'Visa',
    cardNumber: initialData?.cardNumber || '',
    cardExp: initialData?.cardExp || '',
    cardCvc: initialData?.cardCvc || '',
    arrivalTime: initialData?.arrivalTime ? initialData.arrivalTime.split('T')[0] : new Date().toISOString().split('T')[0],
    leavingTime: initialData?.leavingTime
      ? initialData.leavingTime.split('T')[0]
      : new Date(Date.now() + 86400000).toISOString().split('T')[0],
    checkIn: initialData?.checkIn ?? false,
    breakfast: initialData?.breakfast || 0,
    lunch: initialData?.lunch || 0,
    dinner: initialData?.dinner || 0,
    cleaning: initialData?.cleaning ?? false,
    towel: initialData?.towel ?? false,
    surprise: initialData?.surprise ?? false,
  });

  // Keep room type and floor synced with room number
  useEffect(() => {
    if (formData.roomNumber) {
      const floorStr = formData.roomNumber[0];
      const conf = FLOOR_MAPPING[floorStr];
      if (conf) {
        setFormData(prev => ({
          ...prev,
          roomFloor: floorStr,
          roomType: conf.type,
        }));
      }
    }
  }, [formData.roomNumber]);

  // Live billing calculations
  const billing = useMemo(() => {
    return calculateBilling(
      formData.roomType,
      formData.numberGuest,
      formData.arrivalTime,
      formData.leavingTime,
      formData.breakfast,
      formData.lunch,
      formData.dinner
    );
  }, [
    formData.roomType,
    formData.numberGuest,
    formData.arrivalTime,
    formData.leavingTime,
    formData.breakfast,
    formData.lunch,
    formData.dinner,
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setActiveTab('guest');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: Partial<Reservation> = {
        ...formData,
        totalBill: billing.finalTotal,
        foodBill: billing.foodTotal,
        arrivalTime: new Date(formData.arrivalTime).toISOString(),
        leavingTime: new Date(formData.leavingTime).toISOString(),
      };

      if (initialData?.id) {
        const ok = await updateReservation(initialData.id, payload);
        if (ok) onSuccess();
      } else {
        const ok = await createReservation(payload);
        if (ok) onSuccess();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const tabs = [
    { id: 'guest' as const, label: '1. Guest Details', icon: <User className="w-4 h-4" /> },
    { id: 'room' as const, label: '2. Room & Dates', icon: <Calendar className="w-4 h-4" /> },
    { id: 'dining' as const, label: '3. Dining & Services', icon: <Coffee className="w-4 h-4" /> },
    { id: 'payment' as const, label: '4. Payment & Billing', icon: <CreditCard className="w-4 h-4" /> },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Step navigation tabs */}
      <div className="flex border-b border-slate-200">
        {tabs.map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab 1: Guest Information */}
      {activeTab === 'guest' && (
        <div className="space-y-4 animate-in fade-in-50">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="First Name"
              required
              value={formData.firstName}
              onChange={e => setFormData({ ...formData, firstName: e.target.value })}
              placeholder="e.g. Johnathan"
            />
            <Input
              label="Last Name"
              required
              value={formData.lastName}
              onChange={e => setFormData({ ...formData, lastName: e.target.value })}
              placeholder="e.g. Sterling"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Date of Birth"
              type="date"
              value={formData.birthday}
              onChange={e => setFormData({ ...formData, birthday: e.target.value })}
            />
            <Select
              label="Gender"
              value={formData.gender}
              onChange={e => setFormData({ ...formData, gender: e.target.value })}
              options={[
                { value: 'Male', label: 'Male' },
                { value: 'Female', label: 'Female' },
                { value: 'Other', label: 'Other' },
              ]}
            />
            <Input
              label="Contact Phone"
              required
              value={formData.phoneNumber}
              onChange={e => setFormData({ ...formData, phoneNumber: e.target.value })}
              placeholder="(555) 123-4567"
            />
          </div>

          <Input
            label="Email Address"
            type="email"
            required
            value={formData.emailAddress}
            onChange={e => setFormData({ ...formData, emailAddress: e.target.value })}
            placeholder="guest@domain.com"
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <Input
                label="Street Address"
                value={formData.streetAddress}
                onChange={e => setFormData({ ...formData, streetAddress: e.target.value })}
                placeholder="123 Luxury Boulevard"
              />
            </div>
            <Input
              label="Apt / Suite"
              value={formData.aptSuite}
              onChange={e => setFormData({ ...formData, aptSuite: e.target.value })}
              placeholder="Suite 400"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="City"
              value={formData.city}
              onChange={e => setFormData({ ...formData, city: e.target.value })}
              placeholder="New York"
            />
            <Input
              label="State"
              value={formData.state}
              onChange={e => setFormData({ ...formData, state: e.target.value })}
              placeholder="NY"
            />
            <Input
              label="ZIP Code"
              value={formData.zipCode}
              onChange={e => setFormData({ ...formData, zipCode: e.target.value })}
              placeholder="10001"
            />
          </div>
        </div>
      )}

      {/* Tab 2: Room & Dates */}
      {activeTab === 'room' && (
        <div className="space-y-4 animate-in fade-in-50">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Select
              label="Select Room Unit"
              value={formData.roomNumber}
              onChange={e => setFormData({ ...formData, roomNumber: e.target.value })}
              options={ALL_ROOM_NUMBERS.map(num => {
                const floor = num[0];
                const conf = FLOOR_MAPPING[floor];
                const currentOcc = rooms.find(r => r.roomNumber === num);
                const isThisRes = initialData?.roomNumber === num;
                const statusStr = currentOcc && currentOcc.status !== 'Available' && !isThisRes
                  ? ` (${currentOcc.status})`
                  : ' (Available)';
                return {
                  value: num,
                  label: `Room ${num} — ${conf?.type} [Fl.${floor}]${statusStr}`,
                };
              })}
            />

            <Select
              label="Room Tier / Type"
              value={formData.roomType}
              disabled
              options={Object.keys(ROOM_PRICES).map(type => ({
                value: type,
                label: `${type} ($${ROOM_PRICES[type as RoomType]}/night)`,
              }))}
            />

            <Select
              label="Number of Guests"
              value={formData.numberGuest}
              onChange={e => setFormData({ ...formData, numberGuest: parseInt(e.target.value, 10) || 1 })}
              options={[
                { value: 1, label: '1 Guest' },
                { value: 2, label: '2 Guests' },
                { value: 3, label: '3 Guests (+$25/night surcharge)' },
                { value: 4, label: '4 Guests (+$50/night surcharge)' },
                { value: 5, label: '5 Guests (+$75/night surcharge)' },
                { value: 6, label: '6 Guests (+$100/night surcharge)' },
              ]}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Arrival Date (Check-in)"
              type="date"
              required
              value={formData.arrivalTime}
              onChange={e => setFormData({ ...formData, arrivalTime: e.target.value })}
            />
            <Input
              label="Departure Date (Check-out)"
              type="date"
              required
              value={formData.leavingTime}
              onChange={e => setFormData({ ...formData, leavingTime: e.target.value })}
            />
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors">
              <input
                type="checkbox"
                checked={formData.checkIn}
                onChange={e => setFormData({ ...formData, checkIn: e.target.checked })}
                className="w-4 h-4 text-slate-900 rounded border-slate-300 focus:ring-slate-900"
              />
              <div>
                <span className="text-sm font-semibold text-slate-900 block">Immediate Check-In</span>
                <span className="text-xs text-slate-500">
                  Guest is currently present at the desk. Room status will shift to Occupied.
                </span>
              </div>
            </label>
          </div>
        </div>
      )}

      {/* Tab 3: Dining & Services */}
      {activeTab === 'dining' && (
        <div className="space-y-5 animate-in fade-in-50">
          <div>
            <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Daily Dining Service ($7 Breakfast, $12 Lunch, $15 Dinner)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="Breakfast Meals"
                type="number"
                min="0"
                max="10"
                value={formData.breakfast}
                onChange={e => setFormData({ ...formData, breakfast: parseInt(e.target.value, 10) || 0 })}
                helperText="$7.00 per meal"
              />
              <Input
                label="Lunch Meals"
                type="number"
                min="0"
                max="10"
                value={formData.lunch}
                onChange={e => setFormData({ ...formData, lunch: parseInt(e.target.value, 10) || 0 })}
                helperText="$12.00 per meal"
              />
              <Input
                label="Dinner Meals"
                type="number"
                min="0"
                max="10"
                value={formData.dinner}
                onChange={e => setFormData({ ...formData, dinner: parseInt(e.target.value, 10) || 0 })}
                helperText="$15.00 per meal"
              />
            </div>
          </div>

          <div className="pt-2">
            <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              VIP Room Amenities & Housekeeping
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <label className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={formData.cleaning}
                  onChange={e => setFormData({ ...formData, cleaning: e.target.checked })}
                  className="w-4 h-4 mt-0.5 text-slate-900 rounded border-slate-300 focus:ring-slate-900"
                />
                <div>
                  <span className="text-xs font-bold text-slate-900 block">Daily Housekeeping</span>
                  <span className="text-[11px] text-slate-500">Turndown service</span>
                </div>
              </label>

              <label className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={formData.towel}
                  onChange={e => setFormData({ ...formData, towel: e.target.checked })}
                  className="w-4 h-4 mt-0.5 text-slate-900 rounded border-slate-300 focus:ring-slate-900"
                />
                <div>
                  <span className="text-xs font-bold text-slate-900 block">Fresh Towels</span>
                  <span className="text-[11px] text-slate-500">Premium cotton set</span>
                </div>
              </label>

              <label className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={formData.surprise}
                  onChange={e => setFormData({ ...formData, surprise: e.target.checked })}
                  className="w-4 h-4 mt-0.5 text-slate-900 rounded border-slate-300 focus:ring-slate-900"
                />
                <div>
                  <span className="text-xs font-bold text-slate-900 block flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-500" /> Sweet Surprise
                  </span>
                  <span className="text-[11px] text-slate-500">VIP welcoming basket</span>
                </div>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Payment Details & Live Billing */}
      {activeTab === 'payment' && (
        <div className="space-y-5 animate-in fade-in-50">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Payment Method"
              value={formData.paymentType}
              onChange={e => setFormData({ ...formData, paymentType: e.target.value })}
              options={[
                { value: 'Credit Card', label: 'Credit Card' },
                { value: 'Debit Card', label: 'Debit Card' },
              ]}
            />
            <Select
              label="Card Network"
              value={formData.cardType}
              onChange={e => setFormData({ ...formData, cardType: e.target.value })}
              options={[
                { value: 'Visa', label: 'Visa' },
                { value: 'MasterCard', label: 'MasterCard' },
                { value: 'American Express', label: 'American Express' },
                { value: 'Discover', label: 'Discover' },
              ]}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Card Number (16 Digits)"
              maxLength={16}
              value={formData.cardNumber}
              onChange={e => setFormData({ ...formData, cardNumber: e.target.value.replace(/\D/g, '') })}
              placeholder="4111 2222 3333 4444"
            />
            <Input
              label="Expiry (MM/YY)"
              maxLength={5}
              value={formData.cardExp}
              onChange={e => setFormData({ ...formData, cardExp: e.target.value })}
              placeholder="12/28"
            />
            <Input
              label="CVC Security Code"
              maxLength={4}
              value={formData.cardCvc}
              onChange={e => setFormData({ ...formData, cardCvc: e.target.value.replace(/\D/g, '') })}
              placeholder="345"
            />
          </div>

          {/* Itemized Calculation Preview */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
              Itemized Billing Preview
            </h4>
            <div className="flex justify-between text-xs text-slate-600">
              <span>
                Room Subtotal ({formData.roomType} × {billing.nights} night{billing.nights > 1 ? 's' : ''}):
              </span>
              <span className="font-mono font-medium">{formatCurrency(billing.roomSubtotal)}</span>
            </div>
            {billing.guestSurcharge > 0 && (
              <div className="flex justify-between text-xs text-slate-600">
                <span>Extra Guest Surcharge:</span>
                <span className="font-mono font-medium">{formatCurrency(billing.guestSurcharge)}</span>
              </div>
            )}
            {billing.foodTotal > 0 && (
              <div className="flex justify-between text-xs text-slate-600">
                <span>Food & Dining Total:</span>
                <span className="font-mono font-medium">{formatCurrency(billing.foodTotal)}</span>
              </div>
            )}
            <div className="flex justify-between text-xs text-slate-600">
              <span>Hotel & State Tax (7.00%):</span>
              <span className="font-mono font-medium">{formatCurrency(billing.taxAmount)}</span>
            </div>
            <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-bold text-slate-900">
              <span>Estimated Total:</span>
              <span className="font-mono text-emerald-600 text-base">{formatCurrency(billing.finalTotal)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Action Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-200">
        <div className="flex items-center gap-2">
          {activeTab !== 'guest' && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                if (activeTab === 'room') setActiveTab('guest');
                if (activeTab === 'dining') setActiveTab('room');
                if (activeTab === 'payment') setActiveTab('dining');
              }}
            >
              ← Previous Step
            </Button>
          )}
          {activeTab !== 'payment' && (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => {
                if (activeTab === 'guest') setActiveTab('room');
                if (activeTab === 'room') setActiveTab('dining');
                if (activeTab === 'dining') setActiveTab('payment');
              }}
            >
              Next Step →
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            {initialData ? 'Update Reservation' : 'Confirm Reservation'}
          </Button>
        </div>
      </div>
    </form>
  );
};
