import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

/** Правка и удаление прихода. Сумму вбивают руками с телефона — опечатка в
 *  разряде тут стоит дороже, чем в расходе: она уходит прямо в прибыль и в
 *  делёж с партнёром. */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; const b = await req.json()
  const patch: Record<string, unknown> = {}
  if (b.amount !== undefined) patch.amount = Number(b.amount)
  if (b.source !== undefined) patch.source = (b.source || '').trim().slice(0, 120) || null
  if (b.note !== undefined) patch.note = b.note || null
  if (b.received_on !== undefined) patch.received_on = b.received_on
  if (b.received_by !== undefined) patch.received_by = b.received_by || null
  const { error } = await db().from('income').update(patch).eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { error } = await db().from('income').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
