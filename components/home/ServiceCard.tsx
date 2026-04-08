'use client';

import Link from 'next/link';
import type { Service } from '@/types';
import { SERVICE_CATEGORY_LABELS, SERVICE_AREA_LABELS } from '@/types';
import { formatDateShort } from '@/lib/utils/formatDate';
import { cn } from '@/lib/utils/cn';

interface ServiceCardProps {
  service: Service;
  className?: string;
}

export function ServiceCard({ service, className }: ServiceCardProps) {
  const { id, title, category, priceType, price, serviceArea, cityId, createdAt } = service;

  const priceText =
    priceType === 'negotiable'
      ? 'По договорённости'
      : price
      ? priceType === 'hourly'
        ? `$${price.toLocaleString('ru-RU')}/час`
        : `$${price.toLocaleString('ru-RU')}`
      : 'По договорённости';

  const locationText =
    serviceArea === 'remote'
      ? 'Удалённо'
      : serviceArea === 'both'
      ? `${cityId} / Удалённо`
      : cityId;

  const formattedDate = createdAt ? formatDateShort(createdAt) : '';

  return (
    <Link
      href={`/services/${id}`}
      className={cn(
        'group block bg-white rounded-[16px] overflow-hidden min-w-[260px] md:min-w-0 snap-start',
        'shadow-card hover:shadow-hover hover:-translate-y-0.5 transition-all duration-200',
        className
      )}
    >
      {/* Фиолетовая полоска */}
      <div className="h-1 bg-violet-500" />

      <div className="p-4 space-y-2">
        {/* Категория */}
        <span className="inline-block text-xs font-medium text-violet-700 bg-violet-50 px-2 py-0.5 rounded-full">
          {SERVICE_CATEGORY_LABELS[category]}
        </span>

        {/* Заголовок */}
        <p className="text-sm font-semibold text-neutral-900 line-clamp-2 leading-snug">
          {title}
        </p>

        {/* Цена */}
        <p className="text-base font-bold text-primary-600">{priceText}</p>

        {/* Мета: локация и дата */}
        <div className="flex items-center justify-between text-xs text-neutral-400 pt-1">
          <span className="truncate">📍 {locationText}</span>
          {formattedDate && <span className="shrink-0 ml-2">{formattedDate}</span>}
        </div>
      </div>
    </Link>
  );
}
