import React from 'react';
import { OrderQueue } from '../components/kitchen/OrderQueue';
import { ChefHat, Utensils } from 'lucide-react';
import { useHotel } from '../context/HotelContext';

export function KitchenPage() {
  const { stats } = useHotel();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-hotel-200 dark:border-hotel-800">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-hotel-950 dark:text-white tracking-tight flex items-center gap-2">
            <ChefHat className="w-6 h-6 text-amber-500" />
            Kitchen Desk & Room Service
          </h2>
          <p className="text-xs sm:text-sm text-hotel-500 mt-1">
            "On the Line" food prep order queue, housekeeping tasks, fresh towels, and room amenity fulfillment.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 px-3.5 py-2 rounded-xl border border-amber-200 dark:border-amber-800">
          <Utensils className="w-4 h-4" />
          <span>{stats.pendingKitchenOrders} Orders Requiring Prep / Service</span>
        </div>
      </div>

      {/* Main Order Queue */}
      <OrderQueue />
    </div>
  );
}
