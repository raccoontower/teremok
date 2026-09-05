import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

const PAY = ['day_rate', 'fixed_amount', 'fixed_percent']
export async function POST(req: Request) {
  const b = await req.json()
  if (!b?.name?.trim() || !PAY.includes(b.default_pay)) return NextResponse.json({ error: 'name and pay type required' }, { status: 400 })
  const { data, error } = await db().from('workers')
    .insert({ name: b.name.trim(), default_pay: b.default_pay, default_rate: Number(b.default_rate) || null, phone: b.phone || null }).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
export async function PATCH(req: Request) {
  const b = await req.json()
  if (!b?.id) return NextResponse.json({ error: 'id required' }, { status: 400 })
  const patch: Record<string, unknown> = {}
  if (b.name) patch.name = String(b.name).trim()
  if (PAY.includes(b.default_pay)) patch.default_pay = b.default_pay
  if (b.default_rate !== undefined) patch.default_rate = Number(b.default_rate) || null
  if (b.active !== undefined) patch.active = !!b.active
  const { error } = await db().from('workers').update(patch).eq('id', b.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
