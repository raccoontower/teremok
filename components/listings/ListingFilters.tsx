'use client';

import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { useCategories } from '@/hooks/useCategories';
import { useCities } from '@/hooks/useCities';

interface ListingFiltersProps {
  cityId: string;
  categoryId: string;
  onCityChange: (cityId: string) => void;
  onCategoryChange: (categoryId: string) => void;
  onReset: () => void;
  sort?: string;
  onSortChange?: (v: string) => void;
}

export function ListingFilters({
  cityId,
  categoryId,
  onCityChange,
  onCategoryChange,
  onReset,
  sort,
  onSortChange,
}: ListingFiltersProps) {
  const { categories, loading: categoriesLoading } = useCategories();
  const { cities, loading: citiesLoading } = useCities();

  const hasActiveFilters = cityId || categoryId;

  return (
    <div className="flex flex-wrap gap-3 items-end">
      {/* Фильтр по городу */}
      <div className="w-full sm:w-auto sm:min-w-[180px]">
        <Select
          placeholder="Все города"
          value={cityId}
          onChange={(e) => onCityChange(e.target.value)}
          disabled={citiesLoading}
          options={cities.map((city) => ({
            value: city.slug,
            label: city.name,
          }))}
        />
      </div>

      {/* Фильтр по категории */}
      <div className="w-full sm:w-auto sm:min-w-[200px]">
        <Select
          placeholder="Все категории"
          value={categoryId}
          onChange={(e) => onCategoryChange(e.target.value)}
          disabled={categoriesLoading}
          options={categories.map((cat) => ({
            value: cat.slug,
            label: cat.icon ? `${cat.icon} ${cat.name}` : cat.name,
          }))}
        />
      </div>

      {/* Сортировка */}
      {onSortChange && (
        <div className="w-full sm:w-auto sm:min-w-[180px]">
          <select
            value={sort ?? ''}
            onChange={(e) => onSortChange(e.target.value)}
            className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm bg-white focus:ring-2 focus:ring-primary-500 focus:outline-none"
          >
            <option value="">Сначала новые</option>
            <option value="oldest">Сначала старые</option>
            <option value="price_asc">По цене ↑</option>
            <option value="price_desc">По цене ↓</option>
          </select>
        </div>
      )}

      {/* Кнопка сброса фильтров */}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="md"
          onClick={onReset}
          className="text-gray-500"
        >
          Сбросить
        </Button>
      )}
    </div>
  );
}
