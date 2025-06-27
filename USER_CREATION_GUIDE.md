# Guia de Criação de Usuários

## Problema
O erro "User not allowed" ocorre porque estamos tentando usar a API de administrador do Supabase com a chave `anon` (pública), que não tem permissões para criar usuários na autenticação.

## Solução Atual
O sistema agora cria usuários apenas na tabela `users` e fornece instruções para criar na autenticação manualmente.

## Como Criar Usuários Manualmente no Supabase

### 1. Acesse o Dashboard do Supabase
- Vá para [supabase.com](https://supabase.com)
- Faça login na sua conta
- Selecione seu projeto

### 2. Navegue para Authentication
- No menu lateral, clique em "Authentication"
- Clique em "Users"

### 3. Crie o Usuário
- Clique no botão "Add user"
- Preencha os campos:
  - **Email**: Use o mesmo email que foi criado na tabela
  - **Password**: Defina uma senha temporária
  - **Email confirm**: Marque esta opção para confirmar o email automaticamente
- Clique em "Create user"

### 4. Atualize o ID do Usuário
- Após criar o usuário, copie o ID gerado
- Vá para "Table Editor" > "users"
- Encontre o usuário criado e atualize o campo `id` com o ID da autenticação

### 5. Configure a Senha (Opcional)
- O usuário pode fazer login com a senha temporária
- Pode alterar a senha no primeiro login ou você pode definir uma nova senha

## Fluxo Recomendado

1. **Crie o usuário na interface** (página de usuários)
2. **Anote o email e ID** mostrados na mensagem de sucesso
3. **Crie o usuário na autenticação** do Supabase (passos acima)
4. **Atualize o ID** na tabela users se necessário
5. **Informe o usuário** sobre as credenciais de login

## Alternativa: Usar Service Role Key

Se você quiser automatizar completamente o processo, pode:

1. **Obter a Service Role Key**:
   - No Supabase Dashboard, vá em "Settings" > "API"
   - Copie a "service_role" key (NUNCA exponha esta chave no frontend)

2. **Criar um endpoint backend**:
   - Use a service_role key apenas no backend
   - Crie um endpoint que recebe os dados do usuário
   - Use `supabase.auth.admin.createUser()` no backend

3. **Atualizar o frontend**:
   - Chame o endpoint do backend em vez de usar diretamente a API

## Segurança

⚠️ **IMPORTANTE**: Nunca use a service_role key no frontend, pois ela tem permissões de administrador e pode ser usada para acessar/modificar qualquer dado.

## Exemplo de Endpoint Backend (Node.js)

```javascript
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Use service_role, não anon
);

app.post('/api/users', async (req, res) => {
  try {
    const { email, password, name, phone, role, barbershopId } = req.body;
    
    // Criar na autenticação
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    });
    
    if (authError) throw authError;
    
    // Criar na tabela users
    const { error: userError } = await supabase
      .from('users')
      .insert([{
        id: authData.user.id,
        name,
        email,
        phone,
        role,
        barbershop_id: barbershopId || null
      }]);
    
    if (userError) throw userError;
    
    res.json({ success: true, user: authData.user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

## Conclusão

A solução atual funciona bem para sistemas pequenos e médios. Para sistemas maiores, considere implementar o endpoint backend com a service_role key para automatizar completamente o processo. 