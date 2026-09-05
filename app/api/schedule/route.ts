import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

/** Назначение на день: { day, site_id, worker_ids[] }. Для выбранных людей
 *  день переписывается целиком (один человек — один объект в день); пустой
 *  список работников с site_id=null снимает всех. */
export async function POST(req: Request) {
  const b = await req.json()
  const day = String(b?.day || ''); const ids: string[] = Array.isArray(b?.worker_ids) ? b.worker_ids : []
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) return NextResponse.json({ error: 'day required' }, { status: 400 })
  const c = db()
  if (b.site_id) {
    // снимаем тех, кто раньше стоял на этот объект в этот день, и ставим новый состав
    const del = await c.from('schedule').delete().eq('work_day', day).eq('site_id', b.site_id)
    if (del.error) return NextResponse.json({ error: del.error.message }, { status: 500 })
    if (ids.length) {
      const del2 = await c.from('schedule').delete().eq('work_day', day).in('worker_id', ids)
      if (del2.error) return NextResponse.json({ error: del2.error.message }, { status: 500 })
      const ins = await c.from('schedule').insert(ids.map(worker_id => ({ work_day: day, site_id: b.site_id, worker_id })))
      if (ins.error) return NextResponse.json({ error: ins.error.message }, { status: 500 })
    }
  } else {
    const del = await c.from('schedule').delete().eq('work_day', day)
    if (del.error) return NextResponse.json({ error: del.error.message }, { status: 500 })
  }
  return NextResponse.json({ ok: true })
}
