import 'server-only'
import { db } from './db'
import { monthRange, today } from './money'

/**
 * Слой чтения. Все цифры считаются здесь, в одном месте, по одному правилу:
 *   прибыль = доход − своё − зарплаты; reimbursable в прибыли нет никогда.
 *
 * Зарплата «заработано» считается живьём из расписания и ставки работника
 * (payroll — только выплаты). Данных мало (4 человека, сотни строк), поэтому
 * проще тянуть всё и считать в TS, чем городить SQL под каждый срез.
 */
export type Site = { id: string; name: string; address: string | null; gc_company: string | null; status: string; starts_on: string | null; ends_on: string | null }
export type Worker = { id: string; name: string; default_pay: 'day_rate' | 'fixed_amount' | 'fixed_percent'; default_rate: number | null; active: boolean; is_partner: boolean }
export type Expense = { id: string; site_id: string | null; spent_on: string; amount: number; kind: 'reimbursable' | 'own'; category: string; vendor: string | null; receipt_path: string | null; reimbursed_on: string | null; note: string | null; paid_by: string | null }
type Sched = { worker_id: string; site_id: string; work_day: string }
type WageLine = { worker_id: string; site_id: string; month: string; days: number; amount: number }

const n = (v: unknown) => Number(v) || 0

async function loadAll() {
  const c = db()
  const [sites, workers, expenses, income, sched, payroll, payouts, partners] = await Promise.all([
    c.from('sites').select('*').order('created_at', { ascending: false }),
    c.from('workers').select('*').order('name'),
    c.from('expenses').select('id,site_id,spent_on,amount,kind,category,vendor,receipt_path,reimbursed_on,note,paid_by').order('spent_on', { ascending: false }).order('created_at', { ascending: false }),
    c.from('income').select('id,site_id,received_on,amount,note'),
    c.from('schedule').select('worker_id,site_id,work_day'),
    c.from('payroll').select('id,site_id,worker_id,amount,paid_on,note,paid_by'),
    c.from('partner_payouts').select('id,partner_id,site_id,paid_on,amount,note'),
    c.from('partners').select('id,name,share,is_owner').order('name'),
  ])
  for (const r of [sites, workers, expenses, income, sched, payroll, payouts, partners]) if (r.error) throw new Error(r.error.message)
  return {
    sites: (sites.data || []) as Site[],
    workers: ((workers.data || []) as Worker[]).map(w => ({ ...w, default_rate: w.default_rate == null ? null : n(w.default_rate) })),
    expenses: ((expenses.data || []) as Expense[]).map(e => ({ ...e, amount: n(e.amount) })),
    income: (income.data || []).map(i => ({ ...i, amount: n(i.amount) })) as { id: string; site_id: string; received_on: string; amount: number; note: string | null }[],
    sched: (sched.data || []) as Sched[],
    payroll: (payroll.data || []).map(p => ({ ...p, amount: n(p.amount) })) as { id: string; site_id: string | null; worker_id: string; amount: number; paid_on: string | null; note: string | null; paid_by: string | null }[],
    payouts: (payouts.data || []).map(p => ({ ...p, amount: n(p.amount) })) as { id: string; partner_id: string; site_id: string | null; paid_on: string; amount: number; note: string | null }[],
    partners: (partners.data || []).map(p => ({ ...p, share: n(p.share) })) as { id: string; name: string; share: number; is_owner: boolean }[],
  }
}
type All = Awaited<ReturnType<typeof loadAll>>

/** Строки «заработано»: дневной рейт — по (работник, объект, месяц);
 *  фикс и процент — одной строкой на (работник, объект), в месяце последнего
 *  дня на объекте. Так фикс не размазывается и не считается дважды. */
