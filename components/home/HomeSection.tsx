'use client';

import Link from 'next/link';
import { HomeSkeleton } from '@/components/home/HomeSkeleton';

interface HomeSectionProps {
  title: string;
  icon: string;
  href: string;
  loading: boolean;
  isEmpty: boolean;
  children: React.ReactNode;
}

export function HomeSection({ title, icon, href, loading, isEmpty, children }: HomeSectionProps) {
  return (
    <section className="mb-10">
      {/* Заголовок секции */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
          <span aria-hidden="true">{icon}</span>
          {title}
        </h2>
        <Link
          href={href}
          className="text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors min-h-[48px] flex items-center"
        >
          Смотреть все →
        </Link>
      </div>

      {/* Содержимое */}
      {loading ? (
        <HomeSkeleton />
      ) : isEmpty ? (
        <div className="flex items-center justify-center py-10 bg-neutral-50 rounded-[16px] text-neutral-400 text-sm">
          Нет объявлений
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-2 snap-x md:grid md:grid-cols-3 md:overflow-visible">
          {children}
        </div>
      )}
    </section>
  );
}
