import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Bell, Search, Sun, Moon, LogOut, User, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn, getInitials } from '@/lib/utils';
import { useUIStore } from '@/store/uiStore';
import { useAuthStore, selectUser } from '@/store/authStore';
import { ROLE_LABELS, ROUTES } from '@/constants';
import { useBreadcrumbs } from '@/hooks/useBreadcrumbs';

export function Navbar(): JSX.Element {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const navigate = useNavigate();
  const setMobileOpen = useUIStore((s) => s.setSidebarMobileOpen);
  const theme = useUIStore((s) => s.theme);
  const setTheme = useUIStore((s) => s.setTheme);
  const user = useAuthStore(selectUser);
  const logout = useAuthStore((s) => s.logout);
  const breadcrumbs = useBreadcrumbs();

  const handleLogout = (): void => {
    logout();
    navigate(ROUTES.LOGIN);
  };

  const toggleTheme = (): void => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <header className="flex h-navbar items-center justify-between border-b border-surface-200 bg-white px-4 lg:px-6 dark:border-surface-700 dark:bg-surface-900">
      {/* ── Izquierda: Burger + Breadcrumbs ─────────────────────────── */}
      <div className="flex items-center gap-3">
        {/* Mobile burger */}
        <button
          onClick={() => setMobileOpen(true)}
          aria-label="Abrir menú"
          className="rounded-md p-1.5 text-surface-500 hover:bg-surface-100 hover:text-surface-900 lg:hidden dark:hover:bg-surface-700 dark:hover:text-white"
        >
          <Menu size={20} />
        </button>

        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="hidden sm:flex">
          <ol className="flex items-center gap-1.5 text-sm">
            {breadcrumbs.map((crumb, index) => (
              <li key={crumb.path} className="flex items-center gap-1.5">
                {index > 0 && (
                  <span className="text-surface-300 dark:text-surface-600">/</span>
                )}
                {index === breadcrumbs.length - 1 ? (
                  <span className="font-medium text-surface-900 dark:text-white">
                    {crumb.label}
                  </span>
                ) : (
                  <button
                    onClick={() => navigate(crumb.path)}
                    className="text-surface-500 hover:text-surface-900 dark:text-surface-400 dark:hover:text-white"
                  >
                    {crumb.label}
                  </button>
                )}
              </li>
            ))}
          </ol>
        </nav>
      </div>

      {/* ── Derecha: Acciones ────────────────────────────────────────── */}
      <div className="flex items-center gap-1">
        {/* Búsqueda global */}
        <button
          onClick={() => setSearchOpen(!searchOpen)}
          aria-label="Búsqueda global"
          className="rounded-md p-2 text-surface-500 hover:bg-surface-100 hover:text-surface-900 dark:hover:bg-surface-700 dark:hover:text-white"
        >
          <Search size={18} />
        </button>

        {/* Toggle theme */}
        <button
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
          className="rounded-md p-2 text-surface-500 hover:bg-surface-100 hover:text-surface-900 dark:hover:bg-surface-700 dark:hover:text-white"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Notificaciones */}
        <button
          aria-label="Notificaciones"
          className="relative rounded-md p-2 text-surface-500 hover:bg-surface-100 hover:text-surface-900 dark:hover:bg-surface-700 dark:hover:text-white"
        >
          <Bell size={18} />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" aria-label="Tienes notificaciones" />
        </button>

        {/* Separador */}
        <div className="mx-1 h-6 w-px bg-surface-200 dark:bg-surface-700" />

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            aria-expanded={userMenuOpen}
            aria-haspopup="true"
            className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-surface-100 dark:hover:bg-surface-700"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-aviation-600 text-xs font-semibold text-white">
              {user ? getInitials(`${user.firstName} ${user.lastName}`) : 'U'}
            </div>
            <div className="hidden md:block text-left">
              <p className="font-medium text-surface-900 dark:text-white">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-2xs text-surface-500">
                {user ? ROLE_LABELS[user.role] : ''}
              </p>
            </div>
            <ChevronDown
              size={14}
              className={cn(
                'hidden text-surface-400 transition-transform md:block',
                userMenuOpen && 'rotate-180'
              )}
            />
          </button>

          <AnimatePresence>
            {userMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setUserMenuOpen(false)}
                  aria-hidden
                />
                <motion.div
                  initial={{ opacity: 0, y: 4, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full z-20 mt-1 w-52 rounded-xl border border-surface-200 bg-white py-1.5 shadow-dropdown dark:border-surface-700 dark:bg-surface-800"
                >
                  {/* Info usuario */}
                  <div className="border-b border-surface-100 px-3 py-2 dark:border-surface-700">
                    <p className="text-sm font-medium text-surface-900 dark:text-white">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-xs text-surface-500">{user?.email}</p>
                  </div>

                  {/* Acciones */}
                  <div className="py-1">
                    <button className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-surface-700 hover:bg-surface-50 dark:text-surface-300 dark:hover:bg-surface-700">
                      <User size={14} />
                      Mi Perfil
                    </button>
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <LogOut size={14} />
                      Cerrar sesión
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
