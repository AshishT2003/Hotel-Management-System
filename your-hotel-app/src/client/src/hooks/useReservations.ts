import { useState, useCallback } from 'react';
import { Reservation } from '../types';
import { api } from '../services/api';

export function useReservations(
  initialReservations: Reservation[],
  notify?: (type: 'success' | 'error' | 'info' | 'warning', message: string) => void
) {
  const [reservations, setReservations] = useState<Reservation[]>(initialReservations);
  const [isProcessing, setIsProcessing] = useState(false);

  const create = useCallback(
    async (data: Partial<Reservation>): Promise<Reservation | null> => {
      setIsProcessing(true);
      try {
        const created = await api.reservations.create(data);
        setReservations(prev => [created, ...prev]);
        notify?.('success', `Reservation #${created.id} confirmed for Room ${created.roomNumber}.`);
        return created;
      } catch (err) {
        notify?.('error', 'Failed to save reservation to hotel database.');
        return null;
      } finally {
        setIsProcessing(false);
      }
    },
    [notify]
  );

  const update = useCallback(
    async (id: number, data: Partial<Reservation>): Promise<boolean> => {
      setIsProcessing(true);
      const original = [...reservations];

      // Optimistic update
      setReservations(prev => prev.map(r => (r.id === id ? { ...r, ...data } : r)));

      try {
        const ok = await api.reservations.update(id, data);
        if (!ok) throw new Error('Update failed');
        notify?.('success', `Reservation #${id} updated successfully.`);
        return true;
      } catch (err) {
        // Rollback on error
        setReservations(original);
        notify?.('error', `Failed to update reservation #${id}. Changes rolled back.`);
        return false;
      } finally {
        setIsProcessing(false);
      }
    },
    [reservations, notify]
  );

  const remove = useCallback(
    async (id: number): Promise<boolean> => {
      setIsProcessing(true);
      const original = [...reservations];

      // Optimistic delete
      setReservations(prev => prev.filter(r => r.id !== id));

      try {
        const ok = await api.reservations.delete(id);
        if (!ok) throw new Error('Delete failed');
        notify?.('info', `Reservation #${id} cancelled.`);
        return true;
      } catch (err) {
        // Rollback
        setReservations(original);
        notify?.('error', `Could not delete reservation #${id}. Restored.`);
        return false;
      } finally {
        setIsProcessing(false);
      }
    },
    [reservations, notify]
  );

  const toggleCheckIn = useCallback(
    async (id: number, checkIn: boolean): Promise<boolean> => {
      const original = [...reservations];

      // Optimistic update
      setReservations(prev => prev.map(r => (r.id === id ? { ...r, checkIn } : r)));

      try {
        const ok = await api.reservations.toggleCheckIn(id, checkIn);
        if (!ok) throw new Error('Check-in status failed');
        notify?.(
          'success',
          `Guest successfully ${checkIn ? 'checked in (Room Occupied)' : 'checked out (Room Vacant)'}.`
        );
        return true;
      } catch (err) {
        // Rollback
        setReservations(original);
        notify?.('error', 'Failed to toggle check-in status. Rolled back.');
        return false;
      }
    },
    [reservations, notify]
  );

  return {
    reservations,
    setReservations,
    isProcessing,
    create,
    update,
    remove,
    toggleCheckIn,
  };
}
