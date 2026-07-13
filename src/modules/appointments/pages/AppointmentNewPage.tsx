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
import { ROUTES, WORK_ORDER_TYPE_LABELS } from '@/constants';
import type { CreateAppointmentPayload, SelectOption } from '@/types';
import { useCreateAppointment } from '../hooks/useAppointments';
import { useClients } from '@/modules/clients/hooks/useClients';
import { useAircraft } from '@/modules/aircraft/hooks/useAircraft';

// Esquema de validacion del formulario, con reglas condicionales segun si la aeronave ya esta registrada
const appointmentSchema = z
  .object({
    clientId: z.string().min(1, 'Seleccionar cliente'),
    useRegisteredAircraft: z.boolean(),
    aircraftId: z.string().optional(),
    aircraftRegistrationHint: z.string().optional(),
    requestedType: z.enum([
      'Inspeccion50h',
      'Inspeccion100h',
      'Inspeccion200h',
      'InspeccionAnual',
      'Reparacion',
      'Modificacion',
      'AdCumplimiento',
      'Servicio',
    ]),
    scheduledDate: z.string().min(1, 'Fecha requerida'),
    notes: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.useRegisteredAircraft && !data.aircraftId) {
      ctx.addIssue({ code: 'custom', path: ['aircraftId'], message: 'Seleccionar aeronave' });
    }
    if (!data.useRegisteredAircraft && !data.aircraftRegistrationHint?.trim()) {
      ctx.addIssue({ code: 'custom', path: ['aircraftRegistrationHint'], message: 'Matrícula requerida' });
    }
  });

type AppointmentFormData = z.infer<typeof appointmentSchema>;

const TYPE_OPTIONS: SelectOption[] = Object.entries(WORK_ORDER_TYPE_LABELS).map(([value, label]) => ({
  value,
  label,
}));

export function AppointmentNewPage(): JSX.Element {
  const navigate = useNavigate();

  const { data: clientsPage, isLoading: isLoadingClients } = useClients({}, 1, 100);
  const CLIENT_OPTIONS: SelectOption[] = (clientsPage?.data ?? []).map((client) => ({
    value: client.id,
    label: client.name,
  }));

  const createAppointment = useCreateAppointment();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      useRegisteredAircraft: false,
      requestedType: 'Inspeccion100h',
    },
  });

  const selectedClientId = watch('clientId');
  const useRegisteredAircraft = watch('useRegisteredAircraft');

  // Trae las aeronaves del cliente seleccionado para el select de aeronave ya registrada
  const { data: aircraftPage, isLoading: isLoadingAircraft } = useAircraft(
    selectedClientId ? { clientId: selectedClientId } : {},
    1,
    100
  );
  const AIRCRAFT_OPTIONS: SelectOption[] = (aircraftPage?.data ?? []).map((aircraft) => ({
    value: aircraft.id,
    label: `${aircraft.registration} — ${aircraft.manufacturer} ${aircraft.model}`,
  }));

  // Construye el payload segun el toggle de aeronave registrada y crea el turno
  const onSubmit = async (data: AppointmentFormData): Promise<void> => {
    const payload: CreateAppointmentPayload = {
      clientId: data.clientId,
      aircraftId: data.useRegisteredAircraft ? data.aircraftId : null,
      aircraftRegistrationHint: data.useRegisteredAircraft ? null : data.aircraftRegistrationHint,
      requestedType: data.requestedType,
      scheduledDate: data.scheduledDate,
      notes: data.notes?.trim() ? data.notes : null,
    };
    await createAppointment.mutateAsync(payload);
    navigate(ROUTES.APPOINTMENTS);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-3xl"
    >
      <PageHeader
        title="Nuevo Turno"
        description="Registrá el pedido de turno del cliente"
        actions={
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<ArrowLeft size={14} />}
            onClick={() => navigate(ROUTES.APPOINTMENTS)}
          >
            Volver
          </Button>
        }
      />

      <form onSubmit={(e) => void handleSubmit(onSubmit)(e)} noValidate>
        <div className="space-y-5">
          {/* Cliente */}
          <Card>
            <CardHeader>
              <CardTitle>Cliente</CardTitle>
            </CardHeader>
            <CardBody>
              <Select
                label="Cliente"
                options={CLIENT_OPTIONS}
                placeholder={isLoadingClients ? 'Cargando clientes...' : 'Seleccionar cliente'}
                error={errors.clientId?.message}
                disabled={isLoadingClients}
                required
                {...register('clientId')}
              />
            </CardBody>
          </Card>

          {/* Aeronave */}
          <Card>
            <CardHeader>
              <CardTitle>Aeronave</CardTitle>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                <label className="flex items-center gap-2 text-sm font-medium text-surface-700 dark:text-surface-300">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-surface-300 text-aviation-600 focus:ring-aviation-500/40"
                    {...register('useRegisteredAircraft')}
                  />
                  Aeronave ya registrada
                </label>

                {useRegisteredAircraft ? (
                  <Select
                    label="Seleccionar aeronave"
                    options={AIRCRAFT_OPTIONS}
                    placeholder={isLoadingAircraft ? 'Cargando aeronaves...' : 'Seleccionar aeronave'}
                    error={errors.aircraftId?.message}
                    disabled={isLoadingAircraft || !selectedClientId}
                    hint={!selectedClientId ? 'Seleccioná primero un cliente' : undefined}
                    required
                    {...register('aircraftId')}
                  />
                ) : (
                  <Input
                    label="Matrícula (primera visita, aeronave sin registrar)"
                    placeholder="Ej: LV-ABC"
                    error={errors.aircraftRegistrationHint?.message}
                    required
                    {...register('aircraftRegistrationHint')}
                  />
                )}
              </div>
            </CardBody>
          </Card>

          {/* Detalles del turno */}
          <Card>
            <CardHeader>
              <CardTitle>Detalles del Turno</CardTitle>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Select
                    label="Tipo de inspección"
                    options={TYPE_OPTIONS}
                    error={errors.requestedType?.message}
                    required
                    {...register('requestedType')}
                  />
                  <Input
                    type="datetime-local"
                    label="Fecha y hora propuesta"
                    error={errors.scheduledDate?.message}
                    required
                    {...register('scheduledDate')}
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-surface-700 dark:text-surface-300">
                    Notas
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Observaciones u otros datos del pedido (opcional)..."
                    className="w-full resize-none rounded-lg border border-surface-300 bg-white px-3 py-2 text-sm outline-none placeholder:text-surface-400 focus:border-aviation-500 focus:ring-2 focus:ring-aviation-500/20 dark:border-surface-600 dark:bg-surface-800 dark:text-white"
                    {...register('notes')}
                  />
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Acciones */}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => navigate(ROUTES.APPOINTMENTS)}>
              Cancelar
            </Button>
            <Button
              type="submit"
              isLoading={isSubmitting || createAppointment.isPending}
              leftIcon={<Save size={15} />}
            >
              Crear Turno
            </Button>
          </div>
        </div>
      </form>
    </motion.div>
  );
}
