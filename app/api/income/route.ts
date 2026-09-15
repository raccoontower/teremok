import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

/** Приход. По объекту — site_id, от кого понятно из объекта.
 *  Без объекта (расчёт от прежнего работодателя, разовая подработка) —
 *  обязателен source: иначе в ленте останется безымянная сумма, в которой
 *  через месяц уже не разобраться. */
export async function POST(req: Request) {
  const b = await req.json(); const amount = Number(b?.amount)
  const source = typeof b?.source === 'string' ? b.source.trim().slice(0, 120) : ''
  if (!(amount > 0)) return NextResponse.json({ error: 'amount required' }, { status: 400 })
  if (!b?.site_id && !source) return NextResponse.json({ error: 'site or source required' }, { status: 400 })
  const { data, error } = await db().from('income').insert({
    site_id: b.site_id || null,
    amount,
    received_on: b.received_on || new Date().toISOString().slice(0, 10),
    source: source || null,
    note: b.note || null,
    received_by: b.received_by || null,
  }).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
