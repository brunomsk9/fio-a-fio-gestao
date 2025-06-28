
import { create } from 'zustand';
import { supabase } from '../integrations/supabase/client';
import { User } from '../types';

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User) => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  
  login: async (email: string, password: string) => {
    try {
      // 1. Fazer login no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        throw new Error(authError.message);
      }

      if (!authData.user) {
        throw new Error('Usuário não encontrado');
      }

      // 2. Buscar dados do usuário na tabela users
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (userError) {
        console.error('Erro ao buscar dados do usuário:', userError);
        throw new Error('Erro ao carregar dados do usuário');
      }

      if (!userData) {
        throw new Error('Usuário não encontrado no sistema');
      }

      // 3. Transformar dados do banco para o tipo User
      const user: User = {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        role: userData.role as any,
        barbershopId: userData.barbershop_id || undefined,
      };

      // Se for admin, buscar as barbearias que ele é responsável
      if (userData.role === 'admin') {
        try {
          const { data: adminBarbershops, error: barbershopError } = await supabase
            .from('barbershops')
            .select('id, name, address, phone, admin_id, created_at')
            .eq('admin_id', userData.id);

          if (!barbershopError && adminBarbershops) {
            user.barbershops = adminBarbershops.map(shop => ({
              id: shop.id,
              name: shop.name,
              address: shop.address,
              phone: shop.phone,
              adminId: shop.admin_id,
              services: [],
              barbers: [],
              createdAt: new Date(shop.created_at)
            }));
          }
        } catch (error) {
          console.error('Erro ao buscar barbearias do admin:', error);
        }
      }

      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      console.error('Erro no login:', error);
      throw error;
    }
  },

  logout: async () => {
    try {
      await supabase.auth.signOut();
      set({ user: null, isAuthenticated: false, isLoading: false });
    } catch (error) {
      console.error('Erro no logout:', error);
      // Mesmo com erro, limpar o estado local
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  setUser: (user: User) => {
    set({ user, isAuthenticated: true, isLoading: false });
  },

  checkAuth: async () => {
    try {
      set({ isLoading: true });
      
      // Verificar se há uma sessão ativa
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Erro ao verificar sessão:', error);
        set({ user: null, isAuthenticated: false, isLoading: false });
        return;
      }

      if (!session?.user) {
        set({ user: null, isAuthenticated: false, isLoading: false });
        return;
      }

      // Buscar dados do usuário na tabela users
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (userError || !userData) {
        console.error('Erro ao buscar dados do usuário:', userError);
        set({ user: null, isAuthenticated: false, isLoading: false });
        return;
      }

      // Transformar dados do banco para o tipo User
      const user: User = {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        role: userData.role as any,
        barbershopId: userData.barbershop_id || undefined,
      };

      // Se for admin, buscar as barbearias que ele é responsável
      if (userData.role === 'admin') {
        try {
          const { data: adminBarbershops, error: barbershopError } = await supabase
            .from('barbershops')
            .select('id, name, address, phone, admin_id, created_at')
            .eq('admin_id', userData.id);

          if (!barbershopError && adminBarbershops) {
            user.barbershops = adminBarbershops.map(shop => ({
              id: shop.id,
              name: shop.name,
              address: shop.address,
              phone: shop.phone,
              adminId: shop.admin_id,
              services: [],
              barbers: [],
              createdAt: new Date(shop.created_at)
            }));
          }
        } catch (error) {
          console.error('Erro ao buscar barbearias do admin:', error);
        }
      }

      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error);
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },
}));
