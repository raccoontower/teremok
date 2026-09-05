import Link from 'next/link'
import { homeData } from '@/lib/queries'
import { money, neg, monthName, ym } from '@/lib/money'
import { Entries } from '@/components/entries'
import { FlashToast, MonthNav, StatusPill } from '@/components/ui'

export const dynamic = 'force-dynamic'

export default async function Home({ searchParams }: { searchParams: Promise<{ m?: string }> }) {
  const { m } = await searchParams
  const month = /^\d{4}-\d{2}$/.test(m || '') ? m! : ym()
  const d = await homeData(month)
  const t = d.totals
  return (
    <div className="lg:grid lg:grid-cols-[minmax(0,2.1fr)_minmax(0,1fr)] lg:gap-3.5">
      <FlashToast />
      <div className="flex items-end justify-between lg:col-span-2">
        <div>
          <div className="display text-[30px] leading-[1.1] lg:text-[34px]">{monthName(month)}</div>
          <div className="label mt-1">{month === ym() ? 'This month' : month.slice(0, 4)} · {d.active} active {d.active === 1 ? 'site' : 'sites'}</div>
        </div>
        <MonthNav month={month} base="/" />
      </div>

      <div className="panel ticks mt-[18px]">
        <div className="panel-head">
          <div className="tag">Profit / own only</div>
          <div className="tag text-[var(--dim)]">{monthName(month).slice(0, 3)} {month.slice(2, 4)}</div>
        </div>
        <div className="px-4 pb-[18px] pt-5 lg:px-7 lg:pt-6">
        <div className="num text-[46px] leading-none lg:text-[56px]" style={t.profit < 0 ? { color: 'var(--own)' } : undefined}>{money(t.profit)}</div>
        <div className="mt-5 grid grid-cols-3 gap-2.5 border-t border-white/7 pt-[18px]">
          <div><div className="label-xs">Income</div><div className="num mt-1.5 text-lg lg:text-2xl">{money(t.income)}</div></div>
          <div><div className="label-xs">Own</div><div className="num mt-1.5 text-lg text-[var(--own)] lg:text-2xl">{neg(t.own)}</div></div>
          <div><div className="label-xs">Wages</div><div className="num mt-1.5 text-lg text-[var(--own)] lg:text-2xl">{neg(t.wages)}</div></div>
        </div>
        <Link href={`/split?m=${month}`} className="btn-accent mt-4 flex items-center justify-center">Partner split →</Link>
        </div>
      </div>

      <div className="my-5 flex items-center gap-2.5 lg:hidden">
        <div className="hatch" /><div className="tag text-[var(--reimb)]">Not in profit</div><div className="hatch" />
      </div>

      <div className="reimb-panel flex flex-col px-[18px] py-4 lg:mt-[18px] lg:px-7 lg:py-6">
        <div className="tag text-[var(--reimb)]">GC owes us</div>
        <div className="num mt-2.5 text-[38px] leading-none text-[var(--reimb)] lg:text-[44px]">{money(d.reimbOut + d.workOwed)}</div>
        <div className="mt-2 flex gap-5">
          <div>
            <div className="label-xs text-[var(--muted)]">For work</div>
            <div className="num mt-1 text-lg text-[var(--reimb)]">{money(d.workOwed)}</div>
          </div>
          <div>
            <div className="label-xs text-[var(--muted)]">Materials</div>
            <div className="num mt-1 text-lg text-[var(--reimb)]">{money(d.reimbOut)}</div>
          </div>
        </div>
        <div className="mt-2 text-[13px] text-[var(--muted)]">{d.receipts} {d.receipts === 1 ? 'receipt' : 'receipts'} · {d.outSites} {d.outSites === 1 ? 'site' : 'sites'}</div>
        <Link href="/sites" className="btn-reimb mt-4 flex items-center justify-center lg:mt-auto">GC report →</Link>
      </div>

      <div>
        <div className="mb-2.5 mt-[26px] flex items-baseline justify-between px-0.5 lg:mt-3.5">
          <div className="tag">Recent entries</div>
          <Link href={`/tx?m=${month}`} className="tag text-[var(--accent-2)]">All {d.count} →</Link>
        </div>
        <Entries entries={d.entries} sites={d.sites.map(s => ({ id: s.id, name: s.name }))} editable wide />
      </div>

      <div className="hidden lg:block">
        <div className="tag mb-2.5 mt-3.5 px-0.5">Sites</div>
        <div className="flex flex-col gap-2">
          {d.sites.map(s => (
            <Link key={s.id} href={`/sites/${s.id}`} className="row block px-[18px] py-3.5">
              <div className="flex items-center justify-between gap-2.5"><div className="text-sm font-medium">{s.name}</div><StatusPill status={s.status} /></div>
              <div className="mt-2.5 flex items-baseline justify-between"><div className="num text-[17px]">{money(s.profit)}</div><div className="num text-sm text-[var(--reimb)]">{money(s.reimbOut)}</div></div>
            </Link>
          ))}
          {!d.sites.length && <div className="row px-4 py-5 text-sm text-[var(--muted)]">No sites yet.</div>}
        </div>
      </div>
    </div>
  )
}
