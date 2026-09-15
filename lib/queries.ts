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
export type Site = { id: string; name: string; address: string | null; gc_company: string | null; status: string; starts_on: string | null; ends_on: string | null; contract_amount: number | null }
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
    c.from('income').select('id,site_id,received_on,amount,note,source,received_by'),
    c.from('schedule').select('worker_id,site_id,work_day'),
    c.from('payroll').select('id,site_id,worker_id,amount,paid_on,note,paid_by'),
    c.from('partner_payouts').select('id,partner_id,site_id,paid_on,amount,note,paid_by'),
    c.from('partners').select('id,name,share,is_owner').order('name'),
  ])
  for (const r of [sites, workers, expenses, income, sched, payroll, payouts, partners]) if (r.error) throw new Error(r.error.message)
  return {
    sites: ((sites.data || []) as Site[]).map(s => ({ ...s, contract_amount: s.contract_amount == null ? null : n(s.contract_amount) })),
    workers: ((workers.data || []) as Worker[]).map(w => ({ ...w, default_rate: w.default_rate == null ? null : n(w.default_rate) })),
    expenses: ((expenses.data || []) as Expense[]).map(e => ({ ...e, amount: n(e.amount) })),
    income: (income.data || []).map(i => ({ ...i, amount: n(i.amount) })) as { id: string; site_id: string | null; received_on: string; amount: number; note: string | null; source: string | null; received_by?: string | null }[],
    sched: (sched.data || []) as Sched[],
    payroll: (payroll.data || []).map(p => ({ ...p, amount: n(p.amount) })) as { id: string; site_id: string | null; worker_id: string; amount: number; paid_on: string | null; note: string | null; paid_by: string | null }[],
    payouts: (payouts.data || []).map(p => ({ ...p, amount: n(p.amount) })) as { id: string; partner_id: string; site_id: string | null; paid_on: string; amount: number; note: string | null; paid_by?: string | null }[],
    partners: (partners.data || []).map(p => ({ ...p, share: n(p.share) })) as { id: string; name: string; share: number; is_owner: boolean }[],
  }
}
type All = Awaited<ReturnType<typeof loadAll>>

/** Строки «заработано»: дневной рейт — по (работник, объект, месяц);
 *  фикс и процент — одной строкой на (работник, объект), в месяце последнего
 *  дня на объекте. Так фикс не размазывается и не считается дважды. */
