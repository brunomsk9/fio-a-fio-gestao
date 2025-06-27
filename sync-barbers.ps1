# Script para sincronizar barbeiros existentes
# Execute este script para garantir que todos os barbeiros estejam na tabela correta

Write-Host "Sincronizando barbeiros existentes..." -ForegroundColor Yellow

# Você pode executar este script no Supabase SQL Editor ou usar a função syncExistingBarbers
# que foi criada no adminClient.ts

Write-Host "Para sincronizar, execute no Supabase SQL Editor:" -ForegroundColor Green
Write-Host ""
Write-Host "-- Sincronizar barbeiros existentes" -ForegroundColor Cyan
Write-Host "INSERT INTO barbers (id, name, email, phone)" -ForegroundColor White
Write-Host "SELECT id, name, email, phone" -ForegroundColor White
Write-Host "FROM users" -ForegroundColor White
Write-Host "WHERE role IN ('barber', 'admin')" -ForegroundColor White
Write-Host "ON CONFLICT (id) DO NOTHING;" -ForegroundColor White
Write-Host ""
Write-Host "Ou use a função syncExistingBarbers no código." -ForegroundColor Green 