
// Configuração do Supabase
export const SUPABASE_CONFIG = {
  URL: 'https://snnfsakkoauungkprbkr.supabase.co',
  ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNubmZzYWtrb2F1dW5na3ByYmtyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA5NDQ3MDEsImV4cCI6MjA2NjUyMDcwMX0.FkOYvb7d8XX8aiieHbJhmAH3S2aYTQIk-PjnUBvve1I',
  SERVICE_ROLE_KEY: import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || ''
};

export const SECURITY_CONFIG = {
  ALLOW_ADMIN_OPERATIONS: !!SUPABASE_CONFIG.SERVICE_ROLE_KEY,
  PRODUCTION_WARNING: !SUPABASE_CONFIG.SERVICE_ROLE_KEY ? 
    'Service Role Key não configurada. Operações administrativas desabilitadas.' : null
};

export const ERROR_MESSAGES = {
  SERVICE_ROLE_NOT_CONFIGURED: 'Service Role Key não configurada para operações administrativas'
};
