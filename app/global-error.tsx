'use client'
import { useEffect, useState } from 'react'

/**
 * Граница ошибки для корневого layout (сбой до того, как успел отрисоваться
 * даже каркас с шрифтами и `globals.css` — сюда глобальные стили не
 * доходят, поэтому инлайн-стили). Та же логика, что в `(app)/error.tsx`:
 * первый сбой лечим сами одним `retry()`, кнопку по-русски показываем
 * только если за 10 секунд не помогло.
 */
const KEY = 'teremok_retry_at'
const WINDOW_MS = 10_000

export default function GlobalError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  // Решаем один раз при маунте, читая прошлую попытку: это не эффект
  // (ничего не меняет снаружи), а вычисление начального состояния.
  const [showButton] = useState(() => {
    try { return Date.now() - Number(sessionStorage.getItem(KEY) || 0) <= WINDOW_MS } catch { return false }
  })

  useEffect(() => {
    console.error('[teremok] global render error', error)
    if (showButton) return
    try { sessionStorage.setItem(KEY, String(Date.now())) } catch {}
    retry()
  }, [error, retry, showButton])

  return (
    <html lang="ru">
      <body style={{
        background: '#07090d', color: '#fff', minHeight: '100dvh', margin: 0,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        gap: 16, fontFamily: 'system-ui, -apple-system, sans-serif', padding: 24, textAlign: 'center',
      }}>
        {showButton && (
          <>
            <div style={{ fontSize: 18, fontWeight: 500 }}>Не получилось загрузить страницу</div>
            <div style={{ fontSize: 14, opacity: 0.7, maxWidth: 320 }}>
              Похоже на временный сбой{error.digest ? ` (код ${error.digest})` : ''}. Попробуйте ещё раз.
            </div>
            <button
              onClick={() => { try { sessionStorage.removeItem(KEY) } catch {}; retry() }}
              style={{ padding: '12px 24px', borderRadius: 12, border: '1px solid rgba(255,255,255,.2)', background: 'rgba(255,255,255,.08)', color: '#fff', fontSize: 15 }}
            >
              Обновить
            </button>
          </>
        )}
      </body>
    </html>
  )
}
