import { AxiosError, type AxiosResponse } from 'axios';
import { describe, expect, it } from 'vitest';
import { ApiError, toApiError } from './apiError';

const axiosErrorWith = (status: number, data: unknown): AxiosError =>
  new AxiosError('Request failed', 'ERR_BAD_REQUEST', undefined, undefined, { status, data } as AxiosResponse);

describe('toApiError', () => {
  it('usa el primer error de negocio que manda el backend', () => {
    const error = toApiError(axiosErrorWith(400, { success: false, errors: ['El movimiento ya fue aprobado'] }));

    expect(error).toBeInstanceOf(ApiError);
    expect(error.message).toBe('El movimiento ya fue aprobado');
    expect(error.status).toBe(400);
  });

  it('usa el mensaje de validacion y no el titulo en ingles', () => {
    const error = toApiError(
      axiosErrorWith(422, { success: false, message: 'Validation Error', errors: ['La fecha limite debe ser futura.'] })
    );

    expect(error.message).toBe('La fecha limite debe ser futura.');
  });

  it('no muestra los errores en ingles del model binding de ASP.NET', () => {
    const error = toApiError(axiosErrorWith(400, { title: 'One or more validation errors occurred.', errors: { expiryDate: ['The JSON value could not be converted'] } }));

    expect(error.message).toBe('Los datos enviados no son válidos');
  });

  it('da un mensaje propio para 403 sin cuerpo', () => {
    expect(toApiError(axiosErrorWith(403, '')).message).toBe('No tenés permisos para realizar esta acción');
  });

  it('avisa cuando no hay respuesta del servidor', () => {
    const error = toApiError(new AxiosError('Network Error', 'ERR_NETWORK'));

    expect(error.message).toBe('No se pudo conectar con el servidor');
    expect(error.status).toBeUndefined();
  });
});
