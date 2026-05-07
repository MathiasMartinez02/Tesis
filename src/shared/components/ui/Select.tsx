import { forwardRef, type SelectHTMLAttributes } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SelectOption } from '@/types';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  options: SelectOption[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, hint, options, placeholder, id, required, ...props }, ref) => {
    const selectId = id ?? `select-${Math.random().toString(36).slice(2)}`;
    const errorId = `${selectId}-error`;

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={selectId}
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
          <select
            ref={ref}
            id={selectId}
            aria-describedby={error ? errorId : undefined}
            aria-invalid={!!error}
            required={required}
            className={cn(
              'h-9 w-full appearance-none rounded-lg border bg-white px-3 pr-8 text-sm text-surface-900 outline-none',
              'transition-colors',
              'focus:border-aviation-500 focus:ring-2 focus:ring-aviation-500/20',
              'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-surface-50',
              'dark:bg-surface-800 dark:text-white',
              error
                ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20'
                : 'border-surface-300 dark:border-surface-600',
              className
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                {opt.label}
              </option>
            ))}
          </select>

          <ChevronDown
            size={14}
            className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-surface-400"
            aria-hidden
          />
        </div>

        {error && (
          <p id={errorId} className="text-xs text-red-600 dark:text-red-400" role="alert">
            {error}
          </p>
        )}
        {hint && !error && <p className="text-xs text-surface-500">{hint}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';
