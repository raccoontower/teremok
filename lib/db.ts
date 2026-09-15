import 'server-only'
import { createClient } from '@supabase/supabase-js'

/** Серверный клиент с секретным ключом. Доступ к данным идёт только через
 *  наши API-роуты, с клиента в базу не ходим.
 *
 *  Здесь раньше стояло, что «RLS на этом этапе не нужен, приложение закрытое».
 *  Рассуждение неверное, и 15 сентября Supabase прислал критическое
 *  предупреждение: закрытость приложения ничего не решает, PostgREST торчит
 *  наружу независимо от него, а публичный ключ на то и публичный. RLS включён
 *  на всех таблицах без политик (миграция 0011): service_role его обходит,
 *  поэтому изнутри работает всё, а снаружи не видно ничего.
 *
 *  Если появится доступ с клиента — писать политики ЯВНО, а не выключать RLS. */
export function db() {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SECRET_KEY
  if (!url || !key) throw new Error('SUPABASE_URL / SUPABASE_SECRET_KEY are not set')
  return createClient(url, key, { auth: { persistSession: false } })
}
