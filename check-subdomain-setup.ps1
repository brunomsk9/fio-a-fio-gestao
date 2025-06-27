# Script para verificar a configuração de subdomínios
# Execute este script para verificar se tudo foi configurado corretamente

Write-Host "=== Verificação da Configuração de Subdomínios ===" -ForegroundColor Cyan
Write-Host ""

Write-Host "1. Verificando se o arquivo de configuração existe..." -ForegroundColor Yellow
if (Test-Path "database/subdomain_setup.sql") {
    Write-Host "✓ Arquivo subdomain_setup.sql encontrado" -ForegroundColor Green
} else {
    Write-Host "✗ Arquivo subdomain_setup.sql não encontrado" -ForegroundColor Red
    Write-Host "   Execute primeiro o script setup-subdomains.ps1" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "2. Verificando se o arquivo de verificação existe..." -ForegroundColor Yellow
if (Test-Path "check-subdomain-setup.sql") {
    Write-Host "✓ Arquivo check-subdomain-setup.sql encontrado" -ForegroundColor Green
} else {
    Write-Host "✗ Arquivo check-subdomain-setup.sql não encontrado" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "3. Instruções para verificar no Supabase:" -ForegroundColor Cyan
Write-Host ""
Write-Host "   a) Acesse o painel do Supabase (https://supabase.com)" -ForegroundColor White
Write-Host "   b) Vá para o seu projeto" -ForegroundColor White
Write-Host "   c) Clique em 'SQL Editor' no menu lateral" -ForegroundColor White
Write-Host "   d) Copie e cole o conteúdo do arquivo 'check-subdomain-setup.sql'" -ForegroundColor White
Write-Host "   e) Execute o script" -ForegroundColor White
Write-Host ""

Write-Host "4. O que verificar nos resultados:" -ForegroundColor Cyan
Write-Host ""
Write-Host "   ✓ Colunas na tabela barbershops:" -ForegroundColor Green
Write-Host "     - subdomain (text, nullable)" -ForegroundColor White
Write-Host "     - custom_domain (text, nullable)" -ForegroundColor White
Write-Host "     - domain_enabled (boolean, default false)" -ForegroundColor White
Write-Host ""
Write-Host "   ✓ Tabela domain_settings criada com colunas:" -ForegroundColor Green
Write-Host "     - id (uuid, primary key)" -ForegroundColor White
Write-Host "     - barbershop_id (uuid, foreign key)" -ForegroundColor White
Write-Host "     - subdomain (text, nullable)" -ForegroundColor White
Write-Host "     - custom_domain (text, nullable)" -ForegroundColor White
Write-Host "     - ssl_enabled (boolean, default false)" -ForegroundColor White
Write-Host "     - dns_configured (boolean, default false)" -ForegroundColor White
Write-Host "     - status (text, default 'pending')" -ForegroundColor White
Write-Host "     - created_at (timestamp)" -ForegroundColor White
Write-Host "     - updated_at (timestamp)" -ForegroundColor White
Write-Host ""
Write-Host "   ✓ Funções criadas:" -ForegroundColor Green
Write-Host "     - generate_subdomain" -ForegroundColor White
Write-Host "     - validate_subdomain" -ForegroundColor White
Write-Host ""
Write-Host "   ✓ Triggers criados:" -ForegroundColor Green
Write-Host "     - update_barbershop_subdomain_trigger" -ForegroundColor White
Write-Host "     - update_domain_settings_updated_at_trigger" -ForegroundColor White
Write-Host ""
Write-Host "   ✓ Políticas RLS criadas para ambas as tabelas" -ForegroundColor Green
Write-Host ""

Write-Host "5. Se algo estiver faltando:" -ForegroundColor Cyan
Write-Host "   Execute novamente o script setup-subdomains.ps1" -ForegroundColor Yellow
Write-Host ""

Write-Host "6. Para testar a funcionalidade:" -ForegroundColor Cyan
Write-Host "   a) Descomente as linhas de teste no final do script SQL" -ForegroundColor White
Write-Host "   b) Execute novamente para testar inserção/atualização" -ForegroundColor White
Write-Host ""

Write-Host "Pressione qualquer tecla para abrir o arquivo de verificação..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

# Abrir o arquivo de verificação no editor padrão
if (Get-Command "code" -ErrorAction SilentlyContinue) {
    code check-subdomain-setup.sql
} else {
    Start-Process check-subdomain-setup.sql
}

Write-Host ""
Write-Host "Arquivo aberto! Copie o conteúdo e execute no SQL Editor do Supabase." -ForegroundColor Green 