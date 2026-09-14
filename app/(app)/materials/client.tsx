'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Toast } from '@/components/ui'

const iso = (d: Date) => d.toISOString().slice(0, 10)

/** Период. Владелец отчитывается кусками («с первого по восьмое»), поэтому две
 *  даты — главный элемент, а пресеты только чтобы не тыкать календарь. */
export function MaterialsPeriod({ from, to }: { from?: string; to?: string }) {
  const router = useRouter()
  const [f, setF] = useState(from || '')
  const [t, setT] = useState(to || '')
  const go = (a: string, b: string) => {
    const q = [a && `from=${a}`, b && `to=${b}`].filter(Boolean).join('&')
    router.push(`/materials${q ? `?${q}` : ''}`)
  }
  function preset(kind: 'this' | 'last' | 'all') {
    if (kind === 'all') { setF(''); setT(''); return go('', '') }
    const now = new Date()
    const shift = kind === 'last' ? -1 : 0
    const a = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + shift, 1))
    const b = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + shift + 1, 0))
    setF(iso(a)); setT(iso(b)); go(iso(a), iso(b))
  }
  return (
    <div className="no-print panel mt-3.5">
      <div className="panel-head"><div className="tag">Period</div>
        <div className="tag text-[var(--dim)]">{from || to ? `${from || '…'} → ${to || '…'}` : 'all time'}</div>
      </div>
      <div className="p-3.5">
        <div className="flex items-center gap-2">
          <input type="date" value={f} onChange={e => setF(e.target.value)} className="field flex-1 min-h-[44px] text-[15px]" />
          <span className="text-[var(--dim)]">–</span>
          <input type="date" value={t} onChange={e => setT(e.target.value)} className="field flex-1 min-h-[44px] text-[15px]" />
          <button onClick={() => go(f, t)} className="btn w-[76px] flex-none">Show</button>
        </div>
        <div className="mt-2.5 flex gap-2">
          <button onClick={() => preset('this')} className="btn-ghost flex-1">This month</button>
          <button onClick={() => preset('last')} className="btn-ghost flex-1">Last month</button>
          <button onClick={() => preset('all')} className="btn-ghost flex-1">All</button>
        </div>
      </div>
    </div>
  )
}

/** Отдать выгрузку и закрыть период.
 *
 *  «Closed» не удаляет и не прячет строки — проставляет дату возврата, после
 *  чего они гаснут в списке. Через месяц надо уметь ответить, чем именно был
 *  закрыт тот десятитысячный счёт, а не только что он закрыт. */
export function MaterialsActions({ from, to, openIds, closedIds, readOnly }:
  { from?: string; to?: string; openIds: string[]; closedIds: string[]; readOnly: boolean }) {
  const router = useRouter()
  const [toast, setToast] = useState<{ title: string; sub?: string } | null>(null)
  const [busy, setBusy] = useState(false)
  const show = (title: string, sub?: string) => { setToast({ title, sub }); setTimeout(() => setToast(null), 3400) }
  const url = (format: 'csv' | 'txt') =>
    `/api/export?type=materials&format=${format}` + (from ? `&from=${from}` : '') + (to ? `&to=${to}` : '')

  async function copyText() {
    const r = await fetch(url('txt'))
    const text = await r.text()
    try { await navigator.clipboard.writeText(text); show('Report copied', 'Paste it into an email or a message') }
    catch { window.open(url('txt'), '_blank'); show('Opened as a file') }
  }

  async function close(ids: string[], reopen = false) {
    if (!ids.length) return
    const what = reopen
      ? `Reopen ${ids.length} purchases? They go back to what the GC still owes.`
      : `Mark ${ids.length} purchases as paid back by the GC?`
    if (!confirm(what)) return
    setBusy(true)
    const r = await fetch('/api/expenses/reimburse', {
      method: reopen ? 'DELETE' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids, reimbursed_on: new Date().toISOString().slice(0, 10) }),
    })
    setBusy(false)
    if (!r.ok) return show('Could not save that')
    show(reopen ? 'Reopened' : 'Closed', reopen ? 'Back in outstanding' : 'They stay in the list, dimmed')
    router.refresh()
  }

  if (readOnly) {
    return (
      <div className="no-print mt-[18px]">
        <div className="flex gap-2.5">
          <button onClick={copyText} className="btn flex-1">Copy as text</button>
          <a href={url('csv')} className="btn-ghost flex w-[92px] flex-none items-center justify-center text-[15px]">CSV</a>
        </div>
        {toast && <Toast {...toast} />}
      </div>
    )
  }

  return (
    <div className="no-print mt-[18px]">
      <div className="flex gap-2.5">
        <button onClick={copyText} className="btn flex-1">Copy as text</button>
        <a href={url('csv')} className="btn-ghost flex w-[92px] flex-none items-center justify-center text-[15px]">CSV</a>
      </div>
      <div className="mt-2.5 flex gap-2.5">
        <button onClick={() => window.print()} className="btn-ghost flex-1">Export PDF</button>
      </div>
      {openIds.length > 0 && (
        <button onClick={() => close(openIds)} disabled={busy} className="btn-reimb mt-2.5 w-full">
          GC paid this back ({openIds.length})
        </button>
      )}
      {!openIds.length && closedIds.length > 0 && (
        <button onClick={() => close(closedIds, true)} disabled={busy} className="btn-ghost mt-2.5 w-full">
          Reopen this period
        </button>
      )}
      {toast && <Toast {...toast} />}
    </div>
  )
}