function wageLines(a: All): WageLine[] {
  const incomeBySite = new Map<string, number>()
  // доход без объекта в долю процентщика не идёт: это деньги не с этой стройки
  for (const i of a.income) if (i.site_id) incomeBySite.set(i.site_id, (incomeBySite.get(i.site_id) || 0) + i.amount)
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
/** Долг управляющей компании: за работу (контракт минус полученное) и за
 *  материалы (невозмещённые чеки). Считаются раздельно — закрываются тоже. */
export type GcBalance = { contract: number | null; paidWork: number; workOwed: number; materialsOwed: number; owed: number }
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

export type Entry = { id: string; vendor: string; amount: number; kind: Expense['kind']; site: string; siteId: string | null; date: string; receipt: string | null; category: string; note: string | null }
function entriesOf(a: All, list: Expense[]): Entry[] {
  const name = new Map(a.sites.map(s => [s.id, s.name]))
  return list.map(e => ({ id: e.id, vendor: e.vendor || e.category, amount: e.amount, kind: e.kind, site: e.site_id ? name.get(e.site_id) || '—' : 'No site', siteId: e.site_id, date: e.spent_on, receipt: e.receipt_path, category: e.category, note: e.note }))
}

export async function homeData(month: string) {
  const a = await loadAll(); const lines = wageLines(a); const { from, to } = monthRange(month)
  const inMonth = (_: string | null, d: string) => d >= from && d < to
  const t = totalsFor(a, lines, inMonth, l => l.month === month)
  // «висит на GC» — всегда за всё время: чек августа не перестаёт быть долгом в сентябре
  const out = totalsFor(a, lines, () => true, () => false)
  const outSites = new Set(a.expenses.filter(e => e.kind === 'reimbursable' && !e.reimbursed_on).map(e => e.site_id)).size
  const cards = await sitesList(a, lines)
  const workOwed = cards.reduce((s, c) => s + c.gc.workOwed, 0)
  const contracted = cards.reduce((s, c) => s + (c.contract_amount || 0), 0)
  const active = a.sites.filter(s => s.status === 'active').length
  // Приход без объекта не виден ни на одной карточке стройки — он влияет на
  // прибыль месяца и обязан быть показан отдельной строкой, иначе цифра
  // меняется без объяснения.
  const otherIncome = a.income
    .filter(i => !i.site_id && i.received_on >= from && i.received_on < to)
    .sort((x, y) => (x.received_on < y.received_on ? 1 : -1))
    .map(i => ({ id: i.id, amount: i.amount, received_on: i.received_on, source: i.source, note: i.note, received_by: i.received_by ?? null }))
  // Партнёры нужны форме прихода: на чей счёт легли деньги решает делёж.
  const partners = a.partners.map(p => ({ id: p.id, name: p.name }))
  return { totals: t, reimbOut: out.reimbOut, receipts: out.receipts, outSites, active, workOwed, contracted, entries: entriesOf(a, a.expenses.slice(0, 40)), count: a.expenses.length, sites: cards, otherIncome, partners }
}

export type SiteCard = Site & SiteTotals & { gc: GcBalance; lastNote: { body: string; created_at: string } | null }
function gcBalance(site: Site, t: SiteTotals): GcBalance {
  const contract = site.contract_amount
  const workOwed = contract == null ? 0 : Math.max(0, contract - t.income)
  return { contract, paidWork: t.income, workOwed, materialsOwed: t.reimbOut, owed: workOwed + t.reimbOut }
}

async function sitesList(a: All, lines: WageLine[]): Promise<SiteCard[]> {
  const { data: lastNotes } = await db().from('site_notes').select('site_id,body,created_at').order('created_at', { ascending: false }).limit(200)
  const note = new Map<string, { body: string; created_at: string }>()
  for (const n of (lastNotes || []) as { site_id: string; body: string; created_at: string }[]) if (!note.has(n.site_id)) note.set(n.site_id, n)
  return a.sites.map(s => {
    const t = totalsFor(a, lines, id => id === s.id, l => l.site_id === s.id)
    return { ...s, ...t, gc: gcBalance(s, t), lastNote: note.get(s.id) || null }
  })
}
/** Все транзакции месяца с итогами — экран истории. */
/**
 * Лента трат за месяц с двумя независимыми фильтрами: вид денег и объект.
 *
 * Итоги считаются дважды — по выбранному объекту и по всем сразу. Раньше
 * сверху стояли три числа одного размера: «своё», «возмещаемое» и «без
 * объекта». Первые два — разрез по виду денег, третье — по объектам, и сложить
 * их нельзя, хотя вид подсказывает обратное. Теперь наверху всегда одна
 * тройка, которая сходится: своё + возмещаемое = всего, — а когда выбран
 * объект, рядом видно, какая это часть от общего.
 */
export async function txData(month: string, filter?: 'own' | 'reimbursable', siteId?: string) {
  const a = await loadAll(); const { from, to } = monthRange(month)
  const inMonth = a.expenses.filter(e => e.spent_on >= from && e.spent_on < to)
  // 'none' — траты, не привязанные ни к одному объекту: в прибыль объекта они
  // не попадают и теряются тише всего, поэтому у них свой пункт фильтра.
  const bySite = siteId === 'none' ? inMonth.filter(e => !e.site_id)
    : siteId ? inMonth.filter(e => e.site_id === siteId) : inMonth
  const list = filter ? bySite.filter(e => e.kind === filter) : bySite
  const sum = (rows: Expense[], kind?: 'own' | 'reimbursable') =>
    rows.filter(e => !kind || e.kind === kind).reduce((s, e) => s + e.amount, 0)
  const orphans = inMonth.filter(e => !e.site_id)
  return {
    entries: entriesOf(a, list),
    own: sum(bySite, 'own'),
    reimb: sum(bySite, 'reimbursable'),
    total: sum(bySite),
    allOwn: sum(inMonth, 'own'),
    allReimb: sum(inMonth, 'reimbursable'),
    allTotal: sum(inMonth),
    orphanCount: orphans.length,
    orphanTotal: sum(orphans),
    // Только объекты, по которым в этом месяце что-то есть: список всех
    // площадок за всю историю в фильтре бесполезен и не помещается.
    sites: a.sites
      .map(s => ({ id: s.id, name: s.name, total: sum(inMonth.filter(e => e.site_id === s.id)) }))
      .filter(s => s.total > 0)
      .sort((x, y) => y.total - x.total),
  }
}

export async function sitesData() { const a = await loadAll(); return sitesList(a, wageLines(a)) }

export type SiteNote = { id: string; body: string; photo_path: string | null; created_at: string }

export async function siteData(id: string) {
  const a = await loadAll(); const lines = wageLines(a)
  const site = a.sites.find(s => s.id === id); if (!site) return null
  const totals = totalsFor(a, lines, sid => sid === id, l => l.site_id === id)
  const gc = gcBalance(site, totals)
  const crew = a.workers.map(w => {
    const mine = lines.filter(l => l.site_id === id && l.worker_id === w.id)
    return { id: w.id, name: w.name, days: mine.reduce((s, l) => s + l.days, 0), earned: mine.reduce((s, l) => s + l.amount, 0) }
  }).filter(c => c.days > 0)
  const income = a.income.filter(i => i.site_id === id).sort((x, y) => y.received_on.localeCompare(x.received_on))
  const { data: notesData } = await db().from('site_notes').select('id,body,photo_path,created_at').eq('site_id', id).order('created_at', { ascending: false })
  const notes = (notesData || []) as SiteNote[]
  return { site, totals, gc, notes, crew, entries: entriesOf(a, a.expenses.filter(e => e.site_id === id)), income }
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
     − taken     — сколько уже получил переводами,
     − collected — сколько прихода легло лично ему на счёт.

     Возмещаемое сюда не входит: его возвращает управляющая компания.

     `collected` появился 15 сентября. До него приход считался лежащим «у
     фирмы», которой как кошелька не существует, и расчёт переставал сходиться:
     одному должны $3 242, другой должен $3 042, разница ровно «приход минус
     выплата». Деньги, пришедшие человеку на карту, — такой же его личный
     баланс, как и потраченные с неё. */
  const partners = a.partners.map(p => {
    const mine = a.payouts.filter(x => x.partner_id === p.id)
    const takenMonth = mine.filter(x => x.paid_on >= from && x.paid_on < to).reduce((s, x) => s + x.amount, 0)
    const takenAll = mine.reduce((s, x) => s + x.amount, 0)
    const frontedExpenses = a.expenses.filter(e => e.kind === 'own' && e.paid_by === p.id).reduce((s, e) => s + e.amount, 0)
    const frontedWages = a.payroll.filter(x => x.paid_by === p.id).reduce((s, x) => s + x.amount, 0)
    // Выплата партнёру — это перемещение денег между двумя людьми. У
    // получателя она учтена как taken; плательщику её надо зачесть, иначе его
    // вклад занижен ровно на эту сумму и расчёт не сходится (миграция 0010).
    const frontedPayouts = a.payouts.filter(x => x.paid_by === p.id).reduce((s, x) => s + x.amount, 0)
    const fronted = frontedExpenses + frontedWages + frontedPayouts
    const frontedMonth = a.expenses.filter(e => e.kind === 'own' && e.paid_by === p.id && e.spent_on >= from && e.spent_on < to).reduce((s, e) => s + e.amount, 0)
      + a.payroll.filter(x => x.paid_by === p.id && (x.paid_on || '') >= from && (x.paid_on || '') < to).reduce((s, x) => s + x.amount, 0)
      + a.payouts.filter(x => x.paid_by === p.id && x.paid_on >= from && x.paid_on < to).reduce((s, x) => s + x.amount, 0)
    const collected = a.income.filter(i => i.received_by === p.id).reduce((s, i) => s + i.amount, 0)
    const collectedMonth = a.income.filter(i => i.received_by === p.id && i.received_on >= from && i.received_on < to).reduce((s, i) => s + i.amount, 0)
    const cutAll = allTime.profit * p.share
    return {
      ...p,
      cut: t.profit * p.share, takenMonth, frontedMonth, collectedMonth,
      cutAll, takenAll, fronted, collected,
      balance: cutAll + fronted - takenAll - collected,   // > 0 — человеку должны
    }
  })
  const payouts = a.payouts
    .map(x => ({ ...x, partner: a.partners.find(p => p.id === x.partner_id)?.name || '—', site: x.site_id ? siteName.get(x.site_id) || '' : '' }))
    .sort((x, y) => y.paid_on.localeCompare(x.paid_on))

  /* Чем расчёт станет, когда управляющая компания расплатится за работу.
   *
   * Сегодняшняя цифра честная, но она отвечает на вопрос «кто кому должен
   * прямо сейчас», а владелец переводит партнёру в конце месяца и думает
   * наперёд: «GC заплатит за объект, вычесть зарплату, вычесть общие расходы,
   * вычесть уже переведённое». Пока GC не заплатил ничего, месяц убыточный и
   * расчёт показывает ровно обратное тому, чего он ждёт, — а через неделю
   * перевернётся. Без этой строки он каждый раз будет спотыкаться.
   *
   * Деньги по контракту кладутся на владельца: платят ему, и все расходы тоже
   * с его карты. Возмещаемое сюда не входит — это не прибыль. */
  const unpaidContract = a.sites.reduce((s, site) => {
    const agreed = site.contract_amount ?? 0
    if (agreed <= 0) return s
    const paid = a.income.filter(i => i.site_id === site.id).reduce((x, i) => x + i.amount, 0)
    return s + Math.max(0, agreed - paid)
  }, 0)
  const owner = a.partners.find(p => p.is_owner)
  const projected = unpaidContract > 0 ? partners.map(p => {
    const cut = (allTime.profit + unpaidContract) * p.share
    const collected = p.collected + (owner && p.id === owner.id ? unpaidContract : 0)
    return { id: p.id, name: p.name, balance: cut + p.fronted - p.takenAll - collected }
  }) : null

  return {
    totals: t, allTime, partners, payouts, unpaidContract, projected,
    sites: a.sites.map(s => ({ id: s.id, name: s.name })),
  }
}

export async function gcData(siteId: string, from?: string, to?: string) {
  const a = await loadAll()
  const site = a.sites.find(s => s.id === siteId); if (!site) return null
  const items = a.expenses.filter(e => e.site_id === siteId && e.kind === 'reimbursable' && (!from || e.spent_on >= from) && (!to || e.spent_on <= to))
  return { site, items, total: items.reduce((s, e) => s + e.amount, 0), outstanding: items.filter(e => !e.reimbursed_on).reduce((s, e) => s + e.amount, 0) }
}

/**
 * Материалы за период по всем объектам сразу.
 *
 * Отчёт по объекту уже есть, но отчитываются не всегда по объекту: закупка
 * идёт под несколько площадок одного подрядчика, и вопрос звучит «сколько мы
 * потратили на материал с первого по восьмое». Раньше это приходилось
 * складывать из нескольких отчётов руками.
 *
 * Возмещаемое и есть материал: все 18 возмещаемых покупок в базе — категория
 * materials, иначе покупку просто не за что предъявлять. Поэтому фильтр
 * по виду, а не по категории — он не рассыплется, если завтра появится
 * возмещаемая аренда.
 */
export async function materialsData(from?: string, to?: string) {
  const a = await loadAll()
  const items = a.expenses.filter(e =>
    e.kind === 'reimbursable' && (!from || e.spent_on >= from) && (!to || e.spent_on <= to))
  const byId = new Map(a.sites.map(s => [s.id, s]))
  const groups = [...items.reduce((m, e) => {
    const k = e.site_id || ''
    const g = m.get(k) || { siteId: e.site_id, name: byId.get(e.site_id || '')?.name || 'No site', gc: byId.get(e.site_id || '')?.gc_company || null, items: [] as Expense[] }
    g.items.push(e); m.set(k, g); return m
  }, new Map<string, { siteId: string | null; name: string; gc: string | null; items: Expense[] }>()).values()]
    .map(g => ({ ...g, total: g.items.reduce((s, e) => s + e.amount, 0), open: g.items.filter(e => !e.reimbursed_on).reduce((s, e) => s + e.amount, 0) }))
    .sort((x, y) => y.total - x.total)
  return {
    items, groups,
    total: items.reduce((s, e) => s + e.amount, 0),
    outstanding: items.filter(e => !e.reimbursed_on).reduce((s, e) => s + e.amount, 0),
    openIds: items.filter(e => !e.reimbursed_on).map(e => e.id),
  }
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

/** Все расходы за период по всем объектам — для ссылки, которой делятся с
 *  партнёром: ему важны и свои траты, и возмещаемые. */
export async function periodData(from?: string, to?: string) {
  const a = await loadAll()
  const list = a.expenses.filter(e => (!from || e.spent_on >= from) && (!to || e.spent_on <= to))
  return {
    items: list,
    entries: entriesOf(a, list),
    own: list.filter(e => e.kind === 'own').reduce((s, e) => s + e.amount, 0),
    reimb: list.filter(e => e.kind === 'reimbursable').reduce((s, e) => s + e.amount, 0),
  }
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
