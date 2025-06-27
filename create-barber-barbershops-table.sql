-- Script para criar tabela de relacionamento entre barbeiros e barbearias
-- Execute este script no Supabase SQL Editor

-- Criar tabela de relacionamento barbeiro-barbearia
CREATE TABLE IF NOT EXISTS barber_barbershops (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    barber_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    barbershop_id UUID NOT NULL REFERENCES barbershops(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Garantir que um barbeiro não seja vinculado à mesma barbearia mais de uma vez
    UNIQUE(barber_id, barbershop_id)
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_barber_barbershops_barber_id ON barber_barbershops(barber_id);
CREATE INDEX IF NOT EXISTS idx_barber_barbershops_barbershop_id ON barber_barbershops(barbershop_id);
CREATE INDEX IF NOT EXISTS idx_barber_barbershops_created_at ON barber_barbershops(created_at);

-- Habilitar RLS (Row Level Security)
ALTER TABLE barber_barbershops ENABLE ROW LEVEL SECURITY;

-- Política para super-admin: pode ver todos os relacionamentos
CREATE POLICY "Super admin can view all barber-barbershop relationships" ON barber_barbershops
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'super-admin'
        )
    );

-- Política para super-admin: pode inserir relacionamentos
CREATE POLICY "Super admin can insert barber-barbershop relationships" ON barber_barbershops
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'super-admin'
        )
    );

-- Política para super-admin: pode deletar relacionamentos
CREATE POLICY "Super admin can delete barber-barbershop relationships" ON barber_barbershops
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'super-admin'
        )
    );

-- Política para admin: pode ver relacionamentos da sua barbearia
CREATE POLICY "Admin can view barber-barbershop relationships for their barbershop" ON barber_barbershops
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM barbershops 
            WHERE barbershops.id = barber_barbershops.barbershop_id 
            AND barbershops.admin_id = auth.uid()
        )
    );

-- Política para barbeiro: pode ver seus próprios relacionamentos
CREATE POLICY "Barber can view their own barber-barbershop relationships" ON barber_barbershops
    FOR SELECT USING (
        barber_id = auth.uid()
    );

-- Função para atualizar o timestamp
CREATE OR REPLACE FUNCTION update_barber_barbershops_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar o timestamp automaticamente
CREATE TRIGGER update_barber_barbershops_updated_at
    BEFORE UPDATE ON barber_barbershops
    FOR EACH ROW
    EXECUTE FUNCTION update_barber_barbershops_updated_at();

-- Comentários para documentação
COMMENT ON TABLE barber_barbershops IS 'Tabela de relacionamento entre barbeiros e barbearias';
COMMENT ON COLUMN barber_barbershops.barber_id IS 'ID do barbeiro (referência à tabela users)';
COMMENT ON COLUMN barber_barbershops.barbershop_id IS 'ID da barbearia (referência à tabela barbershops)';
COMMENT ON COLUMN barber_barbershops.created_at IS 'Data de criação do relacionamento';
COMMENT ON COLUMN barber_barbershops.updated_at IS 'Data da última atualização do relacionamento';

-- Verificar se a tabela foi criada corretamente
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'barber_barbershops'
ORDER BY ordinal_position; 