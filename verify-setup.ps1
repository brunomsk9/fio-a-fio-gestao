Write-Host "=== Verificação da Configuração de Subdomínios ===" -ForegroundColor Cyan
Write-Host ""

# Verificar arquivos
$files = @(
    "database/subdomain_setup.sql",
    "check-subdomain-setup.sql"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "✓ $file encontrado" -ForegroundColor Green
    } else {
        Write-Host "✗ $file não encontrado" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Para verificar no Supabase:" -ForegroundColor Yellow
Write-Host "1. Acesse https://supabase.com" -ForegroundColor White
Write-Host "2. Vá para SQL Editor" -ForegroundColor White
Write-Host "3. Execute o conteúdo de check-subdomain-setup.sql" -ForegroundColor White
Write-Host ""

Write-Host "Se o salvamento não funcionar, verifique:" -ForegroundColor Yellow
Write-Host "1. Se as tabelas foram criadas corretamente" -ForegroundColor White
Write-Host "2. Se as políticas RLS estão ativas" -ForegroundColor White
Write-Host "3. Se você tem permissões de superadmin" -ForegroundColor White
Write-Host ""

Write-Host "Pressione qualquer tecla para abrir o arquivo de verificação..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

if (Test-Path "check-subdomain-setup.sql") {
    Start-Process "check-subdomain-setup.sql"
} 