import { Suspense } from 'react';
import { ServicesClientPage } from '@/components/services/ServicesClientPage';
import { FullScreenSpinner } from '@/components/ui/Spinner';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Услуги — Теремок',
  description: 'Местные услуги: ремонт, уборка, IT, юридические услуги и многое другое.',
};

export default function ServicesPage() {
  return (
    <Suspense fallback={<FullScreenSpinner />}>
      <ServicesClientPage />
    </Suspense>
  );
}
