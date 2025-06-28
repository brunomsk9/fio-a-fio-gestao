
export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'super-admin' | 'admin' | 'barber' | 'client';
  barbershopId?: string; // Para barbeiros que trabalham em uma barbearia específica
  barbershop?: Barbershop;
  // Para admin que pode ser responsável por múltiplas barbearias
  barbershops?: Barbershop[];
  avatar?: string; // Adicionando propriedade avatar
}

export interface Barbershop {
  id: string;
  name: string;
  address: string;
  phone: string;
  adminId: string; // 1 admin para N barbearias
  admin?: User;
  services: Service[];
  barbers: string[]; // IDs dos barbeiros vinculados (N:N através de barber_barbershops)
  createdAt: Date;
  subdomain?: string;
  customDomain?: string;
  domainEnabled?: boolean;
}

export interface DomainSettings {
  id: string;
  barbershopId: string;
  subdomain: string;
  customDomain?: string;
  sslEnabled: boolean;
  dnsConfigured: boolean;
  status: 'pending' | 'active' | 'error';
  createdAt: Date;
  updatedAt: Date;
}

export interface Barber {
  id: string;
  name: string;
  email: string;
  phone: string;
  barbershops: string[]; // IDs das barbearias onde trabalha (N:N através de barber_barbershops)
  specialties: string[];
  workingHours: WorkingHours;
}

// Relacionamento N:N entre barbeiros e barbearias
export interface BarberBarbershop {
  id: string;
  barberId: string;
  barbershopId: string;
  createdAt: Date;
}

export interface Service {
  id: string;
  name: string;
  duration: number; // in minutes
  price: number;
  description?: string;
  barbershopId?: string;
}

export interface Booking {
  id: string;
  clientName: string;
  clientPhone: string;
  barberId: string;
  barbershopId: string;
  serviceId: string;
  date: Date;
  time: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  createdAt: Date;
  notes?: string; // Adicionando propriedade notes
  // Optional joined data from Supabase queries
  barber?: Barber;
  barbershop?: Barbershop;
  service?: Service;
}

export interface WorkingHours {
  [key: string]: {
    start: string;
    end: string;
    isWorking: boolean;
  };
}

// Database row types (snake_case as returned by Supabase)
export interface DatabaseBarber {
  id: string;
  name: string;
  email: string;
  phone: string;
  specialties: string[] | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface DatabaseBarbershop {
  id: string;
  name: string;
  address: string;
  phone: string;
  admin_id: string | null; // 1 admin para N barbearias
  subdomain: string | null;
  custom_domain: string | null;
  domain_enabled: boolean | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface DatabaseBarberBarbershop {
  id: string;
  barber_id: string;
  barbershop_id: string;
  created_at: string | null;
}

export interface DatabaseDomainSettings {
  id: string;
  barbershop_id: string;
  subdomain: string;
  custom_domain: string | null;
  ssl_enabled: boolean;
  dns_configured: boolean;
  status: string;
  created_at: string | null;
  updated_at: string | null;
}

export interface DatabaseBooking {
  id: string;
  client_name: string;
  client_phone: string;
  barber_id: string | null;
  barbershop_id: string | null;
  service_id: string | null;
  date: string;
  time: string;
  status: string;
  notes?: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface DatabaseService {
  id: string;
  name: string;
  duration: number;
  price: number;
  description: string | null;
  barbershop_id: string | null;
  created_at: string | null;
  updated_at: string | null;
}
