/**
 * Оборачивает Promise с таймаутом.
 * Если запрос не завершается за ms миллисекунд — отклоняется с ошибкой.
 */
export function withTimeout<T>(promise: Promise<T>, ms = 10000): Promise<T> {
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error(`Firestore timeout after ${ms}ms`)), ms)
  );
  return Promise.race([promise, timeout]);
}
