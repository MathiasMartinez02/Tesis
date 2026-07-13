import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Save } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { Card, CardHeader, CardTitle, CardBody } from '@/shared/components/ui/Card';
import { PageHeader } from '@/shared/components/PageHeader/PageHeader';
import { PageLoader } from '@/shared/components/PageLoader/PageLoader';
import { ErrorState } from '@/shared/components/ErrorState/ErrorState';
import { ROUTES, buildRoute, INVENTORY_CATEGORY_LABELS } from '@/constants';
import { useInventoryItem, useUpdateInventoryItem } from '@/modules/inventory/hooks/useInventory';

// MODIFICADO: se agrega el campo opcional maximumStock, con validacion de que si se informa debe ser mayor a minimumStock
// ANTERIOR: solo incluia description, location, minimumStock, unitCost, certificateNumber, expiryDate
const editSchema = z
  .object({
    description: z.string().min(5, 'Mínimo 5 caracteres'),
    location: z.string().min(1, 'Requerido'),
    minimumStock: z.number().min(0),
    // El input numerico vacio llega como NaN via valueAsNumber; se normaliza a undefined antes de validar
    maximumStock: z.preprocess(
      (val) => (typeof val === 'number' && Number.isNaN(val) ? undefined : val),
      z.number().min(0).optional()
    ),
    unitCost: z.number().min(0),
    certificateNumber: z.string().optional(),
    expiryDate: z.string().optional(),
  })
  .refine(
    (data) => data.maximumStock === undefined || data.maximumStock > data.minimumStock,
    { message: 'El stock máximo debe ser mayor al stock mínimo', path: ['maximumStock'] }
  );

type EditFormData = z.infer<typeof editSchema>;

// Página de edición de un ítem de inventario: precarga los datos con useInventoryItem y guarda con useUpdateInventoryItem
export function InventoryItemEditPage(): JSX.Element {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: item, isLoading, isError, refetch } = useInventoryItem(id ?? '');
  const { mutate: updateItem, isPending } = useUpdateInventoryItem();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditFormData>({
    resolver: zodResolver(editSchema),
  });

  // MODIFICADO: incluye maximumStock al precargar el formulario con los datos del item
  // ANTERIOR: solo precargaba description, location, minimumStock, unitCost, certificateNumber, expiryDate
  useEffect(() => {
    if (item) {
      reset({
        description: item.description,
        location: item.location,
        minimumStock: item.minimumStock,
        maximumStock: item.maximumStock,
        unitCost: item.unitCost,
        certificateNumber: item.certificateNumber ?? '',
        expiryDate: item.expiryDate ? item.expiryDate.split('T')[0] : '',
      });
    }
  }, [item, reset]);

  if (isLoading) return <PageLoader />;
  if (isError || !item) {
    return <ErrorState title="Ítem no encontrado" onRetry={() => void refetch()} />;
  }

  const detailRoute = buildRoute(ROUTES.INVENTORY_ITEM_DETAIL, { id: item.id });

  const onSubmit = (data: EditFormData): void => {
    updateItem(
      { id: item.id, payload: data },
      { onSuccess: () => navigate(detailRoute) }
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-3xl"
    >
      <PageHeader
        title={`Editar ${item.partNumber}`}
        description={INVENTORY_CATEGORY_LABELS[item.category]}
        actions={
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<ArrowLeft size={14} />}
            onClick={() => navigate(detailRoute)}
          >
            Volver
          </Button>
        }
      />

      <form onSubmit={(e) => void handleSubmit(onSubmit)(e)} noValidate>
        <div className="space-y-5">
          {/* Info de solo lectura */}
          <Card>
            <CardHeader>
              <CardTitle>Identificación</CardTitle>
            </CardHeader>
            <CardBody>
              <div className="grid gap-3 sm:grid-cols-2 text-sm">
                <div>
                  <p className="text-surface-400 text-xs font-semibold uppercase tracking-wide mb-1">N° Parte</p>
                  <p className="font-mono font-bold text-aviation-600">{item.partNumber}</p>
                </div>
                <div>
                  <p className="text-surface-400 text-xs font-semibold uppercase tracking-wide mb-1">Fabricante</p>
                  <p className="font-medium text-surface-900 dark:text-white">{item.manufacturer}</p>
                </div>
                <div>
                  <p className="text-surface-400 text-xs font-semibold uppercase tracking-wide mb-1">Stock actual</p>
                  <p className="text-surface-700 dark:text-surface-300">{item.currentStock} {item.unit}</p>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Campos editables */}
          <Card>
            <CardHeader>
              <CardTitle>Datos del Ítem</CardTitle>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                <Input
                  label="Descripción"
                  error={errors.description?.message}
                  required
                  {...register('description')}
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    label="Ubicación en pañol"
                    error={errors.location?.message}
                    required
                    {...register('location')}
                  />
                  <Input
                    type="number"
                    label="Stock mínimo"
                    min="0"
                    error={errors.minimumStock?.message}
                    required
                    {...register('minimumStock', { valueAsNumber: true })}
                  />
                  <Input
                    type="number"
                    label="Stock máximo (opcional)"
                    min="0"
                    error={errors.maximumStock?.message}
                    {...register('maximumStock', { valueAsNumber: true })}
                  />
                  <Input
                    type="number"
                    label="Costo unitario ($)"
                    min="0"
                    step="0.01"
                    error={errors.unitCost?.message}
                    required
                    {...register('unitCost', { valueAsNumber: true })}
                  />
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Certificación */}
          <Card>
            <CardHeader>
              <CardTitle>Certificación y Vencimiento</CardTitle>
            </CardHeader>
            <CardBody>
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Número de certificado"
                  placeholder="N° certificado ANAC"
                  error={errors.certificateNumber?.message}
                  {...register('certificateNumber')}
                />
                <Input
                  type="date"
                  label="Fecha de vencimiento (opcional)"
                  error={errors.expiryDate?.message}
                  {...register('expiryDate')}
                />
              </div>
            </CardBody>
          </Card>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => navigate(detailRoute)}>
              Cancelar
            </Button>
            <Button type="submit" isLoading={isPending} leftIcon={<Save size={15} />}>
              Guardar Cambios
            </Button>
          </div>
        </div>
      </form>
    </motion.div>
  );
}
