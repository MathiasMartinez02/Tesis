import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type Theme = 'light' | 'dark' | 'system';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  description?: string;
  duration?: number;
}

interface UIStore {
  // Sidebar
  sidebarCollapsed: boolean;
  sidebarMobileOpen: boolean;
  toggleSidebar: () => void;
  setSidebarMobileOpen: (open: boolean) => void;

  // Theme
  theme: Theme;
  setTheme: (theme: Theme) => void;

  // Toasts
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}

let toastCounter = 0;

export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      // Sidebar
      sidebarCollapsed: false,
      sidebarMobileOpen: false,

      toggleSidebar: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

      setSidebarMobileOpen: (sidebarMobileOpen) => set({ sidebarMobileOpen }),

      // Theme
      theme: 'light',

      setTheme: (theme) => {
        const root = document.documentElement;
        if (theme === 'dark') {
          root.classList.add('dark');
        } else if (theme === 'light') {
          root.classList.remove('dark');
        } else {
          const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          root.classList.toggle('dark', prefersDark);
        }
        set({ theme });
      },

      // Toasts
      toasts: [],

      addToast: (toast) => {
        const id = `toast-${++toastCounter}`;
        set((state) => ({ toasts: [...state.toasts, { ...toast, id }] }));

        // Auto-remove después del duration
        const duration = toast.duration ?? 5000;
        if (duration > 0) {
          setTimeout(() => {
            set((state) => ({
              toasts: state.toasts.filter((t) => t.id !== id),
            }));
          }, duration);
        }
      },

      removeToast: (id) =>
        set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),

      clearToasts: () => set({ toasts: [] }),
    }),
    {
      name: 'sigma-ui',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
        theme: state.theme,
      }),
    }
  )
);

/** Selector helpers */
export const selectSidebarCollapsed = (state: UIStore): boolean => state.sidebarCollapsed;
export const selectTheme = (state: UIStore): Theme => state.theme;
export const selectToasts = (state: UIStore): Toast[] => state.toasts;
