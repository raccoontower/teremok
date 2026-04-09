import type { Metadata } from 'next';
import { Suspense } from 'react';
import { JobsClientPage } from '@/components/jobs/JobsClientPage';
import { FullScreenSpinner } from '@/components/ui/Spinner';
import { getCityNameLoc } from '@/lib/utils/cityNames';

interface Props { searchParams: Promise<{ city?: string }> }

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { city } = await searchParams;
  if (city) {
    const cityLoc = getCityNameLoc(city);
    return {
      title: `Работа в ${cityLoc} — Teremok`,
      description: `Вакансии и работа в ${cityLoc}. Русскоязычные работодатели и соискатели в ${cityLoc}, США. Полная занятость, частичная, фриланс.`,
    };
  }
  return {
    title: 'Работа в США — Teremok',
    description: 'Вакансии и работа для русскоязычных в США. Полная занятость, частичная, фриланс.',
  };
}

export default function JobsPage() {
  return (
    <Suspense fallback={<FullScreenSpinner />}>
      <JobsClientPage />
    </Suspense>
  );
}
