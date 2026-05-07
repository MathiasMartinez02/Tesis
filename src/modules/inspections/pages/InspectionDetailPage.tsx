import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle, Minus } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/shared/components/ui/Button';
import { Card, CardHeader, CardTitle, CardBody } from '@/shared/components/ui/Card';
import { StatusBadge } from '@/shared/components/StatusBadge/StatusBadge';
import { ROUTES, INSPECTION_TYPE_LABELS, CHECKLIST_STATUS_LABELS, CHECKLIST_STATUS_COLORS } from '@/constants';
import type { ChecklistItemStatus } from '@/types';

const STATUS_ICON: Record<ChecklistItemStatus, JSX.Element> = {
  pendiente: <Minus size={14} className="text-gray-400" />,
  conforme: <CheckCircle size={14} className="text-emerald-500" />,
  no_conforme: <XCircle size={14} className="text-red-500" />,
  na: <Minus size={14} className="text-gray-300" />,
};

// Mock data
const MOCK_INSPECTION = {
  id: 'ins-001',
  workOrderNumber: 'OT-2024-0002',
  type: 'inspeccion_anual' as const,
  status: 'pendiente_aprobacion' as const,
  aircraftRegistration: 'LV-BCD',
  aircraftModel: 'Beechcraft Bonanza G36',
  aircraftHours: 890,
  inspectorName: 'María González',
  scheduledDate: '2024-01-08',
  sections: [
    {
      id: 'sec-001',
      title: 'Documentación',
      orderIndex: 1,
      items: [
        { id: 'item-001', code: 'DOC-01', description: 'Libro de vuelo actualizado', status: 'conforme' as const, reference: 'CAR 91' },
        { id: 'item-002', code: 'DOC-02', description: 'Certificado de aeronavegabilidad vigente', status: 'conforme' as const, reference: 'CAR 91' },
        { id: 'item-003', code: 'DOC-03', description: 'Manual de vuelo a bordo', status: 'conforme' as const, reference: 'CAR 91' },
      ],
    },
    {
      id: 'sec-002',
      title: 'Inspección de Célula',
      orderIndex: 2,
      items: [
        { id: 'item-004', code: 'CEL-01', description: 'Inspección visual fuselaje', status: 'conforme' as const },
        { id: 'item-005', code: 'CEL-02', description: 'Control de alerones y timones', status: 'conforme' as const },
        { id: 'item-006', code: 'CEL-03', description: 'Estado de parabrisas', status: 'no_conforme' as const, observations: 'Micro-grieta en ángulo inferior derecho - requiere reemplazo' },
      ],
    },
    {
      id: 'sec-003',
      title: 'Sistema de Propulsión',
      orderIndex: 3,
      items: [
        { id: 'item-007', code: 'MOT-01', description: 'Nivel y calidad de aceite', status: 'conforme' as const },
        { id: 'item-008', code: 'MOT-02', description: 'Estado de bujías', status: 'pendiente' as const },
        { id: 'item-009', code: 'MOT-03', description: 'Inspección de hélice', status: 'conforme' as const },
      ],
    },
  ],
};

export function InspectionDetailPage(): JSX.Element {
  const { id: _id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const inspection = MOCK_INSPECTION;

  const allItems = inspection.sections.flatMap((s) => s.items);
  const conformeCount = allItems.filter((i) => i.status === 'conforme').length;
  const noConformeCount = allItems.filter((i) => i.status === 'no_conforme').length;
  const pendingCount = allItems.filter((i) => i.status === 'pendiente').length;

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
                Inspección {INSPECTION_TYPE_LABELS[inspection.type]}
              </h1>
              <StatusBadge type="inspection" status={inspection.status} />
            </div>
            <p className="text-sm text-surface-500">
              {inspection.workOrderNumber} · {inspection.aircraftRegistration} · {inspection.aircraftModel}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="destructive" size="sm" leftIcon={<XCircle size={14} />}>
            Rechazar
          </Button>
          <Button variant="success" size="sm" leftIcon={<CheckCircle size={14} />}>
            Aprobar
          </Button>
        </div>
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
        {inspection.sections.map((section) => (
          <Card key={section.id}>
            <CardHeader>
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-aviation-600 text-xs font-bold text-white">
                  {section.orderIndex}
                </span>
                <CardTitle>{section.title}</CardTitle>
              </div>
              <span className="text-xs text-surface-500">
                {section.items.filter((i) => i.status !== 'pendiente').length}/{section.items.length} verificados
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
