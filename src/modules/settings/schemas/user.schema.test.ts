import { describe, expect, it } from 'vitest';
import { userFormSchema } from './user.schema';

const base = {
  email: 'mecanico@sigma.aero',
  firstName: 'Juan',
  lastName: 'Perez',
  role: 'Mecanico',
};

describe('userFormSchema', () => {
  it('permite editar sin cambiar la contraseña', () => {
    expect(userFormSchema.safeParse({ ...base, password: '' }).success).toBe(true);
  });

  it('rechaza una contraseña de menos de 8 caracteres', () => {
    expect(userFormSchema.safeParse({ ...base, password: 'corta' }).success).toBe(false);
  });

  it('rechaza un rol que no existe en el backend', () => {
    expect(userFormSchema.safeParse({ ...base, role: 'Admin' }).success).toBe(false);
  });
});
