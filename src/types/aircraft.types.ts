export type AircraftStatus = 'operativa' | 'en_mantenimiento' | 'fuera_de_servicio' | 'en_inspeccion';

export type AircraftCategory = 'avion' | 'helicoptero' | 'planeador' | 'ultraliviano';

export interface Aircraft {
  id: string;
  registration: string; // LV-XXXX
  model: string;
  manufacturer: string;
  year: number;
  category: AircraftCategory;
  status: AircraftStatus;
  serialNumber: string;
  engineModel: string;
  engineSerialNumber: string;
  totalFlightHours: number;
  totalLandings: number;
  lastInspectionDate: string;
  nextInspectionDue: string;
  nextInspectionHours: number;
  certificateExpiry: string;
  clientId: string;
  clientName: string;
  createdAt: string;
  updatedAt: string;
}

export interface AircraftDetail extends Aircraft {
  documents: AircraftDocument[];
  flightHistory: FlightRecord[];
  maintenanceHistory: MaintenanceRecord[];
  components: AircraftComponent[];
}

export interface AircraftDocument {
  id: string;
  aircraftId: string;
  type: 'certificado_aeronavegabilidad' | 'manual_vuelo' | 'log_book' | 'permiso_radio' | 'poliza_seguro' | 'otro';
  name: string;
  fileUrl: string;
  expiryDate?: string;
  isExpired: boolean;
  uploadedAt: string;
}

export interface FlightRecord {
  id: string;
  aircraftId: string;
  date: string;
  duration: number; // horas
  landings: number;
  pilot: string;
  origin: string;
  destination: string;
  notes?: string;
}

export interface MaintenanceRecord {
  id: string;
  aircraftId: string;
  workOrderId: string;
  type: string;
  description: string;
  performedAt: string;
  performedBy: string;
  hoursAtMaintenance: number;
  nextDueHours?: number;
  nextDueDate?: string;
}

export interface AircraftComponent {
  id: string;
  aircraftId: string;
  name: string;
  partNumber: string;
  serialNumber: string;
  manufacturer: string;
  installDate: string;
  installHours: number;
  lifeLimitHours?: number;
  overhauldueHours?: number;
  status: 'activo' | 'por_vencer' | 'vencido';
}

export interface AircraftFilters {
  status?: AircraftStatus;
  category?: AircraftCategory;
  clientId?: string;
  search?: string;
}
