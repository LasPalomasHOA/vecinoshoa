import React from 'react';
import type { ActiveTab } from '../../context/AppContext';

interface ModuleSkeletonProps {
  tab?: ActiveTab;
}

const ShimmerBlock: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse rounded-lg bg-slate-200/80 ${className}`} />
);

export const ModuleSkeleton: React.FC<ModuleSkeletonProps> = ({ tab }) => {
  const isCalendar = tab === 'calendar';

  return (
    <div className="space-y-5" aria-busy="true" aria-label="Cargando contenido">
      {/* KPI Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="p-4 rounded-xl bg-white/90 border border-slate-200/80 shadow-xs flex items-center justify-between"
          >
            <div className="space-y-2.5 flex-1">
              <ShimmerBlock className="h-3 w-24" />
              <div className="flex items-baseline gap-2">
                <ShimmerBlock className="h-7 w-12" />
                <ShimmerBlock className="h-3 w-20" />
              </div>
            </div>
            <ShimmerBlock className="w-10 h-10 rounded-lg shrink-0" />
          </div>
        ))}
      </div>

      {/* Filter Toolbar Skeleton */}
      <div className="p-3 rounded-xl bg-white border border-slate-200/90 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <ShimmerBlock className="h-9 w-56 rounded-lg" />
          <ShimmerBlock className="h-9 w-36 rounded-lg" />
          <ShimmerBlock className="h-9 w-36 rounded-lg" />
        </div>
        <ShimmerBlock className="h-9 w-32 rounded-lg" />
      </div>

      {/* Main Content Skeleton: Calendar Grid vs Table */}
      {isCalendar ? (
        <div className="rounded-xl bg-white border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="p-3 border-b border-slate-200 bg-slate-50/70 flex items-center gap-3">
            <ShimmerBlock className="h-6 w-36" />
            <div className="flex-1 grid grid-cols-10 gap-2">
              {Array.from({ length: 10 }).map((_, idx) => (
                <ShimmerBlock key={idx} className="h-6 w-full" />
              ))}
            </div>
          </div>
          <div className="divide-y divide-slate-100">
            {Array.from({ length: 8 }).map((_, rowIdx) => (
              <div key={rowIdx} className="p-3 flex items-center gap-3">
                <div className="w-36 shrink-0 space-y-1.5">
                  <ShimmerBlock className="h-3.5 w-20" />
                  <ShimmerBlock className="h-2.5 w-24" />
                </div>
                <div className="flex-1 flex items-center gap-4">
                  <ShimmerBlock
                    className={`h-7 rounded-md ${
                      rowIdx % 3 === 0 ? 'w-1/3 ml-8' : rowIdx % 3 === 1 ? 'w-1/4 ml-28' : 'w-2/5 ml-16'
                    }`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-xl bg-white border border-slate-200/90 shadow-xs overflow-hidden">
          {/* Table Header */}
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 grid grid-cols-6 gap-4">
            {[0, 1, 2, 3, 4, 5].map((col) => (
              <ShimmerBlock key={col} className="h-3 w-20" />
            ))}
          </div>
          {/* Table Rows */}
          <div className="divide-y divide-slate-100">
            {Array.from({ length: 7 }).map((_, rowIdx) => (
              <div key={rowIdx} className="px-4 py-3.5 grid grid-cols-6 gap-4 items-center">
                <ShimmerBlock className="h-4 w-24" />
                <div className="space-y-1.5">
                  <ShimmerBlock className="h-3.5 w-28" />
                  <ShimmerBlock className="h-2.5 w-16" />
                </div>
                <ShimmerBlock className="h-4 w-20" />
                <ShimmerBlock className="h-4 w-20" />
                <ShimmerBlock className="h-6 w-24 rounded-full" />
                <div className="flex justify-end gap-2">
                  <ShimmerBlock className="h-7 w-7 rounded-lg" />
                  <ShimmerBlock className="h-7 w-7 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
