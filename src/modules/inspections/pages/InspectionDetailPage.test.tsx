import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { InspectionDetail, UserPermissions } from '@/types';

const start = vi.fn();
const complete = vi.fn();
const approve = vi.fn();
const reject = vi.fn();
const checkItem = vi.fn();
let currentInspection: InspectionDetail;

vi.mock('react-router-dom', () => ({ useParams: () => ({ id: 'insp-1' }), useNavigate: () => vi.fn() }));
vi.mock('../hooks/useInspections', () => ({
  useInspection: () => ({ data: currentInspection, isLoading: false, isError: false, refetch: vi.fn() }),
  useStartInspection: () => ({ mutate: start, isPending: false }),
  useCompleteInspection: () => ({ mutate: complete, isPending: false }),
  useApproveInspection: () => ({ mutate: approve, isPending: false }),
  useRejectInspection: () => ({ mutate: reject, isPending: false }),
  useUpdateChecklistItem: () => ({ mutate: checkItem, isPending: false }),
}));

import { useAuthStore } from '@/store/authStore';
import { InspectionDetailPage } from './InspectionDetailPage';

const inspectorPermissions = { canApproveInspections: true } as UserPermissions;

const buildInspection = (
  status: InspectionDetail['status'],
  itemStatuses: InspectionDetail['checklistSections'][number]['items'][number]['status'][]
): InspectionDetail => ({
  id: 'insp-1',
  workOrderId: 'wo-1',
  workOrderNumber: 'OT-2026-0001',
  type: 'Inspeccion100h',
  status,
  aircraftId: 'a1',
  aircraftRegistration: 'LV-ABC',
  aircraftHours: 1500,
  scheduledDate: '2026-11-20T00:00:00',
  createdAt: '2026-11-20T00:00:00',
  checklistSections: [
    {
      id: 's1',
      title: 'Grupo motor',
      orderIndex: 1,
      items: itemStatuses.map((itemStatus, index) => ({
        id: `i${index + 1}`,
        code: `MOT-0${index + 1}`,
        description: `Control ${index + 1}`,
        orderIndex: index + 1,
        status: itemStatus,
        requiresPhoto: false,
      })),
    },
  ],
});

describe('InspectionDetailPage', () => {
  beforeEach(() => {
    [start, complete, approve, reject, checkItem].forEach((fn) => fn.mockReset());
    useAuthStore.setState({ user: { id: 'u1', role: 'Inspector', permissions: inspectorPermissions } as never });
  });

  it('muestra el tipo legible y permite iniciar una inspeccion pendiente', async () => {
    currentInspection = buildInspection('Pendiente', ['Pendiente']);
    render(<InspectionDetailPage />);

    expect(screen.getByRole('heading', { name: 'Inspección 100 horas' })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /iniciar inspección/i }));

    expect(start).toHaveBeenCalledWith('insp-1');
  });

  it('en proceso no deja completar con items pendientes', () => {
    currentInspection = buildInspection('EnProceso', ['Conforme', 'Pendiente']);
    render(<InspectionDetailPage />);

    expect(screen.getByRole('button', { name: /completar checklist/i })).toBeDisabled();
  });

  it('marcar un item como conforme lo envia directo', async () => {
    currentInspection = buildInspection('EnProceso', ['Pendiente']);
    render(<InspectionDetailPage />);

    const group = screen.getByRole('group', { name: /resultado de MOT-01/i });
    await userEvent.click(within(group).getByRole('button', { name: 'Conforme' }));

    expect(checkItem).toHaveBeenCalledWith({ inspectionId: 'insp-1', itemId: 'i1', status: 'Conforme' });
  });

  it('no conforme exige observacion antes de enviar', async () => {
    currentInspection = buildInspection('EnProceso', ['Pendiente']);
    render(<InspectionDetailPage />);

    await userEvent.click(screen.getByRole('button', { name: 'No conforme' }));
    await userEvent.click(screen.getByRole('button', { name: 'Registrar' }));
    expect(checkItem).not.toHaveBeenCalled();
    expect(screen.getByText('Este campo es obligatorio')).toBeInTheDocument();

    await userEvent.type(screen.getByLabelText(/observación/i), 'Pérdida de aceite');
    await userEvent.click(screen.getByRole('button', { name: 'Registrar' }));

    expect(checkItem).toHaveBeenCalledWith(
      { inspectionId: 'insp-1', itemId: 'i1', status: 'NoConforme', observations: 'Pérdida de aceite' },
      expect.anything()
    );
  });

  it('completada con no conformidades no deja aprobar y rechazar pide motivo', async () => {
    currentInspection = buildInspection('Completada', ['Conforme', 'NoConforme']);
    render(<InspectionDetailPage />);

    expect(screen.getByRole('button', { name: /aprobar/i })).toBeDisabled();

    await userEvent.click(screen.getByRole('button', { name: /^rechazar$/i }));
    await userEvent.type(screen.getByLabelText(/motivo del rechazo/i), 'Torque fuera de tolerancia');
    const dialogButtons = screen.getAllByRole('button', { name: /^rechazar$/i });
    await userEvent.click(dialogButtons[dialogButtons.length - 1]);

    expect(reject).toHaveBeenCalledWith(
      { id: 'insp-1', rejectionReason: 'Torque fuera de tolerancia' },
      expect.anything()
    );
  });

  it('sin permiso de inspector no muestra acciones ni controles del checklist', () => {
    useAuthStore.setState({ user: { id: 'u2', role: 'Mecanico', permissions: { canViewDashboard: true } } as never });
    currentInspection = buildInspection('EnProceso', ['Pendiente']);
    render(<InspectionDetailPage />);

    expect(screen.queryByRole('button', { name: /completar checklist/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('group', { name: /resultado de/i })).not.toBeInTheDocument();
  });
});
