'use client'
import { useEffect, useState } from 'react'

/**
 * Граница ошибки для всего приложения (кроме входа).
 *
 * Было: любой необработанный сбой рендера показывал голый экран Next —
 * «This page couldn't load», и единственным лечением было руками жать
 * Reload. Чаще всего сбой разовый (холодный старт функции, сетевая запинка
 * к Supabase) — вторая попытка проходит сама. Поэтому при первом сбое молча
 * пробуем `retry()` один раз, и только если он тоже не помог за 10 секунд —
 * показываем кнопку.
 *
 * Защита от цикла (sessionStorage, а не переменная в модуле): модуль
 * пересоздаётся при каждом новом рендере границы, а sessionStorage живёт
 * весь вкладочный сеанс, поэтому именно он помнит, что попытка уже была.
 */
const KEY = 'teremok_retry_at'
const WINDOW_MS = 10_000

export default function Error({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  // Решаем один раз при маунте, читая прошлую попытку: это не эффект
  // (ничего не меняет снаружи), а вычисление начального состояния.
  const [showButton] = useState(() => {
    try { return Date.now() - Number(sessionStorage.getItem(KEY) || 0) <= WINDOW_MS } catch { return false }
  })

  useEffect(() => {
    console.error('[teremok] render error', error)
    if (showButton) return
    try { sessionStorage.setItem(KEY, String(Date.now())) } catch {}
    retry()
  }, [error, retry, showButton])

  if (!showButton) return null
  return (
    <div className="flex min-h-[60dvh] flex-col items-center justify-center gap-4 px-6 text-center">
      <div className="text-lg font-medium">Не получилось загрузить страницу</div>
      <div className="text-sm text-[var(--muted)]">
        Похоже на временный сбой{error.digest ? ` (код ${error.digest})` : ''}. Попробуйте ещё раз.
      </div>
      <button
        className="btn px-6"
        onClick={() => {
          try { sessionStorage.removeItem(KEY) } catch {}
          retry()
        }}
      >
        Обновить
      </button>
    </div>
  )
}
