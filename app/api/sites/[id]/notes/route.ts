import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

/** Заметка по объекту, при желании с фото. Фото кладём в тот же приватный
 *  бакет, что и чеки, но в свою папку — их отдаёт /api/file. */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const form = await req.formData()
  const body = String(form.get('body') || '').trim()
  if (!body) return NextResponse.json({ error: 'note is empty' }, { status: 400 })

  const client = db()
  let photo_path: string | null = null
  const file = form.get('file')
  if (file instanceof File && file.size > 0) {
    const ext = (file.type.split('/')[1] || 'jpg').replace('jpeg', 'jpg')
    photo_path = `site-notes/${id}/${crypto.randomUUID()}.${ext}`
    const { error } = await client.storage.from('receipts')
      .upload(photo_path, Buffer.from(await file.arrayBuffer()), { contentType: file.type || 'image/jpeg' })
    if (error) return NextResponse.json({ error: `photo: ${error.message}` }, { status: 500 })
  }
  const { data, error } = await client.from('site_notes').insert({ site_id: id, body, photo_path }).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(req: Request) {
  const noteId = new URL(req.url).searchParams.get('note')
  if (!noteId) return NextResponse.json({ error: 'note id required' }, { status: 400 })
  const { error } = await db().from('site_notes').delete().eq('id', noteId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
