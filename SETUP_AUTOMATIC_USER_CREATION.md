# Configuração para Criação Automática de Usuários

## 🎯 Objetivo
Configurar o sistema para criar usuários automaticamente na autenticação do Supabase sem necessidade de criação manual.

## ⚠️ IMPORTANTE - Segurança

**NUNCA exponha a Service Role Key no frontend público!** Esta chave tem permissões de administrador e pode ser usada para acessar/modificar qualquer dado.

## 🔧 Passos para Configuração

### 1. Obter a Service Role Key

1. Acesse o [Supabase Dashboard](https://supabase.com)
2. Selecione seu projeto
3. Vá em **Settings** > **API**
4. Copie a **service_role** key (não a anon key)

### 2. Configurar a Chave

**Opção A: Variável de Ambiente (Recomendado)**

Crie um arquivo `.env.local` na raiz do projeto:

```env
VITE_SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key_aqui
```

**Opção B: Configuração Direta (Apenas para desenvolvimento)**

Edite o arquivo `src/integrations/supabase/adminClient.ts` e substitua:

```typescript
const SUPABASE_SERVICE_ROLE_KEY = "SUA_SERVICE_ROLE_KEY_AQUI";
```

Por:

```typescript
const SUPABASE_SERVICE_ROLE_KEY = "sua_service_role_key_real_aqui";
```

### 3. Verificar Configuração

Após configurar a chave, o sistema deve:

- ✅ Criar usuários automaticamente na autenticação
- ✅ Criar registros na tabela `users`
- ✅ Permitir login imediato com as credenciais criadas
- ✅ Deletar usuários completamente (autenticação + tabela)

## 🚀 Como Funciona

### Criação de Usuário
1. **Interface**: Super admin preenche formulário
2. **Cliente Admin**: Usa service role key para criar na autenticação
3. **Tabela**: Cria registro na tabela `users` com o mesmo ID
4. **Resultado**: Usuário pode fazer login imediatamente

### Exclusão de Usuário
1. **Tabela**: Remove registro da tabela `users`
2. **Autenticação**: Remove usuário da autenticação
3. **Resultado**: Usuário completamente removido do sistema

## 🔒 Configurações de Segurança

### Para Produção

**NUNCA use a service role key no frontend em produção!**

Para produção, implemente uma das seguintes soluções:

#### Opção 1: Backend API
```javascript
// Backend (Node.js/Express)
app.post('/api/users', async (req, res) => {
  const supabaseAdmin = createClient(url, serviceRoleKey);
  // Criar usuário usando service role key
});

// Frontend
const response = await fetch('/api/users', {
  method: 'POST',
  body: JSON.stringify(userData)
});
```

#### Opção 2: Supabase Edge Functions
```typescript
// supabase/functions/create-user/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )
  
  // Criar usuário
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email: 'user@example.com',
    password: 'password'
  })
  
  return new Response(JSON.stringify({ data, error }))
})
```

### Para Desenvolvimento

Para desenvolvimento local, você pode usar a service role key diretamente, mas:

1. **Nunca commite** a chave no Git
2. **Use .env.local** (já está no .gitignore)
3. **Monitore** o uso da chave

## 🧪 Testando

1. **Crie um usuário** através da interface
2. **Verifique** se aparece em Authentication > Users no Supabase
3. **Teste o login** com as credenciais criadas
4. **Delete o usuário** e verifique se foi removido completamente

## 📋 Checklist

- [ ] Obteve a service role key do Supabase Dashboard
- [ ] Configurou a chave no arquivo adminClient.ts
- [ ] Testou criação de usuário
- [ ] Testou exclusão de usuário
- [ ] Verificou se usuário pode fazer login
- [ ] Configurou .env.local (se usando variáveis de ambiente)

## 🆘 Solução de Problemas

### Erro: "Invalid API key"
- Verifique se a service role key está correta
- Certifique-se de que não há espaços extras

### Erro: "User not allowed"
- Verifique se está usando a service role key (não anon key)
- Confirme que a chave tem permissões de administrador

### Erro: "RLS policy violation"
- Verifique se as políticas RLS permitem operações administrativas
- Considere desabilitar RLS temporariamente para testes

## 🎉 Resultado Final

Após a configuração, você terá:

- ✅ Criação automática de usuários
- ✅ Exclusão automática de usuários
- ✅ Login imediato após criação
- ✅ Gerenciamento completo via interface
- ✅ Sem necessidade de criação manual no Supabase Dashboard 