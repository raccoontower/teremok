import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
/** Партнёр взял свою долю прибыли. */
export async function POST(req: Request) {
  const b = await req.json(); const amount = Number(b?.amount)
  if (!b?.partner_id || !(amount > 0)) return NextResponse.json({ error: 'partner and amount required' }, { status: 400 })
  // Кто перевёл: если не указан — второй партнёр (выплата идёт с его карты получателю).
  // Без paid_by выплата не зачитывалась плательщику, и делёж расходился (миграция 0010).
  let paid_by: string | null = b.paid_by || null
  if (!paid_by) {
    const { data: others } = await db().from('partners').select('id').neq('id', b.partner_id).limit(1)
    paid_by = others?.[0]?.id ?? null
  }
  const { data, error } = await db().from('partner_payouts').insert({ partner_id: b.partner_id, paid_by, site_id: b.site_id || null, amount, paid_on: b.paid_on || new Date().toISOString().slice(0, 10), note: b.note || null }).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
