
import React from 'react';
import { useAuthStore } from '../store/authStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Calendar, Users, Scissors, TrendingUp, Clock, Star } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { user } = useAuthStore();

  const getDashboardContent = () => {
    switch (user?.role) {
      case 'super-admin':
        return <SuperAdminDashboard />;
      case 'admin':
        return <AdminDashboard />;
      case 'barber':
        return <BarberDashboard />;
      case 'client':
        return <ClientDashboard />;
      default:
        return <div>Carregando dashboard...</div>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">
          Bem-vindo, {user?.name}!
        </h1>
        <p className="text-gray-400">
          Aqui está um resumo das suas atividades hoje.
        </p>
      </div>
      {getDashboardContent()}
    </div>
  );
};

const SuperAdminDashboard: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border-blue-500/30">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-white">Total de Barbearias</CardTitle>
          <Users className="h-4 w-4 text-blue-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">12</div>
          <p className="text-xs text-blue-400">+2 este mês</p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-green-500/20 to-green-600/20 border-green-500/30">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-white">Receita Total</CardTitle>
          <TrendingUp className="h-4 w-4 text-green-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">R$ 45.231</div>
          <p className="text-xs text-green-400">+20.1% do último mês</p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border-purple-500/30">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-white">Barbeiros Ativos</CardTitle>
          <Scissors className="h-4 w-4 text-purple-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">89</div>
          <p className="text-xs text-purple-400">+5 esta semana</p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-amber-500/20 to-amber-600/20 border-amber-500/30">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-white">Agendamentos Hoje</CardTitle>
          <Calendar className="h-4 w-4 text-amber-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">573</div>
          <p className="text-xs text-amber-400">Em todas as unidades</p>
        </CardContent>
      </Card>
    </div>
  );
};

const AdminDashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-amber-500/20 to-amber-600/20 border-amber-500/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Agendamentos Hoje</CardTitle>
            <Calendar className="h-4 w-4 text-amber-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">23</div>
            <p className="text-xs text-amber-400">+3 que ontem</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/20 to-green-600/20 border-green-500/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Receita Hoje</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">R$ 1.840</div>
            <p className="text-xs text-green-400">Meta: R$ 2.000</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border-blue-500/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Barbeiros Ativos</CardTitle>
            <Users className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">8</div>
            <p className="text-xs text-blue-400">Todos disponíveis</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border-purple-500/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Avaliação Média</CardTitle>
            <Star className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">4.8</div>
            <p className="text-xs text-purple-400">⭐⭐⭐⭐⭐</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-slate-800/50 backdrop-blur-sm border-amber-500/20">
        <CardHeader>
          <CardTitle className="text-white">Próximos Agendamentos</CardTitle>
          <CardDescription className="text-gray-400">Agendamentos das próximas horas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { time: '14:00', client: 'João Silva', barber: 'Carlos', service: 'Corte + Barba' },
              { time: '14:30', client: 'Pedro Santos', barber: 'Miguel', service: 'Corte Simples' },
              { time: '15:00', client: 'Lucas Oliveira', barber: 'Carlos', service: 'Barba' },
            ].map((booking, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="text-amber-400 border-amber-500/50">
                    {booking.time}
                  </Badge>
                  <div>
                    <p className="text-white font-medium">{booking.client}</p>
                    <p className="text-sm text-gray-400">{booking.service}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-400">com {booking.barber}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const BarberDashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-amber-500/20 to-amber-600/20 border-amber-500/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Agendamentos Hoje</CardTitle>
            <Calendar className="h-4 w-4 text-amber-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">7</div>
            <p className="text-xs text-amber-400">Próximo às 14:00</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/20 to-green-600/20 border-green-500/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Ganhos Hoje</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">R$ 280</div>
            <p className="text-xs text-green-400">Meta: R$ 400</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border-purple-500/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Avaliação</CardTitle>
            <Star className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">4.9</div>
            <p className="text-xs text-purple-400">⭐⭐⭐⭐⭐</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-slate-800/50 backdrop-blur-sm border-amber-500/20">
        <CardHeader>
          <CardTitle className="text-white">Minha Agenda de Hoje</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { time: '14:00', client: 'João Silva', service: 'Corte + Barba', phone: '(11) 99999-1111' },
              { time: '15:00', client: 'Pedro Santos', service: 'Corte Simples', phone: '(11) 99999-2222' },
              { time: '16:30', client: 'Lucas Oliveira', service: 'Barba', phone: '(11) 99999-3333' },
            ].map((booking, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                <div className="flex items-center gap-4">
                  <Clock className="h-5 w-5 text-amber-400" />
                  <div>
                    <p className="text-white font-medium">{booking.time} - {booking.client}</p>
                    <p className="text-sm text-gray-400">{booking.service}</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-green-400 border-green-500/50">
                  Agendado
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const ClientDashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-gradient-to-br from-amber-500/20 to-amber-600/20 border-amber-500/30">
          <CardHeader>
            <CardTitle className="text-white">Próximo Agendamento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-2xl font-bold text-white">Hoje, 15:30</p>
              <p className="text-amber-400">Corte + Barba com Carlos</p>
              <p className="text-sm text-gray-400">Barbearia Central</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border-blue-500/30">
          <CardHeader>
            <CardTitle className="text-white">Histórico</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-2xl font-bold text-white">12</p>
              <p className="text-blue-400">Cortes realizados</p>
              <p className="text-sm text-gray-400">Último: há 2 semanas</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-slate-800/50 backdrop-blur-sm border-amber-500/20">
        <CardHeader>
          <CardTitle className="text-white">Agendar Novo Corte</CardTitle>
          <CardDescription className="text-gray-400">
            Escolha sua barbearia favorita e agende seu próximo corte
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { name: 'Barbearia Central', rating: 4.8, nextSlot: 'Hoje, 16:00' },
              { name: 'BarberShop Premium', rating: 4.9, nextSlot: 'Amanhã, 09:00' },
            ].map((shop, index) => (
              <div key={index} className="p-4 bg-slate-700/30 rounded-lg">
                <h3 className="text-white font-medium">{shop.name}</h3>
                <p className="text-sm text-amber-400">⭐ {shop.rating}</p>
                <p className="text-sm text-gray-400 mt-2">Próximo horário: {shop.nextSlot}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
