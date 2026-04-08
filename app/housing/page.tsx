import { Suspense } from 'react';
import { HousingClientPage } from '@/components/housing/HousingClientPage';
import { FullScreenSpinner } from '@/components/ui/Spinner';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Жильё — Теремок',
  description: 'Аренда и продажа жилья. Квартиры, дома, комнаты.',
};

export default function HousingPage() {
  return (
    <Suspense fallback={<FullScreenSpinner />}>
      <HousingClientPage />
    </Suspense>
  );
}
