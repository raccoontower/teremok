'use client';

import { useState, useEffect } from 'react';
import { getListing } from '@/lib/firebase/firestore';
import type { Listing } from '@/types';

interface UseListingReturn {
  listing: Listing | null;
  loading: boolean;
  error: string | null;
}

/**
 * Хук для получения одного объявления по ID
 */
export function useListing(id: string): UseListingReturn {
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    let cancelled = false;

    const fetch = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await getListing(id);
        if (!cancelled) {
          setListing(data);
          if (!data) setError('Объявление не найдено');
        }
      } catch (err) {
        if (!cancelled) {
          setError('Не удалось загрузить объявление');
          console.error(err);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetch();

    return () => {
      cancelled = true;
    };
  }, [id]);

  return { listing, loading, error };
}
