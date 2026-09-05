'use client'
import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

function Form() {
  const [pw, setPw] = useState(''); const [err, setErr] = useState(false); const [busy, setBusy] = useState(false)
  const router = useRouter(); const next = useSearchParams().get('next') || '/'
  async function submit(e: React.FormEvent) {
    e.preventDefault(); if (!pw) return
    setBusy(true); setErr(false)
    const r = await fetch('/api/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: pw }) })
    setBusy(false)
    if (r.ok) router.replace(next); else setErr(true)
  }
  return (
    <form onSubmit={submit} className="relative mx-auto flex min-h-dvh max-w-[420px] flex-col justify-center px-[34px]">
      <div className="grain fixed inset-0" />
      <div className="serif text-[52px] leading-none tracking-[-.01em]">Teremok</div>
      <div className="mt-3 text-sm text-[var(--muted)]">Private ledger. One user.</div>
      <div className="mt-[38px] flex gap-2.5">
        <input type="password" value={pw} onChange={e => setPw(e.target.value)} placeholder="Password" autoFocus autoComplete="current-password"
               className="field min-h-14 flex-1 rounded-2xl text-[17px] tracking-[.18em]" style={err ? { borderColor: 'rgba(242,177,52,.6)' } : undefined} />
        <button disabled={busy} aria-label="Sign in" className="btn h-14 w-14 flex-none rounded-2xl text-xl">→</button>
      </div>
      <div className="mono mt-4 h-4 text-[11px] tracking-[.04em]" style={{ color: err ? 'var(--own)' : 'var(--faint)' }}>{err ? 'WRONG PASSWORD' : busy ? 'CHECKING…' : ''}</div>
    </form>
  )
}
export default function Login() { return <Suspense><Form /></Suspense> }
