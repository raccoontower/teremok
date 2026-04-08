'use client';

import { useState, useEffect } from 'react';
import type { Job } from '@/types';

interface UseJobReturn {
  job: Job | null;
  loading: boolean;
  error: string | null;
}

export function useJob(id: string): UseJobReturn {
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetch(`/api/jobs/${id}`)
      .then((r) => {
        if (r.status === 404) throw new Error('not_found');
        if (!r.ok) throw new Error('fetch_error');
        return r.json() as Promise<{ job: Job }>;
      })
      .then((d) => {
        if (!cancelled) setJob(d.job ?? null);
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message === 'not_found' ? 'Вакансия не найдена' : 'Не удалось загрузить вакансию');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [id]);

  return { job, loading, error };
}
