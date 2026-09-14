import { NextResponse, type NextRequest } from 'next/server'
import { COOKIE, verifyToken, allows, homeFor } from '@/lib/auth'

/** Всё, кроме страницы входа и статики, закрыто. API без cookie отдаёт 401,
 *  страницы — редирект на /login с возвратом туда, куда шёл.
 *
 *  Права ролей проверяются здесь же, до обработчика: спрятать кнопку в вёрстке
 *  мало, а обойти это место нельзя. Запись для партнёра и управляющей компании
 *  закрыта по методу, а не по списку адресов — новый API не окажется случайно
 *  открытым просто потому, что про него забыли. */
export default async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl
  if (pathname === '/login' || pathname === '/api/login' || pathname.startsWith('/share/')) return NextResponse.next()
  const secret = process.env.APP_SECRET
  if (!secret) return new NextResponse('APP_SECRET is not set', { status: 500 })
  const role = await verifyToken(req.cookies.get(COOKIE)?.value, secret)
  if (role) {
    if (allows(role, pathname, req.method)) {
      // Роль едет дальше заголовком, чтобы страницы могли убрать то, чего
      // этой роли всё равно не разрешат — не как защита, а чтобы не дразнить.
      const h = new Headers(req.headers); h.set('x-role', role)
      return NextResponse.next({ request: { headers: h } })
    }
    if (pathname.startsWith('/api/')) return NextResponse.json({ error: 'forbidden' }, { status: 403 })
    const url = req.nextUrl.clone(); url.pathname = homeFor(role); url.search = ''
    return NextResponse.redirect(url)
  }
  if (pathname.startsWith('/api/')) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const url = req.nextUrl.clone(); url.pathname = '/login'; url.searchParams.set('next', pathname)
  return NextResponse.redirect(url)
}

export const config = { matcher: ['/((?!_next/|favicon.ico|.*\\.(?:png|jpg|svg|ico|webp)$).*)'] }
