import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { toast } from './ui/use-toast';
import { supabase } from '../integrations/supabase/client';
import { createUserWithAuth } from '../integrations/supabase/adminClient';
import { 
  Calendar, 
  Users, 
  Scissors, 
  TrendingUp, 
  Clock, 
  Star, 
  Plus, 
  UserPlus,
  DollarSign,
  Target,
  Activity,
  Award,
  Zap,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  BarChart3,
  PieChart,
  LineChart
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { user } = useAuthStore();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

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
    <div className={`space-y-8 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
      <div className="space-y-4">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Scissors className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-gray-900">
              Bem-vindo, {user?.name}! 👋
            </h1>
            <p className="text-lg text-gray-600">
              Aqui está um resumo das suas atividades hoje.
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Badge className="bg-green-100 text-green-700 border-green-200 px-3 py-1">
            <CheckCircle className="h-3 w-3 mr-1" />
            Sistema Online
          </Badge>
          <Badge className="bg-blue-100 text-blue-700 border-blue-200 px-3 py-1">
            <Activity className="h-3 w-3 mr-1" />
            Atualizado em tempo real
          </Badge>
        </div>
      </div>
      
      {getDashboardContent()}
    </div>
  );
};

const SuperAdminDashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalBarbershops: 0,
    totalUsers: 0,
    totalBarbers: 0,
    totalBookings: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      
      // Buscar estatísticas
      const [barbershopsResult, usersResult, barbersResult, bookingsResult] = await Promise.all([
        supabase.from('barbershops').select('*', { count: 'exact' }),
        supabase.from('users').select('*', { count: 'exact' }),
        supabase.from('users').select('*', { count: 'exact' }).eq('role', 'barber'),
        supabase.from('bookings').select('*', { count: 'exact' })
      ]);

      setStats({
        totalBarbershops: barbershopsResult.count || 0,
        totalUsers: usersResult.count || 0,
        totalBarbers: barbersResult.count || 0,
        totalBookings: bookingsResult.count || 0
      });
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total de Barbearias',
      value: stats.totalBarbershops,
      icon: Users,
      color: 'from-blue-500 to-indigo-600',
      bgColor: 'from-blue-50 to-indigo-50',
      description: 'Barbearias cadastradas'
    },
    {
      title: 'Total de Usuários',
      value: stats.totalUsers,
      icon: Users,
      color: 'from-green-500 to-emerald-600',
      bgColor: 'from-green-50 to-emerald-50',
      description: 'Usuários no sistema'
    },
    {
      title: 'Barbeiros Ativos',
      value: stats.totalBarbers,
      icon: Scissors,
      color: 'from-purple-500 to-pink-600',
      bgColor: 'from-purple-50 to-pink-50',
      description: 'Barbeiros cadastrados'
    },
    {
      title: 'Total de Agendamentos',
      value: stats.totalBookings,
      icon: Calendar,
      color: 'from-orange-500 to-red-600',
      bgColor: 'from-orange-50 to-red-50',
      description: 'Agendamentos realizados'
    }
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <Card key={index} className={`border-0 shadow-xl hover:shadow-2xl transition-all duration-500 bg-gradient-to-br ${stat.bgColor} hover:scale-105 group`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-sm font-semibold text-gray-700">{stat.title}</CardTitle>
              <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-gray-900 mb-2">
                {isLoading ? '...' : stat.value.toLocaleString()}
              </div>
              <p className="text-sm text-gray-600 font-medium">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-gray-900">Visão Geral do Sistema</CardTitle>
                <CardDescription className="text-gray-600">Estatísticas em tempo real</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Users className="h-4 w-4 text-blue-600" />
                  </div>
                  <span className="font-medium text-gray-700">Barbearias Ativas</span>
                </div>
                <Badge className="bg-blue-100 text-blue-700">{stats.totalBarbershops}</Badge>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <Scissors className="h-4 w-4 text-green-600" />
                  </div>
                  <span className="font-medium text-gray-700">Barbeiros Cadastrados</span>
                </div>
                <Badge className="bg-green-100 text-green-700">{stats.totalBarbers}</Badge>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Calendar className="h-4 w-4 text-purple-600" />
                  </div>
                  <span className="font-medium text-gray-700">Agendamentos Totais</span>
                </div>
                <Badge className="bg-purple-100 text-purple-700">{stats.totalBookings}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl bg-gradient-to-br from-green-50 to-emerald-50">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                <Target className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-gray-900">Ações Rápidas</CardTitle>
                <CardDescription className="text-gray-600">Gerenciamento do sistema</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group">
                <Users className="h-5 w-5 mr-3 group-hover:scale-110 transition-transform" />
                Gerenciar Barbearias
                <ArrowRight className="h-5 w-5 ml-3 group-hover:translate-x-1 transition-transform" />
              </Button>
              
              <Button variant="outline" className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold py-6 rounded-xl">
                <Scissors className="h-5 w-5 mr-3" />
                Gerenciar Barbeiros
                <ArrowRight className="h-5 w-5 ml-3" />
              </Button>
              
              <Button variant="outline" className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold py-6 rounded-xl">
                <BarChart3 className="h-5 w-5 mr-3" />
                Ver Relatórios
                <ArrowRight className="h-5 w-5 ml-3" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const AdminDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const [stats, setStats] = useState({
    todayBookings: 0,
    todayRevenue: 0,
    totalBarbers: 0,
    averageRating: 0
  });
  const [upcomingBookings, setUpcomingBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isNewBarberDialogOpen, setIsNewBarberDialogOpen] = useState(false);
  const [barberFormData, setBarberFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    specialties: ''
  });

  useEffect(() => {
    if (user?.barbershopId) {
      fetchAdminStats();
    }
  }, [user]);

  const fetchAdminStats = async () => {
    try {
      setIsLoading(true);
      
      // Buscar estatísticas da barbearia
      const today = new Date().toISOString().split('T')[0];
      
      const [bookingsResult, barbersResult] = await Promise.all([
        supabase
          .from('bookings')
          .select('*', { count: 'exact' })
          .eq('barbershop_id', user?.barbershopId)
          .gte('date', today),
        supabase
          .from('users')
          .select('*', { count: 'exact' })
          .eq('role', 'barber')
          .eq('barbershop_id', user?.barbershopId)
      ]);

      // Buscar próximos agendamentos
      const { data: upcomingData, error: upcomingError } = await supabase
        .from('bookings')
        .select(`
          *,
          barbers:barbers!bookings_barber_id_fkey(name),
          services:services!bookings_service_id_fkey(name)
        `)
        .eq('barbershop_id', user?.barbershopId)
        .gte('date', today)
        .order('date', { ascending: true })
        .limit(5);

      setUpcomingBookings(upcomingData || []);

      setStats({
        todayBookings: bookingsResult.count || 0,
        todayRevenue: (bookingsResult.count || 0) * 35, // Valor médio por agendamento
        totalBarbers: barbersResult.count || 0,
        averageRating: 4.8
      });
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateBarber = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { data, error } = await createUserWithAuth({
        email: barberFormData.email,
        password: barberFormData.password,
        user_metadata: {
          name: barberFormData.name,
          phone: barberFormData.phone,
          role: 'barber',
          barbershop_id: user?.barbershopId,
          specialties: barberFormData.specialties
        }
      });

      if (error) throw error;

      toast({
        title: "Barbeiro criado com sucesso!",
        description: "O novo barbeiro foi adicionado à sua barbearia.",
      });

      setBarberFormData({
        name: '',
        email: '',
        phone: '',
        password: '',
        specialties: ''
      });
      setIsNewBarberDialogOpen(false);
      fetchAdminStats();
    } catch (error) {
      console.error('Erro ao criar barbeiro:', error);
      toast({
        title: "Erro ao criar barbeiro",
        description: "Tente novamente mais tarde.",
        variant: "destructive"
      });
    }
  };

  const statCards = [
    {
      title: 'Agendamentos Hoje',
      value: stats.todayBookings,
      icon: Calendar,
      color: 'from-blue-500 to-indigo-600',
      bgColor: 'from-blue-50 to-indigo-50',
      description: 'Agendamentos do dia'
    },
    {
      title: 'Receita Hoje',
      value: `R$ ${stats.todayRevenue.toFixed(2)}`,
      icon: DollarSign,
      color: 'from-green-500 to-emerald-600',
      bgColor: 'from-green-50 to-emerald-50',
      description: 'Receita do dia'
    },
    {
      title: 'Barbeiros Ativos',
      value: stats.totalBarbers,
      icon: Users,
      color: 'from-purple-500 to-pink-600',
      bgColor: 'from-purple-50 to-pink-50',
      description: 'Barbeiros na equipe'
    },
    {
      title: 'Avaliação Média',
      value: stats.averageRating,
      icon: Star,
      color: 'from-orange-500 to-red-600',
      bgColor: 'from-orange-50 to-red-50',
      description: 'Satisfação dos clientes'
    }
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <Card key={index} className={`border-0 shadow-xl hover:shadow-2xl transition-all duration-500 bg-gradient-to-br ${stat.bgColor} hover:scale-105 group`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-sm font-semibold text-gray-700">{stat.title}</CardTitle>
              <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-gray-900 mb-2">
                {isLoading ? '...' : stat.value}
              </div>
              <p className="text-sm text-gray-600 font-medium">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-gray-900">Próximos Agendamentos</CardTitle>
                  <CardDescription className="text-gray-600">Agendamentos de hoje</CardDescription>
                </div>
              </div>
              <Button variant="outline" size="sm" className="border-blue-200 text-blue-600 hover:bg-blue-50">
                Ver Todos
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {upcomingBookings.length > 0 ? (
              <div className="space-y-4">
                {upcomingBookings.map((booking, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                        <Users className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{booking.barbers?.name}</p>
                        <p className="text-sm text-gray-600">com {booking.services?.name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">{booking.time}</p>
                      <p className="text-sm text-gray-600">{booking.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Nenhum agendamento próximo</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl bg-gradient-to-br from-green-50 to-emerald-50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                  <UserPlus className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-gray-900">Gerenciar Equipe</CardTitle>
                  <CardDescription className="text-gray-600">Adicionar novos barbeiros</CardDescription>
                </div>
              </div>
              <Dialog open={isNewBarberDialogOpen} onOpenChange={setIsNewBarberDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Barbeiro
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-hidden flex flex-col">
                  <DialogHeader className="flex-shrink-0">
                    <DialogTitle>Adicionar Novo Barbeiro</DialogTitle>
                  </DialogHeader>
                  
                  <div className="flex-1 overflow-y-auto pr-2">
                    <form onSubmit={handleCreateBarber} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Nome</Label>
                        <Input
                          id="name"
                          value={barberFormData.name}
                          onChange={(e) => setBarberFormData({...barberFormData, name: e.target.value})}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={barberFormData.email}
                          onChange={(e) => setBarberFormData({...barberFormData, email: e.target.value})}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Telefone</Label>
                        <Input
                          id="phone"
                          value={barberFormData.phone}
                          onChange={(e) => setBarberFormData({...barberFormData, phone: e.target.value})}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="password">Senha</Label>
                        <Input
                          id="password"
                          type="password"
                          value={barberFormData.password}
                          onChange={(e) => setBarberFormData({...barberFormData, password: e.target.value})}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="specialties">Especialidades</Label>
                        <Input
                          id="specialties"
                          value={barberFormData.specialties}
                          onChange={(e) => setBarberFormData({...barberFormData, specialties: e.target.value})}
                          placeholder="Ex: Corte masculino, Barba, Degradê"
                        />
                      </div>
                    </form>
                  </div>
                  
                  {/* Botões fixos na parte inferior */}
                  <div className="flex justify-end space-x-2 pt-4 border-t border-gray-200 flex-shrink-0">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsNewBarberDialogOpen(false);
                        setBarberFormData({ name: '', email: '', phone: '', password: '', specialties: '' });
                      }}
                    >
                      Cancelar
                    </Button>
                    <Button 
                      type="submit"
                      onClick={(e) => {
                        e.preventDefault();
                        handleCreateBarber(e as any);
                      }}
                      className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                    >
                      Criar Barbeiro
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group">
                <Users className="h-5 w-5 mr-3 group-hover:scale-110 transition-transform" />
                Ver Equipe Completa
                <ArrowRight className="h-5 w-5 ml-3 group-hover:translate-x-1 transition-transform" />
              </Button>
              
              <Button variant="outline" className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold py-6 rounded-xl">
                <BarChart3 className="h-5 w-5 mr-3" />
                Relatórios de Vendas
                <ArrowRight className="h-5 w-5 ml-3" />
              </Button>
              
              <Button variant="outline" className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold py-6 rounded-xl">
                <Clock className="h-5 w-5 mr-3" />
                Horários de Funcionamento
                <ArrowRight className="h-5 w-5 ml-3" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const BarberDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const [stats, setStats] = useState({
    todayBookings: 0,
    todayRevenue: 0,
    averageRating: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchBarberStats();
    }
  }, [user]);

  const fetchBarberStats = async () => {
    try {
      setIsLoading(true);
      
      const today = new Date().toISOString().split('T')[0];
      
      const { count: todayBookings } = await supabase
        .from('bookings')
        .select('*', { count: 'exact' })
        .eq('barber_id', user?.id)
        .eq('date', today);

      setStats({
        todayBookings: todayBookings || 0,
        todayRevenue: (todayBookings || 0) * 35, // Valor médio por agendamento
        averageRating: 4.8 // Placeholder
      });
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Agendamentos Hoje',
      value: stats.todayBookings,
      icon: Calendar,
      color: 'from-blue-500 to-indigo-600',
      bgColor: 'from-blue-50 to-indigo-50',
      description: 'Agendamentos do dia'
    },
    {
      title: 'Receita Hoje',
      value: `R$ ${stats.todayRevenue.toFixed(2)}`,
      icon: DollarSign,
      color: 'from-green-500 to-emerald-600',
      bgColor: 'from-green-50 to-emerald-50',
      description: 'Receita do dia'
    },
    {
      title: 'Avaliação Média',
      value: stats.averageRating,
      icon: Star,
      color: 'from-purple-500 to-pink-600',
      bgColor: 'from-purple-50 to-pink-50',
      description: 'Satisfação dos clientes'
    }
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((stat, index) => (
          <Card key={index} className={`border-0 shadow-xl hover:shadow-2xl transition-all duration-500 bg-gradient-to-br ${stat.bgColor} hover:scale-105 group`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-sm font-semibold text-gray-700">{stat.title}</CardTitle>
              <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-gray-900 mb-2">
                {isLoading ? '...' : stat.value}
              </div>
              <p className="text-sm text-gray-600 font-medium">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <Calendar className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-gray-900">Meus Próximos Agendamentos</CardTitle>
                <CardDescription className="text-gray-600">Seus agendamentos de hoje</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Nenhum agendamento próximo</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl bg-gradient-to-br from-green-50 to-emerald-50">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                <Target className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-gray-900">Ações Rápidas</CardTitle>
                <CardDescription className="text-gray-600">Gerenciar sua agenda</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group">
                <Calendar className="h-5 w-5 mr-3 group-hover:scale-110 transition-transform" />
                Ver Minha Agenda
                <ArrowRight className="h-5 w-5 ml-3 group-hover:translate-x-1 transition-transform" />
              </Button>
              
              <Button variant="outline" className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold py-6 rounded-xl">
                <Clock className="h-5 w-5 mr-3" />
                Meus Horários
                <ArrowRight className="h-5 w-5 ml-3" />
              </Button>
              
              <Button variant="outline" className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold py-6 rounded-xl">
                <BarChart3 className="h-5 w-5 mr-3" />
                Meus Relatórios
                <ArrowRight className="h-5 w-5 ml-3" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const ClientDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const [stats, setStats] = useState({
    totalBookings: 0,
    upcomingBookings: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchClientStats();
    }
  }, [user]);

  const fetchClientStats = async () => {
    try {
      setIsLoading(true);
      
      const today = new Date().toISOString().split('T')[0];
      
      const [totalResult, upcomingResult] = await Promise.all([
        supabase
          .from('bookings')
          .select('*', { count: 'exact' })
          .eq('client_id', user?.id),
        supabase
          .from('bookings')
          .select('*', { count: 'exact' })
          .eq('client_id', user?.id)
          .gte('date', today)
      ]);

      setStats({
        totalBookings: totalResult.count || 0,
        upcomingBookings: upcomingResult.count || 0
      });
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total de Agendamentos',
      value: stats.totalBookings,
      icon: Calendar,
      color: 'from-blue-500 to-indigo-600',
      bgColor: 'from-blue-50 to-indigo-50',
      description: 'Agendamentos realizados'
    },
    {
      title: 'Próximos Agendamentos',
      value: stats.upcomingBookings,
      icon: Clock,
      color: 'from-green-500 to-emerald-600',
      bgColor: 'from-green-50 to-emerald-50',
      description: 'Agendamentos futuros'
    }
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {statCards.map((stat, index) => (
          <Card key={index} className={`border-0 shadow-xl hover:shadow-2xl transition-all duration-500 bg-gradient-to-br ${stat.bgColor} hover:scale-105 group`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-sm font-semibold text-gray-700">{stat.title}</CardTitle>
              <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-gray-900 mb-2">
                {isLoading ? '...' : stat.value}
              </div>
              <p className="text-sm text-gray-600 font-medium">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <Calendar className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-gray-900">Meus Próximos Agendamentos</CardTitle>
                <CardDescription className="text-gray-600">Seus agendamentos futuros</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Nenhum agendamento futuro</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl bg-gradient-to-br from-green-50 to-emerald-50">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-gray-900">Ações Rápidas</CardTitle>
                <CardDescription className="text-gray-600">Gerenciar seus agendamentos</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group">
                <Calendar className="h-5 w-5 mr-3 group-hover:scale-110 transition-transform" />
                Novo Agendamento
                <ArrowRight className="h-5 w-5 ml-3 group-hover:translate-x-1 transition-transform" />
              </Button>
              
              <Button variant="outline" className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold py-6 rounded-xl">
                <Clock className="h-5 w-5 mr-3" />
                Meus Agendamentos
                <ArrowRight className="h-5 w-5 ml-3" />
              </Button>
              
              <Button variant="outline" className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold py-6 rounded-xl">
                <Star className="h-5 w-5 mr-3" />
                Avaliar Serviços
                <ArrowRight className="h-5 w-5 ml-3" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
