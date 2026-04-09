import type { Metadata } from 'next';
import { Suspense } from 'react';
import { ServicesClientPage } from '@/components/services/ServicesClientPage';
import { FullScreenSpinner } from '@/components/ui/Spinner';
import { getCityNameLoc } from '@/lib/utils/cityNames';

interface Props { searchParams: Promise<{ city?: string }> }

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { city } = await searchParams;
  if (city) {
    const cityLoc = getCityNameLoc(city);
    return {
      title: `Услуги в ${cityLoc} — Teremok`,
      description: `Местные услуги в ${cityLoc}: ремонт, уборка, IT, юридические и другие услуги на русском языке.`,
    };
  }
  return {
    title: 'Услуги в США — Teremok',
    description: 'Местные услуги для русскоязычных в США: ремонт, уборка, IT, юридические и другие.',
  };
}

export default function ServicesPage() {
  return (
    <Suspense fallback={<FullScreenSpinner />}>
      <ServicesClientPage />
    </Suspense>
  );
}
