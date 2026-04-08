'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useJobs } from '@/hooks/useJobs';
import { useCityContext } from '@/contexts/CityContext';
import { JobCard } from '@/components/jobs/JobCard';
import { JobFilters } from '@/components/jobs/JobFilters';
import { Container } from '@/components/layout/Container';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import type { JobType, JobCategory } from '@/types';

/**
 * Клиентская страница списка вакансий с фильтрами и пагинацией.
 */
export function JobsClientPage() {
  const { selectedCity } = useCityContext();
  const [selectedCategory, setSelectedCategory] = useState<JobCategory | ''>('');
  const [selectedJobType, setSelectedJobType] = useState<JobType | ''>('');

  const { jobs, loading, hasMore, loadMore, error } = useJobs({
    cityId: selectedCity || undefined,
    category: selectedCategory || undefined,
    jobType: selectedJobType || undefined,
  });

  return (
    <Container className="py-6">
      {/* Заголовок и кнопка добавить */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-neutral-900">Работа</h1>
        <Link href="/jobs/new">
          <Button variant="primary" size="sm">+ Разместить вакансию</Button>
        </Link>
      </div>

      {/* Фильтры */}
      <div className="mb-5">
        <JobFilters
          selectedCategory={selectedCategory}
          selectedJobType={selectedJobType}
          onCategoryChange={setSelectedCategory}
          onJobTypeChange={setSelectedJobType}
        />
      </div>

      {/* Ошибка */}
      {error && (
        <div className="text-center py-10 text-red-500">{error}</div>
      )}

      {/* Первая загрузка */}
      {loading && jobs.length === 0 && (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      )}

      {/* Пустое состояние */}
      {!loading && jobs.length === 0 && !error && (
        <div className="text-center py-16 text-gray-500">
          <p className="text-4xl mb-3">💼</p>
          <p className="text-lg font-medium">Вакансий пока нет</p>
          <p className="text-sm mt-1">Попробуйте изменить фильтры</p>
        </div>
      )}

      {/* Сетка вакансий */}
      {jobs.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}

      {/* Кнопка загрузить ещё */}
      {hasMore && !loading && jobs.length > 0 && (
        <div className="flex justify-center mt-8">
          <Button variant="secondary" onClick={loadMore}>
            Загрузить ещё
          </Button>
        </div>
      )}

      {/* Загрузка следующей страницы */}
      {loading && jobs.length > 0 && (
        <div className="flex justify-center mt-8">
          <Spinner />
        </div>
      )}
    </Container>
  );
}
