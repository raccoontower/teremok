'use client';

/**
 * Скелетон загрузки — 3 карточки в ряд
 */
export function HomeSkeleton() {
  return (
    <div className="flex gap-4 overflow-x-auto pb-2 snap-x md:grid md:grid-cols-3 md:overflow-visible">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="min-w-[260px] md:min-w-0 snap-start bg-white rounded-[16px] shadow-card overflow-hidden animate-pulse"
        >
          <div className="h-36 bg-neutral-200" />
          <div className="p-3.5 space-y-2">
            <div className="h-4 bg-neutral-200 rounded w-2/3" />
            <div className="h-3 bg-neutral-100 rounded w-full" />
            <div className="h-3 bg-neutral-100 rounded w-5/6" />
            <div className="flex justify-between mt-2">
              <div className="h-3 bg-neutral-100 rounded w-1/3" />
              <div className="h-3 bg-neutral-100 rounded w-1/4" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
