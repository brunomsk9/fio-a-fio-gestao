-- Script para corrigir problemas de constraint
-- Execute este script no SQL Editor do Supabase

-- 1. Remover constraints UNIQUE problemáticos (se existirem)
DO $$ 
BEGIN
    -- Remover constraint UNIQUE de subdomain se existir
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
               WHERE table_name = 'barbershops' 
               AND constraint_name LIKE '%subdomain%' 
               AND constraint_type = 'UNIQUE') THEN
        ALTER TABLE public.barbershops DROP CONSTRAINT IF EXISTS barbershops_subdomain_key;
    END IF;
    
    -- Remover constraint UNIQUE de custom_domain se existir
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
               WHERE table_name = 'barbershops' 
               AND constraint_name LIKE '%custom_domain%' 
               AND constraint_type = 'UNIQUE') THEN
        ALTER TABLE public.barbershops DROP CONSTRAINT IF EXISTS barbershops_custom_domain_key;
    END IF;
END $$;

-- 2. Adicionar colunas sem constraints UNIQUE
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

-- 3. Criar tabela domain_settings se não existir (sem constraints UNIQUE)
DROP TABLE IF EXISTS public.domain_settings CASCADE;
CREATE TABLE public.domain_settings (
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

-- 4. Criar índices
CREATE INDEX IF NOT EXISTS idx_barbershops_subdomain ON public.barbershops(subdomain);
CREATE INDEX IF NOT EXISTS idx_barbershops_custom_domain ON public.barbershops(custom_domain);
CREATE INDEX IF NOT EXISTS idx_domain_settings_barbershop_id ON public.domain_settings(barbershop_id);

-- 5. Habilitar RLS
ALTER TABLE public.domain_settings ENABLE ROW LEVEL SECURITY;

-- 6. Criar políticas RLS
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

-- 7. Verificar estrutura
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'barbershops' 
AND column_name IN ('subdomain', 'custom_domain', 'domain_enabled')
ORDER BY column_name;

-- 8. Verificar se a tabela domain_settings foi criada
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_name = 'domain_settings';

-- 9. Teste de inserção (opcional)
-- Descomente as linhas abaixo para testar
/*
INSERT INTO public.domain_settings (barbershop_id, subdomain, status)
VALUES (
    (SELECT id FROM public.barbershops LIMIT 1), 
    'teste', 
    'pending'
) ON CONFLICT (barbershop_id) DO UPDATE SET
    subdomain = EXCLUDED.subdomain,
    status = EXCLUDED.status;

SELECT * FROM public.domain_settings;
*/ 