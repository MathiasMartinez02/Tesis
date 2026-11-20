import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle, Minus, PlayCircle, ClipboardCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/shared/components/ui/Button';
import { Card, CardHeader, CardTitle, CardBody } from '@/shared/components/ui/Card';
import { StatusBadge } from '@/shared/components/StatusBadge/StatusBadge';
import { PageLoader } from '@/shared/components/PageLoader/PageLoader';
import { ErrorState } from '@/shared/components/ErrorState/ErrorState';
import { TextPromptModal } from '@/shared/components/TextPromptModal/TextPromptModal';
import { RoleGuard } from '@/routes/RoleGuard';
import { useAuthStore, selectUserPermissions } from '@/store/authStore';
import {
  ROUTES,
  buildRoute,
  CHECKLIST_STATUS_LABELS,
  CHECKLIST_STATUS_COLORS,
  getInspectionTypeLabel,
} from '@/constants';
import { cn } from '@/lib/utils';
import {
  useInspection,
  useStartInspection,
  useCompleteInspection,
  useApproveInspection,
  useRejectInspection,
  useUpdateChecklistItem,
} from '../hooks/useInspections';
import type { ChecklistItem, ChecklistItemStatus } from '@/types';

const STATUS_ICON: Record<ChecklistItemStatus, JSX.Element> = {
  Pendiente: <Minus size={14} className="text-gray-400" />,
  Conforme: <CheckCircle size={14} className="text-emerald-500" />,
  NoConforme: <XCircle size={14} className="text-red-500" />,
  NA: <Minus size={14} className="text-gray-300" />,
};

const CHECK_OPTIONS: { status: Exclude<ChecklistItemStatus, 'Pendiente'>; label: string; activeClass: string }[] = [
  { status: 'Conforme', label: 'Conforme', activeClass: 'border-emerald-500 bg-emerald-50 text-emerald-700' },
  { status: 'NoConforme', label: 'No conforme', activeClass: 'border-red-500 bg-red-50 text-red-700' },
  { status: 'NA', label: 'N/A', activeClass: 'border-surface-400 bg-surface-100 text-surface-700' },
];

