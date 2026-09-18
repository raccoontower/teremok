import Link from 'next/link'
import { sitesData } from '@/lib/queries'
import { money } from '@/lib/money'
import { StatusPill } from '@/components/ui'
import { NewSite } from './new-site'

export const dynamic = 'force-dynamic'

export default async function Sites() {
  const sites = await sitesData()
  return (
    <div className="lg:max-w-[720px]">
      <div className="flex items-end justify-between">
        <div><div className="display text-[30px]">Sites</div><div className="label mt-1">{sites.length} {sites.length === 1 ? 'tower' : 'towers'}</div></div>
        <NewSite />
      </div>
      <div className="mt-5 flex flex-col gap-2.5">
        {sites.map(s => (
          <Link key={s.id} href={`/sites/${s.id}`} className="panel block p-[18px]">
            <div className="flex items-center justify-between gap-2.5"><div className="text-base font-medium">{s.name}</div><StatusPill status={s.status} /></div>
            <div className="mt-0.5 text-[13px] text-[var(--muted)]">{s.address || s.gc_company || '—'}</div>
            {s.lastNote && (
              <div className="mt-3 border-l-2 border-[var(--line)] pl-3">
                <div className="mono text-[10px] uppercase tracking-[.14em] text-[var(--muted)]">
                  Log · {new Date(s.lastNote.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric' })}
                </div>
                <div className="mt-0.5 line-clamp-2 text-[13px] leading-snug text-[var(--fg-2)]">{s.lastNote.body}</div>
              </div>
            )}
            {/* Справа — состояние по деньгам с управляющей компанией: сколько
                она должна за этот объект и закрыт ли он. Раньше здесь стояло
                возмещаемое по объекту, но материалы с 18.09.2026 к объектам
                не привязаны, и цифра стала бессмысленной. */}
            <div className="mt-4 flex items-end justify-between gap-4">
              <div><div className="label-xs">Profit</div><div className="num mt-1 text-lg" style={s.profit < 0 ? { color: 'var(--own)' } : undefined}>{money(s.profit)}</div></div>
              <div className="text-right">
                <div className="label-xs">{s.gc.contract == null ? 'Contract' : s.gc.workOwed > 0 ? 'GC owes' : 'GC paid'}</div>
                {s.gc.contract == null ? (
                  <div className="num mt-1 text-lg text-[var(--dim)]">—</div>
                ) : s.gc.workOwed > 0 ? (
                  <div className="num mt-1 text-lg text-[var(--own)]">{money(s.gc.workOwed)}</div>
                ) : (
                  <div className="num mt-1 text-lg text-[var(--reimb)]">{money(s.gc.contract)}</div>
                )}
                {s.gc.contract != null && s.gc.paidWork > 0 && s.gc.workOwed > 0 && (
                  <div className="mt-0.5 text-[11px] text-[var(--muted)]">{money(s.gc.paidWork)} of {money(s.gc.contract)} paid</div>
                )}
              </div>
            </div>
          </Link>
        ))}
        {!sites.length && <div className="row px-4 py-6 text-center text-sm text-[var(--muted)]">No sites yet. Add the first tower.</div>}
      </div>
    </div>
  )
}
