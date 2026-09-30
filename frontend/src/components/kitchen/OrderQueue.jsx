import React, { useState, useMemo } from 'react';
import { useHotel } from '../../context/HotelContext';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { formatCurrency } from '../../utils/formatters';
import { 
  ChefHat, 
  CheckCircle2, 
  BedDouble, 
  RefreshCw
} from 'lucide-react';

export function OrderQueue() {
  const { reservations, updateSupplyStatus } = useHotel();
  const [activeTab, setActiveTab] = useState('LINE'); // 'LINE' | 'ALL_OCCUPANCY'
  const [updatingOrderIds, setUpdatingOrderIds] = useState(new Set());

  // Active in-house reservations eligible for kitchen / room-service prep
  const activeReservations = useMemo(() => {
    return reservations.filter(r => r.status !== 'Cancelled' && r.status !== 'Checked-Out');
  }, [reservations]);

  // Pending orders requiring prep or service
  const pendingOrders = useMemo(() => {
    return activeReservations.filter(
      r => (Number(r.breakfast) > 0 || Number(r.lunch) > 0 || Number(r.dinner) > 0 || r.cleaning || r.towel || r.surprise) && !r.supplyStatus
    );
  }, [activeReservations]);

  // Recently served orders (KRS-038 - KRS-044, KRS-120 - KRS-125)
  const completedOrders = useMemo(() => {
    return reservations.filter(
      r => (Number(r.breakfast) > 0 || Number(r.lunch) > 0 || Number(r.dinner) > 0 || r.cleaning || r.towel || r.surprise) && r.supplyStatus && r.status !== 'Cancelled'
    );
  }, [reservations]);

  // Tab 2: Kitchen Overview - strictly in-house checked-in guests (KRS-056 - KRS-058)
  const inHouseGuests = useMemo(() => {
    return reservations.filter(
      r => (r.checkIn || r.status === 'Checked-In') && r.status !== 'Checked-Out' && r.status !== 'Cancelled'
    );
  }, [reservations]);

  // Guarded actions with double-click / rapid-click protection (KRS-045, KRS-046, KRS-053, KRS-144, KRS-145)
  const handleServeOrder = async (orderId) => {
    if (updatingOrderIds.has(orderId)) return;
    setUpdatingOrderIds(prev => new Set(prev).add(orderId));
    try {
      await updateSupplyStatus(orderId, true);
    } catch (err) {
      console.error('Failed to serve order:', err);
    } finally {
      setUpdatingOrderIds(prev => {
        const next = new Set(prev);
        next.delete(orderId);
        return next;
      });
    }
  };

  const handleReopenOrder = async (orderId) => {
    if (updatingOrderIds.has(orderId)) return;
    setUpdatingOrderIds(prev => new Set(prev).add(orderId));
    try {
      await updateSupplyStatus(orderId, false);
    } catch (err) {
      console.error('Failed to reopen order:', err);
    } finally {
      setUpdatingOrderIds(prev => {
        const next = new Set(prev);
        next.delete(orderId);
        return next;
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Tab Switcher */}
      <div 
        role="tablist" 
        aria-label="Kitchen Order Management Tabs"
        className="flex items-center justify-between p-4 rounded-xl border border-hotel-200 dark:border-hotel-800 bg-white dark:bg-hotel-900 shadow-sm"
      >
        <div className="flex items-center gap-2">
          <button
            type="button"
            role="tab"
            id="tab-line"
            aria-selected={activeTab === 'LINE'}
            aria-controls="panel-line"
            onClick={() => setActiveTab('LINE')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
              activeTab === 'LINE'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'text-hotel-600 dark:text-hotel-400 hover:bg-hotel-100 dark:hover:bg-hotel-800'
            }`}
          >
            <ChefHat className="w-4 h-4" />
            <span>On The Line: Active Orders</span>
            {pendingOrders.length > 0 && (
              <span className="ml-1 px-2 py-0.5 text-xs bg-amber-500 text-hotel-950 font-black rounded-full">
                {pendingOrders.length}
              </span>
            )}
          </button>

          <button
            type="button"
            role="tab"
            id="tab-occupancy"
            aria-selected={activeTab === 'ALL_OCCUPANCY'}
            aria-controls="panel-occupancy"
            onClick={() => setActiveTab('ALL_OCCUPANCY')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
              activeTab === 'ALL_OCCUPANCY'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'text-hotel-600 dark:text-hotel-400 hover:bg-hotel-100 dark:hover:bg-hotel-800'
            }`}
          >
            <BedDouble className="w-4 h-4" />
            <span>Kitchen Overview: All In-House Guests</span>
            <span className="ml-1 px-2 py-0.5 text-xs bg-hotel-200 dark:bg-hotel-800 text-hotel-700 dark:text-hotel-300 font-bold rounded-full">
              {inHouseGuests.length}
            </span>
          </button>
        </div>

        <div className="text-xs text-hotel-500 hidden sm:block">
          Orders queue updates automatically as guests check-in or request room dining
        </div>
      </div>

      {/* Tab 1: On The Line Kanban / Cards */}
      {activeTab === 'LINE' && (
        <div 
          id="panel-line"
          role="tabpanel"
          aria-labelledby="tab-line"
          className="space-y-6"
        >
          {/* Pending Orders Section */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" aria-hidden="true" />
              <h3 className="text-base font-bold text-hotel-950 dark:text-white">
                Queue Pending Service ({pendingOrders.length})
              </h3>
            </div>

            {pendingOrders.length === 0 ? (
              <div className="p-8 text-center rounded-2xl border border-dashed border-hotel-300 dark:border-hotel-700 bg-hotel-50/50 dark:bg-hotel-900/50">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                <p className="text-sm font-bold text-hotel-900 dark:text-hotel-100">All caught up!</p>
                <p className="text-xs text-hotel-400 mt-1">No active room-service orders in the queue right now.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pendingOrders.map(order => {
                  const isUpdating = updatingOrderIds.has(order.id);
                  const breakfastQty = Math.max(0, Number(order.breakfast) || 0);
                  const lunchQty = Math.max(0, Number(order.lunch) || 0);
                  const dinnerQty = Math.max(0, Number(order.dinner) || 0);

                  return (
                    <div
                      key={order.id}
                      className="rounded-2xl border-2 border-amber-300 dark:border-amber-700/80 bg-white dark:bg-hotel-900 p-5 shadow-md flex flex-col justify-between transition-shadow hover:shadow-lg"
                    >
                      <div>
                        {/* Header */}
                        <div className="flex items-start justify-between pb-3 border-b border-hotel-100 dark:border-hotel-800">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xl font-black text-hotel-950 dark:text-white">
                                Room {order.roomNumber}
                              </span>
                              <Badge variant="warning">Floor {order.roomFloor}</Badge>
                            </div>
                            <p className="text-xs font-semibold text-hotel-500 mt-0.5">
                              {order.firstName} {order.lastName}
                            </p>
                          </div>
                          <div className="text-right text-[11px] text-hotel-400">
                            <p className="font-mono">#{order.id}</p>
                            <p>{order.phoneNumber}</p>
                          </div>
                        </div>

                        {/* Meals Breakdown */}
                        <div className="py-3 space-y-2">
                          <p className="text-xs font-bold text-hotel-400 uppercase tracking-wider">
                            Meal Requests:
                          </p>
                          <div className="grid grid-cols-3 gap-2 text-center">
                            <div 
                              aria-label={`Breakfast: ${breakfastQty} requested`}
                              className={`p-2 rounded-xl border transition-colors ${
                                breakfastQty > 0 
                                  ? 'bg-amber-50 border-amber-300 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 shadow-sm' 
                                  : 'bg-hotel-50 border-hotel-200 dark:bg-hotel-850 dark:border-hotel-800 text-hotel-400'
                              }`}
                            >
                              <p className="text-[10px] font-bold uppercase">Breakfast</p>
                              <p className="text-base font-black">{breakfastQty}</p>
                            </div>
                            <div 
                              aria-label={`Lunch: ${lunchQty} requested`}
                              className={`p-2 rounded-xl border transition-colors ${
                                lunchQty > 0 
                                  ? 'bg-amber-50 border-amber-300 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 shadow-sm' 
                                  : 'bg-hotel-50 border-hotel-200 dark:bg-hotel-850 dark:border-hotel-800 text-hotel-400'
                              }`}
                            >
                              <p className="text-[10px] font-bold uppercase">Lunch</p>
                              <p className="text-base font-black">{lunchQty}</p>
                            </div>
                            <div 
                              aria-label={`Dinner: ${dinnerQty} requested`}
                              className={`p-2 rounded-xl border transition-colors ${
                                dinnerQty > 0 
                                  ? 'bg-amber-50 border-amber-300 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 shadow-sm' 
                                  : 'bg-hotel-50 border-hotel-200 dark:bg-hotel-850 dark:border-hotel-800 text-hotel-400'
                              }`}
                            >
                              <p className="text-[10px] font-bold uppercase">Dinner</p>
                              <p className="text-base font-black">{dinnerQty}</p>
                            </div>
                          </div>

                          {/* Special requests */}
                          <div className="pt-2">
                            <p className="text-xs font-bold text-hotel-400 uppercase tracking-wider mb-1.5">
                              Special Requests:
                            </p>
                            <div className="flex flex-wrap gap-1.5 text-xs font-medium">
                              {order.cleaning && (
                                <span className="px-2 py-1 rounded-lg bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300 font-semibold">
                                  🧹 Housekeeping
                                </span>
                              )}
                              {order.towel && (
                                <span className="px-2 py-1 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 font-semibold">
                                  🧺 Fresh Towels
                                </span>
                              )}
                              {order.surprise && (
                                <span className="px-2 py-1 rounded-lg bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 font-semibold">
                                  🎁 Sweet Surprise Gift
                                </span>
                              )}
                              {!order.cleaning && !order.towel && !order.surprise && (
                                <span className="text-hotel-400 text-xs">Standard Room Service</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Action button */}
                      <div className="pt-3 border-t border-hotel-100 dark:border-hotel-800">
                        <Button
                          type="button"
                          variant="primary"
                          className="w-full justify-center focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                          icon={isUpdating ? RefreshCw : CheckCircle2}
                          disabled={isUpdating}
                          onClick={() => handleServeOrder(order.id)}
                          aria-label={`Mark order for Room ${order.roomNumber} as served`}
                        >
                          {isUpdating ? 'Serving...' : 'Mark Order as Served'}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Completed Orders Section (KRS-120 - KRS-127) */}
          <div className="pt-6 border-t border-hotel-200 dark:border-hotel-800">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <h3 className="text-base font-bold text-hotel-950 dark:text-white">
                Recently Served Orders ({completedOrders.length})
              </h3>
            </div>

            {completedOrders.length === 0 ? (
              <div className="p-4 text-center rounded-xl border border-dashed border-hotel-200 dark:border-hotel-800 bg-hotel-50/30 dark:bg-hotel-900/30 text-xs text-hotel-400">
                No recently served orders in this session.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                {completedOrders.map(order => {
                  const isUpdating = updatingOrderIds.has(order.id);
                  return (
                    <div
                      key={order.id}
                      className="p-3.5 rounded-xl border border-hotel-200 dark:border-hotel-800 bg-white dark:bg-hotel-900 flex items-center justify-between text-xs shadow-sm hover:shadow transition-shadow"
                    >
                      <div>
                        <p className="font-extrabold text-sm text-hotel-900 dark:text-hotel-100">
                          Room {order.roomNumber}
                        </p>
                        <p className="text-[11px] text-hotel-500 font-medium">{order.firstName} {order.lastName}</p>
                        <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
                          Served · Total: {formatCurrency(order.foodBill || 0)}
                        </p>
                      </div>
                      <button
                        type="button"
                        disabled={isUpdating}
                        onClick={() => handleReopenOrder(order.id)}
                        title="Mark back to Pending"
                        aria-label={`Re-open order for Room ${order.roomNumber}`}
                        className="text-[10px] font-semibold text-hotel-500 hover:text-hotel-800 dark:hover:text-hotel-200 underline focus:ring-2 focus:ring-emerald-500 focus:outline-none rounded disabled:opacity-50"
                      >
                        {isUpdating ? 'Re-opening...' : 'Re-open'}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Overview of All In-House Occupancy (KRS-055 - KRS-059) */}
      {activeTab === 'ALL_OCCUPANCY' && (
        <div 
          id="panel-occupancy"
          role="tabpanel"
          aria-labelledby="tab-occupancy"
          className="rounded-xl border border-hotel-200 dark:border-hotel-800 bg-white dark:bg-hotel-900 overflow-x-auto shadow-sm"
        >
          <table className="w-full text-left text-xs">
            <thead className="bg-hotel-50 dark:bg-hotel-850/60 border-b border-hotel-200 dark:border-hotel-800 text-[11px] font-bold text-hotel-500 uppercase tracking-wider">
              <tr>
                <th scope="col" className="py-3 px-4">Room #</th>
                <th scope="col" className="py-3 px-4">Guest Name</th>
                <th scope="col" className="py-3 px-4">Phone</th>
                <th scope="col" className="py-3 px-4">Room Type</th>
                <th scope="col" className="py-3 px-4">Breakfast</th>
                <th scope="col" className="py-3 px-4">Lunch</th>
                <th scope="col" className="py-3 px-4">Dinner</th>
                <th scope="col" className="py-3 px-4">Services</th>
                <th scope="col" className="py-3 px-4">Supply Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hotel-100 dark:divide-hotel-800">
              {inHouseGuests.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-hotel-400">
                    No in-house guests currently checked in.
                  </td>
                </tr>
              ) : (
                inHouseGuests.map(r => {
                  const hasMealOrService = Number(r.breakfast) > 0 || Number(r.lunch) > 0 || Number(r.dinner) > 0 || r.cleaning || r.towel || r.surprise;
                  return (
                    <tr key={r.id} className="hover:bg-hotel-50/50 dark:hover:bg-hotel-800/30">
                      <td className="py-3 px-4 font-black text-sm text-emerald-600 dark:text-emerald-400">
                        Room {r.roomNumber}
                      </td>
                      <td className="py-3 px-4 font-bold text-hotel-900 dark:text-hotel-100">
                        {r.firstName} {r.lastName}
                      </td>
                      <td className="py-3 px-4 text-hotel-500">{r.phoneNumber}</td>
                      <td className="py-3 px-4 text-hotel-500">{r.roomType} (F{r.roomFloor})</td>
                      <td className="py-3 px-4 font-semibold">{r.breakfast || '—'}</td>
                      <td className="py-3 px-4 font-semibold">{r.lunch || '—'}</td>
                      <td className="py-3 px-4 font-semibold">{r.dinner || '—'}</td>
                      <td className="py-3 px-4">
                        <span className="text-[11px] text-hotel-500">
                          {[r.cleaning && 'Cleaning', r.towel && 'Towels', r.surprise && 'Surprise'].filter(Boolean).join(', ') || 'None'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {hasMealOrService ? (
                          <Badge variant={r.supplyStatus ? 'success' : 'warning'} dot>
                            {r.supplyStatus ? 'Served' : 'Pending'}
                          </Badge>
                        ) : (
                          <span className="text-hotel-400 text-[11px]">No Orders</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
