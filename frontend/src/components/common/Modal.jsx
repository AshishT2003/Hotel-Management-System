import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export function Modal({ isOpen, onClose, title, children, maxWidth = 'max-w-3xl' }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-hotel-950/70 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      {/* Modal Dialog */}
      <div className="flex min-h-full items-center justify-center p-4 text-center">
        <div 
          className={`w-full ${maxWidth} transform overflow-hidden rounded-2xl bg-white dark:bg-hotel-900 border border-hotel-200 dark:border-hotel-800 p-6 text-left align-middle shadow-2xl transition-all relative z-10 animate-in fade-in zoom-in-95 duration-200`}
          onClick={(e) => e.stopPropagation()}
        >
          {title && (
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-hotel-100 dark:border-hotel-800">
              <h3 className="text-lg font-bold text-hotel-900 dark:text-hotel-100 tracking-tight">
                {title}
              </h3>
              <button
                type="button"
                onClick={onClose}
                className="text-hotel-400 hover:text-hotel-600 dark:hover:text-hotel-200 p-1 rounded-lg hover:bg-hotel-100 dark:hover:bg-hotel-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}
          {children}
        </div>
      </div>
    </div>
  );
}
