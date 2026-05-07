import { X } from 'lucide-react';
import { Select } from '@/shared/components/ui/Select';
import { Button } from '@/shared/components/ui/Button';
import { SearchInput } from '@/shared/components/SearchInput/SearchInput';
import type { WorkOrderFilters, SelectOption } from '@/types';
import {
  WORK_ORDER_STATUS_LABELS,
  WORK_ORDER_PRIORITY_LABELS,
  WORK_ORDER_TYPE_LABELS,
} from '@/constants';

interface WorkOrderFiltersPanelProps {
  filters: WorkOrderFilters;
  onFiltersChange: (filters: WorkOrderFilters) => void;
  onReset: () => void;
}

const STATUS_OPTIONS: SelectOption[] = Object.entries(WORK_ORDER_STATUS_LABELS).map(
  ([value, label]) => ({ value, label })
);

const PRIORITY_OPTIONS: SelectOption[] = Object.entries(WORK_ORDER_PRIORITY_LABELS).map(
  ([value, label]) => ({ value, label })
);

const TYPE_OPTIONS: SelectOption[] = Object.entries(WORK_ORDER_TYPE_LABELS).map(
  ([value, label]) => ({ value, label })
);

const hasActiveFilters = (filters: WorkOrderFilters): boolean =>
  Object.values(filters).some((v) => v !== undefined && v !== '');

export function WorkOrderFiltersPanel({
  filters,
  onFiltersChange,
  onReset,
}: WorkOrderFiltersPanelProps): JSX.Element {
  const update = (key: keyof WorkOrderFilters, value: string): void => {
    onFiltersChange({ ...filters, [key]: value || undefined });
  };

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="w-64">
        <SearchInput
          value={filters.search ?? ''}
          onChange={(v) => update('search', v)}
          placeholder="Buscar OT, aeronave, cliente..."
        />
      </div>

      <div className="w-40">
        <Select
          options={STATUS_OPTIONS}
          value={filters.status ?? ''}
          onChange={(e) => update('status', e.target.value)}
          placeholder="Estado"
          aria-label="Filtrar por estado"
        />
      </div>

      <div className="w-36">
        <Select
          options={PRIORITY_OPTIONS}
          value={filters.priority ?? ''}
          onChange={(e) => update('priority', e.target.value)}
          placeholder="Prioridad"
          aria-label="Filtrar por prioridad"
        />
      </div>

      <div className="w-48">
        <Select
          options={TYPE_OPTIONS}
          value={filters.type ?? ''}
          onChange={(e) => update('type', e.target.value)}
          placeholder="Tipo de OT"
          aria-label="Filtrar por tipo"
        />
      </div>

      {hasActiveFilters(filters) && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onReset}
          leftIcon={<X size={14} />}
          className="text-surface-500"
        >
          Limpiar
        </Button>
      )}
    </div>
  );
}
