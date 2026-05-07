import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { AuthUser, AuthTokens } from '@/types';
import { ENV } from '@/config/env';

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
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        tokens: state.tokens,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

/** Selector helpers para evitar re-renders innecesarios */
export const selectUser = (state: AuthStore): AuthUser | null => state.user;
export const selectIsAuthenticated = (state: AuthStore): boolean => state.isAuthenticated;
export const selectUserRole = (state: AuthStore) => state.user?.role;
export const selectUserPermissions = (state: AuthStore) => state.user?.permissions;
