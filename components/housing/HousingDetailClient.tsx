'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useHousingListing } from '@/hooks/useHousingListing';
import type { Housing } from '@/types';
import { Container } from '@/components/layout/Container';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { FullScreenSpinner } from '@/components/ui/Spinner';
import { PROPERTY_TYPE_LABELS } from '@/types';
import { getCityName } from '@/lib/utils/cityNames';
import { formatDate } from '@/lib/utils/formatDate';
import { ContactButtons } from '@/components/shared/ContactButtons';
import { SimilarListings } from '@/components/shared/SimilarListings';
import { ReportButton } from '@/components/shared/ReportButton';
import { ShareButton } from '@/components/shared/ShareButton';

interface HousingDetailClientProps {
  id: string;
  initialListing?: Housing | null;
}

/**
 * Детальная страница объявления о жилье.
 */
export function HousingDetailClient({ id, initialListing }: HousingDetailClientProps) {
  const { listing: fetched, loading, error } = useHousingListing(initialListing ? '' : id);
  const listing = initialListing ?? fetched;
  const [activePhoto, setActivePhoto] = useState(0);

  if (!initialListing && loading) return <FullScreenSpinner />;

  if ((!initialListing && error) || !listing) {
    return (
      <Container className="py-16 text-center">
        <p className="text-4xl mb-3">🔍</p>
        <p className="text-lg font-medium text-neutral-700">{error || 'Объявление не найдено'}</p>
        <Link href="/housing" className="mt-4 inline-block">
          <Button variant="secondary">← Все объявления</Button>
        </Link>
      </Container>
    );
  }

  const contact = listing?.contact ?? {};
  const formattedPrice = `$${listing.price.toLocaleString()}${listing.listingType === 'rent' ? '/мес' : ''}`;

  return (
    <Container className="py-6 max-w-2xl">
      {/* Назад */}
      <Link href="/housing" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 mb-5 transition-colors">
        ← Все объявления
      </Link>

      <div className="bg-white rounded-[16px] shadow-card overflow-hidden">
        {/* Фото-галерея */}
        {listing.photos && listing.photos.length > 0 && (
          <div>
            <div className="aspect-[4/3] relative bg-neutral-100">
              <Image
                src={listing.photos[activePhoto]}
                alt={listing.title}
                fill
                className="object-cover"
              />
            </div>
            {listing.photos.length > 1 && (
              <div className="flex gap-2 p-3 overflow-x-auto">
                {listing.photos.map((photo, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActivePhoto(idx)}
                    className={`shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                      idx === activePhoto ? 'border-blue-500' : 'border-transparent'
                    }`}
                  >
                    <Image src={photo} alt={`Фото ${idx + 1}`} width={64} height={64} className="object-cover w-full h-full" />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="p-6 space-y-5">
          {/* Бейджи */}
          <div className="flex flex-wrap gap-2">
            <Badge variant={listing.listingType === 'rent' ? 'info' : 'success'}>
              {listing.listingType === 'rent' ? 'Аренда' : 'Продажа'}
            </Badge>
            <Badge variant="default">{PROPERTY_TYPE_LABELS[listing.propertyType]}</Badge>
            {listing.isPremium && <Badge variant="warning">⭐ Premium</Badge>}
          </div>

          {/* Заголовок и цена */}
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">{listing.title}</h1>
            <p className="text-2xl font-bold text-primary-600 mt-1">{formattedPrice}</p>
          </div>

          {/* Характеристики */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-neutral-500">Спальни</p>
              <p className="text-sm font-medium text-neutral-800 mt-0.5">
                {listing.bedrooms === 0 ? 'Студия' : `${listing.bedrooms} спальн.`}
              </p>
            </div>
            {listing.bathrooms && (
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-neutral-500">Ванные</p>
                <p className="text-sm font-medium text-neutral-800 mt-0.5">{listing.bathrooms}</p>
              </div>
            )}
            {listing.sqft && (
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-neutral-500">Площадь</p>
                <p className="text-sm font-medium text-neutral-800 mt-0.5">{listing.sqft} кв. фут</p>
              </div>
            )}
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-neutral-500">Животные</p>
              <p className="text-sm font-medium text-neutral-800 mt-0.5">
                {listing.petFriendly ? '✅ Разрешены' : '❌ Не разрешены'}
              </p>
            </div>
            {listing.listingType === 'rent' && (
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-neutral-500">Коммунальные</p>
                <p className="text-sm font-medium text-neutral-800 mt-0.5">
                  {listing.utilitiesIncluded ? 'Включены' : 'Не включены'}
                </p>
              </div>
            )}
          </div>

          {/* Мета */}
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-neutral-500">
            <span>📍 {listing.neighborhood ? `${listing.neighborhood}, ${getCityName(listing.cityId)}` : listing.cityId}</span>
            {listing.createdAt && <span>🕐 {formatDate(listing.createdAt)}</span>}
            <span>👁 {listing.viewsCount} просмотров</span>
          </div>

          {/* Описание */}
          <div>
            <h2 className="text-base font-semibold text-neutral-800 mb-2">Описание</h2>
            <p className="text-sm text-neutral-700 leading-relaxed whitespace-pre-line">{listing.description}</p>
          </div>

          {/* Автор */}
          <div className="border-t border-gray-100 pt-4">
            <p className="text-sm text-neutral-500">
              Размещено: <span className="font-medium text-neutral-700">{listing.authorName}</span>
            </p>
          </div>

          {/* Контакты */}
          <div className="space-y-3">
            <h2 className="text-base font-semibold text-neutral-800">Связаться с автором</h2>
            {contact.name && <p className="text-sm text-neutral-600">{contact.name}</p>}
            <ContactButtons contact={contact} />

            {/* Совет безопасности */}
            <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
              <p className="font-semibold mb-1">⚠️ Совет безопасности</p>
              <p>Встречайтесь лично, не платите вперёд. <a href="/safety" className="underline">Подробнее о безопасности →</a></p>
            </div>
          </div>

          {/* Действия */}
          <div className="flex items-center justify-between pt-2">
            <ShareButton title={listing.title} />
            <ReportButton itemId={listing.id} itemType="housing" itemTitle={listing.title} />
          </div>
        </div>
      </div>
      <SimilarListings collection="housing" currentId={listing.id} cityId={getCityName(listing.cityId)} />
    </Container>
  );
}
