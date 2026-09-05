'use client'
import { useState } from 'react'
import { Sheet, SheetRow, useAction } from '@/components/ui'
import { money } from '@/lib/money'

const PAY = [
  { v: 'day_rate', label: 'Day rate', sub: 'days from the schedule × rate' },
  { v: 'fixed_amount', label: 'Fixed per site', sub: 'one amount for each site worked' },
  { v: 'fixed_percent', label: '% of site income', sub: 'share of what the GC pays for the site' },
]
type W = { id: string; name: string; owed: number; default_pay: string; default_rate: number | null; active: boolean }

export function CrewActions() {
  const [open, setOpen] = useState(false)
  const [f, setF] = useState({ name: '', default_pay: 'day_rate', default_rate: '' })
  const { run, busy, err } = useAction()
  return (
    <>
      <button onClick={() => setOpen(true)} className="btn-ghost px-4">+ Worker</button>
      {open && (
        <Sheet title="New worker" onClose={() => setOpen(false)}>
          <input className="field" placeholder="Name" value={f.name} onChange={e => setF({ ...f, name: e.target.value })} autoFocus />
          {PAY.map(p => <SheetRow key={p.v} label={p.label} sub={p.sub} active={f.default_pay === p.v} onClick={() => setF({ ...f, default_pay: p.v })} />)}
          <input className="field num" inputMode="decimal" placeholder={f.default_pay === 'fixed_percent' ? 'Percent, e.g. 8' : 'Rate, e.g. 280'} value={f.default_rate} onChange={e => setF({ ...f, default_rate: e.target.value })} />
          {err && <div className="text-sm text-[var(--own)]">{err}</div>}
          <button disabled={busy || !f.name.trim()} onClick={async () => { if (await run('/api/workers', f)) { setOpen(false); setF({ name: '', default_pay: 'day_rate', default_rate: '' }) } }} className="btn mt-2">Save</button>
        </Sheet>
      )}
    </>
  )
}

/** Выплата: сумма по умолчанию — сколько должны. Тут же — правка ставки и увольнение. */
export function PayButton({ worker, sites }: { worker: W; sites: { id: string; name: string }[] }) {
  const [sheet, setSheet] = useState<'pay' | 'edit' | null>(null)
  const [amount, setAmount] = useState(''); const [site, setSite] = useState('')
  const [f, setF] = useState({ default_pay: worker.default_pay, default_rate: String(worker.default_rate ?? '') })
  const { run, busy, err } = useAction()
  return (
    <>
      <button onClick={() => { setAmount(worker.owed > 0 ? String(Math.round(worker.owed * 100) / 100) : ''); setSheet('pay') }} className="btn-ghost px-3.5">Pay</button>
      {sheet === 'pay' && (
        <Sheet title={`Pay ${worker.name}`} onClose={() => setSheet(null)}>
          <div className="text-sm text-[var(--muted)]">Owed now: <span className="num text-[var(--own)]">{money(worker.owed, true)}</span></div>
          <input className="field num text-2xl" inputMode="decimal" placeholder="$0" value={amount} onChange={e => setAmount(e.target.value)} autoFocus />
          <select className="field" value={site} onChange={e => setSite(e.target.value)}>
            <option value="">Site — not specified</option>
            {sites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          {err && <div className="text-sm text-[var(--own)]">{err}</div>}
          <button disabled={busy || !(Number(amount) > 0)} onClick={async () => { if (await run('/api/payroll', { worker_id: worker.id, amount: Number(amount), site_id: site || null })) setSheet(null) }} className="btn mt-2">Record payment</button>
          <button onClick={() => setSheet('edit')} className="btn-ghost">Edit rate</button>
        </Sheet>
      )}
      {sheet === 'edit' && (
        <Sheet title={worker.name} onClose={() => setSheet(null)}>
          {PAY.map(p => <SheetRow key={p.v} label={p.label} sub={p.sub} active={f.default_pay === p.v} onClick={() => setF({ ...f, default_pay: p.v })} />)}
          <input className="field num" inputMode="decimal" placeholder="Rate" value={f.default_rate} onChange={e => setF({ ...f, default_rate: e.target.value })} />
          <div className="mt-1 text-xs text-[var(--muted)]">Changing the rate recalculates what is earned for all scheduled days.</div>
          {err && <div className="text-sm text-[var(--own)]">{err}</div>}
          <button disabled={busy} onClick={async () => { if (await run('/api/workers', { id: worker.id, ...f }, 'PATCH')) setSheet(null) }} className="btn mt-2">Save</button>
          <button disabled={busy} onClick={async () => { if (await run('/api/workers', { id: worker.id, active: !worker.active }, 'PATCH')) setSheet(null) }} className="btn-ghost">{worker.active ? 'Mark as left the crew' : 'Back to the crew'}</button>
        </Sheet>
      )}
    </>
  )
}
