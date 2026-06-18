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
import { ROUTES } from '@/constants';
import type { SelectOption } from '@/types';

const aircraftSchema = z.object({
  registration: z
    .string()
    .min(1, 'Requerido')
    .regex(/^LV-[A-Z]{3}$/, 'Formato: LV-XXX (ej. LV-ABC)'),
  manufacturer: z.string().min(1, 'Requerido'),
  model: z.string().min(1, 'Requerido'),
  year: z.number().min(1900).max(new Date().getFullYear()),
  category: z.enum(['avion', 'helicoptero', 'planeador', 'ultraliviano']),
  serialNumber: z.string().min(1, 'Requerido'),
  engineModel: z.string().min(1, 'Requerido'),
  engineSerialNumber: z.string().min(1, 'Requerido'),
  clientId: z.string().min(1, 'Seleccionar cliente'),
  totalFlightHours: z.number().min(0),
  nextInspectionDue: z.string().min(1, 'Requerido'),
});

type AircraftFormData = z.infer<typeof aircraftSchema>;

const CATEGORY_OPTIONS: SelectOption[] = [
  { value: 'avion', label: 'Avión' },
  { value: 'helicoptero', label: 'Helicóptero' },
  { value: 'planeador', label: 'Planeador' },
  { value: 'ultraliviano', label: 'Ultraliviano' },
];

const CLIENT_OPTIONS: SelectOption[] = [
  { value: 'cl-001', label: 'Transportes Aéreos del Sur' },
  { value: 'cl-002', label: 'Aeroclub del Litoral' },
  { value: 'cl-003', label: 'Helicópteros Patagonia' },
  { value: 'cl-004', label: 'AeroFly SA' },
];

export function AircraftNewPage(): JSX.Element {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AircraftFormData>({
    resolver: zodResolver(aircraftSchema),
    defaultValues: {
      category: 'avion',
      year: new Date().getFullYear(),
      totalFlightHours: 0,
    },
  });

  const onSubmit = async (_data: AircraftFormData): Promise<void> => {
    await new Promise((r) => setTimeout(r, 800));
    navigate(ROUTES.AIRCRAFT);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-3xl"
    >
      <PageHeader
        title="Nueva Aeronave"
        description="Registrá una nueva aeronave en el sistema"
        actions={
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<ArrowLeft size={14} />}
            onClick={() => navigate(ROUTES.AIRCRAFT)}
          >
            Volver
          </Button>
        }
      />

      <form onSubmit={(e) => void handleSubmit(onSubmit)(e)} noValidate>
        <div className="space-y-5">
          {/* Identificación */}
          <Card>
            <CardHeader>
              <CardTitle>Identificación</CardTitle>
            </CardHeader>
            <CardBody>
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Matrícula"
                  placeholder="LV-ABC"
                  error={errors.registration?.message}
                  required
                  className="uppercase"
                  {...register('registration', {
                    setValueAs: (v: string) => v.toUpperCase(),
                  })}
                />
                <Select
                  label="Categoría"
                  options={CATEGORY_OPTIONS}
                  error={errors.category?.message}
                  required
                  {...register('category')}
                />
                <Input
                  label="Fabricante"
                  placeholder="Cessna, Piper, Robinson..."
                  error={errors.manufacturer?.message}
                  required
                  {...register('manufacturer')}
                />
                <Input
                  label="Modelo"
                  placeholder="172S, PA-28, R44..."
                  error={errors.model?.message}
                  required
                  {...register('model')}
                />
                <Input
                  type="number"
                  label="Año de fabricación"
                  error={errors.year?.message}
                  required
                  {...register('year', { valueAsNumber: true })}
                />
                <Input
                  label="Número de serie"
                  placeholder="S/N aeronave"
                  error={errors.serialNumber?.message}
                  required
                  {...register('serialNumber')}
                />
              </div>
            </CardBody>
          </Card>

          {/* Motor */}
          <Card>
            <CardHeader>
              <CardTitle>Motor</CardTitle>
            </CardHeader>
            <CardBody>
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Modelo de motor"
                  placeholder="Lycoming IO-360, Continental O-200..."
                  error={errors.engineModel?.message}
                  required
                  {...register('engineModel')}
                />
                <Input
                  label="N° de serie del motor"
                  placeholder="S/N motor"
                  error={errors.engineSerialNumber?.message}
                  required
                  {...register('engineSerialNumber')}
                />
              </div>
            </CardBody>
          </Card>

          {/* Operación */}
          <Card>
            <CardHeader>
              <CardTitle>Operación</CardTitle>
            </CardHeader>
            <CardBody>
              <div className="grid gap-4 sm:grid-cols-2">
                <Select
                  label="Cliente / Operador"
                  options={CLIENT_OPTIONS}
                  placeholder="Seleccionar cliente"
                  error={errors.clientId?.message}
                  required
                  {...register('clientId')}
                />
                <Input
                  type="number"
                  label="Horas de vuelo totales"
                  step="0.1"
                  min="0"
                  error={errors.totalFlightHours?.message}
                  required
                  {...register('totalFlightHours', { valueAsNumber: true })}
                />
                <Input
                  type="date"
                  label="Próxima inspección programada"
                  error={errors.nextInspectionDue?.message}
                  required
                  {...register('nextInspectionDue')}
                />
              </div>
            </CardBody>
          </Card>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => navigate(ROUTES.AIRCRAFT)}>
              Cancelar
            </Button>
            <Button type="submit" isLoading={isSubmitting} leftIcon={<Save size={15} />}>
              Registrar Aeronave
            </Button>
          </div>
        </div>
      </form>
    </motion.div>
  );
}
