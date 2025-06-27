# Configuração de Subdomínios para Barbearias

## Visão Geral

O sistema agora suporta subdomínios personalizados para cada barbearia, permitindo que cada estabelecimento tenha sua própria URL personalizada.

## Funcionalidades

### 1. Subdomínios Automáticos
- Cada barbearia recebe automaticamente um subdomínio baseado no nome
- Formato: `https://nome-da-barbearia.seudominio.com`
- Geração automática de subdomínios únicos

### 2. Domínios Customizados
- Possibilidade de configurar domínios próprios
- Formato: `https://minhabarbearia.com.br`
- Suporte a SSL automático

### 3. Status de Configuração
- **Pendente**: Configuração em andamento
- **Ativo**: Domínio funcionando corretamente
- **Erro**: Problema na configuração

## Configuração no Banco de Dados

### 1. Executar o Script SQL
```bash
# Execute o arquivo subdomain_setup.sql no seu banco Supabase
psql -h your-supabase-host -U postgres -d postgres -f database/subdomain_setup.sql
```

### 2. Estrutura das Tabelas

#### Tabela `barbershops` (atualizada)
```sql
ALTER TABLE public.barbershops 
ADD COLUMN subdomain TEXT UNIQUE,
ADD COLUMN custom_domain TEXT UNIQUE,
ADD COLUMN domain_enabled BOOLEAN DEFAULT false;
```

#### Nova Tabela `domain_settings`
```sql
CREATE TABLE public.domain_settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  barbershop_id UUID REFERENCES public.barbershops(id) ON DELETE CASCADE,
  subdomain TEXT UNIQUE,
  custom_domain TEXT UNIQUE,
  ssl_enabled BOOLEAN DEFAULT false,
  dns_configured BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'error')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Como Usar

### 1. Acesso à Configuração
- Apenas Super Administradores podem configurar subdomínios
- Acesse: **Configurações > Gerenciamento de Subdomínios**

### 2. Configurar Subdomínio
1. Clique em **"Configurar Domínio"**
2. Selecione a barbearia
3. Configure o subdomínio (ex: `minha-barbearia`)
4. Opcional: Configure domínio customizado
5. Ative SSL automático se desejar
6. Clique em **"Salvar Configuração"**

### 3. Validações
- **Subdomínio**: 3-63 caracteres, apenas letras, números e hífens
- **Domínio Customizado**: Formato válido de domínio
- **Unicidade**: Cada subdomínio deve ser único

## Exemplos de URLs

### Subdomínios Automáticos
- Barbearia "Corte & Estilo" → `https://corteestilo.seudominio.com`
- Barbearia "Barba & Cia" → `https://barbacia.seudominio.com`
- Barbearia "Estilo Masculino" → `https://estilomasculino.seudominio.com`

### Domínios Customizados
- `https://minhabarbearia.com.br`
- `https://corteestilo.com.br`
- `https://barbearia-sao-paulo.com`

## Funcionalidades da Interface

### 1. Visualização de Status
- Ícones coloridos indicam o status do domínio
- Badges mostram se está ativo, pendente ou com erro

### 2. Ações Disponíveis
- **Abrir Link**: Abre o domínio em nova aba
- **Copiar Link**: Copia a URL para área de transferência
- **Editar Configuração**: Modifica as configurações existentes

### 3. Interface Responsiva
- Design adaptável para mobile e desktop
- Cards organizados por barbearia
- Informações claras e acessíveis

## Configuração de DNS (Para Domínios Customizados)

### 1. Configurações Necessárias
Para domínios customizados, configure os seguintes registros DNS:

```
Tipo: CNAME
Nome: @
Valor: seu-dominio-principal.com

Tipo: A
Nome: @
Valor: IP_DO_SERVIDOR
```

### 2. Verificação de DNS
- O sistema marca `dns_configured` como `true` quando detecta configuração correta
- Status muda para "Ativo" quando tudo está funcionando

## Segurança

### 1. Controle de Acesso
- Apenas Super Administradores podem configurar domínios
- Políticas RLS protegem os dados
- Validação de entrada previne ataques

### 2. SSL Automático
- Certificados SSL gratuitos via Let's Encrypt
- Redirecionamento automático HTTPS
- Segurança para todos os domínios

## Monitoramento

### 1. Status em Tempo Real
- Verificação automática de status
- Notificações de problemas
- Logs de configuração

### 2. Métricas
- Uso de cada domínio
- Performance e disponibilidade
- Relatórios de acesso

## Troubleshooting

### Problema: Subdomínio não funciona
**Solução:**
1. Verificar se o status está "Ativo"
2. Aguardar propagação DNS (até 24h)
3. Verificar configurações de DNS

### Problema: SSL não ativa
**Solução:**
1. Verificar se SSL automático está ativado
2. Aguardar geração do certificado (até 1h)
3. Verificar se o domínio está apontando corretamente

### Problema: Domínio customizado não carrega
**Solução:**
1. Verificar configurações DNS
2. Aguardar propagação (até 48h)
3. Verificar se o domínio está ativo no provedor

## Próximos Passos

### 1. Implementações Futuras
- Painel de analytics por domínio
- Configuração automática de DNS
- Integração com provedores de domínio
- Backup automático de configurações

### 2. Melhorias Planejadas
- Interface de configuração mais avançada
- Suporte a múltiplos domínios por barbearia
- Integração com CDN
- Monitoramento avançado

## Suporte

Para dúvidas ou problemas:
1. Verifique esta documentação
2. Consulte os logs do sistema
3. Entre em contato com o suporte técnico

---

**Nota**: Esta funcionalidade está em desenvolvimento ativo. Novas features serão adicionadas regularmente. 