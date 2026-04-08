import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Утилита для объединения классов Tailwind без конфликтов
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
