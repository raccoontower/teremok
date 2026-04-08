'use client';

import { useState, useEffect } from 'react';
import type { Housing } from '@/types';

interface UseHousingReturn {
  listing: Housing | null;
  loading: boolean;
  error: string | null;
}

export function useHousingListing(id: string): UseHousingReturn {
  const [listing, setHousing] = useState<Housing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetch(`/api/housing/${id}`)
      .then((r) => {
        if (r.status === 404) throw new Error('not_found');
        if (!r.ok) throw new Error('fetch_error');
        return r.json() as Promise<{ listing: Housing }>;
      })
      .then((d) => {
        if (!cancelled) setHousing(d.listing ?? null);
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message === 'not_found' ? 'Объявление не найдено' : 'Не удалось загрузить объявление');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [id]);

  return { listing, loading, error };
}
