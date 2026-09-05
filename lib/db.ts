import 'server-only'
import { createClient } from '@supabase/supabase-js'

/** Серверный клиент с секретным ключом. Приложение закрытое — двое партнёров
 *  и бригадир, — поэтому доступ к данным идёт только через наши API-роуты,
 *  а не с клиента напрямую; RLS на этом этапе не нужен. */
export function db() {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SECRET_KEY
  if (!url || !key) throw new Error('SUPABASE_URL / SUPABASE_SECRET_KEY are not set')
  return createClient(url, key, { auth: { persistSession: false } })
}
