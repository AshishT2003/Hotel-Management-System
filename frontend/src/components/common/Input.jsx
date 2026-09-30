import React from 'react';

export function Input({
  label,
  error,
  icon: Icon,
  className = '',
  required = false,
  id,
  ...props
}) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-semibold text-hotel-700 dark:text-hotel-300 uppercase tracking-wider mb-1.5">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-hotel-400">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <input
          id={inputId}
          className={`w-full rounded-lg border bg-white dark:bg-hotel-900 text-hotel-900 dark:text-hotel-100 text-sm transition-colors py-2 px-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 border-hotel-300 dark:border-hotel-700 disabled:bg-hotel-50 disabled:text-hotel-400 ${
            Icon ? 'pl-9' : ''
          } ${error ? 'border-rose-500 focus:ring-rose-500' : ''} ${className}`}
          {...props}
        />
      </div>
      {error && <p className="mt-1 text-xs text-rose-500">{error}</p>}
    </div>
  );
}

export function Select({
  label,
  error,
  options = [],
  className = '',
  required = false,
  id,
  children,
  ...props
}) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-semibold text-hotel-700 dark:text-hotel-300 uppercase tracking-wider mb-1.5">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}
      <select
        id={inputId}
        className={`w-full rounded-lg border bg-white dark:bg-hotel-900 text-hotel-900 dark:text-hotel-100 text-sm transition-colors py-2 px-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 border-hotel-300 dark:border-hotel-700 disabled:bg-hotel-50 disabled:text-hotel-400 ${
          error ? 'border-rose-500 focus:ring-rose-500' : ''
        } ${className}`}
        {...props}
      >
        {children ? children : options.map((opt) => (
          <option key={opt.value ?? opt} value={opt.value ?? opt}>
            {opt.label ?? opt}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-rose-500">{error}</p>}
    </div>
  );
}
