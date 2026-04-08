import { Suspense } from 'react';
import { JobDetailClient } from '@/components/jobs/JobDetailClient';
import { FullScreenSpinner } from '@/components/ui/Spinner';
import type { Metadata } from 'next';

interface Props {
  params: { id: string };
}

export const metadata: Metadata = {
  title: 'Вакансия — Теремок',
};

export default function JobDetailPage({ params }: Props) {
  return (
    <Suspense fallback={<FullScreenSpinner />}>
      <JobDetailClient id={params.id} />
    </Suspense>
  );
}
