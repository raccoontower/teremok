import Link from 'next/link';
import Image from 'next/image';
import type { Service } from '@/types';
import { SERVICE_CATEGORY_LABELS, SERVICE_AREA_LABELS } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { formatDateShort } from '@/lib/utils/formatDate';
import { cn } from '@/lib/utils/cn';

interface ServiceCardProps {
  service: Service;
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

/**
 * Форматирует цену услуги для отображения.
 */
function formatServicePrice(service: Service): string {
  if (service.priceType === 'negotiable') return 'Договорная';
  if (!service.price) return 'Цена не указана';
  if (service.priceType === 'hourly') return `$${service.price}/час`;
  return `$${service.price.toLocaleString()}`;
}

export function ServiceCard({ service, className }: ServiceCardProps) {
  const { id, title, category, photos, cityId, experience, authorName, isPremium, createdAt } = service;
  const formattedPrice = formatServicePrice(service);
  const formattedDate = createdAt ? formatDateShort(createdAt) : '';

  // Первое фото (аватар исполнителя или фото работы)
  const coverPhoto = photos && photos.length > 0 ? photos[0] : null;

  return (
    <Link
      href={`/services/${id}`}
      className={cn(
        'group block bg-white rounded-[16px] overflow-hidden',
        'shadow-card hover:shadow-hover hover:-translate-y-0.5',
        'transition-all duration-200',
        isPremium && 'ring-1 ring-blue-100',
        className
      )}
    >
      <div className="p-4">
        {/* Верхняя строка: аватар + имя автора */}
        <div className="flex items-center gap-3 mb-3">
          {coverPhoto ? (
            <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 bg-gray-100">
              <Image src={coverPhoto} alt={authorName} width={40} height={40} className="object-cover w-full h-full" />
            </div>
          ) : (
            // Аватар с первой буквой имени
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
              <span className="text-blue-700 font-bold text-sm">{authorName[0]?.toUpperCase()}</span>
            </div>
          )}
          <div className="min-w-0">
            <p className="text-sm font-medium text-neutral-800 truncate">{authorName}</p>
            {experience !== undefined && experience > 0 && (
              <p className="text-xs text-neutral-500">{experience} {experience === 1 ? 'год опыта' : experience < 5 ? 'года опыта' : 'лет опыта'}</p>
            )}
          </div>
          {isPremium && <Badge variant="warning" className="ml-auto shrink-0">⭐</Badge>}
        </div>

        {/* Бейджи: категория и зона */}
        <div className="flex items-center gap-2 flex-wrap mb-2">
          <Badge variant="info">{SERVICE_CATEGORY_LABELS[category]}</Badge>
          <Badge variant="default">{SERVICE_AREA_LABELS[service.serviceArea]}</Badge>
        </div>

        {/* Заголовок */}
        <p className="text-sm font-semibold text-neutral-900 line-clamp-2 leading-snug">
          {title}
        </p>

        {/* Цена */}
        <p className={cn(
          'mt-1.5 text-sm font-medium',
          service.priceType === 'negotiable' ? 'text-neutral-500' : 'text-green-700'
        )}>
          {formattedPrice}
        </p>

        {/* Мета */}
        <div className="flex items-center justify-between mt-3 text-xs text-neutral-500">
          <span className="flex items-center gap-1 truncate">
            <PinIcon />
            <span className="truncate">{cityId}</span>
          </span>
          {formattedDate && <span className="shrink-0 ml-2">{formattedDate}</span>}
        </div>
      </div>
    </Link>
  );
}
