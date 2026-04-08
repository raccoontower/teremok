'use client';

import Link from 'next/link';
import { useCityContext } from '@/contexts/CityContext';
import { useListings } from '@/hooks/useListings';
import { useJobs } from '@/hooks/useJobs';
import { useHousingListings } from '@/hooks/useHousingListings';
import { useServices } from '@/hooks/useServices';
import { HomeSection } from '@/components/home/HomeSection';
import { ListingCard } from '@/components/listings/ListingCard';
import { JobCard } from '@/components/home/JobCard';
import { HousingCard } from '@/components/home/HousingCard';
import { ServiceCard } from '@/components/home/ServiceCard';
import { ROUTES } from '@/lib/constants/routes';

const PREVIEW_COUNT = 3;

export default function HomePage() {
  const { selectedCity } = useCityContext();

  const cityFilter = selectedCity ? { cityId: selectedCity } : {};

  const { listings, loading: listingsLoading } = useListings(cityFilter);
  const { jobs, loading: jobsLoading } = useJobs({ ...cityFilter, limit: PREVIEW_COUNT });
  const { listings: housingListings, loading: housingLoading } = useHousingListings({
    ...cityFilter,
    limit: PREVIEW_COUNT,
  });
  const { services, loading: servicesLoading } = useServices({ ...cityFilter, limit: PREVIEW_COUNT });

  const previewListings = listings.slice(0, PREVIEW_COUNT);
  const previewJobs = jobs.slice(0, PREVIEW_COUNT);
  const previewHousing = housingListings.slice(0, PREVIEW_COUNT);
  const previewServices = services.slice(0, PREVIEW_COUNT);

  return (
    <main className="min-h-screen bg-neutral-50">
      {/* Герой */}
      <section className="bg-white border-b border-neutral-100">
        <div className="max-w-5xl mx-auto px-4 py-12 md:py-16 text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold text-neutral-900 mb-3">
            🏡 Teremok — русское сообщество
          </h1>
          <p className="text-neutral-500 text-base md:text-lg max-w-xl mx-auto mb-8">
            Объявления, вакансии, жильё и услуги для русскоязычных в США
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href={ROUTES.listings}
              className="min-h-[48px] inline-flex items-center px-6 py-3 bg-primary-600 text-white font-semibold rounded-full hover:bg-primary-700 transition-colors text-sm"
            >
              📋 Объявления
            </Link>
            <Link
              href="/jobs"
              className="min-h-[48px] inline-flex items-center px-6 py-3 bg-white border border-neutral-200 text-neutral-800 font-semibold rounded-full hover:border-primary-300 hover:text-primary-600 transition-colors text-sm"
            >
              💼 Вакансии
            </Link>
            <Link
              href="/housing"
              className="min-h-[48px] inline-flex items-center px-6 py-3 bg-white border border-neutral-200 text-neutral-800 font-semibold rounded-full hover:border-primary-300 hover:text-primary-600 transition-colors text-sm"
            >
              🏠 Жильё
            </Link>
            <Link
              href="/services"
              className="min-h-[48px] inline-flex items-center px-6 py-3 bg-white border border-neutral-200 text-neutral-800 font-semibold rounded-full hover:border-primary-300 hover:text-primary-600 transition-colors text-sm"
            >
              🛠 Услуги
            </Link>
            <Link
              href={ROUTES.newListing}
              className="min-h-[48px] inline-flex items-center px-6 py-3 bg-neutral-900 text-white font-semibold rounded-full hover:bg-neutral-800 transition-colors text-sm"
            >
              + Подать объявление
            </Link>
          </div>
        </div>
      </section>

      {/* Секции */}
      <div className="max-w-5xl mx-auto px-4 py-10">
        {/* Объявления */}
        <HomeSection
          title="Объявления"
          icon="📋"
          href={ROUTES.listings}
          loading={listingsLoading}
          isEmpty={!listingsLoading && previewListings.length === 0}
        >
          {previewListings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} className="min-w-[260px] md:min-w-0 snap-start" />
          ))}
        </HomeSection>

        {/* Вакансии */}
        <HomeSection
          title="Вакансии"
          icon="💼"
          href="/jobs"
          loading={jobsLoading}
          isEmpty={!jobsLoading && previewJobs.length === 0}
        >
          {previewJobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </HomeSection>

        {/* Жильё */}
        <HomeSection
          title="Жильё"
          icon="🏠"
          href="/housing"
          loading={housingLoading}
          isEmpty={!housingLoading && previewHousing.length === 0}
        >
          {previewHousing.map((housing) => (
            <HousingCard key={housing.id} housing={housing} />
          ))}
        </HomeSection>

        {/* Услуги */}
        <HomeSection
          title="Услуги"
          icon="🛠"
          href="/services"
          loading={servicesLoading}
          isEmpty={!servicesLoading && previewServices.length === 0}
        >
          {previewServices.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </HomeSection>
      </div>
    </main>
  );
}
