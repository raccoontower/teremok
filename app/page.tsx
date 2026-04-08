'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
import { getCategories } from '@/lib/firebase/firestore';
import { ROUTES } from '@/lib/constants/routes';
import type { Category } from '@/types';

const PREVIEW_COUNT = 3;

const CATEGORY_ICONS: Record<string, string> = {
  electronics: '📱',
  cars: '🚗',
  furniture: '🛋️',
  clothing: '👗',
  'real-estate': '🏠',
  services: '🔧',
  jobs: '💼',
  other: '📦',
};

function getCategoryIcon(slug: string): string {
  return CATEGORY_ICONS[slug] ?? '📦';
}

export default function HomePage() {
  const router = useRouter();
  const { selectedCity } = useCityContext();
  const [searchQuery, setSearchQuery] = useState('');
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
    getCategories()
      .then((cats) => setCategories(cats.slice(0, 8)))
      .catch(() => setCategories([]))
      .finally(() => setCategoriesLoading(false));
  }, []);

  const handleSearch = () => {
    const q = searchQuery.trim();
    if (q) {
      router.push(`/search?q=${encodeURIComponent(q)}`);
    } else {
      router.push('/search');
    }
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSearch();
  };

  return (
    <main className="min-h-screen bg-neutral-50">

      {/* ===== СЕКЦИЯ 1: Герой с поиском ===== */}
      <section className="bg-white border-b border-neutral-100">
        <div className="max-w-3xl mx-auto px-4 py-12 md:py-16 text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold text-neutral-900 mb-2">
            🏡 Teremok
          </h1>
          <p className="text-neutral-500 text-base md:text-lg mb-8">
            Объявления, вакансии, жильё и услуги для русскоязычных в США
          </p>

          {/* Большой поиск */}
          <div className="flex gap-2 max-w-[600px] mx-auto mb-6">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder="Поиск работы, жилья, услуг..."
              className="flex-1 h-12 rounded-full border border-neutral-200 px-5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent shadow-sm"
            />
            <button
              onClick={handleSearch}
              className="h-12 px-6 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-full transition-colors text-sm shadow-sm whitespace-nowrap"
            >
              🔍 Найти
            </button>
          </div>

          {/* Быстрые категории */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Link
              href={ROUTES.listings}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-neutral-200 text-sm font-medium text-neutral-700 hover:border-primary-300 hover:text-primary-600 hover:bg-primary-50 transition-colors"
            >
              📦 Объявления
            </Link>
            <Link
              href={ROUTES.jobs}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-neutral-200 text-sm font-medium text-neutral-700 hover:border-primary-300 hover:text-primary-600 hover:bg-primary-50 transition-colors"
            >
              💼 Работа
            </Link>
            <Link
              href={ROUTES.housing}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-neutral-200 text-sm font-medium text-neutral-700 hover:border-primary-300 hover:text-primary-600 hover:bg-primary-50 transition-colors"
            >
              🏠 Жильё
            </Link>
            <Link
              href={ROUTES.services}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-neutral-200 text-sm font-medium text-neutral-700 hover:border-primary-300 hover:text-primary-600 hover:bg-primary-50 transition-colors"
            >
              🔧 Услуги
            </Link>
            <Link
              href={ROUTES.newListing}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-neutral-900 text-white text-sm font-medium hover:bg-neutral-800 transition-colors"
            >
              + Подать объявление
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
