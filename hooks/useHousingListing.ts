'use client';

import { useState, useEffect } from 'react';
import { getHousingListing } from '@/lib/firebase/housing';
import type { Housing } from '@/types';

interface UseHousingListingReturn {
  listing: Housing | null;
  loading: boolean;
  error: string | null;
}

/**
 * Хук для получения одного объявления о жилье по ID.
 */
export function useHousingListing(id: string): UseHousingListingReturn {
  const [listing, setListing] = useState<Housing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    setLoading(true);
    setError(null);

    getHousingListing(id)
      .then((data) => {
        if (!data) {
          setError('Объявление не найдено');
        } else {
          setListing(data);
        }
      })
      .catch(() => {
        setError('Не удалось загрузить объявление');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  return { listing, loading, error };
}
