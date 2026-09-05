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
          <div className="serif text-[30px] leading-[1.1] lg:text-[34px]">{monthName(month)}</div>
          <div className="label mt-1">{month === ym() ? 'This month' : month.slice(0, 4)} · {d.active} active {d.active === 1 ? 'site' : 'sites'}</div>
        </div>
        <MonthNav month={month} base="/" />
      </div>

      <div className="panel mt-[18px] p-[22px] lg:p-7">
        <div className="label">Profit</div>
        <div className="num mt-2 text-[40px] leading-[1.05] lg:text-[52px]" style={t.profit < 0 ? { color: 'var(--own)' } : undefined}>{money(t.profit)}</div>
        <div className="mt-5 grid grid-cols-3 gap-2.5 border-t border-white/7 pt-[18px]">
          <div><div className="label-xs">Income</div><div className="num mt-1.5 text-lg lg:text-2xl">{money(t.income)}</div></div>
          <div><div className="label-xs">Own</div><div className="num mt-1.5 text-lg text-[var(--own)] lg:text-2xl">{neg(t.own)}</div></div>
          <div><div className="label-xs">Wages</div><div className="num mt-1.5 text-lg text-[var(--own)] lg:text-2xl">{neg(t.wages)}</div></div>
        </div>
        <Link href={`/split?m=${month}`} className="mt-3.5 flex min-h-11 items-center justify-center rounded-xl text-[13px] text-[var(--accent-2)]" style={{ background: 'rgba(42,115,232,.14)' }}>Partner split →</Link>
      </div>

      <div className="my-[22px] flex items-center gap-2.5 lg:hidden">
        <div className="h-px flex-1 bg-white/7" /><div className="mono label-xs tracking-[.14em] text-[var(--dim)]">Not in profit</div><div className="h-px flex-1 bg-white/7" />
      </div>

      <div className="reimb-panel flex flex-col px-[22px] py-5 lg:mt-[18px] lg:p-7">
        <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[var(--reimb)]" /><div className="label text-[var(--reimb)]">Reimbursable outstanding</div></div>
        <div className="num mt-2 text-[34px] text-[var(--reimb)] lg:text-[40px]">{money(d.reimbOut)}</div>
        <div className="mt-1.5 text-[13px] text-[var(--muted)]">{d.receipts} {d.receipts === 1 ? 'receipt' : 'receipts'} · {d.outSites} {d.outSites === 1 ? 'site' : 'sites'} · GC pays this back</div>
        <Link href="/sites" className="btn-reimb mt-4 flex items-center justify-center lg:mt-auto">GC report →</Link>
      </div>

      <div>
        <div className="mb-2.5 mt-[26px] flex items-baseline justify-between px-0.5 lg:mt-3.5">
          <div className="label">Recent</div><div className="text-xs text-[var(--dim)]">{d.count} {d.count === 1 ? 'entry' : 'entries'}</div>
        </div>
        <Entries entries={d.entries} wide />
      </div>

      <div className="hidden lg:block">
        <div className="mb-2.5 mt-3.5 label px-0.5">Sites</div>
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
