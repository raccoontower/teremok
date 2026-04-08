'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { useAuthContext } from '@/contexts/AuthContext';
import { useCategories } from '@/hooks/useCategories';
import { useCities } from '@/hooks/useCities';

import { uploadPhoto } from '@/lib/firebase/storage';
import { listingSchema, type ListingFormData } from '@/lib/utils/validators';
import { ROUTES } from '@/lib/constants/routes';
import { MAX_PHOTOS, MAX_DESCRIPTION_LENGTH, ALLOWED_PHOTO_TYPES, MAX_PHOTO_SIZE_MB } from '@/lib/constants/limits';

export function ListingForm() {
  const router = useRouter();
  const { user } = useAuthContext();
  const { categories } = useCategories();
  const { cities } = useCities();

  const [photos, setPhotos] = useState<File[]>([]);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number[]>([]);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ListingFormData>({
    resolver: zodResolver(listingSchema),
    defaultValues: {
      priceType: 'fixed',
      price: null,
      contact: {},
    },
  });

  const priceType = watch('priceType');
  const description = watch('description') || '';

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setPhotoError(null);

    for (const file of files) {
      if (!ALLOWED_PHOTO_TYPES.includes(file.type)) {
        setPhotoError('Разрешены только JPEG, PNG, WebP');
        return;
      }
      if (file.size > MAX_PHOTO_SIZE_MB * 1024 * 1024) {
        setPhotoError(`Максимальный размер файла — ${MAX_PHOTO_SIZE_MB} МБ`);
        return;
      }
    }

    const newPhotos = [...photos, ...files].slice(0, MAX_PHOTOS);
    setPhotos(newPhotos);
  };

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: ListingFormData) => {
    if (!user) return;

    setServerError(null);
    setUploadProgress(new Array(photos.length).fill(0));

    try {
      // Загружаем фото параллельно
      const photoUrls = await Promise.all(
        photos.map((file, idx) =>
          uploadPhoto(file, user.uid, (progress) => {
            setUploadProgress((prev) => {
              const next = [...prev];
              next[idx] = progress;
              return next;
            });
          })
        )
      );

      // Создаём объявление через API route
      const token = await user.getIdToken();
      const res = await fetch('/api/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ ...data, photos: photoUrls }),
      });
      if (!res.ok) throw new Error('API error');
      const { id: listingId } = await res.json() as { id: string };

      router.push(ROUTES.listing(listingId));
    } catch (err) {
      console.error(err);
      setServerError('Не удалось сохранить объявление. Попробуйте ещё раз.');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white rounded-xl border border-gray-200 p-6">
      {/* Заголовок */}
      <Input
        label="Заголовок *"
        placeholder="Например: iPhone 14 Pro, 256GB, черный"
        error={errors.title?.message}
        {...register('title')}
      />

      {/* Описание */}
      <Controller
        name="description"
        control={control}
        render={({ field }) => (
          <Textarea
            label="Описание *"
            placeholder="Подробно опишите товар или услугу..."
            rows={5}
            error={errors.description?.message}
            maxLength={MAX_DESCRIPTION_LENGTH}
            currentLength={description.length}
            {...field}
          />
        )}
      />

      {/* Категория и город */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Controller
          name="categoryId"
          control={control}
          render={({ field }) => (
            <Select
              label="Категория *"
              placeholder="Выберите категорию"
              error={errors.categoryId?.message}
              options={categories.map((cat) => ({
                value: cat.slug,
                label: cat.icon ? `${cat.icon} ${cat.name}` : cat.name,
              }))}
              {...field}
            />
          )}
        />

        <Controller
          name="cityId"
          control={control}
          render={({ field }) => (
            <Select
              label="Город *"
              placeholder="Выберите город"
              error={errors.cityId?.message}
              options={cities.map((city) => ({
                value: city.slug,
                label: city.name,
              }))}
              {...field}
            />
          )}
        />
      </div>

      {/* Цена */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">Цена</label>
        <div className="flex gap-3 flex-wrap">
          {(['fixed', 'negotiable', 'free'] as const).map((type) => {
            const labels = { fixed: 'Фиксированная', negotiable: 'Договорная', free: 'Бесплатно' };
            return (
              <label key={type} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value={type}
                  className="text-primary-600 focus:ring-primary-500"
                  {...register('priceType')}
                />
                <span className="text-sm text-gray-700">{labels[type]}</span>
              </label>
            );
          })}
        </div>

        {priceType === 'fixed' && (
          <Controller
            name="price"
            control={control}
            render={({ field }) => (
              <Input
                type="number"
                placeholder="Введите цену в $"
                error={errors.price?.message}
                value={field.value ?? ''}
                onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
              />
            )}
          />
        )}
      </div>

      {/* Контакты */}
      <div className="space-y-3">
        <p className="text-sm font-medium text-gray-700">Контакты (минимум один) *</p>
        {errors.contact && typeof errors.contact.message === 'string' && (
          <p className="text-xs text-red-500">{errors.contact.message}</p>
        )}
        <Input
          label="Телефон"
          type="tel"
          placeholder="+1 555 123 4567"
          {...register('contact.phone')}
        />
        <Input
          label="WhatsApp"
          type="tel"
          placeholder="+1 555 123 4567"
          {...register('contact.whatsapp')}
        />
        <Input
          label="Telegram"
          placeholder="@username или номер телефона"
          {...register('contact.telegram')}
        />
      </div>

      {/* Фото */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          Фотографии (до {MAX_PHOTOS})
        </label>

        {/* Миниатюры загруженных фото */}
        {photos.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {photos.map((file, idx) => (
              <div key={idx} className="relative group">
                {/* Нативный img — намеренно. Next.js Image не поддерживает blob: URLs */}
                <img
                  src={URL.createObjectURL(file)}
                  alt={`Фото ${idx + 1}`}
                  className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                />
                {/* Прогресс загрузки */}
                {isSubmitting && uploadProgress[idx] !== undefined && uploadProgress[idx] < 100 && (
                  <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                    <span className="text-white text-xs font-bold">{uploadProgress[idx]}%</span>
                  </div>
                )}
                {/* Кнопка удаления */}
                {!isSubmitting && (
                  <button
                    type="button"
                    onClick={() => removePhoto(idx)}
                    className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {photos.length < MAX_PHOTOS && (
          <label className="flex items-center gap-2 cursor-pointer w-fit">
            <input
              type="file"
              accept={ALLOWED_PHOTO_TYPES.join(',')}
              multiple
              onChange={handlePhotoChange}
              className="hidden"
            />
            <div className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-600 hover:border-primary-400 hover:text-primary-600 transition-colors">
              📷 Добавить фото
            </div>
          </label>
        )}

        {photoError && <p className="text-xs text-red-500">{photoError}</p>}
      </div>

      {serverError && (
        <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">
          {serverError}
        </p>
      )}

      <Button
        type="submit"
        variant="primary"
        size="lg"
        fullWidth
        loading={isSubmitting}
      >
        {isSubmitting ? 'Публикуем...' : 'Опубликовать объявление'}
      </Button>
    </form>
  );
}
