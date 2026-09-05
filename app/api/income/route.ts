import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
export async function POST(req: Request) {
  const b = await req.json(); const amount = Number(b?.amount)
  if (!b?.site_id || !(amount > 0)) return NextResponse.json({ error: 'site and amount required' }, { status: 400 })
  const { data, error } = await db().from('income').insert({ site_id: b.site_id, amount, received_on: b.received_on || new Date().toISOString().slice(0, 10), note: b.note || null }).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
