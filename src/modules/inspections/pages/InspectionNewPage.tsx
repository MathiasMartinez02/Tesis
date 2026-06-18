import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Save } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { Select } from '@/shared/components/ui/Select';
import { Card, CardHeader, CardTitle, CardBody } from '@/shared/components/ui/Card';
import { PageHeader } from '@/shared/components/PageHeader/PageHeader';
import { ROUTES, INSPECTION_TYPE_LABELS } from '@/constants';
import type { SelectOption } from '@/types';

const inspectionSchema = z.object({
  type: z.enum([
    'inspeccion_50h',
    'inspeccion_100h',
    'inspeccion_200h',
    'inspeccion_anual',
    'inspeccion_especial',
  ]),
  aircraftId: z.string().min(1, 'Seleccionar aeronave'),
  workOrderId: z.string().optional(),
  inspectorId: z.string().min(1, 'Seleccionar inspector'),
  scheduledDate: z.string().min(1, 'Fecha requerida'),
  aircraftHours: z.number().min(0, 'Horas inválidas'),
  notes: z.string().optional(),
});

type InspectionFormData = z.infer<typeof inspectionSchema>;

const TYPE_OPTIONS: SelectOption[] = Object.entries(INSPECTION_TYPE_LABELS).map(
  ([value, label]) => ({ value, label })
);

const AIRCRAFT_OPTIONS: SelectOption[] = [
  { value: 'ac-001', label: 'LV-RGT — Cessna 172S' },
  { value: 'ac-002', label: 'LV-MNP — Piper PA-28' },
  { value: 'ac-003', label: 'LV-BCD — Beechcraft Bonanza' },
  { value: 'ac-004', label: 'LV-XYZ — Robinson R44' },
  { value: 'ac-005', label: 'LV-KRT — Cirrus SR22T' },
];

const INSPECTOR_OPTIONS: SelectOption[] = [
  { value: 'usr-002', label: 'María González' },
  { value: 'usr-005', label: 'Alejandro Soria' },
  { value: 'usr-006', label: 'Patricia Méndez' },
];

const WORK_ORDER_OPTIONS: SelectOption[] = [
  { value: 'ot-001', label: 'OT-2024-0001 — LV-MNP' },
  { value: 'ot-002', label: 'OT-2024-0002 — LV-BCD' },
  { value: 'ot-003', label: 'OT-2024-0003 — LV-KRT' },
];

export function InspectionNewPage(): JSX.Element {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<InspectionFormData>({
    resolver: zodResolver(inspectionSchema),
    defaultValues: {
      type: 'inspeccion_100h',
      aircraftHours: 0,
    },
  });

  const onSubmit = async (_data: InspectionFormData): Promise<void> => {
    await new Promise((r) => setTimeout(r, 800));
    navigate(ROUTES.INSPECTIONS);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-3xl"
    >
      <PageHeader
        title="Nueva Inspección"
        description="Programá una inspección técnica de aeronave"
        actions={
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<ArrowLeft size={14} />}
            onClick={() => navigate(ROUTES.INSPECTIONS)}
          >
            Volver
          </Button>
        }
      />

      <form onSubmit={(e) => void handleSubmit(onSubmit)(e)} noValidate>
        <div className="space-y-5">
          {/* Tipo y aeronave */}
          <Card>
            <CardHeader>
              <CardTitle>Tipo de Inspección</CardTitle>
            </CardHeader>
            <CardBody>
              <div className="grid gap-4 sm:grid-cols-2">
                <Select
                  label="Tipo de inspección"
                  options={TYPE_OPTIONS}
                  placeholder="Seleccionar"
                  error={errors.type?.message}
                  required
                  {...register('type')}
                />
                <Select
                  label="Aeronave"
                  options={AIRCRAFT_OPTIONS}
                  placeholder="Seleccionar aeronave"
                  error={errors.aircraftId?.message}
                  required
                  {...register('aircraftId')}
                />
              </div>
            </CardBody>
          </Card>

          {/* Asignación */}
          <Card>
            <CardHeader>
              <CardTitle>Asignación</CardTitle>
            </CardHeader>
            <CardBody>
              <div className="grid gap-4 sm:grid-cols-2">
                <Select
                  label="Inspector responsable"
                  options={INSPECTOR_OPTIONS}
                  placeholder="Seleccionar inspector"
                  error={errors.inspectorId?.message}
                  required
                  {...register('inspectorId')}
                />
                <Select
                  label="Orden de Trabajo asociada"
                  options={WORK_ORDER_OPTIONS}
                  placeholder="Seleccionar OT (opcional)"
                  error={errors.workOrderId?.message}
                  {...register('workOrderId')}
                />
              </div>
            </CardBody>
          </Card>

          {/* Programación */}
          <Card>
            <CardHeader>
              <CardTitle>Programación</CardTitle>
            </CardHeader>
            <CardBody>
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  type="date"
                  label="Fecha programada"
                  error={errors.scheduledDate?.message}
                  required
                  {...register('scheduledDate')}
                />
                <Input
                  type="number"
                  label="Horas de aeronave al inicio"
                  step="0.1"
                  min="0"
                  error={errors.aircraftHours?.message}
                  required
                  {...register('aircraftHours', { valueAsNumber: true })}
                />
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-sm font-medium text-surface-700 dark:text-surface-300">
                    Observaciones{' '}
                    <span className="text-surface-400 font-normal">(opcional)</span>
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Observaciones o instrucciones especiales..."
                    className="w-full resize-none rounded-lg border border-surface-300 bg-white px-3 py-2 text-sm outline-none placeholder:text-surface-400 focus:border-aviation-500 focus:ring-2 focus:ring-aviation-500/20 dark:border-surface-600 dark:bg-surface-800 dark:text-white"
                    {...register('notes')}
                  />
                </div>
              </div>
            </CardBody>
          </Card>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => navigate(ROUTES.INSPECTIONS)}>
              Cancelar
            </Button>
            <Button type="submit" isLoading={isSubmitting} leftIcon={<Save size={15} />}>
              Programar Inspección
            </Button>
          </div>
        </div>
      </form>
    </motion.div>
  );
}
