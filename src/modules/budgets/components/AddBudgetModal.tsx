import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FileText } from 'lucide-react';
import { Modal } from '@/shared/components/Modal/Modal';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { Select } from '@/shared/components/ui/Select';
import { useCreateBudget } from '../hooks/useBudgets';
import { useClients } from '@/modules/clients/hooks/useClients';
import { useAircraft } from '@/modules/aircraft/hooks/useAircraft';
import type { SelectOption } from '@/types';

// Esquema de validacion: cliente y descripcion requeridos, monto mayor a cero, aeronave opcional
const budgetSchema = z.object({
  clientId: z.string().min(1, 'Seleccionar cliente'),
  aircraftId: z.string().optional(),
  description: z.string().min(1, 'La descripción es requerida'),
  amount: z.coerce.number().positive('El monto debe ser mayor a cero'),
  notes: z.string().optional(),
});

type BudgetFormData = z.infer<typeof budgetSchema>;

interface AddBudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Modal de alta de un presupuesto: el vencimiento a 30 días y el estado inicial (Pendiente) los calcula el backend
export function AddBudgetModal({ isOpen, onClose }: AddBudgetModalProps): JSX.Element {
  const createBudget = useCreateBudget();

  const { data: clientsPage, isLoading: isLoadingClients } = useClients({}, 1, 100);
  const CLIENT_OPTIONS: SelectOption[] = (clientsPage?.data ?? []).map((client) => ({
    value: client.id,
    label: client.name,
  }));

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<BudgetFormData>({
    resolver: zodResolver(budgetSchema),
    defaultValues: { clientId: '', aircraftId: '', description: '', amount: 0, notes: '' },
  });

  // Limpia el formulario cada vez que se abre el modal
  useEffect(() => {
    if (isOpen) {
      reset({ clientId: '', aircraftId: '', description: '', amount: 0, notes: '' });
    }
  }, [isOpen, reset]);

  const selectedClientId = watch('clientId');

  // Trae las aeronaves del cliente seleccionado para el select opcional de aeronave
  const { data: aircraftPage, isLoading: isLoadingAircraft } = useAircraft(
    selectedClientId ? { clientId: selectedClientId } : {},
    1,
    100
  );
  const AIRCRAFT_OPTIONS: SelectOption[] = (aircraftPage?.data ?? []).map((aircraft) => ({
    value: aircraft.id,
    label: `${aircraft.registration} — ${aircraft.manufacturer} ${aircraft.model}`,
  }));

  // Envía el presupuesto nuevo mediante useCreateBudget y cierra el modal si se guarda con éxito
  const onSubmit = async (data: BudgetFormData): Promise<void> => {
    await createBudget.mutateAsync({
      clientId: data.clientId,
      aircraftId: data.aircraftId || null,
      description: data.description,
      amount: data.amount,
      notes: data.notes?.trim() ? data.notes : null,
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Nuevo Presupuesto"
      description="Válido por 30 días desde la fecha de creación"
      size="sm"
      footer={
        <>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            type="submit"
            form="add-budget-form"
            isLoading={createBudget.isPending}
            leftIcon={<FileText size={15} />}
          >
            Crear Presupuesto
          </Button>
        </>
      }
    >
      <form id="add-budget-form" onSubmit={(e) => void handleSubmit(onSubmit)(e)} noValidate className="space-y-4">
        <Select
          label="Cliente"
          options={CLIENT_OPTIONS}
          placeholder={isLoadingClients ? 'Cargando clientes...' : 'Seleccionar cliente'}
          error={errors.clientId?.message}
          disabled={isLoadingClients}
          required
          {...register('clientId')}
        />
        <Select
          label="Aeronave (opcional)"
          options={AIRCRAFT_OPTIONS}
          placeholder={
            !selectedClientId
              ? 'Seleccioná primero un cliente'
              : isLoadingAircraft
                ? 'Cargando aeronaves...'
                : 'Sin aeronave asociada'
          }
          error={errors.aircraftId?.message}
          disabled={isLoadingAircraft || !selectedClientId}
          {...register('aircraftId')}
        />
        <div>
          <label className="mb-1.5 block text-sm font-medium text-surface-700 dark:text-surface-300">
            Descripción del trabajo presupuestado
          </label>
          <textarea
            rows={3}
            placeholder="Detalle del trabajo a presupuestar..."
            className="w-full resize-none rounded-lg border border-surface-300 bg-white px-3 py-2 text-sm outline-none placeholder:text-surface-400 focus:border-aviation-500 focus:ring-2 focus:ring-aviation-500/20 dark:border-surface-600 dark:bg-surface-800 dark:text-white"
            {...register('description')}
          />
          {errors.description && <p className="mt-1 text-xs text-red-600">{errors.description.message}</p>}
        </div>
        <Input
          type="number"
          step="0.01"
          label="Monto"
          placeholder="0.00"
          error={errors.amount?.message}
          required
          {...register('amount')}
        />
        <Input label="Notas (opcional)" placeholder="Observaciones adicionales" {...register('notes')} />
      </form>
    </Modal>
  );
}
