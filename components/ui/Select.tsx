import { type SelectHTMLAttributes, forwardRef, useId } from 'react';
import { cn } from '@/lib/utils/cn';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  options: SelectOption[];
  placeholder?: string;
}

// Кастомная SVG-стрелка — тёплый серый, чуть мягче системной
// Используем data URI чтобы не тащить отдельный компонент
const CHEVRON_SVG = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none'%3E%3Cpath d='M6 9l6 6 6-6' stroke='%237c7c8a' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`;

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, hint, options, placeholder, className, id, ...props }, ref) => {
    const generatedId = useId();
    const selectId = id || generatedId;

    return (
      <div className="w-full">
        {/* Лейбл — всегда над полем */}
        {label && (
          <label
            htmlFor={selectId}
            className="block text-sm font-medium text-neutral-700 mb-1.5"
          >
            {label}
          </label>
        )}

        {/* Обёртка для позиционирования кастомной стрелки */}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={cn(
              // Высота 48px — как у Input, единообразие форм
              'w-full h-12 pl-3.5 text-sm rounded-[10px] bg-white cursor-pointer',
              // Убираем системную стрелку
              'appearance-none',
              // Border 1.5px тёплый серый
              'border border-[1.5px]',
              // Отступ справа для кастомной стрелки
              'pr-10',
              // Плавный transition
              'transition-all duration-150',
              // Focus — как у Input, без резкого outline
              'focus:outline-none',

              error
                ? [
                    'border-error-400',
                    'focus:border-error-500 focus:shadow-[0_0_0_3px_rgba(225,29,72,0.15)]',
                  ].join(' ')
                : [
                    'border-neutral-300',
                    'hover:border-neutral-400',
                    'focus:border-primary-500 focus:shadow-focus',
                  ].join(' '),

              className
            )}
            style={{
              // Кастомная SVG-стрелка — убираем системную через appearance-none
              backgroundImage: CHEVRON_SVG,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 12px center',
              backgroundSize: '16px 16px',
            }}
            {...props}
          >
            {placeholder && (
              <option value="">{placeholder}</option>
            )}
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Ошибка с иконкой — единообразно с Input */}
        {error && (
          <p className="mt-1.5 text-xs text-error-600 flex items-center gap-1">
            <span aria-hidden="true">⚠️</span>
            {error}
          </p>
        )}

        {hint && !error && (
          <p className="mt-1.5 text-xs text-neutral-500">{hint}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
