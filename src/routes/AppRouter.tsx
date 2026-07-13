import { lazy, Suspense } from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { ROUTES } from '@/constants';
import { ProtectedRoute } from './ProtectedRoute';
import { MainLayout } from '@/layouts/MainLayout';
import { AuthLayout } from '@/layouts/AuthLayout';
import { PageLoader } from '@/shared/components/PageLoader/PageLoader';

// ─── Lazy imports - Code Splitting por módulo ─────────────────────────────────

const LoginPage = lazy(() =>
  import('@/modules/auth/pages/LoginPage').then((m) => ({ default: m.LoginPage }))
);

const DashboardPage = lazy(() =>
  import('@/modules/dashboard/pages/DashboardPage').then((m) => ({ default: m.DashboardPage }))
);

const WorkOrdersListPage = lazy(() =>
  import('@/modules/workOrders/pages/WorkOrdersListPage').then((m) => ({
    default: m.WorkOrdersListPage,
  }))
);

const WorkOrderDetailPage = lazy(() =>
  import('@/modules/workOrders/pages/WorkOrderDetailPage').then((m) => ({
    default: m.WorkOrderDetailPage,
  }))
);

const WorkOrderNewPage = lazy(() =>
  import('@/modules/workOrders/pages/WorkOrderNewPage').then((m) => ({
    default: m.WorkOrderNewPage,
  }))
);

const WorkOrderEditPage = lazy(() =>
  import('@/modules/workOrders/pages/WorkOrderEditPage').then((m) => ({
    default: m.WorkOrderEditPage,
  }))
);

const AircraftListPage = lazy(() =>
  import('@/modules/aircraft/pages/AircraftListPage').then((m) => ({
    default: m.AircraftListPage,
  }))
);

const AircraftNewPage = lazy(() =>
  import('@/modules/aircraft/pages/AircraftNewPage').then((m) => ({
    default: m.AircraftNewPage,
  }))
);

const AircraftDetailPage = lazy(() =>
  import('@/modules/aircraft/pages/AircraftDetailPage').then((m) => ({
    default: m.AircraftDetailPage,
  }))
);

const AircraftEditPage = lazy(() =>
  import('@/modules/aircraft/pages/AircraftEditPage').then((m) => ({
    default: m.AircraftEditPage,
  }))
);

const ClientsListPage = lazy(() =>
  import('@/modules/clients/pages/ClientsListPage').then((m) => ({
    default: m.ClientsListPage,
  }))
);

const ClientNewPage = lazy(() =>
  import('@/modules/clients/pages/ClientNewPage').then((m) => ({
    default: m.ClientNewPage,
  }))
);

const ClientDetailPage = lazy(() =>
  import('@/modules/clients/pages/ClientDetailPage').then((m) => ({
    default: m.ClientDetailPage,
  }))
);

const ClientEditPage = lazy(() =>
  import('@/modules/clients/pages/ClientEditPage').then((m) => ({
    default: m.ClientEditPage,
  }))
);

const InspectionsListPage = lazy(() =>
  import('@/modules/inspections/pages/InspectionsListPage').then((m) => ({
    default: m.InspectionsListPage,
  }))
);

const InspectionDetailPage = lazy(() =>
  import('@/modules/inspections/pages/InspectionDetailPage').then((m) => ({
    default: m.InspectionDetailPage,
  }))
);

const AppointmentsListPage = lazy(() =>
  import('@/modules/appointments/pages/AppointmentsListPage').then((m) => ({
    default: m.AppointmentsListPage,
  }))
);

const AppointmentNewPage = lazy(() =>
  import('@/modules/appointments/pages/AppointmentNewPage').then((m) => ({
    default: m.AppointmentNewPage,
  }))
);

const WorkshopPage = lazy(() =>
  import('@/modules/workshop/pages/WorkshopPage').then((m) => ({ default: m.WorkshopPage }))
);

const InventoryListPage = lazy(() =>
  import('@/modules/inventory/pages/InventoryListPage').then((m) => ({
    default: m.InventoryListPage,
  }))
);

const InventoryItemNewPage = lazy(() =>
  import('@/modules/inventory/pages/InventoryItemNewPage').then((m) => ({
    default: m.InventoryItemNewPage,
  }))
);

const InventoryItemDetailPage = lazy(() =>
  import('@/modules/inventory/pages/InventoryItemDetailPage').then((m) => ({
    default: m.InventoryItemDetailPage,
  }))
);

const InventoryItemEditPage = lazy(() =>
  import('@/modules/inventory/pages/InventoryItemEditPage').then((m) => ({
    default: m.InventoryItemEditPage,
  }))
);

const ReportsPage = lazy(() =>
  import('@/modules/reports/pages/ReportsPage').then((m) => ({ default: m.ReportsPage }))
);

const SettingsPage = lazy(() =>
  import('@/modules/settings/pages/SettingsPage').then((m) => ({ default: m.SettingsPage }))
);

// ─── Router config ────────────────────────────────────────────────────────────

