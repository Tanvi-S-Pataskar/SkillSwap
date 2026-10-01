import React from 'react';
import { ChevronDown } from 'lucide-react';

const Select = ({
  label,
  options = [],
  error,
  helperText,
  value,
  onChange,
  className = '',
  id,
  placeholder = 'Select an option',
  ...props
}) => {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={selectId} className="block text-xs font-medium text-slate-300 mb-1.5 uppercase tracking-wider">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={selectId}
          value={value}
          onChange={onChange}
          className={`w-full appearance-none rounded-xl bg-dark-950/80 border text-slate-100 text-sm px-4 py-2.5 pr-10 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500 cursor-pointer ${
            error ? 'border-rose-500/60' : 'border-white/[0.1] hover:border-white/[0.2]'
          } ${className}`}
          {...props}
        >
          {placeholder && (
            <option value="" disabled className="bg-dark-900 text-slate-500">
              {placeholder}
            </option>
          )}
          {options.map((opt) => {
            const optVal = typeof opt === 'object' ? opt.value : opt;
            const optLabel = typeof opt === 'object' ? opt.label : opt;
            return (
              <option key={optVal} value={optVal} className="bg-dark-900 text-slate-200">
                {optLabel}
              </option>
            );
          })}
        </select>
        <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
          <ChevronDown className="w-4 h-4" />
        </div>
      </div>
      {error ? (
        <p className="mt-1.5 text-xs text-rose-400 font-medium">{error}</p>
      ) : helperText ? (
        <p className="mt-1.5 text-xs text-slate-400">{helperText}</p>
      ) : null}
    </div>
  );
};

export default Select;
