import { headers } from 'next/headers'
import { materialsData } from '@/lib/queries'
import { money, shortDate } from '@/lib/money'
import { GcList } from '@/components/gc-list'
import { MaterialsPeriod, MaterialsActions } from './client'

export const dynamic = 'force-dynamic'

/**
 * Сколько ушло на материал за период — по всем объектам сразу.
 *
 * Отчёт по объекту отвечает на «что мне вернут за эту площадку». Здесь другой
 * вопрос, тот, который задаёт подрядчик: «с первого по восьмое — сколько?».
 * Раньше ответ складывали из нескольких отчётов руками.
 */
export default async function Materials({ searchParams }: { searchParams: Promise<{ from?: string; to?: string }> }) {
  const { from, to } = await searchParams
  const role = (await headers()).get('x-role') || 'owner'
  const d = await materialsData(from, to)

  const period = from || to
    ? `${from ? shortDate(from) : 'start'} – ${to ? shortDate(to) : 'today'}`
    : d.items.length ? `${shortDate(d.items.at(-1)!.spent_on)} – ${shortDate(d.items[0].spent_on)}` : 'no purchases'
  const withReceipt = d.items.filter(e => e.receipt_path).length
  const closed = d.total - d.outstanding

  return (
    <div className="lg:max-w-[720px]">
      <div className="display mt-1.5 text-[30px]">Materials</div>
      <div className="mt-1 text-[13px] text-[var(--muted)]">
        {[period, `${d.groups.length} ${d.groups.length === 1 ? 'site' : 'sites'}`].join(' · ')}
      </div>

      <div className="reimb-panel mt-[18px] px-[22px] py-5">
        <div className="label text-[var(--reimb)]">Spent on materials</div>
        <div className="num mt-2 text-[36px] text-[var(--reimb)]">{money(d.total, true)}</div>
        <div className="mt-1.5 text-[13px] text-[var(--muted)]">
          {d.items.length} {d.items.length === 1 ? 'purchase' : 'purchases'} · {withReceipt} with a receipt
          {closed > 0 ? ` · ${money(closed, true)} already paid back` : ''}
        </div>
        {closed > 0 && d.outstanding > 0 && (
          <div className="mt-3 border-t border-white/10 pt-3 text-[13px]">
            <span className="text-[var(--muted)]">Still owed </span>
            <span className="num text-[var(--reimb)]">{money(d.outstanding, true)}</span>
          </div>
        )}
      </div>

      <MaterialsPeriod from={from} to={to} />

      {/* Разбивка по объектам: подрядчик всегда спрашивает, за какую площадку. */}
      {d.groups.length > 1 && (
        <div className="mt-[26px]">
          <div className="tag mb-2.5 px-0.5">By site</div>
          <div className="flex flex-col gap-2">
            {d.groups.map(g => (
              <div key={g.siteId || 'none'} className="row flex items-center gap-3 px-3.5 py-3">
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[15px] font-medium">{g.name}</div>
                  <div className="mt-0.5 text-xs text-[var(--muted)]">
                    {g.items.length} {g.items.length === 1 ? 'purchase' : 'purchases'}
                    {g.gc ? ` · ${g.gc}` : ''}
                    {g.open === 0 ? ' · all paid back' : g.open < g.total ? ` · ${money(g.open, true)} still owed` : ''}
                  </div>
                </div>
                <div className="num flex-none text-base text-[var(--reimb)]"
                     style={g.open === 0 ? { opacity: .55 } : undefined}>{money(g.total, true)}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="tag mb-2.5 mt-[26px] px-0.5">Purchases</div>
      <GcList items={d.items.map(e => ({
        id: e.id,
        vendor: e.vendor || e.category,
        date: e.spent_on,
        amount: e.amount,
        src: e.receipt_path ? `/api/file?path=${encodeURIComponent(e.receipt_path)}` : null,
        reimbursed: !!e.reimbursed_on,
        note: e.note,
        kind: e.kind,
      }))} />

      <MaterialsActions from={from} to={to} openIds={d.openIds}
                        closedIds={d.items.filter(e => e.reimbursed_on).map(e => e.id)}
                        readOnly={role !== 'owner'} />
    </div>
  )
}
