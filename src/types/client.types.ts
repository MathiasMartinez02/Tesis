export interface Client {
  id: string;
  name: string;
  businessName: string;
  taxId: string; // CUIT
  email: string;
  phone: string;
  address: string;
  city: string;
  province: string;
  contactPerson?: string;
  contactPhone?: string;
  aircraftCount: number;
  totalWorkOrders: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ClientDetail extends Client {
  aircraft: import('./aircraft.types').Aircraft[];
  recentWorkOrders: import('./workOrder.types').WorkOrder[];
}

export interface ClientFilters {
  search?: string;
  isActive?: boolean;
}
