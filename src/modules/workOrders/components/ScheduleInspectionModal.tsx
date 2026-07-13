import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQueryClient } from '@tanstack/react-query';
import { CalendarCheck } from 'lucide-react';
import { Modal } from '@/shared/components/Modal/Modal';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { Select } from '@/shared/components/ui/Select';
import { useUsers } from '@/modules/settings/hooks/useUsers';
import { useCreateInspection } from '@/modules/inspections/hooks/useInspections';
import { WORK_ORDERS_QUERY_KEY } from '@/modules/workOrders/hooks/useWorkOrders';
import type { SelectOption } from '@/types';

// Esquema de validación del modal: solo pide fecha programada e inspector (opcional)
const scheduleInspectionSchema = z.object({
  scheduledDate: z.string().min(1, 'Fecha requerida'),
  inspectorId: z.string().optional(),
});

type ScheduleInspectionFormData = z.infer<typeof scheduleInspectionSchema>;

interface ScheduleInspectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  workOrderId: string;
}

// Modal para programar una inspección sobre una OT existente: pide fecha e inspector, el resto lo deriva el backend de la OT
export function ScheduleInspectionModal({
  isOpen,
  onClose,
  workOrderId,
}: ScheduleInspectionModalProps): JSX.Element {
  // Trae usuarios con rol Inspector para poblar el select
  const { data: usersResult, isLoading: isLoadingInspectors } = useUsers(
    { role: 'Inspector' },
    1,
    100
  );
  const { mutate: createInspection, isPending } = useCreateInspection();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ScheduleInspectionFormData>({
    resolver: zodResolver(scheduleInspectionSchema),
  });

  const inspectorOptions: SelectOption[] = (usersResult?.data ?? []).map((u) => ({
    value: u.id,
    label: `${u.firstName} ${u.lastName}`,
  }));

  // Envía el alta de la inspección con el payload reducido (workOrderId, scheduledDate, inspectorId), invalida la query de la OT y cierra el modal al terminar
  const onSubmit = (data: ScheduleInspectionFormData): void => {
    createInspection(
      {
        workOrderId,
        scheduledDate: data.scheduledDate,
        inspectorId: data.inspectorId || undefined,
      },
      {
        onSuccess: () => {
          void queryClient.invalidateQueries({ queryKey: [...WORK_ORDERS_QUERY_KEY, workOrderId] });
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
      title="Programar Inspección"
      description="Programá una inspección para esta orden de trabajo"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            leftIcon={<CalendarCheck size={15} />}
            isLoading={isSubmitting || isPending}
            onClick={(e) => {
              e.preventDefault();
              void handleSubmit(onSubmit)();
            }}
          >
            Programar
          </Button>
        </>
      }
    >
      <form className="space-y-4" onSubmit={(e) => void handleSubmit(onSubmit)(e)} noValidate>
        <Input
          type="date"
          label="Fecha programada"
          error={errors.scheduledDate?.message}
          required
          {...register('scheduledDate')}
        />
        <Select
          label="Inspector responsable"
          options={inspectorOptions}
          placeholder={isLoadingInspectors ? 'Cargando inspectores...' : 'Seleccionar inspector'}
          error={errors.inspectorId?.message}
          {...register('inspectorId')}
        />
      </form>
    </Modal>
  );
}
