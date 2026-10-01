import React from 'react';

const Input = ({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  className = '',
  id,
  type = 'text',
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-medium text-slate-300 mb-1.5 uppercase tracking-wider">
          {label}
        </label>
      )}
      <div className="relative rounded-xl">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            {leftIcon}
          </div>
        )}
        <input
          id={inputId}
          type={type}
          className={`w-full rounded-xl bg-dark-950/80 border text-slate-100 placeholder-slate-500 text-sm px-4 py-2.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500 ${
            leftIcon ? 'pl-10' : ''
          } ${rightIcon ? 'pr-10' : ''} ${
            error ? 'border-rose-500/60 focus:ring-rose-500/30' : 'border-white/[0.1] hover:border-white/[0.2]'
          } ${className}`}
          {...props}
        />
        {rightIcon && (
          <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
            {rightIcon}
          </div>
        )}
      </div>
      {error ? (
        <p className="mt-1.5 text-xs text-rose-400 font-medium">{error}</p>
      ) : helperText ? (
        <p className="mt-1.5 text-xs text-slate-400">{helperText}</p>
      ) : null}
    </div>
  );
};

export default Input;
