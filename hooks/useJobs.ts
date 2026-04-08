'use client';

import { useState, useEffect, useCallback } from 'react';
import { type QueryDocumentSnapshot } from 'firebase/firestore';
import { getJobs, type JobFilters } from '@/lib/firebase/jobs';
import type { Job } from '@/types';

interface UseJobsReturn {
  jobs: Job[];
  loading: boolean;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  error: string | null;
}

const PAGE_SIZE = 20;

/**
 * Хук для получения списка вакансий с пагинацией и фильтрами.
 * При изменении фильтров — сбрасывает состояние и загружает заново.
 */
export function useJobs(filters: JobFilters = {}): UseJobsReturn {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot | null>(null);

  // Сериализуем фильтры для корректного сравнения в useEffect
  const filtersKey = JSON.stringify(filters);

  const fetchInitial = useCallback(async () => {
    setLoading(true);
    setError(null);
    setJobs([]);
    setLastDoc(null);

    try {
      const result = await getJobs(filters);
      setJobs(result.jobs);
      setLastDoc(result.lastDoc);
      setHasMore(result.jobs.length === PAGE_SIZE);
    } catch (err) {
      setError('Не удалось загрузить вакансии');
      console.error(err);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtersKey]);

  useEffect(() => {
    fetchInitial();
  }, [fetchInitial]);

  /**
   * Загружает следующую страницу вакансий.
   */
  const loadMore = useCallback(async () => {
    if (!hasMore || loading || !lastDoc) return;

    setLoading(true);
    try {
      const result = await getJobs(filters, lastDoc);
      setJobs((prev) => [...prev, ...result.jobs]);
      setLastDoc(result.lastDoc);
      setHasMore(result.jobs.length === PAGE_SIZE);
    } catch (err) {
      setError('Не удалось загрузить вакансии');
      console.error(err);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasMore, loading, lastDoc]);

  return { jobs, loading, hasMore, loadMore, error };
}
