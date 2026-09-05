import 'server-only'

/**
 * Распознавание чека — главный способ ввода расхода.
 *
 * Прошлый Telegram-бот с кнопками дал 7 записей за всё время: ручной ввод не
 * приживается. Поэтому расход должен попадать в учёт с фотографии за одно
 * подтверждение. Модель вытаскивает магазин, сумму, дату и позиции, а вид
 * (reimbursable/own) предлагает по магазину: Home Depot и электрика —
 * материалы под возврат от GC, всё остальное — наше.
 */
export type ReceiptGuess = {
  vendor: string | null
  total: number | null
  spent_on: string | null          // YYYY-MM-DD
  currency: string
  kind: 'reimbursable' | 'own'
  category: string
  items: { name: string; amount: number | null }[]
  confidence: 'high' | 'medium' | 'low'
  raw_text?: string
}

// Магазины, чьи чеки почти всегда идут в отчёт GC под возмещение.
const REIMBURSABLE_VENDORS = /home depot|lowe'?s|graybar|rexel|ced|city electric|wesco|border states|ferguson|grainger|fastenal|electrical supply/i

const PROMPT = `You read receipts for a US telecom construction crew.
Extract from the receipt image and return STRICT JSON only:
{
  "vendor": "store name as printed, e.g. 'The Home Depot', or null",
  "total": 123.45,             // grand total actually paid, number, or null
  "spent_on": "YYYY-MM-DD",    // purchase date, or null
  "currency": "USD",
  "category": "materials | fuel | hotel | tickets | rental | insurance | amazon | food | other",
  "items": [{"name": "short item name", "amount": 12.34}],   // up to 12 lines, amounts numbers or null
  "confidence": "high | medium | low",   // low if total or vendor is unreadable
  "raw_text": "the receipt text you could read, first 600 chars"
}
Rules: total is the final amount charged (after tax), not subtotal. Dates on
US receipts are MM/DD/YY. If unsure about a field, use null — never guess a total.`

export async function recognizeReceipt(imageBase64: string, mime: string): Promise<ReceiptGuess> {
  const key = process.env.GEMINI_API_KEY
  if (!key) throw new Error('GEMINI_API_KEY is not set')
  const r = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: PROMPT }, { inline_data: { mime_type: mime, data: imageBase64 } }] }],
        generationConfig: {
          temperature: 0.1,
          responseMimeType: 'application/json',
          // Gemini 2.5 тратит лимит вывода на внутренние рассуждения; для
          // структурного извлечения они не нужны и только режут ответ.
          thinkingConfig: { thinkingBudget: 0 },
          maxOutputTokens: 1500,
        },
      }),
    },
  )
  if (!r.ok) throw new Error(`gemini ${r.status}: ${(await r.text()).slice(0, 200)}`)
  const j = await r.json()
  const text: string = j?.candidates?.[0]?.content?.parts?.[0]?.text ?? '{}'
  const g = JSON.parse(text)
  const vendor: string | null = g.vendor ?? null
  const kind: ReceiptGuess['kind'] = vendor && REIMBURSABLE_VENDORS.test(vendor) ? 'reimbursable' : 'own'
  return {
    vendor,
    total: typeof g.total === 'number' ? g.total : null,
    spent_on: g.spent_on ?? null,
    currency: g.currency || 'USD',
    kind,
    category: kind === 'reimbursable' ? 'materials' : (g.category || 'other'),
    items: Array.isArray(g.items) ? g.items.slice(0, 12) : [],
    confidence: g.confidence || 'low',
    raw_text: g.raw_text,
  }
}
