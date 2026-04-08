import { Suspense } from 'react';
import { HousingDetailClient } from '@/components/housing/HousingDetailClient';
import { FullScreenSpinner } from '@/components/ui/Spinner';
import type { Metadata } from 'next';

interface Props {
  params: { id: string };
}

export const metadata: Metadata = {
  title: 'Жильё — Теремок',
};

export default function HousingDetailPage({ params }: Props) {
  return (
    <Suspense fallback={<FullScreenSpinner />}>
      <HousingDetailClient id={params.id} />
    </Suspense>
  );
}
