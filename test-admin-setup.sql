-- Script para testar configuração de admin
-- Execute este script no Supabase SQL Editor

-- 1. Primeiro, vamos verificar se há usuários admin existentes
SELECT id, name, email, role FROM public.users WHERE role = 'admin';

-- 2. Verificar barbearias existentes
SELECT id, name, admin_id FROM public.barbershops;

-- 3. Se não houver admins, vamos criar um admin de teste
-- (Substitua o ID pelo ID de um usuário existente na autenticação)
INSERT INTO public.users (id, name, email, phone, role) VALUES
(
  '00000000-0000-0000-0000-000000000001', -- Substitua pelo ID real de um usuário
  'Admin Teste',
  'admin@teste.com',
  '(11) 99999-9999',
  'admin'
) ON CONFLICT (id) DO NOTHING;

-- 4. Vincular o admin à primeira barbearia
UPDATE public.barbershops 
SET admin_id = '00000000-0000-0000-0000-000000000001'
WHERE id = '550e8400-e29b-41d4-a716-446655440001';

-- 5. Verificar o resultado
SELECT 
  b.id as barbershop_id,
  b.name as barbershop_name,
  b.admin_id,
  u.name as admin_name,
  u.email as admin_email
FROM public.barbershops b
LEFT JOIN public.users u ON b.admin_id = u.id; 