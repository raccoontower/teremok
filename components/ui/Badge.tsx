import { cn } from '@/lib/utils/cn';
import type { ListingStatus } from '@/types';

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

// Мягкие, ненавязчивые цвета бейджей — не кричащие, не отвлекают от контента
// Принцип: light background + saturated text, всегда читаемо
const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-neutral-100 text-neutral-600',
  success: 'bg-green-50 text-green-700',
  warning: 'bg-amber-50 text-amber-700',
  danger:  'bg-red-50 text-red-700',
  info:    'bg-blue-50 text-blue-700',    // основной синий вариант — для категорий
};

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        // rounded-full — пилюля, современно
        // text-xs font-medium — читаемо но не громко
        // px-2.5 py-1 — достаточные отступы для мобайла
        'inline-flex items-center rounded-full text-xs font-medium px-2.5 py-1',
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

/**
 * Бейдж для статуса объявления
 */
export function StatusBadge({ status }: { status: ListingStatus }) {
  const config: Record<ListingStatus, { label: string; variant: BadgeVariant }> = {
    active:  { label: 'Активно',  variant: 'success' },
    closed:  { label: 'Закрыто', variant: 'warning' },
    deleted: { label: 'Удалено', variant: 'danger'  },
  };

  const { label, variant } = config[status];
  return <Badge variant={variant}>{label}</Badge>;
}
