import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchInput({
  value,
  onChange,
  placeholder = 'Buscar...',
  className,
}: SearchInputProps): JSX.Element {
  return (
    <div className={cn('relative', className)}>
      <Search
        size={16}
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-surface-400"
        aria-hidden
      />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className={cn(
          'h-9 w-full rounded-lg border border-surface-300 bg-white pl-9 pr-8 text-sm outline-none',
          'placeholder:text-surface-400 transition-colors',
          'focus:border-aviation-500 focus:ring-2 focus:ring-aviation-500/20',
          'dark:border-surface-600 dark:bg-surface-800 dark:text-white dark:placeholder:text-surface-500'
        )}
      />
      {value && (
        <button
          onClick={() => onChange('')}
          aria-label="Limpiar búsqueda"
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
