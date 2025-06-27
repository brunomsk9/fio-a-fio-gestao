Write-Host "=== Correção de Constraints ===" -ForegroundColor Cyan
Write-Host ""

Write-Host "Este script irá corrigir os problemas de constraint:" -ForegroundColor Yellow
Write-Host "• Remove constraints UNIQUE problemáticos" -ForegroundColor White
Write-Host "• Recria as tabelas sem constraints conflitantes" -ForegroundColor White
Write-Host "• Configura tudo de forma mais segura" -ForegroundColor White
Write-Host ""

Write-Host "Instruções:" -ForegroundColor Green
Write-Host "1. O arquivo fix-constraints.sql será aberto" -ForegroundColor White
Write-Host "2. Copie todo o conteúdo" -ForegroundColor White
Write-Host "3. Acesse https://supabase.com" -ForegroundColor White
Write-Host "4. Vá para SQL Editor" -ForegroundColor White
Write-Host "5. Cole e execute o script" -ForegroundColor White
Write-Host ""

Write-Host "Pressione qualquer tecla para abrir o arquivo..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

if (Test-Path "fix-constraints.sql") {
    Start-Process "fix-constraints.sql"
    Write-Host ""
    Write-Host "Arquivo aberto! Execute o script no Supabase para corrigir os constraints." -ForegroundColor Green
    Write-Host "Depois teste novamente o salvamento do subdomínio." -ForegroundColor Green
} else {
    Write-Host "Erro: Arquivo fix-constraints.sql não encontrado!" -ForegroundColor Red
} 