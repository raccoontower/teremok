'use client';

import { useState, useEffect } from 'react';
import { getCities } from '@/lib/firebase/firestore';
import type { City } from '@/types';

// Кэш в памяти
let citiesCache: City[] | null = null;

interface UseCitiesReturn {
  cities: City[];
  loading: boolean;
  error: string | null;
}

/**
 * Хук для получения списка городов.
 * Кэширует результат в памяти — повторные вызовы не делают запросы к Firestore.
 */
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

    const fetch = async () => {
      try {
        const data = await getCities();
        citiesCache = data;
        setCities(data);
      } catch (err) {
        setError('Не удалось загрузить города');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, []);

  return { cities, loading, error };
}
