import { guessSite, partnersList } from '@/lib/queries'
import { AddFlow } from './flow'
export const dynamic = 'force-dynamic'
export default async function Add() {
  const [g, partners] = await Promise.all([guessSite(), partnersList()])
  return <AddFlow sites={g.sites} guess={g.guess} fromSchedule={g.fromSchedule} partners={partners} />
}
