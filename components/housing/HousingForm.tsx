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
import { createHousingListing } from '@/lib/firebase/housing';
import { uploadPhoto } from '@/lib/firebase/storage';
import { PROPERTY_TYPE_LABELS, type Housing } from '@/types';
import { MAX_PHOTOS, ALLOWED_PHOTO_TYPES, MAX_PHOTO_SIZE_MB } from '@/lib/constants/limits';

// Схема валидации формы жилья
const housingSchema = z.object({
  title: z.string().min(3, 'Минимум 3 символа').max(100, 'Максимум 100 символов'),
  description: z.string().min(10, 'Минимум 10 символов').max(5000, 'Максимум 5000 символов'),
  listingType: z.enum(['rent', 'sale']),
  propertyType: z.enum(['apartment', 'house', 'room', 'studio', 'commercial']),
  bedrooms: z.number().min(0).max(4),
  bathrooms: z.number().min(1).optional(),
  sqft: z.number().min(1).optional(),
  price: z.number().min(1, 'Укажите цену'),
  utilitiesIncluded: z.boolean(),
  petFriendly: z.boolean(),
  cityId: z.string().min(1, 'Выберите город'),
  neighborhood: z.string().max(100).optional(),
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

type HousingFormData = z.infer<typeof housingSchema>;

/**
 * Форма создания объявления о жилье.
 */
export function HousingForm() {
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
  } = useForm<HousingFormData>({
    resolver: zodResolver(housingSchema),
    defaultValues: {
      listingType: 'rent',
      propertyType: 'apartment',
      bedrooms: 1,
      utilitiesIncluded: false,
      petFriendly: false,
    },
  });

  const listingType = watch('listingType');

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

  const onSubmit = async (data: HousingFormData) => {
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

      const listingId = await createHousingListing(
        {
          title: data.title,
          description: data.description,
          listingType: data.listingType,
          propertyType: data.propertyType,
          bedrooms: data.bedrooms as Housing['bedrooms'],
          bathrooms: data.bathrooms || undefined,
          sqft: data.sqft || undefined,
          price: data.price,
          utilitiesIncluded: data.utilitiesIncluded,
          petFriendly: data.petFriendly,
          cityId: data.cityId,
          neighborhood: data.neighborhood || undefined,
          photos: photoUrls,
          contact: {
            name: data.contact.name,
            phone: data.contact.phone || undefined,
            whatsapp: data.contact.whatsapp || undefined,
            telegram: data.contact.telegram || undefined,
            email: data.contact.email || undefined,
          },
          // authorId и authorName добавляются в createHousingListing
          authorId: user.uid,
          authorName: user.displayName || 'Пользователь',
        },
        user
      );
      router.push(`/housing/${listingId}`);
    } catch (err) {
      console.error(err);
      setServerError('Не удалось сохранить объявление. Попробуйте ещё раз.');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white rounded-xl border border-gray-200 p-6">
      {/* Тип сделки */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Тип сделки *</label>
        <div className="flex gap-4">
          {(['rent', 'sale'] as const).map((type) => (
            <label key={type} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                value={type}
                className="text-blue-600"
                {...register('listingType')}
              />
              <span className="text-sm">{type === 'rent' ? 'Аренда' : 'Продажа'}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Тип недвижимости и город */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Controller
          name="propertyType"
          control={control}
          render={({ field }) => (
            <Select
              label="Тип недвижимости *"
              placeholder="Выберите"
              error={errors.propertyType?.message}
              options={Object.entries(PROPERTY_TYPE_LABELS).map(([v, l]) => ({ value: v, label: l }))}
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

      {/* Количество спален, ванных, площадь */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Controller
          name="bedrooms"
          control={control}
          render={({ field }) => (
            <Select
              label="Спальни *"
              error={errors.bedrooms?.message}
              options={[
                { value: '0', label: 'Студия' },
                { value: '1', label: '1 спальня' },
                { value: '2', label: '2 спальни' },
                { value: '3', label: '3 спальни' },
                { value: '4', label: '4+ спальни' },
              ]}
              value={String(field.value)}
              onChange={(v) => field.onChange(Number(v))}
            />
          )}
        />
        <Controller
          name="bathrooms"
          control={control}
          render={({ field }) => (
            <Input
              label="Ванных"
              type="number"
              placeholder="1"
              error={errors.bathrooms?.message}
              value={field.value ?? ''}
              onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
            />
          )}
        />
        <Controller
          name="sqft"
          control={control}
          render={({ field }) => (
            <Input
              label="Площадь (кв. фут)"
              type="number"
              placeholder="800"
              error={errors.sqft?.message}
              value={field.value ?? ''}
              onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
            />
          )}
        />
      </div>

      {/* Цена */}
      <Controller
        name="price"
        control={control}
        render={({ field }) => (
          <Input
            label={`Цена ($)${listingType === 'rent' ? ' в месяц' : ''} *`}
            type="number"
            placeholder="1500"
            error={errors.price?.message}
            value={field.value ?? ''}
            onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
          />
        )}
      />

      {/* Район */}
      <Input
        label="Район / Адрес"
        placeholder="Downtown, 5th Ave..."
        {...register('neighborhood')}
      />

      {/* Дополнительные опции */}
      <div className="flex flex-wrap gap-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" className="rounded text-blue-600" {...register('utilitiesIncluded')} />
          <span className="text-sm text-gray-700">Коммунальные включены</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" className="rounded text-blue-600" {...register('petFriendly')} />
          <span className="text-sm text-gray-700">Можно с животными</span>
        </label>
      </div>

      {/* Заголовок */}
      <Input
        label="Заголовок объявления *"
        placeholder="Просторная 2-спальная квартира в центре"
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
            placeholder="Опишите жильё подробнее..."
            rows={5}
            error={errors.description?.message}
            {...field}
          />
        )}
      />

      {/* Фото */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">Фотографии (до {MAX_PHOTOS})</label>
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
        {isSubmitting ? 'Публикуем...' : 'Опубликовать объявление'}
      </Button>
    </form>
  );
}
