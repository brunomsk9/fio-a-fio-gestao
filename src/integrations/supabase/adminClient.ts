// Cliente Supabase para operações administrativas
// ⚠️ ATENÇÃO: Este arquivo deve ser usado apenas no backend ou em operações seguras
// NUNCA exponha a service role key no frontend público

import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';
import { SUPABASE_CONFIG, SECURITY_CONFIG, ERROR_MESSAGES } from '../../config/supabase';

// Verificar se operações administrativas são permitidas
if (!SECURITY_CONFIG.ALLOW_ADMIN_OPERATIONS) {
  console.warn(`
    ⚠️ OPERAÇÕES ADMINISTRATIVAS NÃO PERMITIDAS!
    
    Motivo: ${SECURITY_CONFIG.PRODUCTION_WARNING || 'Service Role Key não configurada'}
    
    Para desenvolvimento:
    1. Configure a Service Role Key em src/config/supabase.ts
    2. Ou use variável de ambiente VITE_SUPABASE_SERVICE_ROLE_KEY
    
    Para produção:
    - Use um backend ou Supabase Edge Functions
    - NUNCA exponha a service role key no frontend
  `);
}

export const supabaseAdmin = createClient<Database>(
  SUPABASE_CONFIG.URL, 
  SUPABASE_CONFIG.SERVICE_ROLE_KEY,
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
  // Verificar se operações administrativas são permitidas
  if (!SECURITY_CONFIG.ALLOW_ADMIN_OPERATIONS) {
    return {
      success: false,
      error: SECURITY_CONFIG.PRODUCTION_WARNING || ERROR_MESSAGES.SERVICE_ROLE_NOT_CONFIGURED,
      message: "Operações administrativas não permitidas neste ambiente"
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
  // Verificar se operações administrativas são permitidas
  if (!SECURITY_CONFIG.ALLOW_ADMIN_OPERATIONS) {
    return {
      success: false,
      error: SECURITY_CONFIG.PRODUCTION_WARNING || ERROR_MESSAGES.SERVICE_ROLE_NOT_CONFIGURED,
      message: "Operações administrativas não permitidas neste ambiente"
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