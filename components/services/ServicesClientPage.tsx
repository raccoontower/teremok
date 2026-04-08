'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useServices } from '@/hooks/useServices';
import { useCityContext } from '@/contexts/CityContext';
import { ServiceCard } from '@/components/services/ServiceCard';
import { ServiceFilters } from '@/components/services/ServiceFilters';
import { Container } from '@/components/layout/Container';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import type { ServiceCategory, ServiceArea } from '@/types';

/**
 * Клиентская страница списка услуг с фильтрами и пагинацией.
 */
export function ServicesClientPage() {
  const { selectedCity } = useCityContext();
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | ''>('');
  const [selectedServiceArea, setSelectedServiceArea] = useState<ServiceArea | ''>('');

  const { services, loading, hasMore, loadMore, error } = useServices({
    cityId: selectedCity || undefined,
    category: selectedCategory || undefined,
    serviceArea: selectedServiceArea || undefined,
  });

  return (
    <Container className="py-6">
      {/* Заголовок и кнопка */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-neutral-900">Услуги</h1>
        <Link href="/services/new">
          <Button variant="primary" size="sm">+ Разместить услугу</Button>
        </Link>
      </div>

      {/* Фильтры */}
      <div className="mb-5">
        <ServiceFilters
          selectedCategory={selectedCategory}
          selectedServiceArea={selectedServiceArea}
          onCategoryChange={setSelectedCategory}
          onServiceAreaChange={setSelectedServiceArea}
        />
      </div>

      {/* Ошибка */}
      {error && <div className="text-center py-10 text-red-500">{error}</div>}

      {/* Первая загрузка */}
      {loading && services.length === 0 && (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      )}

      {/* Пустое состояние */}
      {!loading && services.length === 0 && !error && (
        <div className="text-center py-16 text-gray-500">
          <p className="text-4xl mb-3">🛠️</p>
          <p className="text-lg font-medium">Услуг пока нет</p>
          <p className="text-sm mt-1">Попробуйте изменить фильтры</p>
        </div>
      )}

      {/* Сетка услуг */}
      {services.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      )}

      {/* Кнопка загрузить ещё */}
      {hasMore && !loading && services.length > 0 && (
        <div className="flex justify-center mt-8">
          <Button variant="secondary" onClick={loadMore}>Загрузить ещё</Button>
        </div>
      )}

      {/* Загрузка следующей страницы */}
      {loading && services.length > 0 && (
        <div className="flex justify-center mt-8"><Spinner /></div>
      )}
    </Container>
  );
}
