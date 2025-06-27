# Script de Deploy para Digital Ocean - PowerShell
# Uso: .\deploy-digitalocean.ps1 [easypanel|docker|manual]

param(
    [Parameter(Position=0)]
    [ValidateSet("easypanel", "docker", "compose", "manual")]
    [string]$DeployType = "easypanel"
)

# Configurações
$ErrorActionPreference = "Stop"

# Funções de log
function Write-Log {
    param([string]$Message, [string]$Color = "Green")
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Write-Host "[$timestamp] $Message" -ForegroundColor $Color
}

function Write-Error {
    param([string]$Message)
    Write-Log "ERRO: $Message" "Red"
    exit 1
}

function Write-Warning {
    param([string]$Message)
    Write-Log "AVISO: $Message" "Yellow"
}

function Write-Info {
    param([string]$Message)
    Write-Log "INFO: $Message" "Blue"
}

# Verificar se está no diretório correto
if (-not (Test-Path "package.json")) {
    Write-Error "Execute este script no diretório raiz do projeto"
}

# Verificar Node.js
try {
    $nodeVersion = node --version
    Write-Log "Node.js encontrado: $nodeVersion"
    
    # Extrair versão principal
    $majorVersion = [int]($nodeVersion -replace 'v(\d+)\.\d+\.\d+', '$1')
    if ($majorVersion -lt 18) {
        Write-Error "Node.js 18+ é necessário. Versão atual: $nodeVersion"
    }
} catch {
    Write-Error "Node.js não está instalado"
}

# Verificar variáveis de ambiente
$supabaseUrl = $env:VITE_SUPABASE_URL
$supabaseKey = $env:VITE_SUPABASE_ANON_KEY

if (-not $supabaseUrl -or -not $supabaseKey) {
    Write-Warning "Variáveis de ambiente do Supabase não encontradas"
    Write-Info "Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY"
}

# Função para deploy EasyPanel
function Deploy-EasyPanel {
    Write-Log "Iniciando deploy via EasyPanel..."
    
    # Build da aplicação
    Write-Log "Fazendo build da aplicação..."
    try {
        npm run build
        Write-Log "Build concluído com sucesso!"
    } catch {
        Write-Error "Falha no build da aplicação"
    }
    
    # Verificar se o diretório dist foi criado
    if (-not (Test-Path "dist")) {
        Write-Error "Diretório dist não foi criado"
    }
    
    Write-Log "Deploy via EasyPanel concluído!"
    Write-Info "Acesse o painel do EasyPanel para finalizar a configuração"
}

# Função para deploy Docker
function Deploy-Docker {
    Write-Log "Iniciando deploy via Docker..."
    
    # Verificar se Docker está instalado
    try {
        docker --version | Out-Null
        Write-Log "Docker encontrado"
    } catch {
        Write-Error "Docker não está instalado"
    }
    
    # Build da imagem
    Write-Log "Construindo imagem Docker..."
    try {
        docker build -t barbearia-app .
        Write-Log "Imagem Docker construída com sucesso!"
    } catch {
        Write-Error "Falha na construção da imagem Docker"
    }
    
    # Parar container anterior se existir
    $existingContainer = docker ps -a --filter "name=barbearia-app" --format "{{.Names}}"
    if ($existingContainer) {
        Write-Log "Parando container anterior..."
        docker stop barbearia-app 2>$null
        docker rm barbearia-app 2>$null
    }
    
    # Executar novo container
    Write-Log "Executando novo container..."
    try {
        docker run -d `
            --name barbearia-app `
            --restart unless-stopped `
            -p 80:80 `
            -e "VITE_SUPABASE_URL=$supabaseUrl" `
            -e "VITE_SUPABASE_ANON_KEY=$supabaseKey" `
            barbearia-app
        
        Write-Log "Container iniciado com sucesso!"
        Write-Info "Aplicação disponível em: http://localhost"
    } catch {
        Write-Error "Falha ao iniciar container"
    }
}

# Função para deploy manual
function Deploy-Manual {
    Write-Log "Iniciando deploy manual..."
    
    # Instalar dependências
    Write-Log "Instalando dependências..."
    try {
        npm ci --only=production
        Write-Log "Dependências instaladas"
    } catch {
        Write-Error "Falha ao instalar dependências"
    }
    
    # Build da aplicação
    Write-Log "Fazendo build da aplicação..."
    try {
        npm run build
        Write-Log "Build concluído com sucesso!"
    } catch {
        Write-Error "Falha no build da aplicação"
    }
    
    # Verificar se o diretório dist foi criado
    if (-not (Test-Path "dist")) {
        Write-Error "Diretório dist não foi criado"
    }
    
    Write-Log "Deploy manual concluído!"
    Write-Info "Copie o conteúdo da pasta dist para seu servidor web"
}

# Função para deploy com Docker Compose
function Deploy-Compose {
    Write-Log "Iniciando deploy via Docker Compose..."
    
    # Verificar se Docker Compose está instalado
    try {
        docker-compose --version | Out-Null
        Write-Log "Docker Compose encontrado"
    } catch {
        Write-Error "Docker Compose não está instalado"
    }
    
    # Criar arquivo .env se não existir
    if (-not (Test-Path ".env")) {
        Write-Warning "Arquivo .env não encontrado"
        Write-Info "Criando arquivo .env com variáveis de exemplo..."
        
        $envContent = @"
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
NODE_ENV=production
"@
        
        $envContent | Out-File -FilePath ".env" -Encoding UTF8
        Write-Warning "Configure as variáveis no arquivo .env"
    }
    
    # Executar Docker Compose
    Write-Log "Executando Docker Compose..."
    try {
        docker-compose up -d --build
        Write-Log "Docker Compose executado com sucesso!"
        Write-Info "Aplicação disponível em: http://localhost"
    } catch {
        Write-Error "Falha ao executar Docker Compose"
    }
}

# Menu principal
switch ($DeployType) {
    "easypanel" {
        Deploy-EasyPanel
    }
    "docker" {
        Deploy-Docker
    }
    "compose" {
        Deploy-Compose
    }
    "manual" {
        Deploy-Manual
    }
    default {
        Write-Host "Uso: .\deploy-digitalocean.ps1 [easypanel|docker|compose|manual]"
        Write-Host ""
        Write-Host "Opções:"
        Write-Host "  easypanel  - Deploy via EasyPanel (recomendado)"
        Write-Host "  docker     - Deploy via Docker"
        Write-Host "  compose    - Deploy via Docker Compose"
        Write-Host "  manual     - Deploy manual (apenas build)"
        exit 1
    }
}

Write-Log "Deploy concluído com sucesso! 🎉" 