import type { firestore } from 'firebase-admin';

type AdminTimestamp = firestore.Timestamp;

/**
 * Конвертирует Firestore Admin Timestamp в ISO строку.
 * При сериализации через JSON.stringify Admin Timestamps превращаются в
 * {_seconds, _nanoseconds} — это не является валидной датой на клиенте.
 */
function convertTimestamp(value: unknown): unknown {
  if (!value || typeof value !== 'object') return value;
  const ts = value as AdminTimestamp;
  if (typeof ts.toDate === 'function') {
    return ts.toDate().toISOString();
  }
  // Уже был сериализован как {_seconds, _nanoseconds}
  const plain = value as Record<string, unknown>;
  if ('_seconds' in plain && typeof plain._seconds === 'number') {
    return new Date(plain._seconds * 1000).toISOString();
  }
  return value;
}

/**
 * Рекурсивно конвертирует все Timestamps в документе в ISO строки.
 */
export function serializeDoc(data: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    result[key] = convertTimestamp(value);
  }
  return result;
}
