'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Job } from '@/types';

interface JobFilters {
  cityId?: string;
  listingType?: string;
  category?: string;
  jobType?: string;
  limit?: number;
}

interface UseJobsReturn {
  jobs: Job[];
  loading: boolean;
  hasMore: boolean;
  loadMore: () => void;
  error: string | null;
}

export function useJobs(filters: JobFilters = {}): UseJobsReturn {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const filtersKey = JSON.stringify(filters);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filters.cityId) params.set('cityId', filters.cityId);
      if (filters.listingType) params.set('listingType', filters.listingType);
      if (filters.category) params.set('category', filters.category);
      params.set('limit', String(filters.limit ?? 40));

      const res = await fetch(`/api/jobs?${params}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json() as { jobs: Job[] };
      setJobs(data.jobs ?? []);
    } catch (err) {
      console.error('[useJobs]', err);
      setError('Не удалось загрузить вакансии. Попробуйте обновить страницу.');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtersKey]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { jobs, loading, hasMore: false, loadMore: () => {}, error };
}
