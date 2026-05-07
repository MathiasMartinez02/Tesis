/** Carga y valida las variables de entorno en tiempo de compilación */
function getEnvVar(key: string, fallback?: string): string {
  const value = import.meta.env[key] as string | undefined;
  if (!value && !fallback) {
    console.warn(`Variable de entorno ${key} no definida`);
    return '';
  }
  return value ?? fallback ?? '';
}

export const ENV = {
  API_BASE_URL: getEnvVar('VITE_API_BASE_URL', 'http://localhost:8000/api/v1'),
  API_TIMEOUT: Number(getEnvVar('VITE_API_TIMEOUT', '10000')),
  JWT_STORAGE_KEY: getEnvVar('VITE_JWT_STORAGE_KEY', 'sigma_auth_token'),
  APP_NAME: getEnvVar('VITE_APP_NAME', 'SIGMA'),
  APP_VERSION: getEnvVar('VITE_APP_VERSION', '1.0.0'),
  IS_DEV: import.meta.env.DEV,
  IS_PROD: import.meta.env.PROD,
  ENABLE_DEVTOOLS: getEnvVar('VITE_ENABLE_DEVTOOLS', 'true') === 'true',
  ENABLE_MOCK_API: getEnvVar('VITE_ENABLE_MOCK_API', 'true') === 'true',
} as const;
