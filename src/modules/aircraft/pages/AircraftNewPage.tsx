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
import { ROUTES, buildRoute } from '@/constants';
import type { SelectOption } from '@/types';
import { useCreateAircraft } from '../hooks/useAircraft';
import { useClients } from '@/modules/clients/hooks/useClients';

const aircraftSchema = z.object({
  registration: z
    .string()
    .min(1, 'Requerido')
    .regex(/^LV-[A-Z]{3}$/, 'Formato: LV-XXX (ej. LV-ABC)'),
  manufacturer: z.string().min(1, 'Requerido'),
  model: z.string().min(1, 'Requerido'),
  year: z.number().min(1900).max(new Date().getFullYear()),
  category: z.enum(['Avion', 'Helicoptero', 'Planeador', 'Ultraliviano']),
  serialNumber: z.string().min(1, 'Requerido'),
  engineModel: z.string().min(1, 'Requerido'),
  engineSerialNumber: z.string().min(1, 'Requerido'),
  clientId: z.string().min(1, 'Seleccionar cliente'),
  totalFlightHours: z.number().min(0),
  totalLandings: z.number().min(0),
  nextInspectionDue: z.string().min(1, 'Requerido'),
  nextInspectionHours: z.number().min(0),
  certificateExpiry: z.string().min(1, 'Requerido'),
});

type AircraftFormData = z.infer<typeof aircraftSchema>;

const CATEGORY_OPTIONS: SelectOption[] = [
  { value: 'Avion', label: 'Avión' },
  { value: 'Helicoptero', label: 'Helicóptero' },
  { value: 'Planeador', label: 'Planeador' },
  { value: 'Ultraliviano', label: 'Ultraliviano' },
];

export function AircraftNewPage(): JSX.Element {
  const navigate = useNavigate();

  // Trae clientes reales (pageSize alto para cubrir el combo completo) en vez del mock hardcodeado
  const { data: clientsPage, isLoading: isLoadingClients } = useClients({}, 1, 100);
  const CLIENT_OPTIONS: SelectOption[] = (clientsPage?.data ?? []).map((client) => ({
    value: client.id,
    label: client.name,
  }));

  const createAircraft = useCreateAircraft();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AircraftFormData>({
    resolver: zodResolver(aircraftSchema),
    defaultValues: {
      category: 'Avion',
      year: new Date().getFullYear(),
      totalFlightHours: 0,
      totalLandings: 0,
      nextInspectionHours: 100,
    },
  });

  // Antes simulaba el guardado con un setTimeout; ahora crea la aeronave con useCreateAircraft y navega a su detalle
  const onSubmit = async (data: AircraftFormData): Promise<void> => {
    const newAircraft = await createAircraft.mutateAsync(data);
    navigate(buildRoute(ROUTES.AIRCRAFT_DETAIL, { id: newAircraft.id }));
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
                  placeholder={isLoadingClients ? 'Cargando clientes...' : 'Seleccionar cliente'}
                  error={errors.clientId?.message}
                  disabled={isLoadingClients}
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
                  type="number"
                  label="Aterrizajes totales"
                  step="1"
                  min="0"
                  error={errors.totalLandings?.message}
                  required
                  {...register('totalLandings', { valueAsNumber: true })}
                />
                <Input
                  type="date"
                  label="Próxima inspección programada"
                  error={errors.nextInspectionDue?.message}
                  required
                  {...register('nextInspectionDue')}
                />
                <Input
                  type="number"
                  label="Horas para próxima inspección"
                  step="0.1"
                  min="0"
                  error={errors.nextInspectionHours?.message}
                  required
                  {...register('nextInspectionHours', { valueAsNumber: true })}
                />
                <Input
                  type="date"
                  label="Vencimiento de certificado"
                  error={errors.certificateExpiry?.message}
                  required
                  {...register('certificateExpiry')}
                />
              </div>
            </CardBody>
          </Card>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => navigate(ROUTES.AIRCRAFT)}>
              Cancelar
            </Button>
            <Button
              type="submit"
              isLoading={isSubmitting || createAircraft.isPending}
              leftIcon={<Save size={15} />}
            >
              Registrar Aeronave
            </Button>
          </div>
        </div>
      </form>
    </motion.div>
  );
}
