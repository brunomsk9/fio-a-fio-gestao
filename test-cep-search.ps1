# Teste da funcionalidade de busca de endereco por CEP
Write-Host "=== Teste da Funcionalidade de Busca por CEP ===" -ForegroundColor Cyan

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
Write-Host "3. Clique em 'Nova Barbearia'" -ForegroundColor White
Write-Host "4. Teste a funcionalidade de busca por CEP:" -ForegroundColor White

Write-Host "`n=== Funcionalidades de CEP a Testar ===" -ForegroundColor Cyan
Write-Host "Campo de CEP com formato automatico" -ForegroundColor Green
Write-Host "Busca automatica ao digitar 8 digitos" -ForegroundColor Green
Write-Host "Indicador de carregamento (spinner)" -ForegroundColor Green
Write-Host "Preenchimento automatico dos campos" -ForegroundColor Green
Write-Host "Campos editaveis apos preenchimento" -ForegroundColor Green
Write-Host "Endereco completo montado automaticamente" -ForegroundColor Green
Write-Host "Mensagens de sucesso e erro" -ForegroundColor Green

Write-Host "`n=== Cenarios de Teste ===" -ForegroundColor Cyan
Write-Host "1. Digite um CEP valido (ex: 01310-100)" -ForegroundColor White
Write-Host "2. Digite um CEP invalido (ex: 00000-000)" -ForegroundColor White
Write-Host "3. Digite um CEP incompleto (ex: 01310)" -ForegroundColor White
Write-Host "4. Edite os campos apos preenchimento automatico" -ForegroundColor White
Write-Host "5. Teste a edicao de uma barbearia existente" -ForegroundColor White
Write-Host "6. Verifique se os dados sao salvos corretamente" -ForegroundColor White

Write-Host "`n=== CEPs de Teste ===" -ForegroundColor Cyan
Write-Host "CEP Valido - Sao Paulo: 01310-100" -ForegroundColor White
Write-Host "CEP Valido - Rio de Janeiro: 20040-007" -ForegroundColor White
Write-Host "CEP Valido - Belo Horizonte: 30112-000" -ForegroundColor White
Write-Host "CEP Invalido: 00000-000" -ForegroundColor White

Write-Host "`n=== Verificacoes Importantes ===" -ForegroundColor Cyan
Write-Host "A busca deve ser automatica ao digitar 8 digitos" -ForegroundColor White
Write-Host "O spinner deve aparecer durante a busca" -ForegroundColor White
Write-Host "Os campos devem ser preenchidos automaticamente" -ForegroundColor White
Write-Host "O endereco completo deve ser montado" -ForegroundColor White
Write-Host "Os campos devem permanecer editaveis" -ForegroundColor White
Write-Host "Mensagens de sucesso devem aparecer" -ForegroundColor White
Write-Host "Mensagens de erro devem aparecer para CEPs invalidos" -ForegroundColor White

Write-Host "`n=== Campos do Formulario ===" -ForegroundColor Cyan
Write-Host "CEP (busca automatica)" -ForegroundColor White
Write-Host "Logradouro (preenchido automaticamente)" -ForegroundColor White
Write-Host "Complemento (preenchido automaticamente)" -ForegroundColor White
Write-Host "Bairro (preenchido automaticamente)" -ForegroundColor White
Write-Host "Cidade (preenchido automaticamente)" -ForegroundColor White
Write-Host "Estado (preenchido automaticamente)" -ForegroundColor White
Write-Host "Endereco Completo (montado automaticamente)" -ForegroundColor White

Write-Host "`nPressione qualquer tecla para continuar..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") 