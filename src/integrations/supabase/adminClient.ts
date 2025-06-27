// Cliente Supabase para operações administrativas
// ⚠️ ATENÇÃO: Este arquivo deve ser usado apenas no backend ou em operações seguras
// NUNCA exponha a service role key no frontend público

import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://snnfsakkoauungkprbkr.supabase.co";

// ⚠️ IMPORTANTE: Configure sua Service Role Key
// Opção 1: Variável de ambiente (recomendado)
const SUPABASE_SERVICE_ROLE_KEY = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNubmZzYWtrb2F1dW5na3ByYmtyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDk0NDcwMSwiZXhwIjoyMDY2NTIwNzAxfQ.kmBrJ_5kBySyvFIHizVO4IRxbqFQbDrNJmTKW6KOoq0";

// Opção 2: Configuração direta (apenas para desenvolvimento)
// Substitua a linha acima por:
// const SUPABASE_SERVICE_ROLE_KEY = "sua_service_role_key_real_aqui";

// Verificação de segurança
if (!SUPABASE_SERVICE_ROLE_KEY || SUPABASE_SERVICE_ROLE_KEY === "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNubmZzYWtrb2F1dW5na3ByYmtyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDk0NDcwMSwiZXhwIjoyMDY2NTIwNzAxfQ.kmBrJ_5kBySyvFIHizVO4IRxbqFQbDrNJmTKW6KOoq0") {
  console.warn(`
    ⚠️ SERVICE ROLE KEY NÃO CONFIGURADA!
    
    Para configurar:
    1. Vá ao Supabase Dashboard > Settings > API
    2. Copie a "service_role" key
    3. Crie um arquivo .env.local na raiz do projeto:
       VITE_SUPABASE_SERVICE_ROLE_KEY=sua_chave_aqui
    4. Ou substitua diretamente neste arquivo (apenas para desenvolvimento)
    
    ⚠️ NUNCA commite a service role key no Git!
  `);
}

export const supabaseAdmin = createClient<Database>(
  SUPABASE_URL, 
  SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Função para criar usuário completo (autenticação + tabela)
export const createUserWithAuth = async (userData: {
  email: string;
  password: string;
  name: string;
  phone: string;
  role: 'super-admin' | 'admin' | 'barber' | 'client';
  barbershopId?: string;
}) => {
  // Verificar se a service role key está configurada
  if (!SUPABASE_SERVICE_ROLE_KEY || SUPABASE_SERVICE_ROLE_KEY === "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNubmZzYWtrb2F1dW5na3ByYmtyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDk0NDcwMSwiZXhwIjoyMDY2NTIwNzAxfQ.kmBrJ_5kBySyvFIHizVO4IRxbqFQbDrNJmTKW6KOoq0") {
    return {
      success: false,
      error: "Service Role Key não configurada. Veja as instruções no console.",
      message: "Configure a Service Role Key para criar usuários automaticamente"
    };
  }

  try {
    // 1. Criar usuário na autenticação
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: userData.email,
      password: userData.password,
      email_confirm: true,
      user_metadata: {
        name: userData.name,
        role: userData.role
      }
    });

    if (authError) throw authError;

    if (!authData.user) {
      throw new Error('Erro ao criar usuário na autenticação');
    }

    // 2. Criar registro na tabela users
    const { error: userError } = await supabaseAdmin
      .from('users')
      .insert([{
        id: authData.user.id,
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        role: userData.role,
        barbershop_id: userData.barbershopId || null
      }]);

    if (userError) {
      // Se falhar ao criar na tabela, deletar da autenticação
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      throw userError;
    }

    return {
      success: true,
      user: authData.user,
      message: 'Usuário criado com sucesso na autenticação e tabela'
    };

  } catch (error: any) {
    return {
      success: false,
      error: error.message,
      message: 'Erro ao criar usuário'
    };
  }
};

// Função para deletar usuário completo
export const deleteUserWithAuth = async (userId: string) => {
  // Verificar se a service role key está configurada
  if (!SUPABASE_SERVICE_ROLE_KEY || SUPABASE_SERVICE_ROLE_KEY === "SUA_SERVICE_ROLE_KEY_AQUI") {
    return {
      success: false,
      error: "Service Role Key não configurada. Veja as instruções no console.",
      message: "Configure a Service Role Key para deletar usuários automaticamente"
    };
  }

  try {
    // 1. Deletar da tabela users
    const { error: userError } = await supabaseAdmin
      .from('users')
      .delete()
      .eq('id', userId);

    if (userError) throw userError;

    // 2. Deletar da autenticação
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (authError) {
      console.warn('Usuário deletado da tabela mas não da autenticação:', authError);
    }

    return {
      success: true,
      message: 'Usuário deletado com sucesso'
    };

  } catch (error: any) {
    return {
      success: false,
      error: error.message,
      message: 'Erro ao deletar usuário'
    };
  }
}; 