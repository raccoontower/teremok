'use client';

import { useState, useEffect } from 'react';
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
import type { Category } from '@/types';

const PREVIEW_COUNT = 3;

const CATEGORY_ICONS: Record<string, string> = {
  // Слаги из Firestore
  cars: '🚗',
  clothing: '👗',
  electronics: '📱',
  food: '🍕',
  furniture: '🛋️',
  jobs: '💼',
  kids: '🧸',
  other: '📦',
  'real-estate': '🏠',
  services: '🔧',
  // Дополнительные
  sports: '⚽',
  pets: '🐾',
  tools: '🔨',
  books: '📚',
  music: '🎸',
  jewelry: '💎',
  health: '💊',
  garden: '🌱',
  computers: '💻',
  beauty: '💄',
  travel: '✈️',
  legal: '⚖️',
  finance: '💰',
  medicine: '🩺',
  repair: '🔧',
  cleaning: '🧹',
  events: '🎉',
  photo: '📷',
};

function getCategoryIcon(slug: string): string {
  return CATEGORY_ICONS[slug] ?? '📦';
}

export default function HomePage() {
  const { selectedCity } = useCityContext();
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

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

  useEffect(() => {
    fetch('/api/categories')
      .then((r) => r.json())
      .then((d: { categories?: Category[] }) => setCategories((d.categories ?? []).slice(0, 8)))
      .catch(() => setCategories([]))
      .finally(() => setCategoriesLoading(false));
  }, []);

    return (
    <main className="min-h-screen bg-neutral-50">

      {/* ===== СЕКЦИЯ 1: Hero-баннер ===== */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-700 text-white">
        <div className="max-w-3xl mx-auto px-4 py-10 md:py-16 text-center">
          {/* Бейдж */}
          <span className="inline-block bg-white/15 text-white text-xs font-semibold px-3 py-1 rounded-full mb-4">
            🇺🇸 Доска объявлений для русскоязычных в США
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold mb-3 leading-tight">
            Ваш дом в США
          </h1>
          <p className="text-primary-100 text-base md:text-lg mb-8 max-w-xl mx-auto">
            Работа, жильё, услуги и товары — всё на русском языке
          </p>
          {/* Главный CTA */}
          <Link
            href={ROUTES.listings}
            className="inline-flex items-center gap-2 h-12 px-8 bg-white text-primary-700 font-bold rounded-full text-sm hover:bg-primary-50 transition-colors shadow-lg mb-4"
          >
            🔍 Найти объявления
          </Link>
          {/* Вторичные CTA */}
          <div className="flex flex-wrap justify-center gap-2 mt-1">
            <Link
              href={ROUTES.newListing}
              className="inline-flex items-center gap-1.5 h-9 px-4 border border-white/40 text-white font-medium rounded-full text-sm hover:bg-white/10 transition-colors"
            >
              + Подать объявление
            </Link>
            <Link
              href={ROUTES.jobs}
              className="inline-flex items-center gap-1.5 h-9 px-4 border border-white/40 text-white font-medium rounded-full text-sm hover:bg-white/10 transition-colors"
            >
              💼 Работа
            </Link>
            <Link
              href={ROUTES.housing}
              className="inline-flex items-center gap-1.5 h-9 px-4 border border-white/40 text-white font-medium rounded-full text-sm hover:bg-white/10 transition-colors"
            >
              🏠 Жильё
            </Link>
            <Link
              href={ROUTES.services}
              className="inline-flex items-center gap-1.5 h-9 px-4 border border-white/40 text-white font-medium rounded-full text-sm hover:bg-white/10 transition-colors"
            >
              🔧 Услуги
            </Link>
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 py-10 space-y-12">

        {/* ===== СЕКЦИЯ 2: Сетка категорий ===== */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-neutral-900">
              📋 Категории объявлений
            </h2>
            <Link
              href={ROUTES.listings}
              className="text-sm text-primary-600 hover:underline font-medium"
            >
              Все объявления →
            </Link>
          </div>

          {categoriesLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-20 bg-neutral-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : categories.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {categories.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`${ROUTES.listings}?category=${cat.slug}`}
                  className="flex flex-col items-center justify-center gap-1.5 p-4 bg-white rounded-xl border border-neutral-100 hover:border-primary-200 hover:shadow-sm transition-all text-center group"
                >
                  <span className="text-2xl">{getCategoryIcon(cat.slug)}</span>
                  <span className="text-xs font-medium text-neutral-700 group-hover:text-primary-600 transition-colors leading-tight">
                    {cat.name}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            /* Fallback: статические категории если Firestore пуст */
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { slug: 'electronics', name: 'Электроника' },
                { slug: 'cars', name: 'Автомобили' },
                { slug: 'furniture', name: 'Мебель' },
                { slug: 'clothing', name: 'Одежда' },
                { slug: 'real-estate', name: 'Недвижимость' },
                { slug: 'services', name: 'Услуги' },
                { slug: 'jobs', name: 'Работа' },
                { slug: 'other', name: 'Другое' },
              ].map((cat) => (
                <Link
                  key={cat.slug}
                  href={`${ROUTES.listings}?category=${cat.slug}`}
                  className="flex flex-col items-center justify-center gap-1.5 p-4 bg-white rounded-xl border border-neutral-100 hover:border-primary-200 hover:shadow-sm transition-all text-center group"
                >
                  <span className="text-2xl">{getCategoryIcon(cat.slug)}</span>
                  <span className="text-xs font-medium text-neutral-700 group-hover:text-primary-600 transition-colors">
                    {cat.name}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* ===== СЕКЦИЯ 3: Последние объявления ===== */}
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

        {/* ===== Вакансии ===== */}
        <HomeSection
          title="Вакансии"
          icon="💼"
          href={ROUTES.jobs}
          loading={jobsLoading}
          isEmpty={!jobsLoading && previewJobs.length === 0}
        >
          {previewJobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </HomeSection>

        {/* ===== Жильё ===== */}
        <HomeSection
          title="Жильё"
          icon="🏠"
          href={ROUTES.housing}
          loading={housingLoading}
          isEmpty={!housingLoading && previewHousing.length === 0}
        >
          {previewHousing.map((housing) => (
            <HousingCard key={housing.id} housing={housing} />
          ))}
        </HomeSection>

        {/* ===== Услуги ===== */}
        <HomeSection
          title="Услуги"
          icon="🛠"
          href={ROUTES.services}
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
