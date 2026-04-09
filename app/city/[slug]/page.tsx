import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAdminDb } from '@/lib/firebase/admin';
import { serializeDoc } from '@/lib/firebase/serialize';
import { getCityName, getCityNameLoc, ALL_CITY_SLUGS } from '@/lib/utils/cityNames';
import { formatDate } from '@/lib/utils/formatDate';

interface Props { params: Promise<{ slug: string }> }

export const dynamic = 'force-dynamic'; // env vars недоступны при build

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  if (!ALL_CITY_SLUGS.includes(slug)) return { title: 'Город не найден' };
  const city = getCityNameLoc(slug);
  const cityName = getCityName(slug);
  return {
    title: `Объявления в ${city} — Teremok`,
    description: `Работа, жильё, услуги и товары в ${city}. Бесплатная доска объявлений для русскоязычных в ${cityName}, США.`,
    openGraph: {
      title: `Объявления в ${city} — Teremok`,
      description: `Русскоязычные объявления в ${city}: работа, жильё, услуги.`,
    },
  };
}

export default async function CityPage({ params }: Props) {
  const { slug } = await params;
  if (!ALL_CITY_SLUGS.includes(slug)) notFound();

  const cityLoc = getCityNameLoc(slug);
  const cityName = getCityName(slug);
  const db = getAdminDb();

  const [jobsSnap, housingSnap, servicesSnap, listingsSnap] = await Promise.all([
    db.collection('jobs').where('status', '==', 'active').where('cityId', '==', slug).limit(6).get(),
    db.collection('housing').where('status', '==', 'active').where('cityId', '==', slug).limit(6).get(),
    db.collection('services').where('status', '==', 'active').where('cityId', '==', slug).limit(6).get(),
    db.collection('listings').where('status', '==', 'active').where('cityId', '==', slug).limit(6).get(),
  ]);

  const jobs = jobsSnap.docs.map((d) => serializeDoc({ id: d.id, ...d.data() }));
  const housing = housingSnap.docs.map((d) => serializeDoc({ id: d.id, ...d.data() }));
  const services = servicesSnap.docs.map((d) => serializeDoc({ id: d.id, ...d.data() }));
  const listings = listingsSnap.docs.map((d) => serializeDoc({ id: d.id, ...d.data() }));

  const total = jobs.length + housing.length + services.length + listings.length;

  return (
    <main className="min-h-screen bg-neutral-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-700 text-white py-10 md:py-14">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <p className="text-primary-200 text-sm mb-2">📍 {cityName}, США</p>
          <h1 className="text-3xl md:text-4xl font-extrabold mb-3">
            Объявления в {cityLoc}
          </h1>
          <p className="text-primary-100 text-base mb-6">
            Русскоязычные объявления: работа, жильё, услуги и товары
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href={`/jobs?city=${slug}`} className="h-10 px-5 bg-white text-primary-700 font-semibold rounded-full text-sm inline-flex items-center hover:bg-primary-50 transition-colors">
              💼 Работа в {cityLoc}
            </Link>
            <Link href={`/housing?city=${slug}`} className="h-10 px-5 border border-white/40 text-white font-medium rounded-full text-sm inline-flex items-center hover:bg-white/10 transition-colors">
              🏠 Жильё в {cityLoc}
            </Link>
            <Link href={`/services?city=${slug}`} className="h-10 px-5 border border-white/40 text-white font-medium rounded-full text-sm inline-flex items-center hover:bg-white/10 transition-colors">
              🔧 Услуги в {cityLoc}
            </Link>
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 py-10 space-y-10">
        {total === 0 && (
          <div className="text-center py-16 text-neutral-500">
            <p className="text-5xl mb-4">🏙️</p>
            <p className="text-lg font-semibold text-neutral-700 mb-2">Пока нет объявлений в {cityLoc}</p>
            <p className="text-sm mb-6">Станьте первым — разместите объявление бесплатно</p>
            <Link href="/listings/new" className="inline-flex h-11 px-6 bg-primary-600 text-white font-semibold rounded-full text-sm items-center hover:bg-primary-700 transition-colors">
              + Подать объявление
            </Link>
          </div>
        )}

        {jobs.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-neutral-900">💼 Работа в {cityLoc}</h2>
              <Link href={`/jobs?city=${slug}`} className="text-sm text-primary-600 hover:underline">Все вакансии →</Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {jobs.map((j) => (
                <Link key={j.id as string} href={`/jobs/${j.id as string}`} className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-shadow">
                  <p className="font-semibold text-neutral-900 text-sm line-clamp-1">{j.title as string}</p>
                  <p className="text-xs text-neutral-500 mt-1">{j.category as string} · {formatDate(j.createdAt as string)}</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {housing.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-neutral-900">🏠 Жильё в {cityLoc}</h2>
              <Link href={`/housing?city=${slug}`} className="text-sm text-primary-600 hover:underline">Все объявления →</Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {housing.map((h) => (
                <Link key={h.id as string} href={`/housing/${h.id as string}`} className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-shadow">
                  <p className="font-semibold text-neutral-900 text-sm line-clamp-1">{h.title as string}</p>
                  <p className="text-xs text-neutral-500 mt-1">{h.price ? `$${h.price as number}/мес` : ''} · {formatDate(h.createdAt as string)}</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {services.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-neutral-900">🔧 Услуги в {cityLoc}</h2>
              <Link href={`/services?city=${slug}`} className="text-sm text-primary-600 hover:underline">Все услуги →</Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {services.map((s) => (
                <Link key={s.id as string} href={`/services/${s.id as string}`} className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-shadow">
                  <p className="font-semibold text-neutral-900 text-sm line-clamp-1">{s.title as string}</p>
                  <p className="text-xs text-neutral-500 mt-1">{s.category as string} · {formatDate(s.createdAt as string)}</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {listings.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-neutral-900">🛒 Товары в {cityLoc}</h2>
              <Link href={`/listings?city=${slug}`} className="text-sm text-primary-600 hover:underline">Все товары →</Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {listings.map((l) => (
                <Link key={l.id as string} href={`/listings/${l.id as string}`} className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-shadow">
                  <p className="font-semibold text-neutral-900 text-sm line-clamp-1">{l.title as string}</p>
                  <p className="text-xs text-neutral-500 mt-1">{l.price ? `$${l.price as number}` : 'Договорная'} · {formatDate(l.createdAt as string)}</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Другие города */}
        <section>
          <h2 className="text-lg font-bold text-neutral-900 mb-3">Другие города</h2>
          <div className="flex flex-wrap gap-2">
            {ALL_CITY_SLUGS.filter((s) => s !== slug).map((s) => (
              <Link key={s} href={`/city/${s}`} className="inline-flex h-9 px-4 bg-white border border-slate-200 text-neutral-700 rounded-full text-sm items-center hover:border-primary-400 hover:text-primary-600 transition-colors">
                {getCityName(s)}
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
