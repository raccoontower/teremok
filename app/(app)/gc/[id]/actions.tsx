'use client'
import { useState } from 'react'
import { Toast, useAction } from '@/components/ui'

/** Что делают кнопки:
 *  CSV   — файл для Excel, приложить к счёту;
 *  Text  — тот же отчёт простым текстом, сразу в буфер: чаще всего его
 *          просят вставить в письмо или мессенджер;
 *  PDF   — печать страницы, чеки видны картинками;
 *  Link  — подписанная ссылка на 30 дней, GC открывает чеки сам.
 */
export function GcActions({ siteId, from, to, siteName, outstandingIds }:
  { siteId: string; from?: string; to?: string; siteName: string; outstandingIds: string[] }) {
  const [toast, setToast] = useState<{ title: string; sub?: string } | null>(null)
  const { run, busy } = useAction()
  const show = (title: string, sub?: string) => { setToast({ title, sub }); setTimeout(() => setToast(null), 3400) }
  const url = (format: 'csv' | 'txt') =>
    `/api/export?type=gc&site=${siteId}&format=${format}` + (from ? `&from=${from}` : '') + (to ? `&to=${to}` : '')

  async function copyText() {
    const r = await fetch(url('txt'))
    const text = await r.text()
    try { await navigator.clipboard.writeText(text); show('Report copied', 'Paste it into an email or a message') }
    catch { window.open(url('txt'), '_blank'); show('Opened as a file') }
  }
  async function share() {
    const r = await fetch('/api/share', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ site: siteId, from, to }) })
    const j = await r.json(); if (!j.url) return show('Could not create link')
    try {
      if (navigator.share) await navigator.share({ title: `Reimbursable — ${siteName}`, url: j.url })
      else await navigator.clipboard.writeText(j.url)
      show('Link copied', 'Valid 30 days · receipts included')
    } catch { show('Link ready', j.url) }
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
        <button onClick={copyText} className="btn flex-1">Copy as text</button>
        <a href={url('csv')} className="btn-ghost flex w-[92px] flex-none items-center justify-center text-[15px]">CSV</a>
      </div>
      <div className="mt-2.5 flex gap-2.5">
        <button onClick={() => window.print()} className="btn-ghost flex-1">Export PDF</button>
        <button onClick={share} className="btn-ghost flex-1">Share link</button>
      </div>
      {outstandingIds.length > 0 && <button onClick={markPaid} disabled={busy} className="btn-reimb mt-2.5 w-full">GC paid this back</button>}
      {toast && <Toast {...toast} />}
    </div>
  )
}
