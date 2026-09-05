import Link from 'next/link'
import { splitData } from '@/lib/queries'
import { money, neg, monthName, ym, shortDate } from '@/lib/money'
import { MonthNav } from '@/components/ui'
import { Payout } from './payout'
import { SplitExport } from './export'

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
          <div className="display mt-1.5 text-[30px]">Partner split</div>
          <div className="label mt-1">{monthName(month)} {month.slice(0, 4)} · all sites</div>
        </div>
        <MonthNav month={month} base="/split" />
      </div>

      <div className="panel mt-[18px] px-[22px] py-5">
        {[['Income', money(t.income), undefined], ['Own expenses', neg(t.own), 'var(--own)'], ['Wages', neg(t.wages), 'var(--own)']].map(([k, v, c]) => (
          <div key={k as string} className="flex items-baseline justify-between py-[7px]"><div className="text-sm text-[var(--fg-2)]">{k}</div><div className="num text-lg" style={{ color: c as string }}>{v}</div></div>
        ))}
        <div className="my-3.5 h-px bg-white/9" />
        <div className="flex items-baseline justify-between"><div className="label">Profit this month</div><div className="num text-[32px]" style={t.profit < 0 ? { color: 'var(--own)' } : undefined}>{money(t.profit)}</div></div>
        <div className="mt-4 grid grid-cols-2 gap-2.5 border-t border-white/7 pt-4">
          {d.partners.map(p => (
            <div key={p.id}>
              <div className="label-xs">{p.name} · {Math.round(p.share * 100)}%</div>
              <div className="num mt-1.5 text-xl">{money(p.cut)}</div>
              {p.frontedMonth > 0 && <div className="mt-0.5 text-xs text-[var(--muted)]">paid {money(p.frontedMonth)} from own card</div>}
              {p.takenMonth > 0 && <div className="mt-0.5 text-xs text-[var(--muted)]">received {money(p.takenMonth)}</div>}
            </div>
          ))}
        </div>
      </div>

      {/* Расчёт накопительный: перевод в октябре закрывает сентябрьскую долю,
          поэтому «должен / взял лишнего» считается за всё время. */}
      <div className="label mx-0.5 mb-2.5 mt-[26px]">Settlement · all time</div>
      <div className="flex gap-2.5">
        {d.partners.map(p => (
          <div key={p.id} className="glass flex-1 rounded-[20px] p-[18px]">
            <div className="label">{p.name}</div>
            <div className="mt-2 flex items-baseline justify-between text-xs text-[var(--muted)]"><span>Profit share</span><span className="mono text-[var(--fg)]">{money(p.cutAll)}</span></div>
            {p.fronted > 0 && (
              <div className="mt-1 flex items-baseline justify-between text-xs text-[var(--muted)]">
                <span>Own card</span><span className="mono text-[var(--fg)]">+{money(p.fronted)}</span>
              </div>
            )}
            <div className="mt-1 flex items-baseline justify-between text-xs text-[var(--muted)]"><span>Received</span><span className="mono">−{money(p.takenAll)}</span></div>
            <div className="my-3 h-px bg-white/7" />
            <div className="label-xs" style={{ color: p.balance < 0 ? 'var(--reimb)' : 'var(--own)' }}>{p.balance < 0 ? 'Took extra' : 'Still owed'}</div>
            <div className="num mt-1 text-2xl" style={{ color: p.balance < 0 ? 'var(--reimb)' : 'var(--own)' }}>{money(Math.abs(p.balance))}</div>
            <Payout partner={{ id: p.id, name: p.name, owed: p.balance }} sites={d.sites} />
          </div>
        ))}
      </div>

      <div className="mt-3 rounded-[20px] border border-dashed px-5 py-[18px]" style={{ borderColor: 'rgba(52,209,125,.35)', background: 'rgba(52,209,125,.05)' }}>
        <div className="flex items-center justify-between gap-3"><div className="label text-[var(--reimb)]">Reimbursable</div><div className="num text-[22px] text-[var(--reimb)]">{money(t.reimb)}</div></div>
        <div className="mt-2 text-[13px] text-[var(--muted)]">Excluded from the split. It is the GC&rsquo;s money coming back, not profit.</div>
      </div>

      <SplitExport month={month} />

      <div className="label mx-0.5 mb-2.5 mt-[26px]">Transfers</div>
      <div className="flex flex-col gap-2">
        {d.payouts.slice(0, 20).map(x => (
          <div key={x.id} className="row flex items-center gap-3 px-3.5 py-3">
            <div className="min-w-0 flex-1">
              <div className="text-[15px] font-medium">{x.partner}</div>
              <div className="mt-0.5 text-xs text-[var(--muted)]">{[shortDate(x.paid_on), x.site, x.note].filter(Boolean).join(' · ')}</div>
            </div>
            <div className="num text-base">{money(x.amount, true)}</div>
          </div>
        ))}
        {!d.payouts.length && <div className="row px-4 py-5 text-center text-sm text-[var(--muted)]">No transfers yet. Record one when you move money.</div>}
      </div>
    </div>
  )
}
