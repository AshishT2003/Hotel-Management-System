import React from 'react';
import { useHotel } from '../../context/HotelContext';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useHotel();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none p-4">
      {toasts.map(toast => {
        let icon = <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />;
        let border = 'border-emerald-200 bg-white';
        let ring = 'ring-emerald-500/10';

        if (toast.type === 'error') {
          icon = <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />;
          border = 'border-rose-200 bg-white';
          ring = 'ring-rose-500/10';
        } else if (toast.type === 'warning') {
          icon = <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />;
          border = 'border-amber-200 bg-white';
          ring = 'ring-amber-500/10';
        } else if (toast.type === 'info') {
          icon = <Info className="w-5 h-5 text-sky-600 shrink-0" />;
          border = 'border-sky-200 bg-white';
          ring = 'ring-sky-500/10';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-lg border ring-1 ${border} ${ring} transition-all duration-200 animate-in slide-in-from-bottom-3`}
          >
            {icon}
            <div className="flex-1 text-sm">
              {toast.title && <h4 className="font-semibold text-slate-900">{toast.title}</h4>}
              <p className="text-slate-600">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-600 p-0.5 rounded-lg transition-colors"
              aria-label="Dismiss toast"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
