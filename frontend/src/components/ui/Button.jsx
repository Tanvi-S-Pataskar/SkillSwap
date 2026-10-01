import React from 'react';
import { Loader2 } from 'lucide-react';

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  leftIcon = null,
  rightIcon = null,
  className = '',
  onClick,
  type = 'button',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-violet-500/50 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] select-none';

  const variants = {
    primary:
      'bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 hover:from-violet-500 hover:via-indigo-500 hover:to-purple-500 text-white shadow-glow-sm hover:shadow-glow-md border border-violet-400/30',
    secondary:
      'bg-charcoal-card hover:bg-charcoal-hover text-slate-100 border border-slate-700/60 hover:border-violet-500/40 shadow-sm',
    outline:
      'bg-transparent border border-violet-500/50 hover:bg-violet-500/10 text-violet-300 hover:text-white',
    ghost:
      'bg-transparent hover:bg-white/5 text-slate-300 hover:text-white border border-transparent',
    danger:
      'bg-rose-600/90 hover:bg-rose-500 text-white border border-rose-500/40 shadow-sm hover:shadow-rose-500/20',
    success:
      'bg-emerald-600/90 hover:bg-emerald-500 text-white border border-emerald-500/40 shadow-sm',
  };

  const sizes = {
    sm: 'text-xs px-3 py-1.5 gap-1.5 font-medium',
    md: 'text-sm px-4 py-2.5 gap-2 font-medium',
    lg: 'text-base px-6 py-3.5 gap-2.5 font-semibold',
  };

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current" />
      ) : (
        leftIcon && <span className="flex-shrink-0">{leftIcon}</span>
      )}
      <span>{children}</span>
      {!isLoading && rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
    </button>
  );
};

export default Button;
