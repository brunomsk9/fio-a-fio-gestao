-- Corrigir políticas RLS para a tabela users
-- Permitir que super-admin acesse todos os usuários

-- Desabilitar RLS temporariamente para verificar
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Recriar políticas para users
DROP POLICY IF EXISTS "Super admin can manage all users" ON users;
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Admins can view users in their barbershops" ON users;

-- Política para super-admin
CREATE POLICY "Super admin can manage all users" ON users
  FOR ALL USING (auth.jwt() ->> 'role' = 'super-admin');

-- Política para usuários verem seu próprio perfil
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

-- Política para admins verem usuários de suas barbearias
CREATE POLICY "Admins can view users in their barbershops" ON users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM barbershops 
      WHERE admin_id = auth.uid() 
      AND (barbershops.id = users.barbershop_id OR barbershops.id IN (
        SELECT barbershop_id FROM barber_barbershops WHERE barber_id = users.id
      ))
    )
  );

-- Habilitar RLS novamente
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Verificar políticas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'users'; 