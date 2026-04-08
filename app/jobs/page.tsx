import { Suspense } from 'react';
import { JobsClientPage } from '@/components/jobs/JobsClientPage';
import { FullScreenSpinner } from '@/components/ui/Spinner';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Работа — Теремок',
  description: 'Вакансии и работа в вашем городе. Полная занятость, частичная, фриланс.',
};

export default function JobsPage() {
  return (
    <Suspense fallback={<FullScreenSpinner />}>
      <JobsClientPage />
    </Suspense>
  );
}
