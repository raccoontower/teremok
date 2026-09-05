'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const TABS = [
  { href: '/', label: 'Home', n: '01' }, { href: '/sites', label: 'Sites', n: '02' },
  { href: '/crew', label: 'Crew', n: '03' }, { href: '/week', label: 'Week', n: '04' },
]
const SIDE = [...TABS.slice(0, 3), { href: '/week', label: 'Schedule' }, { href: '/split', label: 'Partner split' }]

/** Плюс из отрезков — в макете нет круглых форм и иконочных шрифтов. */
function PlusIcon({ size = 24 }: { size?: number }) {
  return (
    <span className="relative block" style={{ width: size, height: size }}>
      <span className="absolute left-0 top-1/2 h-[2px] w-full -translate-y-1/2 bg-white" />
      <span className="absolute left-1/2 top-0 h-full w-[2px] -translate-x-1/2 bg-white" />
    </span>
  )
}

export function Shell({ children }: { children: React.ReactNode }) {
  const path = usePathname()
  const active = (h: string) => (h === '/' ? path === '/' : path.startsWith(h))
  const isAdd = path.startsWith('/add')
  return (
    <div className="relative mx-auto flex min-h-dvh max-w-[1240px] lg:gap-0">
      <div className="grain fixed inset-0 z-[9]" />

      {/* десктоп: сайдбар */}
      <aside className="no-print sticky top-0 hidden h-dvh w-[216px] flex-none flex-col gap-1.5 border-r border-white/7 px-[18px] py-[26px] lg:flex">
        <div className="tag mb-2 flex items-center gap-2 px-2"><span className="h-px w-[18px] bg-[var(--accent)]" />Ledger / 01</div>
        <div className="display px-2 pb-5 text-[30px] font-bold">Tere<span className="text-[var(--accent)]">m</span>ok</div>
        {SIDE.map(t => (
          <Link key={t.label} href={t.href} className="flex min-h-[42px] items-center rounded-[11px] px-3 text-sm"
                style={active(t.href) ? { background: 'rgba(255,255,255,.05)', color: 'var(--fg)' } : { color: 'var(--muted)' }}>{t.label}</Link>
        ))}
        <Link href="/add" className="btn mono mt-3 flex items-center justify-center gap-2.5 text-[11px] uppercase tracking-[.14em]"><PlusIcon size={16} /> Add expense</Link>
        <div className="mono label-xs mt-auto px-3 text-[var(--faint)]">{new Date().toLocaleString('en-US', { month: 'short', year: 'numeric' }).toUpperCase()}</div>
      </aside>

      <main className={`min-w-0 flex-1 px-[18px] pt-3 lg:px-[30px] lg:pt-[26px] ${isAdd ? 'pb-6' : 'pb-[132px] lg:pb-10'}`}>{children}</main>

      {/* телефон: нижний бар и камера */}
      {!isAdd && (
        <div className="no-print fixed inset-x-0 bottom-0 z-30 lg:hidden">
          <div className="mx-auto flex h-24 max-w-[600px] items-start px-3.5 pt-3.5" style={{ background: 'linear-gradient(180deg,rgba(7,9,13,0),rgba(7,9,13,.92) 42%,#07090d)' }}>
            {TABS.slice(0, 2).map(t => <Tab key={t.href} {...t} on={active(t.href)} />)}
            <div className="w-[82px] flex-none" />
            {TABS.slice(2).map(t => <Tab key={t.href} {...t} on={active(t.href)} />)}
          </div>
          <Link href="/add" aria-label="Add expense"
                className="absolute bottom-[44px] left-1/2 z-40 flex h-[74px] w-[74px] -translate-x-1/2 flex-col items-center justify-center gap-1.5 border border-white/28 bg-[var(--accent)]">
            <PlusIcon />
            <span className="mono text-[9px] tracking-[.14em] text-white">EXPENSE</span>
          </Link>
        </div>
      )}
    </div>
  )
}
function Tab({ href, label, n, on }: { href: string; label: string; n: string; on: boolean }) {
  return (
    <Link href={href} className="mono flex min-h-[52px] flex-1 items-center justify-center gap-1 text-[10px] uppercase tracking-[.14em]"
          style={{ color: on ? 'var(--fg)' : 'var(--dim)' }}>
      <span className="opacity-50">{n}</span>{label}
    </Link>
  )
}
