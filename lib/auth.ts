/**
 * Вход по паролю: подписанная cookie на 30 дней, без Supabase Auth.
 *
 * Регистрация, письма и сброс пароля — механика для многих пользователей;
 * здесь их трое и все известны заранее, поэтому у каждой роли свой пароль в
 * окружении. Токен — HMAC от «срок + роль»: подделать без APP_SECRET нельзя,
 * а в базе ничего хранить не нужно. Работает в Edge (proxy.ts), поэтому
 * только WebCrypto.
 *
 * Зачем роли. Партнёр смотрит делёж, управляющая компания — свои возмещаемые
 * покупки. Ни тому, ни другому не нужно (и не должно быть можно) править
 * цифры, по которым потом делят деньги.
 */
export const COOKIE = 'teremok_session'
const DAYS = 30

export type Role = 'owner' | 'partner' | 'gc'

async function hmac(secret: string, data: string) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(data))
  return Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('')
}

export async function issueToken(secret: string, role: Role = 'owner') {
  const exp = Date.now() + DAYS * 86400 * 1000
  return `${exp}.${role}.${await hmac(secret, `${exp}.${role}`)}`
}

/** Роль из токена, или null. Токены старого образца (`exp.sig`, без роли)
 *  принимаются как владельческие — иначе при выкатке всех бы разлогинило. */
export async function verifyToken(token: string | undefined, secret: string): Promise<Role | null> {
  if (!token) return null
  const parts = token.split('.')
  const [exp, role, sig] = parts.length === 2 ? [parts[0], 'owner' as const, parts[1]] : parts
  if (!exp || !sig || Number(exp) < Date.now()) return null
  if (role !== 'owner' && role !== 'partner' && role !== 'gc') return null
  const want = await hmac(secret, parts.length === 2 ? exp : `${exp}.${role}`)
  // сравнение постоянной длины — чтобы по времени ответа нельзя было подбирать
  if (want.length !== sig.length) return null
  let diff = 0
  for (let i = 0; i < want.length; i++) diff |= want.charCodeAt(i) ^ sig.charCodeAt(i)
  return diff === 0 ? (role as Role) : null
}

function sameSecret(input: string, want: string | undefined) {
  if (!want || input.length !== want.length) return false
  let diff = 0
  for (let i = 0; i < want.length; i++) diff |= input.charCodeAt(i) ^ want.charCodeAt(i)
  return diff === 0
}

/** Какая роль подходит к введённому паролю. Проверяются все три подряд, без
 *  раннего выхода: иначе по времени ответа видно, какой пароль «почти» угадан. */
export function passwordRole(input: string): Role | null {
  const owner = sameSecret(input, process.env.APP_PASSWORD)
  const partner = sameSecret(input, process.env.APP_PASSWORD_PARTNER)
  const gc = sameSecret(input, process.env.APP_PASSWORD_GC)
  return owner ? 'owner' : partner ? 'partner' : gc ? 'gc' : null
}

/** Что роли разрешено. Владельцу — всё; остальным только смотреть, и
 *  управляющей компании — только свои возмещаемые покупки.
 *
 *  Проверяется в proxy.ts, то есть до любого обработчика: страницу можно не
 *  прятать вручную, забыть негде. */
export function allows(role: Role, pathname: string, method: string): boolean {
  if (role === 'owner') return true
  const writing = method !== 'GET' && method !== 'HEAD'
  if (role === 'partner') return !writing || pathname === '/api/login'
  // gc
  if (writing && pathname !== '/api/login') return false
  return pathname === '/materials'
    || pathname.startsWith('/gc/')
    || pathname.startsWith('/api/export')
    || pathname.startsWith('/api/file')
    || pathname === '/logout'
}

/** Куда отправить роль, если она зашла не туда. */
export const homeFor = (role: Role) => (role === 'gc' ? '/materials' : '/')
