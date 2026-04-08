'use client';

import Link from 'next/link';
import type { Housing } from '@/types';
import { PROPERTY_TYPE_LABELS } from '@/types';
import { formatDateShort } from '@/lib/utils/formatDate';
import { cn } from '@/lib/utils/cn';

interface HousingCardProps {
  housing: Housing;
  className?: string;
}

const BEDROOMS_LABELS: Record<number, string> = {
  0: 'Студия',
  1: '1 спальня',
  2: '2 спальни',
  3: '3 спальни',
  4: '4+ спальни',
};

export function HousingCard({ housing, className }: HousingCardProps) {
  const { id, title, listingType, propertyType, bedrooms, price, cityId, createdAt } = housing;

  const priceText = listingType === 'rent'
    ? `$${price.toLocaleString('ru-RU')}/мес`
    : `$${price.toLocaleString('ru-RU')}`;

  const formattedDate = createdAt ? formatDateShort(createdAt) : '';

  return (
    <Link
      href={`/housing/${id}`}
      className={cn(
        'group block bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden min-w-[260px] md:min-w-0 snap-start',
        className
      )}
    >
      {/* Зелёная/синяя полоска */}
      <div className={cn('h-1', listingType === 'rent' ? 'bg-emerald-500' : 'bg-primary-600')} />

      <div className="p-4 space-y-2">
        {/* Тип недвижимости + тип сделки */}
        <div className="flex items-center gap-2">
          <span className="inline-block text-xs font-medium text-neutral-600 bg-neutral-100 px-2 py-0.5 rounded-full">
            {PROPERTY_TYPE_LABELS[propertyType]}
          </span>
          <span className={cn(
            'inline-block text-xs font-medium px-2 py-0.5 rounded-full',
            listingType === 'rent'
              ? 'text-emerald-700 bg-emerald-50'
              : 'text-primary-700 bg-primary-50'
          )}>
            {listingType === 'rent' ? 'Аренда' : 'Продажа'}
          </span>
        </div>

        {/* Заголовок */}
        <p className="text-base font-semibold text-slate-900 line-clamp-2">
          {title}
        </p>

        {/* Цена */}
        <p className="text-base font-bold text-primary-600">{priceText}</p>

        {/* Спальни */}
        <p className="text-sm text-slate-500">{BEDROOMS_LABELS[bedrooms] ?? `${bedrooms} спален`}</p>

        {/* Мета: город и дата */}
        <div className="flex items-center justify-between text-sm text-slate-500 pt-1">
          <span className="truncate">📍 {cityId}</span>
          {formattedDate && <span className="shrink-0 ml-2">{formattedDate}</span>}
        </div>
      </div>
    </Link>
  );
}
