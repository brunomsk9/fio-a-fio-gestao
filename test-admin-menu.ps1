# Script para testar o menu de admin
Write-Host "=== Teste do Menu de Admin ===" -ForegroundColor Green
Write-Host ""

Write-Host "1. Verifique se o servidor está rodando:" -ForegroundColor Yellow
Write-Host "   npm run dev" -ForegroundColor Cyan
Write-Host ""

Write-Host "2. Acesse o sistema e faça login como admin" -ForegroundColor Yellow
Write-Host "   http://localhost:5173/login" -ForegroundColor Cyan
Write-Host ""

Write-Host "3. Para criar um admin de teste:" -ForegroundColor Yellow
Write-Host "   - Vá para o Supabase Dashboard" -ForegroundColor Cyan
Write-Host "   - Authentication > Users > Add User" -ForegroundColor Cyan
Write-Host "   - Crie um usuário com email: admin@teste.com" -ForegroundColor Cyan
Write-Host ""

Write-Host "4. Execute o script SQL no Supabase:" -ForegroundColor Yellow
Write-Host "   - Vá para SQL Editor" -ForegroundColor Cyan
Write-Host "   - Execute o arquivo: test-admin-setup.sql" -ForegroundColor Cyan
Write-Host "   - Substitua o ID no script pelo ID do usuário criado" -ForegroundColor Cyan
Write-Host ""

Write-Host "5. Verifique no console do navegador se há logs:" -ForegroundColor Yellow
Write-Host "   - Abra as ferramentas do desenvolvedor (F12)" -ForegroundColor Cyan
Write-Host "   - Vá para a aba Console" -ForegroundColor Cyan
Write-Host "   - Procure por: 'Buscando barbearias para admin:'" -ForegroundColor Cyan
Write-Host ""

Write-Host "6. O menu deve mostrar:" -ForegroundColor Yellow
Write-Host "   - Barbearias (com seta expansível)" -ForegroundColor Cyan
Write-Host "   - Barbeiros" -ForegroundColor Cyan
Write-Host "   - Agendamentos" -ForegroundColor Cyan
Write-Host "   - Relatórios" -ForegroundColor Cyan
Write-Host ""

Write-Host "Se o menu não aparecer, verifique:" -ForegroundColor Red
Write-Host "   - Se o usuário tem role = 'admin'" -ForegroundColor Cyan
Write-Host "   - Se há barbearias com admin_id = ID do usuário" -ForegroundColor Cyan
Write-Host "   - Se as políticas RLS permitem acesso" -ForegroundColor Cyan
Write-Host ""

Write-Host "Pressione qualquer tecla para continuar..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") 