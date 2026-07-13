import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Save } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { Select } from '@/shared/components/ui/Select';
import { Card, CardHeader, CardTitle, CardBody } from '@/shared/components/ui/Card';
import { PageHeader } from '@/shared/components/PageHeader/PageHeader';
import { ROUTES, WORK_ORDER_TYPE_LABELS, WORK_ORDER_PRIORITY_LABELS, buildRoute } from '@/constants';
import type { SelectOption } from '@/types';
import { useCreateWorkOrder } from '../hooks/useWorkOrders';
import { useAircraft } from '@/modules/aircraft/hooks/useAircraft';

// Corregido: los valores del enum estaban en snake_case/minusculas y no coincidian con WorkOrderType/WorkOrderPriority reales (PascalCase), lo que impedia pasar "data" directamente a useCreateWorkOrder
const workOrderSchema = z.object({
  type: z.enum([
    'Inspeccion50h', 'Inspeccion100h', 'Inspeccion200h',
    'InspeccionAnual', 'Reparacion', 'Modificacion', 'AdCumplimiento', 'Servicio'
  ]),
  priority: z.enum(['Baja', 'Media', 'Alta', 'Critica']),
  aircraftId: z.string().min(1, 'Seleccionar aeronave'),
  description: z.string().min(10, 'Mínimo 10 caracteres'),
  estimatedHours: z.number().min(0.5, 'Mínimo 0.5 horas').max(999),
  estimatedEndDate: z.string().min(1, 'Fecha requerida'),
});

type WorkOrderFormData = z.infer<typeof workOrderSchema>;

const TYPE_OPTIONS: SelectOption[] = Object.entries(WORK_ORDER_TYPE_LABELS).map(
  ([value, label]) => ({ value, label })
);

const PRIORITY_OPTIONS: SelectOption[] = Object.entries(WORK_ORDER_PRIORITY_LABELS).map(
  ([value, label]) => ({ value, label })
);

export function WorkOrderNewPage(): JSX.Element {
  const navigate = useNavigate();

  // Trae aeronaves reales (pageSize alto para cubrir el combo completo) en vez del mock hardcodeado
  const { data: aircraftPage, isLoading: isLoadingAircraft } = useAircraft({}, 1, 100);
  const AIRCRAFT_OPTIONS: SelectOption[] = (aircraftPage?.data ?? []).map((aircraft) => ({
    value: aircraft.id,
    label: `${aircraft.registration} — ${aircraft.manufacturer} ${aircraft.model}`,
  }));

  const createWorkOrder = useCreateWorkOrder();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<WorkOrderFormData>({
    resolver: zodResolver(workOrderSchema),
    defaultValues: {
      priority: 'Media',
      estimatedHours: 6,
    },
  });

  // Antes simulaba el guardado con un setTimeout; ahora crea la OT con useCreateWorkOrder y navega a su detalle
  const onSubmit = async (data: WorkOrderFormData): Promise<void> => {
    const newOrder = await createWorkOrder.mutateAsync(data);
    navigate(buildRoute(ROUTES.WORK_ORDER_DETAIL, { id: newOrder.id }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-3xl"
    >
      <PageHeader
        title="Nueva Orden de Trabajo"
        description="Completá los datos para crear una nueva OT"
        actions={
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<ArrowLeft size={14} />}
            onClick={() => navigate(ROUTES.WORK_ORDERS)}
          >
            Volver
          </Button>
        }
      />

      <form onSubmit={(e) => void handleSubmit(onSubmit)(e)} noValidate>
        <div className="space-y-5">
          {/* Tipo y Prioridad */}
          <Card>
            <CardHeader>
              <CardTitle>Tipo de Trabajo</CardTitle>
            </CardHeader>
            <CardBody>
              <div className="grid gap-4 sm:grid-cols-2">
                <Select
                  label="Tipo de OT"
                  options={TYPE_OPTIONS}
                  placeholder="Seleccionar tipo"
                  error={errors.type?.message}
                  required
                  {...register('type')}
                />
                <Select
                  label="Prioridad"
                  options={PRIORITY_OPTIONS}
                  error={errors.priority?.message}
                  required
                  {...register('priority')}
                />
              </div>
            </CardBody>
          </Card>

          {/* Aeronave */}
          <Card>
            <CardHeader>
              <CardTitle>Aeronave</CardTitle>
            </CardHeader>
            <CardBody>
              <Select
                label="Seleccionar aeronave"
                options={AIRCRAFT_OPTIONS}
                placeholder={isLoadingAircraft ? 'Cargando aeronaves...' : 'Seleccionar aeronave'}
                error={errors.aircraftId?.message}
                disabled={isLoadingAircraft}
                required
                {...register('aircraftId')}
              />
            </CardBody>
          </Card>

          {/* Detalles */}
          <Card>
            <CardHeader>
              <CardTitle>Detalles</CardTitle>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-surface-700 dark:text-surface-300">
                    Descripción del trabajo <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Describí el trabajo a realizar..."
                    className="w-full resize-none rounded-lg border border-surface-300 bg-white px-3 py-2 text-sm outline-none placeholder:text-surface-400 focus:border-aviation-500 focus:ring-2 focus:ring-aviation-500/20 dark:border-surface-600 dark:bg-surface-800 dark:text-white"
                    {...register('description')}
                  />
                  {errors.description && (
                    <p className="mt-1 text-xs text-red-600">{errors.description.message}</p>
                  )}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    type="number"
                    label="Horas estimadas"
                    step="0.5"
                    min="0.5"
                    error={errors.estimatedHours?.message}
                    required
                    {...register('estimatedHours', { valueAsNumber: true })}
                  />
                  <Input
                    type="date"
                    label="Fecha límite"
                    error={errors.estimatedEndDate?.message}
                    required
                    {...register('estimatedEndDate')}
                  />
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Acciones */}
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(ROUTES.WORK_ORDERS)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              isLoading={isSubmitting || createWorkOrder.isPending}
              leftIcon={<Save size={15} />}
            >
              Crear OT
            </Button>
          </div>
        </div>
      </form>
    </motion.div>
  );
}
