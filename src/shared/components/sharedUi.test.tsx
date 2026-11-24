import { act, render, renderHook, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Button } from './ui/Button';
import { Select } from './ui/Select';
import { Pagination } from './Pagination/Pagination';
import { DataTable } from './DataTable/DataTable';
import { Modal } from './Modal/Modal';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';

describe('Button', () => {
  it('por defecto no envia formularios', () => {
    render(<Button>Accion</Button>);
    expect(screen.getByRole('button', { name: 'Accion' })).toHaveAttribute('type', 'button');
  });
});

describe('Select', () => {
  const options = [{ value: 'Aprobado', label: 'Aprobado' }];

  it('en un filtro permite volver a la opcion vacia', () => {
    render(<Select label="Estado" placeholder="Todos" options={options} />);
    expect(screen.getByRole('option', { name: 'Todos' })).not.toBeDisabled();
  });

  it('en un campo obligatorio la opcion vacia no se puede elegir', () => {
    render(<Select label="Estado" placeholder="Seleccionar" options={options} required />);
    expect(screen.getByRole('option', { name: 'Seleccionar' })).toBeDisabled();
  });
});

describe('Pagination', () => {
  it('muestra el rango y navega', async () => {
    const onPageChange = vi.fn();
    render(<Pagination page={2} pageSize={10} total={25} totalPages={3} onPageChange={onPageChange} />);

    expect(screen.getByText('Mostrando 11–20 de 25')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Siguiente' }));
    expect(onPageChange).toHaveBeenCalledWith(3);
  });

  it('no se muestra con una sola pagina', () => {
    const { container } = render(<Pagination page={1} pageSize={10} total={5} totalPages={1} onPageChange={vi.fn()} />);
    expect(container).toBeEmptyDOMElement();
  });
});

describe('DataTable', () => {
  it('las filas se abren con Enter desde el teclado', async () => {
    const onRowClick = vi.fn();
    render(
      <DataTable
        data={[{ id: '1', name: 'LV-ABC' }]}
        columns={[{ key: 'name', header: 'Matrícula' }]}
        onRowClick={onRowClick}
      />
    );

    const row = screen.getByText('LV-ABC').closest('tr');
    row?.focus();
    await userEvent.keyboard('{Enter}');

    expect(onRowClick).toHaveBeenCalledWith({ id: '1', name: 'LV-ABC' });
  });
});

describe('Modal', () => {
  it('el Tab no se escapa del dialogo', async () => {
    render(
      <Modal isOpen onClose={vi.fn()} title="Confirmar" footer={<Button>Aceptar</Button>}>
        <input aria-label="Motivo" />
      </Modal>
    );

    const close = screen.getByRole('button', { name: /cerrar/i });
    expect(close).toHaveFocus();
    await userEvent.tab();
    expect(screen.getByLabelText('Motivo')).toHaveFocus();
    await userEvent.tab();
    expect(screen.getByRole('button', { name: 'Aceptar' })).toHaveFocus();
    await userEvent.tab();
    expect(close).toHaveFocus();
  });
});

describe('useDebouncedValue', () => {
  it('actualiza el valor recien cuando deja de cambiar', () => {
    vi.useFakeTimers();
    const { result, rerender } = renderHook(({ value }) => useDebouncedValue(value, 300), { initialProps: { value: 'a' } });

    rerender({ value: 'ab' });
    expect(result.current).toBe('a');
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(result.current).toBe('ab');
    vi.useRealTimers();
  });
});
