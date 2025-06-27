Write-Host "=== Configuração Rápida de Subdomínios ===" -ForegroundColor Cyan
Write-Host ""

Write-Host "Este script irá abrir o arquivo SQL para você copiar e executar no Supabase." -ForegroundColor Yellow
Write-Host ""

Write-Host "Instruções:" -ForegroundColor Green
Write-Host "1. O arquivo add-subdomain-fields.sql será aberto" -ForegroundColor White
Write-Host "2. Copie todo o conteúdo" -ForegroundColor White
Write-Host "3. Acesse https://supabase.com" -ForegroundColor White
Write-Host "4. Vá para SQL Editor" -ForegroundColor White
Write-Host "5. Cole e execute o script" -ForegroundColor White
Write-Host ""

Write-Host "Pressione qualquer tecla para abrir o arquivo..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

if (Test-Path "add-subdomain-fields.sql") {
    Start-Process "add-subdomain-fields.sql"
    Write-Host ""
    Write-Host "Arquivo aberto! Execute o script no Supabase e depois teste o salvamento." -ForegroundColor Green
} else {
    Write-Host "Erro: Arquivo add-subdomain-fields.sql não encontrado!" -ForegroundColor Red
} 