'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sheet, SheetRow, STATUS, useAction } from '@/components/ui'
import { addDays, initials } from '@/lib/money'

type Day = { date: string; sites: { id: string; name: string; who: string[] }[]; assigned: { worker_id: string; site_id: string }[] }
type Props = { from: string; today: string; days: Day[]; sites: { id: string; name: string; status: string }[]; workers: { id: string; name: string }[] }

const fmt = (iso: string, o: Intl.DateTimeFormatOptions) => new Date(iso + 'T00:00:00Z').toLocaleString('en-US', { ...o, timeZone: 'UTC' })

/** Неделя: строка = день, тап — кто на каком объекте. Выбор объекта, потом
 *  людей; сохранение переписывает день для выбранных. */
export function Week({ from, today, days, sites, workers }: Props) {
  const router = useRouter()
  const [day, setDay] = useState<Day | null>(null)
  const [site, setSite] = useState<string>('')
  const [picked, setPicked] = useState<Set<string>>(new Set())
  // объект заводится прямо отсюда: без него день не назначить, а уходить на
  // другой экран и терять выбранный день — лишний шаг на площадке
  const [newSite, setNewSite] = useState('')
  const { run, busy, err } = useAction()
  const to = addDays(from, 6)

  function open(d: Day) {
    const first = d.sites[0]?.id || sites.find(s => s.status === 'active')?.id || sites[0]?.id || ''
    setDay(d); setSite(first); setPicked(new Set(d.assigned.filter(a => a.site_id === first).map(a => a.worker_id)))
  }
  function pickSite(id: string) { setSite(id); setPicked(new Set(day!.assigned.filter(a => a.site_id === id).map(a => a.worker_id))) }
  async function save() {
    if (!day) return
    if (await run('/api/schedule', { day: day.date, site_id: site || null, worker_ids: [...picked] })) setDay(null)
  }
  async function addSite() {
    const name = newSite.trim(); if (!name) return
    const created = await run('/api/sites', { name, status: 'active' })
    if (created?.id) { setSite(created.id); setNewSite(''); sites.push({ id: created.id, name, status: 'active' }) }
  }

  return (
    <div className="lg:max-w-[720px]">
      <div className="flex items-end justify-between">
        <div>
          <div className="display text-[30px]">Week</div>
          <div className="label mt-1">{fmt(from, { month: 'short', day: 'numeric' })} – {fmt(to, { month: 'short', day: 'numeric' })}</div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => router.push(`/week?d=${addDays(from, -7)}`)} className="h-11 w-11 rounded-none border border-white/9 text-[15px] text-[var(--muted)]">‹</button>
          <button onClick={() => router.push(`/week?d=${addDays(from, 7)}`)} className="h-11 w-11 rounded-none border border-white/9 text-[15px] text-[var(--muted)]">›</button>
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-2">
        {days.map(d => {
          const isToday = d.date === today; const empty = !d.sites.length
          const names = d.sites.flatMap(s => s.who)
          return (
            <button key={d.date} onClick={() => open(d)} className="flex min-h-[66px] w-full items-center gap-3.5 rounded-none border px-4 py-3 text-left"
                    style={{ borderColor: isToday ? 'rgba(42,115,232,.5)' : 'rgba(255,255,255,.06)', background: isToday ? 'rgba(42,115,232,.1)' : 'linear-gradient(180deg,rgba(255,255,255,.032),rgba(255,255,255,.008))' }}>
              <div className="w-[38px] flex-none">
                <div className="label-xs" style={{ fontSize: 11 }}>{fmt(d.date, { weekday: 'short' })}</div>
                <div className="mono mt-0.5 text-lg">{d.date.slice(8)}</div>
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium" style={{ color: empty ? 'var(--dim)' : 'var(--fg)' }}>{empty ? 'No crew' : d.sites.map(s => s.name).join(' + ')}</div>
                <div className="mt-0.5 truncate text-xs text-[var(--muted)]">{empty ? 'Day off' : names.join(', ')}</div>
              </div>
              <div className="flex">
                {names.map((n, i) => <div key={i} className="-ml-1.5 flex h-7 w-7 items-center justify-center rounded-none border border-white/14 bg-[var(--panel-2)] text-[10px] text-[var(--fg-2)]">{initials(n)}</div>)}
              </div>
            </button>
          )
        })}
      </div>

      {day && (
        <Sheet title={`Who is on site ${fmt(day.date, { weekday: 'long' })}`} onClose={() => setDay(null)}>
          <div className="flex gap-2">
            <input value={newSite} onChange={e => setNewSite(e.target.value)} placeholder="New site — e.g. AL-4471"
                   onKeyDown={e => { if (e.key === 'Enter') addSite() }} className="field flex-1" />
            <button onClick={addSite} disabled={busy || !newSite.trim()} className="btn w-[76px] flex-none">Add</button>
          </div>
          {sites.length === 0 && <div className="text-sm text-[var(--muted)]">No sites yet — add the first one above.</div>}
          <div className="flex flex-wrap gap-2">
            {sites.map(s => (
              <button key={s.id} onClick={() => pickSite(s.id)} className="min-h-10 rounded-none border px-3.5 text-sm"
                      style={{ borderColor: site === s.id ? 'rgba(42,115,232,.6)' : 'rgba(255,255,255,.1)', background: site === s.id ? 'rgba(42,115,232,.14)' : 'transparent', color: site === s.id ? 'var(--fg)' : 'var(--muted)' }}>{s.name}</button>
            ))}
          </div>
          <div className="label mt-3">Crew</div>
          {workers.map(w => {
            const elsewhere = day.assigned.find(a => a.worker_id === w.id && a.site_id !== site)
            const other = elsewhere ? sites.find(s => s.id === elsewhere.site_id)?.name : null
            return <SheetRow key={w.id} label={w.name} sub={other ? `on ${other} today` : undefined} dot={picked.has(w.id) ? STATUS.active.color : 'rgba(255,255,255,.14)'} active={picked.has(w.id)}
                             onClick={() => setPicked(p => { const n = new Set(p); if (n.has(w.id)) n.delete(w.id); else n.add(w.id); return n })} />
          })}
          {!workers.length && <div className="text-sm text-[var(--muted)]">Add workers in Crew first.</div>}
          {err && <div className="text-sm text-[var(--own)]">{err}</div>}
          <button onClick={save} disabled={busy || !site} className="btn mt-2">{picked.size ? `Save · ${picked.size} on site` : 'Save · nobody on site'}</button>
        </Sheet>
      )}
    </div>
  )
}
