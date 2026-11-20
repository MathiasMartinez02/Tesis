import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { AssignedMechanic, WorkOrderTask } from '@/types';

const updateStatus = vi.fn();
const assignTask = vi.fn();
vi.mock('../hooks/useWorkOrders', () => ({
  useUpdateTaskStatus: () => ({ mutate: updateStatus, isPending: false }),
  useAssignTask: () => ({ mutate: assignTask, isPending: false }),
}));

import { WorkOrderTaskItem } from './WorkOrderTaskItem';

const lastUpdate = (): unknown => (updateStatus.mock.lastCall as unknown[] | undefined)?.[0];

const lastCompleteButton = (): HTMLElement => {
  const buttons = screen.getAllByRole('button', { name: /^completar$/i });
  return buttons[buttons.length - 1];
};

const mechanics: AssignedMechanic[] = [
  { userId: 'm1', userName: 'Jorge Mendez', role: 'Mecanico', assignedAt: '2026-11-20T00:00:00' },
];

const buildTask = (overrides: Partial<WorkOrderTask> = {}): WorkOrderTask => ({
  id: 't1',
  orderIndex: 1,
  title: 'Cambio de aceite',
  description: 'Drenar y reponer',
  status: 'Pendiente',
  estimatedHours: 2,
  actualHours: 0,
  requiresInspection: false,
  ...overrides,
});

const renderItem = (task: WorkOrderTask, { canManage = true, canWork = true } = {}) =>
  render(<WorkOrderTaskItem task={task} workOrderId="wo-1" mechanics={mechanics} canManage={canManage} canWork={canWork} />);

describe('WorkOrderTaskItem', () => {
  beforeEach(() => {
    updateStatus.mockReset();
    assignTask.mockReset();
  });

  it('una tarea pendiente se inicia', async () => {
    renderItem(buildTask());

    await userEvent.click(screen.getByRole('button', { name: /iniciar/i }));

    expect(lastUpdate()).toMatchObject({ workOrderId: 'wo-1', taskId: 't1', status: 'EnProceso' });
  });

  it('completar pide horas reales validas', async () => {
    renderItem(buildTask({ status: 'EnProceso' }));

    await userEvent.click(screen.getByRole('button', { name: /^completar$/i }));
    await userEvent.type(screen.getByLabelText(/horas reales/i), '0');
    await userEvent.click(lastCompleteButton());
    expect(updateStatus).not.toHaveBeenCalled();
    expect(screen.getByText(/mayor a cero/i)).toBeInTheDocument();

    await userEvent.clear(screen.getByLabelText(/horas reales/i));
    await userEvent.type(screen.getByLabelText(/horas reales/i), '2.5');
    await userEvent.click(lastCompleteButton());

    expect(lastUpdate()).toMatchObject({ status: 'Completada', actualHours: 2.5 });
  });

  it('una tarea inspeccionada no se puede reabrir', () => {
    renderItem(buildTask({ status: 'Completada', requiresInspection: true, inspectedAt: '2026-11-20T00:00:00' }));

    expect(screen.queryByRole('button', { name: /reabrir/i })).not.toBeInTheDocument();
    expect(screen.getByText('Inspeccionada')).toBeInTheDocument();
  });

  it('sin permiso no muestra acciones ni el selector de responsable', () => {
    renderItem(buildTask({ assignedToName: 'Jorge Mendez' }), { canManage: false, canWork: false });

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    expect(screen.getByText('Responsable: Jorge Mendez')).toBeInTheDocument();
  });

  it('quien gestiona asigna la tarea a un mecanico de la OT', async () => {
    renderItem(buildTask());

    await userEvent.selectOptions(screen.getByRole('combobox'), 'm1');

    expect(assignTask).toHaveBeenCalledWith({ workOrderId: 'wo-1', taskId: 't1', userId: 'm1' });
  });
});
