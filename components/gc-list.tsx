'use client'
import { useState } from 'react'
import { money, shortDate } from '@/lib/money'

export type GcItem = { id: string; vendor: string; date: string; amount: number; src: string | null; reimbursed: boolean; note?: string | null; items?: number }

/** Список возмещаемых покупок с чеками. Один и тот же для владельца и для
 *  GC по ссылке — отличается только откуда берётся картинка. */
export function GcList({ items }: { items: GcItem[] }) {
  const [v, setV] = useState<GcItem | null>(null)
  return (
    <div className="mt-3.5 flex flex-col gap-2">
      {items.map(g => (
        <div key={g.id} className="row flex items-center gap-3 px-3.5 py-3" style={g.reimbursed ? { opacity: .55 } : undefined}>
          <button onClick={() => g.src && setV(g)} className="h-12 w-[38px] flex-none overflow-hidden p-0" aria-label="receipt">
            {g.src ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={g.src} alt="" className="thumb h-full w-full" style={{ borderColor: 'rgba(52,209,125,.3)' }} loading="lazy" />
                   : <div className="thumb h-full w-full opacity-40" />}
          </button>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[15px] font-medium">{g.vendor}</div>
            <div className="mt-0.5 text-xs text-[var(--muted)]">{shortDate(g.date)}{g.items ? ` · ${g.items} items` : ''}{g.reimbursed ? ' · paid back' : ''}</div>
            {g.note && <div className="mt-1 text-[13px] leading-snug text-[var(--fg-2)]">{g.note}</div>}
          </div>
          <div className="num text-base text-[var(--reimb)]">{money(g.amount, true)}</div>
        </div>
      ))}
      {!items.length && <div className="row px-4 py-6 text-center text-sm text-[var(--muted)]">No reimbursable purchases in this period.</div>}
      {v && v.src && (
        <div className="no-print fixed inset-0 z-50 flex flex-col bg-[rgba(4,6,9,.97)] p-[18px]">
          <div className="flex items-center justify-between">
            <div><div className="text-[15px] font-medium">{v.vendor}</div><div className="mt-0.5 text-xs text-[var(--muted)]">{money(v.amount, true)} · {shortDate(v.date)}</div></div>
            <button onClick={() => setV(null)} className="h-11 w-11 rounded-full border border-white/12 text-base">✕</button>
          </div>
          <div className="mt-[18px] min-h-0 flex-1 overflow-auto rounded-2xl border border-white/10 bg-[#0b0e13]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={v.src} alt={v.vendor} className="mx-auto max-w-full" />
          </div>
        </div>
      )}
    </div>
  )
}
