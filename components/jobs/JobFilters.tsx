'use client';

import { JOB_TYPE_LABELS, JOB_CATEGORY_LABELS, type JobType, type JobCategory } from '@/types';

interface JobFiltersProps {
  selectedCategory: JobCategory | '';
  selectedJobType: JobType | '';
  onCategoryChange: (v: JobCategory | '') => void;
  onJobTypeChange: (v: JobType | '') => void;
}

/**
 * Фильтры для списка вакансий: категория и тип занятости.
 */
export function JobFilters({
  selectedCategory,
  selectedJobType,
  onCategoryChange,
  onJobTypeChange,
}: JobFiltersProps) {
  return (
    <div className="flex flex-wrap gap-3">
      {/* Фильтр по категории */}
      <select
        value={selectedCategory}
        onChange={(e) => onCategoryChange(e.target.value as JobCategory | '')}
        className="text-sm bg-white border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
        aria-label="Категория"
      >
        <option value="">Все категории</option>
        {(Object.entries(JOB_CATEGORY_LABELS) as [JobCategory, string][]).map(([value, label]) => (
          <option key={value} value={value}>{label}</option>
        ))}
      </select>

      {/* Фильтр по типу занятости */}
      <select
        value={selectedJobType}
        onChange={(e) => onJobTypeChange(e.target.value as JobType | '')}
        className="text-sm bg-white border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
        aria-label="Тип занятости"
      >
        <option value="">Любой тип</option>
        {(Object.entries(JOB_TYPE_LABELS) as [JobType, string][]).map(([value, label]) => (
          <option key={value} value={value}>{label}</option>
        ))}
      </select>
    </div>
  );
}
