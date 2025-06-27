Write-Host "=== Iniciando Servidor de Desenvolvimento ===" -ForegroundColor Cyan
Write-Host ""

# Defina o caminho do arquivo de configuração do OpenSSL
$env:OPENSSL_CONF = "C:\Program Files\OpenSSL-Win64\bin\openssl.cfg"


Write-Host "Iniciando servidor..." -ForegroundColor Yellow
$env:OPENSSL_CONF="C:\Program Files\OpenSSL-Win64\bin\openssl.cfg"; npm run dev 