import { useState, useEffect, useCallback } from 'react';
import { Order } from '../types';
import { api } from '../services/api';

export function useKitchenQueue(
  pollIntervalMs = 15000,
  notify?: (type: 'success' | 'error' | 'info' | 'warning', message: string) => void
) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchOrders = useCallback(async () => {
    try {
      const data = await api.kitchen.getOrders();
      setOrders(data);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Kitchen queue sync failed:', err);
    }
  }, []);

  // Polling setup for active orders
  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, pollIntervalMs);
    return () => clearInterval(interval);
  }, [fetchOrders, pollIntervalMs]);

  const toggleOrderStatus = useCallback(
    async (orderId: number, newStatus: boolean): Promise<boolean> => {
      const original = [...orders];

      // Optimistic update
      setOrders(prev =>
        prev.map(o => (o.orderId === orderId ? { ...o, supplyStatus: newStatus } : o))
      );

      try {
        const ok = await api.kitchen.updateOrderStatus(orderId, newStatus);
        if (!ok) throw new Error('Status update failed');
        notify?.(
          'success',
          `Order #${orderId} marked as ${newStatus ? 'Served' : 'Pending'}.`
        );
        return true;
      } catch (err) {
        // Rollback
        setOrders(original);
        notify?.('error', `Failed to update Order #${orderId}. Rolled back.`);
        return false;
      }
    },
    [orders, notify]
  );

  const bulkMarkServed = useCallback(
    async (orderIds: number[]): Promise<void> => {
      for (const id of orderIds) {
        await toggleOrderStatus(id, true);
      }
    },
    [toggleOrderStatus]
  );

  const pendingOrders = orders.filter(o => !o.supplyStatus);
  const fulfilledOrders = orders.filter(o => o.supplyStatus);

  return {
    orders,
    pendingOrders,
    fulfilledOrders,
    isLoading,
    lastUpdated,
    refresh: fetchOrders,
    toggleOrderStatus,
    bulkMarkServed,
  };
}
