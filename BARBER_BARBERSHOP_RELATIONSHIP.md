# Relacionamento Barbeiro-Barbearia

## 📋 Visão Geral

Esta funcionalidade permite vincular barbeiros às barbearias, criando um relacionamento muitos-para-muitos entre usuários com role "barber" e barbearias.

## 🗄️ Estrutura do Banco

### Tabela `barber_barbershops`

```sql
CREATE TABLE barber_barbershops (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    barber_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    barbershop_id UUID NOT NULL REFERENCES barbershops(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(barber_id, barbershop_id)
);
```

### Políticas RLS

- **Super Admin**: Pode ver, inserir e deletar todos os relacionamentos
- **Admin**: Pode ver relacionamentos da sua barbearia
- **Barbeiro**: Pode ver seus próprios relacionamentos

## 🚀 Como Usar

### 1. Configuração Inicial

Execute o script SQL no Supabase:

```bash
# Execute o script PowerShell
.\setup-barber-barbershops.ps1

# Ou copie o conteúdo de create-barber-barbershops-table.sql
# e execute no SQL Editor do Supabase
```

### 2. Acesso à Funcionalidade

1. Faça login como **super-admin**
2. Vá para a página **"Barbearias"**
3. Clique no botão **"Gerenciar"** em qualquer barbearia
4. Use o diálogo para vincular/desvincular barbeiros

### 3. Interface

#### Página de Barbearias
- Cada barbearia mostra um card com informações
- Seção "Barbeiros" com botão "Gerenciar"
- Contador de barbeiros vinculados

#### Diálogo de Gerenciamento
- **Adicionar Barbeiro**: Seletor com barbeiros disponíveis
- **Barbeiros Vinculados**: Lista dos barbeiros atuais
- **Ações**: Botões para adicionar/remover barbeiros

## 🔧 Funcionalidades

### Vincular Barbeiro
1. Selecione um barbeiro da lista de disponíveis
2. Clique em "Adicionar"
3. O barbeiro será vinculado à barbearia

### Desvincular Barbeiro
1. Na lista de barbeiros vinculados
2. Clique no ícone de remoção (UserMinus)
3. O barbeiro será removido da barbearia

### Validações
- Um barbeiro não pode ser vinculado à mesma barbearia duas vezes
- Apenas super-admins podem gerenciar relacionamentos
- Relacionamentos são removidos automaticamente se a barbearia ou barbeiro for excluído

## 📊 Dados e Consultas

### Buscar Barbeiros de uma Barbearia
```sql
SELECT 
    bb.barber_id,
    u.name as barber_name,
    u.email as barber_email
FROM barber_barbershops bb
JOIN users u ON bb.barber_id = u.id
WHERE bb.barbershop_id = 'barbearia_id';
```

### Buscar Barbearias de um Barbeiro
```sql
SELECT 
    bb.barbershop_id,
    b.name as barbershop_name,
    b.address
FROM barber_barbershops bb
JOIN barbershops b ON bb.barbershop_id = b.id
WHERE bb.barber_id = 'barbeiro_id';
```

## 🎯 Casos de Uso

### Para Super Admin
- Gerenciar todos os relacionamentos
- Distribuir barbeiros entre barbearias
- Reorganizar equipes

### Para Admin
- Ver barbeiros da sua barbearia
- Planejar escalas e agendamentos

### Para Barbeiro
- Ver em quais barbearias trabalha
- Acessar informações das barbearias

## 🔒 Segurança

### Políticas RLS
- Controle de acesso baseado em roles
- Isolamento de dados entre barbearias
- Proteção contra acesso não autorizado

### Validações
- Constraints de unicidade no banco
- Validações no frontend
- Verificações de permissão

## 🧪 Testes

Execute o script de teste:

```bash
.\test-barber-barbershops.ps1
```

### Checklist de Teste
- [ ] Tabela criada no banco
- [ ] Políticas RLS configuradas
- [ ] Interface carrega corretamente
- [ ] Vinculação funciona
- [ ] Remoção funciona
- [ ] Contadores atualizam

## 🐛 Troubleshooting

### Erro: "Tabela não existe"
- Execute o script SQL no Supabase
- Verifique se a tabela foi criada

### Erro: "Permissão negada"
- Verifique as políticas RLS
- Confirme que o usuário tem role correto

### Erro: "Barbeiro já vinculado"
- O barbeiro já está vinculado à barbearia
- Use a lista de barbeiros vinculados para remover

### Interface não carrega
- Verifique o console do navegador
- Confirme que existem usuários com role "barber"

## 📈 Próximos Passos

### Funcionalidades Futuras
- Agendamentos por barbeiro
- Relatórios de produtividade
- Escalas de trabalho
- Avaliações por barbeiro

### Melhorias
- Drag & drop para reorganizar
- Filtros avançados
- Histórico de vinculações
- Notificações de mudanças

## 📞 Suporte

Se encontrar problemas:
1. Verifique os logs do console
2. Confirme a configuração do banco
3. Teste com dados simples
4. Consulte a documentação do Supabase 