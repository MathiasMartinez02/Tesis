import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { technicalDocumentsService } from '@/services/api/technicalDocuments.service';
import type { TechnicalDocumentFilters, CreateTechnicalDocumentPayload } from '@/types';
import { useUIStore } from '@/store/uiStore';

export const TECHNICAL_DOCUMENTS_QUERY_KEY = ['technical-documents'] as const;

// Trae el listado paginado de documentos técnicos según filtros, página y tamaño de página
export function useTechnicalDocuments(filters: TechnicalDocumentFilters = {}, page = 1, pageSize = 10) {
  return useQuery({
    queryKey: [...TECHNICAL_DOCUMENTS_QUERY_KEY, filters, page, pageSize],
    queryFn: () => technicalDocumentsService.getAll(filters, page, pageSize),
  });
}

// Trae el detalle de un documento técnico puntual por id
export function useTechnicalDocument(id: string) {
  return useQuery({
    queryKey: [...TECHNICAL_DOCUMENTS_QUERY_KEY, id],
    queryFn: () => technicalDocumentsService.getById(id),
    enabled: !!id,
  });
}

// Trae los documentos técnicos por vencer (ventana de 30 días), para el indicador de "por vencer" del listado
export function useExpiringTechnicalDocuments() {
  return useQuery({
    queryKey: [...TECHNICAL_DOCUMENTS_QUERY_KEY, 'expiring'],
    queryFn: () => technicalDocumentsService.getExpiring(),
  });
}

// Crea un documento técnico nuevo y refresca el listado, mostrando un toast de resultado
export function useCreateTechnicalDocument() {
  const queryClient = useQueryClient();
  const addToast = useUIStore((s) => s.addToast);

  return useMutation({
    mutationFn: (payload: CreateTechnicalDocumentPayload) => technicalDocumentsService.create(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: TECHNICAL_DOCUMENTS_QUERY_KEY });
      addToast({ type: 'success', title: 'Documento técnico cargado' });
    },
    onError: (err: Error) => {
      addToast({ type: 'error', title: 'Error al cargar el documento', description: err.message });
    },
  });
}
