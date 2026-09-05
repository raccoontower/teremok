'use client'
import { useEffect, useState } from 'react'

type Site = { id: string; name: string; status: string; gc_company: string | null }

/** Объекты — центр учёта: расход без объекта не привязать ни к вышке, ни к
 *  отчёту GC. Форма — три поля, чтобы завести объект прямо с площадки. */
export default function Sites() {
  const [sites, setSites] = useState<Site[]>([])
  const [name, setName] = useState(''); const [gc, setGc] = useState(''); const [addr, setAddr] = useState('')
  const load = () => fetch('/api/sites').then(r => r.json()).then(d => Array.isArray(d) && setSites(d))
  useEffect(() => { load() }, [])
  async function add(e: React.FormEvent) {
    e.preventDefault()
    await fetch('/api/sites', { method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, gc_company: gc, address: addr }) })
    setName(''); setGc(''); setAddr(''); load()
  }
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Объекты</h1>
      <form onSubmit={add} className="grid gap-2 rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-4 sm:grid-cols-4">
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Название / ID вышки" required
               className="rounded-xl border border-[var(--line)] bg-transparent px-3 py-2 sm:col-span-2" />
        <input value={gc} onChange={e => setGc(e.target.value)} placeholder="Управляющая компания"
               className="rounded-xl border border-[var(--line)] bg-transparent px-3 py-2" />
        <button className="rounded-xl bg-white px-4 py-2 font-medium text-black">Добавить</button>
        <input value={addr} onChange={e => setAddr(e.target.value)} placeholder="Адрес (необязательно)"
               className="rounded-xl border border-[var(--line)] bg-transparent px-3 py-2 sm:col-span-4" />
      </form>
      <ul className="divide-y divide-[var(--line)]">
        {sites.map(s => (
          <li key={s.id} className="flex items-center justify-between py-3">
            <div><div className="font-medium">{s.name}</div><div className="text-sm text-[var(--muted)]">{s.gc_company ?? '—'}</div></div>
            <span className="rounded-full border border-[var(--line)] px-3 py-1 text-xs text-[var(--muted)]">{s.status}</span>
          </li>
        ))}
        {sites.length === 0 && <li className="py-6 text-sm text-[var(--muted)]">Пока нет объектов — добавь первый.</li>}
      </ul>
    </div>
  )
}
