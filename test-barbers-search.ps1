# Teste da funcionalidade de busca de barbearias na pagina de barbeiros
Write-Host "=== Teste da Funcionalidade de Busca de Barbearias - Barbeiros ===" -ForegroundColor Cyan

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

# Abrir o navegador na pagina de barbeiros
Write-Host "`n2. Abrindo pagina de barbeiros..." -ForegroundColor Yellow
Start-Process "http://localhost:5173/barbers"

Write-Host "`n=== Instrucoes de Teste ===" -ForegroundColor Cyan
Write-Host "1. Faca login como super-admin ou admin" -ForegroundColor White
Write-Host "2. Navegue ate a pagina de Barbeiros" -ForegroundColor White
Write-Host "3. Clique em 'Novo Barbeiro'" -ForegroundColor White
Write-Host "4. Teste a funcionalidade de busca de barbearias:" -ForegroundColor White

Write-Host "`n=== Funcionalidades de Busca a Testar ===" -ForegroundColor Cyan
Write-Host "Campo de busca com icone de lupa" -ForegroundColor Green
Write-Host "Busca por nome da barbearia" -ForegroundColor Green
Write-Host "Busca por endereco da barbearia" -ForegroundColor Green
Write-Host "Botao X para limpar busca" -ForegroundColor Green
Write-Host "Botao 'Selecionar Todas' para barbearias filtradas" -ForegroundColor Green
Write-Host "Botao 'Desmarcar Todas' para barbearias filtradas" -ForegroundColor Green
Write-Host "Contador de resultados da busca" -ForegroundColor Green
Write-Host "Indicador visual para barbearias selecionadas" -ForegroundColor Green
Write-Host "Mensagem quando nenhuma barbearia e encontrada" -ForegroundColor Green

Write-Host "`n=== Cenarios de Teste ===" -ForegroundColor Cyan
Write-Host "1. Digite o nome de uma barbearia existente" -ForegroundColor White
Write-Host "2. Digite parte do nome de uma barbearia" -ForegroundColor White
Write-Host "3. Digite o endereco de uma barbearia" -ForegroundColor White
Write-Host "4. Digite um termo que nao existe" -ForegroundColor White
Write-Host "5. Use o botao X para limpar a busca" -ForegroundColor White
Write-Host "6. Selecione algumas barbearias e use 'Selecionar Todas'" -ForegroundColor White
Write-Host "7. Selecione algumas barbearias e use 'Desmarcar Todas'" -ForegroundColor White
Write-Host "8. Teste a edicao de um barbeiro existente" -ForegroundColor White

Write-Host "`n=== Verificacoes Importantes ===" -ForegroundColor Cyan
Write-Host "A busca deve ser case-insensitive" -ForegroundColor White
Write-Host "A busca deve funcionar em tempo real" -ForegroundColor White
Write-Host "Barbearias selecionadas devem ter destaque visual" -ForegroundColor White
Write-Host "O contador deve mostrar resultados corretos" -ForegroundColor White
Write-Host "A busca deve ser limpa ao fechar o formulario" -ForegroundColor White
Write-Host "A busca deve ser limpa ao enviar o formulario" -ForegroundColor White

Write-Host "`n=== Diferencas da Pagina de Usuarios ===" -ForegroundColor Cyan
Write-Host "Barbeiros tem campo de especialidades" -ForegroundColor White
Write-Host "Barbeiros sao sempre vinculados a barbearias" -ForegroundColor White
Write-Host "Admin ve apenas suas barbearias" -ForegroundColor White
Write-Host "Super-admin ve todas as barbearias" -ForegroundColor White

Write-Host "`nPressione qualquer tecla para continuar..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") 