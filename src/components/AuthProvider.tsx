import React, { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const { checkAuth, isLoading } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl mb-4 animate-pulse">
            <div className="w-8 h-8 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <h2 className="text-xl font-semibold text-white">Carregando...</h2>
          <p className="text-gray-400">Verificando autenticação</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}; 