import { gcData, splitData } from '@/lib/queries'
import { money, monthName, shortDate } from '@/lib/money'

/**
 * Выгрузка отчёта. Два вида и два формата:
 *   ?type=gc&site=<id>[&from&to]   — возмещаемые покупки для управляющей компании
 *   ?type=partner&m=YYYY-MM        — делёж с партнёром за месяц
 *   &format=csv | txt
 *
 * CSV — чтобы открыть в Excel и приложить к счёту. TXT — чтобы вставить
 * прямо в письмо или мессенджер: чаще всего просят именно так.
 */
const esc = (v: unknown) => {
  const s = String(v ?? '')
  return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}
const csv = (rows: unknown[][]) => rows.map(r => r.map(esc).join(',')).join('\r\n')
const pad = (s: string, n: number) => (s.length > n ? s.slice(0, n - 1) + '…' : s.padEnd(n))
// при нуле минус не ставим: «-$0.00» в отчёте выглядит как ошибка
const minus = (n: number) => (n ? '-' + money(n, true) : money(0, true))

export async function GET(req: Request) {
  const u = new URL(req.url)
  const type = u.searchParams.get('type') || 'gc'
  const format = u.searchParams.get('format') === 'csv' ? 'csv' : 'txt'
  const origin = u.origin

  let body: string, name: string
  if (type === 'partner') {
    const m = u.searchParams.get('m') || new Date().toISOString().slice(0, 7)
    const d = await splitData(m)
    const t = d.totals
    name = `partner-split-${m}`
    if (format === 'csv') {
      body = csv([
        ['Partner split', `${monthName(m)} ${m.slice(0, 4)}`],
        [],
        ['Line', 'Amount'],
        ['Income', t.income.toFixed(2)],
        ['Own expenses', (-t.own).toFixed(2)],
        ['Wages', (-t.wages).toFixed(2)],
        ['Profit', t.profit.toFixed(2)],
        [],
        ['Partner', 'Share', 'Cut this month', 'Profit share all time', 'Paid from own card', 'Received', 'Balance'],
        ...d.partners.map(p => [p.name, `${Math.round(p.share * 100)}%`, p.cut.toFixed(2), p.cutAll.toFixed(2), p.fronted.toFixed(2), p.takenAll.toFixed(2), p.balance.toFixed(2)]),
        [],
        ['Reimbursable (not in the split)', t.reimb.toFixed(2)],
        [],
        ['Transfers', 'Date', 'Partner', 'Amount', 'Note'],
        ...d.payouts.map(x => ['', x.paid_on, x.partner, x.amount.toFixed(2), x.note || '']),
      ])
    } else {
      body = [
        `PARTNER SPLIT — ${monthName(m)} ${m.slice(0, 4)}`,
        ''.padEnd(46, '-'),
        `${pad('Income', 28)}${money(t.income, true).padStart(14)}`,
        `${pad('Own expenses', 28)}${minus(t.own).padStart(14)}`,
        `${pad('Wages', 28)}${minus(t.wages).padStart(14)}`,
        ''.padEnd(46, '-'),
        `${pad('PROFIT', 28)}${money(t.profit, true).padStart(14)}`,
        '',
        ...d.partners.map(p => `${pad(`${p.name} (${Math.round(p.share * 100)}%)`, 28)}${money(p.cut, true).padStart(14)}`),
        '',
        'SETTLEMENT — ALL TIME',
        ''.padEnd(46, '-'),
        ...d.partners.map(p =>
          `${pad(p.name, 28)}\n` +
          `${pad('  profit share', 28)}${money(p.cutAll, true).padStart(14)}\n` +
          (p.fronted ? `${pad('  paid from own card', 28)}${('+' + money(p.fronted, true)).padStart(14)}\n` : '') +
          `${pad('  received', 28)}${('-' + money(p.takenAll, true)).padStart(14)}\n` +
          `${pad(p.balance < 0 ? '  took extra' : '  still owed', 28)}${money(Math.abs(p.balance), true).padStart(14)}`),
        '',
        ...(d.payouts.length ? ['TRANSFERS', ''.padEnd(46, '-'),
          ...d.payouts.slice(0, 30).map(x => `${pad(shortDate(x.paid_on), 10)}${pad(x.partner + (x.note ? ` · ${x.note}` : ''), 22)}${money(x.amount, true).padStart(14)}`), ''] : []),
        `Reimbursable, not in the split: ${money(t.reimb, true)}`,
        'That is the GC’s money coming back, not profit.',
      ].join('\n')
    }
  } else {
    const site = u.searchParams.get('site') || ''
    const from = u.searchParams.get('from') || undefined
    const to = u.searchParams.get('to') || undefined
    const d = await gcData(site, from, to)
    if (!d) return new Response('site not found', { status: 404 })
    name = `reimbursable-${d.site.name.replace(/[^\w-]+/g, '-')}`
    const rows = d.items.map(e => ({
      date: e.spent_on,
      vendor: e.vendor || e.category,
      note: e.note || '',
      amount: e.amount,
      receipt: e.receipt_path ? `${origin}/api/file?path=${encodeURIComponent(e.receipt_path)}` : '',
      paid: e.reimbursed_on || '',
    }))
    if (format === 'csv') {
      body = csv([
        ['Reimbursable purchases', d.site.name, d.site.address || '', d.site.gc_company || ''],
        [],
        ['Date', 'Vendor', 'What was bought', 'Amount', 'Receipt', 'Paid back'],
        ...rows.map(r => [r.date, r.vendor, r.note, r.amount.toFixed(2), r.receipt, r.paid]),
        [],
        ['TOTAL', '', '', d.total.toFixed(2)],
        ['Outstanding', '', '', d.outstanding.toFixed(2)],
      ])
    } else {
      body = [
        `REIMBURSABLE PURCHASES — ${d.site.name}`,
        [d.site.address, d.site.gc_company].filter(Boolean).join(' · '),
        ''.padEnd(60, '-'),
        ...rows.map(r =>
          `${pad(shortDate(r.date), 10)}${pad(r.vendor, 26)}${money(r.amount, true).padStart(12)}` +
          (r.note ? `\n${''.padEnd(10)}${r.note}` : '') +
          (r.paid ? `\n${''.padEnd(10)}paid back ${shortDate(r.paid)}` : '')),
        ''.padEnd(60, '-'),
        `${pad('TOTAL', 36)}${money(d.total, true).padStart(12)}`,
        `${pad('OUTSTANDING', 36)}${money(d.outstanding, true).padStart(12)}`,
        '',
        `${rows.filter(r => r.receipt).length} of ${rows.length} purchases have a receipt attached.`,
      ].join('\n')
    }
  }

  return new Response(body, {
    headers: {
      'Content-Type': format === 'csv' ? 'text/csv; charset=utf-8' : 'text/plain; charset=utf-8',
      'Content-Disposition': `attachment; filename="${name}.${format}"`,
    },
  })
}
