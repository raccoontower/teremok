'use client'
import { useState } from 'react'
import { Sheet, useAction } from '@/components/ui'

export function NewSite() {
  const [open, setOpen] = useState(false)
  const [f, setF] = useState({ name: '', address: '', gc_company: '', status: 'active' })
  const { run, busy, err } = useAction()
  async function save() {
    if (!f.name.trim()) return
    if (await run('/api/sites', f)) { setOpen(false); setF({ name: '', address: '', gc_company: '', status: 'active' }) }
  }
  return (
    <>
      <button onClick={() => setOpen(true)} className="btn-ghost px-4">+ Site</button>
      {open && (
        <Sheet title="New site" onClose={() => setOpen(false)}>
          <input className="field" placeholder="Site ID, e.g. AL-4471" value={f.name} onChange={e => setF({ ...f, name: e.target.value })} autoFocus />
          <input className="field" placeholder="Town, state" value={f.address} onChange={e => setF({ ...f, address: e.target.value })} />
          <input className="field" placeholder="GC company" value={f.gc_company} onChange={e => setF({ ...f, gc_company: e.target.value })} />
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
