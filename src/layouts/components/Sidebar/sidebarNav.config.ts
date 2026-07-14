import {
  LayoutDashboard,
  ClipboardList,
  Plane,
  Users,
  CheckSquare,
  Wrench,
  Package,
  BarChart3,
  Settings,
  CalendarClock,
  FileText,
  Receipt,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { ROUTES } from '@/constants';
import type { UserRole, UserPermissions } from '@/types';

export interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  path: string;
  badge?: number;
  children?: NavItem[];
  requiredPermission?: keyof UserPermissions;
  allowedRoles?: UserRole[];
}

export interface NavSection {
  id: string;
  label: string;
  items: NavItem[];
}

export const NAV_SECTIONS: NavSection[] = [
  {
    id: 'main',
    label: 'Principal',
    items: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        icon: LayoutDashboard,
        path: ROUTES.DASHBOARD,
      },
    ],
  },
  {
    id: 'operations',
    label: 'Operaciones',
    items: [
      {
        id: 'work-orders',
        label: 'Órdenes de Trabajo',
        icon: ClipboardList,
        path: ROUTES.WORK_ORDERS,
        requiredPermission: 'canManageWorkOrders',
      },
      {
        id: 'appointments',
        label: 'Turnos',
        icon: CalendarClock,
        path: ROUTES.APPOINTMENTS,
        requiredPermission: 'canManageWorkOrders',
      },
      {
        id: 'workshop',
        label: 'Taller',
        icon: Wrench,
        path: ROUTES.WORKSHOP,
      },
      {
        id: 'inspections',
        label: 'Inspecciones',
        icon: CheckSquare,
        path: ROUTES.INSPECTIONS,
      },
    ],
  },
  {
    id: 'assets',
    label: 'Activos',
    items: [
      {
        id: 'aircraft',
        label: 'Aeronaves',
        icon: Plane,
        path: ROUTES.AIRCRAFT,
        requiredPermission: 'canManageAircraft',
      },
      {
        id: 'clients',
        label: 'Clientes',
        icon: Users,
        path: ROUTES.CLIENTS,
        requiredPermission: 'canManageClients',
      },
      {
        id: 'inventory',
        label: 'Pañol / Inventario',
        icon: Package,
        path: ROUTES.INVENTORY,
        requiredPermission: 'canManageInventory',
      },
    ],
  },
  {
    id: 'administrative',
    label: 'Administrativo',
    items: [
      {
        // Fase 6 (MVP): presupuestos por cliente, reusa el mismo permiso que ya gestiona Clientes
        id: 'budgets',
        label: 'Presupuestos',
        icon: Receipt,
        path: ROUTES.BUDGETS,
        requiredPermission: 'canManageClients',
      },
    ],
  },
  {
    id: 'analytics',
    label: 'Análisis',
    items: [
      {
        id: 'reports',
        label: 'Reportes',
        icon: BarChart3,
        path: ROUTES.REPORTS,
        requiredPermission: 'canViewReports',
      },
    ],
  },
  {
    id: 'documentation',
    label: 'Documentación',
    items: [
      {
        // Fase 4: repositorio general de manuales/boletines/directivas AD, protegido con el mismo permiso que ya usa "Subir documento" en Aeronaves
        id: 'technical-documents',
        label: 'Documentación Técnica',
        icon: FileText,
        path: ROUTES.TECHNICAL_DOCUMENTS,
        requiredPermission: 'canSignDocuments',
      },
    ],
  },
  {
    id: 'config',
    label: 'Sistema',
    items: [
      {
        id: 'settings',
        label: 'Configuración',
        icon: Settings,
        path: ROUTES.SETTINGS,
        requiredPermission: 'canManageUsers',
      },
    ],
  },
];
