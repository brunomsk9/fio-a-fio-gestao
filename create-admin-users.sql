-- Script para criar usuários admin de teste
-- Execute este script no Supabase SQL Editor após criar os usuários na autenticação

-- Primeiro, crie os usuários na autenticação do Supabase:
-- 1. Vá para Authentication > Users
-- 2. Clique em "Add User"
-- 3. Crie os seguintes usuários:
--    - Email: admin1@barberpro.com, Senha: admin123
--    - Email: admin2@barberpro.com, Senha: admin123
--    - Email: admin3@barberpro.com, Senha: admin123

-- Depois, copie os IDs dos usuários criados e substitua nos comandos abaixo:

-- Admin 1 - Barbearia Central
INSERT INTO public.users (id, name, email, phone, role) VALUES
(
  'SUBSTITUA_PELO_ID_DO_ADMIN1', -- Substitua pelo ID real do usuário admin1@barberpro.com
  'João Silva',
  'admin1@barberpro.com',
  '(11) 99999-0001',
  'admin'
);

-- Admin 2 - Corte & Estilo
INSERT INTO public.users (id, name, email, phone, role) VALUES
(
  'SUBSTITUA_PELO_ID_DO_ADMIN2', -- Substitua pelo ID real do usuário admin2@barberpro.com
  'Maria Santos',
  'admin2@barberpro.com',
  '(11) 99999-0002',
  'admin'
);

-- Admin 3 - Barbearia do João
INSERT INTO public.users (id, name, email, phone, role) VALUES
(
  'SUBSTITUA_PELO_ID_DO_ADMIN3', -- Substitua pelo ID real do usuário admin3@barberpro.com
  'Pedro Costa',
  'admin3@barberpro.com',
  '(11) 99999-0003',
  'admin'
);

-- Vincular admins às barbearias existentes
UPDATE public.barbershops 
SET admin_id = 'SUBSTITUA_PELO_ID_DO_ADMIN1'
WHERE name = 'Barbearia Central';

UPDATE public.barbershops 
SET admin_id = 'SUBSTITUA_PELO_ID_DO_ADMIN2'
WHERE name = 'Corte & Estilo';

UPDATE public.barbershops 
SET admin_id = 'SUBSTITUA_PELO_ID_DO_ADMIN3'
WHERE name = 'Barbearia do João';

-- Verificar se os usuários foram criados
SELECT id, name, email, role FROM public.users WHERE role = 'admin'; 