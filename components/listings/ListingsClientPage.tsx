'use client';

import { Container } from '@/components/layout/Container';
import { ListingGrid } from '@/components/listings/ListingGrid';
import { ListingFilters } from '@/components/listings/ListingFilters';
import { useListings } from '@/hooks/useListings';
import { useFilters } from '@/hooks/useFilters';

/**
 * Клиентская часть страницы ленты объявлений.
 * Управляет фильтрами и пагинацией.
 */
export function ListingsClientPage() {
  const { cityId, categoryId, setCity, setCategory, reset } = useFilters();

  const { listings, loading, hasMore, loadMore } = useListings({
    cityId: cityId || undefined,
    categoryId: categoryId || undefined,
  });

  return (
    <Container className="py-6">
      {/* Заголовок */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-gray-900">Объявления</h1>
      </div>

      {/* Фильтры */}
      <div className="mb-6">
        <ListingFilters
          cityId={cityId}
          categoryId={categoryId}
          onCityChange={setCity}
          onCategoryChange={setCategory}
          onReset={reset}
        />
      </div>

      {/* Сетка объявлений */}
      <ListingGrid
        listings={listings}
        loading={loading}
        hasMore={hasMore}
        onLoadMore={loadMore}
      />
    </Container>
  );
}
