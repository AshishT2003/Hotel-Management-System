import React, { useState } from 'react';
import { useHotel } from '../../context/HotelContext';
import { KitchenQueueCard } from './KitchenQueueCard';
import { Button } from '../common/Button';
import { Utensils, CheckCheck, Filter } from 'lucide-react';

export const KitchenQueue: React.FC = () => {
  const { orders, updateOrderStatus } = useHotel();
  const [selectedFloor, setSelectedFloor] = useState<number | 'all'>('all');
  const [queueTab, setQueueTab] = useState<'pending' | 'served' | 'all'>('pending');

  const filteredOrders = orders.filter(o => {
    if (selectedFloor !== 'all' && o.floor !== selectedFloor) return false;
    if (queueTab === 'pending' && o.supplyStatus) return false;
    if (queueTab === 'served' && !o.supplyStatus) return false;
    return true;
  });

  const pendingOrders = orders.filter(o => !o.supplyStatus);
  const servedOrders = orders.filter(o => o.supplyStatus);

  const handleBulkServe = async () => {
    const pendingIds = filteredOrders.filter(o => !o.supplyStatus).map(o => o.orderId);
    for (const id of pendingIds) {
      await updateOrderStatus(id, true);
    }
  };

  return (
    <div className="space-y-6">
      {/* Queue Header & Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        {/* Tabs: Pending vs Served */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setQueueTab('pending')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              queueTab === 'pending'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Utensils className="w-3.5 h-3.5" />
            <span>On The Line ({pendingOrders.length})</span>
          </button>
          <button
            onClick={() => setQueueTab('served')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              queueTab === 'served'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>Fulfilled ({servedOrders.length})</span>
          </button>
          <button
            onClick={() => setQueueTab('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              queueTab === 'all'
                ? 'bg-slate-800 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Orders ({orders.length})
          </button>
        </div>

        {/* Floor Filter & Bulk Action */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex items-center gap-1 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedFloor}
              onChange={e => setSelectedFloor(e.target.value === 'all' ? 'all' : parseInt(e.target.value, 10))}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-800"
            >
              <option value="all">All Floors</option>
              <option value="1">Floor 1 (Single)</option>
              <option value="2">Floor 2 (Double)</option>
              <option value="3">Floor 3 (Twin)</option>
              <option value="4">Floor 4 (Duplex)</option>
              <option value="5">Floor 5 (Suite)</option>
            </select>
          </div>

          {queueTab === 'pending' && pendingOrders.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              icon={<CheckCheck className="w-3.5 h-3.5 text-emerald-600" />}
              onClick={handleBulkServe}
            >
              Serve All Visible
            </Button>
          )}
        </div>
      </div>

      {/* Orders Grid */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <Utensils className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-700">No Orders in this Queue</h3>
          <p className="text-xs text-slate-400 mt-1">
            {queueTab === 'pending'
              ? 'All dining orders and room service requests have been served!'
              : 'No orders match the selected filters.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredOrders.map(order => (
            <KitchenQueueCard
              key={order.orderId}
              orderId={order.orderId}
              roomNumber={order.roomNumber}
              floor={order.floor}
              guestName={order.guestName}
              phoneNumber={order.phoneNumber}
              breakfastCount={order.breakfast}
              lunchCount={order.lunch}
              dinnerCount={order.dinner}
              housekeepingRequested={order.cleaning}
              freshTowelsRequested={order.towel}
              sweetSurpriseRequested={order.surprise}
              isServed={order.supplyStatus}
              onMarkServed={id => updateOrderStatus(id, !order.supplyStatus)}
            />
          ))}
        </div>
      )}
    </div>
  );
};
