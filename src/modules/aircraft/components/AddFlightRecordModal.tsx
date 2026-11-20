import { useEffect, useId } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PlaneTakeoff } from 'lucide-react';
import { Modal } from '@/shared/components/Modal/Modal';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { todayLocal } from '@/lib/utils';
import { flightRecordSchema, type FlightRecordFormData } from '../schemas/aircraft.schema';
import { useAddFlightRecord } from '../hooks/useAircraft';

interface AddFlightRecordModalProps {
  aircraftId: string;
  isOpen: boolean;
  onClose: () => void;
}

// Registro de un vuelo; suma horas y aterrizajes a la aeronave
export function AddFlightRecordModal({ aircraftId, isOpen, onClose }: AddFlightRecordModalProps): JSX.Element {
  const formId = useId();
  const addFlight = useAddFlightRecord(aircraftId);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FlightRecordFormData>({ resolver: zodResolver(flightRecordSchema) });

  useEffect(() => {
    if (isOpen) {
      reset({ date: todayLocal(), duration: undefined, landings: 1, pilot: '', origin: '', destination: '', notes: '' });
    }
  }, [isOpen, reset]);

  // Envia el vuelo y cierra el modal si se registro
  const submit = async (values: FlightRecordFormData): Promise<void> => {
    await addFlight.mutateAsync(values);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Registrar vuelo"
      description="Las horas y aterrizajes se suman a los totales de la aeronave"
      size="sm"
      footer={
        <>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" form={formId} isLoading={addFlight.isPending} leftIcon={<PlaneTakeoff size={15} />}>
            Registrar
          </Button>
        </>
      }
    >
      <form id={formId} onSubmit={(e) => void handleSubmit(submit)(e).catch(() => undefined)} noValidate className="space-y-4">
        <Input type="date" label="Fecha" error={errors.date?.message} required {...register('date')} />
        <div className="grid grid-cols-2 gap-3">
          <Input type="number" step="0.1" min="0" label="Duración (h)" error={errors.duration?.message} required {...register('duration')} />
          <Input type="number" step="1" min="0" label="Aterrizajes" error={errors.landings?.message} required {...register('landings')} />
        </div>
        <Input label="Piloto" error={errors.pilot?.message} required {...register('pilot')} />
        <div className="grid grid-cols-2 gap-3">
          <Input label="Origen" placeholder="SACO" error={errors.origin?.message} required {...register('origin')} />
          <Input label="Destino" placeholder="SAAR" error={errors.destination?.message} required {...register('destination')} />
        </div>
        <Input label="Notas (opcional)" error={errors.notes?.message} {...register('notes')} />
      </form>
    </Modal>
  );
}
