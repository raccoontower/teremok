'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const TABS = [
  { href: '/', label: 'Home' }, { href: '/sites', label: 'Sites' },
  { href: '/crew', label: 'Crew' }, { href: '/week', label: 'Week' },
]
const SIDE = [...TABS.slice(0, 3), { href: '/week', label: 'Schedule' }, { href: '/split', label: 'Partner split' }]

function CameraIcon({ size = 26 }: { size?: number }) {
  return (
    <span className="flex items-center justify-center rounded-full border-2 border-white/95" style={{ width: size, height: size }}>
      <span className="rounded-full bg-white" style={{ width: size * .27, height: size * .27 }} />
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
        <div className="serif px-2 pb-5 text-[26px]">Teremok</div>
        {SIDE.map(t => (
          <Link key={t.label} href={t.href} className="flex min-h-[42px] items-center rounded-[11px] px-3 text-sm"
                style={active(t.href) ? { background: 'rgba(255,255,255,.05)', color: 'var(--fg)' } : { color: 'var(--muted)' }}>{t.label}</Link>
        ))}
        <Link href="/add" className="btn mt-3 flex items-center justify-center gap-2.5 text-[15px]"><CameraIcon size={20} /> Add from receipt</Link>
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
          <Link href="/add" aria-label="Add from receipt"
                className="absolute bottom-[46px] left-1/2 z-40 flex h-[70px] w-[70px] -translate-x-1/2 items-center justify-center rounded-full border border-white/18 bg-[var(--accent)]"
                style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,.35)' }}><CameraIcon /></Link>
        </div>
      )}
    </div>
  )
}
function Tab({ href, label, on }: { href: string; label: string; on: boolean }) {
  return <Link href={href} className="label flex min-h-[52px] flex-1 items-center justify-center text-[11px]" style={{ color: on ? 'var(--fg)' : 'var(--dim)' }}>{label}</Link>
}
