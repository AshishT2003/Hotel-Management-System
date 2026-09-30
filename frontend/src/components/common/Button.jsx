import React from 'react';

const VARIANTS = {
  primary: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm focus:ring-emerald-500',
  secondary: 'bg-hotel-700 hover:bg-hotel-600 text-white shadow-sm focus:ring-hotel-400',
  outline: 'border border-hotel-300 dark:border-hotel-600 hover:bg-hotel-100 dark:hover:bg-hotel-800 text-hotel-700 dark:text-hotel-200 focus:ring-hotel-400',
  danger: 'bg-rose-600 hover:bg-rose-700 text-white shadow-sm focus:ring-rose-500',
  gold: 'bg-amber-500 hover:bg-amber-600 text-hotel-950 font-semibold shadow-sm focus:ring-amber-400',
  ghost: 'text-hotel-600 dark:text-hotel-400 hover:bg-hotel-100 dark:hover:bg-hotel-800 focus:ring-hotel-400'
};

const SIZES = {
  sm: 'px-2.5 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-5 py-2.5 text-base font-medium'
};

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  icon: Icon,
  ...props
}) {
  return (
    <button
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed ${VARIANTS[variant] || VARIANTS.primary} ${SIZES[size] || SIZES.md} ${className}`}
      {...props}
    >
      {Icon && <Icon className="w-4 h-4 shrink-0" />}
      {children}
    </button>
  );
}
