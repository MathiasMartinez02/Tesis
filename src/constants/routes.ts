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
  // MODIFICADO: se eliminó INSPECTION_NEW porque la programación de inspecciones ahora se hace desde el detalle de la OT, no desde una página independiente
  // ANTERIOR: incluía INSPECTION_NEW: '/inspecciones/nueva'
  INSPECTIONS: '/inspecciones',
  INSPECTION_DETAIL: '/inspecciones/:id',

  // Turnos
  APPOINTMENTS: '/turnos',
  APPOINTMENT_NEW: '/turnos/nuevo',

  // Taller
  WORKSHOP: '/taller',

  // Pañol / Inventario
  INVENTORY: '/panol',
  INVENTORY_ITEM_NEW: '/panol/nuevo',
  INVENTORY_ITEM_DETAIL: '/panol/:id',
  INVENTORY_ITEM_EDIT: '/panol/:id/editar',

  // Documentación técnica
  TECHNICAL_DOCUMENTS: '/documentacion-tecnica',

  // Presupuestos (Fase 6, MVP Administrativo)
  BUDGETS: '/presupuestos',

  // Reportes
  REPORTS: '/reportes',

  // Configuración
  // MODIFICADO: se quita SETTINGS_SYSTEM (Fase 7): no existe ningun caso de uso real de "parametros del sistema" en el backend hoy,
  // se documenta como decision de alcance en PLAN_ANALISIS_FUNCIONAL.md en vez de dejar una ruta/tarjeta apuntando a una pantalla vacia.
  // ANTERIOR: incluia tambien SETTINGS_SYSTEM: '/configuracion/sistema'
  SETTINGS: '/configuracion',
  SETTINGS_USERS: '/configuracion/usuarios',
  SETTINGS_ROLES: '/configuracion/roles',

  // Perfil propio (Fase 8): antes el boton "Mi Perfil" del Navbar no navegaba a ningun lado
  PROFILE: '/mi-perfil',

  // 404
  NOT_FOUND: '/404',
} as const;

/** Genera paths con parámetros resueltos */
export const buildRoute = (route: string, params: Record<string, string>): string => {
  return Object.entries(params).reduce(
    (acc, [key, value]) => acc.replace(`:${key}`, value),
    route
  );
};
