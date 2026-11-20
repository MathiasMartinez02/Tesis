import { beforeEach, describe, expect, it, vi } from 'vitest';

const { post } = vi.hoisted(() => ({ post: vi.fn() }));
vi.mock('@/lib/axios', () => ({ default: { post } }));

import { inspectionsService } from './inspections.service';
import { getInspectionTypeLabel } from '@/constants';

describe('inspectionsService', () => {
  beforeEach(() => {
    post.mockReset();
    post.mockResolvedValue({ data: { success: true } });
  });

  it('inicia la inspeccion', async () => {
    await inspectionsService.start('insp-1');
    expect(post).toHaveBeenCalledWith('/inspections/insp-1/start');
  });

  it('completa la inspeccion con observaciones', async () => {
    await inspectionsService.complete('insp-1', 'Sin novedades');
    expect(post).toHaveBeenCalledWith('/inspections/insp-1/complete', { observations: 'Sin novedades' });
  });
});

describe('getInspectionTypeLabel', () => {
  it('traduce el tipo del backend', () => {
    expect(getInspectionTypeLabel('InspeccionAnual')).toBe('Inspección Anual');
  });

  it('deja tal cual un tipo desconocido', () => {
    expect(getInspectionTypeLabel('Otro')).toBe('Otro');
  });
});
