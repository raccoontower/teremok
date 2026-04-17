'use client';

import { useState, useEffect } from 'react';
import { useAuthContext } from '@/contexts/AuthContext';
import { getCityName } from '@/lib/utils/cityNames';

const CATEGORIES = [
  { value: 'cars', label: '🚗 Авто' },
  { value: 'clothing', label: '👗 Одежда' },
  { value: 'electronics', label: '📱 Электроника' },
  { value: 'food', label: '🍕 Продукты / Еда' },
  { value: 'furniture', label: '🛋️ Мебель' },
  { value: 'jobs', label: '💼 Работа' },
  { value: 'kids', label: '🧸 Детские товары' },
  { value: 'real-estate', label: '🏠 Недвижимость' },
  { value: 'services', label: '🔧 Услуги' },
  { value: 'sports', label: '⚽ Спорт' },
  { value: 'pets', label: '🐾 Животные' },
  { value: 'tools', label: '🔨 Инструменты' },
  { value: 'books', label: '📚 Книги' },
  { value: 'music', label: '🎸 Музыка' },
  { value: 'other', label: '📦 Другое' },
];

const CITIES = [
  { value: 'new-york', label: 'Нью-Йорк' },
  { value: 'los-angeles', label: 'Лос-Анджелес' },
  { value: 'miami', label: 'Майами' },
  { value: 'chicago', label: 'Чикаго' },
  { value: 'boston', label: 'Бостон' },
  { value: 'san-francisco', label: 'Сан-Франциско' },
  { value: 'houston', label: 'Хьюстон' },
  { value: 'seattle', label: 'Сиэтл' },
  { value: 'dallas', label: 'Даллас' },
  { value: 'washington', label: 'Вашингтон' },
];

// Подкатегории (listingType) для разных категорий
const SUBCATEGORY_MAP: Record<string, { value: string; label: string }[]> = {
  jobs: [
    { value: 'vacancy', label: '💼 Вакансия (работодатель)' },
    { value: 'resume', label: '🙋 Ищу работу (соискатель)' },
  ],
  'real-estate': [
    { value: 'rent', label: '🔑 Снять / Сдать' },
    { value: 'sale', label: '🏷️ Купить / Продать' },
    { value: 'roommate', label: '🤝 Ищу соседа' },
  ],
  services: [
    { value: 'offer', label: '🔧 Предлагаю услугу' },
    { value: 'request', label: '🙏 Ищу специалиста' },
  ],
};

const STATUS_OPTS = [
  { value: 'active', label: '✅ Активно' },
  { value: 'closed', label: '🔒 Закрыто' },
  { value: 'pending', label: '⏳ Ожидание' },
];

type ItemType = 'listing' | 'job' | 'housing' | 'service';

interface EditItemModalProps {
  item: {
    id: string;
    _type: ItemType;
    title: string;
    description?: string;
    price?: number;
    priceType?: string;
    cityId?: string;
    status?: string;
    categoryId?: string;
    listingType?: string;
  };
  onClose: () => void;
  onSaved: (id: string, updates: Record<string, unknown>) => void;
}

const API_MAP: Record<ItemType, string> = {
  listing: 'listings',
  job: 'jobs',
  housing: 'housing',
  service: 'services',
};

export function EditItemModal({ item, onClose, onSaved }: EditItemModalProps) {
  const { user } = useAuthContext();
  const [title, setTitle] = useState(item.title);
  const [description, setDescription] = useState(item.description ?? '');
  const [price, setPrice] = useState(item.price?.toString() ?? '');
  const [cityId, setCityId] = useState(item.cityId ?? '');
  const [status, setStatus] = useState(item.status ?? 'active');
  const [categoryId, setCategoryId] = useState(item.categoryId ?? '');
  const [listingType, setListingType] = useState(item.listingType ?? '');

  // Подкатегории для выбранной категории
  const subcategories = SUBCATEGORY_MAP[categoryId] ?? [];
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  async function handleSave() {
    if (!title.trim()) { setError('Заголовок обязателен'); return; }
    setSaving(true); setError('');
    try {
      const token = await user!.getIdToken();
      const updates: Record<string, unknown> = { title, description, status, cityId };
      if (price) updates.price = parseFloat(price);
      if (categoryId) updates.categoryId = categoryId;
      if (listingType) updates.listingType = listingType;
      const res = await fetch(`/api/${API_MAP[item._type]}/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error('Ошибка сохранения');
      onSaved(item.id, updates);
      onClose();
    } catch {
      setError('Не удалось сохранить. Попробуйте снова.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full sm:max-w-lg bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-neutral-100 px-5 py-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-neutral-900">Редактировать</h2>
          <button onClick={onClose} className="text-neutral-400 hover:text-neutral-700 p-1">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Заголовок *</label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full border border-neutral-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Описание</label>
            <textarea
              rows={4}
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full border border-neutral-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Категория</label>
            <select
              value={categoryId}
              onChange={e => { setCategoryId(e.target.value); setListingType(''); }}
              className="w-full border border-neutral-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
            >
              <option value="">— не изменять —</option>
              {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
            <p className="text-xs text-neutral-400 mt-1">Если выбрать «Работа», «Жильё» или «Услуги» — объявление появится в соответствующей вкладке</p>
          </div>

          {/* Подкатегория — показывается если у выбранной категории есть варианты */}
          {subcategories.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Подкатегория</label>
              <div className="flex flex-col gap-1.5">
                {subcategories.map(sub => (
                  <button
                    key={sub.value}
                    type="button"
                    onClick={() => setListingType(sub.value)}
                    className={`text-left px-3 py-2.5 rounded-lg border text-sm transition-colors ${
                      listingType === sub.value
                        ? 'bg-primary-50 border-primary-500 text-primary-700 font-medium'
                        : 'bg-white border-neutral-200 text-neutral-700 hover:border-neutral-300'
                    }`}
                  >
                    {sub.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Цена ($)</label>
              <input
                type="number"
                value={price}
                onChange={e => setPrice(e.target.value)}
                className="w-full border border-neutral-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Город</label>
              <select
                value={cityId}
                onChange={e => setCityId(e.target.value)}
                className="w-full border border-neutral-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
              >
                <option value="">Не выбран</option>
                {CITIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Статус</label>
            <div className="flex gap-2">
              {STATUS_OPTS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setStatus(opt.value)}
                  className={`flex-1 text-sm py-2 rounded-lg border transition-colors ${
                    status === opt.value
                      ? 'bg-primary-600 text-white border-primary-600'
                      : 'bg-white text-neutral-700 border-neutral-300 hover:border-primary-400'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {error && <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-neutral-100 px-5 py-4 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 border border-neutral-300 rounded-lg text-sm font-medium text-neutral-700 hover:bg-neutral-50"
          >
            Отмена
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-2.5 bg-primary-600 text-white rounded-lg text-sm font-bold hover:bg-primary-700 disabled:opacity-50"
          >
            {saving ? 'Сохранение...' : '💾 Сохранить'}
          </button>
        </div>
      </div>
    </div>
  );
}
