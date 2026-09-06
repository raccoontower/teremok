'use client'
import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { SiteNote } from '@/lib/queries'

const when = (iso: string) => {
  const d = new Date(iso)
  const day = d.toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  return `${day}, ${d.toLocaleString('en-US', { hour: 'numeric', minute: '2-digit' })}`
}

/** Журнал по объекту: как оставили, что докупить, где ключи. Пишется в одно
 *  поле без лишних экранов — иначе на площадке никто писать не станет. */
export function SiteNotes({ siteId, notes }: { siteId: string; notes: SiteNote[] }) {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [body, setBody] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [zoom, setZoom] = useState<string | null>(null)

  async function save() {
    if (!body.trim()) return
    setBusy(true); setErr(null)
    const fd = new FormData(); fd.append('body', body.trim()); if (file) fd.append('file', file)
    const r = await fetch(`/api/sites/${siteId}/notes`, { method: 'POST', body: fd })
    const j = await r.json().catch(() => ({ error: 'bad response' }))
    setBusy(false)
    if (j.error) return setErr(j.error)
    setBody(''); setFile(null); router.refresh()
  }
  async function remove(id: string) {
    if (!confirm('Delete this note?')) return
    await fetch(`/api/sites/${siteId}/notes?note=${id}`, { method: 'DELETE' })
    router.refresh()
  }

  return (
    <>
      <div className="tag mx-0.5 mb-2.5 mt-[26px]">Site log</div>
      <div className="panel p-3.5">
        <textarea value={body} onChange={e => setBody(e.target.value)} rows={2}
                  placeholder="How you left it — e.g. tools in the trailer, need 3 elbows Monday"
                  className="field resize-none py-3 text-[15px] leading-snug" style={{ minHeight: 68 }} />
        <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden"
               onChange={e => setFile(e.target.files?.[0] || null)} />
        <div className="mt-2.5 flex gap-2">
          <button onClick={() => fileRef.current?.click()} className="btn-ghost flex-1">
            {file ? 'Photo attached' : '+ Photo'}
          </button>
          <button onClick={save} disabled={busy || !body.trim()} className="btn w-[110px] flex-none">
            {busy ? '…' : 'Save note'}
          </button>
        </div>
        {err && <div className="mt-2 text-sm text-[var(--own)]">{err}</div>}
      </div>

      <div className="mt-2.5 flex flex-col gap-2">
        {notes.map(n => (
          <div key={n.id} className="row px-3.5 py-3">
            <div className="flex items-start gap-3">
              {n.photo_path && (
                <button onClick={() => setZoom(n.photo_path)} className="h-[56px] w-[46px] flex-none overflow-hidden p-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`/api/file?path=${encodeURIComponent(n.photo_path)}`} alt="" className="thumb h-full w-full" loading="lazy" />
                </button>
              )}
              <div className="min-w-0 flex-1">
                <div className="mono text-[10px] uppercase tracking-[.14em] text-[var(--muted)]">{when(n.created_at)}</div>
                <div className="mt-1 whitespace-pre-wrap text-[15px] leading-snug">{n.body}</div>
              </div>
              <button onClick={() => remove(n.id)} className="mono flex-none text-[10px] tracking-[.14em] text-[var(--dim)]">DEL</button>
            </div>
          </div>
        ))}
        {!notes.length && <div className="row px-4 py-4 text-sm text-[var(--muted)]">No notes yet. Write one before you leave the site.</div>}
      </div>

      {zoom && (
        <div className="fixed inset-0 z-50 flex flex-col bg-[rgba(4,6,9,.97)] p-[18px]" onClick={() => setZoom(null)}>
          <div className="flex justify-end"><button className="h-11 w-11 border border-white/12">✕</button></div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <div className="mt-3 min-h-0 flex-1 overflow-auto border border-white/10">
            <img src={`/api/file?path=${encodeURIComponent(zoom)}`} alt="" className="mx-auto max-w-full" />
          </div>
        </div>
      )}
    </>
  )
}
