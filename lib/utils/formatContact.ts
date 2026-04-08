/**
 * Формирует ссылку для звонка
 */
export function buildPhoneLink(phone: string): string {
  // Убираем все символы кроме цифр и +
  const cleaned = phone.replace(/[^\d+]/g, '');
  return `tel:${cleaned}`;
}

/**
 * Формирует ссылку для открытия WhatsApp
 * @param phone - номер телефона (международный формат)
 * @param message - необязательный текст сообщения
 */
export function buildWhatsAppLink(phone: string, message?: string): string {
  // Убираем все нецифровые символы кроме +
  const cleaned = phone.replace(/[^\d]/g, '');
  const encodedMessage = message ? `?text=${encodeURIComponent(message)}` : '';
  return `https://wa.me/${cleaned}${encodedMessage}`;
}

/**
 * Формирует ссылку для открытия Telegram
 * @param username - username без @ или номер телефона
 */
export function buildTelegramLink(username: string): string {
  // Если это username (начинается с @ или буквы) — ссылка на профиль
  const cleaned = username.replace(/^@/, '');

  // Если это номер телефона — используем t.me/+номер
  if (/^\+?\d+$/.test(cleaned)) {
    const phone = cleaned.replace(/^\+/, '');
    return `https://t.me/+${phone}`;
  }

  return `https://t.me/${cleaned}`;
}
