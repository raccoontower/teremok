'use client';

import { useState, useEffect } from 'react';
import { getCategories } from '@/lib/firebase/firestore';
import type { Category } from '@/types';

// Кэш в памяти — общий для всех вызовов хука
let categoriesCache: Category[] | null = null;

interface UseCategoriesReturn {
  categories: Category[];
  loading: boolean;
  error: string | null;
}

/**
 * Хук для получения списка категорий.
 * Кэширует результат в памяти — повторные вызовы не делают запросы к Firestore.
 */
export function useCategories(): UseCategoriesReturn {
  const [categories, setCategories] = useState<Category[]>(categoriesCache ?? []);
  const [loading, setLoading] = useState(!categoriesCache);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Если кэш уже заполнен — не делаем запрос
    if (categoriesCache) {
      setCategories(categoriesCache);
      setLoading(false);
      return;
    }

    const fetch = async () => {
      try {
        const data = await getCategories();
        categoriesCache = data;
        setCategories(data);
      } catch (err) {
        setError('Не удалось загрузить категории');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, []);

  return { categories, loading, error };
}
