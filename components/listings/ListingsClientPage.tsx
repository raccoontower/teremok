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

  // Конвертируем createdAt в миллисекунды — поддерживаем ISO строку и Firestore Timestamp
  const toMs = (ts: unknown): number => {
    if (!ts) return 0;
    if (typeof ts === 'string') return new Date(ts).getTime();
    if (typeof ts === 'object' && ts !== null) {
      if ('toMillis' in ts && typeof (ts as {toMillis: () => number}).toMillis === 'function') return (ts as {toMillis: () => number}).toMillis();
      if ('seconds' in ts) return (ts as {seconds: number}).seconds * 1000;
    }
    return 0;
  };

  const sortedListings = useMemo<Listing[]>(() => {
    const copy = [...listings];
    if (sort === 'oldest') return copy.sort((a, b) => toMs(a.createdAt) - toMs(b.createdAt));
    if (sort === 'price_asc') return copy.sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
    if (sort === 'price_desc') return copy.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
    return copy.sort((a, b) => toMs(b.createdAt) - toMs(a.createdAt));
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
