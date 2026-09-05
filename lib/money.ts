/** Деньги в интерфейсе: доллары с разделителями, центы только там, где
 *  сумма конкретного чека. Минус — типографский, чтобы читался на солнце. */
export function money(n: number, cents = false) {
  const v = Math.abs(n)
  const s = cents ? v.toFixed(2) : Math.round(v).toString()
  const [int, frac] = s.split('.')
  const body = '$' + int.replace(/\B(?=(\d{3})+(?!\d))/g, ',') + (frac ? '.' + frac : '')
  return n < 0 ? '−' + body : body
}
export const neg = (n: number) => (n ? '−' + money(n) : money(0))

export function ym(d = new Date()) { return d.toISOString().slice(0, 7) }
export function monthRange(m: string) {
  const [y, mo] = m.split('-').map(Number)
  const next = mo === 12 ? `${y + 1}-01-01` : `${y}-${String(mo + 1).padStart(2, '0')}-01`
  return { from: `${m}-01`, to: next }
}
export function monthName(m: string) {
  const [y, mo] = m.split('-').map(Number)
  return new Date(Date.UTC(y, mo - 1, 1)).toLocaleString('en-US', { month: 'long', timeZone: 'UTC' })
}
export function shiftMonth(m: string, by: number) {
  const [y, mo] = m.split('-').map(Number)
  const d = new Date(Date.UTC(y, mo - 1 + by, 1))
  return d.toISOString().slice(0, 7)
}
export function shortDate(iso: string) {
  const d = new Date(iso + 'T00:00:00Z')
  const today = new Date().toISOString().slice(0, 10)
  const yest = new Date(Date.now() - 86400e3).toISOString().slice(0, 10)
  if (iso === today) return 'Today'
  if (iso === yest) return 'Yesterday'
  return d.toLocaleString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })
}
export function today() { return new Date().toISOString().slice(0, 10) }
export function addDays(iso: string, n: number) { return new Date(new Date(iso + 'T00:00:00Z').getTime() + n * 86400e3).toISOString().slice(0, 10) }
export function initials(name: string) { return name.split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase() }
