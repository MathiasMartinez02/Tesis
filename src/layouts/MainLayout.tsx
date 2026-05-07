import { Outlet } from 'react-router-dom';
import { Sidebar } from './components/Sidebar/Sidebar';
import { Navbar } from './components/Navbar/Navbar';
import { ToastContainer } from '@/shared/components/Toast/ToastContainer';
import { useUIStore } from '@/store/uiStore';
import { cn } from '@/lib/utils';

export function MainLayout(): JSX.Element {
  const collapsed = useUIStore((s) => s.sidebarCollapsed);

  return (
    <div className="flex h-full bg-surface-50 dark:bg-surface-950">
      {/* ── Sidebar ─────────────────────────────────────────────────── */}
      <Sidebar />

      {/* ── Contenido principal ─────────────────────────────────────── */}
      <div
        className={cn(
          'flex min-h-full flex-1 flex-col transition-all duration-300 overflow-hidden',
          // El sidebar ocupa espacio en desktop
          'lg:ml-0'
        )}
      >
        {/* Navbar */}
        <Navbar />

        {/* Área de contenido con scroll */}
        <main
          id="main-content"
          className="flex-1 overflow-y-auto overflow-x-hidden"
          tabIndex={-1}
        >
          <div className="mx-auto max-w-screen-2xl p-4 lg:p-6">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Toast global */}
      <ToastContainer />
    </div>
  );
}
