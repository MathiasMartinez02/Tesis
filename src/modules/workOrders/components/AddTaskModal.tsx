import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ListPlus } from 'lucide-react';
import { Modal } from '@/shared/components/Modal/Modal';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { useAddWorkOrderTask } from '../hooks/useWorkOrders';

// Esquema de validacion del alta de tarea: titulo/descripcion obligatorios, horas estimadas > 0
const addTaskSchema = z.object({
  title: z.string().min(1, 'Título requerido'),
  description: z.string().min(1, 'Descripción requerida'),
  estimatedHours: z.coerce.number().positive('Debe ser mayor a cero'),
  requiresInspection: z.boolean().default(false),
});

type AddTaskFormData = z.infer<typeof addTaskSchema>;

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  workOrderId: string;
}

// Modal para agregar una tarea nueva a una OT existente (Fase 8: la UI faltaba, el hook ya existia)
export function AddTaskModal({ isOpen, onClose, workOrderId }: AddTaskModalProps): JSX.Element {
  const { mutate: addTask, isPending } = useAddWorkOrderTask();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AddTaskFormData>({
    resolver: zodResolver(addTaskSchema),
    defaultValues: { requiresInspection: false },
  });

  // Envia el alta de la tarea, invalida la query de la OT (ya lo hace el hook) y cierra el modal al terminar
  const onSubmit = (data: AddTaskFormData): void => {
    addTask(
      { id: workOrderId, payload: data },
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
      title="Agregar Tarea"
      description="Agregá una tarea nueva a esta orden de trabajo"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            leftIcon={<ListPlus size={15} />}
            isLoading={isSubmitting || isPending}
            onClick={(e) => {
              e.preventDefault();
              void handleSubmit(onSubmit)();
            }}
          >
            Agregar
          </Button>
        </>
      }
    >
      <form className="space-y-4" onSubmit={(e) => void handleSubmit(onSubmit)(e)} noValidate>
        <Input label="Título" error={errors.title?.message} required {...register('title')} />
        <div>
          <label className="mb-1.5 block text-sm font-medium text-surface-700 dark:text-surface-300">
            Descripción <span className="text-red-500">*</span>
          </label>
          <textarea
            rows={3}
            className="w-full resize-none rounded-lg border border-surface-300 bg-white px-3 py-2 text-sm outline-none placeholder:text-surface-400 focus:border-aviation-500 focus:ring-2 focus:ring-aviation-500/20 dark:border-surface-600 dark:bg-surface-800 dark:text-white"
            {...register('description')}
          />
          {errors.description?.message && (
            <p className="mt-1 text-xs text-red-500">{errors.description.message}</p>
          )}
        </div>
        <Input
          type="number"
          step="0.5"
          label="Horas estimadas"
          error={errors.estimatedHours?.message}
          required
          {...register('estimatedHours')}
        />
        <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-surface-700 dark:text-surface-300">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-surface-300 text-aviation-600 focus:ring-aviation-500"
            {...register('requiresInspection')}
          />
          Requiere inspección
        </label>
      </form>
    </Modal>
  );
}
