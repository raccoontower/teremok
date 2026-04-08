'use client';

import { useState, useEffect } from 'react';
import { getService } from '@/lib/firebase/services';
import type { Service } from '@/types';

interface UseServiceReturn {
  service: Service | null;
  loading: boolean;
  error: string | null;
}

/**
 * Хук для получения одной услуги по ID.
 */
export function useService(id: string): UseServiceReturn {
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    setLoading(true);
    setError(null);

    getService(id)
      .then((data) => {
        if (!data) {
          setError('Услуга не найдена');
        } else {
          setService(data);
        }
      })
      .catch(() => {
        setError('Не удалось загрузить услугу');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  return { service, loading, error };
}
