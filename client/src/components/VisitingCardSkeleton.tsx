import React from 'react';

export const VisitingCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-card overflow-hidden flex flex-col justify-between animate-pulse">
      {/* Top Banner Skeleton */}
      <div className="h-24 bg-slate-200 p-3 flex items-start justify-between">
        <div className="h-5 w-24 bg-slate-300 rounded-full" />
        <div className="h-7 w-7 bg-slate-300 rounded-full" />
      </div>

      {/* Avatar overlap Skeleton */}
      <div className="px-5 -mt-10 relative z-10 flex items-end justify-between">
        <div className="w-16 h-16 rounded-2xl border-4 border-white bg-slate-300 shadow-md" />
        <div className="h-6 w-20 bg-slate-200 rounded-lg" />
      </div>

      {/* Body Skeleton */}
      <div className="p-5 pt-3 space-y-4 flex-1">
        <div className="space-y-2">
          <div className="h-5 w-3/4 bg-slate-200 rounded-md" />
          <div className="h-3 w-1/2 bg-slate-200 rounded-md" />
        </div>

        {/* Rating & Distance */}
        <div className="flex items-center gap-4">
          <div className="h-4 w-20 bg-slate-200 rounded-md" />
          <div className="h-4 w-24 bg-slate-200 rounded-md" />
        </div>

        {/* Badges / services */}
        <div className="flex gap-2 pt-1">
          <div className="h-5 w-16 bg-slate-100 rounded-md" />
          <div className="h-5 w-20 bg-slate-100 rounded-md" />
          <div className="h-5 w-14 bg-slate-100 rounded-md" />
        </div>
      </div>

      {/* Footer CTA Skeleton */}
      <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="h-2.5 w-14 bg-slate-200 rounded" />
          <div className="h-5 w-16 bg-slate-200 rounded" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-9 w-20 bg-slate-200 rounded-xl" />
          <div className="h-9 w-24 bg-slate-200 rounded-xl" />
        </div>
      </div>
    </div>
  );
};
