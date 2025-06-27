-- Script para desabilitar RLS completamente (para desenvolvimento)
-- Execute este script no Supabase SQL Editor

-- Desabilitar RLS em todas as tabelas
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.barbershops DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.services DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.barbers DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.barber_barbershops DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.working_hours DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings DISABLE ROW LEVEL SECURITY;

-- Remover todas as políticas existentes
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Super admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Admins can view users in their barbershop" ON public.users;

DROP POLICY IF EXISTS "Anyone can view barbershops" ON public.barbershops;
DROP POLICY IF EXISTS "Super admins can manage all barbershops" ON public.barbershops;
DROP POLICY IF EXISTS "Admins can manage their own barbershop" ON public.barbershops;

DROP POLICY IF EXISTS "Anyone can view services" ON public.services;
DROP POLICY IF EXISTS "Admins can manage services in their barbershop" ON public.services;

DROP POLICY IF EXISTS "Anyone can view barbers" ON public.barbers;
DROP POLICY IF EXISTS "Barbers can update their own profile" ON public.barbers;
DROP POLICY IF EXISTS "Admins can manage barbers" ON public.barbers;

DROP POLICY IF EXISTS "Anyone can view barber-barbershop relationships" ON public.barber_barbershops;
DROP POLICY IF EXISTS "Admins can manage barber assignments" ON public.barber_barbershops;

DROP POLICY IF EXISTS "Anyone can view working hours" ON public.working_hours;
DROP POLICY IF EXISTS "Barbers can manage their own working hours" ON public.working_hours;
DROP POLICY IF EXISTS "Admins can manage working hours in their barbershop" ON public.working_hours;

DROP POLICY IF EXISTS "Anyone can create bookings" ON public.bookings;
DROP POLICY IF EXISTS "Anyone can view bookings by phone" ON public.bookings;
DROP POLICY IF EXISTS "Barbers can view their own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Barbers can update their own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Admins can manage bookings in their barbershop" ON public.bookings;

-- Verificar se RLS foi desabilitado
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename; 