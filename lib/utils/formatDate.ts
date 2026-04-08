import { formatDistanceToNow, isToday, isYesterday, format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Timestamp } from 'firebase/firestore';

/**
 * Конвертирует Firebase Timestamp или Date в объект Date
 */
function toDate(value: Timestamp | Date | number): Date {
  if (value instanceof Timestamp) return value.toDate();
  if (value instanceof Date) return value;
  return new Date(value);
}

/**
 * Форматирует дату в человекочитаемый вид:
 * "Сегодня", "Вчера", "5 дней назад" или "15 марта 2024"
 */
export function formatDate(value: Timestamp | Date | number): string {
  const date = toDate(value);

  if (isToday(date)) return 'Сегодня';
  if (isYesterday(date)) return 'Вчера';

  const daysDiff = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));

  // Показываем "N дней назад" для дат до 7 дней
  if (daysDiff <= 7) {
    return formatDistanceToNow(date, { addSuffix: true, locale: ru });
  }

  // Для более старых дат показываем полную дату
  return format(date, 'd MMMM yyyy', { locale: ru });
}

/**
 * Краткий формат даты для карточек: "Сегодня", "Вчера", "15 марта"
 */
export function formatDateShort(value: Timestamp | Date | number): string {
  const date = toDate(value);

  if (isToday(date)) return 'Сегодня';
  if (isYesterday(date)) return 'Вчера';

  return format(date, 'd MMMM', { locale: ru });
}
