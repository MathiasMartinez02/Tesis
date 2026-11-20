import { describe, expect, it } from 'vitest';
import { addMaterialSchema, addTaskSchema, workOrderEditSchema, workOrderSchema } from './workOrder.schema';

const validWorkOrder = {
  type: 'Inspeccion100h',
  priority: 'Media',
  aircraftId: 'a1',
  description: 'Inspeccion de 100 horas completa',
  estimatedHours: 8,
  intakeDate: '2026-11-20',
  estimatedEndDate: '2026-11-25',
};

describe('workOrderSchema', () => {
  it('acepta una OT valida', () => {
    expect(workOrderSchema.safeParse(validWorkOrder).success).toBe(true);
  });

  it('rechaza un tipo que no existe en el backend', () => {
    expect(workOrderSchema.safeParse({ ...validWorkOrder, type: 'inspeccion_100h' }).success).toBe(false);
  });

  it('exige seleccionar aeronave', () => {
    expect(workOrderSchema.safeParse({ ...validWorkOrder, aircraftId: '' }).success).toBe(false);
  });

  it('exige descripcion de al menos 10 caracteres', () => {
    expect(workOrderSchema.safeParse({ ...validWorkOrder, description: 'corta' }).success).toBe(false);
  });

  it('exige al menos media hora estimada', () => {
    expect(workOrderSchema.safeParse({ ...validWorkOrder, estimatedHours: 0.25 }).success).toBe(false);
  });
});

describe('workOrderEditSchema', () => {
  it('no pide tipo ni aeronave', () => {
    const editable = {
      priority: validWorkOrder.priority,
      description: validWorkOrder.description,
      estimatedHours: validWorkOrder.estimatedHours,
      intakeDate: validWorkOrder.intakeDate,
      estimatedEndDate: validWorkOrder.estimatedEndDate,
    };
    expect(workOrderEditSchema.safeParse(editable).success).toBe(true);
  });
});

describe('addTaskSchema', () => {
  it('convierte las horas de texto a numero', () => {
    const result = addTaskSchema.parse({ title: 'Cambio de aceite', description: 'Drenar y reponer', estimatedHours: '1.5' });
    expect(result.estimatedHours).toBe(1.5);
    expect(result.requiresInspection).toBe(false);
  });
});

describe('addMaterialSchema', () => {
  it('rechaza cantidad cero', () => {
    const result = addMaterialSchema.safeParse({ partNumber: 'PN-1', description: 'Filtro', quantity: 0, unit: 'u' });
    expect(result.success).toBe(false);
  });
});
