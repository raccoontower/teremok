'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { useListing } from '@/hooks/useListing';
import { Container } from '@/components/layout/Container';
import type { Listing } from '@/types';
import { ContactButtons } from '@/components/shared/ContactButtons';
import { ReportButton } from '@/components/shared/ReportButton';
import { ShareButton } from '@/components/shared/ShareButton';
import { SimilarListings } from '@/components/shared/SimilarListings';
import { StatusBadge } from '@/components/ui/Badge';
import { FullScreenSpinner } from '@/components/ui/Spinner';
import { formatPrice } from '@/lib/utils/formatPrice';
import { getCityName } from '@/lib/utils/cityNames';
import { formatDate } from '@/lib/utils/formatDate';
import { ROUTES } from '@/lib/constants/routes';

interface ListingDetailClientProps {
  id: string;
  initialListing?: Listing | null;
}

export function ListingDetailClient({ id, initialListing }: ListingDetailClientProps) {
  // Если данные переданы с сервера — не делаем лишний fetch
  const { listing: fetched, loading, error } = useListing(initialListing ? '' : id);
  const listing = initialListing ?? fetched;
  const [activePhoto, setActivePhoto] = useState(0);

  if (!initialListing && loading) return <FullScreenSpinner />;

  if ((!initialListing && error) || !listing) {
    return (
      <Container className="py-16 text-center">
        <div className="text-5xl mb-4">😕</div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">Объявление не найдено</h1>
        <p className="text-gray-500 mb-6">{error || 'Возможно, оно было удалено'}</p>
        <Link href={ROUTES.listings} className="text-primary-600 hover:underline">
          ← Вернуться к объявлениям
        </Link>
      </Container>
    );
  }

  const formattedPrice = formatPrice(listing.price, listing.priceType);
  const formattedDate = listing.createdAt ? formatDate(listing.createdAt) : '';

  return (
    <Container className="py-6">
      {/* Хлебные крошки */}
      <nav className="text-sm text-gray-400 mb-4">
        <Link href={ROUTES.listings} className="hover:text-primary-600">
          Объявления
        </Link>
        {' › '}
        <span className="text-gray-600">{listing.title}</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Левая колонка: фото и описание */}
        <div className="md:col-span-2">
          {/* Главное фото */}
          <div className="aspect-[4/3] bg-gray-100 rounded-xl overflow-hidden relative mb-2">
            {listing.photos && listing.photos.length > 0 ? (
              <Image
                src={listing.photos[activePhoto]}
                alt={listing.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 66vw"
                priority
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-gray-300">
                <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
          </div>

          {/* Миниатюры */}
          {listing.photos && listing.photos.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {listing.photos.map((photo, idx) => (
                <button
                  key={idx}
                  onClick={() => setActivePhoto(idx)}
                  className={`shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                    idx === activePhoto ? 'border-primary-500' : 'border-transparent'
                  }`}
                >
                  <Image
                    src={photo}
                    alt={`Фото ${idx + 1}`}
                    width={64}
                    height={64}
                    className="object-cover w-full h-full"
                  />
                </button>
              ))}
            </div>
          )}

          {/* Описание */}
          <div className="mt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Описание</h2>
            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
              {listing.description}
            </p>
          </div>
        </div>

        {/* Правая колонка: цена и контакты */}
        <div className="space-y-4">
          {/* Карточка с ценой */}
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex items-start justify-between mb-2">
              <h1 className="text-lg font-bold text-gray-900 leading-tight">
                {listing.title}
              </h1>
              <StatusBadge status={listing.status} />
            </div>

            <p className="text-2xl font-bold text-gray-900 mt-3">
              {formattedPrice}
            </p>

            <div className="mt-3 text-sm text-gray-500 space-y-1">
              <p>📍 {getCityName(listing.cityId)}</p>
              <p>🏷️ {listing.categoryId}</p>
              <p>📅 {formattedDate}</p>
              {listing.viewsCount !== undefined && (
                <p>👁️ {listing.viewsCount} просмотров</p>
              )}
            </div>
          </div>

          {/* Контакты */}
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <h2 className="font-semibold text-gray-900 mb-3">Связаться с автором</h2>
            <p className="text-sm text-gray-500 mb-3">{listing.authorName}</p>
            <ContactButtons contact={listing.contact ?? {}} />

            {/* Совет безопасности */}
            <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
              <p className="font-semibold mb-1">⚠️ Совет безопасности</p>
              <p>Встречайтесь лично, не платите вперёд. <a href="/safety" className="underline">Подробнее о безопасности →</a></p>
            </div>

            {/* Действия */}
            <div className="flex items-center justify-between mt-3">
              <ShareButton title={listing.title} />
              <ReportButton itemId={listing.id} itemType="listing" itemTitle={listing.title} />
            </div>
          </div>
        </div>
      </div>

      {/* Похожие объявления */}
      <SimilarListings
        collection="listings"
        currentId={listing.id}
        cityId={getCityName(listing.cityId)}
        categoryId={listing.categoryId}
      />
    </Container>
  );
}
