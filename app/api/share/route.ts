import { NextResponse } from 'next/server'
import { signShare } from '@/lib/share'
import { gcData } from '@/lib/queries'
import { db } from '@/lib/db'
export async function POST(req: Request) {
  const b = await req.json()
  // без site ссылка отдаёт все объекты за период — так делятся расходами
  // с партнёром; с site и без all — отчёт управляющей компании
  if (!b?.site && !b?.all) return NextResponse.json({ error: 'site or all required' }, { status: 400 })
  const token = await signShare({ site: b.site || undefined, from: b.from || undefined, to: b.to || undefined, all: !!b.all })
  try {
    const d = b.site ? await gcData(b.site, b.from || undefined, b.to || undefined) : null
    await db().from('report_exports').insert({
      kind: 'link', format: 'link', site_id: b.site || null,
      period_from: b.from || d?.items.at(-1)?.spent_on || null,
      period_to: b.to || d?.items[0]?.spent_on || null,
      total: d?.total ?? null, item_count: d?.items.length ?? null,
    })
  } catch { /* ссылка важнее журнала */ }
  return NextResponse.json({ url: `${new URL(req.url).origin}/share/${token}` })
}
