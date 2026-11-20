import { addDays, format, subHours } from 'date-fns';
import { describe, expect, it } from 'vitest';
import { appointmentSchema } from './appointment.schema';

const base = {
  clientId: 'c1',
  requestedType: 'InspeccionAnual',
  scheduledDate: format(addDays(new Date(), 7), "yyyy-MM-dd'T'HH:mm"),
};

describe('appointmentSchema', () => {
  it('con aeronave registrada exige seleccionarla', () => {
    const result = appointmentSchema.safeParse({ ...base, useRegisteredAircraft: true });
    expect(result.success).toBe(false);
  });

  it('con aeronave registrada seleccionada es valido', () => {
    const result = appointmentSchema.safeParse({ ...base, useRegisteredAircraft: true, aircraftId: 'a1' });
    expect(result.success).toBe(true);
  });

  it('sin aeronave registrada exige la matricula', () => {
    const result = appointmentSchema.safeParse({ ...base, useRegisteredAircraft: false, aircraftRegistrationHint: '  ' });
    expect(result.success).toBe(false);
  });

  it('rechaza un turno en el pasado', () => {
    const past = format(subHours(new Date(), 1), "yyyy-MM-dd'T'HH:mm");
    const result = appointmentSchema.safeParse({ ...base, scheduledDate: past, useRegisteredAircraft: true, aircraftId: 'a1' });
    expect(result.success).toBe(false);
  });

  it('sin aeronave registrada con matricula es valido', () => {
    const result = appointmentSchema.safeParse({ ...base, useRegisteredAircraft: false, aircraftRegistrationHint: 'LV-XYZ' });
    expect(result.success).toBe(true);
  });
});
