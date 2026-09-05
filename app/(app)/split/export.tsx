'use client'
import { useState } from 'react'
import { Toast } from '@/components/ui'

/** Та же выгрузка, что у отчёта GC, но по делёжу — партнёру обычно нужен
 *  текст в мессенджер, а не файл. */
export function SplitExport({ month }: { month: string }) {
  const [toast, setToast] = useState<{ title: string; sub?: string } | null>(null)
  const show = (title: string, sub?: string) => { setToast({ title, sub }); setTimeout(() => setToast(null), 3400) }
  const url = (format: 'csv' | 'txt') => `/api/export?type=partner&m=${month}&format=${format}`
  async function copyText() {
    const text = await (await fetch(url('txt'))).text()
    try { await navigator.clipboard.writeText(text); show('Split copied', 'Paste it to your partner') }
    catch { window.open(url('txt'), '_blank'); show('Opened as a file') }
  }
  return (
    <div className="no-print mt-3 flex gap-2.5">
      <button onClick={copyText} className="btn-ghost flex-1">Copy as text</button>
      <a href={url('csv')} className="btn-ghost flex w-[92px] flex-none items-center justify-center">CSV</a>
      {toast && <Toast {...toast} tone="accent" />}
    </div>
  )
}
