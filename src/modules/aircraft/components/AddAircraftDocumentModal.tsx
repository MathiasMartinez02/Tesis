import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { aircraftDocumentSchema, type AircraftDocumentFormData } from '../schemas/aircraft.schema';
import { UploadCloud } from 'lucide-react';
import { Modal } from '@/shared/components/Modal/Modal';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { useAddAircraftDocument } from '../hooks/useAircraft';

interface AddAircraftDocumentModalProps {
  aircraftId: string;
  isOpen: boolean;
  onClose: () => void;
}

// Modal para cargar un documento nuevo de la aeronave (nombre, tipo, URL/archivo y vencimiento opcional)
export function AddAircraftDocumentModal({
  aircraftId,
  isOpen,
  onClose,
}: AddAircraftDocumentModalProps): JSX.Element {
  const addDocument = useAddAircraftDocument(aircraftId);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AircraftDocumentFormData>({
    resolver: zodResolver(aircraftDocumentSchema),
    defaultValues: { name: '', type: '', fileUrl: '', expiryDate: '' },
  });

  // Limpia el formulario cada vez que se abre el modal
  useEffect(() => {
    if (isOpen) reset({ name: '', type: '', fileUrl: '', expiryDate: '' });
  }, [isOpen, reset]);

  // Envía el documento nuevo mediante useAddAircraftDocument y cierra el modal si se guarda con éxito
  const onSubmit = async (data: AircraftDocumentFormData): Promise<void> => {
    await addDocument.mutateAsync({
      name: data.name,
      type: data.type,
      fileUrl: data.fileUrl,
      expiryDate: data.expiryDate,
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Subir documento"
      description="Cargá un documento asociado a la aeronave"
      size="sm"
      footer={
        <>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            type="submit"
            form="add-aircraft-document-form"
            isLoading={addDocument.isPending}
            leftIcon={<UploadCloud size={15} />}
          >
            Subir
          </Button>
        </>
      }
    >
      <form
        id="add-aircraft-document-form"
        onSubmit={(e) => void handleSubmit(onSubmit)(e)}
        noValidate
        className="space-y-4"
      >
        <Input
          label="Nombre del documento"
          placeholder="Certificado de aeronavegabilidad"
          error={errors.name?.message}
          required
          {...register('name')}
        />
        <Input
          label="Tipo"
          placeholder="Certificado, Seguro, Manual..."
          error={errors.type?.message}
          required
          {...register('type')}
        />
        <Input
          label="URL / Archivo"
          placeholder="https://..."
          error={errors.fileUrl?.message}
          required
          {...register('fileUrl')}
        />
        <Input
          type="date"
          label="Vencimiento (opcional)"
          error={errors.expiryDate?.message}
          {...register('expiryDate')}
        />
      </form>
    </Modal>
  );
}
