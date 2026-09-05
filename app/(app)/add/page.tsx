import { guessSite } from '@/lib/queries'
import { AddFlow } from './flow'
export const dynamic = 'force-dynamic'
export default async function Add() {
  const g = await guessSite()
  return <AddFlow sites={g.sites} guess={g.guess} fromSchedule={g.fromSchedule} />
}
