'use client'
import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sheet, useAction } from '@/components/ui'
import { initials, today } from '@/lib/money'

type Props = {
  siteId: string
  workers: { id: string; name: string }[]
  recent: { work_day: string; worker_id: string; site_id: string | null }[]
  siteNames: Record<string, string>
}

/** Добавить человека прямо со страницы объекта.
 *
 *  Раньше это делалось только через «Неделю»: уйти с объекта, найти день,
 *  снова выбрать объект, отметить людей. Три лишних шага ровно в тот момент,
 *  когда человек стоит на площадке и хочет записать, кто сегодня работал.
 *
 *  Пишем в тот же `/api/schedule`, что и «Неделя», и с той же семантикой:
 *  запрос ПЕРЕПИСЫВАЕТ состав объекта за день целиком. Поэтому в список
 *  всегда подставляются уже назначенные — иначе сохранение одного человека
 *  стёрло бы остальных.
 */
export function AddWorkDay({ siteId, workers, recent, siteNames }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [day, setDay] = useState(today())
  const [picked, setPicked] = useState<Set<string>>(new Set())
  const { run, busy, err } = useAction()

  // Кто уже стоит на этом объекте в этот день, и кто в этот день занят на
  // другом: человек в день работает на одном объекте, и об этом надо
  // предупредить до сохранения, а не после.
  const onThis = useMemo(
    () => new Set(recent.filter(r => r.work_day === day && r.site_id === siteId).map(r => r.worker_id)),
    [recent, day, siteId],
  )
  const elsewhere = useMemo(() => {
    const m: Record<string, string> = {}
    for (const r of recent) {
      if (r.work_day === day && r.site_id && r.site_id !== siteId) m[r.worker_id] = siteNames[r.site_id] || 'another site'
    }
    return m
  }, [recent, day, siteId, siteNames])

  function start() {
    setPicked(new Set(onThis))
    setOpen(true)
  }
  function setDate(d: string) {
    setDay(d)
    setPicked(new Set(recent.filter(r => r.work_day === d && r.site_id === siteId).map(r => r.worker_id)))
  }
  function toggle(id: string) {
    setPicked(p => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n })
  }
  async function save() {
    if (await run('/api/schedule', { day, site_id: siteId, worker_ids: [...picked] })) {
      setOpen(false)
      router.refresh()
    }
  }

  return (
    <>
      <button onClick={start} className="btn-ghost mt-2 w-full">+ Add a work day</button>

      {open && (
        <Sheet title="Who worked here" onClose={() => setOpen(false)}>
          <input
            type="date"
            value={day}
            onChange={e => setDate(e.target.value)}
            className="h-12 w-full border border-white/10 bg-white/[.03] px-3.5 text-[15px] text-[var(--fg)]"
          />

          {!workers.length && (
            <div className="row px-4 py-4 text-sm text-[var(--muted)]">No crew yet — add people in Crew first.</div>
          )}

          {workers.map(w => {
            const on = picked.has(w.id)
            const moved = elsewhere[w.id]
            return (
              <button
                key={w.id}
                onClick={() => toggle(w.id)}
                className="flex min-h-14 w-full items-center gap-3 border px-4 text-left text-[15px]"
                style={{
                  borderColor: on ? 'rgba(42,115,232,.5)' : 'rgba(255,255,255,.08)',
                  background: on ? 'rgba(42,115,232,.12)' : 'rgba(255,255,255,.03)',
                }}
              >
                <span className="flex h-[30px] w-[30px] flex-none items-center justify-center border border-white/12 text-xs text-[var(--fg-2)]">
                  {initials(w.name)}
                </span>
                <span className="min-w-0 flex-1">
                  {w.name}
                  {moved && !on && <span className="mt-0.5 block text-xs text-[var(--muted)]">today on {moved}</span>}
                  {moved && on && <span className="mt-0.5 block text-xs text-[var(--own)]">moves from {moved}</span>}
                </span>
                {on && <span className="text-[13px] text-[var(--accent-2)]">on site</span>}
              </button>
            )
          })}

          {err && <div className="text-sm text-[var(--own)]">{err}</div>}
          <button onClick={save} disabled={busy} className="btn-accent mt-1 w-full">
            {busy ? 'Saving…' : 'Save the day'}
          </button>
        </Sheet>
      )}
    </>
  )
}
