import { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TableColumn, SortConfig } from '@/types';
import { EmptyState } from '../EmptyState/EmptyState';
import { Spinner } from '../ui/Spinner';

interface DataTableProps<T extends { id: string }> {
  data: T[];
  columns: TableColumn<T>[];
  isLoading?: boolean;
  emptyMessage?: string;
  emptyDescription?: string;
  onRowClick?: (row: T) => void;
  className?: string;
  stickyHeader?: boolean;
}

export function DataTable<T extends { id: string }>({
  data,
  columns,
  isLoading = false,
  emptyMessage = 'Sin resultados',
  emptyDescription = 'No se encontraron datos para los filtros aplicados.',
  onRowClick,
  className,
  stickyHeader = false,
}: DataTableProps<T>): JSX.Element {
  const [sort, setSort] = useState<SortConfig | null>(null);

  const handleSort = (key: string, sortable?: boolean): void => {
    if (!sortable) return;
    setSort((prev) => {
      if (prev?.key === key) {
        return prev.direction === 'asc'
          ? { key, direction: 'desc' }
          : null;
      }
      return { key, direction: 'asc' };
    });
  };

  const sortedData = useMemo(() => {
    if (!sort) return data;
    return [...data].sort((a, b) => {
      const aVal = (a as Record<string, unknown>)[sort.key];
      const bVal = (b as Record<string, unknown>)[sort.key];

      if (aVal == null) return 1;
      if (bVal == null) return -1;

      const comparison =
        typeof aVal === 'string' && typeof bVal === 'string'
          ? aVal.localeCompare(bVal, 'es')
          : aVal < bVal
          ? -1
          : aVal > bVal
          ? 1
          : 0;

      return sort.direction === 'asc' ? comparison : -comparison;
    });
  }, [data, sort]);

  const SortIcon = ({ colKey }: { colKey: string }): JSX.Element => {
    if (sort?.key !== colKey) return <ChevronsUpDown size={13} className="text-surface-400" />;
    if (sort.direction === 'asc') return <ChevronUp size={13} className="text-aviation-500" />;
    return <ChevronDown size={13} className="text-aviation-500" />;
  };

  if (isLoading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (data.length === 0) {
    return <EmptyState title={emptyMessage} description={emptyDescription} />;
  }

  return (
    <div className={cn('w-full overflow-auto rounded-xl border border-surface-200 dark:border-surface-700', className)}>
      <table
        className="w-full border-collapse text-sm"
        role="grid"
        aria-rowcount={sortedData.length}
      >
        <thead
          className={cn(
            'border-b border-surface-200 bg-surface-50 dark:border-surface-700 dark:bg-surface-800/50',
            stickyHeader && 'sticky top-0 z-10'
          )}
        >
          <tr>
            {columns.map((col) => (
              <th
                key={String(col.key)}
                scope="col"
                style={{ width: col.width }}
                className={cn(
                  'whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-surface-500 dark:text-surface-400',
                  col.align === 'center' && 'text-center',
                  col.align === 'right' && 'text-right',
                  col.sortable && 'cursor-pointer select-none hover:text-surface-900 dark:hover:text-white'
                )}
                onClick={() => handleSort(String(col.key), col.sortable)}
                aria-sort={
                  sort?.key === String(col.key)
                    ? sort.direction === 'asc'
                      ? 'ascending'
                      : 'descending'
                    : undefined
                }
              >
                <span className="flex items-center gap-1">
                  {col.header}
                  {col.sortable && <SortIcon colKey={String(col.key)} />}
                </span>
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="divide-y divide-surface-100 dark:divide-surface-700/50">
          {sortedData.map((row, rowIndex) => (
            <tr
              key={row.id}
              role="row"
              aria-rowindex={rowIndex + 1}
              onClick={() => onRowClick?.(row)}
              className={cn(
                'bg-white transition-colors dark:bg-surface-800',
                onRowClick && 'cursor-pointer hover:bg-surface-50 dark:hover:bg-surface-700/50'
              )}
            >
              {columns.map((col) => {
                const rawValue = (row as Record<string, unknown>)[String(col.key)];
                return (
                  <td
                    key={String(col.key)}
                    className={cn(
                      'px-4 py-3 text-surface-700 dark:text-surface-300',
                      col.align === 'center' && 'text-center',
                      col.align === 'right' && 'text-right'
                    )}
                  >
                    {col.render ? col.render(rawValue, row) : String(rawValue ?? '-')}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
