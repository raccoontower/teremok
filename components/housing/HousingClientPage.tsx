'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useHousingListings } from '@/hooks/useHousingListings';
import { useCityContext } from '@/contexts/CityContext';
import { HousingCard } from '@/components/housing/HousingCard';
import { HousingFilters } from '@/components/housing/HousingFilters';
import { Container } from '@/components/layout/Container';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import type { HousingListingType, PropertyType, BedroomsCount } from '@/types';

/**
 * Клиентская страница списка объявлений о жилье.
 */
export function HousingClientPage() {
  const { selectedCity } = useCityContext();
  const [selectedListingType, setSelectedListingType] = useState<HousingListingType | ''>('');
  const [selectedPropertyType, setSelectedPropertyType] = useState<PropertyType | ''>('');
  const [selectedBedrooms, setSelectedBedrooms] = useState<BedroomsCount | ''>('');
  const [selectedPetFriendly, setSelectedPetFriendly] = useState<boolean | ''>('');

  const { listings, loading, hasMore, loadMore, error } = useHousingListings({
    cityId: selectedCity || undefined,
    listingType: selectedListingType || undefined,
    propertyType: selectedPropertyType || undefined,
    bedrooms: selectedBedrooms === '' ? undefined : selectedBedrooms,
    petFriendly: selectedPetFriendly === '' ? undefined : selectedPetFriendly,
  });

  return (
    <Container className="py-6">
      {/* Заголовок и кнопка */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-neutral-900">Жильё</h1>
        <Link href="/housing/new">
          <Button variant="primary" size="sm">+ Разместить объявление</Button>
        </Link>
      </div>

      {/* Фильтры */}
      <div className="mb-5">
        <HousingFilters
          selectedListingType={selectedListingType}
          selectedPropertyType={selectedPropertyType}
          selectedBedrooms={selectedBedrooms}
          selectedPetFriendly={selectedPetFriendly}
          onListingTypeChange={setSelectedListingType}
          onPropertyTypeChange={setSelectedPropertyType}
          onBedroomsChange={setSelectedBedrooms}
          onPetFriendlyChange={setSelectedPetFriendly}
        />
      </div>

      {/* Ошибка */}
      {error && <div className="text-center py-10 text-red-500">{error}</div>}

      {/* Первая загрузка */}
      {loading && listings.length === 0 && (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      )}

      {/* Пустое состояние */}
      {!loading && listings.length === 0 && !error && (
        <div className="text-center py-16 text-gray-500">
          <p className="text-4xl mb-3">🏠</p>
          <p className="text-lg font-medium">Объявлений пока нет</p>
          <p className="text-sm mt-1">Попробуйте изменить фильтры</p>
        </div>
      )}

      {/* Сетка объявлений */}
      {listings.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {listings.map((listing) => (
            <HousingCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}

      {/* Кнопка загрузить ещё */}
      {hasMore && !loading && listings.length > 0 && (
        <div className="flex justify-center mt-8">
          <Button variant="secondary" onClick={loadMore}>Загрузить ещё</Button>
        </div>
      )}

      {/* Загрузка следующей страницы */}
      {loading && listings.length > 0 && (
        <div className="flex justify-center mt-8"><Spinner /></div>
      )}
    </Container>
  );
}
