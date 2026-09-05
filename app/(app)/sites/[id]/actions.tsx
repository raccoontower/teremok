'use client'
import { useState } from 'react'
import { Sheet, SheetRow, StatusPill, STATUS, useAction } from '@/components/ui'
import type { Site } from '@/lib/queries'

/** Статус объекта и доход от GC — два действия, которые нужны на площадке. */
export function SiteActions({ site }: { site: Site }) {
  const [sheet, setSheet] = useState<'status' | 'income' | null>(null)
  const [amount, setAmount] = useState(''); const [note, setNote] = useState('')
  const { run, busy, err } = useAction()
  return (
    <div className="flex items-center gap-2">
      <button onClick={() => setSheet('income')} className="btn-ghost px-3.5">+ Income</button>
      <button onClick={() => setSheet('status')} aria-label="Change status"><StatusPill status={site.status} size="md" /></button>
      {sheet === 'status' && (
        <Sheet title="Status" onClose={() => setSheet(null)}>
          {Object.keys(STATUS).map(s => <SheetRow key={s} label={s} dot={STATUS[s].color} active={s === site.status} onClick={async () => { await run(`/api/sites/${site.id}`, { status: s }, 'PATCH'); setSheet(null) }} />)}
        </Sheet>
      )}
      {sheet === 'income' && (
        <Sheet title={`Income from GC · ${site.name}`} onClose={() => setSheet(null)}>
          <input className="field num text-2xl" inputMode="decimal" placeholder="$0" value={amount} onChange={e => setAmount(e.target.value)} autoFocus />
          <input className="field" placeholder="Note (invoice #, milestone)" value={note} onChange={e => setNote(e.target.value)} />
          {err && <div className="text-sm text-[var(--own)]">{err}</div>}
          <button disabled={busy || !(Number(amount) > 0)} onClick={async () => { if (await run('/api/income', { site_id: site.id, amount: Number(amount), note })) { setSheet(null); setAmount(''); setNote('') } }} className="btn mt-2">Save</button>
        </Sheet>
      )}
    </div>
  )
}
