import { addDays, format } from 'date-fns';
import { describe, expect, it } from 'vitest';
import { flightRecordSchema } from './aircraft.schema';
import { inventoryItemSchema } from '@/modules/inventory/schemas/inventoryItem.schema';

const day = (offset: number): string => format(addDays(new Date(), offset), 'yyyy-MM-dd');

const flight = {
  date: day(0),
  duration: '1.5',
  landings: '2',
  pilot: 'Juan Perez',
  origin: 'SACO',
  destination: 'SAAR',
  notes: '',
};

describe('flightRecordSchema', () => {
  it('acepta un vuelo de hoy y convierte los numeros', () => {
    const result = flightRecordSchema.parse(flight);

    expect(result.duration).toBe(1.5);
    expect(result.landings).toBe(2);
    expect(result.notes).toBeUndefined();
  });

  it('rechaza un vuelo con fecha futura', () => {
    expect(flightRecordSchema.safeParse({ ...flight, date: day(1) }).success).toBe(false);
  });

  it('rechaza duracion cero y aterrizajes con decimales', () => {
    expect(flightRecordSchema.safeParse({ ...flight, duration: '0' }).success).toBe(false);
    expect(flightRecordSchema.safeParse({ ...flight, landings: '1.5' }).success).toBe(false);
  });
});

describe('inventoryItemSchema con certificacion', () => {
  const item = {
    partNumber: 'PN-1',
    description: 'Magneto Slick 4370',
    category: 'RepuestoMotor',
    manufacturer: 'Champion',
    location: 'A1',
    currentStock: 1,
    minimumStock: 1,
    unit: 'u',
    unitCost: 1000,
    certificationRequired: true,
  };

  it('exige el numero de certificado si el item requiere certificacion', () => {
    expect(inventoryItemSchema.safeParse(item).success).toBe(false);
    expect(inventoryItemSchema.safeParse({ ...item, certificateNumber: '8130-3 Nro 4521' }).success).toBe(true);
  });
});
