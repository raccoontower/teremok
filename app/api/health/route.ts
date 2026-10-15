import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

/**
 * Прогрев, не диагностика. Таймер на домашней коробке
 * (`deploy/teremok-warmup.timer`) дёргает этот путь раз в 4 минуты без
 * логина — чтобы серверная функция и соединение с Supabase не успевали
 * остыть между заходами владельца. Именно остывшее соединение роняло первый
 * заход ошибкой шлюза "JWT issued at future" (JOURNAL, 2026-10-14).
 *
 * Наружу — только `{ ok: true }`, без данных: отдельная маленькая выборка,
 * не что-то из `lib/queries.ts`.
 */
export async function GET() {
  const { error } = await db().from('partners').select('id').limit(1)
  if (error) return NextResponse.json({ ok: false }, { status: 503 })
  return NextResponse.json({ ok: true })
}
