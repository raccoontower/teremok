import { NextResponse } from 'next/server'
import { recognizeReceipt } from '@/lib/receipt'

/** POST multipart: file=<фото чека>. Возвращает распознанные поля — форма
 *  показывает их на подтверждение, в базу пишет отдельный запрос. */
export async function POST(req: Request) {
  const form = await req.formData()
  const file = form.get('file')
  if (!(file instanceof File)) return NextResponse.json({ error: 'file required' }, { status: 400 })
  if (file.size > 12 * 1024 * 1024) return NextResponse.json({ error: 'file too large' }, { status: 413 })
  const b64 = Buffer.from(await file.arrayBuffer()).toString('base64')
  try {
    const guess = await recognizeReceipt(b64, file.type || 'image/jpeg')
    return NextResponse.json(guess)
  } catch (e) {
    return NextResponse.json({ error: String(e).slice(0, 200) }, { status: 502 })
  }
}
