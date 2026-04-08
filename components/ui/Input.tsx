import { type InputHTMLAttributes, forwardRef, useId } from 'react';
import { cn } from '@/lib/utils/cn';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className, id, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id || generatedId;

    return (
      <div className="w-full">
        {/* Лейбл — всегда над полем, чуть темнее для читаемости */}
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-neutral-700 mb-1.5"
          >
            {label}
          </label>
        )}

        <input
          ref={ref}
          id={inputId}
          className={cn(
            // Высота 48px — мобайл-дружественная (палец легко попадает)
            'w-full h-12 px-3.5 text-sm rounded-[10px] bg-white',
            // Border 1.5px тёплый серый — не грубый, но заметный
            'border border-[1.5px]',
            // Placeholder — светлее, ненавязчивый
            'placeholder:text-neutral-400',
            // Плавный transition
            'transition-all duration-150',
            // Focus — синяя обводка через box-shadow, без резкого outline
            // Убираем стандартный outline, используем shadow
            'focus:outline-none',

            error
              // Error state: красная граница + shadow
              ? [
                  'border-error-400',
                  'focus:border-error-500 focus:shadow-[0_0_0_3px_rgba(225,29,72,0.15)]',
                ].join(' ')
              : [
                  // Нормальный — тёплый серый border
                  'border-neutral-300',
                  'hover:border-neutral-400',
                  // Focus — синяя обводка с мягкой тенью (не outline!)
                  'focus:border-primary-500 focus:shadow-focus',
                ].join(' '),

            className
          )}
          {...props}
        />

        {/* Ошибка — иконка ⚠️ перед текстом, красный */}
        {error && (
          <p className="mt-1.5 text-xs text-error-600 flex items-center gap-1">
            <span aria-hidden="true">⚠️</span>
            {error}
          </p>
        )}

        {/* Подсказка — только когда нет ошибки */}
        {hint && !error && (
          <p className="mt-1.5 text-xs text-neutral-500">{hint}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
