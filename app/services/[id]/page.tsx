import { Suspense } from 'react';
import { ServiceDetailClient } from '@/components/services/ServiceDetailClient';
import { FullScreenSpinner } from '@/components/ui/Spinner';
import type { Metadata } from 'next';

interface Props {
  params: { id: string };
}

export const metadata: Metadata = {
  title: 'Услуга — Теремок',
};

export default function ServiceDetailPage({ params }: Props) {
  return (
    <Suspense fallback={<FullScreenSpinner />}>
      <ServiceDetailClient id={params.id} />
    </Suspense>
  );
}
