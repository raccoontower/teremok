'use client';

import { PROPERTY_TYPE_LABELS, type HousingListingType, type PropertyType, type BedroomsCount } from '@/types';

interface HousingFiltersProps {
  selectedListingType: HousingListingType | '';
  selectedPropertyType: PropertyType | '';
  selectedBedrooms: BedroomsCount | '';
  selectedPetFriendly: boolean | '';
  onListingTypeChange: (v: HousingListingType | '') => void;
  onPropertyTypeChange: (v: PropertyType | '') => void;
  onBedroomsChange: (v: BedroomsCount | '') => void;
  onPetFriendlyChange: (v: boolean | '') => void;
}

/**
 * Фильтры для списка объявлений о жилье.
 */
export function HousingFilters({
  selectedListingType,
  selectedPropertyType,
  selectedBedrooms,
  selectedPetFriendly,
  onListingTypeChange,
  onPropertyTypeChange,
  onBedroomsChange,
  onPetFriendlyChange,
}: HousingFiltersProps) {
  return (
    <div className="flex flex-wrap gap-3">
      {/* Тип: аренда / продажа */}
      <select
        value={selectedListingType}
        onChange={(e) => onListingTypeChange(e.target.value as HousingListingType | '')}
        className="text-sm bg-white border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
        aria-label="Тип сделки"
      >
        <option value="">Аренда и продажа</option>
        <option value="rent">Аренда</option>
        <option value="sale">Продажа</option>
      </select>

      {/* Тип недвижимости */}
      <select
        value={selectedPropertyType}
        onChange={(e) => onPropertyTypeChange(e.target.value as PropertyType | '')}
        className="text-sm bg-white border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
        aria-label="Тип недвижимости"
      >
        <option value="">Любой тип</option>
        {(Object.entries(PROPERTY_TYPE_LABELS) as [PropertyType, string][]).map(([v, l]) => (
          <option key={v} value={v}>{l}</option>
        ))}
      </select>

      {/* Количество спален */}
      <select
        value={selectedBedrooms === '' ? '' : String(selectedBedrooms)}
        onChange={(e) => onBedroomsChange(e.target.value === '' ? '' : Number(e.target.value) as BedroomsCount)}
        className="text-sm bg-white border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
        aria-label="Спальни"
      >
        <option value="">Любое кол-во комнат</option>
        <option value="0">Студия</option>
        <option value="1">1 спальня</option>
        <option value="2">2 спальни</option>
        <option value="3">3 спальни</option>
        <option value="4">4+ спальни</option>
      </select>

      {/* Можно с животными */}
      <select
        value={selectedPetFriendly === '' ? '' : selectedPetFriendly ? 'yes' : 'no'}
        onChange={(e) => {
          if (e.target.value === '') onPetFriendlyChange('');
          else onPetFriendlyChange(e.target.value === 'yes');
        }}
        className="text-sm bg-white border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
        aria-label="Животные"
      >
        <option value="">Животные: любые</option>
        <option value="yes">Можно с животными</option>
        <option value="no">Без животных</option>
      </select>
    </div>
  );
}
