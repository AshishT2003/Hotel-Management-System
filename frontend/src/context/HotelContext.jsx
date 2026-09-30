import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { storageService } from '../services/storageService';
import { housekeepingService } from '../services/housekeepingService';
import { guestProfileService } from '../services/guestProfileService';
import { auditService } from '../services/auditService';
import { ALL_ROOM_NUMBERS } from '../utils/roomData';

const HotelContext = createContext(null);

export function HotelProvider({ children }) {
  const [reservations, setReservations] = useState([]);
  const [housekeepingTasks, setHousekeepingTasks] = useState([]);
  const [guestProfiles, setGuestProfiles] = useState([]);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const loadData = async () => {
    const data = storageService.getReservations();
    setReservations(data);

    try {
      const tasks = await housekeepingService.getTasks('All');
      setHousekeepingTasks(tasks);
    } catch (err) {
      console.error('Failed to load housekeeping tasks:', err);
    }

    try {
      const profiles = await guestProfileService.getAllVipGuests();
      setGuestProfiles(profiles);
    } catch (err) {
      console.error('Failed to load guest profiles:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Compute live room status map
  // Available (Ready/Dirty/Cleaning), Reserved (checkIn === false), Occupied (checkIn === true)
  const roomStatusMap = useMemo(() => {
    const map = {};
    ALL_ROOM_NUMBERS.forEach(roomNum => {
      const hk = housekeepingTasks.find(t => t.roomNumber === roomNum);
      map[roomNum] = {
        roomNumber: roomNum,
        status: 'Available',
        housekeepingStatus: hk ? hk.status : 'Ready',
        housekeepingPriority: hk ? hk.priority : 'Normal',
        reservation: null
      };
    });

    const activeReservations = reservations.filter(r => r.status !== 'Cancelled' && r.status !== 'Checked-Out');

    // First assign pending reservations
    activeReservations.filter(r => !r.checkIn && r.status !== 'Checked-In').forEach(r => {
      const roomNum = String(r.roomNumber).trim();
      if (map[roomNum]) {
        map[roomNum] = {
          ...map[roomNum],
          status: 'Reserved',
          reservation: r
        };
      }
    });

    // Then assign checked-in guests (occupancy takes precedence)
    activeReservations.filter(r => r.checkIn || r.status === 'Checked-In').forEach(r => {
      const roomNum = String(r.roomNumber).trim();
      if (map[roomNum]) {
        map[roomNum] = {
          ...map[roomNum],
          status: 'Occupied',
          reservation: r
        };
      }
    });

    return map;
  }, [reservations, housekeepingTasks]);

  // Aggregate statistics derived directly from physical room matrix
  const stats = useMemo(() => {
    const activeReservations = reservations.filter(r => r.status !== 'Cancelled' && r.status !== 'Checked-Out');
    const totalReservations = activeReservations.length;

    let occupiedCount = 0;
    let reservedCount = 0;
    let availableCount = 0;

    ALL_ROOM_NUMBERS.forEach(roomNum => {
      const room = roomStatusMap[roomNum];
      if (room?.status === 'Occupied') occupiedCount++;
      else if (room?.status === 'Reserved') reservedCount++;
      else availableCount++;
    });

    const totalRevenue = reservations.filter(r => r.status !== 'Cancelled').reduce((acc, curr) => acc + (Number(curr.totalBill) || 0), 0);
    const pendingKitchenOrders = activeReservations.filter(
      r => (r.breakfast > 0 || r.lunch > 0 || r.dinner > 0 || r.cleaning || r.towel || r.surprise) && !r.supplyStatus
    ).length;

    const occupancyRate = ALL_ROOM_NUMBERS.length > 0 
      ? Math.round((occupiedCount / ALL_ROOM_NUMBERS.length) * 100) 
      : 0;

    return {
      totalReservations,
      occupiedCount,
      reservedCount,
      availableCount,
      totalRevenue,
      pendingKitchenOrders,
      occupancyRate,
      totalRooms: ALL_ROOM_NUMBERS.length
    };
  }, [reservations, roomStatusMap]);

  const addReservation = (formData) => {
    try {
      const newRes = storageService.addReservation(formData);
      setReservations(prev => [newRes, ...prev]);
      showToast(`Reservation #${newRes.id} for ${newRes.firstName} ${newRes.lastName} created successfully!`);
      
      // Auto-register/enrich guest profile in background
      if (newRes.emailAddress) {
        guestProfileService.getOrCreateProfile({
          email: newRes.emailAddress,
          firstName: newRes.firstName,
          lastName: newRes.lastName,
          phone: newRes.phoneNumber
        }).then(p => {
          if (p) {
            setGuestProfiles(prev => {
              const existingIdx = prev.findIndex(item => item.email === p.email);
              if (existingIdx >= 0) {
                const updated = [...prev];
                updated[existingIdx] = p;
                return updated;
              }
              return [...prev, p];
            });
          }
        }).catch(() => {});
      }

      return newRes;
    } catch (err) {
      showToast(err.message || 'Failed to create reservation', 'error');
      throw err;
    }
  };

  const updateReservation = (id, fields) => {
    try {
      const updated = storageService.updateReservation(id, fields);
      setReservations(prev => prev.map(r => r.id === Number(id) ? updated : r));
      showToast(`Reservation #${id} updated successfully!`);
      return updated;
    } catch (err) {
      showToast(err.message || 'Failed to update reservation', 'error');
      throw err;
    }
  };

  const deleteReservation = (id) => {
    try {
      storageService.deleteReservation(id);
      setReservations(prev => prev.filter(r => r.id !== Number(id)));
      showToast(`Reservation #${id} deleted successfully.`, 'info');
    } catch (err) {
      showToast('Failed to delete reservation', 'error');
    }
  };

  const toggleCheckIn = (id) => {
    try {
      const updated = storageService.toggleCheckIn(id);
      if (updated) {
        setReservations(prev => prev.map(r => r.id === Number(id) ? updated : r));
        const isNowCheckedOut = updated.status === 'Checked-Out';
        showToast(
          `Guest ${updated.firstName} ${updated.lastName} has ${isNowCheckedOut ? 'checked out' : 'checked in to Room ' + updated.roomNumber}.`
        );

        // Luxury State Machine: When guest checks out, auto-transition room to 'Dirty' for turnover clean!
        if (isNowCheckedOut && updated.roomNumber) {
          const roomNum = String(updated.roomNumber).trim();
          housekeepingService.triggerCheckoutTurnover(roomNum, 'Silver')
            .then(task => {
              setHousekeepingTasks(prev => prev.map(t => t.roomNumber === roomNum ? task : t));
              showToast(`Room ${roomNum} queued for Housekeeping Turnover (Dirty)`, 'info');
            })
            .catch(() => {});
        }
      }
    } catch (err) {
      showToast('Failed to update check-in status', 'error');
    }
  };

  const checkOutGuest = (id) => {
    toggleCheckIn(id);
  };

  const updateSupplyStatus = async (id, status) => {
    try {
      const updated = storageService.updateSupplyStatus(id, status);
      if (updated) {
        setReservations(prev => prev.map(r => r.id === Number(id) ? updated : r));
        showToast(`Order for Room ${updated.roomNumber} marked as ${status ? 'Served' : 'Pending'}.`);

        // Record compliance audit log (KRS-139 - KRS-141)
        auditService.logEvent({
          action: status ? 'Kitchen Order Served' : 'Kitchen Order Re-opened',
          category: 'Kitchen',
          details: `Room service order #${id} for Room ${updated.roomNumber} (${updated.firstName} ${updated.lastName}) marked as ${status ? 'Served' : 'Pending'}.`,
          actor: 'Chef Marco Silva',
          role: 'Kitchen Staff',
          severity: status ? 'SUCCESS' : 'INFO',
          metadata: { orderId: id, roomNumber: updated.roomNumber, guest: `${updated.firstName} ${updated.lastName}`, status: status ? 'Served' : 'Pending' }
        });

        return updated;
      }
    } catch (err) {
      showToast('Failed to update order status', 'error');
      throw err;
    }
  };

  const updateHousekeepingStatus = async (roomNumber, updateData) => {
    const updated = await housekeepingService.updateStatus(roomNumber, updateData);
    setHousekeepingTasks(prev => prev.map(t => t.roomNumber === roomNumber ? updated : t));
    return updated;
  };

  const refreshHousekeeping = async () => {
    const tasks = await housekeepingService.getTasks('All');
    setHousekeepingTasks(tasks);
    return tasks;
  };

  return (
    <HotelContext.Provider
      value={{
        reservations,
        stats,
        roomStatusMap,
        housekeepingTasks,
        guestProfiles,
        addReservation,
        updateReservation,
        deleteReservation,
        toggleCheckIn,
        checkOutGuest,
        updateSupplyStatus,
        updateHousekeepingStatus,
        refreshHousekeeping,
        toast,
        showToast
      }}
    >
      {children}
    </HotelContext.Provider>
  );
}

export function useHotel() {
  const context = useContext(HotelContext);
  if (!context) {
    throw new Error('useHotel must be used within a HotelProvider');
  }
  return context;
}
