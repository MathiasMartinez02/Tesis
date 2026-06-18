import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersService } from '@/services/api/users.service';
import type { UserFilters, CreateUserPayload, UpdateUserPayload } from '@/types';
import { useUIStore } from '@/store/uiStore';

export const USERS_QUERY_KEY = ['users'] as const;

export function useUsers(filters: UserFilters = {}, page = 1, pageSize = 10) {
  return useQuery({
    queryKey: [...USERS_QUERY_KEY, filters, page, pageSize],
    queryFn: () => usersService.getAll(filters, page, pageSize),
  });
}

export function useUser(id: string) {
  return useQuery({
    queryKey: [...USERS_QUERY_KEY, id],
    queryFn: () => usersService.getById(id),
    enabled: !!id,
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  const addToast = useUIStore((s) => s.addToast);

  return useMutation({
    mutationFn: (payload: CreateUserPayload) => usersService.create(payload),
    onSuccess: (user) => {
      void queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY });
      addToast({
        type: 'success',
        title: 'Usuario creado',
        description: `${user.firstName} ${user.lastName} registrado correctamente`,
      });
    },
    onError: (err: Error) => {
      addToast({ type: 'error', title: 'Error al crear usuario', description: err.message });
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  const addToast = useUIStore((s) => s.addToast);

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateUserPayload }) =>
      usersService.update(id, payload),
    onSuccess: (_, { id }) => {
      void queryClient.invalidateQueries({ queryKey: [...USERS_QUERY_KEY, id] });
      void queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY });
      addToast({ type: 'success', title: 'Usuario actualizado' });
    },
    onError: (err: Error) => {
      addToast({ type: 'error', title: 'Error al actualizar usuario', description: err.message });
    },
  });
}

export function useSetUserActive() {
  const queryClient = useQueryClient();
  const addToast = useUIStore((s) => s.addToast);

  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      usersService.setActive(id, isActive),
    onSuccess: (_, { id, isActive }) => {
      void queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: [...USERS_QUERY_KEY, id] });
      addToast({
        type: 'success',
        title: isActive ? 'Usuario activado' : 'Usuario desactivado',
      });
    },
    onError: (err: Error) => {
      addToast({ type: 'error', title: 'Error al cambiar estado', description: err.message });
    },
  });
}
