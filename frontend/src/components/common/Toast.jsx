import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { useHotel } from '../../context/HotelContext';

export function Toast() {
  const { toast } = useHotel();
  if (!toast) return null;

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
    error: <AlertCircle className="w-5 h-5 text-rose-500" />,
    info: <Info className="w-5 h-5 text-sky-500" />
  };

  const bgColors = {
    success: 'border-emerald-500/30 bg-emerald-950/90 text-emerald-100',
    error: 'border-rose-500/30 bg-rose-950/90 text-rose-100',
    info: 'border-sky-500/30 bg-sky-950/90 text-sky-100'
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 animate-in slide-in-from-bottom-5 duration-300">
      <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-xl backdrop-blur-md max-w-md ${bgColors[toast.type] || bgColors.success}`}>
        {icons[toast.type] || icons.success}
        <p className="text-sm font-medium">{toast.message}</p>
      </div>
    </div>
  );
}
