'use client';

import { SERVICE_CATEGORY_LABELS, SERVICE_AREA_LABELS, type ServiceCategory, type ServiceArea } from '@/types';

interface ServiceFiltersProps {
  selectedCategory: ServiceCategory | '';
  selectedServiceArea: ServiceArea | '';
  onCategoryChange: (v: ServiceCategory | '') => void;
  onServiceAreaChange: (v: ServiceArea | '') => void;
}

/**
 * Фильтры для списка услуг: категория и зона.
 */
export function ServiceFilters({
  selectedCategory,
  selectedServiceArea,
  onCategoryChange,
  onServiceAreaChange,
}: ServiceFiltersProps) {
  return (
    <div className="flex flex-wrap gap-3">
      {/* Фильтр по категории */}
      <select
        value={selectedCategory}
        onChange={(e) => onCategoryChange(e.target.value as ServiceCategory | '')}
        className="text-sm bg-white border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
        aria-label="Категория услуги"
      >
        <option value="">Все категории</option>
        {(Object.entries(SERVICE_CATEGORY_LABELS) as [ServiceCategory, string][]).map(([v, l]) => (
          <option key={v} value={v}>{l}</option>
        ))}
      </select>

      {/* Фильтр по зоне */}
      <select
        value={selectedServiceArea}
        onChange={(e) => onServiceAreaChange(e.target.value as ServiceArea | '')}
        className="text-sm bg-white border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
        aria-label="Зона работы"
      >
        <option value="">Любая зона</option>
        {(Object.entries(SERVICE_AREA_LABELS) as [ServiceArea, string][]).map(([v, l]) => (
          <option key={v} value={v}>{l}</option>
        ))}
      </select>
    </div>
  );
}
