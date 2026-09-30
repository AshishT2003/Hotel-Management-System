import React from 'react';
import { useHotel } from '../context/HotelContext';
import { KitchenQueue } from '../components/kitchen/KitchenQueue';
import { UtensilsCrossed, Sparkles, Coffee } from 'lucide-react';

export const KitchenPage: React.FC = () => {
  const { orders } = useHotel();

  const totalBreakfast = orders.reduce((sum, o) => sum + o.breakfast, 0);
  const totalLunch = orders.reduce((sum, o) => sum + o.lunch, 0);
  const totalDinner = orders.reduce((sum, o) => sum + o.dinner, 0);
  const housekeepingCount = orders.filter(o => o.cleaning).length;
  const towelCount = orders.filter(o => o.towel).length;
  const surpriseCount = orders.filter(o => o.surprise).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-amber-500 text-slate-950">
            <UtensilsCrossed className="w-5 h-5" />
          </div>
          <h1 className="text-xl font-bold font-serif text-slate-900">
            Kitchen & Dining Service Desk
          </h1>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Live dispatch queue ("On The Line") for meal preparation, beverage service, and room amenities.
        </p>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm text-center">
          <span className="text-[10px] text-slate-400 uppercase font-semibold block">Breakfast Orders</span>
          <span className="text-xl font-bold font-mono text-slate-900">{totalBreakfast}</span>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm text-center">
          <span className="text-[10px] text-slate-400 uppercase font-semibold block">Lunch Orders</span>
          <span className="text-xl font-bold font-mono text-slate-900">{totalLunch}</span>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm text-center">
          <span className="text-[10px] text-slate-400 uppercase font-semibold block">Dinner Orders</span>
          <span className="text-xl font-bold font-mono text-slate-900">{totalDinner}</span>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm text-center">
          <span className="text-[10px] text-slate-400 uppercase font-semibold block">Housekeeping</span>
          <span className="text-xl font-bold font-mono text-blue-600">{housekeepingCount}</span>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm text-center">
          <span className="text-[10px] text-slate-400 uppercase font-semibold block">Fresh Towels</span>
          <span className="text-xl font-bold font-mono text-teal-600">{towelCount}</span>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm text-center">
          <span className="text-[10px] text-amber-500 uppercase font-semibold block flex items-center justify-center gap-1">
            <Sparkles className="w-2.5 h-2.5" /> VIP Surprises
          </span>
          <span className="text-xl font-bold font-mono text-amber-600">{surpriseCount}</span>
        </div>
      </div>

      {/* Main Kitchen Queue Component */}
      <KitchenQueue />
    </div>
  );
};
