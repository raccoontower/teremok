import { weekData } from '@/lib/queries'
import { today, addDays } from '@/lib/money'
import { Week } from './week'

export const dynamic = 'force-dynamic'

/** Неделя с понедельника. ?d=YYYY-MM-DD — любой день внутри недели. */
export default async function WeekPage({ searchParams }: { searchParams: Promise<{ d?: string }> }) {
  const { d } = await searchParams
  const base = /^\d{4}-\d{2}-\d{2}$/.test(d || '') ? d! : today()
  const dow = (new Date(base + 'T00:00:00Z').getUTCDay() + 6) % 7
  const from = addDays(base, -dow)
  const data = await weekData(from)
  return <Week from={from} {...data} today={today()} />
}
