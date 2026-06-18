/** ClientDto */
export interface Client {
  id: string;
  name: string;
  businessName: string;
  taxId: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  province: string;
  contactPerson?: string;
  contactPhone?: string;
  isActive: boolean;
  aircraftCount: number;
  totalWorkOrders: number;
  createdAt: string;
}

export interface ClientAircraft {
  id: string;
  registration: string;
  model: string;
  status: string;
  totalFlightHours: number;
}

export interface ClientWorkOrder {
  id: string;
  number: string;
  type: string;
  status: string;
  createdAt: string;
}

/** ClientDetailDto */
export interface ClientDetail extends Client {
  aircraft: ClientAircraft[];
  recentWorkOrders: ClientWorkOrder[];
}

export interface ClientFilters {
  search?: string;
  isActive?: boolean;
}

export interface CreateClientPayload {
  name: string;
  businessName: string;
  taxId: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  province: string;
  contactPerson?: string;
  contactPhone?: string;
}
