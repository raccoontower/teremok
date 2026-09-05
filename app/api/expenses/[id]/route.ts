import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; const b = await req.json()
  const patch: Record<string, unknown> = {}
  if (b.kind === 'own' || b.kind === 'reimbursable') patch.kind = b.kind
  if (b.site_id !== undefined) patch.site_id = b.site_id || null
  if (b.reimbursed_on !== undefined) patch.reimbursed_on = b.reimbursed_on || null
  if (b.amount !== undefined) patch.amount = Number(b.amount)
  const { error } = await db().from('expenses').update(patch).eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { error } = await db().from('expenses').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
