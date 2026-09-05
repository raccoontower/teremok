'use client'
import { useEffect, useState, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'

/** Нижний лист с выбором. Полностью закрывает экран затемнением; закрыть —
 *  тап по фону. Один компонент для всех выборов: объект, работник, статус. */
export function Sheet({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return (
    <div className="fixed inset-0 z-40 flex flex-col justify-end lg:items-center lg:justify-center">
      <button onClick={onClose} aria-label="close" className="absolute inset-0 border-0 bg-[rgba(4,6,9,.72)]" />
      <div className="rise relative max-h-[86dvh] overflow-y-auto rounded-none border-t border-white/12 bg-[var(--panel)] px-[18px] pb-8 pt-3 lg:w-[440px] lg:rounded-[26px] lg:border">
        <div className="mx-auto mb-4 h-1 w-11 rounded-none bg-white/16 lg:hidden" />
        <div className="label mb-3">{title}</div>
        <div className="flex flex-col gap-2">{children}</div>
      </div>
    </div>
  )
}

export function SheetRow({ label, sub, dot, active, onClick }: { label: string; sub?: string; dot?: string; active?: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex min-h-14 w-full items-center gap-3 rounded-[14px] border px-4 text-left text-[15px]"
            style={{ borderColor: active ? 'rgba(42,115,232,.5)' : 'rgba(255,255,255,.08)', background: active ? 'rgba(42,115,232,.12)' : 'rgba(255,255,255,.03)' }}>
      {dot && <span className="h-2 w-2 flex-none rounded-none" style={{ background: dot }} />}
      <span className="min-w-0 flex-1">{label}{sub && <span className="mt-0.5 block text-xs text-[var(--muted)]">{sub}</span>}</span>
    </button>
  )
}

/** Подтверждение внизу экрана: зелёная рамка, 3.4 с, само уходит. */
export function Toast({ title, sub, tone = 'reimb' }: { title: string; sub?: string; tone?: 'reimb' | 'own' | 'accent' }) {
  const color = tone === 'own' ? 'var(--own)' : tone === 'accent' ? 'var(--accent-2)' : 'var(--reimb)'
  return (
    <div className="rise fixed inset-x-4 bottom-[130px] z-50 flex items-center gap-3 rounded-[18px] border px-[18px] py-4 lg:inset-x-auto lg:bottom-8 lg:right-8 lg:w-[380px]"
         style={{ borderColor: color, background: 'rgba(12,16,20,.97)' }}>
      <span className="h-2.5 w-2.5 flex-none rounded-none" style={{ background: color }} />
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium" style={{ color }}>{title}</div>
        {sub && <div className="mt-0.5 text-xs text-[var(--muted)]">{sub}</div>}
      </div>
    </div>
  )
}

/** Тост после сохранения: /add кладёт сообщение в sessionStorage и уходит
 *  на главную, главная его показывает один раз. */
export function FlashToast() {
  const [t, setT] = useState<{ title: string; sub?: string; tone?: 'reimb' | 'own' | 'accent' } | null>(null)
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('tk_flash'); if (!raw) return
      sessionStorage.removeItem('tk_flash'); setT(JSON.parse(raw))
      const id = setTimeout(() => setT(null), 3400); return () => clearTimeout(id)
    } catch { /* приватный режим и т.п. — просто без тоста */ }
  }, [])
  return t ? <Toast {...t} /> : null
}
export function flash(t: { title: string; sub?: string; tone?: 'reimb' | 'own' | 'accent' }) {
  try { sessionStorage.setItem('tk_flash', JSON.stringify(t)) } catch { /* ignore */ }
}

/** Просмотр чека на весь экран. Файл отдаёт наш /api/file (за логином). */
export function ReceiptViewer({ path, title, sub, onClose }: { path: string; title: string; sub: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[rgba(4,6,9,.97)] p-[18px]">
      <div className="flex items-center justify-between">
        <div><div className="text-[15px] font-medium">{title}</div><div className="mt-0.5 text-xs text-[var(--muted)]">{sub}</div></div>
        <button onClick={onClose} className="h-11 w-11 rounded-none border border-white/12 text-base">✕</button>
      </div>
      <div className="mt-[18px] min-h-0 flex-1 overflow-auto rounded-none border border-white/10 bg-[#0b0e13]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`/api/file?path=${encodeURIComponent(path)}`} alt={title} className="mx-auto max-h-full w-auto max-w-full" />
      </div>
    </div>
  )
}

export function Thumb({ path, onClick, size = 'sm', tone }: { path: string | null; onClick?: () => void; size?: 'sm' | 'md'; tone?: 'reimb' }) {
  const cls = size === 'md' ? 'h-[94px] w-[74px]' : 'h-[42px] w-[34px]'
  const border = tone === 'reimb' ? 'rgba(52,209,125,.3)' : undefined
  if (!path) return <div className={`thumb ${cls} flex-none opacity-40`} style={{ borderColor: border }} />
  return (
    <button onClick={onClick} className={`${cls} flex-none overflow-hidden p-0`} aria-label="receipt">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={`/api/file?path=${encodeURIComponent(path)}`} alt="" className={`thumb h-full w-full`} style={{ borderColor: border }} loading="lazy" />
    </button>
  )
}

export function StatusPill({ status, size = 'sm' }: { status: string; size?: 'sm' | 'md' }) {
  const c = STATUS[status] || STATUS.planned
  return <span className={`label-xs rounded-none border ${size === 'md' ? 'px-2.5 py-1.5' : 'px-2 py-1'}`} style={{ color: c.color, borderColor: c.border }}>{status}</span>
}
export const STATUS: Record<string, { color: string; border: string }> = {
  planned: { color: '#8a93a3', border: 'rgba(255,255,255,.14)' },
  active: { color: '#2a73e8', border: 'rgba(42,115,232,.45)' },
  done: { color: '#8a93a3', border: 'rgba(255,255,255,.14)' },
  invoiced: { color: '#f2b134', border: 'rgba(242,177,52,.4)' },
  paid: { color: '#34d17d', border: 'rgba(52,209,125,.4)' },
}

/** Переключатель месяца в заголовке: серифный месяц, стрелки по 44px. */
export function MonthNav({ month, base }: { month: string; base: string }) {
  const router = useRouter()
  const go = (by: number) => { const [y, m] = month.split('-').map(Number); const d = new Date(Date.UTC(y, m - 1 + by, 1)); router.push(`${base}?m=${d.toISOString().slice(0, 7)}`) }
  return (
    <div className="flex gap-2">
      <button onClick={() => go(-1)} className="h-11 w-11 rounded-none border border-white/9 text-[15px] text-[var(--muted)]">‹</button>
      <button onClick={() => go(1)} className="h-11 w-11 rounded-none border border-white/9 text-[15px] text-[var(--muted)]">›</button>
    </div>
  )
}

/** Кнопка с запросом к API и перезагрузкой серверных данных после. */
export function useAction() {
  const router = useRouter(); const [busy, setBusy] = useState(false); const [err, setErr] = useState<string | null>(null)
  async function run(url: string, body: unknown, method = 'POST') {
    setBusy(true); setErr(null)
    const r = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    const j = await r.json().catch(() => ({}))
    setBusy(false)
    if (!r.ok) { setErr(j.error || r.statusText); return null }
    router.refresh(); return j
  }
  return { run, busy, err }
}
