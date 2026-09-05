import Link from 'next/link'
import { notFound } from 'next/navigation'
import { siteData } from '@/lib/queries'
import { money, neg, initials, shortDate } from '@/lib/money'
import { Entries } from '@/components/entries'
import { StatusPill } from '@/components/ui'
import { SiteActions } from './actions'

export const dynamic = 'force-dynamic'

export default async function SitePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const d = await siteData(id); if (!d) notFound()
  const { site, totals: t } = d
  const dates = site.starts_on ? `${shortDate(site.starts_on)} – ${site.ends_on ? shortDate(site.ends_on) : 'ongoing'}` : ''
  return (
    <div className="lg:max-w-[720px]">
      <Link href="/sites" className="flex min-h-11 items-center text-sm text-[var(--muted)]">‹ Sites</Link>
      <div className="mt-1.5 flex items-center justify-between gap-2.5">
        <div className="display text-[30px]">{site.name}</div>
        <SiteActions site={site} />
      </div>
      <div className="mt-0.5 text-[13px] text-[var(--muted)]">{[site.address, site.gc_company, dates].filter(Boolean).join(' · ') || <StatusPill status={site.status} />}</div>

      <div className="panel mt-[18px] p-[22px]">
        <div className="label">Site profit</div>
        <div className="num mt-2 text-[36px]" style={t.profit < 0 ? { color: 'var(--own)' } : undefined}>{money(t.profit)}</div>
        <div className="mt-[18px] grid grid-cols-3 gap-2.5 border-t border-white/7 pt-4">
          <div><div className="label-xs">Income</div><div className="num mt-1.5 text-[17px]">{money(t.income)}</div></div>
          <div><div className="label-xs">Own</div><div className="num mt-1.5 text-[17px] text-[var(--own)]">{neg(t.own)}</div></div>
          <div><div className="label-xs">Wages</div><div className="num mt-1.5 text-[17px] text-[var(--own)]">{neg(t.wages)}</div></div>
        </div>
      </div>

      <div className="reimb-panel mt-3 flex items-center gap-3.5 rounded-[20px] px-5 py-4">
        <div className="min-w-0 flex-1">
          <div className="label-xs text-[var(--reimb)]" style={{ fontSize: 11 }}>Reimbursable · not in profit</div>
          <div className="num mt-1.5 text-[26px] text-[var(--reimb)]">{money(t.reimbOut)}</div>
          {t.reimb > t.reimbOut && <div className="mt-0.5 text-xs text-[var(--muted)]">{money(t.reimb - t.reimbOut)} already paid back</div>}
        </div>
        <Link href={`/gc/${site.id}`} className="btn-reimb flex flex-none items-center px-4">GC report</Link>
      </div>

      {d.income.length > 0 && (
        <>
          <div className="label mx-0.5 mb-2.5 mt-[26px]">Income from GC</div>
          <div className="flex flex-col gap-2">
            {d.income.map(i => (
              <div key={i.id} className="row flex items-center gap-3 px-3.5 py-3">
                <div className="min-w-0 flex-1"><div className="text-[15px]">{i.note || 'Payment'}</div><div className="mt-0.5 text-xs text-[var(--muted)]">{shortDate(i.received_on)}</div></div>
                <div className="num text-base">{money(i.amount, true)}</div>
              </div>
            ))}
          </div>
        </>
      )}

      <div className="label mx-0.5 mb-2.5 mt-[26px]">Who worked</div>
      <div className="flex flex-col gap-2">
        {d.crew.map(c => (
          <div key={c.id} className="row flex items-center gap-3 px-3.5 py-3">
            <div className="flex h-[34px] w-[34px] flex-none items-center justify-center rounded-none border border-white/12 text-xs text-[var(--fg-2)]">{initials(c.name)}</div>
            <div className="min-w-0 flex-1 text-[15px]">{c.name}</div>
            <div className="text-[13px] text-[var(--muted)]">{c.days} {c.days === 1 ? 'day' : 'days'}</div>
            <div className="num text-[15px] text-[var(--own)]">{money(c.earned)}</div>
          </div>
        ))}
        {!d.crew.length && <div className="row px-4 py-4 text-sm text-[var(--muted)]">Nobody scheduled here yet — assign days in Week.</div>}
      </div>

      <div className="label mx-0.5 mb-2.5 mt-[26px]">Timeline</div>
      <Entries entries={d.entries} showSite={false} />
    </div>
  )
}
