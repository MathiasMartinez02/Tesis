import { useQuery } from '@tanstack/react-query';
import { usersService } from '@/services/api/users.service';
import type { UserFilters } from '@/types';

export const USERS_QUERY_KEY = ['users'] as const;

export function useUsers(filters: UserFilters = {}, page = 1, pageSize = 100) {
  return useQuery({
    queryKey: [...USERS_QUERY_KEY, filters, page, pageSize],
    queryFn: () => usersService.getAll(filters, page, pageSize),
    staleTime: 5 * 60 * 1000,
  });
}
