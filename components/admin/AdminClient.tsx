'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/contexts/AuthContext';
import { Container } from '@/components/layout/Container';
import { isAdmin } from '@/lib/constants/admins';
import { formatDate } from '@/lib/utils/formatDate';
import { EditItemModal } from '@/components/shared/EditItemModal';

type ItemType = 'listing' | 'job' | 'housing' | 'service';
type AdminTab = 'content' | 'users';

interface AdminItem {
  id: string;
  title: string;
  _type: ItemType;
  status: string;
  createdAt: string | null;
  authorName?: string;
  authorId?: string;
  cityId?: string;
  description?: string;
  price?: number;
  priceType?: string;
}

interface AdminUser {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  disabled: boolean;
  createdAt: string;
  lastLogin: string;
  emailVerified: boolean;
}

const TYPE_LABELS: Record<ItemType, string> = {
  listing: '📦 Товар',
  job: '💼 Работа',
  housing: '🏠 Жильё',
  service: '🔧 Услуга',
};

export function AdminClient() {
  const { user, loading: authLoading } = useAuthContext();
  const router = useRouter();
  const [tab, setTab] = useState<AdminTab>('content');
  const [items, setItems] = useState<AdminItem[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<AdminItem | null>(null);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [editUserName, setEditUserName] = useState('');
  const [editUserEmail, setEditUserEmail] = useState('');
  const [editUserSaving, setEditUserSaving] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin(user.email))) {
      router.replace('/');
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (user && isAdmin(user.email)) {
      if (tab === 'content') fetchContent();
      else fetchUsers();
    }
  }, [user, tab]);

  async function fetchContent() {
    setLoading(true);
    try {
      const token = await user!.getIdToken();
      const res = await fetch('/api/admin/all', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setItems(data.items || []);
    } catch { /* ignore */ } finally { setLoading(false); }
  }

  async function fetchUsers() {
    setLoading(true);
    try {
      const token = await user!.getIdToken();
      const res = await fetch('/api/admin/users', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setUsers(data.users || []);
    } catch { /* ignore */ } finally { setLoading(false); }
  }

  async function handleDeleteContent(item: AdminItem) {
    if (!confirm(`Удалить навсегда: "${item.title}"?`)) return;
    setDeleting(item.id);
    try {
      const token = await user!.getIdToken();
      const colMap: Record<ItemType, string> = { listing: 'listings', job: 'jobs', housing: 'housing', service: 'services' };
      const res = await fetch('/api/admin/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ collection: colMap[item._type], id: item.id }),
      });
      if (res.ok) setItems(prev => prev.filter(i => i.id !== item.id));
    } catch { alert('Ошибка при удалении'); } finally { setDeleting(null); }
  }

  async function handleToggleUser(u: AdminUser) {
    const action = u.disabled ? 'разблокировать' : 'заблокировать';
    if (!confirm(`${action} пользователя ${u.email}?`)) return;
    setDeleting(u.uid);
    try {
      const token = await user!.getIdToken();
      await fetch(`/api/admin/users/${u.uid}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ disabled: !u.disabled }),
      });
      setUsers(prev => prev.map(x => x.uid === u.uid ? { ...x, disabled: !u.disabled } : x));
    } catch { alert('Ошибка'); } finally { setDeleting(null); }
  }

  function openEditUser(u: AdminUser) {
    setEditingUser(u);
    setEditUserName(u.displayName);
    setEditUserEmail(u.email);
  }

  async function handleSaveUser() {
    if (!editingUser) return;
    setEditUserSaving(true);
    try {
      const token = await user!.getIdToken();
      await fetch(`/api/admin/users/${editingUser.uid}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ displayName: editUserName, email: editUserEmail }),
      });
      setUsers(prev => prev.map(x => x.uid === editingUser.uid
        ? { ...x, displayName: editUserName, email: editUserEmail }
        : x));
      setEditingUser(null);
    } catch { alert('Ошибка при сохранении'); }
    finally { setEditUserSaving(false); }
  }

  async function handleDeleteUser(u: AdminUser) {
    if (!confirm(`УДАЛИТЬ аккаунт ${u.email}? Это необратимо.`)) return;
    setDeleting(u.uid);
    try {
      const token = await user!.getIdToken();
      const res = await fetch(`/api/admin/users/${u.uid}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setUsers(prev => prev.filter(x => x.uid !== u.uid));
    } catch { alert('Ошибка'); } finally { setDeleting(null); }
  }

  if (authLoading || !user || !isAdmin(user.email)) return null;

  const filteredItems = search
    ? items.filter(i => i.title?.toLowerCase().includes(search.toLowerCase()) || i.authorName?.toLowerCase().includes(search.toLowerCase()))
    : items;
  const filteredUsers = search
    ? users.filter(u => u.email.toLowerCase().includes(search.toLowerCase()) || u.displayName.toLowerCase().includes(search.toLowerCase()))
    : users;

  return (
    <Container className="py-8">
      {/* Заголовок */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">⚙️ Админ-панель</h1>
          <p className="text-sm text-neutral-400 mt-0.5">Управление сайтом teremok.live</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs bg-neutral-100 text-neutral-600 px-3 py-1 rounded-full">
            {tab === 'content' ? `${items.length} записей` : `${users.length} польз.`}
          </span>
        </div>
      </div>

      {/* Вкладки */}
      <div className="flex gap-1 bg-neutral-100 p-1 rounded-xl mb-6 w-fit">
        {([['content', '📋 Контент'], ['users', '👥 Пользователи']] as [AdminTab, string][]).map(([key, label]) => (
          <button key={key} onClick={() => { setTab(key); setSearch(''); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === key ? 'bg-white shadow-sm text-neutral-900' : 'text-neutral-500 hover:text-neutral-700'}`}>
            {label}
          </button>
        ))}
      </div>

      {/* Поиск */}
      <div className="mb-4">
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder={tab === 'content' ? 'Поиск по названию или автору...' : 'Поиск по email или имени...'}
          className="w-full sm:w-80 border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
      </div>

      {/* Таблица контента */}
      {tab === 'content' && (
        <div className="bg-white border border-neutral-200 rounded-2xl overflow-x-auto shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 font-medium">
              <tr>
                <th className="px-4 py-3">Тип</th>
                <th className="px-4 py-3">Заголовок / Автор</th>
                <th className="px-4 py-3">Статус</th>
                <th className="px-4 py-3">Дата</th>
                <th className="px-4 py-3 text-right">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {loading ? (
                <tr><td colSpan={5} className="px-4 py-10 text-center text-neutral-400">Загрузка...</td></tr>
              ) : filteredItems.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-10 text-center text-neutral-400">Ничего не найдено</td></tr>
              ) : filteredItems.map(item => (
                <tr key={item.id} className="hover:bg-neutral-50 transition-colors">
                  <td className="px-4 py-3">
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-neutral-100 text-neutral-600 whitespace-nowrap">
                      {TYPE_LABELS[item._type]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-neutral-900 max-w-[240px] truncate">{item.title}</div>
                    <div className="text-xs text-neutral-400">{item.authorName || 'Аноним'}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      item.status === 'active' ? 'bg-green-100 text-green-700' :
                      item.status === 'closed' ? 'bg-neutral-100 text-neutral-500' :
                      'bg-amber-100 text-amber-700'}`}>
                      {item.status === 'active' ? 'Активно' : item.status === 'closed' ? 'Закрыто' : 'Ожидание'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-neutral-500 text-xs whitespace-nowrap">
                    {item.createdAt ? formatDate(item.createdAt) : '—'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <button onClick={() => setEditingItem(item)} className="text-primary-600 hover:text-primary-800 text-sm font-medium">Изменить</button>
                      <button onClick={() => handleDeleteContent(item)} disabled={deleting === item.id}
                        className="text-red-500 hover:text-red-700 text-sm font-medium disabled:opacity-30">
                        {deleting === item.id ? '...' : 'Удалить'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Таблица пользователей */}
      {tab === 'users' && (
        <div className="bg-white border border-neutral-200 rounded-2xl overflow-x-auto shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 font-medium">
              <tr>
                <th className="px-4 py-3">Пользователь</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Статус</th>
                <th className="px-4 py-3">Регистрация</th>
                <th className="px-4 py-3 text-right">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {loading ? (
                <tr><td colSpan={5} className="px-4 py-10 text-center text-neutral-400">Загрузка...</td></tr>
              ) : filteredUsers.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-10 text-center text-neutral-400">Ничего не найдено</td></tr>
              ) : filteredUsers.map(u => (
                <tr key={u.uid} className={`hover:bg-neutral-50 transition-colors ${u.disabled ? 'opacity-50' : ''}`}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {u.photoURL
                        ? <img src={u.photoURL} alt="" className="w-7 h-7 rounded-full object-cover" />
                        : <div className="w-7 h-7 rounded-full bg-primary-100 text-primary-600 text-xs font-bold flex items-center justify-center">
                            {(u.displayName || u.email)?.[0]?.toUpperCase()}
                          </div>
                      }
                      <div>
                        <div className="font-medium text-neutral-900">{u.displayName || '—'}</div>
                        <div className="text-[10px] text-neutral-400 font-mono">{u.uid.slice(0, 8)}…</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <span>{u.email}</span>
                      {u.emailVerified && <span title="Email подтверждён" className="text-green-500">✓</span>}
                    </div>
                    <div className="text-xs text-neutral-400">Последний вход: {u.lastLogin ? new Date(u.lastLogin).toLocaleDateString('ru') : '—'}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${u.disabled ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-700'}`}>
                      {u.disabled ? '🔒 Заблокирован' : '✅ Активен'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-neutral-500 whitespace-nowrap">
                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString('ru') : '—'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <button onClick={() => openEditUser(u)}
                        className="text-primary-600 hover:text-primary-800 text-sm font-medium">
                        Изменить
                      </button>
                      <button onClick={() => handleToggleUser(u)} disabled={deleting === u.uid}
                        className={`text-sm font-medium disabled:opacity-30 ${u.disabled ? 'text-green-600 hover:text-green-800' : 'text-amber-600 hover:text-amber-800'}`}>
                        {u.disabled ? 'Разблокировать' : 'Заблокировать'}
                      </button>
                      <button onClick={() => handleDeleteUser(u)} disabled={deleting === u.uid}
                        className="text-red-500 hover:text-red-700 text-sm font-medium disabled:opacity-30">
                        Удалить
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editingItem && (
        <EditItemModal item={editingItem} onClose={() => setEditingItem(null)}
          onSaved={(id, updates) => setItems(prev => prev.map(i => i.id === id ? { ...i, ...updates as Partial<AdminItem> } : i))} />
      )}

      {/* Модалка редактирования пользователя */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setEditingUser(null)} />
          <div className="relative w-full sm:max-w-md bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl">
            <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-neutral-900">Редактировать пользователя</h2>
              <button onClick={() => setEditingUser(null)} className="text-neutral-400 hover:text-neutral-700 p-1">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg">
                {editingUser.photoURL
                  ? <img src={editingUser.photoURL} alt="" className="w-10 h-10 rounded-full" />
                  : <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-600 font-bold text-lg flex items-center justify-center">
                      {(editingUser.displayName || editingUser.email)?.[0]?.toUpperCase()}
                    </div>
                }
                <div>
                  <div className="text-xs text-neutral-400 font-mono">{editingUser.uid}</div>
                  <div className={`text-xs mt-0.5 ${editingUser.disabled ? 'text-red-500' : 'text-green-600'}`}>
                    {editingUser.disabled ? '🔒 Заблокирован' : '✅ Активен'}
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Имя</label>
                <input value={editUserName} onChange={e => setEditUserName(e.target.value)}
                  placeholder="Имя пользователя"
                  className="w-full border border-neutral-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Email</label>
                <input value={editUserEmail} onChange={e => setEditUserEmail(e.target.value)}
                  type="email" placeholder="email@example.com"
                  className="w-full border border-neutral-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                <p className="text-xs text-neutral-400 mt-1">Изменение email — только для аккаунтов без Google-входа</p>
              </div>
            </div>
            <div className="px-5 py-4 border-t border-neutral-100 flex gap-3">
              <button onClick={() => setEditingUser(null)}
                className="flex-1 py-2.5 border border-neutral-300 rounded-lg text-sm font-medium text-neutral-700 hover:bg-neutral-50">
                Отмена
              </button>
              <button onClick={handleSaveUser} disabled={editUserSaving}
                className="flex-1 py-2.5 bg-primary-600 text-white rounded-lg text-sm font-bold hover:bg-primary-700 disabled:opacity-50">
                {editUserSaving ? 'Сохранение...' : '💾 Сохранить'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Container>
  );
}
