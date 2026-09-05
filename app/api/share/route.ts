import { NextResponse } from 'next/server'
import { signShare } from '@/lib/share'
export async function POST(req: Request) {
  const b = await req.json(); if (!b?.site) return NextResponse.json({ error: 'site required' }, { status: 400 })
  const token = await signShare({ site: b.site, from: b.from || undefined, to: b.to || undefined })
  return NextResponse.json({ url: `${new URL(req.url).origin}/share/${token}` })
}
