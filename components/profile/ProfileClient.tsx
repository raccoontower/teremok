'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthContext as useAuth } from '@/contexts/AuthContext';
import { Container } from '@/components/layout/Container';
import { formatDate } from '@/lib/utils/formatDate';
import { getCityName } from '@/lib/utils/cityNames';
import { EditItemModal } from '@/components/shared/EditItemModal';

type ItemType = 'listing' | 'job' | 'housing' | 'service';

interface ProfileItem {
  id: string;
  title: string;
  _type: ItemType;
  status: string;
  createdAt: string | null;
  cityId?: string;
  price?: number;
}

const TYPE_LABEL: Record<ItemType, string> = {
  listing: 'Объявление',
  job: 'Работа',
  housing: 'Жильё',
  service: 'Услуга',
};

const TYPE_HREF: Record<ItemType, string> = {
  listing: '/listings',
  job: '/jobs',
  housing: '/housing',
  service: '/services',
};

const TYPE_NEW: Record<ItemType, string> = {
  listing: '/listings/new',
  job: '/jobs/new',
  housing: '/housing/new',
  service: '/services/new',
};

export function ProfileClient() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState<ProfileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ItemType | 'all'>('all');
  const [deleting, setDeleting] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<ProfileItem | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && !user) router.replace('/auth/login?redirect=/profile');
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!user) return;
    fetchItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  async function fetchItems() {
    setLoading(true);
    try {
      const token = await user!.getIdToken();
      const res = await fetch('/api/profile/listings', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Ошибка загрузки');
      const data = await res.json() as {
        listings: ProfileItem[];
        jobs: ProfileItem[];
        housing: ProfileItem[];
        services: ProfileItem[];
      };
      const all = [
        ...data.listings,
        ...data.jobs,
        ...data.housing,
        ...data.services,
      ].sort((a, b) => {
        const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return tb - ta;
      });
      setItems(all);
    } catch {
      setError('Не удалось загрузить объявления');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(item: ProfileItem) {
    if (!confirm(`Удалить "${item.title}"? Это действие нельзя отменить.`)) return;
    setDeleting(item.id);
    try {
      const token = await user!.getIdToken();
      const collectionMap: Record<ItemType, string> = {
        listing: 'listings', job: 'jobs', housing: 'housing', service: 'services',
      };
      const res = await fetch('/api/profile/delete', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ collection: collectionMap[item._type], id: item.id }),
      });
      if (!res.ok) throw new Error();
      setItems((prev) => prev.filter((i) => i.id !== item.id));
    } catch {
      alert('Не удалось удалить. Попробуйте снова.');
    } finally {
      setDeleting(null);
    }
  }

  if (authLoading || (!user && !authLoading)) {
    return (
      <Container className="py-16 text-center text-neutral-400">
        Загрузка...
      </Container>
    );
  }

  const TABS: { key: ItemType | 'all'; label: string }[] = [
    { key: 'all', label: 'Все' },
    { key: 'listing', label: 'Объявления' },
    { key: 'job', label: 'Работа' },
    { key: 'housing', label: 'Жильё' },
    { key: 'service', label: 'Услуги' },
  ];

  const filtered = activeTab === 'all' ? items : items.filter((i) => i._type === activeTab);

  return (
    <Container className="py-6 max-w-3xl">
      {/* Заголовок */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Мой профиль</h1>
          <p className="text-sm text-neutral-500 mt-0.5">{user?.email}</p>
        </div>
        <Link
          href="/listings/new"
          className="inline-flex items-center gap-2 bg-primary-600 text-white text-sm font-medium px-4 h-10 rounded-lg hover:bg-primary-700 transition-colors"
        >
          + Подать объявление
        </Link>
      </div>

      {/* Табы */}
      <div className="flex gap-1 border-b border-neutral-200 mb-6 overflow-x-auto">
        {TABS.map((tab) => {
          const count = tab.key === 'all' ? items.length : items.filter((i) => i._type === tab.key).length;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-3 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab.key
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-neutral-500 hover:text-neutral-900'
              }`}
            >
              {tab.label}
              {count > 0 && (
                <span className="ml-1.5 text-xs bg-neutral-100 text-neutral-600 px-1.5 py-0.5 rounded-full">
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Контент */}
      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 bg-neutral-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-neutral-400">
          <div className="text-4xl mb-3">📭</div>
          <p className="font-medium mb-4">Объявлений пока нет</p>
          <Link
            href={activeTab !== 'all' ? TYPE_NEW[activeTab as ItemType] : '/listings/new'}
            className="text-primary-600 hover:underline text-sm"
          >
            Разместить первое →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between gap-3 bg-white border border-neutral-100 rounded-xl p-4 hover:border-neutral-200 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-full">
                    {TYPE_LABEL[item._type]}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    item.status === 'active'
                      ? 'bg-green-50 text-green-700'
                      : item.status === 'closed'
                      ? 'bg-red-50 text-red-600'
                      : 'bg-yellow-50 text-yellow-700'
                  }`}>
                    {item.status === 'active' ? 'Активно' : item.status === 'closed' ? 'Закрыто' : 'Ожидание'}
                  </span>
                </div>
                <Link
                  href={`${TYPE_HREF[item._type]}/${item.id}`}
                  className="font-medium text-neutral-900 hover:text-primary-600 transition-colors line-clamp-1"
                >
                  {item.title}
                </Link>
                <p className="text-xs text-neutral-400 mt-0.5">
                  {item.cityId && <>{getCityName(item.cityId)} · </>}
                  {item.createdAt ? formatDate(item.createdAt) : ''}
                </p>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={() => setEditingItem(item)}
                  className="text-sm text-primary-600 hover:text-primary-800 transition-colors p-2"
                  title="Редактировать"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
              <button
                onClick={() => handleDelete(item)}
                disabled={deleting === item.id}
                className="flex-shrink-0 text-sm text-red-500 hover:text-red-700 transition-colors disabled:opacity-50 p-2"
                title="Удалить"
              >
                {deleting === item.id ? (
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                )}
              </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editingItem && (
        <EditItemModal
          item={editingItem}
          onClose={() => setEditingItem(null)}
          onSaved={(id, updates) => {
            setItems(prev => prev.map(i => i.id === id ? { ...i, ...updates as Partial<ProfileItem> } : i));
          }}
        />
      )}
    </Container>
  );
}
