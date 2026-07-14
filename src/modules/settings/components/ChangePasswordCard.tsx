import { useState } from 'react';
import { KeyRound } from 'lucide-react';
import { Card } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { useChangeOwnPassword } from '@/modules/auth/hooks/usePasswordReset';

// Tarjeta de "Mi cuenta": permite a cualquier usuario autenticado cambiar su propia contraseña,
// contra PATCH /auth/me/password. No requiere ningún permiso especial (RoleGuard) porque es una accion sobre uno mismo,
// no de administracion de terceros -- a diferencia de crear/editar otros usuarios (SettingsUsersPage), que si esta protegido.
export function ChangePasswordCard(): JSX.Element {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { mutate: changePassword, isPending } = useChangeOwnPassword();

  const mismatch = confirmPassword.length > 0 && newPassword !== confirmPassword;
  const canSubmit = currentPassword.length > 0 && newPassword.length >= 8 && newPassword === confirmPassword;

  const handleSubmit = (): void => {
    changePassword(
      { currentPassword, newPassword },
      {
        onSuccess: () => {
          setCurrentPassword('');
          setNewPassword('');
          setConfirmPassword('');
        },
      }
    );
  };

  return (
    <Card>
      <h3 className="mb-1 text-sm font-semibold text-surface-900 dark:text-white">Cambiar contraseña</h3>
      <p className="mb-4 text-xs text-surface-500">Actualizá la contraseña de tu propia cuenta</p>
      <div className="grid gap-3 sm:grid-cols-3">
        <Input
          type="password"
          label="Contraseña actual"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
        />
        <Input
          type="password"
          label="Nueva contraseña"
          placeholder="Mínimo 8 caracteres"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <Input
          type="password"
          label="Confirmar contraseña"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          error={mismatch ? 'Las contraseñas no coinciden' : undefined}
        />
      </div>
      <Button
        className="mt-4"
        leftIcon={<KeyRound size={15} />}
        isLoading={isPending}
        disabled={!canSubmit}
        onClick={handleSubmit}
      >
        Actualizar contraseña
      </Button>
    </Card>
  );
}
