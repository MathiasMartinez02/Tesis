import type { UserRole } from './auth.types';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  role: UserRole;
  licenseNumber?: string;
  licenseExpiry?: string;
  phone?: string;
  isActive: boolean;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserFilters {
  role?: UserRole;
  isActive?: boolean;
  search?: string;
}
