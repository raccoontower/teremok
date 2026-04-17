/**
 * Список email-адресов, имеющих доступ к админ-панели.
 * Сравнение без учёта регистра.
 */
export const ADMIN_EMAILS = [
  'yb2154878522@gmail.com',
];

export function isAdmin(email?: string | null): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase().trim());
}
