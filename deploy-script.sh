#!/bin/bash

# Script de Deploy Automatizado para Digital Ocean
# Uso: ./deploy-script.sh [easypanel|docker|manual]

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para log
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[ERRO] $1${NC}"
    exit 1
}

warning() {
    echo -e "${YELLOW}[AVISO] $1${NC}"
}

info() {
    echo -e "${BLUE}[INFO] $1${NC}"
}

# Verificar se está no diretório correto
if [ ! -f "package.json" ]; then
    error "Execute este script no diretório raiz do projeto"
fi

# Verificar Node.js
if ! command -v node &> /dev/null; then
    error "Node.js não está instalado"
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    error "Node.js 18+ é necessário. Versão atual: $(node -v)"
fi

# Verificar variáveis de ambiente
if [ -z "$VITE_SUPABASE_URL" ] || [ -z "$VITE_SUPABASE_ANON_KEY" ]; then
    warning "Variáveis de ambiente do Supabase não encontradas"
    info "Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY"
fi

# Função para deploy EasyPanel
deploy_easypanel() {
    log "Iniciando deploy via EasyPanel..."
    
    # Build da aplicação
    log "Fazendo build da aplicação..."
    npm run build
    
    if [ $? -eq 0 ]; then
        log "Build concluído com sucesso!"
    else
        error "Falha no build da aplicação"
    fi
    
    # Verificar se o diretório dist foi criado
    if [ ! -d "dist" ]; then
        error "Diretório dist não foi criado"
    fi
    
    log "Deploy via EasyPanel concluído!"
    info "Acesse o painel do EasyPanel para finalizar a configuração"
}

# Função para deploy Docker
deploy_docker() {
    log "Iniciando deploy via Docker..."
    
    # Verificar se Docker está instalado
    if ! command -v docker &> /dev/null; then
        error "Docker não está instalado"
    fi
    
    # Build da imagem
    log "Construindo imagem Docker..."
    docker build -t barbearia-app .
    
    if [ $? -eq 0 ]; then
        log "Imagem Docker construída com sucesso!"
    else
        error "Falha na construção da imagem Docker"
    fi
    
    # Parar container anterior se existir
    if docker ps -a | grep -q barbearia-app; then
        log "Parando container anterior..."
        docker stop barbearia-app || true
        docker rm barbearia-app || true
    fi
    
    # Executar novo container
    log "Executando novo container..."
    docker run -d \
        --name barbearia-app \
        --restart unless-stopped \
        -p 80:80 \
        -e VITE_SUPABASE_URL="$VITE_SUPABASE_URL" \
        -e VITE_SUPABASE_ANON_KEY="$VITE_SUPABASE_ANON_KEY" \
        barbearia-app
    
    if [ $? -eq 0 ]; then
        log "Container iniciado com sucesso!"
        info "Aplicação disponível em: http://localhost"
    else
        error "Falha ao iniciar container"
    fi
}

# Função para deploy manual
deploy_manual() {
    log "Iniciando deploy manual..."
    
    # Instalar dependências
    log "Instalando dependências..."
    npm ci --only=production
    
    # Build da aplicação
    log "Fazendo build da aplicação..."
    npm run build
    
    if [ $? -eq 0 ]; then
        log "Build concluído com sucesso!"
    else
        error "Falha no build da aplicação"
    fi
    
    # Verificar se o diretório dist foi criado
    if [ ! -d "dist" ]; then
        error "Diretório dist não foi criado"
    fi
    
    log "Deploy manual concluído!"
    info "Copie o conteúdo da pasta dist para seu servidor web"
}

# Função para deploy com Docker Compose
deploy_compose() {
    log "Iniciando deploy via Docker Compose..."
    
    # Verificar se Docker Compose está instalado
    if ! command -v docker-compose &> /dev/null; then
        error "Docker Compose não está instalado"
    fi
    
    # Criar arquivo .env se não existir
    if [ ! -f ".env" ]; then
        warning "Arquivo .env não encontrado"
        info "Criando arquivo .env com variáveis de exemplo..."
        cat > .env << EOF
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
NODE_ENV=production
EOF
        warning "Configure as variáveis no arquivo .env"
    fi
    
    # Executar Docker Compose
    log "Executando Docker Compose..."
    docker-compose up -d --build
    
    if [ $? -eq 0 ]; then
        log "Docker Compose executado com sucesso!"
        info "Aplicação disponível em: http://localhost"
    else
        error "Falha ao executar Docker Compose"
    fi
}

# Menu principal
case "${1:-easypanel}" in
    "easypanel")
        deploy_easypanel
        ;;
    "docker")
        deploy_docker
        ;;
    "compose")
        deploy_compose
        ;;
    "manual")
        deploy_manual
        ;;
    *)
        echo "Uso: $0 [easypanel|docker|compose|manual]"
        echo ""
        echo "Opções:"
        echo "  easypanel  - Deploy via EasyPanel (recomendado)"
        echo "  docker     - Deploy via Docker"
        echo "  compose    - Deploy via Docker Compose"
        echo "  manual     - Deploy manual (apenas build)"
        exit 1
        ;;
esac

log "Deploy concluído com sucesso! 🎉" 