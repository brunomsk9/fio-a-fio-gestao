-- Script simples para adicionar campos de subdomínio
-- Execute este script no SQL Editor do Supabase

-- 1. Adicionar colunas na tabela barbershops (se não existirem)
DO $$ 
BEGIN
    -- Adicionar coluna subdomain se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'barbershops' AND column_name = 'subdomain') THEN
        ALTER TABLE public.barbershops ADD COLUMN subdomain TEXT;
    END IF;
    
    -- Adicionar coluna custom_domain se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'barbershops' AND column_name = 'custom_domain') THEN
        ALTER TABLE public.barbershops ADD COLUMN custom_domain TEXT;
    END IF;
    
    -- Adicionar coluna domain_enabled se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'barbershops' AND column_name = 'domain_enabled') THEN
        ALTER TABLE public.barbershops ADD COLUMN domain_enabled BOOLEAN DEFAULT false;
    END IF;
END $$;

-- 2. Criar tabela domain_settings se não existir
CREATE TABLE IF NOT EXISTS public.domain_settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  barbershop_id UUID REFERENCES public.barbershops(id) ON DELETE CASCADE,
  subdomain TEXT,
  custom_domain TEXT,
  ssl_enabled BOOLEAN DEFAULT false,
  dns_configured BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'error')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Criar índices se não existirem
CREATE INDEX IF NOT EXISTS idx_barbershops_subdomain ON public.barbershops(subdomain);
CREATE INDEX IF NOT EXISTS idx_barbershops_custom_domain ON public.barbershops(custom_domain);
CREATE INDEX IF NOT EXISTS idx_domain_settings_barbershop_id ON public.domain_settings(barbershop_id);

-- 4. Habilitar RLS na tabela domain_settings
ALTER TABLE public.domain_settings ENABLE ROW LEVEL SECURITY;

-- 5. Criar políticas RLS básicas
DROP POLICY IF EXISTS "Anyone can view domain settings" ON public.domain_settings;
CREATE POLICY "Anyone can view domain settings" ON public.domain_settings
  FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Super admins can manage all domain settings" ON public.domain_settings;
CREATE POLICY "Super admins can manage all domain settings" ON public.domain_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'super-admin'
    )
  );

DROP POLICY IF EXISTS "Admins can manage their barbershop domain settings" ON public.domain_settings;
CREATE POLICY "Admins can manage their barbershop domain settings" ON public.domain_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND role = 'admin' 
      AND barbershop_id = domain_settings.barbershop_id
    )
  );

-- 6. Verificar se as colunas foram adicionadas
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'barbershops' 
AND column_name IN ('subdomain', 'custom_domain', 'domain_enabled')
ORDER BY column_name;

-- 7. Verificar se a tabela domain_settings foi criada
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_name = 'domain_settings'; 