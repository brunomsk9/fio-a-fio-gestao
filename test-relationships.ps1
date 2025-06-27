# Script para testar relacionamentos 1:N e N:N
Write-Host "=== Teste de Relacionamentos ===" -ForegroundColor Green
Write-Host ""

Write-Host "Regras de Negócio:" -ForegroundColor Yellow
Write-Host "1. 1 Admin pode ser responsável por N Barbearias" -ForegroundColor Cyan
Write-Host "2. 1 Barbeiro pode trabalhar em N Barbearias" -ForegroundColor Cyan
Write-Host "3. 1 Barbearia pode ter N Barbeiros" -ForegroundColor Cyan
Write-Host ""

Write-Host "Estrutura de Relacionamentos:" -ForegroundColor Yellow
Write-Host "✅ users.admin_id → barbershops.admin_id (1:N)" -ForegroundColor Green
Write-Host "✅ barber_barbershops (N:N entre barbeiros e barbearias)" -ForegroundColor Green
Write-Host "✅ Políticas RLS corrigidas" -ForegroundColor Green
Write-Host ""

Write-Host "Scripts para executar:" -ForegroundColor Yellow
Write-Host "1. fix-relationships.sql - Corrige relacionamentos e políticas" -ForegroundColor Cyan
Write-Host "2. test-admin-setup.sql - Configura admin de teste" -ForegroundColor Cyan
Write-Host ""

Write-Host "Como testar:" -ForegroundColor Yellow
Write-Host "1. Execute fix-relationships.sql no Supabase" -ForegroundColor White
Write-Host "2. Substitua o ID do admin no script" -ForegroundColor White
Write-Host "3. Faça login como admin" -ForegroundColor White
Write-Host "4. Verifique se aparece 'Minhas Barbearias'" -ForegroundColor White
Write-Host "5. Clique na seta para expandir" -ForegroundColor White
Write-Host ""

Write-Host "Verificações no Console:" -ForegroundColor Yellow
Write-Host "✅ 'Buscando barbearias para admin: [ID]'" -ForegroundColor Green
Write-Host "✅ 'Barbearias encontradas: Array(X)'" -ForegroundColor Green
Write-Host "❌ Não deve haver erro 400" -ForegroundColor Red
Write-Host ""

Write-Host "Resultado esperado:" -ForegroundColor Yellow
Write-Host "Admin deve ver apenas as barbearias onde admin_id = seu ID" -ForegroundColor Cyan
Write-Host "Menu deve mostrar 'Minhas Barbearias' com submenu expansível" -ForegroundColor Cyan
Write-Host ""

Write-Host "Se não funcionar:" -ForegroundColor Red
Write-Host "1. Verifique se o usuário tem role = 'admin'" -ForegroundColor Cyan
Write-Host "2. Verifique se há barbearias com admin_id correto" -ForegroundColor Cyan
Write-Host "3. Verifique se as políticas RLS foram aplicadas" -ForegroundColor Cyan
Write-Host "4. Verifique o console do navegador para erros" -ForegroundColor Cyan
Write-Host ""

Write-Host "Pressione qualquer tecla para continuar..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") 