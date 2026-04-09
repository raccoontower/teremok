'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils/cn';
import { Container } from '@/components/layout/Container';
import { useCityContext } from '@/contexts/CityContext';
import { CitySelector } from '@/components/layout/CitySelector';

// Основные табы навигации
const TABS = [
  { label: 'Объявления', href: '/listings' },
  { label: 'Работа',     href: '/jobs'     },
  { label: 'Жильё',      href: '/housing'  },
  { label: 'Услуги',     href: '/services' },
  { label: 'Блог',       href: '/blog'     },
];

// Элементы дропдауна "Ещё"
const MORE_ITEMS = [
  { label: 'Афиша',   href: '#', soon: true },
  { label: 'Места',   href: '#', soon: true },
];

/**
 * Основная горизонтальная навигация между разделами сайта.
 * Sticky под хедером, overflow-x-auto на мобайле.
 */
export function MainNav() {
  const pathname = usePathname();
  const { selectedCity } = useCityContext();
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  // Формируем href с сохранением города
  const withCity = (href: string) =>
    selectedCity ? `${href}?city=${selectedCity}` : href;

  // Закрываем дропдаун при клике вне
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    // sticky top-[60px] — прилипает сразу под хедером высотой 60px
    <nav className="sticky top-[60px] z-40 bg-white border-b border-gray-100 shadow-sm">
      <Container>
        {/* CitySelector на мобиле — показываем под табами */}
        <div className="md:hidden py-1.5 border-b border-gray-100">
          <CitySelector />
        </div>

        {/* overflow-x-auto — горизонтальный скролл на маленьких экранах */}
        <div className="flex items-center overflow-x-auto scrollbar-hide -mb-px">

          {/* Основные табы */}
          {TABS.map((tab) => {
            // Точное совпадение или начало пути (для вложенных страниц)
            const isActive =
              pathname === tab.href || pathname.startsWith(tab.href + '/');

            return (
              <Link
                key={tab.href}
                href={withCity(tab.href)}
                className={cn(
                  // Базовые стили таба
                  'shrink-0 px-4 py-3 text-sm font-medium border-b-2 transition-colors duration-150 whitespace-nowrap',
                  isActive
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                )}
              >
                {tab.label}
              </Link>
            );
          })}

          {/* Кнопка "Ещё" с дропдауном */}
          <div ref={moreRef} className="relative ml-auto shrink-0">
            <button
              onClick={() => setMoreOpen(!moreOpen)}
              className={cn(
                'flex items-center gap-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors duration-150 whitespace-nowrap',
                moreOpen
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              )}
              aria-expanded={moreOpen}
              aria-haspopup="true"
            >
              Ещё
              {/* Стрелка-шеврон */}
              <svg
                className={cn('w-4 h-4 transition-transform duration-150', moreOpen && 'rotate-180')}
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {/* Дропдаун */}
            {moreOpen && (
              <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-[12px] shadow-lg border border-gray-100 py-1.5 z-50">
                {MORE_ITEMS.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    className="flex items-center justify-between px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                    onClick={() => setMoreOpen(false)}
                  >
                    <span>{item.label}</span>
                    {item.soon && (
                      // Badge "Скоро"
                      <span className="text-[10px] font-medium bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full">
                        Скоро
                      </span>
                    )}
                  </a>
                ))}
              </div>
            )}
          </div>

        </div>
      </Container>
    </nav>
  );
}