const router = createBrowserRouter([
  // Auth routes
  {
    element: <AuthLayout />,
    children: [
      {
        path: ROUTES.LOGIN,
        element: (
          <Suspense fallback={<PageLoader />}>
            <LoginPage />
          </Suspense>
        ),
      },
    ],
  },

  // Protected routes
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <MainLayout />,
        children: [
          {
            path: ROUTES.DASHBOARD,
            element: (
              <Suspense fallback={<PageLoader />}>
                <DashboardPage />
              </Suspense>
            ),
          },
          {
            path: ROUTES.WORK_ORDERS,
            element: (
              <Suspense fallback={<PageLoader />}>
                <WorkOrdersListPage />
              </Suspense>
            ),
          },
          {
            path: ROUTES.WORK_ORDER_NEW,
            element: (
              <Suspense fallback={<PageLoader />}>
                <WorkOrderNewPage />
              </Suspense>
            ),
          },
          {
            path: ROUTES.WORK_ORDER_DETAIL,
            element: (
              <Suspense fallback={<PageLoader />}>
                <WorkOrderDetailPage />
              </Suspense>
            ),
          },
          {
            path: ROUTES.WORK_ORDER_EDIT,
            element: (
              <Suspense fallback={<PageLoader />}>
                <WorkOrderEditPage />
              </Suspense>
            ),
          },
          {
            path: ROUTES.AIRCRAFT,
            element: (
              <Suspense fallback={<PageLoader />}>
                <AircraftListPage />
              </Suspense>
            ),
          },
          {
            path: ROUTES.AIRCRAFT_NEW,
            element: (
              <Suspense fallback={<PageLoader />}>
                <AircraftNewPage />
              </Suspense>
            ),
          },
          {
            path: ROUTES.AIRCRAFT_DETAIL,
            element: (
              <Suspense fallback={<PageLoader />}>
                <AircraftDetailPage />
              </Suspense>
            ),
          },
          {
            path: ROUTES.AIRCRAFT_EDIT,
            element: (
              <Suspense fallback={<PageLoader />}>
                <AircraftEditPage />
              </Suspense>
            ),
          },
          {
            path: ROUTES.CLIENTS,
            element: (
              <Suspense fallback={<PageLoader />}>
                <ClientsListPage />
              </Suspense>
            ),
          },
          {
            path: ROUTES.CLIENT_NEW,
            element: (
              <Suspense fallback={<PageLoader />}>
                <ClientNewPage />
              </Suspense>
            ),
          },
          {
            path: ROUTES.CLIENT_DETAIL,
            element: (
              <Suspense fallback={<PageLoader />}>
                <ClientDetailPage />
              </Suspense>
            ),
          },
          {
            path: ROUTES.CLIENT_EDIT,
            element: (
              <Suspense fallback={<PageLoader />}>
                <ClientEditPage />
              </Suspense>
            ),
          },
          {
            path: ROUTES.INSPECTIONS,
            element: (
              <Suspense fallback={<PageLoader />}>
                <InspectionsListPage />
              </Suspense>
            ),
          },
          {
            path: ROUTES.INSPECTION_DETAIL,
            element: (
              <Suspense fallback={<PageLoader />}>
                <InspectionDetailPage />
              </Suspense>
            ),
          },
          {
            path: ROUTES.APPOINTMENTS,
            element: (
              <Suspense fallback={<PageLoader />}>
                <AppointmentsListPage />
              </Suspense>
            ),
          },
          {
            path: ROUTES.APPOINTMENT_NEW,
            element: (
              <Suspense fallback={<PageLoader />}>
                <AppointmentNewPage />
              </Suspense>
            ),
          },
          {
            path: ROUTES.WORKSHOP,
            element: (
              <Suspense fallback={<PageLoader />}>
                <WorkshopPage />
              </Suspense>
            ),
          },
          {
            path: ROUTES.INVENTORY,
            element: (
              <Suspense fallback={<PageLoader />}>
                <InventoryListPage />
              </Suspense>
            ),
          },
          {
            path: ROUTES.INVENTORY_ITEM_NEW,
            element: (
              <Suspense fallback={<PageLoader />}>
                <InventoryItemNewPage />
              </Suspense>
            ),
          },
          {
            path: ROUTES.INVENTORY_ITEM_DETAIL,
            element: (
              <Suspense fallback={<PageLoader />}>
                <InventoryItemDetailPage />
              </Suspense>
            ),
          },
          {
            path: ROUTES.INVENTORY_ITEM_EDIT,
            element: (
              <Suspense fallback={<PageLoader />}>
                <InventoryItemEditPage />
              </Suspense>
            ),
          },
          {
            path: ROUTES.REPORTS,
            element: (
              <Suspense fallback={<PageLoader />}>
                <ReportsPage />
              </Suspense>
            ),
          },
          {
            path: ROUTES.SETTINGS,
            element: (
              <Suspense fallback={<PageLoader />}>
                <SettingsPage />
              </Suspense>
            ),
          },
          {
            path: '*',
            element: <Navigate to={ROUTES.DASHBOARD} replace />,
          },
        ],
      },
    ],
  },
]);

export function AppRouter(): JSX.Element {
  return <RouterProvider router={router} />;
}
