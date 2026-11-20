import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { DocumentFormModal } from './DocumentFormModal';

const renderModal = (withExpiry = false) => {
  const onSubmit = vi.fn().mockResolvedValue(undefined);
  const onClose = vi.fn();
  render(
    <DocumentFormModal
      isOpen
      title="Adjuntar documento"
      description="Documento de la OT"
      typePlaceholder="Formulario 337"
      withExpiry={withExpiry}
      isPending={false}
      onSubmit={onSubmit}
      onClose={onClose}
    />
  );
  return { onSubmit, onClose };
};

describe('DocumentFormModal', () => {
  it('no envia si faltan los datos obligatorios', async () => {
    const { onSubmit } = renderModal();

    await userEvent.click(screen.getByRole('button', { name: /subir/i }));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getAllByText('Requerido').length).toBeGreaterThan(0);
  });

  it('envia el documento y cierra el modal', async () => {
    const { onSubmit, onClose } = renderModal();

    await userEvent.type(screen.getByLabelText(/nombre del documento/i), 'Formulario 337');
    await userEvent.type(screen.getByLabelText(/^tipo/i), 'Formulario');
    await userEvent.type(screen.getByLabelText(/url/i), 'https://docs/337.pdf');
    await userEvent.click(screen.getByRole('button', { name: /subir/i }));

    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Formulario 337', type: 'Formulario', fileUrl: 'https://docs/337.pdf' })
    );
  });

  it('solo muestra el vencimiento cuando se pide', () => {
    renderModal(false);
    expect(screen.queryByLabelText(/vencimiento/i)).not.toBeInTheDocument();
  });
});
