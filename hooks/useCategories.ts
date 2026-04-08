'use client';

import { useState, useEffect } from 'react';
import type { Category } from '@/types';

let categoriesCache: Category[] | null = null;

interface UseCategoriesReturn {
  categories: Category[];
  loading: boolean;
  error: string | null;
}

export function useCategories(): UseCategoriesReturn {
  const [categories, setCategories] = useState<Category[]>(categoriesCache ?? []);
  const [loading, setLoading] = useState(!categoriesCache);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (categoriesCache) {
      setCategories(categoriesCache);
      setLoading(false);
      return;
    }
    fetch('/api/categories')
      .then((r) => r.json())
      .then((d: { categories?: Category[] }) => {
        categoriesCache = d.categories ?? [];
        setCategories(categoriesCache);
      })
      .catch(() => setError('Не удалось загрузить категории'))
      .finally(() => setLoading(false));
  }, []);

  return { categories, loading, error };
}
