import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Plane, Pencil, History } from 'lucide-react';
import { motion } from 'framer-motion';
import { PageHeader } from '@/shared/components/PageHeader/PageHeader';
import { Button } from '@/shared/components/ui/Button';
import { StatusBadge } from '@/shared/components/StatusBadge/StatusBadge';
import { SearchInput } from '@/shared/components/SearchInput/SearchInput';
import { ErrorState } from '@/shared/components/ErrorState/ErrorState';
import { Spinner } from '@/shared/components/ui/Spinner';
import { EmptyState } from '@/shared/components/EmptyState/EmptyState';
import { useAircraft } from '../hooks/useAircraft';
import { buildRoute, ROUTES } from '@/constants';
import { formatDate, formatFlightHours, daysUntil, cn } from '@/lib/utils';
import type { Aircraft, AircraftFilters } from '@/types';

const CATEGORY_LABELS = {
  Avion: 'Avión',
  Helicoptero: 'Helicóptero',
  Planeador: 'Planeador',
  Ultraliviano: 'Ultraliviano',
} as const;

// MODIFICADO: agrega props onEdit y onViewHistory para los botones "Editar" y "Ver historial" de cada tarjeta
// ANTERIOR: solo recibía onClick para navegar al detalle
function AircraftCard({
  aircraft,
  onClick,
  onEdit,
  onViewHistory,
}: {
  aircraft: Aircraft;
  onClick: () => void;
  onEdit: () => void;
  onViewHistory: () => void;
}): JSX.Element {
  const daysToInspection = aircraft.nextInspectionDue ? daysUntil(aircraft.nextInspectionDue) : null;
  const isInspectionUrgent = daysToInspection !== null && daysToInspection <= 30;

  return (
    <motion.article
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      onClick={onClick}
      className="cursor-pointer rounded-xl border border-surface-200 bg-white p-5 shadow-card transition-shadow hover:shadow-card-hover dark:border-surface-700 dark:bg-surface-800"
      aria-label={`Aeronave ${aircraft.registration}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-aviation-50">
            <Plane size={20} className="text-aviation-600" aria-hidden />
          </div>
          <div>
            <p className="text-lg font-bold tracking-wide text-surface-900 dark:text-white">
              {aircraft.registration}
            </p>
            <p className="text-sm text-surface-500">
              {aircraft.manufacturer} · {aircraft.model}
            </p>
          </div>
        </div>
        <StatusBadge type="aircraft" status={aircraft.status} />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 border-t border-surface-100 pt-4 dark:border-surface-700">
        <div>
          <p className="text-2xs font-semibold uppercase tracking-wide text-surface-400">
            Horas totales
          </p>
          <p className="mt-0.5 text-sm font-semibold text-surface-900 dark:text-white">
            {formatFlightHours(aircraft.totalFlightHours)}
          </p>
        </div>
        <div>
          <p className="text-2xs font-semibold uppercase tracking-wide text-surface-400">
            Próx. inspección
          </p>
          <p
            className={cn(
              'mt-0.5 text-sm font-semibold',
              isInspectionUrgent
                ? daysToInspection !== null && daysToInspection < 0
                  ? 'text-red-600'
                  : 'text-amber-600'
                : 'text-surface-900 dark:text-white'
            )}
          >
            {aircraft.nextInspectionDue ? formatDate(aircraft.nextInspectionDue) : '—'}
          </p>
        </div>
        <div>
          <p className="text-2xs font-semibold uppercase tracking-wide text-surface-400">
            Tipo
          </p>
          <p className="mt-0.5 text-sm text-surface-700 dark:text-surface-300">
            {CATEGORY_LABELS[aircraft.category]}
          </p>
        </div>
        <div>
          <p className="text-2xs font-semibold uppercase tracking-wide text-surface-400">
            Cliente
          </p>
          <p className="mt-0.5 truncate text-sm text-surface-700 dark:text-surface-300">
            {aircraft.clientName}
          </p>
        </div>
      </div>

      {isInspectionUrgent && daysToInspection !== null && (
        <div
          className={cn(
            'mt-3 rounded-lg px-3 py-1.5 text-xs font-medium',
            daysToInspection < 0
              ? 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'
              : 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400'
          )}
        >
          {daysToInspection < 0
            ? `Inspección vencida hace ${Math.abs(daysToInspection)} días`
            : `Inspección en ${daysToInspection} días`}
        </div>
      )}

      {/* Acciones: editar y ver historial de mantenimiento (navegan sin disparar el onClick de la tarjeta) */}
      <div className="mt-3 flex gap-2 border-t border-surface-100 pt-3 dark:border-surface-700">
        <Button
          variant="ghost"
          size="sm"
          leftIcon={<Pencil size={13} />}
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
        >
          Editar
        </Button>
        <Button
          variant="ghost"
          size="sm"
          leftIcon={<History size={13} />}
          onClick={(e) => {
            e.stopPropagation();
            onViewHistory();
          }}
        >
          Ver historial
        </Button>
      </div>
    </motion.article>
  );
}

export function AircraftListPage(): JSX.Element {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<AircraftFilters>({});

  const { data, isLoading, isError, refetch } = useAircraft(filters);

  if (isError) {
    return (
      <ErrorState
        title="Error al cargar aeronaves"
        onRetry={() => void refetch()}
      />
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-5"
    >
      <PageHeader
        title="Aeronaves"
        description={`${data?.total ?? 0} aeronaves registradas`}
        actions={
          <Button size="sm" leftIcon={<Plus size={15} />} onClick={() => navigate(ROUTES.AIRCRAFT_NEW)}>
            Nueva Aeronave
          </Button>
        }
      />

      {/* Filtros */}
      <div className="flex items-center gap-3">
        <SearchInput
          value={filters.search ?? ''}
          onChange={(v) => setFilters((f) => ({ ...f, search: v || undefined }))}
          placeholder="Buscar por matrícula, modelo o cliente..."
          className="w-72"
        />
      </div>

      {/* Grid de aeronaves */}
      {isLoading ? (
        <div className="flex h-40 items-center justify-center">
          <Spinner size="lg" />
        </div>
      ) : data?.data.length === 0 ? (
        <EmptyState
          icon={Plane}
          title="Sin aeronaves"
          description="No hay aeronaves registradas para los filtros seleccionados."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {data?.data.map((aircraft) => (
            <AircraftCard
              key={aircraft.id}
              aircraft={aircraft}
              onClick={() => navigate(buildRoute(ROUTES.AIRCRAFT_DETAIL, { id: aircraft.id }))}
              onEdit={() => navigate(buildRoute(ROUTES.AIRCRAFT_EDIT, { id: aircraft.id }))}
              onViewHistory={() => navigate(buildRoute(ROUTES.AIRCRAFT_DETAIL, { id: aircraft.id }))}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}
