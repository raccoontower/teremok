'use client';

import { useState, useEffect, useCallback } from 'react';
import { type QueryDocumentSnapshot } from 'firebase/firestore';
import { getServices, type ServiceFilters } from '@/lib/firebase/services';
import type { Service } from '@/types';

interface UseServicesReturn {
  services: Service[];
  loading: boolean;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  error: string | null;
}

const PAGE_SIZE = 20;

/**
 * Хук для получения списка услуг с пагинацией и фильтрами.
 */
export function useServices(filters: ServiceFilters = {}): UseServicesReturn {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot | null>(null);

  const filtersKey = JSON.stringify(filters);

  const fetchInitial = useCallback(async () => {
    setLoading(true);
    setError(null);
    setServices([]);
    setLastDoc(null);

    try {
      const result = await getServices(filters);
      setServices(result.services);
      setLastDoc(result.lastDoc);
      setHasMore(result.services.length === PAGE_SIZE);
    } catch (err) {
      setError('Не удалось загрузить услуги');
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
      const result = await getServices(filters, lastDoc);
      setServices((prev) => [...prev, ...result.services]);
      setLastDoc(result.lastDoc);
      setHasMore(result.services.length === PAGE_SIZE);
    } catch (err) {
      setError('Не удалось загрузить услуги');
      console.error(err);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasMore, loading, lastDoc]);

  return { services, loading, hasMore, loadMore, error };
}
