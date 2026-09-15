import Link from 'next/link'
import { txData } from '@/lib/queries'
import { money, monthName, ym } from '@/lib/money'
import { Entries } from '@/components/entries'
import { MonthNav } from '@/components/ui'
import { TxFilters } from './filter'
import { SharePeriod } from './share'

export const dynamic = 'force-dynamic'

/** Все траты месяца: итоги сверху, два фильтра под ними — вид денег и объект.
 *  Правка и удаление — тапом по строке. */
export default async function Transactions(
  { searchParams }: { searchParams: Promise<{ m?: string; kind?: string; site?: string }> },
) {
  const { m, kind, site } = await searchParams
  const month = /^\d{4}-\d{2}$/.test(m || '') ? m! : ym()
  const only = kind === 'own' || kind === 'reimbursable' ? kind : undefined
  const d = await txData(month, only, site)
  const siteName = site === 'none' ? 'No site' : d.sites.find(s => s.id === site)?.name
  const filtered = !!site || !!only

  return (
    <div className="lg:max-w-[720px]">
      <Link href="/" className="flex min-h-11 items-center text-sm text-[var(--muted)] lg:hidden">‹ Home</Link>
      <div className="flex items-end justify-between">
        <div>
          <div className="display mt-1.5 text-[32px]">{monthName(month)}</div>
          <div className="label mt-1">{d.entries.length} {d.entries.length === 1 ? 'entry' : 'entries'} · {month.slice(0, 4)}</div>
        </div>
        <MonthNav month={month} base="/tx" />
      </div>

      {/* Итог ведёт, разбивка под ним и сходится: своё + возмещаемое = всего.
          Прежде наверху стояли три равновеликих числа, из которых складывались
          только два, — владелец справедливо не понимал, что там за цифры. */}
      <div className="panel mt-[18px]">
        <div className="panel-head">
          <div className="tag">{siteName ? `Spent · ${siteName}` : 'Spent this month'}</div>
          <div className="tag text-[var(--dim)]">{monthName(month).slice(0, 3)} {month.slice(2, 4)}</div>
        </div>
        <div className="px-4 pb-4 pt-4">
          <div className="num text-[34px] leading-none">−{money(d.total)}</div>
          {site && (
            <div className="mt-1.5 text-[13px] text-[var(--muted)]">
              of {money(d.allTotal)} across all sites
            </div>
          )}
          <div className="mt-3.5 grid grid-cols-2 gap-2.5 border-t border-white/8 pt-3.5">
            <div>
              <div className="label-xs text-[var(--own)]">Own money</div>
              <div className="num mt-1 text-[22px] text-[var(--own)]">−{money(d.own)}</div>
              <div className="mt-0.5 text-[11px] text-[var(--muted)]">stays ours</div>
            </div>
            <div>
              <div className="label-xs text-[var(--reimb)]">GC pays back</div>
              <div className="num mt-1 text-[22px] text-[var(--reimb)]">−{money(d.reimb)}</div>
              <div className="mt-0.5 text-[11px] text-[var(--muted)]">comes back to us</div>
            </div>
          </div>
        </div>
      </div>

      <TxFilters month={month} kind={only} site={site} sites={d.sites} orphanCount={d.orphanCount} />

      {/* Напоминание, а не заголовок: траты без объекта не попадают в прибыль
          площадки и теряются тише всего. Числом в шапке оно сбивало с толку —
          его хотелось сложить с двумя соседними, хотя это другой разрез. */}
      {d.orphanCount > 0 && site !== 'none' && (
        <Link href={`/tx?m=${month}&site=none`}
              className="mt-3 flex items-center justify-between gap-3 border-l-2 pl-3 text-[13px]"
              style={{ borderColor: 'var(--own)' }}>
          <span className="text-[var(--muted)]">
            {d.orphanCount} {d.orphanCount === 1 ? 'entry is' : 'entries are'} not attached to any site
          </span>
          <span className="num flex-none text-[var(--own)]">−{money(d.orphanTotal)}</span>
        </Link>
      )}

      <SharePeriod month={month} />
      <div className="mt-3">
        <Entries entries={d.entries} sites={d.sites.map(s => ({ id: s.id, name: s.name }))} editable />
      </div>
      {filtered && !d.entries.length && (
        <div className="row px-4 py-6 text-center text-sm text-[var(--muted)]">Nothing matches this filter.</div>
      )}
    </div>
  )
}
