import { describe, expect, it, vi } from 'vitest';

const { put } = vi.hoisted(() => ({ put: vi.fn() }));
vi.mock('@/lib/axios', () => ({ default: { put } }));

import { appointmentsService } from './appointments.service';

describe('appointmentsService.update', () => {
  it('envia la edicion del turno sin el cliente', async () => {
    put.mockResolvedValue({ data: { success: true } });
    const payload = {
      aircraftId: 'a1',
      aircraftRegistrationHint: null,
      requestedType: 'InspeccionAnual' as const,
      scheduledDate: '2026-12-01T10:00',
      notes: null,
    };

    await appointmentsService.update('t1', payload);

    expect(put).toHaveBeenCalledWith('/appointments/t1', payload);
  });
});
