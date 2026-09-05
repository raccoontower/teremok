import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  const { data, error } = await db().from('sites').select('id,name,status,gc_company').order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: Request) {
  const b = await req.json()
  if (!b?.name?.trim()) return NextResponse.json({ error: 'name required' }, { status: 400 })
  const { data, error } = await db().from('sites')
    .insert({ name: b.name.trim(), address: b.address || null, gc_company: b.gc_company || null, status: b.status || 'active', contract_amount: b.contract_amount ? Number(b.contract_amount) : null })
    .select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
