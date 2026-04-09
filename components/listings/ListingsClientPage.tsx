'use client';

import { useState, useMemo } from 'react';
import { Container } from '@/components/layout/Container';
import { ListingGrid } from '@/components/listings/ListingGrid';
import { ListingFilters } from '@/components/listings/ListingFilters';
import { Pagination } from '@/components/ui/Pagination';
import { useListings } from '@/hooks/useListings';
import { useFilters } from '@/hooks/useFilters';
import type { Listing } from '@/types';

const PAGE_SIZE = 20;

interface ListingsClientPageProps {
  initialListings?: Listing[];
}

export function ListingsClientPage({ initialListings }: ListingsClientPageProps) {
  const { cityId, categoryId, setCity, setCategory, reset } = useFilters();
  const [sort, setSort] = useState<string>('');
  const [page, setPage] = useState(1);

  const hasFilter = !!(cityId || categoryId);
  const { listings: fetched, loading } = useListings(
    hasFilter || !initialListings ? { cityId: cityId || undefined, categoryId: categoryId || undefined } : null
  );
  const listings = hasFilter || !initialListings ? fetched : initialListings;

  const toMs = (ts: unknown): number => {
    if (!ts) return 0;
    if (typeof ts === 'string') return new Date(ts).getTime();
    if (typeof ts === 'object' && ts !== null) {
      if ('toMillis' in ts && typeof (ts as { toMillis: () => number }).toMillis === 'function')
        return (ts as { toMillis: () => number }).toMillis();
      if ('seconds' in ts) return (ts as { seconds: number }).seconds * 1000;
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

  const totalPages = Math.max(1, Math.ceil(sortedListings.length / PAGE_SIZE));
  const paginated = sortedListings.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function handleFilterChange(fn: () => void) {
    fn();
    setPage(1); // сбрасываем страницу при смене фильтра
  }

  return (
    <Container className="py-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-gray-900">
          Объявления {sortedListings.length > 0 && (
            <span className="text-sm font-normal text-neutral-400 ml-1">
              ({sortedListings.length})
            </span>
          )}
        </h1>
      </div>

      <div className="mb-6">
        <ListingFilters
          cityId={cityId}
          categoryId={categoryId}
          onCityChange={(v) => handleFilterChange(() => setCity(v))}
          onCategoryChange={(v) => handleFilterChange(() => setCategory(v))}
          onReset={() => { reset(); setPage(1); }}
          sort={sort}
          onSortChange={(v) => { setSort(v); setPage(1); }}
        />
      </div>

      <ListingGrid
        listings={paginated}
        loading={loading}
        hasMore={false}
        onLoadMore={() => {}}
      />

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={(p) => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
      />
    </Container>
  );
}
