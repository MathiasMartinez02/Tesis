import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Save, Wrench, X, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { Select } from '@/shared/components/ui/Select';
import { Card, CardHeader, CardTitle, CardBody } from '@/shared/components/ui/Card';
import { PageHeader } from '@/shared/components/PageHeader/PageHeader';
import { StatusBadge } from '@/shared/components/StatusBadge/StatusBadge';
import { PageLoader } from '@/shared/components/PageLoader/PageLoader';
import { ErrorState } from '@/shared/components/ErrorState/ErrorState';
import { ROUTES, WORK_ORDER_TYPE_LABELS, WORK_ORDER_PRIORITY_LABELS, buildRoute } from '@/constants';
import { useWorkOrder, useUpdateWorkOrderFull } from '../hooks/useWorkOrders';
import { useUsers } from '@/hooks/useUsers';
import type { SelectOption, AssignedMechanic } from '@/types';

const editSchema = z.object({
  priority: z.enum(['Baja', 'Media', 'Alta', 'Critica']),
  description: z.string().min(10, 'Mínimo 10 caracteres'),
  estimatedHours: z.number().min(0.5, 'Mínimo 0.5 horas').max(999),
  estimatedEndDate: z.string().min(1, 'Fecha requerida'),
});

type EditFormData = z.infer<typeof editSchema>;

const PRIORITY_OPTIONS: SelectOption[] = Object.entries(WORK_ORDER_PRIORITY_LABELS).map(
  ([value, label]) => ({ value, label })
);

