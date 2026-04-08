import { cn } from '@/lib/utils/cn';
import type { HTMLAttributes } from 'react';

interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

/**
 * Контейнер с максимальной шириной и горизонтальными отступами
 */
export function Container({ children, className, ...props }: ContainerProps) {
  return (
    <div
      className={cn('max-w-screen-lg mx-auto px-4', className)}
      {...props}
    >
      {children}
    </div>
  );
}
