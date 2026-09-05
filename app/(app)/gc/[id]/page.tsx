import Link from 'next/link'
import { notFound } from 'next/navigation'
import { gcData, exportsFor } from '@/lib/queries'
import { money, shortDate } from '@/lib/money'
import { GcList } from '@/components/gc-list'
import { GcActions } from './actions'
import { Period, ExportHistory } from './period'

export const dynamic = 'force-dynamic'

export default async function GcReport({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ from?: string; to?: string }> }) {
  const { id } = await params; const { from, to } = await searchParams
  const [d, sent] = await Promise.all([gcData(id, from, to), exportsFor(id)])
  if (!d) notFound()
  const period = from || to
    ? `${from ? shortDate(from) : 'start'} – ${to ? shortDate(to) : 'today'}`
    : d.items.length ? `${shortDate(d.items.at(-1)!.spent_on)} – ${shortDate(d.items[0].spent_on)}` : 'no purchases'
  const items = d.items.map(e => ({ id: e.id, vendor: e.vendor || e.category, date: e.spent_on, amount: e.amount, src: e.receipt_path ? `/api/file?path=${encodeURIComponent(e.receipt_path)}` : null, reimbursed: !!e.reimbursed_on, note: e.note, kind: e.kind }))
  const withReceipt = d.items.filter(e => e.receipt_path).length
  return (
    <div className="lg:max-w-[720px]">
      <Link href={`/sites/${id}`} className="no-print flex min-h-11 items-center text-sm text-[var(--muted)]">‹ Site</Link>
      <div className="display mt-1.5 text-[30px]">GC report</div>
      <div className="mt-1 text-[13px] text-[var(--muted)]">{[d.site.name, d.site.address, d.site.gc_company, period].filter(Boolean).join(' · ')}</div>

      <div className="reimb-panel mt-[18px] px-[22px] py-5">
        <div className="label text-[var(--reimb)]">Total to reimburse</div>
        <div className="num mt-2 text-[36px] text-[var(--reimb)]">{money(d.outstanding, true)}</div>
        <div className="mt-1.5 text-[13px] text-[var(--muted)]">{d.items.length} {d.items.length === 1 ? 'purchase' : 'purchases'} · {withReceipt} {withReceipt === 1 ? 'receipt' : 'receipts'} attached{d.total > d.outstanding ? ` · ${money(d.total - d.outstanding, true)} already paid back` : ''}</div>
      </div>

      <Period siteId={id} from={from} to={to} />
      <GcList items={items} />
      <GcActions siteId={id} from={from} to={to} siteName={d.site.name} outstandingIds={d.items.filter(e => !e.reimbursed_on).map(e => e.id)} />
      <ExportHistory siteId={id} items={sent} />
    </div>
  )
}
