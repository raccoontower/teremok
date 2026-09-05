'use client'
import { useRouter } from 'next/navigation'

export function KindFilter({ month, active }: { month: string; active?: string }) {
  const router = useRouter()
  const go = (k?: string) => router.push(`/tx?m=${month}${k ? `&kind=${k}` : ''}`)
  const item = (label: string, k?: string, color?: string) => (
    <button onClick={() => go(k)} className="mono min-h-[40px] flex-1 border text-[10px] uppercase tracking-[.14em]"
            style={{ borderColor: active === k ? (color || 'var(--accent)') : 'rgba(255,255,255,.12)', color: active === k ? (color || 'var(--fg)') : 'var(--muted)', background: active === k ? 'rgba(255,255,255,.05)' : 'transparent' }}>
      {label}
    </button>
  )
  return <div className="mt-3.5 flex gap-2">{item('All')}{item('Own', 'own', 'var(--own)')}{item('Reimbursable', 'reimbursable', 'var(--reimb)')}</div>
}
