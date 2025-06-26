
# Database Setup

Este diretório contém os scripts SQL necessários para configurar o banco de dados do sistema de barbearia no Supabase.

## Como executar

1. Acesse o painel do Supabase (https://supabase.com/dashboard)
2. Selecione seu projeto
3. Vá para a seção "SQL Editor"
4. Execute os scripts na seguinte ordem:

### 1. Schema Principal
Execute o arquivo `schema.sql` primeiro. Este arquivo contém:
- Criação de todas as tabelas
- Configuração de chaves estrangeiras
- Índices para performance
- Habilitação do RLS (Row Level Security)
- Políticas de segurança (RLS Policies)
- Triggers para timestamps automáticos

### 2. Dados de Exemplo (Opcional)
Execute o arquivo `seed.sql` para inserir dados de teste:
- Barbearias de exemplo
- Serviços básicos

## Estrutura das Tabelas

### users
Extensão da tabela `auth.users` do Supabase com campos adicionais para o sistema.

### barbershops
Cadastro das barbearias do sistema.

### services
Serviços oferecidos por cada barbearia.

### barbers
Perfil dos barbeiros (referencia `users`).

### barber_barbershops
Relacionamento many-to-many entre barbeiros e barbearias.

### working_hours
Horários de trabalho dos barbeiros por barbearia.

### bookings
Agendamentos realizados pelos clientes.

## Políticas de Segurança (RLS)

O sistema implementa Row Level Security para garantir que:

- **Super Admins**: Acesso total ao sistema
- **Admins**: Acesso limitado à sua barbearia
- **Barbeiros**: Acesso aos próprios dados e agendamentos
- **Clientes**: Podem criar agendamentos e consultar por telefone
- **Público**: Pode visualizar barbearias e serviços para fazer agendamentos

## Notas Importantes

- As senhas são gerenciadas pelo sistema de autenticação do Supabase
- O RLS garante a segurança dos dados conforme o perfil do usuário
- Os triggers mantêm os timestamps `updated_at` atualizados automaticamente
- As políticas permitem que clientes façam agendamentos sem login
