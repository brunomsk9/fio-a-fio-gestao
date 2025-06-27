Write-Host "=== Configuração Simples de Subdomínios ===" -ForegroundColor Cyan
Write-Host ""

Write-Host "Este script remove TODOS os constraints problemáticos:" -ForegroundColor Yellow
Write-Host "• Adiciona colunas sem constraints UNIQUE" -ForegroundColor White
Write-Host "• Recria tabela domain_settings sem constraints" -ForegroundColor White
Write-Host "• Configuração mínima para funcionar" -ForegroundColor White
Write-Host ""

Write-Host "Instruções:" -ForegroundColor Green
Write-Host "1. O arquivo simple-setup.sql será aberto" -ForegroundColor White
Write-Host "2. Copie todo o conteúdo" -ForegroundColor White
Write-Host "3. Acesse https://supabase.com" -ForegroundColor White
Write-Host "4. Vá para SQL Editor" -ForegroundColor White
Write-Host "5. Cole e execute o script" -ForegroundColor White
Write-Host ""

Write-Host "Pressione qualquer tecla para abrir o arquivo..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

if (Test-Path "simple-setup.sql") {
    Start-Process "simple-setup.sql"
    Write-Host ""
    Write-Host "Arquivo aberto! Execute o script no Supabase." -ForegroundColor Green
    Write-Host "Depois teste o salvamento do subdomínio." -ForegroundColor Green
} else {
    Write-Host "Erro: Arquivo simple-setup.sql não encontrado!" -ForegroundColor Red
} 