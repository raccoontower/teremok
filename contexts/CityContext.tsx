'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

// Ключ в localStorage для хранения выбранного города
const STORAGE_KEY = 'teremok_selected_city';

interface CityContextValue {
  selectedCity: string | null;
  setCity: (slug: string | null) => void;
}

const CityContext = createContext<CityContextValue | null>(null);

/**
 * Провайдер выбранного города.
 * Приоритет: URL param ?city= → localStorage → null (все города).
 * При setCity обновляет URL через router.replace.
 */
export function CityProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Инициализируем из URL или localStorage
  const [selectedCity, setSelectedCity] = useState<string | null>(() => {
    // На сервере searchParams может быть пустым — начинаем с null
    return null;
  });

  // Читаем начальное значение на клиенте
  useEffect(() => {
    const fromUrl = searchParams.get('city');
    if (fromUrl) {
      setSelectedCity(fromUrl);
      return;
    }
    // Пробуем localStorage
    try {
      const fromStorage = localStorage.getItem(STORAGE_KEY);
      if (fromStorage) {
        setSelectedCity(fromStorage);
      }
    } catch {
      // localStorage недоступен (SSR, приватный режим)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Синхронизируем при изменении URL-параметра
  useEffect(() => {
    const fromUrl = searchParams.get('city');
    setSelectedCity(fromUrl || null);
  }, [searchParams]);

  const setCity = useCallback(
    (slug: string | null) => {
      setSelectedCity(slug);

      // Обновляем localStorage
      try {
        if (slug) {
          localStorage.setItem(STORAGE_KEY, slug);
        } else {
          localStorage.removeItem(STORAGE_KEY);
        }
      } catch {
        // Игнорируем ошибки localStorage
      }

      // Обновляем URL без перезагрузки страницы
      const params = new URLSearchParams(searchParams.toString());
      if (slug) {
        params.set('city', slug);
      } else {
        params.delete('city');
      }
      router.replace(`?${params.toString()}`);
    },
    [router, searchParams]
  );

  return (
    <CityContext.Provider value={{ selectedCity, setCity }}>
      {children}
    </CityContext.Provider>
  );
}

/**
 * Хук для доступа к контексту выбранного города.
 */
export function useCityContext(): CityContextValue {
  const ctx = useContext(CityContext);
  if (!ctx) {
    throw new Error('useCityContext должен использоваться внутри CityProvider');
  }
  return ctx;
}
