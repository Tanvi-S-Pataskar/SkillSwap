import React from 'react';

const Card = ({
  children,
  variant = 'default',
  className = '',
  onClick,
  ...props
}) => {
  const baseStyles = 'rounded-2xl transition-all duration-300 relative overflow-hidden';

  const variants = {
    default:
      'bg-charcoal-card border border-white/[0.08] shadow-lg text-slate-100',
    glass:
      'glass-panel text-slate-100 shadow-glass',
    interactive:
      'bg-charcoal-card border border-white/[0.08] hover:border-violet-500/40 hover:bg-charcoal-hover hover:shadow-glow-sm cursor-pointer transition-all duration-300 text-slate-100 transform hover:-translate-y-1',
    elevated:
      'bg-dark-900 border border-violet-500/20 shadow-glow-sm text-slate-100',
    highlight:
      'bg-gradient-to-b from-violet-950/40 to-charcoal-card border border-violet-500/30 text-slate-100 shadow-glow-sm',
  };

  return (
    <div
      onClick={onClick}
      className={`${baseStyles} ${variants[variant] || variants.default} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = '' }) => (
  <div className={`p-6 pb-3 border-b border-white/[0.06] ${className}`}>{children}</div>
);

export const CardBody = ({ children, className = '' }) => (
  <div className={`p-6 ${className}`}>{children}</div>
);

export const CardFooter = ({ children, className = '' }) => (
  <div className={`p-6 pt-3 border-t border-white/[0.06] bg-black/10 flex items-center justify-between ${className}`}>
    {children}
  </div>
);

export default Card;
