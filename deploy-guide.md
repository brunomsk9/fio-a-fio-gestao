# 🚀 Guia de Deploy - Digital Ocean + EasyPanel

## 📋 Pré-requisitos
- Conta na Digital Ocean
- Repositório Git (GitHub, GitLab, etc.)
- Projeto configurado com Supabase

## 🎯 Opção Recomendada: EasyPanel

### **1. Criar Droplet Ubuntu**

1. **Acesse** [Digital Ocean](https://cloud.digitalocean.com/)
2. **Clique** em "Create" → "Droplets"
3. **Configure**:
   - **Choose an image**: Ubuntu 22.04 LTS
   - **Choose a plan**: Basic (1GB RAM, 1 vCPU, 25GB SSD)
   - **Choose a datacenter**: São Paulo (SPA1) ou Nova York (NYC1)
   - **Authentication**: SSH Key (recomendado) ou Password
   - **Finalize**: Nome do droplet (ex: "barbearia-app")

### **2. Instalar EasyPanel**

```bash
# Conectar via SSH
ssh root@SEU_IP_DO_DROPLET

# Instalar EasyPanel
curl -s https://easypanel.io/install.sh | bash

# Acessar EasyPanel
# Abra: http://SEU_IP:3000
```

### **3. Configurar EasyPanel**

1. **Primeiro acesso**:
   - Email: admin@seudominio.com
   - Senha: (defina uma senha forte)

2. **Configurar domínio** (opcional):
   - Adicione seu domínio nas configurações
   - EasyPanel configurará SSL automaticamente

### **4. Deploy da Aplicação**

1. **Criar novo projeto**:
   - Nome: "barbearia-app"
   - Tipo: "Static Site"

2. **Configurar Git**:
   - Repository: `https://github.com/seu-usuario/projetobarbearia.git`
   - Branch: `main`
   - Build Command: `npm run build`
   - Output Directory: `dist`

3. **Variáveis de Ambiente**:
   ```
   VITE_SUPABASE_URL=sua_url_do_supabase
   VITE_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
   NODE_ENV=production
   ```

## 🔧 Configurações Específicas do Projeto

### **1. Atualizar Vite Config**

```typescript
// vite.config.ts
export default defineConfig({
  server: {
    host: "::",
    port: 8080,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  },
  // ... resto da configuração
});
```

### **2. Criar Dockerfile (Alternativa)**

```dockerfile
# Dockerfile
FROM node:18-alpine as build

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### **3. Nginx Config**

```nginx
# nginx.conf
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 🌐 Configuração de Domínio

### **1. DNS Records**
```
A     @     SEU_IP_DO_DROPLET
CNAME www   @
```

### **2. SSL Automático**
- EasyPanel configura automaticamente
- Certbot integrado

## 🔒 Configurações de Segurança

### **1. Firewall**
```bash
# UFW (Uncomplicated Firewall)
ufw allow ssh
ufw allow 80
ufw allow 443
ufw allow 3000
ufw enable
```

### **2. Fail2ban**
```bash
apt install fail2ban
systemctl enable fail2ban
systemctl start fail2ban
```

## 📊 Monitoramento

### **1. Logs**
- EasyPanel fornece logs automáticos
- Acesse via interface web

### **2. Backup**
- Configure backup automático no EasyPanel
- Backup do banco Supabase separadamente

## 🚀 Deploy Automático

### **1. GitHub Actions (Opcional)**

```yaml
# .github/workflows/deploy.yml
name: Deploy to Digital Ocean

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    
    - name: Deploy to EasyPanel
      uses: appleboy/ssh-action@v0.1.5
      with:
        host: ${{ secrets.HOST }}
        username: ${{ secrets.USERNAME }}
        key: ${{ secrets.KEY }}
        script: |
          cd /opt/easypanel/projects/barbearia-app
          git pull origin main
          npm install
          npm run build
```

## 🔧 Troubleshooting

### **Problemas Comuns**

1. **Build falha**:
   - Verifique Node.js version (18+)
   - Limpe cache: `npm cache clean --force`

2. **SSL não funciona**:
   - Aguarde propagação DNS (até 24h)
   - Verifique configurações do domínio

3. **Performance lenta**:
   - Ative compressão no Nginx
   - Configure cache de assets

## 📱 Teste Final

1. **Acesse** sua aplicação
2. **Teste** todas as funcionalidades
3. **Verifique** logs de erro
4. **Teste** responsividade

## 💰 Custos Estimados

- **Droplet Basic**: $6/mês
- **Domínio**: $12/ano (opcional)
- **Total**: ~$6-7/mês

## 🎉 Próximos Passos

1. Configure monitoramento
2. Implemente backup automático
3. Configure CDN (Cloudflare)
4. Implemente CI/CD completo

---

**Suporte**: EasyPanel tem documentação excelente e comunidade ativa! 