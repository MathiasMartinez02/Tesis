import { useEffect, useId, useState } from 'react';
import { Modal } from '@/shared/components/Modal/Modal';
import { Button } from '@/shared/components/ui/Button';

interface TextPromptModalProps {
  isOpen: boolean;
  title: string;
  description?: string;
  label: string;
  confirmLabel: string;
  confirmVariant?: 'primary' | 'destructive';
  inputType?: 'textarea' | 'number';
  validate?: (value: string) => string | null;
  isLoading?: boolean;
  onConfirm: (text: string) => void;
  onClose: () => void;
}

const FIELD_CLASS =
  'w-full rounded-lg border border-surface-300 bg-white px-3 py-2 text-sm outline-none placeholder:text-surface-400 focus:border-aviation-500 focus:ring-2 focus:ring-aviation-500/20 dark:border-surface-600 dark:bg-surface-800 dark:text-white';

// Texto obligatorio por defecto
const requireText = (value: string): string | null => (value.trim() ? null : 'Este campo es obligatorio');

// Modal que pide un texto o numero validado antes de confirmar
export function TextPromptModal({
  isOpen,
  title,
  description,
  label,
  confirmLabel,
  confirmVariant = 'primary',
  inputType = 'textarea',
  validate = requireText,
  isLoading = false,
  onConfirm,
  onClose,
}: TextPromptModalProps): JSX.Element {
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const fieldId = useId();

  useEffect(() => {
    if (isOpen) {
      setText('');
      setError(null);
    }
  }, [isOpen]);

  // Valida el valor y confirma
  const handleConfirm = (): void => {
    const validationError = validate(text);
    setError(validationError);
    if (!validationError) onConfirm(text.trim());
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      description={description}
      size="sm"
      footer={
        <>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="button" variant={confirmVariant} isLoading={isLoading} onClick={handleConfirm}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <label htmlFor={fieldId} className="mb-1.5 block text-sm font-medium text-surface-700 dark:text-surface-300">
        {label} <span className="text-red-500">*</span>
      </label>
      {inputType === 'number' ? (
        <input
          id={fieldId}
          type="number"
          inputMode="decimal"
          step="0.5"
          min="0"
          value={text}
          onChange={(e) => setText(e.target.value)}
          className={FIELD_CLASS}
        />
      ) : (
        <textarea
          id={fieldId}
          rows={3}
          value={text}
          onChange={(e) => setText(e.target.value)}
          className={`${FIELD_CLASS} resize-none`}
        />
      )}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </Modal>
  );
}
