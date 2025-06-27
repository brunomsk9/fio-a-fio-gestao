# Script para testar a funcionalidade de relacionamento barbeiro-barbearia
# Execute este script após configurar a tabela no banco

Write-Host "🧪 Testando funcionalidade de relacionamento barbeiro-barbearia..." -ForegroundColor Blue

# Verificar se o servidor está rodando
Write-Host "📡 Verificando se o servidor está rodando..." -ForegroundColor Yellow

try {
    $response = Invoke-WebRequest -Uri "http://localhost:8080" -TimeoutSec 5 -UseBasicParsing
    Write-Host "✅ Servidor está rodando na porta 8080" -ForegroundColor Green
} catch {
    Write-Host "❌ Servidor não está rodando na porta 8080" -ForegroundColor Red
    Write-Host "💡 Execute o script start-dev.ps1 primeiro" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "🎯 TESTE DA FUNCIONALIDADE:" -ForegroundColor Cyan
Write-Host "1. Abra o navegador em: http://localhost:8080" -ForegroundColor White
Write-Host "2. Faça login como super-admin" -ForegroundColor White
Write-Host "3. Vá para a página 'Barbearias'" -ForegroundColor White
Write-Host "4. Clique no botão 'Gerenciar' em uma barbearia" -ForegroundColor White
Write-Host "5. Teste vincular e desvincular barbeiros" -ForegroundColor White
Write-Host ""

# Abrir o navegador
$openBrowser = Read-Host "Deseja abrir o navegador automaticamente? (s/n)"
if ($openBrowser -eq "s" -or $openBrowser -eq "S") {
    Write-Host "🌐 Abrindo navegador..." -ForegroundColor Blue
    Start-Process "http://localhost:8080"
}

Write-Host ""
Write-Host "📋 CHECKLIST DE TESTE:" -ForegroundColor Yellow
Write-Host "□ Tabela barber_barbershops foi criada no Supabase" -ForegroundColor White
Write-Host "□ Políticas RLS foram configuradas" -ForegroundColor White
Write-Host "□ Página de barbearias carrega corretamente" -ForegroundColor White
Write-Host "□ Botão 'Gerenciar' aparece nas barbearias" -ForegroundColor White
Write-Host "□ Diálogo de gerenciamento de barbeiros abre" -ForegroundColor White
Write-Host "□ Lista de barbeiros disponíveis é exibida" -ForegroundColor White
Write-Host "□ Vinculação de barbeiro funciona" -ForegroundColor White
Write-Host "□ Remoção de barbeiro funciona" -ForegroundColor White
Write-Host "□ Contadores de barbeiros são atualizados" -ForegroundColor White

Write-Host ""
Write-Host "🔧 SE HOUVER PROBLEMAS:" -ForegroundColor Red
Write-Host "1. Verifique se a tabela barber_barbershops existe no Supabase" -ForegroundColor White
Write-Host "2. Execute o script create-barber-barbershops-table.sql" -ForegroundColor White
Write-Host "3. Verifique as políticas RLS" -ForegroundColor White
Write-Host "4. Confirme que existem usuários com role 'barber'" -ForegroundColor White
Write-Host "5. Verifique o console do navegador para erros" -ForegroundColor White

Write-Host ""
Write-Host "✅ Teste concluído!" -ForegroundColor Green 