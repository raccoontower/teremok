'use client';

import Link from 'next/link';
import { useJob } from '@/hooks/useJob';
import type { Job } from '@/types';
import { Container } from '@/components/layout/Container';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { FullScreenSpinner } from '@/components/ui/Spinner';
import {
  JOB_TYPE_LABELS,
  JOB_CATEGORY_LABELS,
  SALARY_PERIOD_LABELS,
} from '@/types';
import { formatDate } from '@/lib/utils/formatDate';
import { ContactButtons } from '@/components/shared/ContactButtons';
import { ReportButton } from '@/components/shared/ReportButton';

interface JobDetailClientProps {
  id: string;
  initialJob?: Job | null;
}

/**
 * Детальная страница вакансии.
 */
export function JobDetailClient({ id, initialJob }: JobDetailClientProps) {
  const { job: fetched, loading, error } = useJob(initialJob ? '' : id);
  const job = initialJob ?? fetched;

  if (!initialJob && loading) return <FullScreenSpinner />;

  if ((!initialJob && error) || !job) {
    return (
      <Container className="py-16 text-center">
        <p className="text-4xl mb-3">🔍</p>
        <p className="text-lg font-medium text-neutral-700">
          {error || 'Вакансия не найдена'}
        </p>
        <Link href="/jobs" className="mt-4 inline-block">
          <Button variant="secondary">← Все вакансии</Button>
        </Link>
      </Container>
    );
  }

  // Форматируем зарплату
  const salary = (() => {
    if (job.salaryNegotiable) return 'Договорная';
    const period = job.salaryPeriod ? SALARY_PERIOD_LABELS[job.salaryPeriod] : '';
    if (job.salaryMin && job.salaryMax) {
      return `$${job.salaryMin.toLocaleString()}–$${job.salaryMax.toLocaleString()} ${period}`.trim();
    }
    if (job.salaryMin) return `от $${job.salaryMin.toLocaleString()} ${period}`.trim();
    if (job.salaryMax) return `до $${job.salaryMax.toLocaleString()} ${period}`.trim();
    return null;
  })();

  const { contact } = job;

  return (
    <Container className="py-6 max-w-2xl">
      {/* Кнопка назад */}
      <Link href="/jobs" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 mb-5 transition-colors">
        ← Все вакансии
      </Link>

      <div className="bg-white rounded-[16px] shadow-card p-6 space-y-5">
        {/* Бейджи */}
        <div className="flex flex-wrap gap-2">
          <Badge variant="info">{JOB_TYPE_LABELS[job.jobType]}</Badge>
          <Badge variant="default">{JOB_CATEGORY_LABELS[job.category]}</Badge>
          {job.isPremium && <Badge variant="warning">⭐ Premium</Badge>}
        </div>

        {/* Заголовок */}
        <h1 className="text-2xl font-bold text-neutral-900">{job.title}</h1>

        {/* Зарплата */}
        {salary && (
          <div className="flex items-center gap-2">
            <span className="text-xl font-semibold text-green-700">{salary}</span>
          </div>
        )}

        {/* Мета */}
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-neutral-500">
          <span>📍 {job.cityId}</span>
          {job.createdAt && <span>🕐 {formatDate(job.createdAt)}</span>}
          <span>👁 {job.viewsCount} просмотров</span>
        </div>

        {/* Описание */}
        <div>
          <h2 className="text-base font-semibold text-neutral-800 mb-2">Описание</h2>
          <p className="text-sm text-neutral-700 leading-relaxed whitespace-pre-line">
            {job.description}
          </p>
        </div>

        {/* Требования */}
        {job.requirements && (
          <div>
            <h2 className="text-base font-semibold text-neutral-800 mb-2">Требования</h2>
            <p className="text-sm text-neutral-700 leading-relaxed whitespace-pre-line">
              {job.requirements}
            </p>
          </div>
        )}

        {/* Автор */}
        <div className="border-t border-gray-100 pt-4">
          <p className="text-sm text-neutral-500">
            Размещено: <span className="font-medium text-neutral-700">{job.authorName}</span>
          </p>
        </div>

        {/* Контакты */}
        <div className="space-y-3">
          <h2 className="text-base font-semibold text-neutral-800">Связаться с автором</h2>
          {contact.name && <p className="text-sm text-neutral-600">{contact.name}</p>}
          <ContactButtons contact={contact} />

          {/* Совет безопасности */}
          <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
            <p className="font-semibold mb-1">⚠️ Совет безопасности</p>
            <p>Встречайтесь лично, не платите вперёд. <a href="/safety" className="underline">Подробнее о безопасности →</a></p>
          </div>
        </div>

        {/* Жалоба */}
        <div className="flex justify-end pt-2">
          <ReportButton itemId={job.id} itemType="job" itemTitle={job.title} />
        </div>
      </div>
    </Container>
  );
}
