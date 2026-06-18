import type { UserRole, UserPermissions } from '@/types';

export const ROLE_LABELS: Record<UserRole, string> = {
  Gerente: 'Gerente',
  OficinaTecnica: 'Oficina Técnica',
  Inspector: 'Inspector',
  JefeTaller: 'Jefe de Taller',
  Mecanico: 'Mecánico',
  Panol: 'Pañolero',
  Administracion: 'Administración',
};

export const ROLE_COLORS: Record<UserRole, string> = {
  Gerente: 'bg-purple-100 text-purple-800',
  OficinaTecnica: 'bg-blue-100 text-blue-800',
  Inspector: 'bg-emerald-100 text-emerald-800',
  JefeTaller: 'bg-orange-100 text-orange-800',
  Mecanico: 'bg-gray-100 text-gray-800',
  Panol: 'bg-yellow-100 text-yellow-800',
  Administracion: 'bg-pink-100 text-pink-800',
};

export const ROLE_PERMISSIONS: Record<UserRole, UserPermissions> = {
  // Acceso total al sistema
  Gerente: {
    canViewDashboard: true,
    canManageWorkOrders: true,
    canApproveInspections: true,
    canManageInventory: true,
    canManageUsers: true,
    canViewReports: true,
    canManageAircraft: true,
    canManageClients: true,
    canSignDocuments: true,
  },
  // Planificación técnica: OTs, aeronaves, clientes, reportes
  OficinaTecnica: {
    canViewDashboard: true,
    canManageWorkOrders: true,
    canApproveInspections: false,
    canManageInventory: false,
    canManageUsers: false,
    canViewReports: true,
    canManageAircraft: true,
    canManageClients: true,
    canSignDocuments: true,
  },
  // Dominio de inspecciones: aprueba, firma y ve OTs y aeronaves como contexto
  Inspector: {
    canViewDashboard: true,
    canManageWorkOrders: true,
    canApproveInspections: true,
    canManageInventory: false,
    canManageUsers: false,
    canViewReports: true,
    canManageAircraft: true,
    canManageClients: false,
    canSignDocuments: true,
  },
  // Dominio del taller: OTs, inventario, aeronaves y reportes operativos
  JefeTaller: {
    canViewDashboard: true,
    canManageWorkOrders: true,
    canApproveInspections: false,
    canManageInventory: true,
    canManageUsers: false,
    canViewReports: true,
    canManageAircraft: true,
    canManageClients: false,
    canSignDocuments: false,
  },
  // Ejecuta tareas en el taller: ve y actualiza sus OTs asignadas
  Mecanico: {
    canViewDashboard: true,
    canManageWorkOrders: true,
    canApproveInspections: false,
    canManageInventory: false,
    canManageUsers: false,
    canViewReports: false,
    canManageAircraft: false,
    canManageClients: false,
    canSignDocuments: false,
  },
  // Dominio del pañol: inventario y sus reportes
  Panol: {
    canViewDashboard: true,
    canManageWorkOrders: false,
    canApproveInspections: false,
    canManageInventory: true,
    canManageUsers: false,
    canViewReports: true,
    canManageAircraft: false,
    canManageClients: false,
    canSignDocuments: false,
  },
  // Administración: usuarios, clientes y reportes (sin acceso operativo)
  Administracion: {
    canViewDashboard: true,
    canManageWorkOrders: false,
    canApproveInspections: false,
    canManageInventory: false,
    canManageUsers: true,
    canViewReports: true,
    canManageAircraft: false,
    canManageClients: true,
    canSignDocuments: false,
  },
};
