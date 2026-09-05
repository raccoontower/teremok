'use client'
import { useState } from 'react'
import { Sheet, Toast } from '@/components/ui'

const iso = (d: Date) => d.toISOString().slice(0, 10)

/** Ссылка на период расходов: выбрал даты — получил адрес, который
 *  открывается без пароля и показывает суммы, заметки и фото чеков. */
export function SharePeriod({ month }: { month: string }) {
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [toast, setToast] = useState<{ title: string; sub?: string } | null>(null)
  const [y, m] = month.split('-').map(Number)
  const [from, setFrom] = useState(iso(new Date(Date.UTC(y, m - 1, 1))))
  const [to, setTo] = useState(iso(new Date(Date.UTC(y, m, 0))))
  const show = (title: string, sub?: string) => { setToast({ title, sub }); setTimeout(() => setToast(null), 3600) }

  async function make() {
    setBusy(true)
    const r = await fetch('/api/share', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ all: true, from, to }) })
    const j = await r.json(); setBusy(false)
    if (!j.url) return show('Could not create the link')
    setOpen(false)
    try {
      if (navigator.share) await navigator.share({ title: `Expenses ${from} – ${to}`, url: j.url })
      else await navigator.clipboard.writeText(j.url)
      show('Link copied', 'Valid 30 days · receipt photos included')
    } catch { show('Link ready', j.url) }
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className="btn-ghost mt-3.5 w-full">Share a period →</button>
      {open && (
        <Sheet title="Share expenses" onClose={() => setOpen(false)}>
          <div className="flex items-center gap-2">
            <input type="date" value={from} onChange={e => setFrom(e.target.value)} className="field min-h-[44px] flex-1 text-[15px]" />
            <span className="text-[var(--dim)]">–</span>
            <input type="date" value={to} onChange={e => setTo(e.target.value)} className="field min-h-[44px] flex-1 text-[15px]" />
          </div>
          <div className="text-[13px] leading-snug text-[var(--muted)]">
            Everything spent in these dates — own money and reimbursable, with notes and receipt photos. Opens without a password, works for 30 days.
          </div>
          <button onClick={make} disabled={busy} className="btn mt-2">{busy ? 'Creating…' : 'Create the link'}</button>
        </Sheet>
      )}
      {toast && <Toast {...toast} tone="accent" />}
    </>
  )
}
