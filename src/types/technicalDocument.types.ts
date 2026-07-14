/** Tipos de documento del repositorio general de documentación técnica (Fase 4) */
export type TechnicalDocumentType = 'Manual' | 'BoletinServicio' | 'DirectivaAD' | 'Certificado' | 'Otro';

/** TechnicalDocumentDto — lo que devuelve el listado y el detalle (GET /technical-documents, GET /technical-documents/{id}) */
export interface TechnicalDocument {
  id: string;
  type: TechnicalDocumentType;
  title: string;
  referenceCode?: string | null;
  fileUrl: string;
  description?: string | null;
  issueDate?: string | null;
  expiryDate?: string | null;
  isExpired: boolean;
  createdAt: string;
}

export interface TechnicalDocumentFilters {
  type?: TechnicalDocumentType;
  search?: string;
  expiringOnly?: boolean;
}

/** Payload para crear un documento técnico (POST /technical-documents) */
export interface CreateTechnicalDocumentPayload {
  type: TechnicalDocumentType;
  title: string;
  fileUrl: string;
  referenceCode?: string | null;
  description?: string | null;
  issueDate?: string | null;
  expiryDate?: string | null;
}
