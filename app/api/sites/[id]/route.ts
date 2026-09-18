import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
const STATUSES = ['planned', 'active', 'done', 'invoiced', 'paid']
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; const b = await req.json()
  const patch: Record<string, unknown> = {}
  if (b.status && STATUSES.includes(b.status)) patch.status = b.status
  for (const k of ['name', 'address', 'gc_company', 'starts_on', 'ends_on', 'notes']) if (b[k] !== undefined) patch[k] = b[k] || null
  for (const k of ['contract_amount', 'trench_feet', 'trench_rate']) {
    if (b[k] === undefined) continue
    patch[k] = b[k] === '' || b[k] === null ? null : Number(b[k])
  }
  const { error } = await db().from('sites').update(patch).eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

/** Удалить объект.
 *
 *  Только пустой. Объект — корень, к которому привязаны расходы, приходы,
 *  зарплаты и расписание; удалить его вместе с деньгами значит тихо изменить
 *  прибыль месяца и делёж с партнёром задним числом. Поэтому вместо каскада —
 *  отказ с перечнем того, что мешает: владелец сам решит, переносить это или
 *  оставить объект.
 *
 *  Заводится объект в один тап, и опечатки вроде лишнего DN3483 копятся;
 *  до сих пор их нечем было убрать вообще. */
export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const c = db()
  const counts = await Promise.all(
    (['expenses', 'income', 'payroll', 'schedule', 'partner_payouts'] as const).map(async t => {
      const { count } = await c.from(t).select('*', { count: 'exact', head: true }).eq('site_id', id)
      return [t, count ?? 0] as const
    }),
  )
  const blocking = counts.filter(([, n]) => n > 0)
  if (blocking.length) {
    return NextResponse.json({
      error: `Not empty: ${blocking.map(([t, n]) => `${n} ${t}`).join(', ')}. Move or delete those first.`,
    }, { status: 409 })
  }
  const { error } = await c.from('sites').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
