import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Plus, AlertTriangle, Edit } from 'lucide-react';
import { motion } from 'framer-motion';
import { PageHeader } from '@/shared/components/PageHeader/PageHeader';
import { Button } from '@/shared/components/ui/Button';
import { DataTable } from '@/shared/components/DataTable/DataTable';
import { StatusBadge } from '@/shared/components/StatusBadge/StatusBadge';
import { SearchInput } from '@/shared/components/SearchInput/SearchInput';
import { KPICard } from '@/shared/components/KPICard/KPICard';
import { RoleGuard } from '@/routes/RoleGuard';
import { useInventory } from '../hooks/useInventory';
import { ROUTES, INVENTORY_CATEGORY_LABELS, buildRoute } from '@/constants';
import { formatCurrency } from '@/lib/utils';
import type { InventoryItem, TableColumn } from '@/types';
import { Pagination } from '@/shared/components/Pagination/Pagination';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { ErrorState } from '@/shared/components/ErrorState/ErrorState';

// Recibe la función de navegación para poder ir a la edición sin propagar el click al row (que navega al detalle)
function buildColumns(navigate: (path: string) => void): TableColumn<InventoryItem>[] {
  return [
  ...BASE_COLUMNS,
  {
    key: 'id',
    header: '',
    width: '90px',
    render: (_, row) => (
      <RoleGuard permission="canManageInventory">
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={`Editar ${row.partNumber}`}
          onClick={(e) => {
            e.stopPropagation();
            navigate(buildRoute(ROUTES.INVENTORY_ITEM_EDIT, { id: row.id }));
          }}
        >
          <Edit size={14} />
        </Button>
      </RoleGuard>
    ),
  },
  ];
}

const BASE_COLUMNS: TableColumn<InventoryItem>[] = [
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
    width: '140px',
    render: (value) => INVENTORY_CATEGORY_LABELS[value as InventoryItem['category']],
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
      <span
        className={`font-semibold ${
          Number(value) <= row.minimumStock ? 'text-red-600' : 'text-surface-900 dark:text-white'
        }`}
      >
        {String(value)} {row.unit}
      </span>
    ),
  },
  {
    key: 'location',
    header: 'Ubicación',
    render: (value) => (
      <span className="text-xs font-mono text-surface-600 dark:text-surface-400">
        {String(value)}
      </span>
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

const TABLE_PAGE_SIZE = 15;

// Listado del pañol con stock critico calculado sobre todo el inventario
export function InventoryListPage(): JSX.Element {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(search);
  const { data: result, isLoading, isError, refetch } = useInventory({ search: debouncedSearch || undefined }, page, TABLE_PAGE_SIZE);
  const { data: lowStock } = useInventory({ lowStock: true }, 1, 1);
  const lowStockCount = lowStock?.total ?? 0;

  if (isError) return <ErrorState title="Error al cargar el inventario" onRetry={() => void refetch()} />;

  // Navega al detalle del ítem al hacer click en una fila de la tabla
  const handleRowClick = (row: InventoryItem): void => {
    navigate(buildRoute(ROUTES.INVENTORY_ITEM_DETAIL, { id: row.id }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-5"
    >
      <PageHeader
        title="Pañol / Inventario"
        description={`${result?.total ?? 0} ítems en el pañol`}
        actions={
          <RoleGuard permission="canManageInventory">
            <Button size="sm" leftIcon={<Plus size={15} />} onClick={() => navigate(ROUTES.INVENTORY_ITEM_NEW)}>
              Registrar Ítem
            </Button>
          </RoleGuard>
        }
      />

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2">
        <KPICard
          title="Total de ítems"
          value={result?.total ?? 0}
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
      </div>

      {/* Alertas */}
      {lowStockCount > 0 && (
        <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-900/50 dark:bg-amber-900/10">
          <AlertTriangle size={16} className="shrink-0 text-amber-600" />
          <p className="text-sm font-medium text-amber-800 dark:text-amber-400">
            {lowStockCount} {lowStockCount === 1 ? 'ítem tiene' : 'ítems tienen'} stock bajo o
            nulo. Revisá las existencias.
          </p>
        </div>
      )}

      {/* Búsqueda */}
      <div>
        <SearchInput
          value={search}
          onChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
          placeholder="Buscar por N° parte o descripción..."
          className="w-80"
        />
      </div>

      {/* Tabla */}
      <DataTable<InventoryItem>
        data={result?.data ?? []}
        columns={buildColumns(navigate)}
        isLoading={isLoading}
        onRowClick={handleRowClick}
        emptyMessage="Sin ítems en inventario"
        emptyDescription="No hay ítems que coincidan con la búsqueda."
      />

      {result && (
        <Pagination page={page} pageSize={TABLE_PAGE_SIZE} total={result.total} totalPages={result.totalPages} onPageChange={setPage} />
      )}
    </motion.div>
  );
}
