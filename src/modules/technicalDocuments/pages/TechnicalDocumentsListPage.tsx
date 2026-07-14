import { useState } from 'react';
import { Plus, AlertTriangle, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import { PageHeader } from '@/shared/components/PageHeader/PageHeader';
import { Button } from '@/shared/components/ui/Button';
import { Select } from '@/shared/components/ui/Select';
import { DataTable } from '@/shared/components/DataTable/DataTable';
import { ErrorState } from '@/shared/components/ErrorState/ErrorState';
import { RoleGuard } from '@/routes/RoleGuard';
import { useTechnicalDocuments, useExpiringTechnicalDocuments } from '../hooks/useTechnicalDocuments';
import { AddTechnicalDocumentModal } from '../components/AddTechnicalDocumentModal';
import { TECHNICAL_DOCUMENT_TYPE_LABELS, TECHNICAL_DOCUMENT_TYPE_COLORS } from '@/constants';
import type { TechnicalDocument, TechnicalDocumentFilters, SelectOption, TableColumn } from '@/types';
import { formatDate, cn } from '@/lib/utils';

const EMPTY_FILTERS: TechnicalDocumentFilters = {};

const TYPE_OPTIONS: SelectOption[] = Object.entries(TECHNICAL_DOCUMENT_TYPE_LABELS).map(([value, label]) => ({
  value,
  label,
}));

const EXPIRING_OPTIONS: SelectOption[] = [
  { value: 'true', label: 'Por vencer (próximos 30 días)' },
];

export function TechnicalDocumentsListPage(): JSX.Element {
  const [filters, setFilters] = useState<TechnicalDocumentFilters>(EMPTY_FILTERS);
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data, isLoading, isError, refetch } = useTechnicalDocuments(filters, page);
  const { data: expiringDocs } = useExpiringTechnicalDocuments();

  const handleTypeFilterChange = (value: string): void => {
    setFilters((prev) => ({ ...prev, type: value ? (value as TechnicalDocumentFilters['type']) : undefined }));
    setPage(1);
  };

  const handleExpiringFilterChange = (value: string): void => {
    setFilters((prev) => ({ ...prev, expiringOnly: value ? true : undefined }));
    setPage(1);
  };

  const columns: TableColumn<TechnicalDocument>[] = [
    {
      key: 'title',
      header: 'Título',
      sortable: true,
      render: (value, row) => (
        <div className="flex flex-col">
          <span className="text-sm font-medium text-surface-900 dark:text-white">{String(value)}</span>
          {row.referenceCode && (
            <span className="text-xs text-surface-500 dark:text-surface-400">{row.referenceCode}</span>
          )}
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Tipo',
      width: '160px',
      render: (_, row) => (
        <span
          className={cn(
            'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
            TECHNICAL_DOCUMENT_TYPE_COLORS[row.type]
          )}
        >
          {TECHNICAL_DOCUMENT_TYPE_LABELS[row.type]}
        </span>
      ),
    },
    {
      key: 'expiryDate',
      header: 'Vencimiento',
      width: '180px',
      render: (value, row) => {
        if (!value) return <span className="text-sm text-surface-400">Sin vencimiento</span>;
        return (
          <span
            className={cn(
              'inline-flex items-center gap-1 text-sm',
              row.isExpired ? 'text-red-600 dark:text-red-400 font-medium' : 'text-surface-600 dark:text-surface-400'
            )}
          >
            {row.isExpired && <AlertTriangle size={13} />}
            {formatDate(String(value))}
          </span>
        );
      },
    },
    {
      key: 'id',
      header: 'Archivo',
      width: '100px',
      render: (_, row) => (
        <a
          href={row.fileUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 text-sm text-aviation-600 hover:underline dark:text-aviation-400"
          onClick={(e) => e.stopPropagation()}
        >
          Ver <ExternalLink size={12} />
        </a>
      ),
    },
  ];

  if (isError) {
    return <ErrorState title="Error al cargar la documentación técnica" onRetry={() => void refetch()} />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-5"
    >
      <PageHeader
        title="Documentación Técnica"
        description={`${data?.total ?? 0} documentos registrados${
          expiringDocs && expiringDocs.length > 0 ? ` · ${expiringDocs.length} por vencer` : ''
        }`}
        actions={
          <RoleGuard permission="canSignDocuments">
            <Button size="sm" leftIcon={<Plus size={15} />} onClick={() => setIsModalOpen(true)}>
              Cargar Documento
            </Button>
          </RoleGuard>
        }
      />

      {expiringDocs && expiringDocs.length > 0 && (
        <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-300">
          <AlertTriangle size={16} className="mt-0.5 shrink-0" />
          <span>
            Hay {expiringDocs.length} documento{expiringDocs.length > 1 ? 's' : ''} que vence
            {expiringDocs.length > 1 ? 'n' : ''} en los próximos 30 días:{' '}
            {expiringDocs.map((d) => d.title).join(', ')}.
          </span>
        </div>
      )}

      {/* Filtros por tipo y vencimiento */}
      <div className="grid max-w-2xl grid-cols-1 gap-4 rounded-xl border border-surface-200 bg-white p-4 dark:border-surface-700 dark:bg-surface-800 sm:grid-cols-2">
        <Select
          label="Filtrar por tipo"
          options={TYPE_OPTIONS}
          placeholder="Todos los tipos"
          value={filters.type ?? ''}
          onChange={(e) => handleTypeFilterChange(e.target.value)}
        />
        <Select
          label="Filtrar por vencimiento"
          options={EXPIRING_OPTIONS}
          placeholder="Todos"
          value={filters.expiringOnly ? 'true' : ''}
          onChange={(e) => handleExpiringFilterChange(e.target.value)}
        />
      </div>

      <DataTable<TechnicalDocument>
        data={data?.data ?? []}
        columns={columns}
        isLoading={isLoading}
        emptyMessage="No hay documentos técnicos"
        emptyDescription="Cargá el primer manual, boletín o directiva con el botón Cargar Documento."
        stickyHeader
      />

      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-surface-500">
          <span>
            Mostrando {(page - 1) * 10 + 1}–{Math.min(page * 10, data.total)} de {data.total}
          </span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setPage((p) => p - 1)} disabled={page === 1}>
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p + 1)}
              disabled={page === data.totalPages}
            >
              Siguiente
            </Button>
          </div>
        </div>
      )}

      <AddTechnicalDocumentModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </motion.div>
  );
}
