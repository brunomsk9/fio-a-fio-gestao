# Teste da funcionalidade de edicao na pagina de detalhes da barbearia
Write-Host "=== Teste da Funcionalidade de Edicao - Detalhes da Barbearia ===" -ForegroundColor Cyan

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

# Abrir o navegador na pagina de barbearias
Write-Host "`n2. Abrindo pagina de barbearias..." -ForegroundColor Yellow
Start-Process "http://localhost:5173/barbershops"

Write-Host "`n=== Instrucoes de Teste ===" -ForegroundColor Cyan
Write-Host "1. Faca login como super-admin" -ForegroundColor White
Write-Host "2. Navegue ate a pagina de Barbearias" -ForegroundColor White
Write-Host "3. Clique em uma barbearia para ver os detalhes" -ForegroundColor White
Write-Host "4. Teste os botoes de editar:" -ForegroundColor White

Write-Host "`n=== Funcionalidades a Testar ===" -ForegroundColor Cyan
Write-Host "Botao 'Editar Barbearia' no header" -ForegroundColor Green
Write-Host "Botao 'Editar' no card de informacoes" -ForegroundColor Green
Write-Host "Abertura do formulario de edicao" -ForegroundColor Green
Write-Host "Preenchimento dos dados existentes" -ForegroundColor Green
Write-Host "Funcionalidade de busca por CEP na edicao" -ForegroundColor Green
Write-Host "Salvamento das alteracoes" -ForegroundColor Green

Write-Host "`n=== Cenarios de Teste ===" -ForegroundColor Cyan
Write-Host "1. Teste o botao no header da pagina" -ForegroundColor White
Write-Host "2. Teste o botao no card de informacoes" -ForegroundColor White
Write-Host "3. Verifique se o formulario abre com os dados corretos" -ForegroundColor White
Write-Host "4. Teste a edicao do nome da barbearia" -ForegroundColor White
Write-Host "5. Teste a edicao do endereco usando CEP" -ForegroundColor White
Write-Host "6. Teste a edicao do telefone" -ForegroundColor White
Write-Host "7. Salve as alteracoes e verifique se foram aplicadas" -ForegroundColor White

Write-Host "`n=== Verificacoes Importantes ===" -ForegroundColor Cyan
Write-Host "Os botoes devem aparecer apenas para super-admin" -ForegroundColor White
Write-Host "O formulario deve abrir com os dados atuais" -ForegroundColor White
Write-Host "A funcionalidade de CEP deve funcionar na edicao" -ForegroundColor White
Write-Host "As alteracoes devem ser salvas corretamente" -ForegroundColor White
Write-Host "A pagina deve ser atualizada apos salvar" -ForegroundColor White

Write-Host "`n=== Diferencas entre Criacao e Edicao ===" -ForegroundColor Cyan
Write-Host "Na edicao, os campos devem vir preenchidos" -ForegroundColor White
Write-Host "O titulo do formulario deve ser 'Editar Barbearia'" -ForegroundColor White
Write-Host "O botao deve ser 'Atualizar' em vez de 'Criar'" -ForegroundColor White
Write-Host "Os dados devem ser atualizados no banco" -ForegroundColor White

Write-Host "`n=== Teste de Permissoes ===" -ForegroundColor Cyan
Write-Host "1. Teste como super-admin (deve ver os botoes)" -ForegroundColor White
Write-Host "2. Teste como admin (nao deve ver os botoes)" -ForegroundColor White
Write-Host "3. Teste como barbeiro (nao deve ver os botoes)" -ForegroundColor White

Write-Host "`nPressione qualquer tecla para continuar..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") 