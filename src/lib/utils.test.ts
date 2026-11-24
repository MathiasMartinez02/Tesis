import { afterEach, describe, expect, it, vi } from 'vitest';
import { csvEscape, daysUntil, describeExpiry, formatFlightHours, getInitials, toDateInput, todayLocal, truncate } from './utils';

describe('todayLocal', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('a la noche devuelve el dia local y no el de UTC', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 10, 20, 22, 30));

    expect(todayLocal()).toBe('2026-11-20');
  });
});

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

  it('con separador ; la coma no necesita comillas', () => {
    expect(csvEscape('Cordoba, Argentina')).toBe('Cordoba, Argentina');
  });

  it('encierra entre comillas un valor con punto y coma', () => {
    expect(csvEscape('Filtro; aceite')).toBe('"Filtro; aceite"');
  });

  it('duplica las comillas internas', () => {
    expect(csvEscape('Motor "Lycoming"')).toBe('"Motor ""Lycoming"""');
  });

  it('encierra entre comillas un valor con saltos de linea', () => {
    expect(csvEscape('linea 1\nlinea 2')).toBe('"linea 1\nlinea 2"');
    expect(csvEscape('linea 1\r\nlinea 2')).toBe('"linea 1\r\nlinea 2"');
  });

  it('neutraliza formulas para que Excel no las ejecute', () => {
    expect(csvEscape('=HYPERLINK("http://x")')).toBe('"\'=HYPERLINK(""http://x"")"');
    expect(csvEscape('@SUM(A1)')).toBe("'@SUM(A1)");
  });

  it('no toca los numeros negativos', () => {
    expect(csvEscape('-5')).toBe('-5');
    expect(csvEscape('-1,5')).toBe('-1,5');
  });
});

describe('formatFlightHours', () => {
  it('muestra solo horas cuando no hay minutos', () => {
    expect(formatFlightHours(12)).toBe('12h');
  });

  it('muestra horas y minutos', () => {
    expect(formatFlightHours(1.5)).toBe('1h 30m');
  });

  it('redondea al minuto sin mostrar 60 minutos', () => {
    expect(formatFlightHours(1.999)).toBe('2h');
  });
});

describe('daysUntil y describeExpiry', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('cuenta dias de calendario aunque falten pocas horas', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 10, 20, 15, 0));

    expect(daysUntil('2026-11-21T00:00:00')).toBe(1);
    expect(describeExpiry('2026-11-21T00:00:00')).toBe('vence mañana');
    expect(describeExpiry('2026-11-20T00:00:00')).toBe('vence hoy');
    expect(describeExpiry('2026-11-15T00:00:00')).toBe('venció hace 5 días');
    expect(describeExpiry('2026-12-20T00:00:00')).toBe('vence en 30 días');
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
