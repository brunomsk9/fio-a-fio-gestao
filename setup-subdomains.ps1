# Script para configurar subdomínios no Supabase
# Execute este script após configurar o Supabase

Write-Host "🔧 Configurando Subdomínios para Barbearias..." -ForegroundColor Cyan
Write-Host ""

# Verificar se o arquivo SQL existe
$sqlFile = "database/subdomain_setup.sql"
if (-not (Test-Path $sqlFile)) {
    Write-Host "❌ Arquivo $sqlFile não encontrado!" -ForegroundColor Red
    Write-Host "Certifique-se de estar no diretório correto do projeto." -ForegroundColor Yellow
    exit 1
}

Write-Host "📋 Instruções para configurar subdomínios:" -ForegroundColor Green
Write-Host ""

Write-Host "1️⃣ Acesse o painel do Supabase:" -ForegroundColor Yellow
Write-Host "   https://supabase.com/dashboard" -ForegroundColor White
Write-Host ""

Write-Host "2️⃣ Selecione seu projeto" -ForegroundColor Yellow
Write-Host ""

Write-Host "3️⃣ Vá para SQL Editor" -ForegroundColor Yellow
Write-Host ""

Write-Host "4️⃣ Copie e cole o conteúdo do arquivo:" -ForegroundColor Yellow
Write-Host "   $sqlFile" -ForegroundColor White
Write-Host ""

Write-Host "5️⃣ Execute o script SQL" -ForegroundColor Yellow
Write-Host ""

Write-Host "6️⃣ Verifique se as tabelas foram criadas:" -ForegroundColor Yellow
Write-Host "   - domain_settings" -ForegroundColor White
Write-Host "   - Colunas adicionadas em barbershops" -ForegroundColor White
Write-Host ""

Write-Host "✅ Após executar o SQL, a funcionalidade estará disponível em:" -ForegroundColor Green
Write-Host "   Configurações > Gerenciamento de Subdomínios" -ForegroundColor White
Write-Host ""

Write-Host "📖 Para mais informações, consulte:" -ForegroundColor Cyan
Write-Host "   SUBDOMAIN_SETUP.md" -ForegroundColor White
Write-Host ""

Write-Host "🚀 Funcionalidades disponíveis após configuração:" -ForegroundColor Green
Write-Host "   • Subdomínios automáticos para cada barbearia" -ForegroundColor White
Write-Host "   • Domínios customizados" -ForegroundColor White
Write-Host "   • SSL automático" -ForegroundColor White
Write-Host "   • Status de configuração em tempo real" -ForegroundColor White
Write-Host ""

Read-Host "Pressione Enter para continuar..." 