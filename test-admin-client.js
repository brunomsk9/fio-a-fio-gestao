// Script de teste para verificar se o cliente administrativo está funcionando
// Execute com: node test-admin-client.js

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://snnfsakkoauungkprbkr.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNubmZzYWtrb2F1dW5na3ByYmtyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDk0NDcwMSwiZXhwIjoyMDY2NTIwNzAxfQ.kmBrJ_5kBySyvFIHizVO4IRxbqFQbDrNJmTKW6KOoq0";

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function testAdminClient() {
  console.log('🧪 Testando cliente administrativo...\n');

  try {
    // 1. Testar conexão básica
    console.log('1. Testando conexão básica...');
    const { data: testData, error: testError } = await supabaseAdmin
      .from('users')
      .select('count')
      .limit(1);
    
    if (testError) {
      console.error('❌ Erro na conexão:', testError);
      return;
    }
    console.log('✅ Conexão básica funcionando\n');

    // 2. Testar criação de usuário na autenticação
    console.log('2. Testando criação de usuário na autenticação...');
    const testEmail = `test-${Date.now()}@example.com`;
    
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: testEmail,
      password: 'test123456',
      email_confirm: true,
      user_metadata: {
        name: 'Usuário Teste',
        role: 'client'
      }
    });

    if (authError) {
      console.error('❌ Erro ao criar usuário na autenticação:', authError);
      return;
    }

    console.log('✅ Usuário criado na autenticação:', authData.user.id);

    // 3. Testar criação na tabela users
    console.log('3. Testando criação na tabela users...');
    const { error: userError } = await supabaseAdmin
      .from('users')
      .insert([{
        id: authData.user.id,
        name: 'Usuário Teste',
        email: testEmail,
        phone: '11999999999',
        role: 'client',
        barbershop_id: null
      }]);

    if (userError) {
      console.error('❌ Erro ao criar na tabela users:', userError);
      // Limpar usuário da autenticação
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      return;
    }

    console.log('✅ Usuário criado na tabela users\n');

    // 4. Verificar se o usuário foi criado corretamente
    console.log('4. Verificando usuário criado...');
    const { data: userData, error: fetchError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (fetchError) {
      console.error('❌ Erro ao buscar usuário:', fetchError);
    } else {
      console.log('✅ Usuário encontrado:', userData);
    }

    // 5. Testar exclusão completa
    console.log('5. Testando exclusão completa...');
    
    // Deletar da tabela
    const { error: deleteUserError } = await supabaseAdmin
      .from('users')
      .delete()
      .eq('id', authData.user.id);

    if (deleteUserError) {
      console.error('❌ Erro ao deletar da tabela:', deleteUserError);
    } else {
      console.log('✅ Usuário deletado da tabela');
    }

    // Deletar da autenticação
    const { error: deleteAuthError } = await supabaseAdmin.auth.admin.deleteUser(authData.user.id);

    if (deleteAuthError) {
      console.error('❌ Erro ao deletar da autenticação:', deleteAuthError);
    } else {
      console.log('✅ Usuário deletado da autenticação');
    }

    console.log('\n🎉 Todos os testes passaram! O cliente administrativo está funcionando corretamente.');

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

// Executar teste
testAdminClient(); 