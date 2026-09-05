import { NextResponse, type NextRequest } from 'next/server'
import { COOKIE, verifyToken } from '@/lib/auth'

/** Всё, кроме страницы входа и статики, закрыто. API без cookie отдаёт 401,
 *  страницы — редирект на /login с возвратом туда, куда шёл. */
export default async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl
  if (pathname === '/login' || pathname === '/api/login') return NextResponse.next()
  const secret = process.env.APP_SECRET
  if (!secret) return new NextResponse('APP_SECRET is not set', { status: 500 })
  const ok = await verifyToken(req.cookies.get(COOKIE)?.value, secret)
  if (ok) return NextResponse.next()
  if (pathname.startsWith('/api/')) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const url = req.nextUrl.clone(); url.pathname = '/login'; url.searchParams.set('next', pathname)
  return NextResponse.redirect(url)
}

export const config = { matcher: ['/((?!_next/|favicon.ico|.*\\.(?:png|jpg|svg|ico|webp)$).*)'] }
