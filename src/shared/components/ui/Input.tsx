import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isLoading?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, leftIcon, rightIcon, id, required, ...props }, ref) => {
    const inputId = id ?? `input-${Math.random().toString(36).slice(2)}`;
    const errorId = `${inputId}-error`;
    const hintId = `${inputId}-hint`;

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-surface-700 dark:text-surface-300"
          >
            {label}
            {required && (
              <span className="ml-0.5 text-red-500" aria-hidden>
                *
              </span>
            )}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-surface-400">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            aria-describedby={cn(error && errorId, hint && hintId)}
            aria-invalid={!!error}
            required={required}
            className={cn(
              'h-9 w-full rounded-lg border bg-white px-3 text-sm text-surface-900 outline-none',
              'transition-colors placeholder:text-surface-400',
              'focus:border-aviation-500 focus:ring-2 focus:ring-aviation-500/20',
              'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-surface-50',
              'dark:bg-surface-800 dark:text-white dark:placeholder:text-surface-500',
              error
                ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20'
                : 'border-surface-300 dark:border-surface-600',
              leftIcon && 'pl-9',
              rightIcon && 'pr-9',
              className
            )}
            {...props}
          />

          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400">
              {rightIcon}
            </div>
          )}
        </div>

        {error && (
          <p id={errorId} className="text-xs text-red-600 dark:text-red-400" role="alert">
            {error}
          </p>
        )}

        {hint && !error && (
          <p id={hintId} className="text-xs text-surface-500">
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
