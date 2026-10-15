import type { Instrumentation } from 'next'

/**
 * Без этого файла причина серверной ошибки видна только по digest в логах
 * Vercel — а туда нужен рабочий VERCEL_TOKEN, которого на 14.10.2026 нет
 * (протух/не тот тип токена). `onRequestError` печатает сообщение, стек и
 * контекст в консоль при каждом необработанном сбое рендера — это попадает
 * в Vercel Runtime Logs без доп. токена, и digest со скриншота владельца
 * можно будет сопоставить со строкой лога.
 *
 * Таблицу в Supabase под это не завожу — решение по новым таблицам не моё.
 * Если он захочет копить ошибки в базе, а не только в логах, — заводим
 * таблицу и меняем этот console.error на запись в неё.
 */
export const onRequestError: Instrumentation.onRequestError = async (err, request, context) => {
  const message = err instanceof Error ? err.message : String(err)
  const digest = typeof err === 'object' && err !== null && 'digest' in err ? String((err as { digest?: unknown }).digest) : undefined
  const stack = err instanceof Error ? err.stack : undefined
  console.error('[teremok:onRequestError]', JSON.stringify({
    digest, message, stack,
    path: request.path, method: request.method,
    routePath: context.routePath, routeType: context.routeType, renderSource: context.renderSource,
  }))
}
