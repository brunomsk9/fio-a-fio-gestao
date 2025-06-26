
export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'super-admin' | 'admin' | 'barber' | 'client';
  barbershopId?: string;
}

export interface Barbershop {
  id: string;
  name: string;
  address: string;
  phone: string;
  adminId: string;
  services: Service[];
  barbers: string[];
  createdAt: Date;
}

export interface Barber {
  id: string;
  name: string;
  email: string;
  phone: string;
  barbershops: string[];
  specialties: string[];
  workingHours: WorkingHours;
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
  admin_id: string | null;
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
