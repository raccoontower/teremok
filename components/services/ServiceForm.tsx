'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { useAuthContext } from '@/contexts/AuthContext';
import { useCities } from '@/hooks/useCities';
import { createService } from '@/lib/firebase/services';
import { uploadPhoto } from '@/lib/firebase/storage';
import { SERVICE_CATEGORY_LABELS, SERVICE_AREA_LABELS } from '@/types';
import { MAX_PHOTOS, ALLOWED_PHOTO_TYPES, MAX_PHOTO_SIZE_MB } from '@/lib/constants/limits';

// Схема валидации формы услуги
const serviceSchema = z.object({
  title: z.string().min(3, 'Минимум 3 символа').max(100, 'Максимум 100 символов'),
  description: z.string().min(10, 'Минимум 10 символов').max(5000, 'Максимум 5000 символов'),
  category: z.enum(['plumbing', 'electrical', 'repair', 'cleaning', 'it', 'tutoring', 'beauty', 'legal', 'accounting', 'translation', 'moving', 'other']),
  priceType: z.enum(['fixed', 'hourly', 'negotiable']),
  price: z.number().min(0).optional(),
  serviceArea: z.enum(['local', 'remote', 'both']),
  experience: z.number().min(0).max(50).optional(),
  languages: z.string(), // Comma-separated string, преобразуем при сохранении
  cityId: z.string().min(1, 'Выберите город'),
  contact: z.object({
    name: z.string().min(1, 'Укажите имя'),
    phone: z.string().optional(),
    whatsapp: z.string().optional(),
    telegram: z.string().optional(),
    email: z.string().email('Некорректный email').optional().or(z.literal('')),
  }).refine(
    (c) => c.phone || c.whatsapp || c.telegram || c.email,
    { message: 'Укажите хотя бы один способ связи' }
  ),
});

type ServiceFormData = z.infer<typeof serviceSchema>;

/**
 * Форма создания услуги.
 */
