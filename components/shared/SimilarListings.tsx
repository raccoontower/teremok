'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { formatDate } from '@/lib/utils/formatDate';

interface SimilarItem {
  id: string;
  title: string;
  price?: number;
  priceType?: string;
  createdAt?: string;
  cityId?: string;
  category?: string;
  categoryId?: string;
}

interface SimilarListingsProps {
  collection: 'listings' | 'jobs' | 'housing' | 'services';
  currentId: string;
  cityId?: string;
  categoryId?: string;
  category?: string;
}

const ROUTE_MAP: Record<string, string> = {
  listings: '/listings',
  jobs: '/jobs',
  housing: '/housing',
  services: '/services',
};

const LABEL_MAP: Record<string, string> = {
  listings: 'Похожие объявления',
  jobs: 'Похожие вакансии',
  housing: 'Похожее жильё',
  services: 'Похожие услуги',
};

export function SimilarListings({ collection, currentId, cityId, categoryId, category }: SimilarListingsProps) {
  const [items, setItems] = useState<SimilarItem[]>([]);

  useEffect(() => {
    const params = new URLSearchParams({ limit: '7' });
    if (cityId) params.set('cityId', cityId);
    if (categoryId) params.set('categoryId', categoryId);
    if (category) params.set('category', category);

    fetch(`/api/${collection}?${params}`)
      .then((r) => r.json())
      .then((d: Record<string, SimilarItem[]>) => {
        const key = collection === 'listings' ? 'listings' : collection === 'housing' ? 'listings' : collection;
        const all: SimilarItem[] = d[key] ?? d.listings ?? d.jobs ?? d.services ?? [];
        setItems(all.filter((i) => i.id !== currentId).slice(0, 4));
      })
      .catch(() => {});
  }, [collection, currentId, cityId, categoryId, category]);

  if (items.length === 0) return null;

  const base = ROUTE_MAP[collection];
  const label = LABEL_MAP[collection];

  return (
    <div className="mt-8">
      <h2 className="text-lg font-bold text-neutral-900 mb-3">{label}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {items.map((item) => (
          <Link
            key={item.id}
            href={`${base}/${item.id}`}
            className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-shadow"
          >
            <p className="font-semibold text-neutral-900 text-sm line-clamp-2">{item.title}</p>
            <div className="flex items-center gap-2 mt-1.5 text-xs text-neutral-500">
              {item.price && <span>${item.price}</span>}
              {item.createdAt && <span>{formatDate(item.createdAt)}</span>}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