export function WorkOrderEditPage(): JSX.Element {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: order, isLoading, isError, refetch } = useWorkOrder(id ?? '');
  const { mutate: updateOrder, isPending } = useUpdateWorkOrderFull();

  // Fetch mechanics and workshop chiefs from the real users API
  const { data: usersData } = useUsers({ isActive: true });
  const allPersonnel = usersData?.data ?? [];
  const mechanicPool = allPersonnel.filter(
    (u) => u.role === 'Mecanico' || u.role === 'JefeTaller'
  );

  const [mechanics, setMechanics] = useState<AssignedMechanic[]>([]);
  const [originalMechanicIds, setOriginalMechanicIds] = useState<string[]>([]);
  const [selectedMechanicId, setSelectedMechanicId] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditFormData>({
    resolver: zodResolver(editSchema),
  });

  useEffect(() => {
    if (order) {
      reset({
        priority: order.priority,
        description: order.description,
        estimatedHours: order.estimatedHours,
        estimatedEndDate: order.estimatedEndDate
          ? order.estimatedEndDate.split('T')[0]
          : '',
      });
      const assigned = order.assignedMechanics ?? [];
      setMechanics(assigned);
      setOriginalMechanicIds(assigned.map((m) => m.userId));
    }
  }, [order, reset]);

  if (isLoading) return <PageLoader />;
  if (isError || !order) {
    return <ErrorState title="Orden no encontrada" onRetry={() => void refetch()} />;
  }

  const detailRoute = buildRoute(ROUTES.WORK_ORDER_DETAIL, { id: order.id });

  const handleAddMechanic = (): void => {
    if (!selectedMechanicId) return;
    if (mechanics.some((m) => m.userId === selectedMechanicId)) return;
    const found = mechanicPool.find((u) => u.id === selectedMechanicId);
    if (!found) return;
    setMechanics((prev) => [
      ...prev,
      {
        userId: found.id,
        userName: found.fullName,
        role: found.role,
        assignedAt: new Date().toISOString(),
      },
    ]);
    setSelectedMechanicId('');
  };

  const handleRemoveMechanic = (userId: string): void => {
    setMechanics((prev) => prev.filter((m) => m.userId !== userId));
  };

  const onSubmit = (data: EditFormData): void => {
    updateOrder(
      {
        id: order.id,
        payload: {
          description: data.description,
          estimatedHours: data.estimatedHours,
          estimatedEndDate: data.estimatedEndDate,
          priority: data.priority,
        },
        originalMechanicIds,
        newMechanics: mechanics,
      },
      { onSuccess: () => navigate(detailRoute) }
    );
  };

  const availableMechanics = mechanicPool.filter(
    (u) => !mechanics.some((m) => m.userId === u.id)
  );

  const ROLE_LABELS: Record<string, string> = {
    Mecanico: 'Mecánico',
    JefeTaller: 'Jefe de Taller',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-3xl"
    >
      <PageHeader
        title={`Editar ${order.number}`}
        description={`${order.aircraftRegistration} · ${order.clientName}`}
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
                  <p className="text-surface-400 text-xs font-semibold uppercase tracking-wide mb-1">N° OT</p>
                  <p className="font-mono font-bold text-aviation-600">{order.number}</p>
                </div>
                <div>
                  <p className="text-surface-400 text-xs font-semibold uppercase tracking-wide mb-1">Estado</p>
                  <StatusBadge type="workOrder" status={order.status} />
                </div>
                <div>
                  <p className="text-surface-400 text-xs font-semibold uppercase tracking-wide mb-1">Tipo de trabajo</p>
                  <p className="text-sm font-medium text-surface-900 dark:text-white">
                    {WORK_ORDER_TYPE_LABELS[order.type] ?? order.type}
                  </p>
                </div>
                <div>
                  <p className="text-surface-400 text-xs font-semibold uppercase tracking-wide mb-1">Aeronave</p>
                  <p className="font-semibold text-surface-900 dark:text-white">
                    {order.aircraftRegistration} — {order.aircraftModel}
                  </p>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-surface-400 text-xs font-semibold uppercase tracking-wide mb-1">Cliente</p>
                  <p className="text-surface-700 dark:text-surface-300">{order.clientName}</p>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Prioridad, horas y fecha */}
          <Card>
            <CardHeader>
              <CardTitle>Parámetros de Trabajo</CardTitle>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                <Select
                  label="Prioridad"
                  options={PRIORITY_OPTIONS}
                  error={errors.priority?.message}
                  required
                  {...register('priority')}
                />
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

          {/* Descripción */}
          <Card>
            <CardHeader>
              <CardTitle>Descripción</CardTitle>
            </CardHeader>
            <CardBody>
              <label className="mb-1.5 block text-sm font-medium text-surface-700 dark:text-surface-300">
                Descripción del trabajo <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={4}
                className="w-full resize-none rounded-lg border border-surface-300 bg-white px-3 py-2 text-sm outline-none placeholder:text-surface-400 focus:border-aviation-500 focus:ring-2 focus:ring-aviation-500/20 dark:border-surface-600 dark:bg-surface-800 dark:text-white"
                {...register('description')}
              />
              {errors.description && (
                <p className="mt-1 text-xs text-red-600">{errors.description.message}</p>
              )}
            </CardBody>
          </Card>

          {/* Mecánicos asignados */}
          <Card>
            <CardHeader>
              <CardTitle>Mecánicos Asignados</CardTitle>
              <Wrench size={16} className="text-amber-500" />
            </CardHeader>
            <CardBody>
              <div className="space-y-3">
                {/* Lista de mecánicos actuales */}
                {mechanics.length > 0 && (
                  <div className="space-y-2">
                    {mechanics.map((m) => (
                      <div
                        key={m.userId}
                        className="flex items-center justify-between rounded-lg border border-surface-200 bg-surface-50 px-3 py-2 dark:border-surface-700 dark:bg-surface-800/50"
                      >
                        <div>
                          <span className="text-sm font-medium text-surface-900 dark:text-white">
                            {m.userName}
                          </span>
                          <span className="ml-2 text-xs text-surface-400">
                            {ROLE_LABELS[m.role] ?? m.role}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveMechanic(m.userId)}
                          className="rounded p-1 text-surface-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                          aria-label={`Quitar a ${m.userName}`}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {mechanics.length === 0 && (
                  <p className="text-sm text-surface-400 italic">Sin mecánicos asignados</p>
                )}

                {/* Agregar mecánico */}
                {availableMechanics.length > 0 && (
                  <div className="flex gap-2 pt-1">
                    <select
                      value={selectedMechanicId}
                      onChange={(e) => setSelectedMechanicId(e.target.value)}
                      className="flex-1 rounded-lg border border-surface-300 bg-white px-3 py-2 text-sm outline-none focus:border-aviation-500 focus:ring-2 focus:ring-aviation-500/20 dark:border-surface-600 dark:bg-surface-800 dark:text-white"
                    >
                      <option value="">Agregar mecánico...</option>
                      {availableMechanics.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.fullName} — {ROLE_LABELS[u.role] ?? u.role}
                        </option>
                      ))}
                    </select>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      leftIcon={<Plus size={14} />}
                      onClick={handleAddMechanic}
                      disabled={!selectedMechanicId}
                    >
                      Agregar
                    </Button>
                  </div>
                )}
              </div>
            </CardBody>
          </Card>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => navigate(detailRoute)}>
              Cancelar
            </Button>
            <Button
              type="submit"
              isLoading={isPending}
              leftIcon={<Save size={15} />}
            >
              Guardar cambios
            </Button>
          </div>
        </div>
      </form>
    </motion.div>
  );
}
