import type { AuthUser } from '@/types';
import { ROLE_PERMISSIONS } from '@/constants';

export const MOCK_USERS: AuthUser[] = [
  {
    id: 'usr-001',
    email: 'admin@sigma.aero',
    firstName: 'Carlos',
    lastName: 'Rodríguez',
    role: 'Gerente',
    permissions: ROLE_PERMISSIONS.Gerente,
    licenseNumber: undefined,
    isActive: true,
    lastLoginAt: '2024-01-15T08:30:00Z',
  },
  {
    id: 'usr-002',
    email: 'inspector@sigma.aero',
    firstName: 'María',
    lastName: 'González',
    role: 'Inspector',
    permissions: ROLE_PERMISSIONS.Inspector,
    licenseNumber: 'INS-ANAC-0042',
    isActive: true,
    lastLoginAt: '2024-01-15T07:45:00Z',
  },
  {
    id: 'usr-003',
    email: 'mecanico@sigma.aero',
    firstName: 'Jorge',
    lastName: 'Méndez',
    role: 'Mecanico',
    permissions: ROLE_PERMISSIONS.Mecanico,
    licenseNumber: 'MEC-ANAC-0187',
    isActive: true,
    lastLoginAt: '2024-01-15T06:00:00Z',
  },
  {
    id: 'usr-004',
    email: 'tecnico@sigma.aero',
    firstName: 'Roberto',
    lastName: 'Vásquez',
    role: 'OficinaTecnica',
    permissions: ROLE_PERMISSIONS.OficinaTecnica,
    licenseNumber: 'OT-ANAC-0023',
    isActive: true,
    lastLoginAt: '2024-01-15T07:00:00Z',
  },
  {
    id: 'usr-005',
    email: 'panol@sigma.aero',
    firstName: 'Ana',
    lastName: 'Torres',
    role: 'Panol',
    permissions: ROLE_PERMISSIONS.Panol,
    isActive: true,
    lastLoginAt: '2024-01-14T16:30:00Z',
  },
];

export const DEMO_USER = MOCK_USERS[0];
