
import { create } from 'zustand';
import { User } from '../types';

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
}

// Mock users for demonstration
const mockUsers: User[] = [
  {
    id: '1',
    name: 'Super Admin',
    email: 'super@barberpro.com',
    phone: '(11) 99999-9999',
    role: 'super-admin'
  },
  {
    id: '2',
    name: 'Admin Barbearia',
    email: 'admin@barberpro.com',
    phone: '(11) 99999-9998',
    role: 'admin',
    barbershopId: '1'
  },
  {
    id: '3',
    name: 'João Barbeiro',
    email: 'joao@barberpro.com',
    phone: '(11) 99999-9997',
    role: 'barber',
    barbershopId: '1'
  },
  {
    id: '4',
    name: 'Cliente Teste',
    email: 'cliente@barberpro.com',
    phone: '(11) 99999-9996',
    role: 'client'
  }
];

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isAuthenticated: false,
  login: async (email: string, password: string) => {
    // Mock authentication - in real app, this would call an API
    const user = mockUsers.find(u => u.email === email);
    if (user) {
      set({ user, isAuthenticated: true });
    } else {
      throw new Error('Credenciais inválidas');
    }
  },
  logout: () => {
    set({ user: null, isAuthenticated: false });
  },
  setUser: (user: User) => {
    set({ user, isAuthenticated: true });
  }
}));
