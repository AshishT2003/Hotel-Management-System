import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { Reservation, Room, Order, Invoice, ToastMessage } from '../types';
import { api } from '../services/api';

interface HotelContextType {
  reservations: Reservation[];
  filteredReservations: Reservation[];
  rooms: Room[];
  orders: Order[];
  isLoading: boolean;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  activeFilter: 'All' | 'Checked In' | 'Reserved';
  setActiveFilter: (filter: 'All' | 'Checked In' | 'Reserved') => void;
  selectedRoom: string | null;
  setSelectedRoom: (roomNumber: string | null) => void;
  activeInvoice: Invoice | null;
  setActiveInvoice: (invoice: Invoice | null) => void;
  isReservationModalOpen: boolean;
  setIsReservationModalOpen: (open: boolean) => void;
  editingReservation: Reservation | null;
  setEditingReservation: (res: Reservation | null) => void;
  toasts: ToastMessage[];
  addToast: (type: 'success' | 'error' | 'info' | 'warning', message: string, title?: string) => void;
  removeToast: (id: string) => void;
  refreshData: () => Promise<void>;
  createReservation: (data: Partial<Reservation>) => Promise<boolean>;
  updateReservation: (id: number, data: Partial<Reservation>) => Promise<boolean>;
  deleteReservation: (id: number) => Promise<boolean>;
  toggleCheckIn: (id: number, checkIn: boolean) => Promise<boolean>;
  updateOrderStatus: (orderId: number, status: boolean) => Promise<boolean>;
  openInvoiceForReservation: (reservationId: number) => Promise<void>;
}

const HotelContext = createContext<HotelContextType | undefined>(undefined);

export const HotelProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<'All' | 'Checked In' | 'Reserved'>('All');
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [activeInvoice, setActiveInvoice] = useState<Invoice | null>(null);
  const [isReservationModalOpen, setIsReservationModalOpen] = useState(false);
  const [editingReservation, setEditingReservation] = useState<Reservation | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((type: 'success' | 'error' | 'info' | 'warning', message: string, title?: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, type, message, title }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const refreshData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [resData, roomsData, ordersData] = await Promise.all([
        api.reservations.getAll(),
        api.rooms.getMatrix(),
        api.kitchen.getOrders(),
      ]);
      setReservations(resData);
      setRooms(roomsData);
      setOrders(ordersData);
    } catch (err) {
      console.error('Failed to load hotel state:', err);
      addToast('error', 'Unable to synchronize with hotel service');
    } finally {
      setIsLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Instant in-memory search (<50ms requirement)
  const filteredReservations = useMemo(() => {
    let result = reservations;

    if (activeFilter === 'Checked In') {
      result = result.filter(r => r.checkIn);
    } else if (activeFilter === 'Reserved') {
      result = result.filter(r => !r.checkIn);
    }

    if (!searchTerm.trim()) {
      return result;
    }

    const term = searchTerm.toLowerCase().trim();
    return result.filter(r => {
      return (
        r.firstName.toLowerCase().includes(term) ||
        r.lastName.toLowerCase().includes(term) ||
        `${r.firstName} ${r.lastName}`.toLowerCase().includes(term) ||
        r.roomNumber.toLowerCase().includes(term) ||
        r.phoneNumber.replace(/\D/g, '').includes(term.replace(/\D/g, '')) ||
        r.emailAddress.toLowerCase().includes(term) ||
        r.city.toLowerCase().includes(term) ||
        r.state.toLowerCase().includes(term) ||
        r.roomType.toLowerCase().includes(term) ||
        r.id.toString().includes(term)
      );
    });
  }, [reservations, activeFilter, searchTerm]);

  const createReservation = async (data: Partial<Reservation>): Promise<boolean> => {
    try {
      const created = await api.reservations.create(data);
      setReservations(prev => [created, ...prev]);
      addToast('success', `Reservation #${created.id} confirmed for Room ${created.roomNumber}.`);
      await refreshData();
      return true;
    } catch (err) {
      addToast('error', 'Failed to create reservation.');
      return false;
    }
  };

  const updateReservation = async (id: number, data: Partial<Reservation>): Promise<boolean> => {
    // Optimistic update
    setReservations(prev => prev.map(r => (r.id === id ? { ...r, ...data } : r)));
    try {
      await api.reservations.update(id, data);
      addToast('success', `Reservation #${id} updated successfully.`);
      await refreshData();
      return true;
    } catch (err) {
      addToast('error', `Failed to update reservation #${id}.`);
      await refreshData();
      return false;
    }
  };

  const deleteReservation = async (id: number): Promise<boolean> => {
    const backup = [...reservations];
    setReservations(prev => prev.filter(r => r.id !== id));
    try {
      await api.reservations.delete(id);
      addToast('info', `Reservation #${id} removed.`);
      await refreshData();
      return true;
    } catch (err) {
      setReservations(backup);
      addToast('error', `Could not delete reservation #${id}.`);
      return false;
    }
  };

  const toggleCheckIn = async (id: number, checkIn: boolean): Promise<boolean> => {
    setReservations(prev => prev.map(r => (r.id === id ? { ...r, checkIn } : r)));
    try {
      await api.reservations.toggleCheckIn(id, checkIn);
      addToast('success', `Guest ${checkIn ? 'checked in' : 'checked out'} successfully.`);
      await refreshData();
      return true;
    } catch (err) {
      addToast('error', 'Failed to update check-in status.');
      await refreshData();
      return false;
    }
  };

  const updateOrderStatus = async (orderId: number, status: boolean): Promise<boolean> => {
    setOrders(prev => prev.map(o => (o.orderId === orderId ? { ...o, supplyStatus: status } : o)));
    try {
      await api.kitchen.updateOrderStatus(orderId, status);
      addToast('success', `Order #${orderId} marked as ${status ? 'Served' : 'Pending'}.`);
      await refreshData();
      return true;
    } catch (err) {
      addToast('error', 'Failed to update kitchen order status.');
      await refreshData();
      return false;
    }
  };

  const openInvoiceForReservation = async (reservationId: number) => {
    try {
      const inv = await api.reservations.getInvoice(reservationId);
      if (inv) {
        setActiveInvoice(inv);
      } else {
        addToast('error', 'Unable to generate invoice.');
      }
    } catch (err) {
      addToast('error', 'Failed to fetch invoice details.');
    }
  };

  return (
    <HotelContext.Provider
      value={{
        reservations,
        filteredReservations,
        rooms,
        orders,
        isLoading,
        searchTerm,
        setSearchTerm,
        activeFilter,
        setActiveFilter,
        selectedRoom,
        setSelectedRoom,
        activeInvoice,
        setActiveInvoice,
        isReservationModalOpen,
        setIsReservationModalOpen,
        editingReservation,
        setEditingReservation,
        toasts,
        addToast,
        removeToast,
        refreshData,
        createReservation,
        updateReservation,
        deleteReservation,
        toggleCheckIn,
        updateOrderStatus,
        openInvoiceForReservation,
      }}
    >
      {children}
    </HotelContext.Provider>
  );
};

export const useHotel = () => {
  const context = useContext(HotelContext);
  if (!context) {
    throw new Error('useHotel must be used within a HotelProvider');
  }
  return context;
};
