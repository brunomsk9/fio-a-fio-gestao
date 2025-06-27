-- Script para corrigir relacionamentos e garantir regras de negócio
-- Execute este script no Supabase SQL Editor

-- 1. Verificar estrutura atual
SELECT '=== ESTRUTURA ATUAL ===' as info;

-- Verificar se há usuários admin
SELECT 'Usuários Admin:' as info;
SELECT id, name, email, role, barbershop_id FROM public.users WHERE role = 'admin';

-- Verificar barbearias e seus admins
SELECT 'Barbearias e Admins:' as info;
SELECT 
  b.id as barbershop_id,
  b.name as barbershop_name,
  b.admin_id,
  u.name as admin_name,
  u.email as admin_email
FROM public.barbershops b
LEFT JOIN public.users u ON b.admin_id = u.id;

-- Verificar barbeiros e suas barbearias
SELECT 'Barbeiros e Barbearias:' as info;
SELECT 
  bb.id as barber_id,
  bb.name as barber_name,
  bb.email as barber_email,
  bbs.barbershop_id,
  bs.name as barbershop_name
FROM public.barbers bb
LEFT JOIN public.barber_barbershops bbs ON bb.id = bbs.barber_id
LEFT JOIN public.barbershops bs ON bbs.barbershop_id = bs.id
ORDER BY bb.name, bs.name;

-- 2. Remover políticas conflitantes
SELECT '=== REMOVENDO POLÍTICAS CONFLITANTES ===' as info;

DROP POLICY IF EXISTS "Admins can view users in their barbershop" ON public.users;
DROP POLICY IF EXISTS "Admins can manage their own barbershop" ON public.barbershops;
DROP POLICY IF EXISTS "Admins can manage services in their barbershop" ON public.services;
DROP POLICY IF EXISTS "Admins can manage barber assignments" ON public.barber_barbershops;
DROP POLICY IF EXISTS "Admins can manage working hours in their barbershop" ON public.working_hours;

-- 3. Criar políticas corretas para relacionamentos N:N

-- Política para admins verem usuários de suas barbearias
CREATE POLICY "Admins can view users in their barbershops" ON public.users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.barbershops 
      WHERE admin_id = auth.uid() 
      AND id = users.barbershop_id
    )
  );

-- Política para admins gerenciarem suas barbearias
CREATE POLICY "Admins can manage their own barbershops" ON public.barbershops
  FOR ALL USING (
    admin_id = auth.uid()
  );

-- Política para admins gerenciarem serviços de suas barbearias
CREATE POLICY "Admins can manage services in their barbershops" ON public.services
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.barbershops 
      WHERE admin_id = auth.uid() 
      AND id = services.barbershop_id
    )
  );

-- Política para admins gerenciarem vínculos barbeiro-barbearia
CREATE POLICY "Admins can manage barber assignments" ON public.barber_barbershops
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.barbershops 
      WHERE admin_id = auth.uid() 
      AND id = barber_barbershops.barbershop_id
    )
  );

-- Política para admins gerenciarem horários de suas barbearias
CREATE POLICY "Admins can manage working hours in their barbershops" ON public.working_hours
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.barbershops 
      WHERE admin_id = auth.uid() 
      AND id = working_hours.barbershop_id
    )
  );

-- Política para admins gerenciarem agendamentos de suas barbearias
CREATE POLICY "Admins can manage bookings in their barbershops" ON public.bookings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.barbershops 
      WHERE admin_id = auth.uid() 
      AND id = bookings.barbershop_id
    )
  );

-- 4. Criar dados de teste para verificar relacionamentos

-- Inserir admin de teste (substitua pelo ID real)
INSERT INTO public.users (id, name, email, phone, role) VALUES
(
  '00000000-0000-0000-0000-000000000001', -- Substitua pelo ID real
  'Admin Teste',
  'admin@teste.com',
  '(11) 99999-9999',
  'admin'
) ON CONFLICT (id) DO NOTHING;

-- Vincular admin às barbearias existentes
UPDATE public.barbershops 
SET admin_id = '00000000-0000-0000-0000-000000000001'
WHERE id IN (
  '550e8400-e29b-41d4-a716-446655440001',
  '550e8400-e29b-41d4-a716-446655440002'
);

-- 5. Verificar resultado
SELECT '=== RESULTADO FINAL ===' as info;

-- Verificar barbearias do admin
SELECT 'Barbearias do Admin:' as info;
SELECT 
  b.id as barbershop_id,
  b.name as barbershop_name,
  b.admin_id,
  u.name as admin_name
FROM public.barbershops b
LEFT JOIN public.users u ON b.admin_id = u.id
WHERE b.admin_id = '00000000-0000-0000-0000-000000000001';

-- Verificar políticas criadas
SELECT 'Políticas Criadas:' as info;
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies 
WHERE tablename IN ('barbershops', 'users', 'services', 'barber_barbershops', 'working_hours', 'bookings')
AND policyname LIKE '%Admin%'
ORDER BY tablename, policyname; 