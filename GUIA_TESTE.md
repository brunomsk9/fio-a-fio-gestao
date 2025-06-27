# Guia de Teste - Sistema de Barbearia

## 🚀 Como Testar no Localhost

### 1. Servidor Rodando
- ✅ Servidor está rodando em: **http://localhost:8080**
- ✅ Navegador deve ter sido aberto automaticamente
- ✅ Problema do OpenSSL resolvido com rollback

### 2. Login no Sistema

#### Dados de Acesso:
- **Email:** admin@barbearia.com
- **Senha:** admin123
- **Perfil:** Super Admin

### 3. Funcionalidades para Testar

#### 📋 Dashboard
- Verificar estatísticas do sistema
- Verificar cards de resumo
- Testar responsividade mobile

#### 🏪 Gerenciamento de Barbearias
- **Localização:** Menu lateral → "Barbearias"
- **Testar:**
  - Listar barbearias existentes
  - Criar nova barbearia
  - Editar barbearia existente
  - Excluir barbearia

#### 👥 Gerenciamento de Usuários
- **Localização:** Menu lateral → "Usuários"
- **Testar:**
  - Listar usuários
  - Criar novo usuário
  - Editar usuário existente
  - Excluir usuário
  - Verificar diferentes roles (admin, barbeiro, cliente)

#### ⚙️ Configurações de Subdomínios
- **Localização:** Menu lateral → "Configurações" → "Gerenciar Subdomínios"
- **Testar:**
  - Selecionar barbearia
  - Adicionar subdomínio (ex: "minhabarbearia")
  - Salvar configurações
  - Verificar se não há erros de constraint

#### 📊 Relatórios
- **Localização:** Menu lateral → "Relatórios"
- **Testar:**
  - Verificar gráficos
  - Testar filtros
  - Verificar responsividade

### 4. Testes de Responsividade

#### 📱 Mobile
- Abrir DevTools (F12)
- Ativar modo mobile
- Testar menu lateral
- Testar formulários
- Verificar cards e botões

#### 💻 Desktop
- Testar em diferentes resoluções
- Verificar sidebar
- Testar hover effects
- Verificar animações

### 5. Problemas Comuns e Soluções

#### ❌ Erro de Login
- Verificar se o Supabase está configurado
- Verificar se as credenciais estão corretas
- Verificar console do navegador para erros

#### ❌ Erro de Subdomínio
- Executar o script `simple-setup.sql` no Supabase
- Verificar se as colunas foram criadas
- Verificar políticas RLS

#### ❌ Página em Branco
- Verificar console do navegador
- Verificar se todas as dependências estão instaladas
- Reiniciar o servidor: `.\start-dev.ps1`

#### ❌ Erro OpenSSL
- Usar o script `start-dev.ps1` que configura as variáveis corretas
- Ou definir manualmente: `$env:NODE_OPTIONS="--openssl-legacy-provider"`

### 6. Comandos Úteis

```bash
# Iniciar servidor (com configurações corretas)
.\start-dev.ps1

# Abrir navegador
.\open-browser.ps1

# Parar servidor
Ctrl + C

# Instalar dependências
npm install

# Verificar porta
netstat -an | findstr :8080
```

### 7. URLs Importantes

- **Aplicação:** http://localhost:8080
- **Supabase:** https://supabase.com
- **SQL Editor:** https://supabase.com/dashboard/project/[SEU_PROJETO]/sql

### 8. Checklist de Teste

- [ ] Login funciona
- [ ] Dashboard carrega
- [ ] Menu lateral funciona
- [ ] Gerenciamento de barbearias
- [ ] Gerenciamento de usuários
- [ ] Configurações de subdomínios
- [ ] Relatórios funcionam
- [ ] Responsividade mobile
- [ ] Responsividade desktop
- [ ] Sem erros no console

### 9. Rollback Realizado

- ✅ Configuração do Vite voltou para porta 8080
- ✅ Problema do OpenSSL resolvido com variáveis de ambiente
- ✅ Servidor rodando normalmente

### 10. Feedback

Se encontrar algum problema:
1. Verificar console do navegador (F12)
2. Verificar terminal onde o servidor está rodando
3. Anotar o erro específico
4. Reportar o problema com detalhes

---

**🎉 Sistema pronto para teste!** 