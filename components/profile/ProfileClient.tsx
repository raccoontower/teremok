'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { type QueryDocumentSnapshot } from 'firebase/firestore';
import { useAuthContext } from '@/contexts/AuthContext';
import { Container } from '@/components/layout/Container';
import { Button } from '@/components/ui/Button';
import { ListingCard } from '@/components/listings/ListingCard';
import { EmptyState } from '@/components/listings/EmptyState';
import { Spinner } from '@/components/ui/Spinner';
import { getUserListings } from '@/lib/firebase/firestore';
import { updateListing } from '@/lib/firebase/firestore';
import { ROUTES } from '@/lib/constants/routes';
import type { Listing, ListingStatus } from '@/types';
import { LISTINGS_PER_PAGE } from '@/lib/constants/limits';

export function ProfileClient() {
  const { user } = useAuthContext();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchListings = async () => {
      setLoading(true);
      try {
        const result = await getUserListings(user.uid);
        setListings(result.listings);
        setLastDoc(result.lastDoc);
        setHasMore(result.listings.length === LISTINGS_PER_PAGE);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, [user]);

  const loadMore = async () => {
    if (!user || !lastDoc) return;
    setLoading(true);
    try {
      const result = await getUserListings(user.uid, lastDoc);
      setListings((prev) => [...prev, ...result.listings]);
      setLastDoc(result.lastDoc);
      setHasMore(result.listings.length === LISTINGS_PER_PAGE);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = async (id: string) => {
    setActionError(null);
    try {
      await updateListing(id, { status: 'closed' });
      setListings((prev) =>
        prev.map((l) => (l.id === id ? { ...l, status: 'closed' as ListingStatus } : l))
      );
    } catch (err) {
      console.error('Ошибка при закрытии объявления:', err);
      setActionError('Не удалось закрыть объявление. Попробуйте ещё раз.');
    }
  };

  const handleActivate = async (id: string) => {
    setActionError(null);
    try {
      await updateListing(id, { status: 'active' });
      setListings((prev) =>
        prev.map((l) => (l.id === id ? { ...l, status: 'active' as ListingStatus } : l))
      );
    } catch (err) {
      console.error('Ошибка при активации объявления:', err);
      setActionError('Не удалось активировать объявление. Попробуйте ещё раз.');
    }
  };

  if (!user) return null;

  return (
    <Container className="py-6">
      {/* Информация о пользователе */}
      <div className="flex items-center gap-4 mb-8 p-4 bg-white rounded-xl border border-gray-200">
        {user.photoURL ? (
          <Image
            src={user.photoURL}
            alt={user.displayName || 'Профиль'}
            width={64}
            height={64}
            className="rounded-full object-cover"
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-2xl">
            {(user.displayName || user.email || 'U')[0].toUpperCase()}
          </div>
        )}
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            {user.displayName || 'Пользователь'}
          </h1>
          <p className="text-sm text-gray-500">{user.email}</p>
        </div>
      </div>

      {/* Мои объявления */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900">Мои объявления</h2>
        <Link href={ROUTES.newListing}>
          <Button variant="primary" size="sm">+ Подать</Button>
        </Link>
      </div>

      {loading && listings.length === 0 ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : listings.length === 0 ? (
        <EmptyState
          title="Нет объявлений"
          description="Вы ещё не подавали объявлений"
          showAddButton
        />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {listings.map((listing) => (
              <div key={listing.id} className="relative group">
                <ListingCard listing={listing} />
                {/* Кнопки управления */}
                <div className="mt-1 flex gap-2">
                  {listing.status === 'active' ? (
                    <button
                      onClick={() => handleClose(listing.id)}
                      className="text-xs text-gray-500 hover:text-red-500 transition-colors"
                    >
                      Закрыть
                    </button>
                  ) : listing.status === 'closed' ? (
                    <button
                      onClick={() => handleActivate(listing.id)}
                      className="text-xs text-gray-500 hover:text-green-600 transition-colors"
                    >
                      Активировать
                    </button>
                  ) : null}
                </div>
              </div>
            ))}
          </div>

          {/* Ошибка действия над объявлением */}
          {actionError && (
            <p className="mt-3 text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">
              {actionError}
            </p>
          )}

          {hasMore && (
            <div className="mt-8 flex justify-center">
              <Button variant="secondary" onClick={loadMore} loading={loading}>
                Загрузить ещё
              </Button>
            </div>
          )}
        </>
      )}
    </Container>
  );
}
