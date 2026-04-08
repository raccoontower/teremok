'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Listing, ListingFilters } from '@/types';

interface UseListingsReturn {
  listings: Listing[];
  loading: boolean;
  hasMore: boolean;
  loadMore: () => void;
  error: string | null;
}

export function useListings(filters: ListingFilters = {}): UseListingsReturn {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const filtersKey = JSON.stringify(filters);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filters.cityId) params.set('cityId', filters.cityId);
      if (filters.categoryId) params.set('categoryId', filters.categoryId);
      params.set('limit', '40');

      const res = await fetch(`/api/listings?${params}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json() as { listings: Listing[] };
      setListings(data.listings ?? []);
    } catch (err) {
      console.error('[useListings]', err);
      setError('Не удалось загрузить объявления. Попробуйте обновить страницу.');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtersKey]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { listings, loading, hasMore: false, loadMore: () => {}, error };
}
