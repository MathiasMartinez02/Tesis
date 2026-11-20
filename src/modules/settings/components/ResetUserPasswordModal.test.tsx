import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { User } from '@/types';

const resetPassword = vi.fn();
vi.mock('../hooks/useUsers', () => ({
  useResetUserPassword: () => ({ mutate: resetPassword, isPending: false }),
}));

import { ResetUserPasswordModal } from './ResetUserPasswordModal';

const user = {
  id: 'u1',
  email: 'mecanico@sigma.aero',
  firstName: 'Juan',
  lastName: 'Perez',
} as User;

describe('ResetUserPasswordModal', () => {
  beforeEach(() => resetPassword.mockReset());

  it('no envia si la contraseña es corta o no coincide', async () => {
    render(<ResetUserPasswordModal user={user} onClose={vi.fn()} />);

    await userEvent.type(screen.getByLabelText('Contraseña nueva'), 'corta');
    await userEvent.click(screen.getByRole('button', { name: /asignar/i }));
    expect(screen.getByText('Debe tener al menos 8 caracteres')).toBeInTheDocument();

    await userEvent.type(screen.getByLabelText('Contraseña nueva'), 'larga123');
    await userEvent.type(screen.getByLabelText('Repetir contraseña'), 'distinta1');
    await userEvent.click(screen.getByRole('button', { name: /asignar/i }));
    expect(screen.getByText('Las contraseñas no coinciden')).toBeInTheDocument();

    expect(resetPassword).not.toHaveBeenCalled();
  });

  it('envia la contraseña nueva cuando es valida', async () => {
    render(<ResetUserPasswordModal user={user} onClose={vi.fn()} />);

    await userEvent.type(screen.getByLabelText('Contraseña nueva'), 'NuevaClave123');
    await userEvent.type(screen.getByLabelText('Repetir contraseña'), 'NuevaClave123');
    await userEvent.click(screen.getByRole('button', { name: /asignar/i }));

    expect(resetPassword).toHaveBeenCalledWith({ id: 'u1', newPassword: 'NuevaClave123' }, expect.anything());
  });
});
