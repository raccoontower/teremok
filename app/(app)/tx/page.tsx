import Link from 'next/link'
import { txData } from '@/lib/queries'
import { money, monthName, ym } from '@/lib/money'
import { Entries } from '@/components/entries'
import { MonthNav } from '@/components/ui'
import { KindFilter } from './filter'

export const dynamic = 'force-dynamic'

/** Все транзакции: месяц, фильтр по виду денег, итоги сверху. Правка и
 *  удаление — тапом по строке. */
export default async function Transactions({ searchParams }: { searchParams: Promise<{ m?: string; kind?: string }> }) {
  const { m, kind } = await searchParams
  const month = /^\d{4}-\d{2}$/.test(m || '') ? m! : ym()
  const only = kind === 'own' || kind === 'reimbursable' ? kind : undefined
  const d = await txData(month, only)
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

      <div className="panel mt-[18px]">
        <div className="panel-head"><div className="tag">Spent this month</div><div className="tag text-[var(--dim)]">{monthName(month).slice(0, 3)} {month.slice(2, 4)}</div></div>
        <div className="grid grid-cols-2 gap-2.5 px-4 py-4">
          <div>
            <div className="label-xs text-[var(--own)]">Own money</div>
            <div className="num mt-1.5 text-[26px] text-[var(--own)]">−{money(d.own)}</div>
          </div>
          <div>
            <div className="label-xs text-[var(--reimb)]">Reimbursable</div>
            <div className="num mt-1.5 text-[26px] text-[var(--reimb)]">−{money(d.reimb)}</div>
          </div>
        </div>
      </div>

      <KindFilter month={month} active={only} />
      <div className="mt-3">
        <Entries entries={d.entries} sites={d.sites} editable />
      </div>
    </div>
  )
}
