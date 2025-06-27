# Gerenciamento de Usuários - Super Admin

## Visão Geral

O superadmin agora pode criar, editar e excluir usuários do sistema através de uma interface intuitiva.

## Funcionalidades Implementadas

### ✅ **Criar Usuários**
- **Nome completo** do usuário
- **Email** único para login
- **Telefone** para contato
- **Função** (Cliente, Barbeiro, Administrador, Super Admin)
- **Senha** para acesso ao sistema
- **Barbearia** (para admins - opcional)

### ✅ **Editar Usuários**
- Atualizar informações pessoais
- Alterar função do usuário
- Vincular/desvincular de barbearias
- **Não permite alterar senha** (por segurança)

### ✅ **Excluir Usuários**
- Exclusão permanente do sistema
- Remove tanto da autenticação quanto da tabela users
- Confirmação obrigatória antes da exclusão

### ✅ **Visualização**
- Lista todos os usuários do sistema
- Ícones visuais para cada função
- Informações da barbearia vinculada (se aplicável)
- Layout responsivo e moderno

## Como Acessar

1. **Login como Super Admin**:
   - Email: `brunomsk9@gmail.com`
   - Senha: [sua senha]

2. **Navegar para Usuários**:
   - Clique em "Usuários" no menu lateral
   - Ou acesse diretamente: `/users`

## Como Criar um Usuário

### Passo 1: Acessar a Página
- Vá para **Usuários** no menu lateral
- Clique no botão **"Novo Usuário"**

### Passo 2: Preencher Dados
- **Nome**: Nome completo do usuário
- **Email**: Email único (será usado para login)
- **Telefone**: Número de contato
- **Função**: Selecione a função apropriada
- **Barbearia**: (Apenas para admins) Selecione a barbearia
- **Senha**: Senha mínima de 6 caracteres

### Passo 3: Confirmar Criação
- Clique em **"Criar Usuário"**
- O sistema criará o usuário na autenticação e na tabela users
- Confirmação de sucesso será exibida

## Tipos de Usuários

### 👑 **Super Admin**
- Acesso total ao sistema
- Pode gerenciar todas as barbearias
- Pode criar/editar/excluir usuários
- Pode vincular admins às barbearias

### 🛡️ **Administrador**
- Gerencia uma barbearia específica
- Pode gerenciar barbeiros da sua barbearia
- Pode gerenciar serviços da sua barbearia
- Pode ver agendamentos da sua barbearia

### ✂️ **Barbeiro**
- Vê seus próprios agendamentos
- Gerencia seus horários de trabalho
- Acesso limitado ao sistema

### 👤 **Cliente**
- Pode fazer agendamentos
- Pode ver seus próprios agendamentos
- Acesso público ao sistema

## Como Editar um Usuário

1. **Localizar o usuário** na lista
2. **Clicar no botão de editar** (ícone de lápis)
3. **Modificar os dados** desejados
4. **Clicar em "Atualizar Usuário"**

## Como Excluir um Usuário

1. **Localizar o usuário** na lista
2. **Clicar no botão de excluir** (ícone de lixeira)
3. **Confirmar a exclusão** no popup
4. **O usuário será removido** permanentemente

## Configuração Técnica

### Pré-requisitos
- RLS desabilitado (para desenvolvimento)
- Superadmin logado no sistema
- Acesso ao Supabase Dashboard

### Permissões Necessárias
Para criar usuários via API, você precisa:
- **Service Role Key** do Supabase (não o anon key)
- Ou usar o **Supabase Dashboard** para criar usuários

### Scripts SQL
Execute os seguintes scripts no Supabase:
1. `disable-rls.sql` - Desabilitar RLS
2. `setup-admin-permissions.sql` - Configurar permissões

## Segurança

### ✅ **Medidas Implementadas**
- Apenas superadmin pode acessar a página
- Verificação de permissões no backend
- Confirmação obrigatória para exclusão
- Senhas não são exibidas na interface

### ⚠️ **Considerações**
- Em produção, reative o RLS com políticas adequadas
- Use HTTPS em produção
- Implemente auditoria de ações do superadmin
- Considere implementar 2FA para superadmins

## Testando a Funcionalidade

### 1. Criar um Admin
- Crie um usuário com função "Administrador"
- Vincule a uma barbearia
- Teste o login com as novas credenciais

### 2. Criar um Barbeiro
- Crie um usuário com função "Barbeiro"
- Teste o acesso às funcionalidades de barbeiro

### 3. Criar um Cliente
- Crie um usuário com função "Cliente"
- Teste o acesso às funcionalidades de cliente

## Próximos Passos

- [ ] Implementar reset de senha
- [ ] Adicionar auditoria de ações
- [ ] Implementar notificações por email
- [ ] Adicionar filtros e busca na lista
- [ ] Implementar paginação para muitos usuários
- [ ] Adicionar exportação de dados 