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

    // 3. Se for barbeiro ou admin, insere na tabela barbers
    if (userData.role === 'barber' || userData.role === 'admin') {
      const { error: barberError } = await supabaseAdmin
        .from('barbers')
        .insert([{
          id: authData.user.id,
          name: userData.name,
          email: userData.email,
          phone: userData.phone
        }]);
      if (barberError) {
        // Não impede o cadastro, mas loga o erro
        console.warn('Erro ao inserir na tabela barbers:', barberError);
      }
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

// Função para atualizar o papel do usuário e sincronizar a tabela barbers
export const updateUserRoleAndSyncBarbers = async (userId: string, newRole: string, name: string, email: string, phone: string) => {
  try {
    // Atualiza o papel na tabela users
    const { error: userError } = await supabaseAdmin
      .from('users')
      .update({ role: newRole, name, email, phone })
      .eq('id', userId);
    if (userError) throw userError;

    if (newRole === 'barber' || newRole === 'admin') {
      // Garante que está na tabela barbers
      const { error: upsertError } = await supabaseAdmin
        .from('barbers')
        .upsert({ id: userId, name, email, phone });
      if (upsertError) throw upsertError;
    } else {
      // Remove da tabela barbers se não for mais barbeiro nem admin
      const { error: deleteError } = await supabaseAdmin
        .from('barbers')
        .delete()
        .eq('id', userId);
      if (deleteError) throw deleteError;
    }
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// Função para sincronizar barbeiros existentes
export const syncExistingBarbers = async () => {
  try {
    // Buscar todos os usuários que são barbeiros ou admins
    const { data: users, error: usersError } = await supabaseAdmin
      .from('users')
      .select('id, name, email, phone, role')
      .in('role', ['barber', 'admin']);

    if (usersError) throw usersError;

    if (!users || users.length === 0) {
      return { success: true, message: 'Nenhum barbeiro ou admin encontrado para sincronizar' };
    }

    // Inserir na tabela barbers usando upsert para evitar duplicatas
    const barbersData = users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone
    }));

    const { error: barbersError } = await supabaseAdmin
      .from('barbers')
      .upsert(barbersData, { onConflict: 'id' });

    if (barbersError) throw barbersError;

    return {
      success: true,
      message: `${barbersData.length} barbeiros/admins sincronizados com sucesso`
    };

  } catch (error: any) {
    return {
      success: false,
      error: error.message,
      message: 'Erro ao sincronizar barbeiros'
    };
  }
};
