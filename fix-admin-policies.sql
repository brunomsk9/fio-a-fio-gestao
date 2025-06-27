-- Script para corrigir políticas RLS para admins
-- Execute este script no Supabase SQL Editor

-- 1. Verificar políticas existentes
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('barbershops', 'users', 'barbers', 'bookings');

-- 2. Remover políticas conflitantes para barbershops
DROP POLICY IF EXISTS "Admins can manage their own barbershop" ON public.barbershops;

-- 3. Criar nova política para admins gerenciarem suas barbearias
CREATE POLICY "Admins can manage their own barbershops" ON public.barbershops
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND role = 'admin' 
      AND admin_id = barbershops.admin_id
    )
  );

-- 4. Verificar se há usuários admin
SELECT id, name, email, role, admin_id FROM public.users WHERE role = 'admin';

-- 5. Verificar barbearias e seus admins
SELECT 
  b.id as barbershop_id,
  b.name as barbershop_name,
  b.admin_id,
  u.name as admin_name,
  u.email as admin_email
FROM public.barbershops b
LEFT JOIN public.users u ON b.admin_id = u.id;

-- 6. Testar acesso do admin
-- (Execute como admin logado)
SELECT * FROM public.barbershops WHERE admin_id = auth.uid(); 