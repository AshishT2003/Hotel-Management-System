import React from 'react';
import { BookingConfirmationReceipt } from './BookingConfirmationReceipt';

export function BookingConfirmation({
  confirmationData,
  bookingDetails,
  onReset,
  onGoToDashboard,
  onGoToLogin
}) {
  const checkInFormatted = bookingDetails?.searchCriteria?.checkIn
    ? new Date(bookingDetails.searchCriteria.checkIn).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ', 3:00 PM'
    : '30 Sep 2026, 3:00 PM';

  const checkOutFormatted = bookingDetails?.searchCriteria?.checkOut
    ? new Date(bookingDetails.searchCriteria.checkOut).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ', 11:00 AM'
    : '02 Oct 2026, 11:00 AM';

  const breakdown = confirmationData?.breakdown;

  const charges = [
    { label: 'Room Charges', amount: breakdown?.roomTotal ?? 298.0 },
    ...(breakdown?.diningTotal ? [{ label: 'Dining Packages', amount: breakdown.diningTotal }] : [{ label: 'Dining Packages', amount: 34.0 }]),
    ...(breakdown?.amenitiesTotal ? [{ label: 'Sweet Surprise Amenity', amount: breakdown.amenitiesTotal }] : [{ label: 'Sweet Surprise Amenity', amount: 25.0 }]),
    { label: 'Hotel Occupancy Tax (7%)', amount: breakdown?.tax ?? 24.99 },
  ];

  const reservation = {
    confirmationCode: confirmationData?.confirmationCode || 'GH-1017-2026',
    status: confirmationData?.status || 'Reserved',
    issuedAt: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ', ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    guest: {
      fullName: bookingDetails?.guestInfo?.firstName
        ? `${bookingDetails.guestInfo.firstName} ${bookingDetails.guestInfo.lastName || ''}`.trim()
        : 'Hotel Guest',
      phone: bookingDetails?.guestInfo?.phone || 'N/A',
      email: bookingDetails?.guestInfo?.email || 'N/A',
    },
    stay: {
      roomNumber: bookingDetails?.selectedRoom?.roomNumber || '102',
      roomType: bookingDetails?.selectedRoom?.type ? `${bookingDetails.selectedRoom.type} Suite` : 'Single Suite',
      floor: String(bookingDetails?.selectedRoom?.floor || '1'),
      checkIn: checkInFormatted,
      checkOut: checkOutFormatted,
    },
    charges: charges,
    currency: 'USD',
    totalAmount: confirmationData?.totalAmount ?? 381.99,
    cancellationPolicy: 'You may cancel this booking with a 100% full refund up to 48 hours before check-in.'
  };

  return (
    <BookingConfirmationReceipt
      reservation={reservation}
      onReset={onReset}
      onGoToDashboard={onGoToDashboard}
      onGoToLogin={onGoToLogin}
    />
  );
}

export default BookingConfirmation;
