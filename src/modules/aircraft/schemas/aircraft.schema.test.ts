import { describe, expect, it } from 'vitest';
import { aircraftEditSchema } from './aircraft.schema';

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
  nextInspectionDue: '2027-01-10',
  nextInspectionHours: 1600,
  certificateExpiry: '2027-03-15',
};

describe('aircraftEditSchema', () => {
  it('no exige matricula ni cliente, que no se pueden modificar', () => {
    expect(aircraftEditSchema.safeParse(editable).success).toBe(true);
  });

  it('descarta matricula y cliente si llegaran en los datos', () => {
    const result = aircraftEditSchema.parse({ ...editable, registration: 'LV-XYZ', clientId: 'c1' });

    expect(result).not.toHaveProperty('registration');
    expect(result).not.toHaveProperty('clientId');
  });
});
