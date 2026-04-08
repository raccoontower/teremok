'use client';

import { useState, useEffect, useCallback } from 'react';
import { type QueryDocumentSnapshot } from 'firebase/firestore';
import { getHousingListings, type HousingFilters } from '@/lib/firebase/housing';
import type { Housing } from '@/types';

interface UseHousingListingsReturn {
  listings: Housing[];
  loading: boolean;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  error: string | null;
}

const PAGE_SIZE = 20;

/**
 * Хук для получения списка объявлений о жилье с пагинацией и фильтрами.
 */
export function useHousingListings(filters: HousingFilters = {}): UseHousingListingsReturn {
  const [listings, setListings] = useState<Housing[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot | null>(null);

  const filtersKey = JSON.stringify(filters);

  const fetchInitial = useCallback(async () => {
    setLoading(true);
    setError(null);
    setListings([]);
    setLastDoc(null);

    try {
      const result = await getHousingListings(filters);
      setListings(result.listings);
      setLastDoc(result.lastDoc);
      setHasMore(result.listings.length === PAGE_SIZE);
    } catch (err) {
      setError('Не удалось загрузить объявления о жилье');
      console.error(err);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtersKey]);

  useEffect(() => {
    fetchInitial();
  }, [fetchInitial]);

  const loadMore = useCallback(async () => {
    if (!hasMore || loading || !lastDoc) return;

    setLoading(true);
    try {
      const result = await getHousingListings(filters, lastDoc);
      setListings((prev) => [...prev, ...result.listings]);
      setLastDoc(result.lastDoc);
      setHasMore(result.listings.length === PAGE_SIZE);
    } catch (err) {
      setError('Не удалось загрузить объявления о жилье');
      console.error(err);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasMore, loading, lastDoc]);

  return { listings, loading, hasMore, loadMore, error };
}
