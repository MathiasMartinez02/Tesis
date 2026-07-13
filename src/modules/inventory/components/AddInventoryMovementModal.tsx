import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowRightLeft } from 'lucide-react';
import { Modal } from '@/shared/components/Modal/Modal';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { Select } from '@/shared/components/ui/Select';
import { useAddInventoryMovement } from '../hooks/useInventory';
import { useWorkOrders } from '@/modules/workOrders/hooks/useWorkOrders';
import { MOVEMENT_TYPE_LABELS } from '@/constants';
import type { SelectOption, MovementType } from '@/types';

// Estados de OT que se consideran activos a efectos de asociar una salida de inventario
const ACTIVE_WORK_ORDER_STATUSES = new Set(['Pendiente', 'EnProceso', 'EnInspeccion']);

const MOVEMENT_TYPE_OPTIONS: SelectOption[] = Object.entries(MOVEMENT_TYPE_LABELS).map(
  ([value, label]) => ({ value, label })
);

// Esquema del formulario de registro de movimiento: tipo, cantidad, motivo y OT asociada (opcional, solo aplica a Salida)
const movementSchema = z.object({
  type: z.enum(['Entrada', 'Salida', 'Reserva', 'Devolucion', 'Ajuste']),
  quantity: z.number().min(1, 'Debe ser mayor a 0'),
  reason: z.string().min(3, 'Mínimo 3 caracteres'),
  workOrderId: z.string().optional(),
});

type MovementFormData = z.infer<typeof movementSchema>;

interface AddInventoryMovementModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemId: string;
}

// Modal para registrar un movimiento de stock (entrada/salida/ajuste/devolucion/reserva) sobre un item de inventario
export function AddInventoryMovementModal({
  isOpen,
  onClose,
  itemId,
}: AddInventoryMovementModalProps): JSX.Element {
  const { mutate: addMovement, isPending } = useAddInventoryMovement();
  const { data: workOrdersResult } = useWorkOrders({}, 1, 100);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<MovementFormData>({
    resolver: zodResolver(movementSchema),
    defaultValues: { type: 'Entrada', quantity: 1 },
  });

  const selectedType = watch('type');

  const workOrderOptions: SelectOption[] = (workOrdersResult?.data ?? [])
    .filter((wo) => ACTIVE_WORK_ORDER_STATUSES.has(wo.status))
    .map((wo) => ({ value: wo.id, label: `${wo.number} — ${wo.aircraftRegistration}` }));

  // Envía el movimiento con useAddInventoryMovement; al terminar limpia el formulario y cierra el modal (la invalidación de queries la hace el hook)
  const onSubmit = (data: MovementFormData): void => {
    addMovement(
      {
        id: itemId,
        payload: {
          type: data.type as MovementType,
          quantity: data.quantity,
          reason: data.reason,
          workOrderId: data.type === 'Salida' ? data.workOrderId || undefined : undefined,
        },
      },
      {
        onSuccess: () => {
          reset();
          onClose();
        },
      }
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Registrar Movimiento"
      description="Registrá un ingreso, egreso o ajuste de stock para este ítem"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            leftIcon={<ArrowRightLeft size={15} />}
            isLoading={isSubmitting || isPending}
            onClick={(e) => {
              e.preventDefault();
              void handleSubmit(onSubmit)();
            }}
          >
            Registrar
          </Button>
        </>
      }
    >
      <form className="space-y-4" onSubmit={(e) => void handleSubmit(onSubmit)(e)} noValidate>
        <Select
          label="Tipo de movimiento"
          options={MOVEMENT_TYPE_OPTIONS}
          error={errors.type?.message}
          required
          {...register('type')}
        />
        <Input
          type="number"
          label="Cantidad"
          min="1"
          error={errors.quantity?.message}
          required
          {...register('quantity', { valueAsNumber: true })}
        />
        <Input
          label="Motivo / razón"
          placeholder="Ej. Consumo en OT, ajuste de inventario físico, etc."
          error={errors.reason?.message}
          required
          {...register('reason')}
        />
        {selectedType === 'Salida' && (
          <Select
            label="Orden de trabajo asociada (opcional)"
            options={workOrderOptions}
            placeholder="Seleccionar OT"
            error={errors.workOrderId?.message}
            {...register('workOrderId')}
          />
        )}
      </form>
    </Modal>
  );
}
