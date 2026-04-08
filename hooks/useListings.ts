'use client';

import { useState, useEffect, useCallback } from 'react';
import { type QueryDocumentSnapshot } from 'firebase/firestore';
import { getListings } from '@/lib/firebase/firestore';
import type { Listing, ListingFilters } from '@/types';
import { LISTINGS_PER_PAGE } from '@/lib/constants/limits';

interface UseListingsReturn {
  listings: Listing[];
  loading: boolean;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  error: string | null;
}

/**
 * Хук для получения списка объявлений с пагинацией через cursor (startAfter).
 * При изменении фильтров сбрасывает состояние и загружает заново.
 */
export function useListings(filters: ListingFilters = {}): UseListingsReturn {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot | null>(null);

  // Сериализуем фильтры для корректного сравнения в useEffect
  const filtersKey = JSON.stringify(filters);

  const fetchInitial = useCallback(async () => {
    setLoading(true);
    setError(null);
    setListings([]);
    setLastDoc(null);

    try {
      const result = await getListings(filters);
      setListings(result.listings);
      setLastDoc(result.lastDoc);
      setHasMore(result.listings.length === LISTINGS_PER_PAGE);
    } catch (err) {
      setError('Не удалось загрузить объявления');
      console.error(err);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtersKey]);

  useEffect(() => {
    fetchInitial();
  }, [fetchInitial]);

  /**
   * Загружает следующую страницу объявлений
   */
  const loadMore = useCallback(async () => {
    if (!hasMore || loading || !lastDoc) return;

    setLoading(true);
    try {
      const result = await getListings(filters, lastDoc);
      setListings((prev) => [...prev, ...result.listings]);
      setLastDoc(result.lastDoc);
      setHasMore(result.listings.length === LISTINGS_PER_PAGE);
    } catch (err) {
      setError('Не удалось загрузить объявления');
      console.error(err);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasMore, loading, lastDoc]);

  return { listings, loading, hasMore, loadMore, error };
}
