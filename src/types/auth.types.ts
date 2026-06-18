export type UserRole =
  | 'Gerente'
  | 'OficinaTecnica'
  | 'Inspector'
  | 'JefeTaller'
  | 'Mecanico'
  | 'Panol'
  | 'Administracion';

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

/** Forma cruda que devuelve el backend en POST /auth/login */
export interface UserTokenDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  permissions: string[];
  avatarUrl?: string;
  licenseNumber?: string;
  isActive: boolean;
  lastLoginAt?: string;
}

export interface TokensDto {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export interface LoginResponseDto {
  user: UserTokenDto;
  tokens: TokensDto;
}
