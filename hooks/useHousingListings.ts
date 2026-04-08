'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Housing } from '@/types';

interface HousingFilters {
  cityId?: string;
  listingType?: string;
  propertyType?: string;
  bedrooms?: number;
  petFriendly?: boolean;
  limit?: number;
}

interface UseHousingListingsReturn {
  listings: Housing[];
  loading: boolean;
  hasMore: boolean;
  loadMore: () => void;
  error: string | null;
}

export function useHousingListings(filters: HousingFilters = {}): UseHousingListingsReturn {
  const [listings, setListings] = useState<Housing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const filtersKey = JSON.stringify(filters);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filters.cityId) params.set('cityId', filters.cityId);
      if (filters.listingType) params.set('listingType', filters.listingType);
      if (filters.propertyType) params.set('propertyType', filters.propertyType);
      params.set('limit', String(filters.limit ?? 40));

      const res = await fetch(`/api/housing?${params}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json() as { listings: Housing[] };
      setListings(data.listings ?? []);
    } catch (err) {
      console.error('[useHousingListings]', err);
      setError('Не удалось загрузить объявления о жилье. Попробуйте обновить страницу.');
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
