-- Script para configurar permissões para operações administrativas
-- Execute este script no Supabase SQL Editor

-- 1. Verificar se RLS está habilitado
SELECT 
  schemaname, 
  tablename, 
  rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('users', 'barbershops', 'services', 'barbers', 'bookings');

-- 2. Garantir que a tabela users permite operações administrativas
-- Primeiro, vamos criar uma política que permite acesso total para operações administrativas
DROP POLICY IF EXISTS "Admin full access to users" ON public.users;

CREATE POLICY "Admin full access to users" ON public.users
  FOR ALL USING (true);

-- 3. Verificar se a função auth.uid() está funcionando corretamente
-- Esta função é usada pelas políticas RLS
SELECT auth.uid();

-- 4. Criar uma função para verificar se o usuário atual é super admin
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role = 'super-admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Criar uma função para verificar se o usuário atual é admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role IN ('super-admin', 'admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Atualizar políticas para usar as funções de verificação
DROP POLICY IF EXISTS "Super admins can manage all users" ON public.users;

CREATE POLICY "Super admins can manage all users" ON public.users
  FOR ALL USING (is_super_admin());

-- 7. Permitir que admins vejam usuários de suas barbearias
DROP POLICY IF EXISTS "Admins can view users in their barbershop" ON public.users;

CREATE POLICY "Admins can view users in their barbershop" ON public.users
  FOR SELECT USING (
    is_admin() AND (
      role = 'super-admin' OR 
      barbershop_id = (SELECT barbershop_id FROM public.users WHERE id = auth.uid())
    )
  );

-- 8. Permitir que usuários vejam e atualizem seus próprios dados
DROP POLICY IF EXISTS "Users can manage own profile" ON public.users;

CREATE POLICY "Users can manage own profile" ON public.users
  FOR ALL USING (auth.uid() = id);

-- 9. Verificar as políticas criadas
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd, 
  qual 
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename = 'users'
ORDER BY policyname;

-- 10. Testar as funções
SELECT 
  'Current user ID' as info, 
  auth.uid() as value
UNION ALL
SELECT 
  'Is super admin' as info, 
  is_super_admin()::text as value
UNION ALL
SELECT 
  'Is admin' as info, 
  is_admin()::text as value;

-- 11. Verificar se há usuários na tabela
SELECT 
  id, 
  name, 
  email, 
  role, 
  barbershop_id,
  created_at
FROM public.users 
ORDER BY created_at DESC 
LIMIT 10; 