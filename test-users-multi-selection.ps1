# Teste da funcionalidade de selecao multipla de barbearias na pagina de usuarios
Write-Host "=== Teste da Funcionalidade de Selecao Multipla de Barbearias - Usuarios ===" -ForegroundColor Cyan

# Verificar se o servidor esta rodando
Write-Host "`n1. Verificando se o servidor esta rodando..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5173" -TimeoutSec 5 -UseBasicParsing
    Write-Host "Servidor esta rodando" -ForegroundColor Green
} catch {
    Write-Host "Servidor nao esta rodando. Iniciando..." -ForegroundColor Red
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev"
    Start-Sleep 10
}

# Abrir o navegador na pagina de usuarios
Write-Host "`n2. Abrindo pagina de usuarios..." -ForegroundColor Yellow
Start-Process "http://localhost:5173/users"

Write-Host "`n=== Instrucoes de Teste ===" -ForegroundColor Cyan
Write-Host "1. Faca login como super-admin" -ForegroundColor White
Write-Host "2. Navegue ate a pagina de Usuarios" -ForegroundColor White
Write-Host "3. Clique em 'Adicionar Usuario'" -ForegroundColor White
Write-Host "4. Teste a criacao de diferentes tipos de usuarios:" -ForegroundColor White
Write-Host "   - Admin com multiplas barbearias" -ForegroundColor White
Write-Host "   - Barbeiro com multiplas barbearias" -ForegroundColor White
Write-Host "   - Cliente (sem barbearias)" -ForegroundColor White
Write-Host "5. Teste a edicao de usuarios existentes" -ForegroundColor White
Write-Host "6. Verifique se as barbearias sao exibidas corretamente nos cards" -ForegroundColor White

Write-Host "`n=== Funcionalidades a Testar ===" -ForegroundColor Cyan
Write-Host "Selecao multipla com checkboxes" -ForegroundColor Green
Write-Host "Badges para barbearias selecionadas" -ForegroundColor Green
Write-Host "Botao X para remover barbearias" -ForegroundColor Green
Write-Host "Lista scrollavel de barbearias disponiveis" -ForegroundColor Green
Write-Host "Exibicao de multiplas barbearias nos cards" -ForegroundColor Green
Write-Host "Vinculacao automatica ao criar usuario" -ForegroundColor Green
Write-Host "Carregamento de barbearias ao editar" -ForegroundColor Green

Write-Host "`n=== Verificacoes Importantes ===" -ForegroundColor Cyan
Write-Host "Admin deve aparecer como responsavel pelas barbearias selecionadas" -ForegroundColor White
Write-Host "Barbeiro deve aparecer na lista de barbeiros das barbearias selecionadas" -ForegroundColor White
Write-Host "Cliente nao deve ter opcao de selecionar barbearias" -ForegroundColor White
Write-Host "Super-admin nao deve ter opcao de selecionar barbearias" -ForegroundColor White

Write-Host "`nPressione qualquer tecla para continuar..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") 