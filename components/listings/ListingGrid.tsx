import { ListingCard } from '@/components/listings/ListingCard';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/listings/EmptyState';
import type { Listing } from '@/types';

interface ListingGridProps {
  listings: Listing[];
  loading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
}

export function ListingGrid({ listings, loading, hasMore, onLoadMore }: ListingGridProps) {
  if (!loading && listings.length === 0) {
    return <EmptyState />;
  }

  return (
    <div>
      {/* Сетка карточек */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {listings.map((listing) => (
          <ListingCard key={listing.id} listing={listing} />
        ))}

        {/* Skeleton карточки при подгрузке */}
        {loading &&
          Array.from({ length: 4 }).map((_, i) => (
            <div
              key={`skeleton-${i}`}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden"
            >
              <div className="aspect-[4/3] bg-gray-200 animate-pulse" />
              <div className="p-3 space-y-2">
                <div className="h-5 bg-gray-200 rounded animate-pulse w-1/2" />
                <div className="h-4 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
              </div>
            </div>
          ))}
      </div>

      {/* Кнопка "Загрузить ещё" */}
      {hasMore && !loading && (
        <div className="mt-8 flex justify-center">
          <Button
            variant="secondary"
            size="md"
            onClick={onLoadMore}
            className="min-w-[160px]"
          >
            Загрузить ещё
          </Button>
        </div>
      )}

      {/* Спиннер при дозагрузке */}
      {loading && listings.length > 0 && (
        <div className="mt-8 flex justify-center">
          <Spinner size="md" />
        </div>
      )}
    </div>
  );
}
