import { verifyShare } from '@/lib/share'
import { gcData, periodData } from '@/lib/queries'
import { db } from '@/lib/db'
import { money, shortDate } from '@/lib/money'
import { GcList } from '@/components/gc-list'

export const dynamic = 'force-dynamic'

/** Страница по ссылке: без логина, только чтение, живёт 30 дней.
 *  Два режима — отчёт по объекту для управляющей компании (только
 *  возмещаемое) и все расходы за период для партнёра. Чеки в обоих случаях
 *  показываются картинками: подписанные ссылки на приватный бакет. */
export default async function Shared({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const p = await verifyShare(token)
  if (!p) return <Expired />

  const gc = p.site && !p.all ? await gcData(p.site, p.from, p.to) : null
  const all = p.all ? await periodData(p.from, p.to) : null
  if (!gc && !all) return <Expired />

  const raw = gc ? gc.items : all!.items
  const paths = raw.map(e => e.receipt_path).filter((x): x is string => !!x)
  const signed = paths.length ? (await db().storage.from('receipts').createSignedUrls(paths, 3600)).data || [] : []
  const src = new Map(signed.map(s => [s.path, s.signedUrl]))

  const period = p.from || p.to
    ? `${p.from ? shortDate(p.from) : 'start'} – ${p.to ? shortDate(p.to) : 'today'}`
    : raw.length ? `${shortDate(raw.at(-1)!.spent_on)} – ${shortDate(raw[0].spent_on)}` : ''

  const items = raw.map(e => ({
    id: e.id,
    vendor: e.vendor || e.category,
    date: e.spent_on,
    amount: e.amount,
    src: e.receipt_path ? src.get(e.receipt_path) || null : null,
    reimbursed: !!e.reimbursed_on,
    note: e.note,
    kind: e.kind,
  }))
  const withPhoto = items.filter(i => i.src).length

  return (
    <div className="mx-auto max-w-[720px] px-[18px] py-6">
      <div className="tag flex items-center gap-2.5"><span className="h-px w-[26px] bg-[var(--accent)]" />Teremok / shared</div>
      <div className="display mt-3 text-[32px]">{gc ? 'Reimbursable purchases' : 'Expenses'}</div>
      <div className="mt-1 text-[13px] text-[var(--muted)]">
        {[gc?.site.name, gc?.site.address, period].filter(Boolean).join(' · ')}
      </div>

      {gc ? (
        <div className="reimb-panel mt-[18px] px-[18px] py-4">
          <div className="tag text-[var(--reimb)]">Total</div>
          <div className="num mt-2 text-[38px] leading-none text-[var(--reimb)]">{money(gc.total, true)}</div>
          <div className="mt-1.5 text-[13px] text-[var(--muted)]">{items.length} {items.length === 1 ? 'purchase' : 'purchases'} · {withPhoto} with a receipt photo</div>
        </div>
      ) : (
        <div className="panel mt-[18px]">
          <div className="panel-head"><div className="tag">Spent</div><div className="tag text-[var(--dim)]">{items.length} entries</div></div>
          <div className="grid grid-cols-2 gap-2.5 px-4 py-4">
            <div><div className="label-xs text-[var(--own)]">Own money</div><div className="num mt-1.5 text-[26px] text-[var(--own)]">−{money(all!.own, true)}</div></div>
            <div><div className="label-xs text-[var(--reimb)]">Reimbursable</div><div className="num mt-1.5 text-[26px] text-[var(--reimb)]">−{money(all!.reimb, true)}</div></div>
          </div>
        </div>
      )}

      <GcList items={items} />
      <div className="mono mt-8 text-center text-[10px] uppercase tracking-[.14em] text-[var(--faint)]">
        Prepared with Teremok · link valid 30 days · {withPhoto} of {items.length} have a photo
      </div>
    </div>
  )
}

function Expired() {
  return <div className="mx-auto max-w-[520px] px-6 py-24 text-center text-sm text-[var(--muted)]">This link has expired or is invalid.</div>
}
