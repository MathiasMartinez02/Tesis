import { useState } from 'react';
import { CheckCircle2, PlayCircle, RotateCcw, MessageSquareWarning } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { TextPromptModal } from '@/shared/components/TextPromptModal/TextPromptModal';
import { useUpdateTaskStatus, useAssignTask } from '../hooks/useWorkOrders';
import type { AssignedMechanic, WorkOrderTask, WorkOrderTaskStatus } from '@/types';

const TASK_STATUS_LABELS: Record<WorkOrderTaskStatus, string> = {
  Pendiente: 'Pendiente',
  EnProceso: 'En Proceso',
  Completada: 'Completada',
  Observada: 'Con Observaciones',
};

const TASK_STATUS_COLORS: Record<WorkOrderTaskStatus, string> = {
  Pendiente: 'bg-gray-100 text-gray-600',
  EnProceso: 'bg-blue-100 text-blue-700',
  Completada: 'bg-emerald-100 text-emerald-700',
  Observada: 'bg-amber-100 text-amber-700',
};

type Prompt = 'hours' | 'observation' | null;

interface WorkOrderTaskItemProps {
  task: WorkOrderTask;
  workOrderId: string;
  mechanics: AssignedMechanic[];
  canManage: boolean;
  canWork: boolean;
}

// Horas reales: numero mayor a cero
const validateHours = (value: string): string | null =>
  Number(value) > 0 ? null : 'Ingresá las horas trabajadas (mayor a cero)';

// Tarea de una OT con sus acciones segun estado y permisos
export function WorkOrderTaskItem({
  task,
  workOrderId,
  mechanics,
  canManage,
  canWork,
}: WorkOrderTaskItemProps): JSX.Element {
  const { mutate: updateStatus, isPending } = useUpdateTaskStatus();
  const { mutate: assignTask, isPending: isAssigning } = useAssignTask();
  const [prompt, setPrompt] = useState<Prompt>(null);

  // Envia el cambio de estado y cierra el modal si lo habia
  const changeStatus = (
    status: WorkOrderTaskStatus,
    extra: { observations?: string; actualHours?: number } = {}
  ): void => {
    updateStatus(
      {
        workOrderId,
        taskId: task.id,
        status,
        observations: extra.observations ?? task.observations,
        actualHours: extra.actualHours,
      },
      { onSuccess: () => setPrompt(null) }
    );
  };

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-surface-100 p-3 dark:border-surface-700 sm:flex-row sm:items-start">
      <div className="flex flex-1 items-start gap-3">
        <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-surface-300 bg-white text-xs font-bold text-surface-500 dark:border-surface-600 dark:bg-surface-800">
          {task.orderIndex}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-surface-900 dark:text-white">
              {task.title}
            </span>
            <span
              className={`rounded px-1.5 py-0.5 text-2xs font-medium ${TASK_STATUS_COLORS[task.status]}`}
            >
              {TASK_STATUS_LABELS[task.status]}
            </span>
            {task.requiresInspection && (
              <span className="rounded bg-purple-100 px-1.5 py-0.5 text-2xs font-medium text-purple-700">
                {task.inspectedAt ? 'Inspeccionada' : 'Req. Inspección'}
              </span>
            )}
          </div>
          <p className="mt-0.5 text-xs text-surface-500">{task.description}</p>
          {task.observations && (
            <p className="mt-0.5 text-xs text-amber-700">Obs: {task.observations}</p>
          )}
          <p className="mt-0.5 text-xs text-surface-400">
            {task.actualHours}h reales / {task.estimatedHours}h estimadas
          </p>
          {canManage ? (
            <label className="mt-1.5 flex items-center gap-2 text-xs text-surface-500">
              Responsable:
              <select
                value={task.assignedToId ?? ''}
                disabled={isAssigning}
                onChange={(e) =>
                  assignTask({ workOrderId, taskId: task.id, userId: e.target.value || null })
                }
                className="rounded border border-surface-200 bg-white px-1.5 py-0.5 text-xs dark:border-surface-600 dark:bg-surface-800"
              >
                <option value="">Sin asignar</option>
                {mechanics.map((m) => (
                  <option key={m.userId} value={m.userId}>
                    {m.userName}
                  </option>
                ))}
              </select>
            </label>
          ) : (
            task.assignedToName && (
              <p className="mt-0.5 text-xs text-surface-400">Responsable: {task.assignedToName}</p>
            )
          )}
        </div>
      </div>

      {canWork && (
        <div className="flex shrink-0 flex-wrap gap-1">
          {task.status === 'Pendiente' && (
            <Button
              size="xs"
              variant="outline"
              leftIcon={<PlayCircle size={13} />}
              isLoading={isPending}
              onClick={() => changeStatus('EnProceso')}
            >
              Iniciar
            </Button>
          )}
          {task.status === 'EnProceso' && (
            <>
              <Button
                size="xs"
                variant="success"
                leftIcon={<CheckCircle2 size={13} />}
                onClick={() => setPrompt('hours')}
              >
                Completar
              </Button>
              <Button
                size="xs"
                variant="ghost"
                leftIcon={<MessageSquareWarning size={13} />}
                onClick={() => setPrompt('observation')}
              >
                Observar
              </Button>
            </>
          )}
          {task.status === 'Observada' && (
            <Button
              size="xs"
              variant="outline"
              leftIcon={<PlayCircle size={13} />}
              isLoading={isPending}
              onClick={() => changeStatus('EnProceso')}
            >
              Retomar
            </Button>
          )}
          {task.status === 'Completada' && !task.inspectedAt && (
            <Button
              size="xs"
              variant="ghost"
              leftIcon={<RotateCcw size={13} />}
              isLoading={isPending}
              onClick={() => changeStatus('EnProceso')}
            >
              Reabrir
            </Button>
          )}
        </div>
      )}

      <TextPromptModal
        isOpen={prompt === 'hours'}
        title="Completar tarea"
        description={task.title}
        label="Horas reales trabajadas"
        confirmLabel="Completar"
        inputType="number"
        validate={validateHours}
        isLoading={isPending}
        onClose={() => setPrompt(null)}
        onConfirm={(value) => changeStatus('Completada', { actualHours: Number(value) })}
      />
      <TextPromptModal
        isOpen={prompt === 'observation'}
        title="Observar tarea"
        description={task.title}
        label="Observación"
        confirmLabel="Registrar"
        isLoading={isPending}
        onClose={() => setPrompt(null)}
        onConfirm={(observations) => changeStatus('Observada', { observations })}
      />
    </div>
  );
}
