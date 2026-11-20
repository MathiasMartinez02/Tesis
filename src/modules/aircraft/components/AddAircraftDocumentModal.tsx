import { DocumentFormModal } from '@/shared/components/DocumentFormModal/DocumentFormModal';
import { useAddAircraftDocument } from '../hooks/useAircraft';

interface AddAircraftDocumentModalProps {
  aircraftId: string;
  isOpen: boolean;
  onClose: () => void;
}

// Carga de un documento de la aeronave con vencimiento opcional
export function AddAircraftDocumentModal({ aircraftId, isOpen, onClose }: AddAircraftDocumentModalProps): JSX.Element {
  const addDocument = useAddAircraftDocument(aircraftId);

  return (
    <DocumentFormModal
      isOpen={isOpen}
      title="Subir documento"
      description="Cargá un documento asociado a la aeronave"
      typePlaceholder="Certificado, Seguro, Manual..."
      withExpiry
      isPending={addDocument.isPending}
      onSubmit={(values) => addDocument.mutateAsync(values)}
      onClose={onClose}
    />
  );
}
