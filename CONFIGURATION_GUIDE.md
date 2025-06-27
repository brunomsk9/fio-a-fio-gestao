# Guia de Configuração Centralizada

## 🎯 Objetivo
Centralizar todas as configurações do Supabase em um único arquivo para maior segurança e facilidade de manutenção.

## 📁 Estrutura de Arquivos

```
src/
├── config/
│   ├── supabase.ts          # Configuração real (NÃO commitar)
│   └── supabase.example.ts  # Exemplo de configuração
├── integrations/
│   └── supabase/
│       ├── client.ts        # Cliente público (anon key)
│       ├── adminClient.ts   # Cliente administrativo (service role)
│       └── types.ts         # Tipos do banco
```

## 🔧 Configuração

### 1. Configurar as Chaves

**Opção A: Arquivo de Configuração (Recomendado para desenvolvimento)**

Edite `src/config/supabase.ts` e configure suas chaves:

```typescript
export const SUPABASE_CONFIG = {
  URL: "https://seu-projeto.supabase.co",
  ANON_KEY: "sua_anon_key_aqui",
  SERVICE_ROLE_KEY: "sua_service_role_key_aqui"
};
```

**Opção B: Variável de Ambiente (Recomendado para produção)**

Crie um arquivo `.env.local` na raiz do projeto:

```env
VITE_SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key_aqui
```

### 2. Obter as Chaves

1. Acesse o [Supabase Dashboard](https://supabase.com)
2. Selecione seu projeto
3. Vá em **Settings** > **API**
4. Copie:
   - **Project URL** → `URL`
   - **anon public** → `ANON_KEY`
   - **service_role** → `SERVICE_ROLE_KEY`

## 🔒 Segurança

### Proteções Implementadas

1. **Verificação de Ambiente**: Operações administrativas só funcionam em desenvolvimento
2. **Validação de Chave**: Verifica se a service role key está configurada e tem formato válido
3. **Avisos de Segurança**: Mensagens claras sobre riscos de segurança
4. **Gitignore**: Arquivos sensíveis não são commitados

### Regras de Segurança

- ✅ **ANON_KEY**: Pode ser exposta no frontend
- ❌ **SERVICE_ROLE_KEY**: NUNCA exponha no frontend público
- ✅ **Desenvolvimento**: Pode usar service role key localmente
- ❌ **Produção**: Use backend ou edge functions

## 🚀 Como Usar

### Cliente Público (Operações Normais)

```typescript
import { supabase } from '@/integrations/supabase/client';

// Operações normais (login, consultas, etc.)
const { data, error } = await supabase
  .from('users')
  .select('*');
```

### Cliente Administrativo (Operações Especiais)

```typescript
import { createUserWithAuth, deleteUserWithAuth } from '@/integrations/supabase/adminClient';

// Criar usuário completo
const result = await createUserWithAuth({
  email: 'user@example.com',
  password: 'password',
  name: 'Nome do Usuário',
  phone: '11999999999',
  role: 'client'
});

// Deletar usuário completo
const result = await deleteUserWithAuth(userId);
```

## 🔍 Verificações Automáticas

### Validação de Chave

O sistema verifica automaticamente:

- ✅ Se a service role key está configurada
- ✅ Se tem formato válido (começa com 'eyJ')
- ✅ Se está em ambiente de desenvolvimento
- ✅ Se as operações são permitidas

### Mensagens de Erro

- **"Service Role Key não configurada"**: Configure a chave
- **"Operações administrativas não permitidas"**: Use apenas em desenvolvimento
- **"Formato inválido"**: Verifique se a chave está correta

## 📋 Checklist de Configuração

- [ ] Copiou `supabase.example.ts` para `supabase.ts`
- [ ] Configurou a URL do projeto
- [ ] Configurou a ANON_KEY
- [ ] Configurou a SERVICE_ROLE_KEY
- [ ] Testou criação de usuário
- [ ] Testou exclusão de usuário
- [ ] Verificou se não há erros no console

## 🧪 Testando

### Teste Básico

```bash
npm run dev
```

Verifique no console se não há avisos sobre configuração.

### Teste de Criação de Usuário

1. Acesse a página de usuários
2. Tente criar um novo usuário
3. Verifique se foi criado na autenticação e tabela
4. Teste o login com as credenciais criadas

## 🆘 Solução de Problemas

### Erro: "Service Role Key não configurada"

1. Verifique se `src/config/supabase.ts` existe
2. Confirme se a SERVICE_ROLE_KEY está configurada
3. Verifique se não há espaços extras na chave

### Erro: "Operações administrativas não permitidas"

1. Confirme que está em ambiente de desenvolvimento
2. Verifique se a service role key está válida
3. Reinicie o servidor de desenvolvimento

### Erro: "Formato inválido"

1. Verifique se a chave começa com 'eyJ'
2. Confirme se copiou a chave completa
3. Verifique se não há caracteres extras

## 🎉 Benefícios

- ✅ **Centralização**: Todas as configurações em um lugar
- ✅ **Segurança**: Verificações automáticas de segurança
- ✅ **Manutenibilidade**: Fácil de atualizar e manter
- ✅ **Flexibilidade**: Suporte a variáveis de ambiente
- ✅ **Documentação**: Exemplos e guias claros 