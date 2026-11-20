import type { AxiosError } from 'axios';

export class ApiError extends Error {
  readonly status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

const STATUS_MESSAGES: Record<number, string> = {
  400: 'Los datos enviados no son válidos',
  401: 'Tu sesión expiró. Volvé a iniciar sesión',
  403: 'No tenés permisos para realizar esta acción',
  404: 'No se encontró el recurso solicitado',
  422: 'Los datos enviados no son válidos',
};

// Mensaje del backend o generico segun el status
export function toApiError(error: AxiosError): ApiError {
  const status = error.response?.status;
  if (!error.response) return new ApiError('No se pudo conectar con el servidor');

  const body = error.response.data as { errors?: unknown } | undefined;
  const backendMessage = Array.isArray(body?.errors) && typeof body.errors[0] === 'string' ? body.errors[0] : undefined;

  return new ApiError(
    backendMessage ?? (status !== undefined ? STATUS_MESSAGES[status] : undefined) ?? 'Ocurrió un error inesperado',
    status
  );
}
