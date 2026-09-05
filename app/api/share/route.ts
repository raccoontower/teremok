import { NextResponse } from 'next/server'
import { signShare } from '@/lib/share'
import { gcData } from '@/lib/queries'
import { db } from '@/lib/db'
export async function POST(req: Request) {
  const b = await req.json(); if (!b?.site) return NextResponse.json({ error: 'site required' }, { status: 400 })
  const token = await signShare({ site: b.site, from: b.from || undefined, to: b.to || undefined })
  try {
    const d = await gcData(b.site, b.from || undefined, b.to || undefined)
    await db().from('report_exports').insert({
      kind: 'link', format: 'link', site_id: b.site,
      period_from: b.from || d?.items.at(-1)?.spent_on || null,
      period_to: b.to || d?.items[0]?.spent_on || null,
      total: d?.total ?? null, item_count: d?.items.length ?? null,
    })
  } catch { /* ссылка важнее журнала */ }
  return NextResponse.json({ url: `${new URL(req.url).origin}/share/${token}` })
}
