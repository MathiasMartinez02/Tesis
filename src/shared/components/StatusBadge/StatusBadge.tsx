import { cn } from '@/lib/utils';
import {
  WORK_ORDER_STATUS_LABELS,
  WORK_ORDER_STATUS_COLORS,
  AIRCRAFT_STATUS_LABELS,
  AIRCRAFT_STATUS_COLORS,
  INSPECTION_STATUS_LABELS,
  INSPECTION_STATUS_COLORS,
  INVENTORY_STATUS_LABELS,
  INVENTORY_STATUS_COLORS,
  WORK_ORDER_PRIORITY_LABELS,
  WORK_ORDER_PRIORITY_COLORS,
  APPOINTMENT_STATUS_LABELS,
  APPOINTMENT_STATUS_COLORS,
} from '@/constants';
import type {
  WorkOrderStatus,
  WorkOrderPriority,
  AircraftStatus,
  InspectionStatus,
  InventoryItemStatus,
  AppointmentStatus,
} from '@/types';

type StatusType =
  | { type: 'workOrder'; status: WorkOrderStatus }
  | { type: 'priority'; status: WorkOrderPriority }
  | { type: 'aircraft'; status: AircraftStatus }
  | { type: 'inspection'; status: InspectionStatus }
  | { type: 'inventory'; status: InventoryItemStatus }
  | { type: 'appointment'; status: AppointmentStatus };

type StatusBadgeProps = StatusType & {
  className?: string;
  showDot?: boolean;
};

export function StatusBadge({ type, status, className, showDot = true }: StatusBadgeProps): JSX.Element {
  let label: string;
  let colorClass: string;

  switch (type) {
    case 'workOrder':
      label = WORK_ORDER_STATUS_LABELS[status];
      colorClass = WORK_ORDER_STATUS_COLORS[status];
      break;
    case 'priority':
      label = WORK_ORDER_PRIORITY_LABELS[status];
      colorClass = WORK_ORDER_PRIORITY_COLORS[status];
      break;
    case 'aircraft':
      label = AIRCRAFT_STATUS_LABELS[status];
      colorClass = AIRCRAFT_STATUS_COLORS[status];
      break;
    case 'inspection':
      label = INSPECTION_STATUS_LABELS[status];
      colorClass = INSPECTION_STATUS_COLORS[status];
      break;
    case 'inventory':
      label = INVENTORY_STATUS_LABELS[status];
      colorClass = INVENTORY_STATUS_COLORS[status];
      break;
    case 'appointment':
      label = APPOINTMENT_STATUS_LABELS[status];
      colorClass = APPOINTMENT_STATUS_COLORS[status];
      break;
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium',
        colorClass,
        className
      )}
    >
      {showDot && (
        <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" aria-hidden />
      )}
      {label}
    </span>
  );
}
