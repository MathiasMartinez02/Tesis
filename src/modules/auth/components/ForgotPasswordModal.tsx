import { useState } from 'react';
import { Send } from 'lucide-react';
import { Modal } from '@/shared/components/Modal/Modal';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { useForgotPassword } from '../hooks/usePasswordReset';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Solicitud de cambio de contraseña: el gerente recibe el aviso y asigna una nueva
export function ForgotPasswordModal({ isOpen, onClose }: ForgotPasswordModalProps): JSX.Element {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const { mutate: requestReset, isPending } = useForgotPassword();

  // Cierra y limpia el estado del modal
  const handleClose = (): void => {
    setEmail('');
    setSent(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Recuperar contraseña"
      description={
        sent
          ? undefined
          : 'Ingresá tu email. El gerente recibe el aviso y te asigna una contraseña nueva.'
      }
      footer={
        sent ? (
          <Button onClick={handleClose}>Entendido</Button>
        ) : (
          <Button
            leftIcon={<Send size={15} />}
            isLoading={isPending}
            disabled={!email.trim()}
            onClick={() => requestReset(email.trim(), { onSuccess: () => setSent(true) })}
          >
            Enviar solicitud
          </Button>
        )
      }
    >
      {sent ? (
        <p className="text-sm text-surface-700 dark:text-surface-300">
          Si el email está registrado, el gerente ya recibió tu solicitud. Cuando te asigne una contraseña nueva vas a
          poder ingresar con ella.
        </p>
      ) : (
        <Input
          type="email"
          label="Email"
          placeholder="tu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      )}
    </Modal>
  );
}
