import React from 'react';
import { Star } from 'lucide-react';

const Rating = ({
  value = 5.0,
  max = 5,
  reviewCount = null,
  showScore = true,
  size = 'sm',
  interactive = false,
  onChange = null,
  className = '',
}) => {
  const stars = Array.from({ length: max }, (_, index) => index + 1);

  const starSizes = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      <div className="flex items-center gap-0.5">
        {stars.map((star) => {
          const isFilled = star <= Math.round(value);
          return (
            <button
              type="button"
              key={star}
              disabled={!interactive}
              onClick={() => interactive && onChange && onChange(star)}
              className={`${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'}`}
            >
              <Star
                className={`${starSizes[size] || starSizes.sm} ${
                  isFilled
                    ? 'text-amber-400 fill-amber-400'
                    : 'text-slate-600 fill-slate-800'
                }`}
              />
            </button>
          );
        })}
      </div>

      {showScore && (
        <span className="text-xs font-semibold text-amber-300">
          {Number(value).toFixed(1)}
        </span>
      )}

      {reviewCount !== null && (
        <span className="text-xs text-slate-400 font-normal">
          ({reviewCount})
        </span>
      )}
    </div>
  );
};

export default Rating;
