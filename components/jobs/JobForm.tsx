'use client';

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
import { createJob } from '@/lib/firebase/jobs';
import {
  JOB_TYPE_LABELS,
  JOB_CATEGORY_LABELS,
  SALARY_PERIOD_LABELS,
} from '@/types';
import { useState } from 'react';

// Схема валидации формы вакансии
const jobSchema = z.object({
  title: z.string().min(3, 'Минимум 3 символа').max(100, 'Максимум 100 символов'),
  description: z.string().min(10, 'Минимум 10 символов').max(5000, 'Максимум 5000 символов'),
  jobType: z.enum(['full-time', 'part-time', 'contract', 'freelance', 'internship']),
  category: z.enum(['construction', 'hvac', 'nanny', 'beauty', 'restaurant', 'auto-repair', 'driving', 'trucking', 'warehouse', 'office', 'caregiver', 'retail', 'remote', 'dispatch', 'moving', 'student', 'medical', 'sales', 'education', 'it', 'telecom', 'sewing', 'events', 'cleaning', 'other']),
  salaryMin: z.number().min(0).optional(),
  salaryMax: z.number().min(0).optional(),
  salaryPeriod: z.enum(['hour', 'week', 'month', 'year']).optional(),
  salaryNegotiable: z.boolean(),
  cityId: z.string().min(1, 'Выберите город'),
  requirements: z.string().max(3000, 'Максимум 3000 символов').optional(),
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

type JobFormData = z.infer<typeof jobSchema>;

/**
 * Форма создания вакансии.
 */
export function JobForm() {
  const router = useRouter();
  const { user } = useAuthContext();
  const { cities } = useCities();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<JobFormData>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      salaryNegotiable: false,
    },
  });

  const salaryNegotiable = watch('salaryNegotiable');

  const onSubmit = async (data: JobFormData) => {
    if (!user) return;
    setServerError(null);

    try {
      const jobId = await createJob(
        {
          title: data.title,
          description: data.description,
          jobType: data.jobType,
          category: data.category,
          salaryMin: data.salaryMin || undefined,
          salaryMax: data.salaryMax || undefined,
          salaryPeriod: data.salaryPeriod || undefined,
          salaryNegotiable: data.salaryNegotiable,
          cityId: data.cityId,
          requirements: data.requirements || undefined,
          contact: {
            name: data.contact.name,
            phone: data.contact.phone || undefined,
            whatsapp: data.contact.whatsapp || undefined,
            telegram: data.contact.telegram || undefined,
            email: data.contact.email || undefined,
          },
          // authorId и authorName добавляются в createJob
          authorId: user.uid,
          authorName: user.displayName || 'Пользователь',
        },
        user
      );
      router.push(`/jobs/${jobId}`);
    } catch (err) {
      console.error(err);
      setServerError('Не удалось сохранить вакансию. Попробуйте ещё раз.');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white rounded-xl border border-gray-200 p-6">
      {/* Заголовок */}
      <Input
        label="Название вакансии *"
        placeholder="Например: Frontend Developer"
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
            placeholder="Опишите обязанности, условия работы..."
            rows={5}
            error={errors.description?.message}
            {...field}
          />
        )}
      />

      {/* Тип занятости и категория */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Controller
          name="jobType"
          control={control}
          render={({ field }) => (
            <Select
              label="Тип занятости *"
              placeholder="Выберите тип"
              error={errors.jobType?.message}
              options={Object.entries(JOB_TYPE_LABELS).map(([v, l]) => ({ value: v, label: l }))}
              {...field}
            />
          )}
        />

        <Controller
          name="category"
          control={control}
          render={({ field }) => (
            <Select
              label="Категория *"
              placeholder="Выберите категорию"
              error={errors.category?.message}
              options={Object.entries(JOB_CATEGORY_LABELS).map(([v, l]) => ({ value: v, label: l }))}
              {...field}
            />
          )}
        />
      </div>

      {/* Зарплата */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">Зарплата</label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            className="rounded text-blue-600"
            {...register('salaryNegotiable')}
          />
          <span className="text-sm text-gray-700">Договорная</span>
        </label>

        {!salaryNegotiable && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Controller
              name="salaryMin"
              control={control}
              render={({ field }) => (
                <Input
                  label="От ($)"
                  type="number"
                  placeholder="0"
                  error={errors.salaryMin?.message}
                  value={field.value ?? ''}
                  onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                />
              )}
            />
            <Controller
              name="salaryMax"
              control={control}
              render={({ field }) => (
                <Input
                  label="До ($)"
                  type="number"
                  placeholder="0"
                  error={errors.salaryMax?.message}
                  value={field.value ?? ''}
                  onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                />
              )}
            />
            <Controller
              name="salaryPeriod"
              control={control}
              render={({ field }) => (
                <Select
                  label="Период"
                  placeholder="Выберите"
                  error={errors.salaryPeriod?.message}
                  options={Object.entries(SALARY_PERIOD_LABELS).map(([v, l]) => ({ value: v, label: l }))}
                  {...field}
                />
              )}
            />
          </div>
        )}
      </div>

      {/* Город */}
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

      {/* Требования */}
      <Controller
        name="requirements"
        control={control}
        render={({ field }) => (
          <Textarea
            label="Требования к кандидату"
            placeholder="Опыт работы, навыки, образование..."
            rows={3}
            error={errors.requirements?.message}
            {...field}
          />
        )}
      />

      {/* Контакты */}
      <div className="space-y-3">
        <p className="text-sm font-medium text-gray-700">Контактная информация</p>
        <Input
          label="Имя контактного лица *"
          placeholder="Имя или название компании"
          error={errors.contact?.name?.message}
          {...register('contact.name')}
        />
        {errors.contact?.message && (
          <p className="text-xs text-red-500">{errors.contact.message as string}</p>
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
          placeholder="@username"
          {...register('contact.telegram')}
        />
        <Input
          label="Email"
          type="email"
          placeholder="example@email.com"
          error={errors.contact?.email?.message}
          {...register('contact.email')}
        />
      </div>

      {serverError && (
        <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{serverError}</p>
      )}

      <Button type="submit" variant="primary" size="lg" fullWidth loading={isSubmitting}>
        {isSubmitting ? 'Публикуем...' : 'Опубликовать вакансию'}
      </Button>
    </form>
  );
}
