'use client';

import Link from 'next/link';
import type { Job } from '@/types';
import { JOB_TYPE_LABELS, SALARY_PERIOD_LABELS } from '@/types';
import { formatDateShort } from '@/lib/utils/formatDate';
import { cn } from '@/lib/utils/cn';

interface JobCardProps {
  job: Job;
  className?: string;
}

export function JobCard({ job, className }: JobCardProps) {
  const { id, title, jobType, cityId, salaryMin, salaryMax, salaryPeriod, salaryNegotiable, createdAt } = job;

  const salaryText = salaryNegotiable
    ? 'По договорённости'
    : salaryMin || salaryMax
    ? [
        salaryMin ? `$${salaryMin.toLocaleString('ru-RU')}` : null,
        salaryMax ? `$${salaryMax.toLocaleString('ru-RU')}` : null,
      ]
        .filter(Boolean)
        .join(' – ') + (salaryPeriod ? ` ${SALARY_PERIOD_LABELS[salaryPeriod]}` : '')
    : 'По договорённости';

  const formattedDate = createdAt ? formatDateShort(createdAt) : '';

  return (
    <Link
      href={`/jobs/${id}`}
      className={cn(
        'group block bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden min-w-[260px] md:min-w-0 snap-start',
        className
      )}
    >
      {/* Синяя полоска сверху */}
      <div className="h-1 bg-primary-600" />

      <div className="p-4 space-y-2">
        {/* Тип занятости */}
        <span className="inline-block text-xs font-medium text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full">
          {JOB_TYPE_LABELS[jobType]}
        </span>

        {/* Заголовок */}
        <p className="text-base font-semibold text-slate-900 line-clamp-2">
          {title}
        </p>

        {/* Зарплата */}
        <p className="text-base font-bold text-primary-600">{salaryText}</p>

        {/* Мета: город и дата */}
        <div className="flex items-center justify-between text-sm text-slate-500 pt-1">
          <span className="truncate">📍 {cityId}</span>
          {formattedDate && <span className="shrink-0 ml-2">{formattedDate}</span>}
        </div>
      </div>
    </Link>
  );
}
