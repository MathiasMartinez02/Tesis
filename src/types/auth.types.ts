export type UserRole =
  | 'gerente'
  | 'oficina_tecnica'
  | 'inspector'
  | 'jefe_taller'
  | 'mecanico'
  | 'panol'
  | 'administracion';

export interface UserPermissions {
  canViewDashboard: boolean;
  canManageWorkOrders: boolean;
  canApproveInspections: boolean;
  canManageInventory: boolean;
  canManageUsers: boolean;
  canViewReports: boolean;
  canManageAircraft: boolean;
  canManageClients: boolean;
  canSignDocuments: boolean;
}

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  permissions: UserPermissions;
  avatarUrl?: string;
  licenseNumber?: string;
  isActive: boolean;
  lastLoginAt?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export interface AuthState {
  user: AuthUser | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginResponse {
  user: AuthUser;
  tokens: AuthTokens;
}
