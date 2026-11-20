import { addDays, format } from 'date-fns';
import { describe, expect, it } from 'vitest';
import { aircraftEditSchema, aircraftSchema } from './aircraft.schema';
import { technicalDocumentSchema } from '@/modules/technicalDocuments/schemas/technicalDocument.schema';
import { clientSchema } from '@/modules/clients/schemas/client.schema';

const day = (offset: number): string => format(addDays(new Date(), offset), 'yyyy-MM-dd');

const editable = {
  manufacturer: 'Cessna',
  model: '172S',
  year: 2015,
  category: 'Avion',
  serialNumber: '172S-1234',
  engineModel: 'Lycoming IO-360',
  engineSerialNumber: 'L-5678',
  totalFlightHours: 1520.5,
  totalLandings: 2100,
  nextInspectionDue: day(60),
  nextInspectionHours: 1600,
  certificateExpiry: day(120),
};

const newAircraft = { ...editable, registration: 'LV-ABC', clientId: 'c1' };

describe('aircraftSchema', () => {
  it.each(['LV-ABC', 'LV-ABCD', 'CX-ABC', 'lv-abc'])('acepta la matricula %s como el backend', (registration) => {
    expect(aircraftSchema.safeParse({ ...newAircraft, registration }).success).toBe(true);
  });

  it('rechaza un certificado vencido al registrar', () => {
    expect(aircraftSchema.safeParse({ ...newAircraft, certificateExpiry: day(-1) }).success).toBe(false);
  });

  it('acepta un año de fabricacion hasta cinco años adelante', () => {
    const nextYear = new Date().getFullYear() + 1;
    expect(aircraftSchema.safeParse({ ...newAircraft, year: nextYear }).success).toBe(true);
  });
});

describe('aircraftEditSchema', () => {
  it('no exige matricula ni cliente, que no se pueden modificar', () => {
    expect(aircraftEditSchema.safeParse(editable).success).toBe(true);
  });

  it('permite guardar con el certificado vencido para poder renovarlo', () => {
    expect(aircraftEditSchema.safeParse({ ...editable, certificateExpiry: day(-10) }).success).toBe(true);
  });

  it('descarta matricula y cliente si llegaran en los datos', () => {
    const result = aircraftEditSchema.parse({ ...editable, registration: 'LV-XYZ', clientId: 'c1' });

    expect(result).not.toHaveProperty('registration');
    expect(result).not.toHaveProperty('clientId');
  });
});

describe('otros limites alineados con el backend', () => {
  it('documento tecnico: el vencimiento no puede ser anterior a la emision', () => {
    const result = technicalDocumentSchema.safeParse({
      type: 'Manual',
      title: 'Manual de mantenimiento',
      fileUrl: 'https://docs/manual.pdf',
      issueDate: day(0),
      expiryDate: day(-1),
    });
    expect(result.success).toBe(false);
  });

  it('cliente: el telefono no supera los 30 caracteres de la base', () => {
    const result = clientSchema.safeParse({
      name: 'Aeroclub',
      businessName: 'Aeroclub SA',
      taxId: '30-12345678-9',
      email: 'info@aeroclub.com',
      phone: '1'.repeat(31),
      address: 'Av. Siempreviva 742',
      city: 'Cordoba',
      province: 'Cordoba',
    });
    expect(result.success).toBe(false);
  });
});
