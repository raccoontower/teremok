import type { Metadata } from 'next';
import { Suspense } from 'react';
import { HousingClientPage } from '@/components/housing/HousingClientPage';
import { FullScreenSpinner } from '@/components/ui/Spinner';
import { getCityNameLoc } from '@/lib/utils/cityNames';

interface Props { searchParams: Promise<{ city?: string }> }

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { city } = await searchParams;
  if (city) {
    const cityLoc = getCityNameLoc(city);
    return {
      title: `Жильё в ${cityLoc} — Teremok`,
      description: `Аренда и продажа жилья в ${cityLoc}. Квартиры, дома, комнаты для русскоязычных в ${cityLoc}, США.`,
    };
  }
  return {
    title: 'Жильё в США — Teremok',
    description: 'Аренда и продажа жилья для русскоязычных в США. Квартиры, дома, комнаты.',
  };
}

export default function HousingPage() {
  return (
    <Suspense fallback={<FullScreenSpinner />}>
      <HousingClientPage />
    </Suspense>
  );
}
