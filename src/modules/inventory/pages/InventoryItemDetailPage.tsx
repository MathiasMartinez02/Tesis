import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, Package, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/shared/components/ui/Button';
import { Card, CardHeader, CardTitle, CardBody } from '@/shared/components/ui/Card';
import { StatusBadge } from '@/shared/components/StatusBadge/StatusBadge';
import { DataTable } from '@/shared/components/DataTable/DataTable';
import { PageLoader } from '@/shared/components/PageLoader/PageLoader';
import { ErrorState } from '@/shared/components/ErrorState/ErrorState';
import { useInventoryItem, useInventoryMovements, useDeleteInventoryItem } from '../hooks/useInventory';
import { ROUTES, buildRoute, INVENTORY_CATEGORY_LABELS, MOVEMENT_TYPE_LABELS } from '@/constants';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import type { InventoryMovement, TableColumn } from '@/types';

// Columnas de la tabla de historial de movimientos: tipo, cantidad, stock resultante, quien lo hizo y cuando
const MOVEMENT_COLUMNS: TableColumn<InventoryMovement>[] = [
  {
    key: 'type',
    header: 'Tipo',
    width: '110px',
    render: (value) => (
      <span className="text-sm font-medium text-surface-900 dark:text-white">
        {MOVEMENT_TYPE_LABELS[value as InventoryMovement['type']]}
      </span>
    ),
  },
  {
    key: 'quantity',
    header: 'Cantidad',
    align: 'right',
    width: '100px',
    render: (value) => <span className="text-sm text-surface-700 dark:text-surface-300">{String(value)}</span>,
  },
  {
    key: 'newStock',
    header: 'Stock resultante',
    align: 'right',
    width: '140px',
    render: (value) => (
      <span className="text-sm font-semibold text-surface-900 dark:text-white">{String(value)}</span>
    ),
  },
  {
    key: 'performedByName',
    header: 'Realizado por',
    render: (value) => <span className="text-sm text-surface-700 dark:text-surface-300">{String(value)}</span>,
  },
  {
    key: 'performedAt',
    header: 'Fecha',
    width: '160px',
    render: (value) => (
      <span className="text-xs text-surface-500">{formatDateTime(String(value))}</span>
    ),
  },
];

// Muestra el detalle de un ítem de inventario junto a su historial de movimientos, con acciones de editar y eliminar
export function InventoryItemDetailPage(): JSX.Element {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: item, isLoading, isError, refetch } = useInventoryItem(id ?? '');
  const { data: movementsResult, isLoading: isLoadingMovements } = useInventoryMovements(id ?? '');
  const { mutate: deleteItem, isPending: isDeleting } = useDeleteInventoryItem();

  if (isLoading) return <PageLoader />;
  if (isError || !item) {
    return (
      <ErrorState
        title="Ítem no encontrado"
        description="El ítem de inventario solicitado no existe."
        onRetry={() => void refetch()}
      />
    );
  }

  // Pide confirmación antes de eliminar y navega al listado si la baja se concreta; si el backend rechaza por stock, el toast de error ya lo informa (ver useDeleteInventoryItem)
  const handleDelete = (): void => {
    if (!window.confirm(`¿Eliminar el ítem ${item.partNumber} del pañol? Esta acción no se puede deshacer.`)) {
      return;
    }
    deleteItem(item.id, {
      onSuccess: () => navigate(ROUTES.INVENTORY),
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-5"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => navigate(ROUTES.INVENTORY)}
            aria-label="Volver al pañol"
          >
            <ArrowLeft size={18} />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold font-mono text-surface-900 dark:text-white">
                {item.partNumber}
              </h1>
              <StatusBadge type="inventory" status={item.status} />
            </div>
            <p className="text-sm text-surface-500">
              {INVENTORY_CATEGORY_LABELS[item.category]} · {item.manufacturer}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Edit size={14} />}
            onClick={() => navigate(buildRoute(ROUTES.INVENTORY_ITEM_EDIT, { id: item.id }))}
          >
            Editar
          </Button>
          <Button
            variant="destructive"
            size="sm"
            leftIcon={<Trash2 size={14} />}
            isLoading={isDeleting}
            onClick={handleDelete}
          >
            Eliminar
          </Button>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Descripción</CardTitle>
            </CardHeader>
            <CardBody>
              <p className="text-sm text-surface-700 dark:text-surface-300 leading-relaxed">
                {item.description}
              </p>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Historial de Movimientos</CardTitle>
            </CardHeader>
            <CardBody>
              <DataTable<InventoryMovement>
                data={movementsResult?.data ?? []}
                columns={MOVEMENT_COLUMNS}
                isLoading={isLoadingMovements}
                emptyMessage="Sin movimientos"
                emptyDescription="Este ítem todavía no tiene movimientos de stock registrados."
              />
            </CardBody>
          </Card>
        </div>

        <div className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle>Stock</CardTitle>
              <Package size={16} className="text-aviation-500" />
            </CardHeader>
            <CardBody>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-surface-500">Stock actual</dt>
                  <dd className="font-bold text-surface-900 dark:text-white">
                    {item.currentStock} {item.unit}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-surface-500">Stock mínimo</dt>
                  <dd className="text-surface-700 dark:text-surface-300">
                    {item.minimumStock} {item.unit}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-surface-500">Costo unitario</dt>
                  <dd className="text-surface-700 dark:text-surface-300">
                    {formatCurrency(item.unitCost)}
                  </dd>
                </div>
              </dl>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ubicación</CardTitle>
              <MapPin size={16} className="text-surface-400" />
            </CardHeader>
            <CardBody>
              <p className="text-sm font-mono text-surface-700 dark:text-surface-300">{item.location}</p>
            </CardBody>
          </Card>

          {item.certificationRequired && (
            <Card>
              <CardHeader>
                <CardTitle>Certificación</CardTitle>
              </CardHeader>
              <CardBody>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-surface-500">N° certificado</dt>
                    <dd className="text-surface-700 dark:text-surface-300">
                      {item.certificateNumber ?? '-'}
                    </dd>
                  </div>
                  {item.expiryDate && (
                    <div className="flex justify-between">
                      <dt className="text-surface-500">Vencimiento</dt>
                      <dd className="text-surface-700 dark:text-surface-300">
                        {formatDateTime(item.expiryDate)}
                      </dd>
                    </div>
                  )}
                </dl>
              </CardBody>
            </Card>
          )}
        </div>
      </div>
    </motion.div>
  );
}
