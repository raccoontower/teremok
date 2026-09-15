'use client'
import { useState } from 'react'
import { money, shortDate, today } from '@/lib/money'
import { Sheet, useAction } from '@/components/ui'

export type OtherIncome = { id: string; amount: number; received_on: string; source: string | null; note: string | null; received_by: string | null }
export type PartnerRef = { id: string; name: string }

/** Приход не от объекта: расчёт от прежнего работодателя, разовая подработка.
 *
 *  Отдельным блоком, а не строкой в общей ленте: лента — это расходы, там
 *  каждая сумма с минусом и правится между «своё / возмещаемое». Приход туда
 *  не ложится ни по смыслу, ни по разметке, а показать его надо обязательно —
 *  он меняет прибыль месяца, и без строки цифра съезжает молча. */
export function OtherIncomeBlock({ month, items, partners }: { month: string; items: OtherIncome[]; partners: PartnerRef[] }) {
  const [open, setOpen] = useState(false)
  const [edit, setEdit] = useState<OtherIncome | null>(null)
  const total = items.reduce((s, i) => s + i.amount, 0)
  return (
    <div className="mt-[26px] lg:mt-3.5">
      <div className="mb-2.5 flex items-baseline justify-between px-0.5">
        <div className="tag">Other income</div>
        <button onClick={() => setOpen(true)} className="tag text-[var(--accent-2)]">+ Add</button>
      </div>
      {items.length > 0 && (
        <div className="flex flex-col gap-2">
          {items.map(i => (
            <button key={i.id} onClick={() => setEdit(i)} className="row flex items-center gap-3 px-3.5 py-3 text-left">
              <span className="h-[40px] w-[5px] flex-none" style={{ background: 'var(--reimb)' }} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[15px] font-medium">{i.source || 'Income'}</span>
                <span className="mt-0.5 block truncate text-xs text-[var(--muted)]">No site · {shortDate(i.received_on)}{i.received_by ? ` · to ${partners.find(p => p.id === i.received_by)?.name.split(' ')[0] ?? 'partner'}` : ''}</span>
                {i.note && <span className="mt-1 block truncate text-[13px] text-[var(--fg-2)]">{i.note}</span>}
              </span>
              <span className="num flex-none text-base" style={{ color: 'var(--reimb)' }}>{money(i.amount, true)}</span>
            </button>
          ))}
          {items.length > 1 && (
            <div className="flex justify-between px-3.5 pt-1 text-xs text-[var(--muted)]">
              <span>{items.length} entries</span><span className="num">{money(total, true)}</span>
            </div>
          )}
        </div>
      )}
      {!items.length && (
        <div className="row px-4 py-4 text-sm text-[var(--muted)]">
          Money that came in outside the sites — previous job, side work.
        </div>
      )}
      {open && <IncomeSheet month={month} partners={partners} onClose={() => setOpen(false)} />}
      {edit && <IncomeSheet month={month} partners={partners} entry={edit} onClose={() => setEdit(null)} />}
    </div>
  )
}

function IncomeSheet({ month, entry, partners, onClose }: { month: string; entry?: OtherIncome; partners: PartnerRef[]; onClose: () => void }) {
  const [amount, setAmount] = useState(entry ? String(entry.amount) : '')
  const [source, setSource] = useState(entry?.source || '')
  const [note, setNote] = useState(entry?.note || '')
  // На чей счёт легли деньги. Без этого приход считался лежащим «у фирмы», и
  // расчёт с партнёром расходился ровно на эту сумму.
  const [who, setWho] = useState(entry?.received_by || '')
  // Новый приход датируется сегодняшним днём, но если листаешь прошлый месяц —
  // логичнее его последнее число, иначе запись уедет из месяца, который смотришь.
  const [date, setDate] = useState(entry?.received_on || defaultDate(month))
  const { run, busy, err } = useAction()
  const ok = Number(amount) > 0 && source.trim().length > 0

  return (
    <Sheet title={entry ? 'Income' : 'Income — no site'} onClose={onClose}>
      <input className="field num text-2xl" inputMode="decimal" placeholder="$0" value={amount}
             onChange={e => setAmount(e.target.value)} autoFocus={!entry} />
      <input className="field" placeholder="Who paid (company, client)" value={source}
             onChange={e => setSource(e.target.value)} />
      <input className="field" type="date" value={date} onChange={e => setDate(e.target.value)} />
      <input className="field" placeholder="Note (what for)" value={note} onChange={e => setNote(e.target.value)} />
      {partners.length > 0 && (
        <div>
          <div className="tag mb-1.5 px-0.5">Landed on whose account</div>
          <div className="flex gap-2">
            {[...partners, { id: '', name: 'Shared' }].map(x => (
              <button key={x.id || 'shared'} type="button" onClick={() => setWho(x.id)}
                      className={who === x.id ? 'btn flex-1 text-[13px]' : 'btn-ghost flex-1 text-[13px]'}>
                {x.name.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>
      )}
      {err && <div className="text-sm text-[var(--own)]">{err}</div>}
      <button disabled={busy || !ok} className="btn mt-2"
              onClick={async () => {
                const body = { amount: Number(amount), source, note, received_on: date, received_by: who || null }
                const okDone = entry
                  ? await run(`/api/income/${entry.id}`, body, 'PATCH')
                  : await run('/api/income', body)
                if (okDone) onClose()
              }}>Save</button>
      {entry && (
        <button disabled={busy} className="mt-1 h-11 text-[15px] text-[var(--own)]"
                onClick={async () => { if (await run(`/api/income/${entry.id}`, {}, 'DELETE')) onClose() }}>
          Delete
        </button>
      )}
    </Sheet>
  )
}

function defaultDate(month: string) {
  const now = today()
  if (now.slice(0, 7) === month) return now
  const [y, m] = month.split('-').map(Number)
  return new Date(Date.UTC(y, m, 0)).toISOString().slice(0, 10)
}
