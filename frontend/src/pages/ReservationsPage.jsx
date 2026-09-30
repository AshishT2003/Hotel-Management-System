import React, { useState } from 'react';
import { ReservationTable } from '../components/reservation/ReservationTable';
import { ReservationModal } from '../components/reservation/ReservationModal';
import { Button } from '../components/common/Button';
import { PlusCircle, CalendarCheck } from 'lucide-react';

export function ReservationsPage({ isOpenModal, onOpenModal, onCloseModal }) {
  const [editingReservation, setEditingReservation] = useState(null);

  const handleEdit = (res) => {
    setEditingReservation(res);
    onOpenModal();
  };

  const handleClose = () => {
    setEditingReservation(null);
    onCloseModal();
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-hotel-200 dark:border-hotel-800">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-hotel-950 dark:text-white tracking-tight flex items-center gap-2">
            <CalendarCheck className="w-6 h-6 text-emerald-600" />
            Guest Reservations Hub
          </h2>
          <p className="text-xs sm:text-sm text-hotel-500 mt-1">
            Universal search, entry modification, instant check-in/out, and guest record management.
          </p>
        </div>

        <Button
          variant="primary"
          icon={PlusCircle}
          onClick={() => {
            setEditingReservation(null);
            onOpenModal();
          }}
        >
          New Reservation
        </Button>
      </div>

      {/* Main Reservation Table */}
      <ReservationTable onEditReservation={handleEdit} />

      {/* Booking / Edit Modal */}
      <ReservationModal
        isOpen={isOpenModal}
        onClose={handleClose}
        editingReservation={editingReservation}
      />
    </div>
  );
}

export default ReservationsPage;
