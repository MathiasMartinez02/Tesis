import { useState } from 'react';
import { Package, Plus, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { PageHeader } from '@/shared/components/PageHeader/PageHeader';
import { Button } from '@/shared/components/ui/Button';
import { DataTable } from '@/shared/components/DataTable/DataTable';
import { StatusBadge } from '@/shared/components/StatusBadge/StatusBadge';
import { SearchInput } from '@/shared/components/SearchInput/SearchInput';
import { Card } from '@/shared/components/ui/Card';
import { KPICard } from '@/shared/components/KPICard/KPICard';
import { MOCK_INVENTORY } from '@/mocks/inventory.mock';
import { formatCurrency } from '@/lib/utils';
import type { InventoryItem, TableColumn } from '@/types';

const CATEGORY_LABELS = {
  repuesto_motor: 'Motor',
  repuesto_celula: 'Célula',
  consumible: 'Consumible',
  herramienta: 'Herramienta',
  material: 'Material',
  instrumento: 'Instrumento',
  avionico: 'Aviónico',
} as const;

const COLUMNS: TableColumn<InventoryItem>[] = [
  {
    key: 'partNumber',
    header: 'N° Parte',
    width: '130px',
    render: (value) => (
      <span className="font-mono text-xs font-semibold text-surface-900 dark:text-white">
        {String(value)}
      </span>
    ),
  },
  {
    key: 'description',
    header: 'Descripción',
    render: (value) => (
      <span className="text-sm text-surface-700 dark:text-surface-300">{String(value)}</span>
    ),
  },
  {
    key: 'category',
    header: 'Categoría',
    width: '120px',
    render: (value) => CATEGORY_LABELS[value as InventoryItem['category']],
  },
  {
    key: 'status',
    header: 'Estado',
    width: '130px',
    render: (_, row) => <StatusBadge type="inventory" status={row.status} />,
  },
  {
    key: 'currentStock',
    header: 'Stock',
    align: 'right',
    width: '100px',
    render: (value, row) => (
      <span className={`font-semibold ${Number(value) <= row.minimumStock ? 'text-red-600' : 'text-surface-900 dark:text-white'}`}>
        {String(value)} {row.unit}
      </span>
    ),
  },
  {
    key: 'location',
    header: 'Ubicación',
    render: (value) => (
      <span className="text-xs font-mono text-surface-600 dark:text-surface-400">{String(value)}</span>
    ),
  },
  {
    key: 'unitCost',
    header: 'Costo unit.',
    align: 'right',
    render: (value) => (
      <span className="text-sm text-surface-700">{formatCurrency(Number(value))}</span>
    ),
  },
];

export function InventoryListPage(): JSX.Element {
  const [search, setSearch] = useState('');

  const filtered = MOCK_INVENTORY.filter((item) =>
    !search ||
    item.description.toLowerCase().includes(search.toLowerCase()) ||
    item.partNumber.toLowerCase().includes(search.toLowerCase())
  );

  const lowStockCount = MOCK_INVENTORY.filter((i) => i.status === 'bajo_stock' || i.status === 'sin_stock').length;
  const totalValue = MOCK_INVENTORY.reduce((sum, i) => sum + i.totalValue, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-5"
    >
      <PageHeader
        title="Pañol / Inventario"
        description={`${MOCK_INVENTORY.length} ítems en el pañol`}
        actions={
          <Button size="sm" leftIcon={<Plus size={15} />}>
            Nuevo ítem
          </Button>
        }
      />

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-3">
        <KPICard
          title="Total de ítems"
          value={MOCK_INVENTORY.length}
          icon={Package}
          iconColor="text-aviation-600"
          iconBg="bg-aviation-50"
        />
        <KPICard
          title="Stock crítico"
          value={lowStockCount}
          icon={AlertTriangle}
          iconColor="text-red-600"
          iconBg="bg-red-50"
          trendPositive={false}
        />
        <KPICard
          title="Valor en inventario"
          value={formatCurrency(totalValue)}
          icon={Package}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50"
        />
      </div>

      {/* Alertas */}
      {lowStockCount > 0 && (
        <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-900/50 dark:bg-amber-900/10">
          <AlertTriangle size={16} className="shrink-0 text-amber-600" />
          <p className="text-sm font-medium text-amber-800 dark:text-amber-400">
            {lowStockCount} {lowStockCount === 1 ? 'ítem tiene' : 'ítems tienen'} stock bajo o nulo. Revisá las existencias.
          </p>
        </div>
      )}

      {/* Búsqueda */}
      <div>
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Buscar por N° parte o descripción..."
          className="w-80"
        />
      </div>

      {/* Tabla */}
      <DataTable<InventoryItem>
        data={filtered}
        columns={COLUMNS}
        emptyMessage="Sin ítems en inventario"
        emptyDescription="No hay ítems que coincidan con la búsqueda."
      />
    </motion.div>
  );
}
