'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Logo } from '@/components/layout/Logo';
import { Container } from '@/components/layout/Container';
import { Button } from '@/components/ui/Button';
import { CitySelector } from '@/components/layout/CitySelector';
import { useAuthContext } from '@/contexts/AuthContext';
import { signOut } from '@/lib/firebase/auth';
import { ROUTES } from '@/lib/constants/routes';
import { useState, type KeyboardEvent } from 'react';

import { isAdmin } from '@/lib/constants/admins';

export function Header() {
  const { user, loading } = useAuthContext();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSignOut = async () => {
    await signOut();
    router.push(ROUTES.listings);
    setMenuOpen(false);
  };

  const handleSearchSubmit = () => {
    const q = searchQuery.trim();
    if (q) {
      router.push(`/search?q=${encodeURIComponent(q)}`);
    } else {
      router.push('/search');
    }
  };

  const handleSearchKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearchSubmit();
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <Container>
        <div className="flex items-center justify-between h-[60px] gap-4">

          {/* Логотип */}
          <Logo />

          {/* Поиск — виден только на десктопе */}
          <div className="hidden md:flex items-center w-64 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder="Поиск по объявлениям..."
              className="w-full h-10 rounded-full border border-neutral-200 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <button
              onClick={handleSearchSubmit}
              className="absolute right-3 text-neutral-400 hover:text-primary-600 transition-colors"
              aria-label="Найти"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
              </svg>
            </button>
          </div>

          {/* Селектор города — только десктоп */}
          <div className="hidden md:block">
            <CitySelector />
          </div>

          {/* Правая часть */}
          <div className="flex items-center gap-2">

            {/* Кнопка поиска на мобайле (только sm и меньше) */}
            <button
              onClick={() => router.push('/search')}
              className="md:hidden p-2 text-neutral-500 hover:text-primary-600 transition-colors rounded-full hover:bg-neutral-100"
              aria-label="Поиск"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
              </svg>
            </button>

            {/* Кнопка "Подать объявление" */}
            <Link href={ROUTES.newListing}>
              <Button
                variant="primary"
                size="sm"
                className="text-xs sm:text-sm px-2.5 sm:px-4 whitespace-nowrap"
              >
                <span className="hidden sm:inline">+ Подать объявление</span>
                <span className="sm:hidden">+ Подать</span>
              </Button>
            </Link>

            {loading ? (
              <div className="w-8 h-8 rounded-full bg-neutral-200 animate-pulse" />
            ) : user ? (
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
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
                    <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-sm">
                      {(user.displayName || user.email || 'U')[0].toUpperCase()}
                    </div>
                  )}
                </button>

                {menuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setMenuOpen(false)}
                    />
                    <div className="absolute right-0 top-11 z-20 w-52 bg-white rounded-[16px] shadow-dropdown py-1.5 animate-dropdown-in">
                      <div className="px-4 py-2.5 border-b border-neutral-100">
                        <p className="text-sm font-semibold text-neutral-900 truncate">
                          {user.displayName || 'Пользователь'}
                        </p>
                        <p className="text-xs text-neutral-500 truncate mt-0.5">
                          {user.email}
                        </p>
                      </div>
                      <div className="px-4 py-2 border-b border-gray-100 bg-gray-50/50">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                          Управление
                        </p>
                      </div>

                      {isAdmin(user.email) && (
                        <Link
                          href="/admin"
                          className="flex items-center gap-2 px-4 py-2 text-sm text-primary-600 font-bold hover:bg-primary-50 transition-colors"
                        >
                          ⚙️ Админ-панель
                        </Link>
                      )}

                      <Link
                        href={ROUTES.profile}
                        className="flex items-center px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors duration-100"
                        onClick={() => setMenuOpen(false)}
                      >
                        Мои объявления
                      </Link>
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
