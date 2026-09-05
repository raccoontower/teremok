'use client'
import { useState } from 'react'
import { Toast, useAction } from '@/components/ui'

/** PDF — это печать страницы (стили print уже есть); ссылка — подписанный
 *  URL на 30 дней без логина, чтобы GC открыл чеки сам. */
export function GcActions({ siteId, from, to, outstandingIds }: { siteId: string; from?: string; to?: string; outstandingIds: string[] }) {
  const [toast, setToast] = useState<{ title: string; sub?: string } | null>(null)
  const { run, busy } = useAction()
  const show = (title: string, sub?: string) => { setToast({ title, sub }); setTimeout(() => setToast(null), 3400) }
  async function share() {
    const r = await fetch('/api/share', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ site: siteId, from, to }) })
    const j = await r.json(); if (!j.url) return show('Could not create link')
    try { if (navigator.share) await navigator.share({ title: 'GC report', url: j.url }); else { await navigator.clipboard.writeText(j.url) } show('Link copied', 'Valid 30 days · receipts included') } catch { show('Link ready', j.url) }
  }
  async function markPaid() {
    if (!outstandingIds.length || !confirm(`Mark ${outstandingIds.length} purchases as paid back by the GC?`)) return
    const today = new Date().toISOString().slice(0, 10)
    for (const id of outstandingIds) await run(`/api/expenses/${id}`, { reimbursed_on: today }, 'PATCH')
    show('Marked as paid back', 'Removed from outstanding')
  }
  return (
    <div className="no-print mt-[18px]">
      <div className="flex gap-2.5">
        <button onClick={() => window.print()} className="btn flex-1">Export PDF</button>
        <button onClick={share} className="btn-ghost w-[120px] flex-none text-[15px]">Share link</button>
      </div>
      {outstandingIds.length > 0 && <button onClick={markPaid} disabled={busy} className="btn-reimb mt-2.5 w-full">GC paid this back</button>}
      {toast && <Toast {...toast} />}
    </div>
  )
}
