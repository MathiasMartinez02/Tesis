import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { aircraftEditSchema, type AircraftEditFormData } from '../schemas/aircraft.schema';
import { ArrowLeft, Save } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { Select } from '@/shared/components/ui/Select';
import { Card, CardHeader, CardTitle, CardBody } from '@/shared/components/ui/Card';
import { PageHeader } from '@/shared/components/PageHeader/PageHeader';
import { PageLoader } from '@/shared/components/PageLoader/PageLoader';
import { ErrorState } from '@/shared/components/ErrorState/ErrorState';
import { ROUTES, buildRoute } from '@/constants';
import { toDateInput } from '@/lib/utils';
import type { SelectOption } from '@/types';
import { useAircraftById, useUpdateAircraft } from '../hooks/useAircraft';

const CATEGORY_OPTIONS: SelectOption[] = [
  { value: 'Avion', label: 'Avión' },
  { value: 'Helicoptero', label: 'Helicóptero' },
  { value: 'Planeador', label: 'Planeador' },
  { value: 'Ultraliviano', label: 'Ultraliviano' },
];

// Página de edición de una aeronave existente: precarga sus datos y guarda los cambios con useUpdateAircraft
export function AircraftEditPage(): JSX.Element {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: aircraft, isLoading, isError, refetch } = useAircraftById(id ?? '');

  const updateAircraft = useUpdateAircraft();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AircraftEditFormData>({
    resolver: zodResolver(aircraftEditSchema),
  });

  // Precarga el formulario con los datos de la aeronave una vez que llegan del backend
  useEffect(() => {
    if (aircraft) {
      reset({
        manufacturer: aircraft.manufacturer,
        model: aircraft.model,
        year: aircraft.year,
        category: aircraft.category,
        serialNumber: aircraft.serialNumber,
        engineModel: aircraft.engineModel,
        engineSerialNumber: aircraft.engineSerialNumber,
        totalFlightHours: aircraft.totalFlightHours,
        totalLandings: aircraft.totalLandings,
        nextInspectionDue: toDateInput(aircraft.nextInspectionDue),
        nextInspectionHours: aircraft.nextInspectionHours,
        certificateExpiry: toDateInput(aircraft.certificateExpiry),
      });
    }
  }, [aircraft, reset]);

  if (isLoading) return <PageLoader />;
  if (isError || !aircraft) {
    return <ErrorState title="Aeronave no encontrada" onRetry={() => void refetch()} />;
  }

  const detailRoute = buildRoute(ROUTES.AIRCRAFT_DETAIL, { id: aircraft.id });

  // Guarda los cambios conservando la fecha de ultima inspeccion
  const onSubmit = async (data: AircraftEditFormData): Promise<void> => {
    await updateAircraft.mutateAsync({
      id: aircraft.id,
      payload: { ...data, lastInspectionDate: aircraft.lastInspectionDate },
    });
    navigate(detailRoute);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-3xl"
    >
      <PageHeader
        title={`Editar ${aircraft.registration}`}
        description="Modificá los datos de la aeronave"
        actions={
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<ArrowLeft size={14} />}
            onClick={() => navigate(detailRoute)}
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
                <Input label="Matrícula" value={aircraft.registration} disabled readOnly />
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
                <Input label="Cliente / Operador" value={aircraft.clientName} disabled readOnly />
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
            <Button type="button" variant="outline" onClick={() => navigate(detailRoute)}>
              Cancelar
            </Button>
            <Button
              type="submit"
              isLoading={isSubmitting || updateAircraft.isPending}
              leftIcon={<Save size={15} />}
            >
              Guardar Cambios
            </Button>
          </div>
        </div>
      </form>
    </motion.div>
  );
}
