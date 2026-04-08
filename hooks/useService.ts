'use client';

import { useState, useEffect } from 'react';
import type { Service } from '@/types';

interface UseServiceReturn {
  service: Service | null;
  loading: boolean;
  error: string | null;
}

export function useService(id: string): UseServiceReturn {
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetch(`/api/services/${id}`)
      .then((r) => {
        if (r.status === 404) throw new Error('not_found');
        if (!r.ok) throw new Error('fetch_error');
        return r.json() as Promise<{ service: Service }>;
      })
      .then((d) => {
        if (!cancelled) setService(d.service ?? null);
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message === 'not_found' ? 'Услуга не найдена' : 'Не удалось загрузить услугу');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [id]);

  return { service, loading, error };
}
