import { type TextareaHTMLAttributes, forwardRef, useId } from 'react';
import { cn } from '@/lib/utils/cn';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
  maxLength?: number;
  currentLength?: number;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, maxLength, currentLength, className, id, ...props }, ref) => {
    const generatedId = useId();
    const textareaId = id || generatedId;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={cn(
            'w-full px-3 py-2 text-sm border rounded-lg bg-white placeholder-gray-400 resize-y min-h-[100px] transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
            error
              ? 'border-red-400 focus:ring-red-400'
              : 'border-gray-300 hover:border-gray-400',
            className
          )}
          {...props}
        />
        <div className="flex justify-between items-start mt-1">
          <div>
            {error && <p className="text-xs text-red-500">{error}</p>}
            {hint && !error && <p className="text-xs text-gray-500">{hint}</p>}
          </div>
          {/* Счётчик символов */}
          {maxLength !== undefined && currentLength !== undefined && (
            <p
              className={cn(
                'text-xs ml-auto',
                currentLength > maxLength * 0.9 ? 'text-orange-500' : 'text-gray-400',
                currentLength > maxLength && 'text-red-500'
              )}
            >
              {currentLength}/{maxLength}
            </p>
          )}
        </div>
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
