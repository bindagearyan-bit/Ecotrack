import React from 'react';

export const UserSkeleton = () => (
  <div className="flex flex-row gap-2 p-4 bg-white dark:bg-brand-darkCard rounded-2xl border dark:border-brand-darkBorder">
    <div className="animate-pulse bg-gray-300 dark:bg-zinc-700 w-12 h-12 rounded-full flex-shrink-0">
    </div>
    <div className="flex flex-col gap-2 flex-1">
      <div className="animate-pulse bg-gray-300 dark:bg-zinc-700 w-28 h-5 rounded-full">
      </div>
      <div className="animate-pulse bg-gray-300 dark:bg-zinc-700 w-36 h-5 rounded-full">
      </div>
    </div>
  </div>
);

export const StatCardSkeleton = () => (
  <div className="p-6 bg-white dark:bg-brand-darkCard rounded-2xl shadow-sm space-y-4 border dark:border-brand-darkBorder">
    <div className="flex flex-row gap-2">
      <div className="animate-pulse bg-gray-300 dark:bg-zinc-700 w-12 h-12 rounded-full">
      </div>
      <div className="flex flex-col gap-2">
        <div className="animate-pulse bg-gray-300 dark:bg-zinc-700 w-28 h-5 rounded-full">
        </div>
        <div className="animate-pulse bg-gray-300 dark:bg-zinc-700 w-36 h-5 rounded-full">
        </div>
      </div>
    </div>
    <div className="animate-pulse bg-gray-200 dark:bg-zinc-800 h-8 w-24 rounded-lg">
    </div>
    <div className="animate-pulse bg-gray-200 dark:bg-zinc-800 h-3 w-full rounded-full">
    </div>
  </div>
);

export const ChartSkeleton = () => (
  <div className="p-6 bg-white dark:bg-brand-darkCard rounded-2xl shadow-sm space-y-4 border dark:border-brand-darkBorder">
    <div className="flex flex-row gap-2">
      <div className="animate-pulse bg-gray-300 dark:bg-zinc-700 w-12 h-12 rounded-full">
      </div>
      <div className="flex flex-col gap-2">
        <div className="animate-pulse bg-gray-300 dark:bg-zinc-700 w-28 h-5 rounded-full">
        </div>
        <div className="animate-pulse bg-gray-300 dark:bg-zinc-700 w-36 h-5 rounded-full">
        </div>
      </div>
    </div>
    <div className="animate-pulse bg-gray-200 dark:bg-zinc-800 h-48 w-full rounded-xl">
    </div>
  </div>
);

export const ListSkeleton = () => (
  <div className="space-y-3">
    {[1, 2, 3, 4].map(i => (
      <div key={i} className="flex flex-row gap-2 p-4 bg-white dark:bg-brand-darkCard rounded-xl border dark:border-brand-darkBorder">
        <div className="animate-pulse bg-gray-300 dark:bg-zinc-700 w-12 h-12 rounded-full flex-shrink-0">
        </div>
        <div className="flex flex-col gap-2 flex-1">
          <div className="animate-pulse bg-gray-300 dark:bg-zinc-700 w-28 h-5 rounded-full">
          </div>
          <div className="animate-pulse bg-gray-300 dark:bg-zinc-700 w-36 h-5 rounded-full">
          </div>
        </div>
      </div>
    ))}
  </div>
);
