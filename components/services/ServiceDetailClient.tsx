'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useService } from '@/hooks/useService';
import type { Service } from '@/types';
import { Container } from '@/components/layout/Container';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { FullScreenSpinner } from '@/components/ui/Spinner';
import { SERVICE_CATEGORY_LABELS, SERVICE_AREA_LABELS } from '@/types';
import { getCityName } from '@/lib/utils/cityNames';
import { formatDate } from '@/lib/utils/formatDate';
import { ContactButtons } from '@/components/shared/ContactButtons';
import { SimilarListings } from '@/components/shared/SimilarListings';
import { ReportButton } from '@/components/shared/ReportButton';
import { ShareButton } from '@/components/shared/ShareButton';

interface ServiceDetailClientProps {
  id: string;
  initialService?: Service | null;
}

/**
 * Детальная страница услуги.
 */
export function ServiceDetailClient({ id, initialService }: ServiceDetailClientProps) {
  const { service: fetched, loading, error } = useService(initialService ? '' : id);
  const service = initialService ?? fetched;
  const [activePhoto, setActivePhoto] = useState(0);

  if (!initialService && loading) return <FullScreenSpinner />;

  if ((!initialService && error) || !service) {
    return (
      <Container className="py-16 text-center">
        <p className="text-4xl mb-3">🔍</p>
        <p className="text-lg font-medium text-neutral-700">{error || 'Услуга не найдена'}</p>
        <Link href="/services" className="mt-4 inline-block">
          <Button variant="secondary">← Все услуги</Button>
        </Link>
      </Container>
    );
  }

  const { contact } = service;

  // Форматируем цену
  const formattedPrice = (() => {
    if (service.priceType === 'negotiable') return 'Договорная';
    if (!service.price) return null;
    return service.priceType === 'hourly'
      ? `$${service.price}/час`
      : `$${service.price.toLocaleString()}`;
  })();

  return (
    <Container className="py-6 max-w-2xl">
      {/* Назад */}
      <Link href="/services" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 mb-5 transition-colors">
        ← Все услуги
      </Link>

      <div className="bg-white rounded-[16px] shadow-card overflow-hidden">
        {/* Фото-галерея */}
        {service.photos && service.photos.length > 0 && (
          <div>
            <div className="aspect-[4/3] relative bg-neutral-100">
              <Image src={service.photos[activePhoto]} alt={service.title} fill className="object-cover" />
            </div>
            {service.photos.length > 1 && (
              <div className="flex gap-2 p-3 overflow-x-auto">
                {service.photos.map((photo, idx) => (
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
            <Badge variant="info">{SERVICE_CATEGORY_LABELS[service.category]}</Badge>
            <Badge variant="default">{SERVICE_AREA_LABELS[service.serviceArea]}</Badge>
            {service.isPremium && <Badge variant="warning">⭐ Premium</Badge>}
          </div>

          {/* Заголовок */}
          <h1 className="text-2xl font-bold text-neutral-900">{service.title}</h1>

          {/* Цена */}
          {formattedPrice && (
            <p className={`text-xl font-semibold ${service.priceType === 'negotiable' ? 'text-neutral-500' : 'text-green-700'}`}>
              {formattedPrice}
            </p>
          )}

          {/* Характеристики */}
          <div className="grid grid-cols-2 gap-3">
            {service.experience !== undefined && service.experience > 0 && (
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-neutral-500">Опыт работы</p>
                <p className="text-sm font-medium text-neutral-800 mt-0.5">
                  {service.experience} {service.experience === 1 ? 'год' : service.experience < 5 ? 'года' : 'лет'}
                </p>
              </div>
            )}
            {service.languages && service.languages.length > 0 && (
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-neutral-500">Языки</p>
                <p className="text-sm font-medium text-neutral-800 mt-0.5">{service.languages.join(', ')}</p>
              </div>
            )}
          </div>

          {/* Мета */}
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-neutral-500">
            <span>📍 {getCityName(service.cityId)}</span>
            {service.createdAt && <span>🕐 {formatDate(service.createdAt)}</span>}
            <span>👁 {service.viewsCount} просмотров</span>
          </div>

          {/* Описание */}
          <div>
            <h2 className="text-base font-semibold text-neutral-800 mb-2">Описание</h2>
            <p className="text-sm text-neutral-700 leading-relaxed whitespace-pre-line">{service.description}</p>
          </div>

          {/* Автор */}
          <div className="border-t border-gray-100 pt-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
              <span className="text-blue-700 font-bold text-sm">{service.authorName[0]?.toUpperCase()}</span>
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-800">{service.authorName}</p>
              <p className="text-xs text-neutral-500">Исполнитель</p>
            </div>
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
            <ShareButton title={service.title} />
            <ReportButton itemId={service.id} itemType="service" itemTitle={service.title} />
          </div>
        </div>
      </div>
      <SimilarListings collection="services" currentId={service.id} cityId={getCityName(service.cityId)} category={service.category} />
    </Container>
  );
}
