-- Adicionar coluna de subdomínio na tabela barbershops
ALTER TABLE public.barbershops 
ADD COLUMN subdomain TEXT UNIQUE,
ADD COLUMN custom_domain TEXT UNIQUE,
ADD COLUMN domain_enabled BOOLEAN DEFAULT false;

-- Criar tabela para configurações de domínio
CREATE TABLE public.domain_settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  barbershop_id UUID REFERENCES public.barbershops(id) ON DELETE CASCADE,
  subdomain TEXT UNIQUE,
  custom_domain TEXT UNIQUE,
  ssl_enabled BOOLEAN DEFAULT false,
  dns_configured BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'error')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para melhor performance
CREATE INDEX idx_barbershops_subdomain ON public.barbershops(subdomain);
CREATE INDEX idx_barbershops_custom_domain ON public.barbershops(custom_domain);
CREATE INDEX idx_domain_settings_barbershop_id ON public.domain_settings(barbershop_id);
CREATE INDEX idx_domain_settings_status ON public.domain_settings(status);

-- Habilitar RLS na nova tabela
ALTER TABLE public.domain_settings ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para domain_settings
CREATE POLICY "Anyone can view domain settings" ON public.domain_settings
  FOR SELECT TO public USING (true);

CREATE POLICY "Super admins can manage all domain settings" ON public.domain_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'super-admin'
    )
  );

CREATE POLICY "Admins can manage their barbershop domain settings" ON public.domain_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND role = 'admin' 
      AND barbershop_id = domain_settings.barbershop_id
    )
  );

-- Trigger para atualizar updated_at
CREATE TRIGGER update_domain_settings_updated_at 
  BEFORE UPDATE ON public.domain_settings 
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Função para gerar subdomínio único
CREATE OR REPLACE FUNCTION generate_unique_subdomain(barbershop_name TEXT)
RETURNS TEXT AS $$
DECLARE
  base_subdomain TEXT;
  final_subdomain TEXT;
  counter INTEGER := 0;
BEGIN
  -- Normalizar o nome da barbearia para subdomínio
  base_subdomain := LOWER(REGEXP_REPLACE(barbershop_name, '[^a-zA-Z0-9]', '', 'g'));
  
  -- Se o nome normalizado estiver vazio, usar um padrão
  IF base_subdomain = '' THEN
    base_subdomain := 'barbearia';
  END IF;
  
  -- Verificar se o subdomínio já existe
  final_subdomain := base_subdomain;
  
  WHILE EXISTS (
    SELECT 1 FROM public.barbershops 
    WHERE subdomain = final_subdomain
  ) LOOP
    counter := counter + 1;
    final_subdomain := base_subdomain || counter::TEXT;
  END LOOP;
  
  RETURN final_subdomain;
END;
$$ LANGUAGE plpgsql;

-- Função para validar subdomínio
CREATE OR REPLACE FUNCTION validate_subdomain(subdomain TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  -- Verificar se o subdomínio é válido
  -- Deve ter entre 3 e 63 caracteres
  -- Deve conter apenas letras, números e hífens
  -- Não pode começar ou terminar com hífen
  -- Não pode ter hífens consecutivos
  RETURN subdomain ~ '^[a-z0-9]([a-z0-9-]*[a-z0-9])?$' 
         AND LENGTH(subdomain) BETWEEN 3 AND 63
         AND subdomain !~ '--';
END;
$$ LANGUAGE plpgsql;

-- Função para validar domínio customizado
CREATE OR REPLACE FUNCTION validate_custom_domain(domain TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  -- Verificar se o domínio é válido
  -- Deve ter pelo menos um ponto
  -- Deve conter apenas letras, números, hífens e pontos
  -- Não pode começar ou terminar com hífen
  RETURN domain ~ '^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?)+$'
         AND LENGTH(domain) BETWEEN 4 AND 253;
END;
$$ LANGUAGE plpgsql;

-- Trigger para gerar subdomínio automaticamente quando uma barbearia é criada
CREATE OR REPLACE FUNCTION auto_generate_subdomain()
RETURNS TRIGGER AS $$
BEGIN
  -- Se não foi fornecido um subdomínio, gerar automaticamente
  IF NEW.subdomain IS NULL OR NEW.subdomain = '' THEN
    NEW.subdomain := generate_unique_subdomain(NEW.name);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auto_generate_subdomain
  BEFORE INSERT ON public.barbershops
  FOR EACH ROW
  EXECUTE FUNCTION auto_generate_subdomain();

-- Inserir configurações de domínio para barbearias existentes
INSERT INTO public.domain_settings (barbershop_id, subdomain, status)
SELECT 
  id,
  COALESCE(subdomain, generate_unique_subdomain(name)),
  'active'
FROM public.barbershops
WHERE subdomain IS NOT NULL OR name IS NOT NULL;

-- Atualizar barbearias existentes com subdomínios gerados
UPDATE public.barbershops 
SET subdomain = generate_unique_subdomain(name)
WHERE subdomain IS NULL; 