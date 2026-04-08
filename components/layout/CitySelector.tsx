'use client';

import { useCities } from '@/hooks/useCities';
import { useCityContext } from '@/contexts/CityContext';

/**
 * Дропдаун выбора города в хедере.
 * Использует данные из useCities() и обновляет CityContext.
 */
export function CitySelector() {
  const { cities, loading } = useCities();
  const { selectedCity, setCity } = useCityContext();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setCity(value || null);
  };

  if (loading) {
    // Заглушка пока грузятся города
    return (
      <div className="w-32 h-8 bg-gray-100 rounded-lg animate-pulse" />
    );
  }

  return (
    <select
      value={selectedCity ?? ''}
      onChange={handleChange}
      className="text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 pr-7 cursor-pointer hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors appearance-none max-w-[140px] truncate"
      aria-label="Выбрать город"
    >
      {/* Первая опция — все города */}
      <option value="">Все города</option>

      {cities.map((city) => (
        <option key={city.slug} value={city.slug}>
          {city.name}
        </option>
      ))}
    </select>
  );
}