// Detalle de inspeccion: iniciar, controlar checklist, completar, aprobar o rechazar
export function InspectionDetailPage(): JSX.Element {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const permissions = useAuthStore(selectUserPermissions);
  const { data: inspection, isLoading, isError, refetch } = useInspection(id ?? '');
  const { mutate: start, isPending: isStarting } = useStartInspection();
  const { mutate: complete, isPending: isCompleting } = useCompleteInspection();
  const { mutate: approve, isPending: isApproving } = useApproveInspection();
  const { mutate: reject, isPending: isRejecting } = useRejectInspection();
  const { mutate: checkItem, isPending: isChecking } = useUpdateChecklistItem();
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [nonConformingItem, setNonConformingItem] = useState<ChecklistItem | null>(null);

  if (isLoading) return <PageLoader />;
  if (isError || !inspection) {
    return (
      <ErrorState
        title="Inspección no encontrada"
        description="La inspección solicitada no existe o no tenés permisos para verla."
        onRetry={() => void refetch()}
      />
    );
  }

  const allItems = inspection.checklistSections.flatMap((s) => s.items);
  const conformeCount = allItems.filter((i) => i.status === 'Conforme').length;
  const noConformeCount = allItems.filter((i) => i.status === 'NoConforme').length;
  const pendingCount = allItems.filter((i) => i.status === 'Pendiente').length;
  const canCheck = inspection.status === 'EnProceso' && !!permissions?.canApproveInspections;

  // Marca un item; No conforme pide observacion antes de enviar
  const handleCheck = (item: ChecklistItem, status: Exclude<ChecklistItemStatus, 'Pendiente'>): void => {
    if (status === 'NoConforme') {
      setNonConformingItem(item);
      return;
    }
    checkItem({ inspectionId: inspection.id, itemId: item.id, status });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon-sm" onClick={() => navigate(ROUTES.INSPECTIONS)} aria-label="Volver">
            <ArrowLeft size={18} />
          </Button>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-bold text-surface-900 dark:text-white">
                {getInspectionTypeLabel(inspection.type)}
              </h1>
              <StatusBadge type="inspection" status={inspection.status} />
            </div>
            <p className="text-sm text-surface-500">
              <button
                type="button"
                className="font-medium text-aviation-600 hover:underline"
                onClick={() => navigate(buildRoute(ROUTES.WORK_ORDER_DETAIL, { id: inspection.workOrderId }))}
              >
                {inspection.workOrderNumber}
              </button>
              {' · '}
              {inspection.aircraftRegistration}
              {inspection.inspectorName && ` · Inspector: ${inspection.inspectorName}`}
            </p>
          </div>
        </div>

        <RoleGuard permission="canApproveInspections">
          <div className="flex flex-wrap gap-2">
            {inspection.status === 'Pendiente' && (
              <Button
                size="sm"
                leftIcon={<PlayCircle size={14} />}
                isLoading={isStarting}
                onClick={() => start(inspection.id)}
              >
                Iniciar inspección
              </Button>
            )}
            {inspection.status === 'EnProceso' && (
              <Button
                size="sm"
                leftIcon={<ClipboardCheck size={14} />}
                isLoading={isCompleting}
                disabled={pendingCount > 0}
                title={pendingCount > 0 ? `Faltan ${pendingCount} ítem(s) por controlar` : undefined}
                onClick={() => complete({ id: inspection.id })}
              >
                Completar checklist
              </Button>
            )}
            {(inspection.status === 'EnProceso' || inspection.status === 'Completada') && (
              <Button
                variant="destructive"
                size="sm"
                leftIcon={<XCircle size={14} />}
                onClick={() => setIsRejectOpen(true)}
              >
                Rechazar
              </Button>
            )}
            {inspection.status === 'Completada' && (
              <Button
                variant="success"
                size="sm"
                leftIcon={<CheckCircle size={14} />}
                isLoading={isApproving}
                disabled={noConformeCount > 0}
                title={noConformeCount > 0 ? 'Hay ítems No conformes: la inspección debe rechazarse' : undefined}
                onClick={() => approve({ id: inspection.id })}
              >
                Aprobar
              </Button>
            )}
          </div>
        </RoleGuard>
      </div>

      {inspection.status === 'Rechazada' && inspection.rejectionReason && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-900/20 dark:text-red-300">
          <span className="font-semibold">Motivo del rechazo:</span> {inspection.rejectionReason}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Total ítems', value: allItems.length, color: 'text-surface-900 dark:text-white' },
          { label: 'Conformes', value: conformeCount, color: 'text-emerald-600' },
          { label: 'No conformes', value: noConformeCount, color: 'text-red-600' },
          { label: 'Pendientes', value: pendingCount, color: 'text-amber-600' },
        ].map((stat) => (
          <Card key={stat.label} padding="sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-surface-400">{stat.label}</p>
            <p className={`mt-1 text-2xl font-bold ${stat.color}`}>{stat.value}</p>
          </Card>
        ))}
      </div>

      {inspection.status === 'Pendiente' && (
        <p className="text-sm text-surface-500">
          Iniciá la inspección para empezar a controlar el checklist.
        </p>
      )}

      <div className="space-y-4">
        {inspection.checklistSections.map((section) => (
          <Card key={section.id}>
            <CardHeader>
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-aviation-600 text-xs font-bold text-white">
                  {section.orderIndex}
                </span>
                <CardTitle>{section.title}</CardTitle>
              </div>
              <span className="text-xs text-surface-500">
                {section.items.filter((i) => i.status !== 'Pendiente').length}/{section.items.length} verificados
              </span>
            </CardHeader>
            <CardBody>
              <div className="space-y-2">
                {section.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col gap-3 rounded-lg border border-surface-100 p-3 sm:flex-row sm:items-start dark:border-surface-700"
                  >
                    <div className="flex flex-1 items-start gap-3">
                      <div className="mt-0.5 shrink-0">{STATUS_ICON[item.status]}</div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-xs font-semibold text-surface-400">{item.code}</span>
                          <span className="text-sm text-surface-900 dark:text-white">{item.description}</span>
                          {item.reference && <span className="text-2xs text-surface-400">({item.reference})</span>}
                        </div>
                        {item.observations && (
                          <p className="mt-1 rounded bg-amber-50 px-2 py-1 text-xs text-amber-800 dark:bg-amber-900/20 dark:text-amber-400">
                            Obs: {item.observations}
                          </p>
                        )}
                      </div>
                    </div>
                    {canCheck ? (
                      <div className="flex shrink-0 gap-1" role="group" aria-label={`Resultado de ${item.code}`}>
                        {CHECK_OPTIONS.map((option) => (
                          <button
                            key={option.status}
                            type="button"
                            disabled={isChecking}
                            aria-pressed={item.status === option.status}
                            onClick={() => handleCheck(item, option.status)}
                            className={cn(
                              'rounded border px-2 py-1 text-2xs font-medium transition-colors disabled:opacity-50',
                              item.status === option.status
                                ? option.activeClass
                                : 'border-surface-200 text-surface-500 hover:bg-surface-50 dark:border-surface-600'
                            )}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <span
                        className={`shrink-0 self-start rounded px-2 py-0.5 text-2xs font-medium ${CHECKLIST_STATUS_COLORS[item.status]}`}
                      >
                        {CHECKLIST_STATUS_LABELS[item.status]}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      <TextPromptModal
        isOpen={isRejectOpen}
        title="Rechazar inspección"
        description="La OT vuelve a En proceso para corregir lo observado."
        label="Motivo del rechazo"
        confirmLabel="Rechazar"
        confirmVariant="destructive"
        isLoading={isRejecting}
        onClose={() => setIsRejectOpen(false)}
        onConfirm={(reason) =>
          reject({ id: inspection.id, rejectionReason: reason }, { onSuccess: () => setIsRejectOpen(false) })
        }
      />

      <TextPromptModal
        isOpen={nonConformingItem !== null}
        title="Ítem no conforme"
        description={nonConformingItem ? `${nonConformingItem.code} - ${nonConformingItem.description}` : undefined}
        label="Observación"
        confirmLabel="Registrar"
        isLoading={isChecking}
        onClose={() => setNonConformingItem(null)}
        onConfirm={(observations) => {
          if (!nonConformingItem) return;
          checkItem(
            { inspectionId: inspection.id, itemId: nonConformingItem.id, status: 'NoConforme', observations },
            { onSuccess: () => setNonConformingItem(null) }
          );
        }}
      />
    </motion.div>
  );
}
