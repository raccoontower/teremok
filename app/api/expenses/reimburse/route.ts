import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

/** Закрыть пачку возмещаемых покупок одним запросом.
 *
 *  Отчёт по объекту закрывал их по одной, циклом из браузера: на десятке
 *  строк это уже заметно, а выгрузка по материалам легко набирает полсотни, и
 *  оборванная на середине вкладка оставила бы половину открытой.
 *
 *  Строки не удаляются и не прячутся — проставляется дата возврата, и в
 *  списке они гаснут. Чем закрыт месяц, должно быть видно потом. */
export async function POST(req: Request) {
  const b = await req.json().catch(() => ({}))
  const ids = Array.isArray(b?.ids) ? b.ids.filter((x: unknown) => typeof x === 'string').slice(0, 500) : []
  if (!ids.length) return NextResponse.json({ error: 'nothing to close' }, { status: 400 })
  const on = /^\d{4}-\d{2}-\d{2}$/.test(String(b?.reimbursed_on)) ? String(b.reimbursed_on) : new Date().toISOString().slice(0, 10)
  const { error } = await db().from('expenses').update({ reimbursed_on: on }).in('id', ids)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true, closed: ids.length, reimbursed_on: on })
}

/** Отменить закрытие — нажали не то, или подрядчик вернул не всё. */
export async function DELETE(req: Request) {
  const b = await req.json().catch(() => ({}))
  const ids = Array.isArray(b?.ids) ? b.ids.filter((x: unknown) => typeof x === 'string').slice(0, 500) : []
  if (!ids.length) return NextResponse.json({ error: 'nothing to reopen' }, { status: 400 })
  const { error } = await db().from('expenses').update({ reimbursed_on: null }).in('id', ids)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true, reopened: ids.length })
}
