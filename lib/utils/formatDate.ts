import { formatDistanceToNow, isToday, isYesterday, format } from 'date-fns';
import { ru } from 'date-fns/locale';

/**
 * Конвертирует любое представление даты в объект Date.
 * Поддерживает: ISO строку (из API), Firestore Timestamp, Date, number, {seconds}.
 */
function toDate(value: unknown): Date {
  if (!value) return new Date(0);
  if (value instanceof Date) return value;
  if (typeof value === 'string') return new Date(value);
  if (typeof value === 'number') return new Date(value);
  if (typeof value === 'object' && value !== null) {
    // Firestore Timestamp (web SDK)
    if ('toDate' in value && typeof (value as {toDate: () => Date}).toDate === 'function') {
      return (value as {toDate: () => Date}).toDate();
    }
    // Сериализованный Admin Timestamp {seconds, nanoseconds} или {_seconds, _nanoseconds}
    const ts = value as Record<string, unknown>;
    const secs = (ts.seconds ?? ts._seconds) as number | undefined;
    if (typeof secs === 'number') return new Date(secs * 1000);
  }
  return new Date(0);
}

/**
 * Форматирует дату в человекочитаемый вид:
 * "Сегодня", "Вчера", "5 дней назад" или "15 марта 2024"
 */
export function formatDate(value: unknown): string {
  const date = toDate(value);
  if (isNaN(date.getTime()) || date.getTime() === 0) return '';

  if (isToday(date)) return 'Сегодня';
  if (isYesterday(date)) return 'Вчера';

  const daysDiff = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (daysDiff <= 7) return formatDistanceToNow(date, { addSuffix: true, locale: ru });

  return format(date, 'd MMMM yyyy', { locale: ru });
}

/**
 * Краткий формат даты для карточек: "Сегодня", "Вчера", "15 марта"
 */
export function formatDateShort(value: unknown): string {
  const date = toDate(value);
  if (isNaN(date.getTime()) || date.getTime() === 0) return '';

  if (isToday(date)) return 'Сегодня';
  if (isYesterday(date)) return 'Вчера';

  return format(date, 'd MMMM', { locale: ru });
}
