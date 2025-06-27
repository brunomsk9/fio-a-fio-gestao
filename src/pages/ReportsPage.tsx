import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { supabase } from '../integrations/supabase/client';
import { useAuthStore } from '../store/authStore';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Calendar, DollarSign, Users, Scissors } from 'lucide-react';

const ReportsPage: React.FC = () => {
  const { user } = useAuthStore();
  const [bookings, setBookings] = useState<any[]>([]);
  const [period, setPeriod] = useState<string>('month');
  const [stats, setStats] = useState({
    totalBookings: 0,
    totalRevenue: 0,
    totalClients: 0,
    totalServices: 0,
  });

  useEffect(() => {
    fetchBookings();
  }, [user, period]);

  const fetchBookings = async () => {
    try {
      const startDate = getStartDate(period);
      
      let query = supabase
        .from('bookings')
        .select(`
          *,
          barber:barbers(*),
          barbershop:barbershops(*),
          service:services(*)
        `)
        .gte('date', startDate.toISOString().split('T')[0])
        .eq('status', 'completed');

      if (user?.role === 'admin' && user.barbershopId) {
        query = query.eq('barbershop_id', user.barbershopId);
      } else if (user?.role === 'barber') {
        query = query.eq('barber_id', user.id);
      }

      const { data, error } = await query.order('date', { ascending: true });
      
      if (error) throw error;
      
      setBookings(data || []);
      calculateStats(data || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  const getStartDate = (period: string) => {
    const now = new Date();
    switch (period) {
      case 'week':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case 'month':
        return new Date(now.getFullYear(), now.getMonth(), 1);
      case 'year':
        return new Date(now.getFullYear(), 0, 1);
      default:
        return new Date(now.getFullYear(), now.getMonth(), 1);
    }
  };

  const calculateStats = (bookings: any[]) => {
    const completedBookings = bookings.filter(booking => booking.status === 'completed');
    
    const totalBookings = completedBookings.length;
    const totalRevenue = completedBookings.reduce((sum, booking) => sum + (booking.service?.price || 0), 0);
    const uniqueClients = new Set(completedBookings.map(booking => booking.client_phone)).size;
    const uniqueServices = new Set(completedBookings.map(booking => booking.service_id)).size;

    setStats({
      totalBookings,
      totalRevenue,
      totalClients: uniqueClients,
      totalServices: uniqueServices,
    });
  };

  const getChartData = () => {
    const completedBookings = bookings.filter(booking => booking.status === 'completed');
    
    const dateGroups = completedBookings.reduce((acc, booking) => {
      const date = new Date(booking.date).toLocaleDateString('pt-BR');
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(dateGroups).map(([date, count]) => ({
      date,
      agendamentos: count,
    }));
  };

  const getServiceData = () => {
    const completedBookings = bookings.filter(booking => booking.status === 'completed');
    
    const serviceGroups = completedBookings.reduce((acc, booking) => {
      const serviceName = booking.service?.name || 'Serviço';
      acc[serviceName] = (acc[serviceName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(serviceGroups).map(([name, value]) => ({
      name,
      value,
    }));
  };

  const COLORS = ['#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#8b5cf6'];

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Relatórios</h1>
            <p className="text-gray-600">Análise de desempenho e estatísticas - Apenas agendamentos confirmados</p>
          </div>
          
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-full sm:w-48 bg-white border-gray-300 text-gray-900 shadow-soft">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Última Semana</SelectItem>
              <SelectItem value="month">Este Mês</SelectItem>
              <SelectItem value="year">Este Ano</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="gradient-card border-0 shadow-soft hover:shadow-medium transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Agendamentos Confirmados</CardTitle>
              <div className="p-2 bg-amber-100 rounded-lg">
                <Calendar className="h-4 w-4 text-amber-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{stats.totalBookings}</div>
              <p className="text-sm text-amber-600 mt-1">Serviços realizados</p>
            </CardContent>
          </Card>

          <Card className="gradient-card border-0 shadow-soft hover:shadow-medium transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Receita Realizada</CardTitle>
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="h-4 w-4 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">R$ {stats.totalRevenue.toFixed(2)}</div>
              <p className="text-sm text-green-600 mt-1">Receita efetivamente gerada</p>
            </CardContent>
          </Card>

          <Card className="gradient-card border-0 shadow-soft hover:shadow-medium transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Clientes Atendidos</CardTitle>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-4 w-4 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{stats.totalClients}</div>
              <p className="text-sm text-blue-600 mt-1">Clientes que compareceram</p>
            </CardContent>
          </Card>

          <Card className="gradient-card border-0 shadow-soft hover:shadow-medium transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Serviços Realizados</CardTitle>
              <div className="p-2 bg-purple-100 rounded-lg">
                <Scissors className="h-4 w-4 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{stats.totalServices}</div>
              <p className="text-sm text-purple-600 mt-1">Tipos de serviços realizados</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <Card className="gradient-card border-0 shadow-soft">
            <CardHeader>
              <CardTitle className="text-gray-900">Agendamentos Confirmados por Dia</CardTitle>
              <p className="text-sm text-gray-600">Distribuição de serviços realizados ao longo do período</p>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={getChartData()}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="date" 
                      stroke="#6b7280"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis 
                      stroke="#6b7280"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#ffffff', 
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                      labelStyle={{ color: '#374151', fontWeight: '600' }}
                    />
                    <Bar 
                      dataKey="agendamentos" 
                      fill="#f59e0b"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="gradient-card border-0 shadow-soft">
            <CardHeader>
              <CardTitle className="text-gray-900">Serviços Mais Realizados</CardTitle>
              <p className="text-sm text-gray-600">Distribuição por tipo de serviço confirmado</p>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={getServiceData()}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {getServiceData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#ffffff', 
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {bookings.length === 0 && (
          <Card className="gradient-card border-0 shadow-soft">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="text-center">
                <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum agendamento confirmado</h3>
                <p className="text-gray-600">Não há serviços realizados para o período selecionado.</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default ReportsPage;
