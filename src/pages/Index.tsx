
import React from 'react';
import { useAuthStore } from '../store/authStore';
import { LoginForm } from '../components/LoginForm';
import { Layout } from '../components/Layout';
import { Dashboard } from '../components/Dashboard';
import { PublicLanding } from '../components/PublicLanding';

const Index = () => {
  const { isAuthenticated, user } = useAuthStore();

  // Se não está autenticado, mostra página pública com opção de agendar
  if (!isAuthenticated) {
    return <PublicLanding />;
  }

  // Se está autenticado, mostra dashboard para profissionais
  return (
    <Layout>
      <Dashboard />
    </Layout>
  );
};

export default Index;
