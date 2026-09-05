import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

/** Сохранение расхода. Чек уходит в приватный бакет receipts — для
 *  возмещаемых он обязателен в отчёте GC, поэтому сохраняем всегда, когда есть. */
export async function POST(req: Request) {
  const form = await req.formData()
  const amount = Number(form.get('amount'))
  const kind = String(form.get('kind') || '')
  if (!(amount >= 0) || !['reimbursable', 'own'].includes(kind))
    return NextResponse.json({ error: 'amount and kind required' }, { status: 400 })

  const client = db()
  let receipt_path: string | null = null
  const file = form.get('file')
  if (file instanceof File && file.size > 0) {
    const ext = (file.type.split('/')[1] || 'jpg').replace('jpeg', 'jpg')
    receipt_path = `${new Date().toISOString().slice(0, 7)}/${crypto.randomUUID()}.${ext}`
    const { error } = await client.storage.from('receipts')
      .upload(receipt_path, Buffer.from(await file.arrayBuffer()), { contentType: file.type || 'image/jpeg' })
    if (error) return NextResponse.json({ error: `receipt upload: ${error.message}` }, { status: 500 })
  }

  const row = {
    site_id: form.get('site_id') || null,
    spent_on: String(form.get('spent_on') || new Date().toISOString().slice(0, 10)),
    amount, kind,
    category: String(form.get('category') || 'other'),
    vendor: form.get('vendor') || null,
    note: form.get('note') || null,
    entered_by: form.get('entered_by') || null,
    receipt_path,
    ocr_json: form.get('ocr') ? JSON.parse(String(form.get('ocr'))) : null,
  }
  const { data, error } = await client.from('expenses').insert(row).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function GET(req: Request) {
  const u = new URL(req.url)
  const month = u.searchParams.get('month')   // YYYY-MM
  let q = db().from('expenses').select('id,spent_on,amount,kind,category,vendor,site_id,receipt_path').order('spent_on', { ascending: false }).limit(200)
  if (month) q = q.gte('spent_on', `${month}-01`).lt('spent_on', nextMonth(month))
  const { data, error } = await q
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
function nextMonth(m: string) { const [y, mo] = m.split('-').map(Number); return `${mo === 12 ? y + 1 : y}-${String(mo === 12 ? 1 : mo + 1).padStart(2, '0')}-01` }
