'use client'
import { useState } from 'react'
import { Sheet, useAction } from '@/components/ui'

export function Payout({ partner, sites }: { partner: { id: string; name: string; owed: number }; sites: { id: string; name: string }[] }) {
  const [open, setOpen] = useState(false); const [amount, setAmount] = useState(''); const [site, setSite] = useState('')
  const { run, busy, err } = useAction()
  return (
    <>
      <button onClick={() => { setAmount(partner.owed > 0 ? String(Math.round(partner.owed)) : ''); setOpen(true) }} className="btn-ghost mt-3.5 w-full">Record payout</button>
      {open && (
        <Sheet title={`Payout · ${partner.name}`} onClose={() => setOpen(false)}>
          <input className="field num text-2xl" inputMode="decimal" placeholder="$0" value={amount} onChange={e => setAmount(e.target.value)} autoFocus />
          <select className="field" value={site} onChange={e => setSite(e.target.value)}>
            <option value="">Site — not specified</option>
            {sites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          {err && <div className="text-sm text-[var(--own)]">{err}</div>}
          <button disabled={busy || !(Number(amount) > 0)} onClick={async () => { if (await run('/api/payouts', { partner_id: partner.id, amount: Number(amount), site_id: site || null })) setOpen(false) }} className="btn mt-2">Save</button>
        </Sheet>
      )}
    </>
  )
}
