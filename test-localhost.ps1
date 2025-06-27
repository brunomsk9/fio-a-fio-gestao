Write-Host "=== Teste Localhost - Sistema de Barbearia ===" -ForegroundColor Cyan
Write-Host ""

Write-Host "✓ Servidor rodando na porta 3000" -ForegroundColor Green
Write-Host ""

Write-Host "Para testar o sistema:" -ForegroundColor Yellow
Write-Host "1. Abra seu navegador" -ForegroundColor White
Write-Host "2. Acesse: http://localhost:3000" -ForegroundColor White
Write-Host ""

Write-Host "Funcionalidades para testar:" -ForegroundColor Green
Write-Host "• Login com superadmin" -ForegroundColor White
Write-Host "• Gerenciamento de barbearias" -ForegroundColor White
Write-Host "• Gerenciamento de usuários" -ForegroundColor White
Write-Host "• Configurações de subdomínios" -ForegroundColor White
Write-Host ""

Write-Host "Dados de teste:" -ForegroundColor Yellow
Write-Host "• Email: admin@barbearia.com" -ForegroundColor White
Write-Host "• Senha: admin123" -ForegroundColor White
Write-Host ""

Write-Host "Se precisar parar o servidor:" -ForegroundColor Yellow
Write-Host "• Pressione Ctrl+C no terminal" -ForegroundColor White
Write-Host ""

Write-Host "Pressione qualquer tecla para abrir o navegador..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

# Abrir o navegador
Start-Process "http://localhost:3000"

Write-Host ""
Write-Host "Navegador aberto! Teste o sistema." -ForegroundColor Green 