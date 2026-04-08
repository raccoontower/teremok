'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Container } from '@/components/layout/Container';
import { Button } from '@/components/ui/Button';
import { useAuthContext } from '@/contexts/AuthContext';
import { signOut } from '@/lib/firebase/auth';
import { ROUTES } from '@/lib/constants/routes';
import { useState } from 'react';

export function Header() {
  const { user, loading } = useAuthContext();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    router.push(ROUTES.listings);
    setMenuOpen(false);
  };

  return (
    // Высота 60px — дышащий хедер, shadow-sm и border-b легче
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <Container>
        <div className="flex items-center justify-between h-[60px] gap-4">

          {/* Логотип — текст ВСЕГДА виден, не скрываем на мобайле */}
          <Link
            href={ROUTES.listings}
            className="flex items-center gap-2 font-bold text-xl text-primary-600 hover:text-primary-700 transition-colors duration-150 shrink-0"
          >
            <span className="text-2xl leading-none">🏠</span>
            {/* Убрали hidden sm:block — текст виден на всех экранах */}
            <span>Теремок</span>
          </Link>

          {/* Правая часть */}
          <div className="flex items-center gap-2">
            {/* Кнопка "Подать объявление" — текст ВСЕГДА с иконкой, на мобайле чуть меньше */}
            <Link href={ROUTES.newListing}>
              <Button
                variant="primary"
                size="sm"
                // На мобайле sm-размер, на десктопе чуть крупнее через className
                className="text-xs sm:text-sm px-2.5 sm:px-3"
              >
                {/* Текст всегда показывается — не скрываем на мобайле */}
                + Подать объявление
              </Button>
            </Link>

            {loading ? (
              // Заглушка пока грузится auth state
              <div className="w-8 h-8 rounded-full bg-neutral-200 animate-pulse" />
            ) : user ? (
              // Меню авторизованного пользователя
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  // Элегантный focus без резкого outline
                  className="flex items-center gap-2 rounded-full transition-opacity duration-150 hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
                  aria-expanded={menuOpen}
                  aria-label="Меню пользователя"
                >
                  {user.photoURL ? (
                    <Image
                      src={user.photoURL}
                      alt={user.displayName || 'Профиль'}
                      width={36}
                      height={36}
                      className="rounded-full object-cover"
                    />
                  ) : (
                    // Аватар-буква — чуть крупнее для мобайла
                    <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-sm">
                      {(user.displayName || user.email || 'U')[0].toUpperCase()}
                    </div>
                  )}
                </button>

                {/* Дропдаун меню с анимацией появления */}
                {menuOpen && (
                  <>
                    {/* Оверлей для закрытия по клику вне меню */}
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setMenuOpen(false)}
                    />

                    {/* Дропдаун — rounded-2xl (16px), мягкая тень, анимация */}
                    <div className="absolute right-0 top-11 z-20 w-52 bg-white rounded-[16px] shadow-dropdown py-1.5 animate-dropdown-in">
                      {/* Инфо пользователя */}
                      <div className="px-4 py-2.5 border-b border-neutral-100">
                        <p className="text-sm font-semibold text-neutral-900 truncate">
                          {user.displayName || 'Пользователь'}
                        </p>
                        <p className="text-xs text-neutral-500 truncate mt-0.5">
                          {user.email}
                        </p>
                      </div>

                      {/* Мои объявления */}
                      <Link
                        href={ROUTES.profile}
                        className="flex items-center px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors duration-100"
                        onClick={() => setMenuOpen(false)}
                      >
                        Мои объявления
                      </Link>

                      {/* Выход — красный, деструктивное действие */}
                      <button
                        onClick={handleSignOut}
                        className="w-full text-left px-4 py-2.5 text-sm text-error-600 hover:bg-error-50 transition-colors duration-100 rounded-b-[16px]"
                      >
                        Выйти
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              // Кнопки для гостя
              <Link href={ROUTES.login}>
                <Button variant="secondary" size="sm">
                  Войти
                </Button>
              </Link>
            )}
          </div>
        </div>
      </Container>
    </header>
  );
}
