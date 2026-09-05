'use client'
import { useState } from 'react'
import { money, shortDate } from '@/lib/money'
import { ReceiptViewer, Sheet, SheetRow, Thumb, useAction } from './ui'
import type { Entry } from '@/lib/queries'

/** Лента записей. Расход всегда с минусом: без него $18.00 читается как
 *  приход, а в этом приложении приход бывает только от управляющей компании.
 *  Цвет говорит, чьи это деньги: янтарный — наши, зелёный — вернут. */
export function Entries({ entries, showSite = true, wide = false, sites = [], editable = false }:
  { entries: Entry[]; showSite?: boolean; wide?: boolean; sites?: { id: string; name: string }[]; editable?: boolean }) {
  const [viewer, setViewer] = useState<Entry | null>(null)
  const [edit, setEdit] = useState<Entry | null>(null)
  if (!entries.length) return <div className="row px-4 py-6 text-center text-sm text-[var(--muted)]">Nothing yet.</div>
  return (
    <div className="flex flex-col gap-2">
      {entries.map(e => {
        const color = e.kind === 'reimbursable' ? 'var(--reimb)' : 'var(--own)'
        const meta = [showSite ? e.site : null, shortDate(e.date), e.kind === 'reimbursable' ? 'GC pays back' : 'own cost'].filter(Boolean).join(' · ')
        return (
          <div key={e.id} className="row flex items-center gap-3 px-3.5 py-3">
            <button onClick={() => editable && setEdit(e)} className="flex min-w-0 flex-1 items-center gap-3 text-left" disabled={!editable}>
              <span className="h-[40px] w-[5px] flex-none" style={{ background: color }} />
              <span className={`min-w-0 flex-1 ${wide ? 'lg:flex lg:items-center lg:gap-4' : ''}`}>
                <span className={`block truncate text-[15px] font-medium ${wide ? 'lg:w-[190px] lg:flex-none' : ''}`}>{e.vendor}</span>
                <span className="mt-0.5 block truncate text-xs text-[var(--muted)] lg:mt-0">{meta}</span>
                {e.note && <span className="mt-1 block truncate text-[13px] text-[var(--fg-2)]">{e.note}</span>}
              </span>
            </button>
            <div className="num flex-none text-base" style={{ color }}>−{money(e.amount, true)}</div>
            <Thumb path={e.receipt} onClick={() => setViewer(e)} />
          </div>
        )
      })}
      {viewer?.receipt && <ReceiptViewer path={viewer.receipt} title={viewer.vendor} sub={`${money(viewer.amount, true)} · ${viewer.site} · ${shortDate(viewer.date)}`} onClose={() => setViewer(null)} />}
      {edit && <EditEntry entry={edit} sites={sites} onClose={() => setEdit(null)} />}
    </div>
  )
}

/** Правка записи: чаще всего надо перекинуть между «своё» и «возмещаемое»
 *  или привязать объект, который забыли выбрать при вводе. */
function EditEntry({ entry, sites, onClose }: { entry: Entry; sites: { id: string; name: string }[]; onClose: () => void }) {
  const [kind, setKind] = useState(entry.kind)
  const [site, setSite] = useState(entry.siteId || '')
  const [amount, setAmount] = useState(String(entry.amount))
  const { run, busy, err } = useAction()
  const isReimb = kind === 'reimbursable'
  return (
    <Sheet title={entry.vendor} onClose={onClose}>
      <input className="field num text-2xl" inputMode="decimal" value={amount} onChange={e => setAmount(e.target.value)} />
      <SheetRow label={isReimb ? 'Reimbursable — GC pays back' : 'Own cost — our money'} sub="tap to flip"
                dot={isReimb ? 'var(--reimb)' : 'var(--own)'} active onClick={() => setKind(isReimb ? 'own' : 'reimbursable')} />
      <select className="field" value={site} onChange={e => setSite(e.target.value)}>
        <option value="">No site</option>
        {sites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
      </select>
      {err && <div className="text-sm text-[var(--own)]">{err}</div>}
      <button disabled={busy} onClick={async () => { if (await run(`/api/expenses/${entry.id}`, { kind, site_id: site || null, amount: Number(amount) }, 'PATCH')) onClose() }} className="btn mt-2">Save</button>
      <button disabled={busy} onClick={async () => { if (confirm('Delete this entry?') && await run(`/api/expenses/${entry.id}`, {}, 'DELETE')) onClose() }}
              className="btn-ghost" style={{ color: 'var(--own)' }}>Delete</button>
    </Sheet>
  )
}
