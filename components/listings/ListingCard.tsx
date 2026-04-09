import Link from 'next/link';
import Image from 'next/image';
import type { Listing } from '@/types';
import { formatPrice } from '@/lib/utils/formatPrice';
import { formatDateShort } from '@/lib/utils/formatDate';
import { getCityName } from '@/lib/utils/cityNames';
import { ROUTES } from '@/lib/constants/routes';
import { cn } from '@/lib/utils/cn';

interface ListingCardProps {
  listing: Listing;
  className?: string;
}

// Иконка геолокации — SVG вместо эмодзи для единообразия и масштабируемости
function PinIcon() {
  return (
    <svg
      className="w-3 h-3 shrink-0 text-neutral-400"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M8 1.5C5.515 1.5 3.5 3.515 3.5 6c0 3.75 4.5 8.5 4.5 8.5S12.5 9.75 12.5 6c0-2.485-2.015-4.5-4.5-4.5zm0 6a1.5 1.5 0 110-3 1.5 1.5 0 010 3z"
        fill="currentColor"
      />
    </svg>
  );
}

// Иконка календаря — для даты публикации
function CalendarIcon() {
  return (
    <svg
      className="w-3 h-3 shrink-0 text-neutral-400"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect x="2" y="3.5" width="12" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M2 6.5h12M5.5 2v3M10.5 2v3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

// Иконка домика — для placeholder карточки без фото
function HouseIcon() {
  return (
    <svg
      className="w-10 h-10 text-neutral-300"
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M6 22L24 6l18 16v20a2 2 0 01-2 2H8a2 2 0 01-2-2V22z"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path
        d="M18 44V28h12v16"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ListingCard({ listing, className }: ListingCardProps) {
  const { id, title, price, priceType, photos, cityId, categoryId, createdAt } = listing;

  const formattedPrice = formatPrice(price, priceType);
  const formattedDate = createdAt ? formatDateShort(createdAt) : '';

  return (
    <Link
      href={ROUTES.listing(id)}
      className={cn(
        'group block bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden',
        className
      )}
    >
      {/* Фото — aspect-ratio 4:3 для единообразия сетки */}
      <div className="aspect-[4/3] bg-neutral-50 relative overflow-hidden rounded-t-[16px]">
        {photos && photos.length > 0 ? (
          <Image
            src={photos[0]}
            alt={title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            // Лёгкий зум при hover — ощущение интерактивности
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          // Красивый placeholder с иконкой домика — не пустой серый блок
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-neutral-50">
            <HouseIcon />
            <span className="text-xs text-neutral-400 font-medium">Нет фото</span>
          </div>
        )}

        {/* Счётчик фото — если больше одного */}
        {photos && photos.length > 1 && (
          <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-0.5 rounded-full backdrop-blur-sm">
            📷 {photos.length}
          </div>
        )}
      </div>

      {/* Контент карточки */}
      <div className="p-3.5">
        {/* Цена — крупнее, цвет зависит от типа */}
        <p
          className={cn(
            'text-lg font-bold leading-tight',
            // Зелёная если бесплатно — сразу привлекает внимание
            priceType === 'free' ? 'text-success-600' : 'text-primary-600'
          )}
        >
          {formattedPrice}
        </p>

        {/* Заголовок */}
        <p className="text-base font-semibold text-slate-900 line-clamp-2 mt-1">
          {title}
        </p>

        {/* Мета: город и дата — с иконками */}
        <div className="flex items-center justify-between mt-2.5 text-sm text-slate-500">
          {/* Город с pin-иконкой */}
          <span className="flex items-center gap-1 truncate">
            <PinIcon />
            <span className="truncate">{getCityName(cityId)}</span>
          </span>

          {/* Дата с иконкой календаря */}
          {formattedDate && (
            <span className="flex items-center gap-1 shrink-0 ml-2">
              <CalendarIcon />
              {formattedDate}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