function wageLines(a: All): WageLine[] {
  const incomeBySite = new Map<string, number>()
  for (const i of a.income) incomeBySite.set(i.site_id, (incomeBySite.get(i.site_id) || 0) + i.amount)
  const byWorker = new Map(a.workers.map(w => [w.id, w]))
  const groups = new Map<string, Sched[]>()
  for (const s of a.sched) { const k = s.worker_id + '|' + s.site_id; groups.set(k, [...(groups.get(k) || []), s]) }
  const out: WageLine[] = []
  for (const [k, rows] of groups) {
    const [worker_id, site_id] = k.split('|')
    const w = byWorker.get(worker_id); if (!w) continue
    // партнёр получает долю в прибыли, а не зарплату — иначе счёт двойной
    if (w.is_partner) continue
    const rate = w.default_rate || 0
    if (w.default_pay === 'day_rate') {
      const months = new Map<string, number>()
      for (const r of rows) months.set(r.work_day.slice(0, 7), (months.get(r.work_day.slice(0, 7)) || 0) + 1)
      for (const [month, days] of months) out.push({ worker_id, site_id, month, days, amount: days * rate })
    } else {
      const last = rows.map(r => r.work_day).sort().at(-1)!
      const amount = w.default_pay === 'fixed_amount' ? rate : (incomeBySite.get(site_id) || 0) * rate / 100
      out.push({ worker_id, site_id, month: last.slice(0, 7), days: rows.length, amount })
    }
  }
  return out
}

export type SiteTotals = { income: number; own: number; wages: number; profit: number; reimb: number; reimbOut: number; receipts: number }
function totalsFor(a: All, lines: WageLine[], pick: (siteId: string | null, date: string) => boolean, wagePick: (l: WageLine) => boolean): SiteTotals {
  const t = { income: 0, own: 0, wages: 0, profit: 0, reimb: 0, reimbOut: 0, receipts: 0 }
  for (const i of a.income) if (pick(i.site_id, i.received_on)) t.income += i.amount
  for (const e of a.expenses) {
    if (!pick(e.site_id, e.spent_on)) continue
    if (e.kind === 'own') t.own += e.amount
    else { t.reimb += e.amount; if (!e.reimbursed_on) { t.reimbOut += e.amount; t.receipts++ } }
  }
  for (const l of lines) if (wagePick(l)) t.wages += l.amount
  t.profit = t.income - t.own - t.wages
  return t
}

export type Entry = { id: string; vendor: string; amount: number; kind: Expense['kind']; site: string; siteId: string | null; date: string; receipt: string | null; category: string }
function entriesOf(a: All, list: Expense[]): Entry[] {
  const name = new Map(a.sites.map(s => [s.id, s.name]))
  return list.map(e => ({ id: e.id, vendor: e.vendor || e.category, amount: e.amount, kind: e.kind, site: e.site_id ? name.get(e.site_id) || '—' : 'No site', siteId: e.site_id, date: e.spent_on, receipt: e.receipt_path, category: e.category }))
}

export async function homeData(month: string) {
  const a = await loadAll(); const lines = wageLines(a); const { from, to } = monthRange(month)
  const inMonth = (_: string | null, d: string) => d >= from && d < to
  const t = totalsFor(a, lines, inMonth, l => l.month === month)
  // «висит на GC» — всегда за всё время: чек августа не перестаёт быть долгом в сентябре
  const out = totalsFor(a, lines, () => true, () => false)
  const outSites = new Set(a.expenses.filter(e => e.kind === 'reimbursable' && !e.reimbursed_on).map(e => e.site_id)).size
  const active = a.sites.filter(s => s.status === 'active').length
  return { totals: t, reimbOut: out.reimbOut, receipts: out.receipts, outSites, active, entries: entriesOf(a, a.expenses.slice(0, 40)), count: a.expenses.length, sites: await sitesList(a, lines) }
}

export type SiteCard = Site & SiteTotals
async function sitesList(a: All, lines: WageLine[]): Promise<SiteCard[]> {
  return a.sites.map(s => ({ ...s, ...totalsFor(a, lines, id => id === s.id, l => l.site_id === s.id) }))
}
export async function sitesData() { const a = await loadAll(); return sitesList(a, wageLines(a)) }

