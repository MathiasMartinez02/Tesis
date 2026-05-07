import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { AuthUser, AuthTokens } from '@/types';
import { ROLE_PERMISSIONS } from '@/constants';
import { ENV } from '@/config/env';

const STORE_VERSION = 2;

interface AuthStore {
  user: AuthUser | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  setUser: (user: AuthUser) => void;
  setTokens: (tokens: AuthTokens) => void;
  login: (user: AuthUser, tokens: AuthTokens) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  updateUser: (partial: Partial<AuthUser>) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      tokens: null,
      isAuthenticated: false,
      isLoading: false,

      setUser: (user) => set({ user, isAuthenticated: true }),

      setTokens: (tokens) => set({ tokens }),

      login: (user, tokens) => {
        localStorage.setItem(ENV.JWT_STORAGE_KEY, tokens.accessToken);
        localStorage.setItem('sigma_refresh_token', tokens.refreshToken);
        set({ user, tokens, isAuthenticated: true, isLoading: false });
      },

      logout: () => {
        localStorage.removeItem(ENV.JWT_STORAGE_KEY);
        localStorage.removeItem('sigma_refresh_token');
        set({ user: null, tokens: null, isAuthenticated: false });
      },

      setLoading: (isLoading) => set({ isLoading }),

      updateUser: (partial) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...partial } : null,
        })),
    }),
    {
      name: 'sigma-auth',
      version: STORE_VERSION,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        tokens: state.tokens,
        isAuthenticated: state.isAuthenticated,
      }),
      migrate: () => ({ user: null, tokens: null, isAuthenticated: false, isLoading: false }),
    }
  )
);

/** Selector helpers para evitar re-renders innecesarios */
export const selectUser = (state: AuthStore): AuthUser | null => state.user;
export const selectIsAuthenticated = (state: AuthStore): boolean => state.isAuthenticated;
export const selectUserRole = (state: AuthStore) => state.user?.role;

/**
 * Devuelve los permisos efectivos del usuario.
 * Si el backend no envió permisos (sesión antigua o datos corruptos),
 * los deriva del rol usando ROLE_PERMISSIONS como fallback.
 */
export const selectUserPermissions = (state: AuthStore) => {
  const user = state.user;
  if (!user) return null;
  const stored = user.permissions;
  // Si no hay permisos almacenados o todos son false (sesión stale), usar ROLE_PERMISSIONS
  const hasAnyPermission = stored && Object.values(stored).some(Boolean);
  if (!hasAnyPermission) {
    return ROLE_PERMISSIONS[user.role] ?? stored;
  }
  return stored;
};
