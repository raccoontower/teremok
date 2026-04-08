'use client';

import { useState, useMemo } from 'react';
import { Container } from '@/components/layout/Container';
import { ListingGrid } from '@/components/listings/ListingGrid';
import { ListingFilters } from '@/components/listings/ListingFilters';
import { useListings } from '@/hooks/useListings';
import { useFilters } from '@/hooks/useFilters';
import type { Listing } from '@/types';

/**
 * Клиентская часть страницы ленты объявлений.
 * Управляет фильтрами, сортировкой и пагинацией.
 */
export function ListingsClientPage() {
  const { cityId, categoryId, setCity, setCategory, reset } = useFilters();
  const [sort, setSort] = useState<string>('');

  const { listings, loading, hasMore, loadMore } = useListings({
    cityId: cityId || undefined,
    categoryId: categoryId || undefined,
  });

  const sortedListings = useMemo<Listing[]>(() => {
    const copy = [...listings];
    if (sort === 'oldest') {
      return copy.sort((a, b) => {
        const aTime = a.createdAt?.toMillis() ?? 0;
        const bTime = b.createdAt?.toMillis() ?? 0;
        return aTime - bTime;
      });
    }
    if (sort === 'price_asc') {
      return copy.sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
    }
    if (sort === 'price_desc') {
      return copy.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
    }
    // default: newest first (already ordered from Firestore)
    return copy.sort((a, b) => {
      const aTime = a.createdAt?.toMillis() ?? 0;
      const bTime = b.createdAt?.toMillis() ?? 0;
      return bTime - aTime;
    });
  }, [listings, sort]);

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
          sort={sort}
          onSortChange={setSort}
        />
      </div>

      {/* Сетка объявлений */}
      <ListingGrid
        listings={sortedListings}
        loading={loading}
        hasMore={hasMore}
        onLoadMore={loadMore}
      />
    </Container>
  );
}
