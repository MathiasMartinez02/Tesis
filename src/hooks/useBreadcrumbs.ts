import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';

interface Breadcrumb {
  label: string;
  path: string;
}

const ROUTE_LABELS: Record<string, string> = {
  '': 'Dashboard',
  'ordenes-de-trabajo': 'Órdenes de Trabajo',
  nueva: 'Nueva',
  'aeronaves': 'Aeronaves',
  'clientes': 'Clientes',
  'inspecciones': 'Inspecciones',
  'taller': 'Taller',
  'panol': 'Pañol',
  'reportes': 'Reportes',
  'configuracion': 'Configuración',
  'usuarios': 'Usuarios',
  'roles': 'Roles',
  'sistema': 'Sistema',
};

/**
 * Genera breadcrumbs automáticamente basados en el path actual.
 */
export function useBreadcrumbs(): Breadcrumb[] {
  const { pathname } = useLocation();

  return useMemo(() => {
    const segments = pathname.split('/').filter(Boolean);

    if (segments.length === 0) {
      return [{ label: 'Dashboard', path: '/' }];
    }

    const crumbs: Breadcrumb[] = [{ label: 'Dashboard', path: '/' }];

    let currentPath = '';
    for (const segment of segments) {
      currentPath += `/${segment}`;

      // Si el segmento es un ID (UUID o número), usar "Detalle"
      const isId = /^[0-9a-f-]{8,}$|^\d+$/.test(segment);
      const label = isId ? 'Detalle' : (ROUTE_LABELS[segment] ?? segment);

      crumbs.push({ label, path: currentPath });
    }

    return crumbs;
  }, [pathname]);
}
