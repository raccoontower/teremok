import { type ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils/cn';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
}

// Варианты кнопок — тёплый доверительный стиль
// primary: насыщенный тёплый синий с лёгкой тенью (создаёт ощущение объёма)
// secondary: белая с рамкой, при hover — очень лёгкий синеватый фон
// ghost: без фона, минимальный — для второстепенных действий
// danger: красный для деструктивных действий
const variantClasses: Record<ButtonVariant, string> = {
  primary: [
    'bg-primary-600 text-white',
    'hover:bg-primary-700 active:bg-primary-800',
    'disabled:bg-primary-300 disabled:shadow-none',
    'shadow-button',              // тёплая синяя тень под кнопкой
  ].join(' '),

  secondary: [
    'bg-white text-neutral-700 border border-neutral-300',
    'hover:bg-primary-50 hover:border-primary-200 hover:text-primary-700', // лёгкий голубой фон при hover
    'active:bg-primary-100',
    'disabled:opacity-50 disabled:cursor-not-allowed',
  ].join(' '),

  ghost: [
    'bg-transparent text-neutral-600',
    'hover:bg-neutral-100 active:bg-neutral-200',
    'disabled:opacity-50',
  ].join(' '),

  danger: [
    'bg-error-600 text-white',
    'hover:bg-error-700 active:bg-error-800',
    'disabled:bg-error-300 disabled:shadow-none',
  ].join(' '),
};

// Размеры с мобайл-дружественными высотами (min 44px touch target)
// lg: 52px — для главных CTA на мобайле (пальцы легко попадают)
const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-9 px-3 text-sm',         // 36px — второстепенные действия
  md: 'h-11 px-4 text-sm',        // 44px — стандартная кнопка
  lg: 'h-[52px] px-6 text-base',  // 52px — главные CTA (мобайл)
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      fullWidth = false,
      disabled,
      className,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          // Базовые стили — скругление 10px вместо rounded-lg
          'inline-flex items-center justify-center gap-2 font-medium rounded-[10px]',
          // Плавный transition на все состояния (150ms)
          'transition-all duration-150',
          // Элегантный focus — вместо резкого ring используем тень с offset
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
          'disabled:cursor-not-allowed',
          variantClasses[variant],
          sizeClasses[size],
          fullWidth && 'w-full',
          className
        )}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin h-4 w-4 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12" cy="12" r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
