import React, { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';

const Avatar = ({
  src,
  alt = 'Student',
  name = '',
  size = 'md',
  isOnline = false,
  isVerified = false,
  className = '',
}) => {
  const [hasError, setHasError] = useState(false);

  const sizes = {
    xs: 'w-7 h-7 text-[10px]',
    sm: 'w-9 h-9 text-xs',
    md: 'w-11 h-11 text-sm',
    lg: 'w-14 h-14 text-base',
    xl: 'w-20 h-20 text-xl font-bold',
    '2xl': 'w-28 h-28 text-2xl font-bold',
  };

  const getInitials = (str) => {
    if (!str) return 'S';
    const parts = str.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return str.slice(0, 2).toUpperCase();
  };

  return (
    <div className={`relative inline-block flex-shrink-0 ${className}`}>
      <div
        className={`${sizes[size] || sizes.md} rounded-full overflow-hidden bg-gradient-to-tr from-violet-700 to-indigo-900 border-2 border-violet-500/30 flex items-center justify-center text-white font-medium shadow-md`}
      >
        {src && !hasError ? (
          <img
            src={src}
            alt={alt || name}
            onError={() => setHasError(true)}
            className="w-full h-full object-cover"
          />
        ) : (
          <span>{getInitials(name || alt)}</span>
        )}
      </div>

      {/* Online Status Dot */}
      {isOnline && (
        <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-dark-900 rounded-full" />
      )}

      {/* Verified Badge Checkmark */}
      {isVerified && (
        <span className="absolute -top-1 -right-1 bg-dark-900 rounded-full text-emerald-400 p-0.5 shadow-sm">
          <CheckCircle2 className="w-3.5 h-3.5 fill-emerald-500/20" />
        </span>
      )}
    </div>
  );
};

export default Avatar;
