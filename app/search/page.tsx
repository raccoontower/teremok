'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import type { Listing, Job, Housing, Service } from '@/types';

type ResultType = 'listing' | 'job' | 'housing' | 'service';

interface SearchResult {
  id: string;
  type: ResultType;
  title: string;
  description: string;
  cityId: string;
  createdAt: { seconds: number } | null;
  href: string;
}

const TYPE_LABELS: Record<ResultType, string> = {
  listing: 'Объявления',
  job: 'Работа',
  housing: 'Жильё',
  service: 'Услуги',
};

const TYPE_COLORS: Record<ResultType, string> = {
  listing: 'bg-blue-100 text-blue-700',
  job: 'bg-green-100 text-green-700',
  housing: 'bg-orange-100 text-orange-700',
  service: 'bg-purple-100 text-purple-700',
};

const TYPE_ICONS: Record<ResultType, string> = {
  listing: '📦',
  job: '💼',
  housing: '🏠',
  service: '🔧',
};

function formatDate(createdAt: { seconds: number } | null): string {
  if (!createdAt) return '';
  try {
    return new Date(createdAt.seconds * 1000).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
    });
  } catch {
    return '';
  }
}

function SkeletonRow() {
  return (
    <div className="bg-white rounded-xl border border-neutral-100 p-4 animate-pulse">
      <div className="flex items-start gap-3">
        <div className="h-6 w-20 bg-neutral-200 rounded-full" />
        <div className="flex-1 space-y-2">
          <div className="h-5 bg-neutral-200 rounded w-3/4" />
          <div className="h-4 bg-neutral-100 rounded w-full" />
          <div className="h-3 bg-neutral-100 rounded w-1/3" />
        </div>
      </div>
    </div>
  );
}

function SearchPageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const q = searchParams.get('q') ?? '';

  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState(q);

  useEffect(() => {
    setInputValue(q);
  }, [q]);

  useEffect(() => {
    if (!q) {
      setResults([]);
      return;
    }

    const search = async () => {
      setLoading(true);
      try {
        const lower = q.toLowerCase();

        const [listingsData, jobsData, housingData, servicesData] = await Promise.all([
          fetch('/api/listings?limit=100').then(r => r.json()).catch(() => ({ listings: [] })),
          fetch('/api/jobs?limit=100').then(r => r.json()).catch(() => ({ jobs: [] })),
          fetch('/api/housing?limit=100').then(r => r.json()).catch(() => ({ listings: [] })),
          fetch('/api/services?limit=100').then(r => r.json()).catch(() => ({ services: [] })),
        ]);
        const listingsRes = { listings: (listingsData.listings ?? []) as Listing[] };
        const jobsRes = { jobs: (jobsData.jobs ?? []) as Job[] };
        const housingRes = { listings: (housingData.listings ?? []) as Housing[] };
        const servicesRes = { services: (servicesData.services ?? []) as Service[] };

        const matched: SearchResult[] = [];

        for (const l of listingsRes.listings) {
          if (
            l.title.toLowerCase().includes(lower) ||
            l.description.toLowerCase().includes(lower)
          ) {
            matched.push({
              id: l.id,
              type: 'listing',
              title: l.title,
              description: l.description,
              cityId: l.cityId,
              createdAt: l.createdAt as unknown as { seconds: number } | null,
              href: `/listings/${l.id}`,
            });
          }
        }

        for (const j of jobsRes.jobs) {
          if (
            j.title.toLowerCase().includes(lower) ||
            j.description.toLowerCase().includes(lower)
          ) {
            matched.push({
              id: j.id,
              type: 'job',
              title: j.title,
              description: j.description,
              cityId: j.cityId,
              createdAt: j.createdAt as unknown as { seconds: number } | null,
              href: `/jobs/${j.id}`,
            });
          }
        }

        for (const h of housingRes.listings) {
          if (
            h.title.toLowerCase().includes(lower) ||
            h.description.toLowerCase().includes(lower)
          ) {
            matched.push({
              id: h.id,
              type: 'housing',
              title: h.title,
              description: h.description,
              cityId: h.cityId,
              createdAt: h.createdAt as unknown as { seconds: number } | null,
              href: `/housing/${h.id}`,
            });
          }
        }

        for (const s of servicesRes.services) {
          if (
            s.title.toLowerCase().includes(lower) ||
            s.description.toLowerCase().includes(lower)
          ) {
            matched.push({
              id: s.id,
              type: 'service',
              title: s.title,
              description: s.description,
              cityId: s.cityId,
              createdAt: s.createdAt as unknown as { seconds: number } | null,
              href: `/services/${s.id}`,
            });
          }
        }

        setResults(matched);
      } catch (err) {
        console.error('Search error:', err);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    search();
  }, [q]);

  const handleSearch = () => {
    const trimmed = inputValue.trim();
    if (trimmed) {
      router.push(`/search?q=${encodeURIComponent(trimmed)}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSearch();
  };

  return (
    <main className="min-h-screen bg-neutral-50">
      {/* Hero */}
      <section className="bg-white border-b border-neutral-100">
        <div className="max-w-3xl mx-auto px-4 py-10 md:py-14">
          <h1 className="text-2xl md:text-3xl font-extrabold text-neutral-900 mb-2">
            {q ? (
              <>Результаты поиска: <span className="text-primary-600">«{q}»</span></>
            ) : (
              'Поиск по объявлениям'
            )}
          </h1>
          {!loading && q && (
            <p className="text-neutral-500 text-sm mb-6">
              Найдено: {results.length} результатов
            </p>
          )}

          {/* Search bar */}
          <div className="flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Поиск работы, жилья, услуг..."
              className="flex-1 h-12 rounded-full border border-neutral-200 px-5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <button
              onClick={handleSearch}
              className="h-12 px-6 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-full transition-colors text-sm"
            >
              🔍 Найти
            </button>
          </div>
        </div>
      </section>

      {/* Results */}
      <div className="max-w-3xl mx-auto px-4 py-8">
        {loading ? (
          <div className="space-y-3">
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
          </div>
        ) : !q ? (
          <div className="text-center py-16 text-neutral-400">
            <p className="text-5xl mb-4">🔍</p>
            <p className="text-lg font-medium">Введите запрос для поиска</p>
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-16 text-neutral-400">
            <p className="text-5xl mb-4">😔</p>
            <p className="text-lg font-medium text-neutral-700">
              По запросу «{q}» ничего не найдено.
            </p>
            <p className="text-sm mt-2">Попробуйте другой запрос.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {results.map((result) => (
              <Link
                key={`${result.type}-${result.id}`}
                href={result.href}
                className="block bg-white rounded-xl border border-neutral-100 p-4 hover:border-primary-200 hover:shadow-sm transition-all group"
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ${TYPE_COLORS[result.type]}`}
                  >
                    {TYPE_ICONS[result.type]} {TYPE_LABELS[result.type]}
                  </span>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-neutral-900 text-sm group-hover:text-primary-600 transition-colors truncate">
                      {result.title}
                    </h3>
                    <p className="text-neutral-500 text-xs mt-1 line-clamp-2">
                      {result.description}
                    </p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-neutral-400">
                      {result.cityId && (
                        <span>📍 {result.cityId}</span>
                      )}
                      {result.createdAt && (
                        <span>{formatDate(result.createdAt)}</span>
                      )}
                    </div>
                  </div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-neutral-300 group-hover:text-primary-400 flex-shrink-0 mt-0.5 transition-colors"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-neutral-50">
        <div className="max-w-3xl mx-auto px-4 py-10">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-neutral-200 rounded w-64" />
            <div className="h-12 bg-neutral-200 rounded-full" />
          </div>
        </div>
      </main>
    }>
      <SearchPageInner />
    </Suspense>
  );
}
