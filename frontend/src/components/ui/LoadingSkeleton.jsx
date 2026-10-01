import React from 'react';

export const Skeleton = ({ className = '', rounded = 'rounded-xl' }) => (
  <div
    className={`bg-slate-800/60 animate-pulse ${rounded} ${className}`}
  />
);

export const StudentCardSkeleton = () => (
  <div className="bg-charcoal-card border border-white/[0.06] rounded-2xl p-6 shadow-md">
    <div className="flex items-center gap-4 mb-4">
      <Skeleton className="w-12 h-12 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
    <div className="space-y-2 mb-4">
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-5/6" />
    </div>
    <div className="flex gap-2 pt-3 border-t border-white/[0.06]">
      <Skeleton className="h-6 w-20 rounded-full" />
      <Skeleton className="h-6 w-24 rounded-full" />
    </div>
  </div>
);

export const SkillCardSkeleton = () => (
  <div className="bg-charcoal-card border border-white/[0.06] rounded-2xl p-5 shadow-md flex items-center justify-between">
    <div className="flex items-center gap-3">
      <Skeleton className="w-10 h-10 rounded-xl" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
    <Skeleton className="h-8 w-20 rounded-xl" />
  </div>
);

export default Skeleton;
