# 🚀 Resumo de Deploy - Digital Ocean

## 🎯 **Recomendação: EasyPanel + Droplet Ubuntu**

Para seu projeto React + Vite + Supabase, **EasyPanel** é a melhor opção por ser:
- ✅ Mais simples para aplicações frontend
- ✅ Deploy automático com Git
- ✅ SSL gratuito automático
- ✅ Menos configuração manual
- ✅ Ideal para React/Vite

## 📋 **Arquivos Criados para Deploy**

### **1. Guia Completo**
- `deploy-guide.md` - Instruções detalhadas passo a passo

### **2. Scripts de Deploy**
- `deploy-script.sh` - Script Bash para Linux/Mac
- `deploy-digitalocean.ps1` - Script PowerShell para Windows

### **3. Configurações Docker**
- `Dockerfile` - Containerização da aplicação
- `docker-compose.yml` - Orquestração de serviços
- `nginx.conf` - Configuração do servidor web

### **4. CI/CD**
- `.github/workflows/deploy.yml` - GitHub Actions para deploy automático

## 🚀 **Opções de Deploy**

### **Opção 1: EasyPanel (Recomendado)**
```bash
# 1. Criar Droplet Ubuntu na Digital Ocean
# 2. Instalar EasyPanel
curl -s https://easypanel.io/install.sh | bash

# 3. Configurar projeto no EasyPanel
# - Tipo: Static Site
# - Build Command: npm run build
# - Output Directory: dist
```

### **Opção 2: Docker**
```bash
# Usar script PowerShell
.\deploy-digitalocean.ps1 docker

# Ou manualmente
docker build -t barbearia-app .
docker run -d --name barbearia-app -p 80:80 barbearia-app
```

### **Opção 3: Docker Compose**
```bash
# Usar script PowerShell
.\deploy-digitalocean.ps1 compose

# Ou manualmente
docker-compose up -d --build
```

### **Opção 4: Deploy Manual**
```bash
# Usar script PowerShell
.\deploy-digitalocean.ps1 manual

# Ou manualmente
npm run build
# Copiar pasta dist para servidor
```

## 🔧 **Configurações Necessárias**

### **1. Variáveis de Ambiente**
```bash
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
NODE_ENV=production
```

### **2. GitHub Secrets (para CI/CD)**
```
DROPLET_HOST=seu_ip_do_droplet
DROPLET_USERNAME=root
DROPLET_SSH_KEY=sua_chave_ssh
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
```

## 💰 **Custos Estimados**

| Serviço | Custo Mensal |
|---------|-------------|
| Droplet Basic (1GB RAM) | $6 |
| Domínio (opcional) | $1 |
| **Total** | **$6-7** |

## 🎯 **Passos Rápidos**

### **1. Criar Droplet**
1. Acesse [Digital Ocean](https://cloud.digitalocean.com/)
2. Create → Droplets
3. Ubuntu 22.04 LTS
4. Basic Plan ($6/mês)
5. São Paulo (SPA1) ou Nova York (NYC1)

### **2. Instalar EasyPanel**
```bash
ssh root@SEU_IP_DO_DROPLET
curl -s https://easypanel.io/install.sh | bash
```

### **3. Configurar Projeto**
1. Acesse: `http://SEU_IP:3000`
2. Crie conta admin
3. Novo projeto → Static Site
4. Configure Git repository
5. Build Command: `npm run build`
6. Output Directory: `dist`

### **4. Configurar Domínio (Opcional)**
1. Adicione domínio no EasyPanel
2. Configure DNS records
3. SSL será configurado automaticamente

## 🔒 **Segurança**

### **Firewall**
```bash
ufw allow ssh
ufw allow 80
ufw allow 443
ufw allow 3000
ufw enable
```

### **Fail2ban**
```bash
apt install fail2ban
systemctl enable fail2ban
systemctl start fail2ban
```

## 📊 **Monitoramento**

### **Logs**
- EasyPanel: Interface web
- Docker: `docker logs barbearia-app`
- Nginx: `/var/log/nginx/`

### **Backup**
- Configure backup automático no EasyPanel
- Backup do Supabase separadamente

## 🚨 **Troubleshooting**

### **Problemas Comuns**

1. **Build falha**
   - Verifique Node.js 18+
   - Limpe cache: `npm cache clean --force`

2. **SSL não funciona**
   - Aguarde propagação DNS (24h)
   - Verifique configurações do domínio

3. **Performance lenta**
   - Ative compressão no Nginx
   - Configure cache de assets

## 🎉 **Próximos Passos**

1. ✅ Deploy inicial
2. 🔄 Configure monitoramento
3. 🔄 Implemente backup automático
4. 🔄 Configure CDN (Cloudflare)
5. 🔄 Implemente CI/CD completo

## 📞 **Suporte**

- **EasyPanel**: [Documentação oficial](https://easypanel.io/docs)
- **Digital Ocean**: [Tutoriais](https://www.digitalocean.com/community/tutorials)
- **Supabase**: [Documentação](https://supabase.com/docs)

---

**🎯 Recomendação Final**: Use **EasyPanel** para simplicidade e **Docker** para mais controle! 