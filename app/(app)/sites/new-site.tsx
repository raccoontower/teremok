'use client'
import { useState } from 'react'
import { Sheet, useAction } from '@/components/ui'

export function NewSite() {
  const [open, setOpen] = useState(false)
  const [f, setF] = useState({ name: '', address: '', gc_company: '', status: 'active', contract_amount: '', trench_feet: '', trench_rate: '15' })
  const { run, busy, err } = useAction()
  async function save() {
    if (!f.name.trim()) return
    if (await run('/api/sites', f)) { setOpen(false); setF({ name: '', address: '', gc_company: '', status: 'active', contract_amount: '', trench_feet: '', trench_rate: '15' }) }
  }
  return (
    <>
      <button onClick={() => setOpen(true)} className="btn-ghost px-4">+ Site</button>
      {open && (
        <Sheet title="New site" onClose={() => setOpen(false)}>
          <input className="field" placeholder="Site ID, e.g. AL-4471" value={f.name} onChange={e => setF({ ...f, name: e.target.value })} autoFocus />
          <input className="field" placeholder="Town, state" value={f.address} onChange={e => setF({ ...f, address: e.target.value })} />
          <input className="field" placeholder="GC company" value={f.gc_company} onChange={e => setF({ ...f, gc_company: e.target.value })} />
          <input className="field num" inputMode="decimal" placeholder="Base price — what the GC pays for the work"
                 value={f.contract_amount} onChange={e => setF({ ...f, contract_amount: e.target.value })} />
          {/* Раскопки есть не везде, поэтому поля пустые по умолчанию, а
              ставка подставлена: вводить $15 на каждом объекте незачем. */}
          <div className="grid grid-cols-[1fr_7rem] gap-2">
            <div>
              <div className="mb-1 text-[11px] text-[var(--dim)]">Trenching, ft</div>
              <input className="field num" inputMode="decimal" placeholder="0"
                     value={f.trench_feet} onChange={e => setF({ ...f, trench_feet: e.target.value })} />
            </div>
            <div>
              <div className="mb-1 text-[11px] text-[var(--dim)]">$ per ft</div>
              <input className="field num" inputMode="decimal" placeholder="15"
                     value={f.trench_rate} onChange={e => setF({ ...f, trench_rate: e.target.value })} />
            </div>
          </div>
          <select className="field" value={f.status} onChange={e => setF({ ...f, status: e.target.value })}>
            {['planned', 'active', 'done', 'invoiced', 'paid'].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          {err && <div className="text-sm text-[var(--own)]">{err}</div>}
          <button onClick={save} disabled={busy || !f.name.trim()} className="btn mt-2">Save</button>
        </Sheet>
      )}
    </>
  )
}
