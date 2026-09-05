import { verifyShare } from '@/lib/share'
import { gcData } from '@/lib/queries'
import { db } from '@/lib/db'
import { money, shortDate } from '@/lib/money'
import { GcList } from '@/components/gc-list'

export const dynamic = 'force-dynamic'

/** Отчёт по ссылке для GC: без логина, без навигации, только один объект. */
export default async function Shared({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const p = await verifyShare(token)
  const d = p ? await gcData(p.site, p.from, p.to) : null
  if (!p || !d) return <div className="mx-auto max-w-[520px] px-6 py-24 text-center text-sm text-[var(--muted)]">This link has expired or is invalid.</div>
  const paths = d.items.map(e => e.receipt_path).filter((x): x is string => !!x)
  const signed = paths.length ? (await db().storage.from('receipts').createSignedUrls(paths, 3600)).data || [] : []
  const src = new Map(signed.map(s => [s.path, s.signedUrl]))
  const items = d.items.map(e => ({ id: e.id, vendor: e.vendor || e.category, date: e.spent_on, amount: e.amount, src: e.receipt_path ? src.get(e.receipt_path) || null : null, reimbursed: !!e.reimbursed_on, note: e.note }))
  const period = d.items.length ? `${shortDate(d.items.at(-1)!.spent_on)} – ${shortDate(d.items[0].spent_on)}` : ''
  return (
    <div className="mx-auto max-w-[720px] px-[18px] py-6">
      <div className="serif text-[30px]">Reimbursable purchases</div>
      <div className="mt-1 text-[13px] text-[var(--muted)]">{[d.site.name, d.site.address, period].filter(Boolean).join(' · ')}</div>
      <div className="reimb-panel mt-[18px] px-[22px] py-5">
        <div className="label text-[var(--reimb)]">Total</div>
        <div className="num mt-2 text-[36px] text-[var(--reimb)]">{money(d.total, true)}</div>
        <div className="mt-1.5 text-[13px] text-[var(--muted)]">{d.items.length} {d.items.length === 1 ? 'purchase' : 'purchases'} · tap a receipt to open it</div>
      </div>
      <GcList items={items} />
      <div className="mono label-xs mt-8 text-center text-[var(--faint)]">Prepared with Teremok · link valid 30 days</div>
    </div>
  )
}
