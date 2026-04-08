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
}

export function ListingFilters({
  cityId,
  categoryId,
  onCityChange,
  onCategoryChange,
  onReset,
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
