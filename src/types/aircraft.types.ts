export type AircraftStatus = 'Operativa' | 'EnMantenimiento' | 'FueraDeServicio' | 'EnInspeccion';

export type AircraftCategory = 'Avion' | 'Helicoptero' | 'Planeador' | 'Ultraliviano';

/** AircraftDto — lo que devuelve el listado (GET /aircraft) */
export interface Aircraft {
  id: string;
  registration: string;
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
  lastInspectionDate?: string;
  nextInspectionDue?: string;
  nextInspectionHours: number;
  certificateExpiry: string;
  isCertificateExpiringSoon: boolean;
  clientId: string;
  clientName: string;
  createdAt: string;
  updatedAt: string;
}

export interface AircraftDocument {
  id: string;
  type: string;
  name: string;
  fileUrl: string;
  expiryDate?: string;
  isExpired: boolean;
  uploadedAt: string;
}

export interface FlightRecord {
  id: string;
  date: string;
  duration: number;
  landings: number;
  pilot: string;
  origin: string;
  destination: string;
  notes?: string;
}

export interface AircraftComponent {
  id: string;
  name: string;
  partNumber: string;
  serialNumber: string;
  manufacturer: string;
  installDate: string;
  installHours: number;
  lifeLimitHours?: number;
  overhaulDueHours?: number;
  status: string;
}

/** AircraftDetailDto — lo que devuelve GET /aircraft/{id} */
export interface AircraftDetail extends Aircraft {
  documents: AircraftDocument[];
  flightHistory: FlightRecord[];
  components: AircraftComponent[];
}

export interface AircraftFilters {
  status?: AircraftStatus;
  category?: AircraftCategory;
  clientId?: string;
  search?: string;
}

export interface CreateAircraftPayload {
  registration: string;
  model: string;
  manufacturer: string;
  year: number;
  category: AircraftCategory;
  serialNumber: string;
  engineModel: string;
  engineSerialNumber: string;
  totalFlightHours: number;
  totalLandings: number;
  lastInspectionDate?: string;
  nextInspectionDue?: string;
  nextInspectionHours: number;
  certificateExpiry: string;
  clientId: string;
}

export interface CreateFlightRecordPayload {
  date: string;
  duration: number;
  landings: number;
  pilot: string;
  origin: string;
  destination: string;
  notes?: string;
}
