import type { AuthUser } from '@/types';
import { ROLE_PERMISSIONS } from '@/constants';

export const MOCK_USERS: AuthUser[] = [
  {
    id: 'usr-001',
    email: 'gerente@sigma.aero',
    firstName: 'Carlos',
    lastName: 'Rodríguez',
    role: 'gerente',
    permissions: ROLE_PERMISSIONS.gerente,
    licenseNumber: undefined,
    isActive: true,
    lastLoginAt: '2024-01-15T08:30:00Z',
  },
  {
    id: 'usr-002',
    email: 'inspector@sigma.aero',
    firstName: 'María',
    lastName: 'González',
    role: 'inspector',
    permissions: ROLE_PERMISSIONS.inspector,
    licenseNumber: 'INS-ANAC-0042',
    isActive: true,
    lastLoginAt: '2024-01-15T07:45:00Z',
  },
  {
    id: 'usr-003',
    email: 'mecanico1@sigma.aero',
    firstName: 'Jorge',
    lastName: 'Méndez',
    role: 'mecanico',
    permissions: ROLE_PERMISSIONS.mecanico,
    licenseNumber: 'MEC-ANAC-0187',
    isActive: true,
    lastLoginAt: '2024-01-15T06:00:00Z',
  },
  {
    id: 'usr-004',
    email: 'jefetaller@sigma.aero',
    firstName: 'Roberto',
    lastName: 'Vásquez',
    role: 'jefe_taller',
    permissions: ROLE_PERMISSIONS.jefe_taller,
    licenseNumber: 'JT-ANAC-0023',
    isActive: true,
    lastLoginAt: '2024-01-15T07:00:00Z',
  },
  {
    id: 'usr-005',
    email: 'panol@sigma.aero',
    firstName: 'Ana',
    lastName: 'Torres',
    role: 'panol',
    permissions: ROLE_PERMISSIONS.panol,
    isActive: true,
    lastLoginAt: '2024-01-14T16:30:00Z',
  },
];

/** Usuario demo para desarrollo */
export const DEMO_USER = MOCK_USERS[0];
