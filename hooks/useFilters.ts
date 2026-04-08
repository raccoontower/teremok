'use client';

import { useState, useCallback } from 'react';

interface UseFiltersReturn {
  cityId: string;
  categoryId: string;
  setCity: (cityId: string) => void;
  setCategory: (categoryId: string) => void;
  reset: () => void;
}

/**
 * Хук для управления фильтрами ленты объявлений
 */
export function useFilters(): UseFiltersReturn {
  const [cityId, setCityId] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('');

  const setCity = useCallback((id: string) => {
    setCityId(id);
  }, []);

  const setCategory = useCallback((id: string) => {
    setCategoryId(id);
  }, []);

  const reset = useCallback(() => {
    setCityId('');
    setCategoryId('');
  }, []);

  return { cityId, categoryId, setCity, setCategory, reset };
}
