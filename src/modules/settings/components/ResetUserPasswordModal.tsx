import { useEffect, useState } from 'react';
import { KeyRound } from 'lucide-react';
import { Modal } from '@/shared/components/Modal/Modal';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { useResetUserPassword } from '../hooks/useUsers';
import type { User } from '@/types';

interface ResetUserPasswordModalProps {
  user: User | null;
  onClose: () => void;
}

const MIN_LENGTH = 8;

// Modal del gerente para asignar una contraseña nueva a un usuario
export function ResetUserPasswordModal({ user, onClose }: ResetUserPasswordModalProps): JSX.Element {
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const { mutate: resetPassword, isPending } = useResetUserPassword();

  useEffect(() => {
    setPassword('');
    setConfirmation('');
    setSubmitted(false);
  }, [user]);

  const tooShort = password.length < MIN_LENGTH;
  const mismatch = password !== confirmation;

  // Valida y envia la contraseña nueva
  const handleSubmit = (): void => {
    setSubmitted(true);
    if (!user || tooShort || mismatch) return;
    resetPassword({ id: user.id, newPassword: password }, { onSuccess: onClose });
  };

  return (
    <Modal
      isOpen={user !== null}
      onClose={onClose}
      title="Asignar contraseña nueva"
      description={user ? `${user.firstName} ${user.lastName} (${user.email})` : undefined}
      size="sm"
      footer={
        <>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="button" leftIcon={<KeyRound size={15} />} isLoading={isPending} onClick={handleSubmit}>
            Asignar
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Input
          type="password"
          label="Contraseña nueva"
          placeholder={`Mínimo ${MIN_LENGTH} caracteres`}
          value={password}
          error={submitted && tooShort ? `Debe tener al menos ${MIN_LENGTH} caracteres` : undefined}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Input
          type="password"
          label="Repetir contraseña"
          value={confirmation}
          error={submitted && !tooShort && mismatch ? 'Las contraseñas no coinciden' : undefined}
          onChange={(e) => setConfirmation(e.target.value)}
        />
        <p className="text-xs text-surface-500">
          Las sesiones abiertas del usuario se cierran y tiene que ingresar con esta contraseña.
        </p>
      </div>
    </Modal>
  );
}
