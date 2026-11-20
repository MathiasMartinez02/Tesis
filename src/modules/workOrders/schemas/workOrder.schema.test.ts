import { addDays, format } from 'date-fns';
import { describe, expect, it } from 'vitest';
import { addMaterialSchema, addTaskSchema, workOrderEditSchema, workOrderSchema } from './workOrder.schema';

const day = (offset: number): string => format(addDays(new Date(), offset), 'yyyy-MM-dd');

const validWorkOrder = {
  type: 'Inspeccion100h',
  priority: 'Media',
  aircraftId: 'a1',
  description: 'Inspeccion de 100 horas completa',
  estimatedHours: 8,
  intakeDate: day(0),
  estimatedEndDate: day(5),
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

  it('rechaza un fin estimado anterior al ingreso', () => {
    expect(workOrderSchema.safeParse({ ...validWorkOrder, intakeDate: day(3), estimatedEndDate: day(1) }).success).toBe(false);
  });

  it('rechaza un fin estimado pasado al registrar', () => {
    expect(workOrderSchema.safeParse({ ...validWorkOrder, intakeDate: day(-10), estimatedEndDate: day(-1) }).success).toBe(false);
  });

  it('acepta fin estimado hoy', () => {
    expect(workOrderSchema.safeParse({ ...validWorkOrder, estimatedEndDate: day(0) }).success).toBe(true);
  });
});

describe('workOrderEditSchema', () => {
  it('al editar permite fechas pasadas si el fin no es anterior al ingreso', () => {
    const result = workOrderEditSchema.safeParse({
      priority: 'Media',
      description: validWorkOrder.description,
      estimatedHours: 4,
      intakeDate: day(-10),
      estimatedEndDate: day(-2),
    });
    expect(result.success).toBe(true);
  });

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
