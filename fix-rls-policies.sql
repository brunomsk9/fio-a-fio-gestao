-- Script para corrigir as políticas RLS que estão causando recursão infinita
-- Execute este script no Supabase SQL Editor

-- 1. Primeiro, vamos desabilitar RLS temporariamente para limpar as políticas
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.barbershops DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.services DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.barbers DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.barber_barbershops DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.working_hours DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings DISABLE ROW LEVEL SECURITY;

-- 2. Remover todas as políticas existentes
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

-- 3. Reabilitar RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.barbershops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.barbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.barber_barbershops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.working_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- 4. Criar políticas simplificadas que não causam recursão

-- Políticas para users (simplificadas)
CREATE POLICY "Users can view their own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Permitir acesso público temporariamente para desenvolvimento
CREATE POLICY "Public access for development" ON public.users
  FOR ALL USING (true);

-- Políticas para barbershops (simplificadas)
CREATE POLICY "Public access to barbershops" ON public.barbershops
  FOR ALL USING (true);

-- Políticas para services (simplificadas)
CREATE POLICY "Public access to services" ON public.services
  FOR ALL USING (true);

-- Políticas para barbers (simplificadas)
CREATE POLICY "Public access to barbers" ON public.barbers
  FOR ALL USING (true);

-- Políticas para barber_barbershops (simplificadas)
CREATE POLICY "Public access to barber_barbershops" ON public.barber_barbershops
  FOR ALL USING (true);

-- Políticas para working_hours (simplificadas)
CREATE POLICY "Public access to working_hours" ON public.working_hours
  FOR ALL USING (true);

-- Políticas para bookings (simplificadas)
CREATE POLICY "Public access to bookings" ON public.bookings
  FOR ALL USING (true);

-- 5. Verificar se as políticas foram criadas corretamente
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' 
ORDER BY tablename, policyname; 