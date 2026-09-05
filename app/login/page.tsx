'use client'
import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

function Form() {
  const [pw, setPw] = useState(''); const [err, setErr] = useState(false); const [busy, setBusy] = useState(false)
  const router = useRouter(); const next = useSearchParams().get('next') || '/'
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setErr(false)
    const r = await fetch('/api/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: pw }) })
    setBusy(false)
    if (r.ok) router.replace(next); else setErr(true)
  }
  return (
    <form onSubmit={submit} className="mx-auto mt-24 max-w-sm space-y-4">
      <h1 className="text-2xl font-semibold">Teremok</h1>
      <input type="password" value={pw} onChange={e => setPw(e.target.value)} placeholder="Пароль" autoFocus
             className="w-full rounded-xl border border-[var(--line)] bg-[var(--panel)] px-4 py-3" />
      {err && <p className="text-sm text-red-400">Неверный пароль</p>}
      <button disabled={busy} className="w-full rounded-xl bg-white py-3 font-medium text-black disabled:opacity-50">
        {busy ? '…' : 'Войти'}
      </button>
    </form>
  )
}
export default function Login() { return <Suspense><Form /></Suspense> }
