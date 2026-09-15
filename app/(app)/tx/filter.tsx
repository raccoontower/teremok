'use client'
import { useRouter } from 'next/navigation'
import { money } from '@/lib/money'

type SiteRef = { id: string; name: string; total: number }

/** Два независимых фильтра: вид денег и объект.
 *
 *  Раньше они были свалены в один ряд — «All / Own / Reimb. / No site», — и
 *  выбрать объект было нельзя вовсе, а «без объекта» стояло рядом с видами
 *  денег, будто это такой же вид. Это разные вопросы: «чьи это деньги» и «за
 *  какую площадку», и задавать их надо порознь. */
export function TxFilters(
  { month, kind, site, sites, orphanCount }:
  { month: string; kind?: string; site?: string; sites: SiteRef[]; orphanCount: number },
) {
  const router = useRouter()
  const go = (k?: string, s?: string) => {
    const q = [`m=${month}`, k && `kind=${k}`, s && `site=${s}`].filter(Boolean).join('&')
    router.push(`/tx?${q}`)
  }
  const chip = (label: string, on: boolean, onClick: () => void, color?: string, sub?: string) => (
    <button key={label} onClick={onClick}
      className="mono min-h-[40px] shrink-0 whitespace-nowrap border px-3 text-[10px] uppercase tracking-[.14em]"
      style={{
        borderColor: on ? (color || 'var(--accent)') : 'rgba(255,255,255,.12)',
        color: on ? (color || 'var(--fg)') : 'var(--muted)',
        background: on ? 'rgba(255,255,255,.05)' : 'transparent',
      }}>
      {label}{sub ? <span className="ml-1.5 opacity-55">{sub}</span> : null}
    </button>
  )
  return (
    <div className="mt-3.5 flex flex-col gap-2">
      <div className="flex gap-2">
        {chip('All money', !kind, () => go(undefined, site))}
        {chip('Own', kind === 'own', () => go('own', site), 'var(--own)')}
        {chip('GC pays back', kind === 'reimbursable', () => go('reimbursable', site), 'var(--reimb)')}
      </div>
      {/* Горизонтальная прокрутка: площадок бывает десяток, в два ряда они
          съедают экран, а лента трат — главное на странице. */}
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-0.5 sm:mx-0 sm:px-0">
        {chip('All sites', !site, () => go(kind, undefined))}
        {orphanCount > 0 && chip('No site', site === 'none', () => go(kind, 'none'), 'var(--own)', String(orphanCount))}
        {sites.map(s => chip(s.name, site === s.id, () => go(kind, s.id), undefined, money(s.total)))}
      </div>
    </div>
  )
}
