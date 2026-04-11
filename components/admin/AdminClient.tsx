'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/contexts/AuthContext';
import { Container } from '@/components/layout/Container';
import { isAdmin } from '@/lib/constants/admins';
import { formatDate } from '@/lib/utils/formatDate';
import { EditItemModal } from '@/components/shared/EditItemModal';

type ItemType = 'listing' | 'job' | 'housing' | 'service';

interface AdminItem {
  id: string;
  title: string;
  _type: ItemType;
  status: string;
  createdAt: string | null;
  authorName?: string;
  authorId?: string;
  cityId?: string;
}

export function AdminClient() {
  const { user, loading: authLoading } = useAuthContext();
  const router = useRouter();
  const [items, setItems] = useState<AdminItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<AdminItem | null>(null);

  useEffect(() => {
    if (!authLoading) {
      if (!user || !isAdmin(user.email)) {
        router.replace('/');
      }
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (user && isAdmin(user.email)) {
      fetchData();
    }
  }, [user]);

  async function fetchData() {
    setLoading(true);
    try {
      const token = await user!.getIdToken();
      const res = await fetch('/api/admin/all', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Access denied');
      const data = await res.json();
      setItems(data.items || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(item: AdminItem) {
    if (!confirm(`Удалить навсегда: "${item.title}"?`)) return;
    setDeleting(item.id);
    try {
      const token = await user!.getIdToken();
      const collectionMap: Record<ItemType, string> = {
        listing: 'listings', job: 'jobs', housing: 'housing', service: 'services'
      };
      const res = await fetch('/api/admin/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ collection: collectionMap[item._type], id: item.id }),
      });
      if (res.ok) {
        setItems(prev => prev.filter(i => i.id !== item.id));
      }
    } catch (err) {
      alert('Ошибка при удалении');
    } finally {
      setDeleting(null);
    }
  }

  if (authLoading || !user || !isAdmin(user.email)) return null;

  return (
    <Container className="py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-neutral-900">Админ-панель</h1>
        <div className="text-sm text-neutral-500 bg-neutral-100 px-3 py-1 rounded-full">
          Всего объявлений: {items.length}
        </div>
      </div>

      <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 font-medium">
            <tr>
              <th className="px-4 py-3">Тип</th>
              <th className="px-4 py-3">Заголовок / Автор</th>
              <th className="px-4 py-3">Дата</th>
              <th className="px-4 py-3 text-right">Действие</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {loading ? (
              <tr><td colSpan={4} className="px-4 py-10 text-center text-neutral-400">Загрузка данных...</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={4} className="px-4 py-10 text-center text-neutral-400">Объявлений не найдено</td></tr>
            ) : (
              items.map(item => (
                <tr key={item.id} className="hover:bg-neutral-50 transition-colors">
                  <td className="px-4 py-4">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-neutral-100 text-neutral-600">
                      {item._type === 'listing' ? 'Товар' : item._type === 'job' ? 'Работа' : item._type === 'housing' ? 'Жилье' : 'Услуга'}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="font-semibold text-neutral-900 truncate max-w-xs">{item.title}</div>
                    <div className="text-xs text-neutral-400">Автор: {item.authorName || 'Аноним'}</div>
                  </td>
                  <td className="px-4 py-4 text-neutral-500 whitespace-nowrap">
                    {item.createdAt ? formatDate(item.createdAt) : '-'}
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <button
                        onClick={() => setEditingItem(item)}
                        className="text-primary-600 hover:text-primary-800 font-medium"
                      >
                        Изменить
                      </button>
                      <button
                        onClick={() => handleDelete(item)}
                        disabled={deleting === item.id}
                        className="text-red-500 hover:text-red-700 font-medium disabled:opacity-30"
                      >
                        {deleting === item.id ? '...' : 'Удалить'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {editingItem && (
        <EditItemModal
          item={editingItem}
          onClose={() => setEditingItem(null)}
          onSaved={(id, updates) => {
            setItems(prev => prev.map(i => i.id === id ? { ...i, ...updates as Partial<AdminItem> } : i));
          }}
        />
      )}
    </Container>
  );
}
