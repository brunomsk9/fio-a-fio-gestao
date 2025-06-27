-- Script para verificar se a configuração de subdomínios foi aplicada corretamente
-- Execute este script no SQL Editor do Supabase para verificar o status

-- 1. Verificar se as colunas foram adicionadas à tabela barbershops
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'barbershops' 
AND column_name IN ('subdomain', 'custom_domain', 'domain_enabled')
ORDER BY column_name;

-- 2. Verificar se a tabela domain_settings foi criada
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_name = 'domain_settings';

-- 3. Verificar estrutura da tabela domain_settings
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'domain_settings'
ORDER BY ordinal_position;

-- 4. Verificar se as funções foram criadas
SELECT 
    routine_name,
    routine_type
FROM information_schema.routines 
WHERE routine_name IN ('generate_subdomain', 'validate_subdomain')
ORDER BY routine_name;

-- 5. Verificar se os triggers foram criados
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table
FROM information_schema.triggers 
WHERE trigger_name LIKE '%subdomain%'
ORDER BY trigger_name;

-- 6. Verificar políticas RLS
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename IN ('barbershops', 'domain_settings')
ORDER BY tablename, policyname;

-- 7. Testar inserção de dados (opcional - remova os comentários para testar)
/*
-- Teste de inserção na tabela domain_settings
INSERT INTO domain_settings (barbershop_id, subdomain, custom_domain, ssl_enabled, dns_configured, status)
VALUES (1, 'teste', 'teste.com', true, false, 'pending')
ON CONFLICT (barbershop_id) DO UPDATE SET
    subdomain = EXCLUDED.subdomain,
    custom_domain = EXCLUDED.custom_domain,
    ssl_enabled = EXCLUDED.ssl_enabled,
    dns_configured = EXCLUDED.dns_configured,
    status = EXCLUDED.status;

-- Verificar se foi inserido
SELECT * FROM domain_settings WHERE barbershop_id = 1;

-- Limpar teste
DELETE FROM domain_settings WHERE barbershop_id = 1;
*/ 