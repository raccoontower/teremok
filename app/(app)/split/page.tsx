import Link from 'next/link'
import { splitData } from '@/lib/queries'
import { money, neg, monthName, ym } from '@/lib/money'
import { MonthNav } from '@/components/ui'
import { Payout } from './payout'

export const dynamic = 'force-dynamic'

export default async function Split({ searchParams }: { searchParams: Promise<{ m?: string }> }) {
  const { m } = await searchParams
  const month = /^\d{4}-\d{2}$/.test(m || '') ? m! : ym()
  const d = await splitData(month); const t = d.totals
  return (
    <div className="lg:max-w-[720px]">
      <Link href="/" className="flex min-h-11 items-center text-sm text-[var(--muted)] lg:hidden">‹ Home</Link>
      <div className="flex items-end justify-between">
        <div>
          <div className="serif mt-1.5 text-[30px]">Partner split</div>
          <div className="label mt-1">{monthName(month)} {month.slice(0, 4)} · all sites</div>
        </div>
        <MonthNav month={month} base="/split" />
      </div>

      <div className="panel mt-[18px] px-[22px] py-5">
        {[['Income', money(t.income), undefined], ['Own expenses', neg(t.own), 'var(--own)'], ['Wages', neg(t.wages), 'var(--own)']].map(([k, v, c]) => (
          <div key={k as string} className="flex items-baseline justify-between py-[7px]"><div className="text-sm text-[var(--fg-2)]">{k}</div><div className="num text-lg" style={{ color: c as string }}>{v}</div></div>
        ))}
        <div className="my-3.5 h-px bg-white/9" />
        <div className="flex items-baseline justify-between"><div className="label">Profit</div><div className="num text-[32px]" style={t.profit < 0 ? { color: 'var(--own)' } : undefined}>{money(t.profit)}</div></div>
      </div>

      <div className="mt-3 flex gap-2.5">
        {d.partners.map(p => (
          <div key={p.id} className="glass flex-1 rounded-[20px] p-[18px]">
            <div className="label">{p.name} · {Math.round(p.share * 100)}%</div>
            <div className="num mt-2 text-2xl">{money(p.cut)}</div>
            <div className="my-3.5 h-px bg-white/7" />
            <div className="flex justify-between py-[3px] text-xs text-[var(--muted)]"><span>Taken</span><span className="mono">{money(p.taken)}</span></div>
            <div className="flex justify-between py-[3px] text-xs" style={{ color: p.owed < 0 ? 'var(--reimb)' : 'var(--own)' }}><span>{p.owed < 0 ? 'Over' : 'Owed'}</span><span className="mono">{money(Math.abs(p.owed))}</span></div>
            <Payout partner={p} sites={d.sites} />
          </div>
        ))}
      </div>

      <div className="mt-3 rounded-[20px] border border-dashed px-5 py-[18px]" style={{ borderColor: 'rgba(52,209,125,.35)', background: 'rgba(52,209,125,.05)' }}>
        <div className="flex items-center justify-between gap-3"><div className="label text-[var(--reimb)]">Reimbursable</div><div className="num text-[22px] text-[var(--reimb)]">{money(t.reimb)}</div></div>
        <div className="mt-2 text-[13px] text-[var(--muted)]">Excluded from the split. It is the GC&rsquo;s money coming back, not profit.</div>
      </div>

      <div className="label mx-0.5 mb-2.5 mt-[26px]">All time</div>
      <div className="row px-4 py-3.5">
        {d.partners.map(p => (
          <div key={p.id} className="flex items-baseline justify-between py-1 text-sm">
            <span className="text-[var(--fg-2)]">{p.name}</span>
            <span className="text-xs text-[var(--muted)]">cut <span className="mono text-[var(--fg)]">{money(p.cutAll)}</span> · taken <span className="mono">{money(p.takenAll)}</span> · <span className="mono" style={{ color: p.owedAll < 0 ? 'var(--reimb)' : 'var(--own)' }}>{p.owedAll < 0 ? 'over' : 'owed'} {money(Math.abs(p.owedAll))}</span></span>
          </div>
        ))}
      </div>
    </div>
  )
}
