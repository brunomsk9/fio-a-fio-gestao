
import { 
  Barber, 
  Barbershop, 
  Booking, 
  Service,
  User,
  DatabaseBarber,
  DatabaseBarbershop,
  DatabaseBooking,
  DatabaseService
} from '../types';

export const transformDatabaseBarber = (dbBarber: DatabaseBarber): Barber => ({
  id: dbBarber.id,
  name: dbBarber.name,
  email: dbBarber.email,
  phone: dbBarber.phone,
  specialties: dbBarber.specialties || [],
  barbershops: [], // Will be populated if needed
  workingHours: {} // Will be populated if needed
});

export const transformDatabaseBarbershop = (dbBarbershop: DatabaseBarbershop, services: Service[] = []): Barbershop => ({
  id: dbBarbershop.id,
  name: dbBarbershop.name,
  address: dbBarbershop.address,
  phone: dbBarbershop.phone,
  adminId: dbBarbershop.admin_id || '',
  services: services,
  barbers: [], // Will be populated if needed
  createdAt: new Date(dbBarbershop.created_at || Date.now()),
  subdomain: dbBarbershop.subdomain || undefined,
  customDomain: dbBarbershop.custom_domain || undefined,
  domainEnabled: dbBarbershop.domain_enabled || false
});

export const transformDatabaseBooking = (dbBooking: DatabaseBooking & { 
  barber?: DatabaseBarber, 
  barbershop?: DatabaseBarbershop, 
  service?: DatabaseService 
}): Booking => ({
  id: dbBooking.id,
  clientName: dbBooking.client_name,
  clientPhone: dbBooking.client_phone,
  barberId: dbBooking.barber_id || '',
  barbershopId: dbBooking.barbershop_id || '',
  serviceId: dbBooking.service_id || '',
  date: new Date(dbBooking.date),
  time: dbBooking.time,
  status: dbBooking.status as 'scheduled' | 'completed' | 'cancelled' | 'confirmed',
  createdAt: new Date(dbBooking.created_at || Date.now()),
  notes: dbBooking.notes || undefined,
  barber: dbBooking.barber ? transformDatabaseBarber(dbBooking.barber) : undefined,
  barbershop: dbBooking.barbershop ? transformDatabaseBarbershop(dbBooking.barbershop) : undefined,
  service: dbBooking.service ? transformDatabaseService(dbBooking.service) : undefined
});

export const transformDatabaseService = (dbService: DatabaseService): Service => ({
  id: dbService.id,
  name: dbService.name,
  duration: dbService.duration,
  price: dbService.price,
  description: dbService.description || undefined,
  barbershopId: dbService.barbershop_id || undefined
});

export const transformDatabaseUser = (dbUser: any): User => ({
  id: dbUser.id,
  name: dbUser.name || '',
  email: dbUser.email || '',
  phone: dbUser.phone || '',
  role: (dbUser.role || 'client') as 'super-admin' | 'admin' | 'barber' | 'client',
  barbershopId: dbUser.barbershop_id || undefined
});
