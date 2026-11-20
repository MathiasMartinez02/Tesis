import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { User } from '@/types';

const createUser = vi.fn();
const updateUser = vi.fn();

vi.mock('../hooks/useUsers', () => ({
  useCreateUser: () => ({ mutate: createUser, isPending: false }),
  useUpdateUser: () => ({ mutate: updateUser, isPending: false }),
}));

import { UserFormModal } from './UserFormModal';

const existingUser: User = {
  id: 'u1',
  email: 'mecanico@sigma.aero',
  firstName: 'Juan',
  lastName: 'Perez',
  fullName: 'Juan Perez',
  role: 'Mecanico',
  licenseNumber: 'LIC-123',
  licenseExpiry: '2027-05-31T00:00:00',
  phone: '351555555',
  avatarUrl: 'https://cdn/avatar.png',
  isActive: true,
  createdAt: '2026-01-01T00:00:00',
};

describe('UserFormModal en modo edicion', () => {
  beforeEach(() => {
    createUser.mockReset();
    updateUser.mockReset();
  });

  it('envia la edicion conservando vencimiento de licencia y avatar', async () => {
    render(<UserFormModal isOpen onClose={vi.fn()} user={existingUser} />);

    await userEvent.click(screen.getByRole('button', { name: /guardar cambios/i }));

    await waitFor(() => expect(updateUser).toHaveBeenCalledTimes(1));
    expect(updateUser).toHaveBeenCalledWith({
      id: 'u1',
      payload: {
        firstName: 'Juan',
        lastName: 'Perez',
        role: 'Mecanico',
        licenseNumber: 'LIC-123',
        licenseExpiry: '2027-05-31',
        phone: '351555555',
        avatarUrl: 'https://cdn/avatar.png',
      },
    }, expect.anything());
  });
});
