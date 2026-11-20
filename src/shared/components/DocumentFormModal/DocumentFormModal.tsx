import { useEffect, useId } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { UploadCloud } from 'lucide-react';
import { Modal } from '@/shared/components/Modal/Modal';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { documentFormSchema, type DocumentFormData } from './document.schema';

interface DocumentFormModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  typePlaceholder: string;
  withExpiry?: boolean;
  isPending: boolean;
  onSubmit: (values: DocumentFormData) => Promise<unknown>;
  onClose: () => void;
}

const EMPTY: DocumentFormData = { name: '', type: '', fileUrl: '', expiryDate: '' };

// Modal comun para cargar un documento (nombre, tipo, URL y vencimiento opcional)
export function DocumentFormModal({
  isOpen,
  title,
  description,
  typePlaceholder,
  withExpiry = false,
  isPending,
  onSubmit,
  onClose,
}: DocumentFormModalProps): JSX.Element {
  const formId = useId();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DocumentFormData>({ resolver: zodResolver(documentFormSchema), defaultValues: EMPTY });

  useEffect(() => {
    if (isOpen) reset(EMPTY);
  }, [isOpen, reset]);

  // Envia el documento y cierra el modal si se guardo
  const submit = async (values: DocumentFormData): Promise<void> => {
    await onSubmit(values);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      description={description}
      size="sm"
      footer={
        <>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" form={formId} isLoading={isPending} leftIcon={<UploadCloud size={15} />}>
            Subir
          </Button>
        </>
      }
    >
      <form id={formId} onSubmit={(e) => void handleSubmit(submit)(e).catch(() => undefined)} noValidate className="space-y-4">
        <Input label="Nombre del documento" error={errors.name?.message} required {...register('name')} />
        <Input label="Tipo" placeholder={typePlaceholder} error={errors.type?.message} required {...register('type')} />
        <Input label="URL / Archivo" placeholder="https://..." error={errors.fileUrl?.message} required {...register('fileUrl')} />
        {withExpiry && (
          <Input type="date" label="Vencimiento (opcional)" error={errors.expiryDate?.message} {...register('expiryDate')} />
        )}
      </form>
    </Modal>
  );
}
