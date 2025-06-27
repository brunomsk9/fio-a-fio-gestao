-- Script para configurar permissões de admin do Supabase
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar se o RLS está desabilitado (necessário para desenvolvimento)
-- Se não estiver, execute primeiro o script disable-rls.sql

-- 2. Configurar permissões para o superadmin criar usuários
-- Nota: Para usar supabase.auth.admin.createUser(), você precisa:
-- - Ter um service_role key (não o anon key)
-- - Ou usar o Supabase Dashboard para criar usuários

-- 3. Criar função para verificar se o usuário é superadmin
CREATE OR REPLACE FUNCTION is_super_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = user_id AND role = 'super-admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Criar função para criar usuário (se necessário)
CREATE OR REPLACE FUNCTION create_user_with_role(
  user_email TEXT,
  user_name TEXT,
  user_phone TEXT,
  user_role TEXT,
  user_barbershop_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  new_user_id UUID;
BEGIN
  -- Verificar se o usuário atual é superadmin
  IF NOT is_super_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Apenas super admins podem criar usuários';
  END IF;
  
  -- Gerar UUID para o novo usuário
  new_user_id := gen_random_uuid();
  
  -- Inserir na tabela users
  INSERT INTO public.users (id, name, email, phone, role, barbershop_id)
  VALUES (new_user_id, user_name, user_email, user_phone, user_role, user_barbershop_id);
  
  RETURN new_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Verificar configuração atual
SELECT 
  'RLS Status' as info,
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'users'
UNION ALL
SELECT 
  'Current Users' as info,
  'public' as schemaname,
  'users' as tablename,
  COUNT(*)::text as rowsecurity
FROM public.users;

-- 6. Mostrar usuários existentes
SELECT 
  id,
  name,
  email,
  role,
  barbershop_id,
  created_at
FROM public.users 
ORDER BY created_at DESC; 