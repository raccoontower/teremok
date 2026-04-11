/**
 * Список email-адресов, имеющих доступ к админ-панели.
 */
export const ADMIN_EMAILS = [
  'Yb2154878512@gmail.com',
  'marbel96@gmail.com', // Добавил твой второй email на всякий случай
];

export function isAdmin(email?: string | null): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email);
}
