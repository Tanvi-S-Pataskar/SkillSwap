import React from 'react';
import { CheckCircle2 } from 'lucide-react';

const Badge = ({
  children,
  variant = 'purple',
  size = 'md',
  isVerified = false,
  className = '',
  icon = null,
}) => {
  const baseStyles = 'inline-flex items-center font-medium rounded-full transition-colors select-none';

  const variants = {
    purple:
      'bg-violet-500/15 text-violet-300 border border-violet-500/30',
    violetGlow:
      'bg-violet-600 text-white shadow-glow-sm border border-violet-400/40',
    emerald:
      'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30',
    verified:
      'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-medium',
    amber:
      'bg-amber-500/15 text-amber-300 border border-amber-500/30',
    rose:
      'bg-rose-500/15 text-rose-300 border border-rose-500/30',
    neutral:
      'bg-slate-800 text-slate-300 border border-slate-700/60',
    outline:
      'bg-transparent text-slate-300 border border-white/20',
  };

  const sizes = {
    sm: 'text-[11px] px-2.5 py-0.5 gap-1',
    md: 'text-xs px-3 py-1 gap-1.5',
    lg: 'text-sm px-3.5 py-1.5 gap-2',
  };

  return (
    <span className={`${baseStyles} ${variants[variant] || variants.purple} ${sizes[size] || sizes.md} ${className}`}>
      {isVerified && <CheckCircle2 className="w-3 h-3 text-emerald-400 flex-shrink-0" />}
      {!isVerified && icon && <span className="flex-shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};

export default Badge;
