export const ROUTES = {
  // Auth
  LOGIN: '/login',

  // Main
  DASHBOARD: '/',

  // Órdenes de Trabajo
  WORK_ORDERS: '/ordenes-de-trabajo',
  WORK_ORDER_NEW: '/ordenes-de-trabajo/nueva',
  WORK_ORDER_DETAIL: '/ordenes-de-trabajo/:id',
  WORK_ORDER_EDIT: '/ordenes-de-trabajo/:id/editar',

  // Aeronaves
  AIRCRAFT: '/aeronaves',
  AIRCRAFT_NEW: '/aeronaves/nueva',
  AIRCRAFT_DETAIL: '/aeronaves/:id',
  AIRCRAFT_EDIT: '/aeronaves/:id/editar',

  // Clientes
  CLIENTS: '/clientes',
  CLIENT_NEW: '/clientes/nuevo',
  CLIENT_DETAIL: '/clientes/:id',
  CLIENT_EDIT: '/clientes/:id/editar',

  // Inspecciones
  INSPECTIONS: '/inspecciones',
  INSPECTION_DETAIL: '/inspecciones/:id',

  // Turnos
  APPOINTMENTS: '/turnos',
  APPOINTMENT_NEW: '/turnos/nuevo',
  APPOINTMENT_EDIT: '/turnos/:id/editar',

  // Taller
  WORKSHOP: '/taller',

  // Pañol / Inventario
  INVENTORY: '/panol',
  INVENTORY_ITEM_NEW: '/panol/nuevo',
  INVENTORY_ITEM_DETAIL: '/panol/:id',
  INVENTORY_ITEM_EDIT: '/panol/:id/editar',

  // Documentación técnica
  TECHNICAL_DOCUMENTS: '/documentacion-tecnica',

  // Presupuestos
  BUDGETS: '/presupuestos',

  // Reportes
  REPORTS: '/reportes',

  // Configuración
  SETTINGS: '/configuracion',
  SETTINGS_USERS: '/configuracion/usuarios',
  SETTINGS_ROLES: '/configuracion/roles',

  // Perfil propio
  PROFILE: '/mi-perfil',

  // 404
} as const;

/** Genera paths con parámetros resueltos */
export const buildRoute = (route: string, params: Record<string, string>): string => {
  return Object.entries(params).reduce(
    (acc, [key, value]) => acc.replace(`:${key}`, value),
    route
  );
};
