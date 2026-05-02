'use client';

import React from 'react';

interface StarRatingProps {
  rating: number;
  count?: number;
  size?: number;
  showCount?: boolean;
}

export default function StarRating({ rating, count, size = 14, showCount = true }: StarRatingProps) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex">
        {Array.from({ length: 5 }).map((_, i) => {
          const filled = i < Math.floor(rating);
          const half = !filled && i < rating;
          return (
            <svg key={i} width={size} height={size} viewBox="0 0 24 24" style={{ color: 'var(--gold)' }}>
              {half ? (
                <>
                  <defs>
                    <linearGradient id={`half-${i}`} x1="0" x2="1" y1="0" y2="0">
                      <stop offset="50%" stopColor="currentColor"/>
                      <stop offset="50%" stopColor="transparent"/>
                    </linearGradient>
                  </defs>
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
                    fill={`url(#half-${i})`} stroke="currentColor" strokeWidth="1.2"/>
                </>
              ) : (
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
                  fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.2"/>
              )}
            </svg>
          );
        })}
      </div>
      {showCount && count !== undefined && (
        <span className="text-xs" style={{ color: 'var(--grey-500)' }}>({count} avis)</span>
      )}
    </div>
  );
}
