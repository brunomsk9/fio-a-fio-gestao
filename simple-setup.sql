-- Script muito simples para adicionar campos de subdomínio
-- Execute este script no SQL Editor do Supabase

-- 1. Adicionar colunas na tabela barbershops (sem constraints)
ALTER TABLE public.barbershops 
ADD COLUMN IF NOT EXISTS subdomain TEXT,
ADD COLUMN IF NOT EXISTS custom_domain TEXT,
ADD COLUMN IF NOT EXISTS domain_enabled BOOLEAN DEFAULT false;

-- 2. Criar tabela domain_settings simples (sem constraints UNIQUE)
DROP TABLE IF EXISTS public.domain_settings CASCADE;
CREATE TABLE public.domain_settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  barbershop_id UUID REFERENCES public.barbershops(id) ON DELETE CASCADE,
  subdomain TEXT,
  custom_domain TEXT,
  ssl_enabled BOOLEAN DEFAULT false,
  dns_configured BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Criar índices básicos
CREATE INDEX IF NOT EXISTS idx_barbershops_subdomain ON public.barbershops(subdomain);
CREATE INDEX IF NOT EXISTS idx_domain_settings_barbershop_id ON public.domain_settings(barbershop_id);

-- 4. Habilitar RLS
ALTER TABLE public.domain_settings ENABLE ROW LEVEL SECURITY;

-- 5. Políticas RLS básicas
CREATE POLICY "Anyone can view domain settings" ON public.domain_settings
  FOR SELECT TO public USING (true);

CREATE POLICY "Super admins can manage all domain settings" ON public.domain_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'super-admin'
    )
  );

-- 6. Verificar se funcionou
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'barbershops' 
AND column_name IN ('subdomain', 'custom_domain', 'domain_enabled')
ORDER BY column_name;

SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_name = 'domain_settings'; 