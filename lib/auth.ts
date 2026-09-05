/**
 * Вход для одного человека: пароль из env, подписанная cookie на 30 дней.
 *
 * Без Supabase Auth намеренно: регистрация, письма и сброс пароля — это
 * механика для многих пользователей, а здесь один владелец. Токен —
 * HMAC от срока действия; подделать без APP_SECRET нельзя, а в базе ничего
 * хранить не нужно. Работает в Edge (proxy.ts), поэтому только WebCrypto.
 */
export const COOKIE = 'teremok_session'
const DAYS = 30

async function hmac(secret: string, data: string) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(data))
  return Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('')
}

export async function issueToken(secret: string) {
  const exp = Date.now() + DAYS * 86400 * 1000
  return `${exp}.${await hmac(secret, String(exp))}`
}

export async function verifyToken(token: string | undefined, secret: string) {
  if (!token) return false
  const [exp, sig] = token.split('.')
  if (!exp || !sig || Number(exp) < Date.now()) return false
  const want = await hmac(secret, exp)
  // сравнение постоянной длины — чтобы по времени ответа нельзя было подбирать
  if (want.length !== sig.length) return false
  let diff = 0
  for (let i = 0; i < want.length; i++) diff |= want.charCodeAt(i) ^ sig.charCodeAt(i)
  return diff === 0
}

export function passwordMatches(input: string) {
  const want = process.env.APP_PASSWORD || ''
  if (!want || input.length !== want.length) return false
  let diff = 0
  for (let i = 0; i < want.length; i++) diff |= input.charCodeAt(i) ^ want.charCodeAt(i)
  return diff === 0
}
