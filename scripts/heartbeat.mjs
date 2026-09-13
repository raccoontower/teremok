#!/usr/bin/env node
/**
 * heartbeat.mjs — не даёт Supabase Free усыпить проект простоем.
 *
 * Free-тариф ставит проект на паузу после 7 дней без обращений к API —
 * именно так Teremok лёг: владелец считает деньги здесь каждый день, но
 * ежедневного использования одного объекта не хватает, если между
 * стройками бывает перерыв дольше недели. Пауза не разрушительна (данные
 * целы, "Resume project" в дашборде), но это прод, которым пользуются
 * каждый день, и класть его на паузу молча — не вариант.
 *
 * Дешёвый читающий запрос раз в несколько дней. Запускается таймером —
 * см. teremok-heartbeat.timer.
 */
import fs from 'node:fs'
import os from 'node:os'

for (const l of fs.readFileSync(`${os.homedir()}/projects/env/teremok.env`, 'utf8').split(/\r?\n/)) {
  const m = l.match(/^([A-Z0-9_]+)=(.*)$/)
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '')
}

const url = `${process.env.SUPABASE_URL}/rest/v1/sites?select=id&limit=1`
const r = await fetch(url, {
  headers: {
    apikey: process.env.SUPABASE_PUBLISHABLE_KEY,
    Authorization: `Bearer ${process.env.SUPABASE_PUBLISHABLE_KEY}`,
  },
})
const stamp = new Date().toISOString()
if (r.ok) {
  console.log(`[${stamp}] ok — проект живой`)
} else {
  console.error(`[${stamp}] HTTP ${r.status} — проверить дашборд Supabase вручную`)
  process.exit(1)
}
