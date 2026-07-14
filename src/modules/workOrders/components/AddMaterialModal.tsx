import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PackagePlus } from 'lucide-react';
import { Modal } from '@/shared/components/Modal/Modal';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { useAddWorkOrderMaterial } from '../hooks/useWorkOrders';

// Esquema de validacion del alta de material: numero de parte/descripcion/unidad obligatorios, cantidad > 0
const addMaterialSchema = z.object({
  partNumber: z.string().min(1, 'Número de parte requerido'),
  description: z.string().min(1, 'Descripción requerida'),
  quantity: z.coerce.number().positive('Debe ser mayor a cero'),
  unit: z.string().min(1, 'Unidad requerida'),
});

type AddMaterialFormData = z.infer<typeof addMaterialSchema>;

interface AddMaterialModalProps {
  isOpen: boolean;
  onClose: () => void;
  workOrderId: string;
}

// Modal para pedir un material/repuesto nuevo para una OT (Fase 8: WorkOrderMaterial no tenia UI ni endpoint)
export function AddMaterialModal({ isOpen, onClose, workOrderId }: AddMaterialModalProps): JSX.Element {
  const { mutate: addMaterial, isPending } = useAddWorkOrderMaterial();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AddMaterialFormData>({
    resolver: zodResolver(addMaterialSchema),
  });

  // Envia el alta del material, invalida la query de la OT (ya lo hace el hook) y cierra el modal al terminar
  const onSubmit = (data: AddMaterialFormData): void => {
    addMaterial(
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
      title="Pedir Material"
      description="Registrá un material o repuesto necesario para esta orden de trabajo"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            leftIcon={<PackagePlus size={15} />}
            isLoading={isSubmitting || isPending}
            onClick={(e) => {
              e.preventDefault();
              void handleSubmit(onSubmit)();
            }}
          >
            Pedir
          </Button>
        </>
      }
    >
      <form className="space-y-4" onSubmit={(e) => void handleSubmit(onSubmit)(e)} noValidate>
        <Input
          label="Número de parte"
          error={errors.partNumber?.message}
          required
          {...register('partNumber')}
        />
        <Input
          label="Descripción"
          error={errors.description?.message}
          required
          {...register('description')}
        />
        <div className="grid grid-cols-2 gap-3">
          <Input
            type="number"
            step="0.01"
            label="Cantidad"
            error={errors.quantity?.message}
            required
            {...register('quantity')}
          />
          <Input
            label="Unidad"
            placeholder="unidad, litro, kg..."
            error={errors.unit?.message}
            required
            {...register('unit')}
          />
        </div>
      </form>
    </Modal>
  );
}
