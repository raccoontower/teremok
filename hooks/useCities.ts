'use client';

import { useState, useEffect } from 'react';
import type { City } from '@/types';

let citiesCache: City[] | null = null;

interface UseCitiesReturn {
  cities: City[];
  loading: boolean;
  error: string | null;
}

export function useCities(): UseCitiesReturn {
  const [cities, setCities] = useState<City[]>(citiesCache ?? []);
  const [loading, setLoading] = useState(!citiesCache);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (citiesCache) {
      setCities(citiesCache);
      setLoading(false);
      return;
    }
    fetch('/api/cities')
      .then((r) => r.json())
      .then((d: { cities?: City[] }) => {
        citiesCache = d.cities ?? [];
        setCities(citiesCache);
      })
      .catch(() => setError('Не удалось загрузить города'))
      .finally(() => setLoading(false));
  }, []);

  return { cities, loading, error };
}
