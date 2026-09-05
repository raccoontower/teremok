'use client'
import { useState } from 'react'

type Guess = {
  vendor: string | null; total: number | null; spent_on: string | null
  kind: 'reimbursable' | 'own'; category: string; confidence: string
  items: { name: string; amount: number | null }[]
}

/** Ввод расхода. Главный путь — фото чека: снял, модель заполнила, один тап
 *  «сохранить». Ручной ввод — те же поля без фото, для Amazon и билетов. */
export default function AddExpense() {
  const [busy, setBusy] = useState(false)
  const [g, setG] = useState<Guess | null>(null)
  const [err, setErr] = useState<string | null>(null)

  async function onFile(f: File) {
    setBusy(true); setErr(null)
    const fd = new FormData(); fd.append('file', f)
    const r = await fetch('/api/receipt', { method: 'POST', body: fd })
    const j = await r.json()
    setBusy(false)
    if (j.error) { setErr(j.error); return }
    setG(j)
  }

  const kindColor = g?.kind === 'reimbursable' ? 'var(--reimb)' : 'var(--own)'

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Новый расход</h1>

      <label className="block cursor-pointer rounded-2xl border border-dashed border-[var(--line)] bg-[var(--panel)] p-8 text-center">
        <input type="file" accept="image/*" capture="environment" className="hidden"
               onChange={e => e.target.files?.[0] && onFile(e.target.files[0])} />
        <div className="text-lg">{busy ? 'Читаю чек…' : '📷 Сфотографировать чек'}</div>
        <div className="mt-1 text-sm text-[var(--muted)]">Home Depot, электрика, заправка — снял и готово</div>
      </label>

      {err && <p className="text-sm text-red-400">{err}</p>}

      {g && (
        <form className="space-y-4 rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-5">
          <div className="flex items-baseline justify-between">
            <div className="text-sm text-[var(--muted)]">{g.vendor ?? 'магазин не распознан'}</div>
            <div className="num text-3xl font-semibold">${g.total?.toFixed(2) ?? '—'}</div>
          </div>
          <div className="flex gap-2 text-sm">
            <span className="rounded-full px-3 py-1" style={{ background: kindColor, color: '#000' }}>
              {g.kind === 'reimbursable' ? 'Возмещаемое — вернёт GC' : 'Своё — наши деньги'}
            </span>
            <span className="rounded-full border border-[var(--line)] px-3 py-1 text-[var(--muted)]">{g.category}</span>
            <span className="ml-auto text-[var(--muted)]">{g.spent_on}</span>
          </div>
          {g.items.length > 0 && (
            <ul className="divide-y divide-[var(--line)] text-sm">
              {g.items.map((it, i) => (
                <li key={i} className="flex justify-between py-1.5">
                  <span className="text-[var(--muted)]">{it.name}</span>
                  <span className="num">{it.amount?.toFixed(2)}</span>
                </li>
              ))}
            </ul>
          )}
          <select className="w-full rounded-xl border border-[var(--line)] bg-transparent px-3 py-2">
            <option>Объект — подставится из расписания</option>
          </select>
          <button type="button" className="w-full rounded-xl bg-white py-3 font-medium text-black">
            Сохранить
          </button>
          <p className="text-center text-xs text-[var(--muted)]">
            {g.confidence !== 'high' && 'Проверь сумму: модель не уверена. '}
            Сохранение включится, когда подключим базу.
          </p>
        </form>
      )}
    </div>
  )
}
