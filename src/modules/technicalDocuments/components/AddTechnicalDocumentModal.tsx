import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { UploadCloud } from 'lucide-react';
import { Modal } from '@/shared/components/Modal/Modal';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { Select } from '@/shared/components/ui/Select';
import { useCreateTechnicalDocument } from '../hooks/useTechnicalDocuments';
import { TECHNICAL_DOCUMENT_TYPE_LABELS } from '@/constants';
import type { SelectOption, TechnicalDocumentType } from '@/types';

const TYPE_OPTIONS: SelectOption[] = Object.entries(TECHNICAL_DOCUMENT_TYPE_LABELS).map(([value, label]) => ({
  value,
  label,
}));

const documentSchema = z.object({
  type: z.string().min(1, 'Requerido'),
  title: z.string().min(1, 'Requerido'),
  fileUrl: z.string().min(1, 'Requerido'),
  referenceCode: z.string().optional(),
  description: z.string().optional(),
  issueDate: z.string().optional(),
  expiryDate: z.string().optional(),
});

type DocumentFormData = z.infer<typeof documentSchema>;

interface AddTechnicalDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Modal para cargar un documento nuevo al repositorio general de documentación técnica (manual, boletín, directiva AD o certificado)
export function AddTechnicalDocumentModal({ isOpen, onClose }: AddTechnicalDocumentModalProps): JSX.Element {
  const createDocument = useCreateTechnicalDocument();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DocumentFormData>({
    resolver: zodResolver(documentSchema),
    defaultValues: {
      type: '',
      title: '',
      fileUrl: '',
      referenceCode: '',
      description: '',
      issueDate: '',
      expiryDate: '',
    },
  });

  // Limpia el formulario cada vez que se abre el modal
  useEffect(() => {
    if (isOpen) {
      reset({ type: '', title: '', fileUrl: '', referenceCode: '', description: '', issueDate: '', expiryDate: '' });
    }
  }, [isOpen, reset]);

  // Envía el documento nuevo mediante useCreateTechnicalDocument y cierra el modal si se guarda con éxito
  const onSubmit = async (data: DocumentFormData): Promise<void> => {
    await createDocument.mutateAsync({
      type: data.type as TechnicalDocumentType,
      title: data.title,
      fileUrl: data.fileUrl,
      referenceCode: data.referenceCode || undefined,
      description: data.description || undefined,
      issueDate: data.issueDate || undefined,
      expiryDate: data.expiryDate || undefined,
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Cargar documento técnico"
      description="Manual, boletín de servicio, directiva AD o certificado del repositorio general"
      size="sm"
      footer={
        <>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            type="submit"
            form="add-technical-document-form"
            isLoading={createDocument.isPending}
            leftIcon={<UploadCloud size={15} />}
          >
            Cargar
          </Button>
        </>
      }
    >
      <form
        id="add-technical-document-form"
        onSubmit={(e) => void handleSubmit(onSubmit)(e)}
        noValidate
        className="space-y-4"
      >
        <Select
          label="Tipo de documento"
          options={TYPE_OPTIONS}
          placeholder="Seleccioná un tipo"
          error={errors.type?.message}
          required
          {...register('type')}
        />
        <Input
          label="Título"
          placeholder="Manual de mantenimiento Cessna 172"
          error={errors.title?.message}
          required
          {...register('title')}
        />
        <Input
          label="Código de referencia (opcional)"
          placeholder="AD-2024-15-03"
          error={errors.referenceCode?.message}
          {...register('referenceCode')}
        />
        <Input
          label="URL / Archivo"
          placeholder="https://..."
          error={errors.fileUrl?.message}
          required
          {...register('fileUrl')}
        />
        <Input
          label="Descripción (opcional)"
          placeholder="Detalle del documento"
          error={errors.description?.message}
          {...register('description')}
        />
        <div className="grid grid-cols-2 gap-3">
          <Input
            type="date"
            label="Emisión (opcional)"
            error={errors.issueDate?.message}
            {...register('issueDate')}
          />
          <Input
            type="date"
            label="Vencimiento (opcional)"
            error={errors.expiryDate?.message}
            {...register('expiryDate')}
          />
        </div>
      </form>
    </Modal>
  );
}
