import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Input } from '@/shared/components/ui/Input';
import { Button } from '@/shared/components/ui/Button';
import { authService } from '@/services/api/auth.service';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { ROUTES } from '@/constants';

const loginSchema = z.object({
  email: z.string().email('Email inválido').min(1, 'Requerido'),
  password: z.string().min(1, 'Requerido'),
});

type LoginFormData = z.infer<typeof loginSchema>;

// Usuarios demo para facilitar el acceso en desarrollo
const DEMO_ACCOUNTS = [
  { email: 'admin@sigma.aero', label: 'Administrador', color: 'bg-purple-100 text-purple-700' },
];

export function LoginPage(): JSX.Element {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useAuthStore((s) => s.login);
  const addToast = useUIStore((s) => s.addToast);
  const [showPassword, setShowPassword] = useState(false);

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? ROUTES.DASHBOARD;

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData): Promise<void> => {
    try {
      const response = await authService.login(data);
      login(response.user, response.tokens);
      addToast({
        type: 'success',
        title: `Bienvenido, ${response.user.firstName}`,
        description: 'Sesión iniciada correctamente',
        duration: 3000,
      });
      navigate(from, { replace: true });
    } catch {
      setError('root', { message: 'Credenciales incorrectas. Intentá nuevamente.' });
    }
  };

  const fillDemo = (email: string): void => {
    setValue('email', email);
    setValue('password', 'sigma2026');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-md"
    >
      {/* Logo en mobile */}
      <div className="mb-8 flex items-center gap-2 lg:hidden">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-aviation">
          <span className="text-sm font-bold text-white">S</span>
        </div>
        <span className="text-xl font-bold text-surface-900">SIGMA</span>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-surface-900 dark:text-white">
          Iniciar sesión
        </h2>
        <p className="mt-1.5 text-sm text-surface-500">
          Ingresá tus credenciales para acceder al sistema
        </p>
      </div>

      {/* Demo accounts */}
      <div className="mt-6">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-surface-400">
          Acceso rápido (demo)
        </p>
        <div className="flex flex-wrap gap-2">
          {DEMO_ACCOUNTS.map((acc) => (
            <button
              key={acc.email}
              type="button"
              onClick={() => fillDemo(acc.email)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-opacity hover:opacity-80 ${acc.color}`}
            >
              {acc.label}
            </button>
          ))}
        </div>
        <p className="mt-1 text-2xs text-surface-400">Contraseña: sigma2026</p>
      </div>

      <form
        onSubmit={(e) => void handleSubmit(onSubmit)(e)}
        noValidate
        className="mt-6 space-y-4"
      >
        <Input
          type="email"
          label="Email"
          placeholder="tu@email.com"
          autoComplete="email"
          leftIcon={<Mail size={16} />}
          error={errors.email?.message}
          required
          {...register('email')}
        />

        <Input
          type={showPassword ? 'text' : 'password'}
          label="Contraseña"
          placeholder="••••••••"
          autoComplete="current-password"
          leftIcon={<Lock size={16} />}
          error={errors.password?.message}
          required
          rightIcon={
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              className="text-surface-400 hover:text-surface-600"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          }
          {...register('password')}
        />

        {/* Error global */}
        {errors.root && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errors.root.message}
          </div>
        )}

        <Button
          type="submit"
          size="lg"
          className="w-full"
          isLoading={isSubmitting}
        >
          Ingresar al sistema
        </Button>
      </form>
    </motion.div>
  );
}
