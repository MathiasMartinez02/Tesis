import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Building2, Mail, Phone, MapPin, Plane, ClipboardList, Pencil, Power } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/shared/components/ui/Button';
import { Card, CardHeader, CardTitle, CardBody } from '@/shared/components/ui/Card';
import { ErrorState } from '@/shared/components/ErrorState/ErrorState';
import { PageLoader } from '@/shared/components/PageLoader/PageLoader';
import { PageHeader } from '@/shared/components/PageHeader/PageHeader';
import { useClient, useUpdateClientStatus } from '../hooks/useClients';
import { ROUTES, buildRoute } from '@/constants';
import { formatDate } from '@/lib/utils';

// Pagina de detalle de un cliente: datos fiscales/contacto, aeronaves asociadas y OT recientes
export function ClientDetailPage(): JSX.Element {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: client, isLoading, isError, refetch } = useClient(id ?? '');
  const { mutate: updateStatus, isPending: isUpdatingStatus } = useUpdateClientStatus();

  if (isLoading) return <PageLoader />;
  if (isError || !client) {
    return <ErrorState title="Cliente no encontrado" onRetry={() => void refetch()} />;
  }

  // Alterna el estado activo/inactivo del cliente mediante el endpoint de status
  const handleToggleStatus = (): void => {
    updateStatus({ id: client.id, isActive: !client.isActive });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-5"
    >
      <PageHeader
        title={client.name}
        description={client.businessName}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<ArrowLeft size={14} />}
              onClick={() => navigate(ROUTES.CLIENTS)}
            >
              Volver
            </Button>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Pencil size={14} />}
              onClick={() => navigate(buildRoute(ROUTES.CLIENT_EDIT, { id: client.id }))}
            >
              Editar
            </Button>
            <Button
              variant={client.isActive ? 'destructive' : 'success'}
              size="sm"
              leftIcon={<Power size={14} />}
              isLoading={isUpdatingStatus}
              onClick={handleToggleStatus}
            >
              {client.isActive ? 'Desactivar' : 'Activar'}
            </Button>
          </div>
        }
      />

      <div className="flex items-center gap-2">
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
            client.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'
          }`}
        >
          {client.isActive ? 'Activo' : 'Inactivo'}
        </span>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          {/* Datos fiscales y de contacto */}
          <Card>
            <CardHeader>
              <CardTitle>Datos Fiscales y de Contacto</CardTitle>
              <Building2 size={16} className="text-surface-400" />
            </CardHeader>
            <CardBody>
              <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3 text-sm">
                <div>
                  <dt className="font-semibold text-surface-400 text-xs uppercase tracking-wide">CUIT</dt>
                  <dd className="mt-1 font-mono text-surface-900 dark:text-white">{client.taxId}</dd>
                </div>
                <div className="flex items-start gap-1.5">
                  <div>
                    <dt className="font-semibold text-surface-400 text-xs uppercase tracking-wide">Email</dt>
                    <dd className="mt-1 flex items-center gap-1 text-surface-700 dark:text-surface-300">
                      <Mail size={12} className="text-surface-400" />
                      {client.email}
                    </dd>
                  </div>
                </div>
                <div>
                  <dt className="font-semibold text-surface-400 text-xs uppercase tracking-wide">Teléfono</dt>
                  <dd className="mt-1 flex items-center gap-1 text-surface-700 dark:text-surface-300">
                    <Phone size={12} className="text-surface-400" />
                    {client.phone}
                  </dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="font-semibold text-surface-400 text-xs uppercase tracking-wide">Dirección</dt>
                  <dd className="mt-1 flex items-center gap-1 text-surface-700 dark:text-surface-300">
                    <MapPin size={12} className="text-surface-400" />
                    {client.address}, {client.city}, {client.province}
                  </dd>
                </div>
                {client.contactPerson && (
                  <div>
                    <dt className="font-semibold text-surface-400 text-xs uppercase tracking-wide">Contacto</dt>
                    <dd className="mt-1 text-surface-700 dark:text-surface-300">
                      {client.contactPerson}
                      {client.contactPhone && ` · ${client.contactPhone}`}
                    </dd>
                  </div>
                )}
              </dl>
            </CardBody>
          </Card>

          {/* Aeronaves asociadas al cliente */}
          <Card>
            <CardHeader>
              <CardTitle>Aeronaves</CardTitle>
              <Plane size={16} className="text-surface-400" />
            </CardHeader>
            <CardBody>
              {client.aircraft.length === 0 ? (
                <p className="text-sm text-surface-400 italic">Sin aeronaves asociadas</p>
              ) : (
                <div className="space-y-2">
                  {client.aircraft.map((ac) => (
                    <button
                      key={ac.id}
                      type="button"
                      onClick={() => navigate(buildRoute(ROUTES.AIRCRAFT_DETAIL, { id: ac.id }))}
                      className="flex w-full items-center justify-between rounded-lg border border-surface-200 bg-surface-50 px-3 py-2 text-left transition-colors hover:bg-surface-100 dark:border-surface-700 dark:bg-surface-800/50 dark:hover:bg-surface-800"
                    >
                      <div>
                        <p className="text-sm font-semibold text-surface-900 dark:text-white">{ac.registration}</p>
                        <p className="text-xs text-surface-500">{ac.model}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-surface-500">{ac.status}</p>
                        <p className="text-xs text-surface-400">{ac.totalFlightHours}h</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>

          {/* Órdenes de trabajo recientes del cliente */}
          <Card>
            <CardHeader>
              <CardTitle>Órdenes de Trabajo Recientes</CardTitle>
              <ClipboardList size={16} className="text-surface-400" />
            </CardHeader>
            <CardBody>
              {client.recentWorkOrders.length === 0 ? (
                <p className="text-sm text-surface-400 italic">Sin órdenes de trabajo registradas</p>
              ) : (
                <div className="space-y-2">
                  {client.recentWorkOrders.map((wo) => (
                    <button
                      key={wo.id}
                      type="button"
                      onClick={() => navigate(buildRoute(ROUTES.WORK_ORDER_DETAIL, { id: wo.id }))}
                      className="flex w-full items-center justify-between rounded-lg border border-surface-200 bg-surface-50 px-3 py-2 text-left transition-colors hover:bg-surface-100 dark:border-surface-700 dark:bg-surface-800/50 dark:hover:bg-surface-800"
                    >
                      <div>
                        <p className="text-sm font-semibold text-aviation-600">{wo.number}</p>
                        <p className="text-xs text-surface-500">{wo.type}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-surface-500">{wo.status}</p>
                        <p className="text-xs text-surface-400">{formatDate(wo.createdAt)}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        {/* Sidebar con resumen */}
        <div className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle>Resumen</CardTitle>
            </CardHeader>
            <CardBody>
              <dl className="space-y-3 text-sm">
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-surface-400">Aeronaves</dt>
                  <dd className="mt-0.5 font-medium text-surface-900 dark:text-white">{client.aircraftCount}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-surface-400">Órdenes de trabajo</dt>
                  <dd className="mt-0.5 font-medium text-surface-900 dark:text-white">{client.totalWorkOrders}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-surface-400">Cliente desde</dt>
                  <dd className="mt-0.5 font-medium text-surface-900 dark:text-white">{formatDate(client.createdAt)}</dd>
                </div>
              </dl>
            </CardBody>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}