export async function siteData(id: string) {
  const a = await loadAll(); const lines = wageLines(a)
  const site = a.sites.find(s => s.id === id); if (!site) return null
  const totals = totalsFor(a, lines, sid => sid === id, l => l.site_id === id)
  const crew = a.workers.map(w => {
    const mine = lines.filter(l => l.site_id === id && l.worker_id === w.id)
    return { id: w.id, name: w.name, days: mine.reduce((s, l) => s + l.days, 0), earned: mine.reduce((s, l) => s + l.amount, 0) }
  }).filter(c => c.days > 0)
  const income = a.income.filter(i => i.site_id === id).sort((x, y) => y.received_on.localeCompare(x.received_on))
  return { site, totals, crew, entries: entriesOf(a, a.expenses.filter(e => e.site_id === id)), income }
}

export async function crewData() {
  const a = await loadAll(); const lines = wageLines(a)
  const siteName = new Map(a.sites.map(s => [s.id, s.name]))
  const workers = a.workers.map(w => {
    const mine = lines.filter(l => l.worker_id === w.id)
    const earned = mine.reduce((s, l) => s + l.amount, 0)
    const paid = a.payroll.filter(p => p.worker_id === w.id).reduce((s, p) => s + p.amount, 0)
    const days = a.sched.filter(s => s.worker_id === w.id).length
    const sites = new Set(mine.map(l => l.site_id)).size
    return { ...w, earned, paid, owed: earned - paid, days, sites, payments: a.payroll.filter(p => p.worker_id === w.id).map(p => ({ ...p, site: p.site_id ? siteName.get(p.site_id) || '' : '' })).sort((x, y) => (y.paid_on || '').localeCompare(x.paid_on || '')) }
  })
  return { workers, sites: a.sites.filter(s => s.status !== 'paid' && s.status !== 'done'), owed: workers.filter(w => !w.is_partner).reduce((s, w) => s + Math.max(0, w.owed), 0) }
}

export async function weekData(from: string) {
  const a = await loadAll()
  const days = Array.from({ length: 7 }, (_, i) => new Date(new Date(from + 'T00:00:00Z').getTime() + i * 86400e3).toISOString().slice(0, 10))
  const siteName = new Map(a.sites.map(s => [s.id, s.name])); const wName = new Map(a.workers.map(w => [w.id, w.name]))
  return {
    days: days.map(d => {
      const rows = a.sched.filter(s => s.work_day === d)
      const bySite = new Map<string, string[]>()
      for (const r of rows) bySite.set(r.site_id, [...(bySite.get(r.site_id) || []), wName.get(r.worker_id) || '?'])
      return { date: d, sites: [...bySite].map(([id, who]) => ({ id, name: siteName.get(id) || '—', who })), assigned: rows.map(r => ({ worker_id: r.worker_id, site_id: r.site_id })) }
    }),
    sites: a.sites.filter(s => s.status === 'active' || s.status === 'planned').map(s => ({ id: s.id, name: s.name, status: s.status })),
    workers: a.workers.filter(w => w.active).map(w => ({ id: w.id, name: w.name })),
  }
}

