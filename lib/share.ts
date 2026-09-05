/** Публичная ссылка на отчёт GC: токен = base64url(payload).hmac. Живёт
 *  30 дней, открывает только один объект за один период, ничего больше. */
const b64 = (s: string) => Buffer.from(s).toString('base64url')
async function hmac(secret: string, data: string) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  return Buffer.from(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(data))).toString('base64url')
}
export type SharePayload = { site: string; from?: string; to?: string; exp: number }
export async function signShare(p: Omit<SharePayload, 'exp'>) {
  const body = b64(JSON.stringify({ ...p, exp: Date.now() + 30 * 86400e3 }))
  return `${body}.${await hmac(process.env.APP_SECRET!, body)}`
}
export async function verifyShare(token: string): Promise<SharePayload | null> {
  const [body, sig] = token.split('.'); if (!body || !sig) return null
  if (sig !== await hmac(process.env.APP_SECRET!, body)) return null
  try { const p = JSON.parse(Buffer.from(body, 'base64url').toString()) as SharePayload; return p.exp > Date.now() ? p : null } catch { return null }
}
