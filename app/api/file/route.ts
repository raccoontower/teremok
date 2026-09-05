import { db } from '@/lib/db'

/** Отдаёт файл из приватного бакета receipts. Доступ закрыт proxy.ts,
 *  поэтому картинки можно вставлять обычным <img src="/api/file?path=…">. */
export async function GET(req: Request) {
  const path = new URL(req.url).searchParams.get('path') || ''
  if (!/^[\w\-./]+$/.test(path) || path.includes('..')) return new Response('bad path', { status: 400 })
  const { data, error } = await db().storage.from('receipts').download(path)
  if (error || !data) return new Response('not found', { status: 404 })
  return new Response(data, { headers: { 'Content-Type': data.type || 'image/jpeg', 'Cache-Control': 'private, max-age=86400' } })
}