export async function splitData(month: string) {
  const a = await loadAll(); const lines = wageLines(a); const { from, to } = monthRange(month)
  const t = totalsFor(a, lines, (_, d) => d >= from && d < to, l => l.month === month)
  const allTime = totalsFor(a, lines, () => true, () => true)
  const siteName = new Map(a.sites.map(s => [s.id, s.name]))

  /* Расчёт накопительный, а не помесячный: перевод в октябре закрывает
     сентябрьскую долю. Три слагаемых на человека:
       cut       — его доля прибыли,
     + fronted   — сколько он оплатил из своего кармана (свои расходы и
                   выплаты бригаде): это вложение в общее дело, и оно
                   возвращается ему до делёжа,
     − taken     — сколько уже получил переводами.
     Возмещаемое сюда не входит: его возвращает управляющая компания. */
  const partners = a.partners.map(p => {
    const mine = a.payouts.filter(x => x.partner_id === p.id)
    const takenMonth = mine.filter(x => x.paid_on >= from && x.paid_on < to).reduce((s, x) => s + x.amount, 0)
    const takenAll = mine.reduce((s, x) => s + x.amount, 0)
    const frontedExpenses = a.expenses.filter(e => e.kind === 'own' && e.paid_by === p.id).reduce((s, e) => s + e.amount, 0)
    const frontedWages = a.payroll.filter(x => x.paid_by === p.id).reduce((s, x) => s + x.amount, 0)
    const fronted = frontedExpenses + frontedWages
    const frontedMonth = a.expenses.filter(e => e.kind === 'own' && e.paid_by === p.id && e.spent_on >= from && e.spent_on < to).reduce((s, e) => s + e.amount, 0)
      + a.payroll.filter(x => x.paid_by === p.id && (x.paid_on || '') >= from && (x.paid_on || '') < to).reduce((s, x) => s + x.amount, 0)
    const cutAll = allTime.profit * p.share
    return {
      ...p,
      cut: t.profit * p.share, takenMonth, frontedMonth,
      cutAll, takenAll, fronted,
      balance: cutAll + fronted - takenAll,   // > 0 — человеку должны
    }
  })
  const payouts = a.payouts
    .map(x => ({ ...x, partner: a.partners.find(p => p.id === x.partner_id)?.name || '—', site: x.site_id ? siteName.get(x.site_id) || '' : '' }))
    .sort((x, y) => y.paid_on.localeCompare(x.paid_on))
  return { totals: t, allTime, partners, payouts, sites: a.sites.map(s => ({ id: s.id, name: s.name })) }
}

export async function gcData(siteId: string, from?: string, to?: string) {
  const a = await loadAll()
  const site = a.sites.find(s => s.id === siteId); if (!site) return null
  const items = a.expenses.filter(e => e.site_id === siteId && e.kind === 'reimbursable' && (!from || e.spent_on >= from) && (!to || e.spent_on <= to))
  return { site, items, total: items.reduce((s, e) => s + e.amount, 0), outstanding: items.filter(e => !e.reimbursed_on).reduce((s, e) => s + e.amount, 0) }
}

/** Объект по умолчанию для нового расхода: где сегодня больше всего людей,
 *  иначе — последний активный. Именно это «угадывание» экономит тап. */
export type ReportExport = { id: string; kind: string; format: string | null; period_from: string | null; period_to: string | null; total: number | null; item_count: number | null; created_at: string }
export async function exportsFor(siteId: string) {
  const { data } = await db().from('report_exports').select('*').eq('site_id', siteId).order('created_at', { ascending: false }).limit(20)
  return (data || []).map(r => ({ ...r, total: r.total == null ? null : Number(r.total) })) as ReportExport[]
}

export async function partnersList() {
  const { data } = await db().from('partners').select('id,name,is_owner').order('is_owner', { ascending: false })
  return (data || []) as { id: string; name: string; is_owner: boolean }[]
}

export async function guessSite() {
  const c = db()
  const [{ data: sched }, { data: sites }] = await Promise.all([
    c.from('schedule').select('site_id').eq('work_day', today()),
    c.from('sites').select('id,name,status').order('created_at', { ascending: false }),
  ])
  const counts = new Map<string, number>()
  for (const r of sched || []) counts.set(r.site_id, (counts.get(r.site_id) || 0) + 1)
  const top = [...counts].sort((x, y) => y[1] - x[1])[0]?.[0]
  const list = (sites || []) as { id: string; name: string; status: string }[]
  return { guess: top || list.find(s => s.status === 'active')?.id || list[0]?.id || null, fromSchedule: !!top, sites: list }
}
