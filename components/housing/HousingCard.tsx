import Link from 'next/link';
import Image from 'next/image';
import type { Housing } from '@/types';
import { PROPERTY_TYPE_LABELS } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { formatDateShort } from '@/lib/utils/formatDate';
import { cn } from '@/lib/utils/cn';

interface HousingCardProps {
  listing: Housing;
  className?: string;
}

// Иконка геолокации
function PinIcon() {
  return (
    <svg className="w-3 h-3 shrink-0 text-neutral-400" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M8 1.5C5.515 1.5 3.5 3.515 3.5 6c0 3.75 4.5 8.5 4.5 8.5S12.5 9.75 12.5 6c0-2.485-2.015-4.5-4.5-4.5zm0 6a1.5 1.5 0 110-3 1.5 1.5 0 010 3z" fill="currentColor" />
    </svg>
  );
}

// Плейсхолдер без фото
function HousingPlaceholder() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-neutral-50">
      <span className="text-4xl">🏠</span>
      <span className="text-xs text-neutral-400 font-medium">Нет фото</span>
    </div>
  );
}

export function HousingCard({ listing, className }: HousingCardProps) {
  const { id, title, photos, propertyType, listingType, bedrooms, price, cityId, neighborhood, createdAt, isPremium } = listing;
  const formattedDate = createdAt ? formatDateShort(createdAt) : '';

  // Форматируем цену в зависимости от типа объявления
  const formattedPrice = `$${price.toLocaleString()}${listingType === 'rent' ? '/мес' : ''}`;

  return (
    <Link
      href={`/housing/${id}`}
      className={cn(
        'group block bg-white rounded-[16px] overflow-hidden',
        'shadow-card hover:shadow-hover hover:-translate-y-0.5',
        'transition-all duration-200',
        isPremium && 'ring-1 ring-blue-100',
        className
      )}
    >
      {/* Фото — aspect 4:3 */}
      <div className="aspect-[4/3] bg-neutral-50 relative overflow-hidden rounded-t-[16px]">
        {photos && photos.length > 0 ? (
          <Image
            src={photos[0]}
            alt={title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <HousingPlaceholder />
        )}

        {/* Бейдж: Аренда / Продажа */}
        <div className="absolute top-2 left-2">
          <Badge variant={listingType === 'rent' ? 'info' : 'success'}>
            {listingType === 'rent' ? 'Аренда' : 'Продажа'}
          </Badge>
        </div>

        {/* Premium бейдж */}
        {isPremium && (
          <div className="absolute top-2 right-2">
            <Badge variant="warning">⭐</Badge>
          </div>
        )}

        {/* Счётчик фото */}
        {photos && photos.length > 1 && (
          <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-0.5 rounded-full backdrop-blur-sm">
            📷 {photos.length}
          </div>
        )}
      </div>

      {/* Контент */}
      <div className="p-3.5">
        {/* Цена */}
        <p className="text-lg font-bold text-primary-600 leading-tight">{formattedPrice}</p>

        {/* Тип недвижимости и комнаты */}
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          <span className="text-sm text-neutral-700 font-medium">{PROPERTY_TYPE_LABELS[propertyType]}</span>
          {bedrooms > 0 && (
            <span className="text-sm text-neutral-500">· {bedrooms} спальн.</span>
          )}
          {bedrooms === 0 && <span className="text-sm text-neutral-500">· Студия</span>}
        </div>

        {/* Заголовок */}
        <p className="text-sm text-neutral-700 mt-1 line-clamp-1">{title}</p>

        {/* Мета */}
        <div className="flex items-center justify-between mt-2.5 text-xs text-neutral-500">
          <span className="flex items-center gap-1 truncate">
            <PinIcon />
            <span className="truncate">{neighborhood ? `${neighborhood}, ${cityId}` : cityId}</span>
          </span>
          {formattedDate && (
            <span className="shrink-0 ml-2">{formattedDate}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
