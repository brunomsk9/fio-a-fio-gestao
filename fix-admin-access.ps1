# Script para corrigir acesso do admin
Write-Host "=== Correção do Acesso do Admin ===" -ForegroundColor Green
Write-Host ""

Write-Host "Problemas identificados:" -ForegroundColor Yellow
Write-Host "1. Menu mostrando barbearias erradas" -ForegroundColor Red
Write-Host "2. Erro 400 na API de agendamentos" -ForegroundColor Red
Write-Host "3. Políticas RLS podem estar conflitantes" -ForegroundColor Red
Write-Host ""

Write-Host "Correções aplicadas:" -ForegroundColor Green
Write-Host "✅ Menu separado para 'Minhas Barbearias' (admin)" -ForegroundColor Cyan
Write-Host "✅ Query do Dashboard corrigida" -ForegroundColor Cyan
Write-Host "✅ Script SQL para corrigir políticas RLS" -ForegroundColor Cyan
Write-Host ""

Write-Host "Próximos passos:" -ForegroundColor Yellow
Write-Host "1. Execute o script SQL no Supabase:" -ForegroundColor Cyan
Write-Host "   - Vá para SQL Editor" -ForegroundColor White
Write-Host "   - Execute: fix-admin-policies.sql" -ForegroundColor White
Write-Host ""

Write-Host "2. Verifique se o admin está vinculado às barbearias:" -ForegroundColor Cyan
Write-Host "   - Execute: test-admin-setup.sql" -ForegroundColor White
Write-Host "   - Substitua o ID pelo ID real do admin" -ForegroundColor White
Write-Host ""

Write-Host "3. Teste o sistema:" -ForegroundColor Cyan
Write-Host "   - Faça login como admin" -ForegroundColor White
Write-Host "   - Verifique se aparece 'Minhas Barbearias'" -ForegroundColor White
Write-Host "   - Clique na seta para expandir" -ForegroundColor White
Write-Host ""

Write-Host "4. Verifique o console do navegador:" -ForegroundColor Cyan
Write-Host "   - Não deve haver mais erro 400" -ForegroundColor White
Write-Host "   - Deve mostrar apenas as barbearias do admin" -ForegroundColor White
Write-Host ""

Write-Host "Se ainda houver problemas:" -ForegroundColor Red
Write-Host "1. Verifique se o usuário tem role = 'admin'" -ForegroundColor Cyan
Write-Host "2. Verifique se há barbearias com admin_id correto" -ForegroundColor Cyan
Write-Host "3. Verifique se as políticas RLS foram aplicadas" -ForegroundColor Cyan
Write-Host ""

Write-Host "Pressione qualquer tecla para continuar..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") 