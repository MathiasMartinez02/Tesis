import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/config/env', () => ({ ENV: { ENABLE_MOCK_API: false, API_BASE_URL: '', API_TIMEOUT: 1000, JWT_STORAGE_KEY: 'k' } }));
const { put, patch } = vi.hoisted(() => ({ put: vi.fn(), patch: vi.fn() }));
vi.mock('@/lib/axios', () => ({ default: { put, patch } }));

import { workOrdersService } from './workOrders.service';
import { inventoryService } from './inventory.service';

const okWithoutData = { data: { success: true, message: 'Operacion exitosa' } };

describe('operaciones que el backend confirma sin devolver data', () => {
  beforeEach(() => {
    put.mockResolvedValue(okWithoutData);
    patch.mockResolvedValue(okWithoutData);
  });

  it('editar OT no falla', async () => {
    await expect(
      workOrdersService.update('wo-1', {
        description: 'Inspeccion de 100 horas',
        estimatedHours: 8,
        intakeDate: '2026-11-20',
        estimatedEndDate: '2026-11-25',
        priority: 'Media',
      })
    ).resolves.toBeUndefined();
  });

  it('cambiar el estado de una OT no falla', async () => {
    await expect(workOrdersService.updateStatus('wo-1', 'EnProceso')).resolves.toBeUndefined();
  });

  it('aprobar un movimiento de stock no falla', async () => {
    await expect(inventoryService.approveMovement('item-1', 'mov-1')).resolves.toBeUndefined();
  });

  it('sigue fallando si el backend responde success false', async () => {
    patch.mockResolvedValue({ data: { success: false, errors: ['Transicion invalida'] } });

    await expect(workOrdersService.updateStatus('wo-1', 'Finalizada')).rejects.toThrow('Transicion invalida');
  });
});
