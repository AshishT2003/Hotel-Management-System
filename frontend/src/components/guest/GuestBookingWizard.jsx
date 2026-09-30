import React, { useState, useEffect } from 'react';
import { StepSearchAvailability } from './StepSearchAvailability';
import { StepSelectRoom } from './StepSelectRoom';
import { StepGuestDetails } from './StepGuestDetails';
import { StepReviewConfirm } from './StepReviewConfirm';
import { BookingConfirmation } from './BookingConfirmation';
import { guestBookingService } from '../../services/guestBookingService';
import { Check, Calendar, BedDouble, UserCheck, CreditCard } from 'lucide-react';

export function GuestBookingWizard({ onNavigateToDashboard, onNavigateToLogin }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Wizard state
  const [searchCriteria, setSearchCriteria] = useState({
    checkIn: new Date().toISOString().split('T')[0],
    checkOut: (() => {
      const d = new Date();
      d.setDate(d.getDate() + 2);
      return d.toISOString().split('T')[0];
    })(),
    guests: { adults: 2, children: 0 }
  });

  const [availableRooms, setAvailableRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);

  const [guestInfo, setGuestInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    specialRequests: ''
  });

  const [diningPerks, setDiningPerks] = useState([]);
  const [amenities, setAmenities] = useState(['Daily Housekeeping', 'Fresh Luxury Towels']);
  const [confirmationData, setConfirmationData] = useState(null);

  // Step 1 -> Search
  const handleSearch = async (criteria) => {
    setIsLoading(true);
    setSearchCriteria(criteria);
    try {
      const rooms = await guestBookingService.getAvailableRooms(
        criteria.checkIn,
        criteria.checkOut,
        criteria.guests.adults + criteria.guests.children
      );
      setAvailableRooms(rooms);
      setCurrentStep(2);
    } catch (err) {
      console.error('Error fetching rooms:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2 -> Select Room & Proceed
  const handleSelectRoom = (room) => {
    setSelectedRoom(room);
  };

  const handleProceedToDetails = () => {
    if (selectedRoom) {
      setCurrentStep(3);
    }
  };

  // Step 3 -> Guest Details Validated
  const handleProceedToReview = () => {
    setCurrentStep(4);
  };

  // Step 4 -> Confirm Booking
  const handleConfirmBooking = async ({ paymentMethod }) => {
    setIsSubmitting(true);
    try {
      const payload = {
        checkIn: searchCriteria.checkIn,
        checkOut: searchCriteria.checkOut,
        roomNumber: selectedRoom.roomNumber,
        roomType: selectedRoom.type,
        floor: selectedRoom.floor,
        guests: searchCriteria.guests,
        guestInfo: {
          firstName: guestInfo.firstName,
          lastName: guestInfo.lastName,
          email: guestInfo.email,
          phone: guestInfo.phone,
          password: guestInfo.password,
          specialRequests: guestInfo.specialRequests
        },
        diningPerks: diningPerks,
        amenities: amenities,
        paymentMethod: paymentMethod
      };

      const result = await guestBookingService.createBooking(payload);
      setConfirmationData(result);
      setCurrentStep(5);
    } catch (err) {
      console.error('Booking failed:', err);
      alert(err.message || 'Booking could not be completed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset wizard
  const handleReset = () => {
    setSelectedRoom(null);
    setDiningPerks([]);
    setAmenities(['Daily Housekeeping', 'Fresh Luxury Towels']);
    setConfirmationData(null);
    setCurrentStep(1);
  };

  const stepsConfig = [
    { num: 1, label: 'Dates & Occupancy', icon: Calendar },
    { num: 2, label: 'Select Room', icon: BedDouble },
    { num: 3, label: 'Guest Details', icon: UserCheck },
    { num: 4, label: 'Review & Confirm', icon: CreditCard }
  ];

  return (
    <div className="space-y-8">
      {/* Wizard Step Progress Tracker (Only visible for steps 1-4) */}
      {currentStep <= 4 && (
        <div className="max-w-3xl mx-auto">
          <div className="relative flex items-center justify-between">
            {/* Background connection bar */}
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-[#1a2539] -translate-y-1/2 z-0" />
            <div
              className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-400 -translate-y-1/2 z-0 transition-all duration-300"
              style={{ width: `${((currentStep - 1) / (stepsConfig.length - 1)) * 100}%` }}
            />

            {stepsConfig.map((s) => {
              const Icon = s.icon;
              const isPast = currentStep > s.num;
              const isCurrent = currentStep === s.num;

              return (
                <div key={s.num} className="relative z-10 flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-200 ${
                      isPast
                        ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/25 ring-2 ring-emerald-500/50'
                        : isCurrent
                        ? 'bg-[#0b1424] text-emerald-400 border-2 border-emerald-400 ring-4 ring-emerald-500/20'
                        : 'bg-[#0f1a2e] text-slate-500 border border-[#1a2539]'
                    }`}
                  >
                    {isPast ? <Check className="w-5 h-5 stroke-[2.5]" /> : <Icon className="w-4 h-4" />}
                  </div>
                  <span
                    className={`hidden sm:block text-xs font-semibold mt-2 ${
                      isCurrent ? 'text-white' : isPast ? 'text-emerald-400' : 'text-slate-500'
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Step View Switcher */}
      {currentStep === 1 && (
        <StepSearchAvailability
          searchCriteria={searchCriteria}
          onSearch={handleSearch}
          isLoading={isLoading}
        />
      )}

      {currentStep === 2 && (
        <StepSelectRoom
          rooms={availableRooms}
          selectedRoom={selectedRoom}
          searchCriteria={searchCriteria}
          onSelectRoom={handleSelectRoom}
          onProceed={handleProceedToDetails}
          onBack={() => setCurrentStep(1)}
        />
      )}

      {currentStep === 3 && selectedRoom && (
        <StepGuestDetails
          selectedRoom={selectedRoom}
          searchCriteria={searchCriteria}
          guestInfo={guestInfo}
          diningPerks={diningPerks}
          amenities={amenities}
          onUpdateGuestInfo={setGuestInfo}
          onUpdateDiningPerks={setDiningPerks}
          onUpdateAmenities={setAmenities}
          onProceed={handleProceedToReview}
          onBack={() => setCurrentStep(2)}
        />
      )}

      {currentStep === 4 && selectedRoom && (
        <StepReviewConfirm
          selectedRoom={selectedRoom}
          searchCriteria={searchCriteria}
          guestInfo={guestInfo}
          diningPerks={diningPerks}
          amenities={amenities}
          onConfirmBooking={handleConfirmBooking}
          onBack={() => setCurrentStep(3)}
          isSubmitting={isSubmitting}
        />
      )}

      {currentStep === 5 && confirmationData && (
        <BookingConfirmation
          confirmationData={confirmationData}
          bookingDetails={{
            selectedRoom,
            searchCriteria,
            guestInfo,
            diningPerks,
            amenities
          }}
          onReset={handleReset}
          onGoToDashboard={onNavigateToDashboard}
          onGoToLogin={onNavigateToLogin}
        />
      )}
    </div>
  );
}
