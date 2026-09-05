import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
/** Выплата работнику на руки. «Заработано» считается из расписания, здесь — факт. */
export async function POST(req: Request) {
  const b = await req.json(); const amount = Number(b?.amount)
  if (!b?.worker_id || !(amount > 0)) return NextResponse.json({ error: 'worker and amount required' }, { status: 400 })
  const { data, error } = await db().from('payroll').insert({ worker_id: b.worker_id, site_id: b.site_id || null, amount, paid_on: b.paid_on || new Date().toISOString().slice(0, 10), note: b.note || null }).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
