# Correção do Problema de Recursão Infinita no Supabase

## Problema Identificado

O erro `infinite recursion detected in policy for relation "users"` está ocorrendo porque as políticas RLS (Row Level Security) estão fazendo consultas recursivas na própria tabela `users` para verificar permissões.

## Solução

### Opção 1: Desabilitar RLS (Recomendado para Desenvolvimento)

1. Acesse o [Supabase Dashboard](https://supabase.com/dashboard)
2. Vá para o seu projeto
3. Acesse o **SQL Editor**
4. Execute o script `disable-rls.sql` que está neste diretório

### Opção 2: Corrigir as Políticas RLS

Se você quiser manter o RLS ativo, execute o script `fix-rls-policies.sql` que cria políticas simplificadas.

## Como Executar

1. **Copie o conteúdo** do arquivo `disable-rls.sql`
2. **Cole no SQL Editor** do Supabase
3. **Execute o script**
4. **Verifique se funcionou** executando o teste novamente

## Teste Após a Correção

Após executar o script, teste novamente executando:

```bash
node test-supabase.js
```

Você deve ver mensagens de sucesso como:
- ✅ Conexão básica OK
- ✅ Consulta simples OK
- ✅ Consulta com JOIN OK
- ✅ Tabela [nome] OK

## Estrutura do Banco

O banco de dados possui as seguintes tabelas:
- `users` - Usuários do sistema
- `barbershops` - Barbearias
- `services` - Serviços oferecidos
- `barbers` - Barbeiros
- `barber_barbershops` - Relacionamento entre barbeiros e barbearias
- `working_hours` - Horários de trabalho
- `bookings` - Agendamentos

## Dados de Teste

O arquivo `database/seed.sql` contém dados de exemplo para testar o sistema.

## Próximos Passos

1. Execute o script de correção
2. Teste a aplicação
3. Se necessário, implemente políticas RLS mais seguras para produção 