export function ServiceForm() {
  const router = useRouter();
  const { user } = useAuthContext();
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
  } = useForm<ServiceFormData>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      priceType: 'negotiable',
      serviceArea: 'local',
      languages: 'Русский',
    },
  });

  const priceType = watch('priceType');

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setPhotoError(null);
    for (const file of files) {
      if (!ALLOWED_PHOTO_TYPES.includes(file.type)) {
        setPhotoError('Разрешены только JPEG, PNG, WebP');
        return;
      }
      if (file.size > MAX_PHOTO_SIZE_MB * 1024 * 1024) {
        setPhotoError(`Максимальный размер — ${MAX_PHOTO_SIZE_MB} МБ`);
        return;
      }
    }
    setPhotos([...photos, ...files].slice(0, MAX_PHOTOS));
  };

  const onSubmit = async (data: ServiceFormData) => {
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

      // Преобразуем строку языков в массив
      const languages = data.languages
        .split(',')
        .map((l) => l.trim())
        .filter(Boolean);

      const serviceId = await createService(
        {
          title: data.title,
          description: data.description,
          category: data.category,
          priceType: data.priceType,
          price: data.price || undefined,
          serviceArea: data.serviceArea,
          experience: data.experience || undefined,
          languages,
          cityId: data.cityId,
          photos: photoUrls,
          contact: {
            name: data.contact.name,
            phone: data.contact.phone || undefined,
            whatsapp: data.contact.whatsapp || undefined,
            telegram: data.contact.telegram || undefined,
            email: data.contact.email || undefined,
          },
          // authorId и authorName добавляются в createService
          authorId: user.uid,
          authorName: user.displayName || 'Пользователь',
        },
        user
      );
      router.push(`/services/${serviceId}`);
    } catch (err) {
      console.error(err);
      setServerError('Не удалось сохранить услугу. Попробуйте ещё раз.');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white rounded-xl border border-gray-200 p-6">
      {/* Заголовок */}
      <Input
        label="Название услуги *"
        placeholder="Например: Ремонт сантехники, выезд в день обращения"
        error={errors.title?.message}
        {...register('title')}
      />

      {/* Категория */}
      <Controller
        name="category"
        control={control}
        render={({ field }) => (
          <Select
            label="Категория *"
            placeholder="Выберите категорию"
            error={errors.category?.message}
            options={Object.entries(SERVICE_CATEGORY_LABELS).map(([v, l]) => ({ value: v, label: l }))}
            {...field}
          />
        )}
      />

      {/* Описание */}
      <Controller
        name="description"
        control={control}
        render={({ field }) => (
          <Textarea
            label="Описание *"
            placeholder="Расскажите о своих услугах подробнее..."
            rows={5}
            error={errors.description?.message}
            {...field}
          />
        )}
      />

      {/* Тип цены и стоимость */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">Стоимость</label>
        <Controller
          name="priceType"
          control={control}
          render={({ field }) => (
            <Select
              label="Тип цены"
              options={[
                { value: 'negotiable', label: 'Договорная' },
                { value: 'fixed', label: 'Фиксированная' },
                { value: 'hourly', label: 'Почасовая' },
              ]}
              {...field}
            />
          )}
        />
        {priceType !== 'negotiable' && (
          <Controller
            name="price"
            control={control}
            render={({ field }) => (
              <Input
                label={`Цена ($)${priceType === 'hourly' ? ' в час' : ''}`}
                type="number"
                placeholder="0"
                error={errors.price?.message}
                value={field.value ?? ''}
                onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
              />
            )}
          />
        )}
      </div>

      {/* Зона работы и город */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Controller
          name="serviceArea"
          control={control}
          render={({ field }) => (
            <Select
              label="Зона работы *"
              error={errors.serviceArea?.message}
              options={Object.entries(SERVICE_AREA_LABELS).map(([v, l]) => ({ value: v, label: l }))}
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
              options={cities.map((c) => ({ value: c.slug, label: c.name }))}
              {...field}
            />
          )}
        />
      </div>

      {/* Опыт и языки */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Controller
          name="experience"
          control={control}
          render={({ field }) => (
            <Input
              label="Опыт работы (лет)"
              type="number"
              placeholder="5"
              error={errors.experience?.message}
              value={field.value ?? ''}
              onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
            />
          )}
        />
        <Input
          label="Языки (через запятую)"
          placeholder="Русский, Английский"
          error={errors.languages?.message}
          {...register('languages')}
        />
      </div>

      {/* Фото */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">Фото работ / аватар (до {MAX_PHOTOS})</label>
        {photos.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {photos.map((file, idx) => (
              <div key={idx} className="relative group">
                {/* Нативный img — намеренно. Next.js Image не поддерживает blob: URLs */}
                <img src={URL.createObjectURL(file)} alt={`Фото ${idx + 1}`} className="w-20 h-20 object-cover rounded-lg border border-gray-200" />
                {isSubmitting && uploadProgress[idx] !== undefined && uploadProgress[idx] < 100 && (
                  <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                    <span className="text-white text-xs font-bold">{uploadProgress[idx]}%</span>
                  </div>
                )}
                {!isSubmitting && (
                  <button
                    type="button"
                    onClick={() => setPhotos(photos.filter((_, i) => i !== idx))}
                    className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >×</button>
                )}
              </div>
            ))}
          </div>
        )}
        {photos.length < MAX_PHOTOS && (
          <label className="flex items-center gap-2 cursor-pointer w-fit">
            <input type="file" accept={ALLOWED_PHOTO_TYPES.join(',')} multiple onChange={handlePhotoChange} className="hidden" />
            <div className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors">
              📷 Добавить фото
            </div>
          </label>
        )}
        {photoError && <p className="text-xs text-red-500">{photoError}</p>}
      </div>

      {/* Контакты */}
      <div className="space-y-3">
        <p className="text-sm font-medium text-gray-700">Контактная информация</p>
        <Input label="Имя *" placeholder="Ваше имя" error={errors.contact?.name?.message} {...register('contact.name')} />
        {errors.contact?.message && <p className="text-xs text-red-500">{errors.contact.message as string}</p>}
        <Input label="Телефон" type="tel" placeholder="+1 555 123 4567" {...register('contact.phone')} />
        <Input label="WhatsApp" type="tel" placeholder="+1 555 123 4567" {...register('contact.whatsapp')} />
        <Input label="Telegram" placeholder="@username" {...register('contact.telegram')} />
        <Input label="Email" type="email" placeholder="example@email.com" error={errors.contact?.email?.message} {...register('contact.email')} />
      </div>

      {serverError && (
        <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{serverError}</p>
      )}

      <Button type="submit" variant="primary" size="lg" fullWidth loading={isSubmitting}>
        {isSubmitting ? 'Публикуем...' : 'Опубликовать услугу'}
      </Button>
    </form>
  );
}
