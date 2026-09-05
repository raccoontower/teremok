import { NextResponse } from 'next/server'
import { COOKIE, issueToken, passwordMatches } from '@/lib/auth'

export async function POST(req: Request) {
  const { password } = await req.json().catch(() => ({}))
  if (!passwordMatches(String(password ?? ''))) {
    // одинаковая задержка на любой неверный ввод — подбор не ускоряется
    await new Promise(r => setTimeout(r, 800))
    return NextResponse.json({ error: 'wrong password' }, { status: 401 })
  }
  const res = NextResponse.json({ ok: true })
  res.cookies.set(COOKIE, await issueToken(process.env.APP_SECRET!), {
    httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: 30 * 86400,
  })
  return res
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true })
  res.cookies.set(COOKIE, '', { path: '/', maxAge: 0 })
  return res
}
