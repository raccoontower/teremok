'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sheet, SheetRow, StatusPill, STATUS, useAction } from '@/components/ui'
import type { Site } from '@/lib/queries'

/** Статус объекта и доход от GC — два действия, которые нужны на площадке. */
export function SiteActions({ site }: { site: Site }) {
  const [sheet, setSheet] = useState<'status' | 'income' | 'contract' | null>(null)
  const [contract, setContract] = useState(site.contract_amount == null ? '' : String(site.contract_amount))
  // Раскопки: длина в футах и ставка. Ставка почти всегда $15, поэтому она
  // подставлена заранее — на площадке остаётся ввести только длину.
  const [feet, setFeet] = useState(site.trench_feet == null ? '' : String(site.trench_feet))
  const [rate, setRate] = useState(site.trench_rate == null ? '15' : String(site.trench_rate))
  const trench = (Number(feet) || 0) * (Number(rate) || 0)
  const total = (Number(contract) || 0) + trench
  const [amount, setAmount] = useState(''); const [note, setNote] = useState('')
  const { run, busy, err } = useAction()
  const router = useRouter()
  return (
    <div className="flex flex-none items-center gap-2">
      <button onClick={() => setSheet('contract')} className="btn-ghost px-3.5">Contract</button>
      <button onClick={() => setSheet('income')} className="btn-ghost px-3.5">+ Paid</button>
      <button onClick={() => setSheet('status')} aria-label="Change status"><StatusPill status={site.status} size="md" /></button>
      {sheet === 'status' && (
        <Sheet title="Status" onClose={() => setSheet(null)}>
          {Object.keys(STATUS).map(s => <SheetRow key={s} label={s} dot={STATUS[s].color} active={s === site.status} onClick={async () => { await run(`/api/sites/${site.id}`, { status: s }, 'PATCH'); setSheet(null) }} />)}
          {/* Удаление живёт здесь, а не отдельной кнопкой в шапке: объект
              удаляют редко, а промахнуться по шапке на телефоне легко. Сервер
              откажет, если к объекту привязаны деньги, и скажет почему. */}
          <button
            disabled={busy}
            onClick={async () => {
              if (!confirm(`Delete ${site.name}? Only works if nothing is attached to it.`)) return
              if (await run(`/api/sites/${site.id}`, {}, 'DELETE')) router.push('/sites')
            }}
            className="mt-2 h-11 text-[15px] text-[var(--own)]">
            Delete site
          </button>
          {err && <div className="text-sm text-[var(--own)]">{err}</div>}
        </Sheet>
      )}
      {sheet === 'contract' && (
        <Sheet title={`Contract · ${site.name}`} onClose={() => setSheet(null)}>
          <div className="text-sm text-[var(--muted)]">What the GC agreed to pay for the work. Materials are counted separately.</div>
          <label className="mt-1 block text-xs text-[var(--muted)]">Base price</label>
          <input className="field num text-2xl" inputMode="decimal" placeholder="$0" value={contract} onChange={e => setContract(e.target.value)} autoFocus />

          {/* Сетка, а не flex: у `.field` ширина 100%, и во flex-строке поле
              длины схлопывалось в узкую щель, а ставка занимала всё. Колонки
              заданы явно. Подписи над полями, а не placeholder: на телефоне
              placeholder исчезает от первого касания, и остаётся гадать,
              что куда вводить. */}
          <label className="mt-3 block text-xs text-[var(--muted)]">Trenching</label>
          <div className="grid grid-cols-[1fr_7rem] gap-2">
            <div>
              <div className="mb-1 text-[11px] text-[var(--dim)]">Length, ft</div>
              <input className="field num text-2xl" inputMode="decimal" placeholder="0" value={feet} onChange={e => setFeet(e.target.value)} />
            </div>
            <div>
              <div className="mb-1 text-[11px] text-[var(--dim)]">$ per ft</div>
              <input className="field num text-2xl" inputMode="decimal" placeholder="15" value={rate} onChange={e => setRate(e.target.value)} />
            </div>
          </div>
          {/* Итог показываем прямо здесь: цифра, которую владелец назовёт
              управляющей компании, не должна считаться в уме на площадке. */}
          <div className="mt-2 flex items-baseline justify-between text-sm">
            <span className="text-[var(--muted)]">
              {trench > 0 ? `${Number(feet) || 0} ft × $${Number(rate) || 0} = $${trench.toLocaleString('en-US')}` : 'No trenching on this site'}
            </span>
            <span className="num text-lg">${total.toLocaleString('en-US')}</span>
          </div>
          {err && <div className="text-sm text-[var(--own)]">{err}</div>}
          <button disabled={busy} onClick={async () => { if (await run(`/api/sites/${site.id}`, { contract_amount: contract, trench_feet: feet, trench_rate: rate }, 'PATCH')) setSheet(null) }} className="btn mt-2">Save</button>
        </Sheet>
      )}
      {sheet === 'income' && (
        <Sheet title={`GC paid · ${site.name}`} onClose={() => setSheet(null)}>
          <input className="field num text-2xl" inputMode="decimal" placeholder="$0" value={amount} onChange={e => setAmount(e.target.value)} autoFocus />
          <input className="field" placeholder="Note (invoice #, milestone)" value={note} onChange={e => setNote(e.target.value)} />
          {err && <div className="text-sm text-[var(--own)]">{err}</div>}
          <button disabled={busy || !(Number(amount) > 0)} onClick={async () => { if (await run('/api/income', { site_id: site.id, amount: Number(amount), note })) { setSheet(null); setAmount(''); setNote('') } }} className="btn mt-2">Save</button>
        </Sheet>
      )}
    </div>
  )
}
