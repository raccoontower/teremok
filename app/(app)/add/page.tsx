import { headers } from 'next/headers'
import { guessSite, partnersList } from '@/lib/queries'
import { AddFlow } from './flow'
export const dynamic = 'force-dynamic'
export default async function Add() {
  const [g, partners, h] = await Promise.all([guessSite(), partnersList(), headers()])
  return <AddFlow sites={g.sites} guess={g.guess} fromSchedule={g.fromSchedule} partners={partners} asPartner={h.get('x-role') === 'partner'} />
}
