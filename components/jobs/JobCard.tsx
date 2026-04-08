import Link from 'next/link';
import type { Job } from '@/types';
import { JOB_LISTING_TYPE_LABELS, JOB_TYPE_LABELS, JOB_CATEGORY_LABELS, SALARY_PERIOD_LABELS } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { formatDateShort } from '@/lib/utils/formatDate';
import { cn } from '@/lib/utils/cn';

interface JobCardProps {
  job: Job;
  className?: string;
}

// Иконка геолокации
function PinIcon() {
  return (
    <svg className="w-3 h-3 shrink-0 text-neutral-400" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M8 1.5C5.515 1.5 3.5 3.515 3.5 6c0 3.75 4.5 8.5 4.5 8.5S12.5 9.75 12.5 6c0-2.485-2.015-4.5-4.5-4.5zm0 6a1.5 1.5 0 110-3 1.5 1.5 0 010 3z" fill="currentColor" />
    </svg>
  );
}

// Иконка календаря
function CalendarIcon() {
  return (
    <svg className="w-3 h-3 shrink-0 text-neutral-400" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="2" y="3.5" width="12" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M2 6.5h12M5.5 2v3M10.5 2v3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

/**
 * Форматирует зарплату для отображения в карточке.
 */
function formatSalary(job: Job): string {
  if (job.salaryNegotiable) return 'Договорная';

  const period = job.salaryPeriod ? SALARY_PERIOD_LABELS[job.salaryPeriod] : '';

  if (job.salaryMin && job.salaryMax) {
    return `$${job.salaryMin.toLocaleString()}–${job.salaryMax.toLocaleString()} ${period}`.trim();
  }
  if (job.salaryMin) {
    return `от $${job.salaryMin.toLocaleString()} ${period}`.trim();
  }
  if (job.salaryMax) {
    return `до $${job.salaryMax.toLocaleString()} ${period}`.trim();
  }

  return 'Зарплата не указана';
}

export function JobCard({ job, className }: JobCardProps) {
  const { id, title, jobType, category, cityId, createdAt, isPremium, listingType } = job;
  const formattedDate = createdAt ? formatDateShort(createdAt) : '';
  const salary = formatSalary(job);

  return (
    <Link
      href={`/jobs/${id}`}
      className={cn(
        // Стиль как у ListingCard — единая дизайн-система
        'group block bg-white rounded-[16px] overflow-hidden',
        'shadow-card hover:shadow-hover hover:-translate-y-0.5',
        'transition-all duration-200',
        // Premium — лёгкий синеватый оттенок фона
        isPremium && 'ring-1 ring-blue-100',
        className
      )}
    >
      <div className="p-4">
        {/* Верхняя строка: бейджи типа и категории */}
        <div className="flex items-center gap-2 flex-wrap mb-2.5">
          {listingType && (
            <Badge variant={listingType === 'resume' ? 'success' : 'info'}>
              {JOB_LISTING_TYPE_LABELS[listingType]}
            </Badge>
          )}
          <Badge variant="info">{JOB_TYPE_LABELS[jobType]}</Badge>
          <Badge variant="default">{JOB_CATEGORY_LABELS[category]}</Badge>
          {isPremium && <Badge variant="warning">⭐ Premium</Badge>}
        </div>

        {/* Заголовок вакансии */}
        <p className="text-base font-semibold text-neutral-900 line-clamp-2 leading-snug">
          {title}
        </p>

        {/* Зарплата */}
        <p className={cn(
          'mt-1.5 text-sm font-medium',
          job.salaryNegotiable ? 'text-neutral-500' : 'text-green-700'
        )}>
          {salary}
        </p>

        {/* Мета: город и дата */}
        <div className="flex items-center justify-between mt-3 text-xs text-neutral-500">
          <span className="flex items-center gap-1 truncate">
            <PinIcon />
            <span className="truncate">{cityId}</span>
          </span>
          {formattedDate && (
            <span className="flex items-center gap-1 shrink-0 ml-2">
              <CalendarIcon />
              {formattedDate}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
