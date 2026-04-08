import { z } from 'zod';
import { MAX_TITLE_LENGTH, MAX_DESCRIPTION_LENGTH } from '@/lib/constants/limits';

/**
 * Схема для формы создания/редактирования объявления
 */
export const listingSchema = z.object({
  title: z
    .string()
    .min(3, 'Заголовок должен содержать минимум 3 символа')
    .max(MAX_TITLE_LENGTH, `Максимум ${MAX_TITLE_LENGTH} символов`),
  description: z
    .string()
    .min(10, 'Описание должно содержать минимум 10 символов')
    .max(MAX_DESCRIPTION_LENGTH, `Максимум ${MAX_DESCRIPTION_LENGTH} символов`),
  categoryId: z.string().min(1, 'Выберите категорию'),
  cityId: z.string().min(1, 'Выберите город'),
  priceType: z.enum(['fixed', 'negotiable', 'free']),
  price: z.number().min(0, 'Цена не может быть отрицательной').nullable(),
  contact: z.object({
    phone: z.string().optional(),
    whatsapp: z.string().optional(),
    telegram: z.string().optional(),
  }).refine(
    (contact) => contact.phone || contact.whatsapp || contact.telegram,
    { message: 'Укажите хотя бы один способ связи' }
  ),
}).refine(
  (data) => {
    // Если цена фиксированная — она должна быть указана
    if (data.priceType === 'fixed') {
      return data.price !== null && data.price > 0;
    }
    return true;
  },
  {
    message: 'Укажите цену',
    path: ['price'],
  }
);

/**
 * Схема для формы регистрации
 */
export const registerSchema = z.object({
  displayName: z
    .string()
    .min(2, 'Имя должно содержать минимум 2 символа')
    .max(50, 'Максимум 50 символов'),
  email: z
    .string()
    .email('Введите корректный email'),
  password: z
    .string()
    .min(6, 'Пароль должен содержать минимум 6 символов')
    .max(100, 'Максимум 100 символов'),
  confirmPassword: z.string(),
}).refine(
  (data) => data.password === data.confirmPassword,
  {
    message: 'Пароли не совпадают',
    path: ['confirmPassword'],
  }
);

/**
 * Схема для формы входа
 */
export const loginSchema = z.object({
  email: z.string().email('Введите корректный email'),
  password: z.string().min(1, 'Введите пароль'),
});

export type ListingFormData = z.infer<typeof listingSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;
