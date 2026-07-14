import { useState } from 'react';
import { KeyRound, Send } from 'lucide-react';
import { Modal } from '@/shared/components/Modal/Modal';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { useForgotPassword, useResetPassword } from '../hooks/usePasswordReset';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Modal de "olvidé mi contraseña" en 2 pasos: pedir el token (MVP sin email real, el token se muestra en pantalla
// porque el proyecto no tiene infraestructura de correo) y despues aplicar la nueva contraseña con ese token.
// Decision de alcance documentada en PLAN_ANALISIS_FUNCIONAL.md (Fase 7): en un flujo real el token viajaria por email,
// nunca se mostraria en la UI.
export function ForgotPasswordModal({ isOpen, onClose }: ForgotPasswordModalProps): JSX.Element {
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState<'request' | 'reset'>('request');

  const { mutate: requestToken, isPending: isRequesting } = useForgotPassword();
  const { mutate: resetPassword, isPending: isResetting } = useResetPassword();

  const handleClose = (): void => {
    setEmail('');
    setToken('');
    setNewPassword('');
    setStep('request');
    onClose();
  };

  const handleRequestToken = (): void => {
    requestToken(email, {
      onSuccess: (result) => {
        setToken(result.resetToken);
        setStep('reset');
      },
    });
  };

  const handleReset = (): void => {
    resetPassword(
      { token, newPassword },
      { onSuccess: handleClose }
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Recuperar contraseña"
      description={
        step === 'request'
          ? 'Ingresá tu email para generar un token de reseteo de un solo uso'
          : 'Ingresá la nueva contraseña para aplicar el token generado'
      }
      footer={
        step === 'request' ? (
          <Button leftIcon={<Send size={15} />} isLoading={isRequesting} onClick={handleRequestToken} disabled={!email}>
            Generar token
          </Button>
        ) : (
          <Button
            leftIcon={<KeyRound size={15} />}
            isLoading={isResetting}
            onClick={handleReset}
            disabled={newPassword.length < 8}
          >
            Restablecer contraseña
          </Button>
        )
      }
    >
      {step === 'request' ? (
        <Input
          type="email"
          label="Email"
          placeholder="tu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      ) : (
        <div className="space-y-4">
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300">
            MVP sin envío de email real: en un flujo de producción este token llegaría por correo. Se muestra acá solo
            para poder probar el flujo completo.
          </div>
          <Input label="Token de reseteo" value={token} onChange={(e) => setToken(e.target.value)} />
          <Input
            type="password"
            label="Nueva contraseña"
            placeholder="Mínimo 8 caracteres"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </div>
      )}
    </Modal>
  );
}
