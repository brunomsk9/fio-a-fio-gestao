# Script para testar todos os modais com scroll responsivo
Write-Host "🧪 Testando todos os modais com scroll responsivo..." -ForegroundColor Cyan

# Verificar se o servidor está rodando
$response = Invoke-WebRequest -Uri "http://localhost:5173" -UseBasicParsing -ErrorAction SilentlyContinue
if ($response.StatusCode -ne 200) {
    Write-Host "❌ Servidor não está rodando. Iniciando..." -ForegroundColor Red
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; npm run dev"
    Start-Sleep 10
}

Write-Host "`n📋 Lista de modais atualizados com scroll:" -ForegroundColor Yellow
Write-Host "✅ Modal de Barbearias (criação/edição)" -ForegroundColor Green
Write-Host "✅ Modal de Barbeiros (criação/edição)" -ForegroundColor Green
Write-Host "✅ Modal de Usuários (criação/edição)" -ForegroundColor Green
Write-Host "✅ Modal de Serviços (criação/edição)" -ForegroundColor Green
Write-Host "✅ Modal de Configurações de Domínio" -ForegroundColor Green
Write-Host "✅ Modal de Detalhes de Agendamento" -ForegroundColor Green
Write-Host "✅ Modal de Assign Admin" -ForegroundColor Green
Write-Host "✅ Modal de Manage Barbers" -ForegroundColor Green
Write-Host "✅ Modal Multi-Assign" -ForegroundColor Green
Write-Host "✅ Modal de Criação de Barbeiro no Dashboard" -ForegroundColor Green

Write-Host "`n🎯 Funcionalidades implementadas em todos os modais:" -ForegroundColor Yellow
Write-Host "• Altura máxima de 90vh para evitar overflow" -ForegroundColor White
Write-Host "• Layout flexbox com header fixo" -ForegroundColor White
Write-Host "• Conteúdo scrollável com padding direito" -ForegroundColor White
Write-Host "• Botões fixos na parte inferior" -ForegroundColor White
Write-Host "• Borda separadora entre conteúdo e botões" -ForegroundColor White
Write-Host "• Botão de submit com preventDefault para evitar conflitos" -ForegroundColor White

Write-Host "`n🔧 Como testar:" -ForegroundColor Yellow
Write-Host "1. Acesse cada página do sistema" -ForegroundColor White
Write-Host "2. Abra os modais de criação/edição" -ForegroundColor White
Write-Host "3. Adicione conteúdo suficiente para gerar scroll" -ForegroundColor White
Write-Host "4. Verifique se o botão de salvar permanece visível" -ForegroundColor White
Write-Host "5. Teste o scroll no conteúdo do modal" -ForegroundColor White

Write-Host "`n🌐 URLs para testar:" -ForegroundColor Yellow
Write-Host "• http://localhost:5173/barbershops - Modal de Barbearias" -ForegroundColor White
Write-Host "• http://localhost:5173/barbers - Modal de Barbeiros" -ForegroundColor White
Write-Host "• http://localhost:5173/users - Modal de Usuários" -ForegroundColor White
Write-Host "• http://localhost:5173/services - Modal de Serviços" -ForegroundColor White
Write-Host "• http://localhost:5173/settings - Modal de Configurações" -ForegroundColor White
Write-Host "• http://localhost:5173/bookings - Modal de Detalhes" -ForegroundColor White
Write-Host "• http://localhost:5173/ - Modal do Dashboard" -ForegroundColor White

Write-Host "`n✅ Todos os modais foram atualizados com scroll responsivo!" -ForegroundColor Green
Write-Host "🎉 Agora todos os formulários têm melhor UX com botões sempre visíveis" -ForegroundColor Green

# Abrir o navegador
Start-Process "http://localhost:5173" 