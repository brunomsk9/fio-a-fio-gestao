# Script para configurar a tabela de relacionamento entre barbeiros e barbearias
# Execute este script para criar a tabela no Supabase

Write-Host "🔧 Configurando tabela de relacionamento barbeiro-barbearia..." -ForegroundColor Blue

# Verificar se o arquivo SQL existe
$sqlFile = "create-barber-barbershops-table.sql"
if (-not (Test-Path $sqlFile)) {
    Write-Host "❌ Arquivo $sqlFile não encontrado!" -ForegroundColor Red
    exit 1
}

Write-Host "📋 Arquivo SQL encontrado: $sqlFile" -ForegroundColor Green

# Mostrar instruções para o usuário
Write-Host ""
Write-Host "📝 INSTRUÇÕES:" -ForegroundColor Yellow
Write-Host "1. Abra o Supabase Dashboard" -ForegroundColor White
Write-Host "2. Vá para SQL Editor" -ForegroundColor White
Write-Host "3. Copie o conteúdo do arquivo $sqlFile" -ForegroundColor White
Write-Host "4. Cole no SQL Editor e execute" -ForegroundColor White
Write-Host ""

# Mostrar o conteúdo do arquivo SQL
Write-Host "📄 Conteúdo do script SQL:" -ForegroundColor Cyan
Write-Host "----------------------------------------" -ForegroundColor Gray
Get-Content $sqlFile | ForEach-Object {
    Write-Host $_ -ForegroundColor White
}
Write-Host "----------------------------------------" -ForegroundColor Gray

Write-Host ""
Write-Host "✅ Script pronto para execução!" -ForegroundColor Green
Write-Host "💡 Após executar o script, você poderá vincular barbeiros às barbearias na interface." -ForegroundColor Blue

# Perguntar se o usuário quer abrir o arquivo
$openFile = Read-Host "Deseja abrir o arquivo SQL no editor padrão? (s/n)"
if ($openFile -eq "s" -or $openFile -eq "S") {
    Start-Process $sqlFile
}

Write-Host ""
Write-Host "🎯 Próximos passos:" -ForegroundColor Yellow
Write-Host "1. Execute o script SQL no Supabase" -ForegroundColor White
Write-Host "2. Teste a funcionalidade na página de Barbearias" -ForegroundColor White
Write-Host "3. Use o botão 'Gerenciar' para vincular barbeiros" -ForegroundColor White 