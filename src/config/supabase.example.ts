// Exemplo de configuração do Supabase
// Copie este arquivo para supabase.ts e configure suas chaves

// URLs e chaves do Supabase
export const SUPABASE_CONFIG = {
  // URL do projeto (pública)
  URL: "https://seu-projeto.supabase.co",
  
  // Chave pública (anon) - pode ser exposta no frontend
  ANON_KEY: "sua_anon_key_aqui",
  
  // Chave de serviço (service_role) - NUNCA exponha no frontend público!
  // ⚠️ Use apenas para desenvolvimento local ou em backends seguros
  SERVICE_ROLE_KEY: import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || "sua_service_role_key_aqui"
};

// Verificação de segurança
export const validateServiceRoleKey = () => {
  const key = SUPABASE_CONFIG.SERVICE_ROLE_KEY;
  
  // Verificar se a chave está configurada
  if (!key || key === "sua_service_role_key_aqui") {
    console.warn(`
      ⚠️ SERVICE ROLE KEY NÃO CONFIGURADA!
      
      Para configurar:
      1. Vá ao Supabase Dashboard > Settings > API
      2. Copie a "service_role" key
      3. Crie um arquivo .env.local na raiz do projeto:
         VITE_SUPABASE_SERVICE_ROLE_KEY=sua_chave_aqui
      4. Ou configure diretamente neste arquivo (apenas para desenvolvimento)
      
      ⚠️ NUNCA commite a service role key no Git!
    `);
    return false;
  }
  
  // Verificar se a chave tem o formato correto
  if (!key.startsWith('eyJ')) {
    console.warn('⚠️ Service Role Key parece ter formato inválido');
    return false;
  }
  
  return true;
};

// Configurações de ambiente
export const ENV_CONFIG = {
  // Verificar se estamos em desenvolvimento
  IS_DEV: import.meta.env.DEV,
  
  // Verificar se estamos em produção
  IS_PROD: import.meta.env.PROD,
  
  // Verificar se a service role key está disponível
  HAS_SERVICE_ROLE: validateServiceRoleKey()
};

// Mensagens de erro padronizadas
export const ERROR_MESSAGES = {
  SERVICE_ROLE_NOT_CONFIGURED: "Service Role Key não configurada. Veja as instruções no console.",
  SERVICE_ROLE_NOT_AVAILABLE: "Service Role Key não disponível neste ambiente.",
  INVALID_OPERATION: "Operação inválida para este ambiente."
};

// Configurações de segurança
export const SECURITY_CONFIG = {
  // Permitir operações administrativas apenas em desenvolvimento
  ALLOW_ADMIN_OPERATIONS: ENV_CONFIG.IS_DEV && ENV_CONFIG.HAS_SERVICE_ROLE,
  
  // Mensagem de aviso para produção
  PRODUCTION_WARNING: ENV_CONFIG.IS_PROD ? 
    "⚠️ Operações administrativas não são permitidas em produção!" : null
}; 