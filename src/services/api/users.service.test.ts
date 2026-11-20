import { describe, expect, it, vi } from 'vitest';

vi.mock('@/config/env', () => ({ ENV: { ENABLE_MOCK_API: false } }));
const { get } = vi.hoisted(() => ({ get: vi.fn() }));
vi.mock('@/lib/axios', () => ({ default: { get } }));

import { usersService } from './users.service';

describe('usersService.lookup', () => {
  it('pide los usuarios por rol al endpoint de lookup', async () => {
    get.mockResolvedValue({ data: { success: true, data: [{ id: 'm1', fullName: 'Jorge Mendez', role: 'Mecanico' }] } });

    const result = await usersService.lookup(['Mecanico', 'JefeTaller']);

    expect(get).toHaveBeenCalledWith('/users/lookup', expect.objectContaining({ params: { role: ['Mecanico', 'JefeTaller'] } }));
    expect(result[0].fullName).toBe('Jorge Mendez');
  });
});
