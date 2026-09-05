'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { money, shortDate } from '@/lib/money'
import type { ReportExport } from '@/lib/queries'

const iso = (d: Date) => d.toISOString().slice(0, 10)

/** Период отчёта. Владелец отчитывается кусками («с 6 по 16»), поэтому две
 *  даты — главный элемент, а пресеты только чтобы не тыкать календарь. */
export function Period({ siteId, from, to }: { siteId: string; from?: string; to?: string }) {
  const router = useRouter()
  const [f, setF] = useState(from || '')
  const [t, setT] = useState(to || '')
  const go = (a: string, b: string) => {
    const q = [a && `from=${a}`, b && `to=${b}`].filter(Boolean).join('&')
    router.push(`/gc/${siteId}${q ? `?${q}` : ''}`)
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

/** Что уже отправляли: главный вопрос перед новой отправкой — «за что я уже
 *  отчитался». Тап по строке открывает тот же период заново. */
export function ExportHistory({ siteId, items }: { siteId: string; items: ReportExport[] }) {
  const router = useRouter()
  if (!items.length) return null
  const label = (k: string) => (k === 'link' ? 'link' : k === 'partner' ? 'split' : 'report')
  return (
    <div className="no-print mt-[26px]">
      <div className="tag mb-2.5 px-0.5">Already sent</div>
      <div className="flex flex-col gap-2">
        {items.map(x => (
          <button key={x.id}
                  onClick={() => router.push(`/gc/${siteId}?from=${x.period_from || ''}&to=${x.period_to || ''}`)}
                  className="row flex w-full items-center gap-3 px-3.5 py-3 text-left">
            <div className="min-w-0 flex-1">
              <div className="text-[15px]">
                {x.period_from ? shortDate(x.period_from) : '…'} – {x.period_to ? shortDate(x.period_to) : '…'}
              </div>
              <div className="mono mt-0.5 text-[10px] uppercase tracking-[.14em] text-[var(--muted)]">
                {label(x.kind)} · {x.format} · sent {shortDate(x.created_at.slice(0, 10))}
                {x.item_count != null ? ` · ${x.item_count} items` : ''}
              </div>
            </div>
            {x.total != null && <div className="num text-[15px] text-[var(--reimb)]">{money(x.total, true)}</div>}
          </button>
        ))}
      </div>
    </div>
  )
}
