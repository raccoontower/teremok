'use client'
import { useState } from 'react'
import { money, shortDate } from '@/lib/money'
import { ReceiptViewer, Thumb } from './ui'
import type { Entry } from '@/lib/queries'

/** Лента записей: цветная полоска = вид денег, сумма тем же цветом, чек
 *  справа. Одна и та же на главной, в объекте и на десктопе. */
export function Entries({ entries, showSite = true, wide = false }: { entries: Entry[]; showSite?: boolean; wide?: boolean }) {
  const [v, setV] = useState<Entry | null>(null)
  if (!entries.length) return <div className="row px-4 py-6 text-center text-sm text-[var(--muted)]">Nothing yet. Tap the camera.</div>
  return (
    <div className="flex flex-col gap-2">
      {entries.map(e => {
        const color = e.kind === 'reimbursable' ? 'var(--reimb)' : 'var(--own)'
        const meta = [showSite ? e.site : null, shortDate(e.date), e.kind === 'reimbursable' ? 'GC pays back' : 'own cost'].filter(Boolean).join(' · ')
        return (
          <div key={e.id} className="row flex items-center gap-3 px-3.5 py-3">
            <div className="h-[38px] w-[3px] flex-none rounded-full" style={{ background: color }} />
            <div className={`min-w-0 flex-1 ${wide ? 'lg:flex lg:items-center lg:gap-4' : ''}`}>
              <div className={`truncate text-[15px] font-medium ${wide ? 'lg:w-[190px] lg:flex-none' : ''}`}>{e.vendor}</div>
              <div className="mt-0.5 truncate text-xs text-[var(--muted)] lg:mt-0">{meta}</div>
            </div>
            <div className="num flex-none text-base" style={{ color }}>{money(e.amount, true)}</div>
            <Thumb path={e.receipt} onClick={() => setV(e)} />
          </div>
        )
      })}
      {v && v.receipt && <ReceiptViewer path={v.receipt} title={v.vendor} sub={`${money(v.amount, true)} · ${v.site} · ${shortDate(v.date)}`} onClose={() => setV(null)} />}
    </div>
  )
}
