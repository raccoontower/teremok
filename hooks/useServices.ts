'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Service } from '@/types';

interface ServiceFilters {
  cityId?: string;
  category?: string;
  serviceArea?: string;
  limit?: number;
}

interface UseServicesReturn {
  services: Service[];
  loading: boolean;
  hasMore: boolean;
  loadMore: () => void;
  error: string | null;
}

export function useServices(filters: ServiceFilters = {}): UseServicesReturn {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const filtersKey = JSON.stringify(filters);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filters.cityId) params.set('cityId', filters.cityId);
      if (filters.category) params.set('category', filters.category);
      params.set('limit', String(filters.limit ?? 40));

      const res = await fetch(`/api/services?${params}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json() as { services: Service[] };
      setServices(data.services ?? []);
    } catch (err) {
      console.error('[useServices]', err);
      setError('Не удалось загрузить услуги. Попробуйте обновить страницу.');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtersKey]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { services, loading, hasMore: false, loadMore: () => {}, error };
}
