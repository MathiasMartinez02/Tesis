import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ROLE_PERMISSIONS } from '@/constants/roles';

vi.mock('react-router-dom', () => ({ useNavigate: () => vi.fn() }));

import { useAuthStore } from '@/store/authStore';
import { PermissionRoute } from './PermissionRoute';

const loginAs = (role: keyof typeof ROLE_PERMISSIONS) =>
  useAuthStore.setState({ user: { id: 'u1', role, permissions: ROLE_PERMISSIONS[role] } as never });

describe('PermissionRoute', () => {
  beforeEach(() => useAuthStore.setState({ user: null }));

  it('muestra la pantalla si el rol tiene el permiso', () => {
    loginAs('Gerente');
    render(<PermissionRoute permission="canManageUsers">Usuarios</PermissionRoute>);

    expect(screen.getByText('Usuarios')).toBeInTheDocument();
  });

  it('bloquea por URL a un rol sin permiso', () => {
    loginAs('Administracion');
    render(<PermissionRoute permission="canManageUsers">Usuarios</PermissionRoute>);

    expect(screen.queryByText('Usuarios')).not.toBeInTheDocument();
    expect(screen.getByText('No tenés acceso a esta sección')).toBeInTheDocument();
  });
});
