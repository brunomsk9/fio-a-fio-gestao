
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
}

export interface WorkingHours {
  [key: string]: {
    start: string;
    end: string;
    isWorking: boolean;
  };
}
