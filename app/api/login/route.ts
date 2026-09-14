import { NextResponse } from 'next/server'
import { COOKIE, issueToken, passwordRole, homeFor } from '@/lib/auth'

export async function POST(req: Request) {
  const { password } = await req.json().catch(() => ({}))
  const role = passwordRole(String(password ?? ''))
  if (!role) {
    // одинаковая задержка на любой неверный ввод — подбор не ускоряется
    await new Promise(r => setTimeout(r, 800))
    return NextResponse.json({ error: 'wrong password' }, { status: 401 })
  }
  const res = NextResponse.json({ ok: true, role, home: homeFor(role) })
  res.cookies.set(COOKIE, await issueToken(process.env.APP_SECRET!, role), {
    httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: 30 * 86400,
  })
  return res
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true })
  res.cookies.set(COOKIE, '', { path: '/', maxAge: 0 })
  return res
}
