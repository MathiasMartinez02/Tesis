import type { UserRole } from './auth.types';

/** UserDto */
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
  avatarUrl?: string;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
}

export interface UserFilters {
  role?: UserRole;
  isActive?: boolean;
  search?: string;
}

export interface CreateUserPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  licenseNumber?: string;
  phone?: string;
}

export interface UpdateUserPayload {
  firstName: string;
  lastName: string;
  role: UserRole;
  licenseNumber?: string;
  licenseExpiry?: string;
  phone?: string;
  avatarUrl?: string;
}
