import { describe, expect, it } from 'vitest';
import { optionalText } from './zod';

describe('optionalText', () => {
  const schema = optionalText();

  it('convierte el texto vacio en undefined', () => {
    expect(schema.parse('')).toBeUndefined();
  });

  it('convierte el texto con solo espacios en undefined', () => {
    expect(schema.parse('   ')).toBeUndefined();
  });

  it('acepta undefined', () => {
    expect(schema.parse(undefined)).toBeUndefined();
  });

  it('deja intacto un texto con contenido', () => {
    expect(schema.parse('2026-12-31')).toBe('2026-12-31');
  });
});
