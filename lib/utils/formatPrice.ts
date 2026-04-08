import type { PriceType } from '@/types';

/**
 * Форматирует цену объявления для отображения
 */
export function formatPrice(price: number | null, priceType: PriceType): string {
  if (priceType === 'free') return 'Бесплатно';
  if (priceType === 'negotiable') return 'Договорная';

  // Фиксированная цена
  if (price === null || price === 0) return 'Цена не указана';

  return `$${price.toLocaleString('ru-RU')}`;
}
