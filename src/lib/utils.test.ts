import { describe, expect, it } from 'vitest';
import { csvEscape, formatFlightHours, getInitials, toDateInput, truncate } from './utils';

describe('toDateInput', () => {
  it('recorta la fecha ISO del backend al formato del input date', () => {
    expect(toDateInput('2027-03-15T00:00:00')).toBe('2027-03-15');
  });

  it('devuelve vacio si no hay fecha', () => {
    expect(toDateInput(undefined)).toBe('');
    expect(toDateInput(null)).toBe('');
  });
});

describe('csvEscape', () => {
  it('deja intacto un valor sin caracteres especiales', () => {
    expect(csvEscape('LV-ABC')).toBe('LV-ABC');
  });

  it('encierra entre comillas un valor con coma', () => {
    expect(csvEscape('Cordoba, Argentina')).toBe('"Cordoba, Argentina"');
  });

  it('duplica las comillas internas', () => {
    expect(csvEscape('Motor "Lycoming"')).toBe('"Motor ""Lycoming"""');
  });

  it('encierra entre comillas un valor con salto de linea', () => {
    expect(csvEscape('linea 1\nlinea 2')).toBe('"linea 1\nlinea 2"');
  });
});

describe('formatFlightHours', () => {
  it('muestra solo horas cuando no hay minutos', () => {
    expect(formatFlightHours(12)).toBe('12h');
  });

  it('muestra horas y minutos', () => {
    expect(formatFlightHours(1.5)).toBe('1h 30m');
  });
});

describe('getInitials', () => {
  it('toma las iniciales de las dos primeras palabras', () => {
    expect(getInitials('maria jose gonzalez')).toBe('MJ');
  });
});

describe('truncate', () => {
  it('no corta textos dentro del limite', () => {
    expect(truncate('corto', 10)).toBe('corto');
  });

  it('corta y agrega puntos suspensivos', () => {
    expect(truncate('descripcion larga', 11)).toBe('descripcion...');
  });
});
