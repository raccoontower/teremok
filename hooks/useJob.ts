'use client';

import { useState, useEffect } from 'react';
import { getJob } from '@/lib/firebase/jobs';
import type { Job } from '@/types';

interface UseJobReturn {
  job: Job | null;
  loading: boolean;
  error: string | null;
}

/**
 * Хук для получения одной вакансии по ID.
 */
export function useJob(id: string): UseJobReturn {
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    setLoading(true);
    setError(null);

    getJob(id)
      .then((data) => {
        if (!data) {
          setError('Вакансия не найдена');
        } else {
          setJob(data);
        }
      })
      .catch(() => {
        setError('Не удалось загрузить вакансию');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  return { job, loading, error };
}
