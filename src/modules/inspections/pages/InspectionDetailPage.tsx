import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle, Minus } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/shared/components/ui/Button';
import { Card, CardHeader, CardTitle, CardBody } from '@/shared/components/ui/Card';
import { StatusBadge } from '@/shared/components/StatusBadge/StatusBadge';
import { PageLoader } from '@/shared/components/PageLoader/PageLoader';
import { ErrorState } from '@/shared/components/ErrorState/ErrorState';
import { ROUTES, CHECKLIST_STATUS_LABELS, CHECKLIST_STATUS_COLORS } from '@/constants';
import { useInspection, useApproveInspection, useRejectInspection } from '../hooks/useInspections';
import type { ChecklistItemStatus } from '@/types';

const STATUS_ICON: Record<ChecklistItemStatus, JSX.Element> = {
  Pendiente: <Minus size={14} className="text-gray-400" />,
  Conforme: <CheckCircle size={14} className="text-emerald-500" />,
  NoConforme: <XCircle size={14} className="text-red-500" />,
  NA: <Minus size={14} className="text-gray-300" />,
};

export function InspectionDetailPage(): JSX.Element {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: inspection, isLoading, isError, refetch } = useInspection(id ?? '');
  const { mutate: approve, isPending: isApproving } = useApproveInspection();
  const { mutate: reject, isPending: isRejecting } = useRejectInspection();

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

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-5"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => navigate(ROUTES.INSPECTIONS)}
            aria-label="Volver"
          >
            <ArrowLeft size={18} />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-surface-900 dark:text-white">
                Inspección {inspection.type}
              </h1>
              <StatusBadge type="inspection" status={inspection.status} />
            </div>
            <p className="text-sm text-surface-500">
              {inspection.workOrderNumber} · {inspection.aircraftRegistration}
            </p>
          </div>
        </div>
        {inspection.status === 'Completada' && (
          <div className="flex gap-2">
            <Button
              variant="destructive"
              size="sm"
              leftIcon={<XCircle size={14} />}
              isLoading={isRejecting}
              onClick={() => reject({ id: inspection.id, rejectionReason: 'Rechazada por inspector' })}
            >
              Rechazar
            </Button>
            <Button
              variant="success"
              size="sm"
              leftIcon={<CheckCircle size={14} />}
              isLoading={isApproving}
              onClick={() => approve({ id: inspection.id })}
            >
              Aprobar
            </Button>
          </div>
        )}
      </div>

      {/* Resumen */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Total ítems', value: allItems.length, color: 'text-surface-900 dark:text-white' },
          { label: 'Conformes', value: conformeCount, color: 'text-emerald-600' },
          { label: 'No conformes', value: noConformeCount, color: 'text-red-600' },
          { label: 'Pendientes', value: pendingCount, color: 'text-amber-600' },
        ].map((stat) => (
          <Card key={stat.label} padding="sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-surface-400">
              {stat.label}
            </p>
            <p className={`mt-1 text-2xl font-bold ${stat.color}`}>{stat.value}</p>
          </Card>
        ))}
      </div>

      {/* Checklist por secciones */}
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
                    className="flex items-start gap-3 rounded-lg border border-surface-100 p-3 dark:border-surface-700"
                  >
                    <div className="mt-0.5 shrink-0">
                      {STATUS_ICON[item.status]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-mono font-semibold text-surface-400">
                          {item.code}
                        </span>
                        <span className="text-sm text-surface-900 dark:text-white">
                          {item.description}
                        </span>
                        {item.reference && (
                          <span className="text-2xs text-surface-400">({item.reference})</span>
                        )}
                      </div>
                      {item.observations && (
                        <p className="mt-1 rounded bg-amber-50 px-2 py-1 text-xs text-amber-800 dark:bg-amber-900/20 dark:text-amber-400">
                          Obs: {item.observations}
                        </p>
                      )}
                    </div>
                    <span
                      className={`shrink-0 rounded px-2 py-0.5 text-2xs font-medium ${CHECKLIST_STATUS_COLORS[item.status]}`}
                    >
                      {CHECKLIST_STATUS_LABELS[item.status]}
                    </span>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </motion.div>
  );
}
