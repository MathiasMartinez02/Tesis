import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Plane, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/store/uiStore';
import { useAuthStore, selectUser, selectUserPermissions } from '@/store/authStore';
import { getInitials } from '@/lib/utils';
import { ROLE_LABELS } from '@/constants';
import { NAV_SECTIONS } from './sidebarNav.config';
import { SidebarNavItem } from './SidebarNavItem';

export function Sidebar(): JSX.Element {
  const collapsed = useUIStore((s) => s.sidebarCollapsed);
  const mobileOpen = useUIStore((s) => s.sidebarMobileOpen);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const setMobileOpen = useUIStore((s) => s.setSidebarMobileOpen);
  const user = useAuthStore(selectUser);
  const permissions = useAuthStore(selectUserPermissions);

  // Cerrar sidebar mobile al cambiar tamaño
  useEffect(() => {
    const handleResize = (): void => {
      if (window.innerWidth >= 1024) {
        setMobileOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setMobileOpen]);

  const sidebarContent = (
    <div
      className={cn(
        'flex h-full flex-col bg-surface-900 transition-all duration-300',
        collapsed ? 'w-sidebar-collapsed' : 'w-sidebar'
      )}
    >
      {/* ── Logo ────────────────────────────────────────────────────── */}
      <div className="flex h-navbar items-center justify-between border-b border-surface-700/50 px-4">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-aviation">
            <Plane size={16} className="text-white" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="truncate text-sm font-bold tracking-tight text-white">SIGMA</p>
              <p className="truncate text-2xs text-surface-400">Gestión Aeronáutica</p>
            </div>
          )}
        </div>

        {/* Toggle collapse - solo desktop */}
        <button
          onClick={toggleSidebar}
          aria-label={collapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
          className="hidden shrink-0 rounded-md p-1 text-surface-400 transition-colors hover:bg-surface-700 hover:text-white lg:flex"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>

        {/* Cerrar en mobile */}
        <button
          onClick={() => setMobileOpen(false)}
          aria-label="Cerrar menú"
          className="shrink-0 rounded-md p-1 text-surface-400 hover:bg-surface-700 hover:text-white lg:hidden"
        >
          <X size={18} />
        </button>
      </div>

      {/* ── Navegación ──────────────────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4 scrollbar-thin" aria-label="Navegación principal">
        {NAV_SECTIONS.map((section) => {
          // Filtrar items por permisos
          const visibleItems = section.items.filter((item) => {
            if (!item.requiredPermission) return true;
            return permissions?.[item.requiredPermission] === true;
          });

          if (visibleItems.length === 0) return null;

          return (
            <div key={section.id} className="mb-6 px-3">
              {/* Label de sección */}
              {!collapsed && (
                <p className="mb-1.5 px-3 text-2xs font-semibold uppercase tracking-widest text-surface-500">
                  {section.label}
                </p>
              )}
              {collapsed && (
                <div className="mb-1.5 flex justify-center">
                  <div className="h-px w-6 bg-surface-700" />
                </div>
              )}

              <div className="space-y-0.5">
                {visibleItems.map((item) => (
                  <SidebarNavItem key={item.id} item={item} collapsed={collapsed} />
                ))}
              </div>
            </div>
          );
        })}
      </nav>

      {/* ── Usuario ─────────────────────────────────────────────────── */}
      {user && (
        <div className="border-t border-surface-700/50 p-3">
          <div
            className={cn(
              'flex items-center gap-3 rounded-lg p-2',
              'hover:bg-surface-700/50 transition-colors cursor-pointer'
            )}
          >
            {/* Avatar */}
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-aviation-600 text-xs font-semibold text-white">
              {getInitials(`${user.firstName} ${user.lastName}`)}
            </div>

            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-white">
                  {user.firstName} {user.lastName}
                </p>
                <p className="truncate text-2xs text-surface-400">
                  {ROLE_LABELS[user.role]}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* ── Desktop Sidebar ─────────────────────────────────────────── */}
      <aside className="hidden lg:flex lg:flex-col" aria-label="Sidebar principal">
        {sidebarContent}
      </aside>

      {/* ── Mobile Overlay + Sidebar ────────────────────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileOpen(false)}
              aria-hidden
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed inset-y-0 left-0 z-50 flex flex-col lg:hidden"
              aria-label="Sidebar móvil"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
