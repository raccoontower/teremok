import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
const STATUSES = ['planned', 'active', 'done', 'invoiced', 'paid']
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; const b = await req.json()
  const patch: Record<string, unknown> = {}
  if (b.status && STATUSES.includes(b.status)) patch.status = b.status
  for (const k of ['name', 'address', 'gc_company', 'starts_on', 'ends_on', 'notes']) if (b[k] !== undefined) patch[k] = b[k] || null
  const { error } = await db().from('sites').update(patch).eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
