import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Calendar } from '../components/ui/calendar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { toast } from '../hooks/use-toast';
import { supabase } from '../integrations/supabase/client';
import { useAuthStore } from '../store/authStore';
import { Booking, DatabaseBooking, Barber, Barbershop } from '../types';
import { transformDatabaseBooking } from '../utils/dataTransforms';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  Phone, 
  Search, 
  Filter, 
  Grid3X3, 
  List, 
  Download, 
  MessageCircle,
  CheckCircle,
  XCircle,
  AlertCircle,
  BarChart3,
  RefreshCw,
  Eye,
  Edit,
  Trash2,
  Plus,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  MapPin,
  Scissors,
  DollarSign,
  X
} from 'lucide-react';

const BookingsPage: React.FC = () => {
  const { user } = useAuthStore();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [barbershops, setBarbershops] = useState<Barbershop[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [barberFilter, setBarberFilter] = useState<string>('all');
  const [barbershopFilter, setBarbershopFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<Date>();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'calendar'>('grid');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedBookings, setSelectedBookings] = useState<string[]>([]);
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    fetchBookings();
    fetchBarbers();
    fetchBarbershops();
  }, [user]);

  const fetchBookings = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('bookings')
        .select(`
          *,
          barber:barbers(*),
          barbershop:barbershops(*),
          service:services(*)
        `);

      if (user?.role === 'admin' && user.barbershopId) {
        query = query.eq('barbershop_id', user.barbershopId);
      } else if (user?.role === 'barber') {
        query = query.eq('barber_id', user.id);
      }

      // Aplicar filtros
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }
      if (barberFilter !== 'all') {
        query = query.eq('barber_id', barberFilter);
      }
      if (barbershopFilter !== 'all') {
        query = query.eq('barbershop_id', barbershopFilter);
      }
      if (dateFilter) {
        query = query.eq('date', dateFilter.toISOString().split('T')[0]);
      }

      const { data, error } = await query.order('date', { ascending: false });
      
      if (error) throw error;
      
      const transformedBookings = (data as any[]).map(transformDatabaseBooking);
      setBookings(transformedBookings);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os agendamentos",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBarbers = async () => {
    try {
      const { data, error } = await supabase
        .from('barbers')
        .select('*')
        .order('name');
      
      if (error) throw error;
      
      const mappedBarbers: Barber[] = (data || []).map(item => ({
        id: item.id,
        name: item.name,
        email: item.email,
        phone: item.phone,
        barbershops: [],
        specialties: item.specialties || [],
        workingHours: {}
      }));
      
      setBarbers(mappedBarbers);
    } catch (error) {
      console.error('Error fetching barbers:', error);
    }
  };

  const fetchBarbershops = async () => {
    try {
      const { data, error } = await supabase
        .from('barbershops')
        .select('*')
        .order('name');
      
      if (error) throw error;
      
      const mappedBarbershops: Barbershop[] = (data || []).map(item => ({
        id: item.id,
        name: item.name,
        address: item.address,
        phone: item.phone,
        adminId: item.admin_id || '',
        services: [],
        barbers: [],
        createdAt: new Date(item.created_at || Date.now())
      }));
      
      setBarbershops(mappedBarbershops);
    } catch (error) {
      console.error('Error fetching barbershops:', error);
    }
  };

  const updateBookingStatus = async (bookingId: string, status: 'scheduled' | 'completed' | 'cancelled') => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status })
        .eq('id', bookingId);

      if (error) throw error;
      
      toast({
        title: "Sucesso!",
        description: "Status do agendamento atualizado"
      });
      
      fetchBookings();
    } catch (error) {
      console.error('Error updating booking:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o agendamento",
        variant: "destructive"
      });
    }
  };

  const updateMultipleBookings = async (status: 'completed' | 'cancelled') => {
    if (selectedBookings.length === 0) return;

    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status })
        .in('id', selectedBookings);

      if (error) throw error;
      
      toast({
        title: "Sucesso!",
        description: `${selectedBookings.length} agendamento(s) atualizado(s)`
      });
      
      setSelectedBookings([]);
      fetchBookings();
    } catch (error) {
      console.error('Error updating bookings:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar os agendamentos",
        variant: "destructive"
      });
    }
  };

  const deleteBooking = async (bookingId: string) => {
    if (!confirm('Tem certeza que deseja excluir este agendamento?')) return;

    try {
      const { error } = await supabase
        .from('bookings')
        .delete()
        .eq('id', bookingId);

      if (error) throw error;
      
      toast({
        title: "Sucesso!",
        description: "Agendamento excluído"
      });
      
      fetchBookings();
    } catch (error) {
      console.error('Error deleting booking:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o agendamento",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-500';
      case 'completed': return 'bg-green-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'scheduled': return 'Agendado';
      case 'completed': return 'Concluído';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', {
      weekday: 'short',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getBookingsForDate = (date: Date) => {
    return bookings.filter(booking => {
      const bookingDate = new Date(booking.date);
      return bookingDate.toDateString() === date.toDateString();
    });
  };

  const filteredBookings = bookings.filter(booking => {
    // Filtro por termo de busca
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        booking.clientName.toLowerCase().includes(searchLower) ||
        booking.clientPhone.includes(searchTerm) ||
        booking.barber?.name.toLowerCase().includes(searchLower) ||
        booking.service?.name.toLowerCase().includes(searchLower) ||
        booking.barbershop?.name.toLowerCase().includes(searchLower);
      
      if (!matchesSearch) return false;
    }

    return true;
  });

  const stats = {
    total: bookings.length,
    scheduled: bookings.filter(b => b.status === 'scheduled').length,
    completed: bookings.filter(b => b.status === 'completed').length,
    cancelled: bookings.filter(b => b.status === 'cancelled').length,
    today: bookings.filter(b => {
      const today = new Date();
      const bookingDate = new Date(b.date);
      return bookingDate.toDateString() === today.toDateString();
    }).length
  };

  const exportBookings = () => {
    const csvContent = [
      ['Cliente', 'Telefone', 'Data', 'Horário', 'Serviço', 'Barbeiro', 'Barbearia', 'Status', 'Preço'],
      ...filteredBookings.map(booking => [
        booking.clientName,
        booking.clientPhone,
        formatDate(booking.date),
        booking.time,
        booking.service?.name || 'N/A',
        booking.barber?.name || 'N/A',
        booking.barbershop?.name || 'N/A',
        getStatusLabel(booking.status),
        formatPrice(booking.service?.price || 0)
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `agendamentos_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const sendWhatsAppMessage = (booking: Booking) => {
    const message = `Olá ${booking.clientName}! 

Confirmação do seu agendamento:
📅 Data: ${formatDate(booking.date)}
⏰ Horário: ${booking.time}
💇‍♂️ Profissional: ${booking.barber?.name}
✂️ Serviço: ${booking.service?.name}
💰 Valor: ${formatPrice(booking.service?.price || 0)}
🏢 Barbearia: ${booking.barbershop?.name}

Aguardo você!`;

    const whatsappUrl = `https://wa.me/${booking.clientPhone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gerenciamento de Agendas</h1>
            <p className="text-gray-600">Gerencie todos os agendamentos do sistema</p>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="border-gray-300 text-gray-700"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filtros
            </Button>
            
            <div className="flex items-center border border-gray-300 rounded-lg">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="rounded-r-none"
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="rounded-none"
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'calendar' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('calendar')}
                className="rounded-l-none"
              >
                <CalendarIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Filtros - Movidos para cima */}
        {showFilters && (
          <Card className="gradient-card border-0 shadow-soft">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-gray-900">Filtros Avançados</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(false)}
                  className="border-gray-300 text-gray-700"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Filtros Principais */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Buscar</label>
                  <Input
                    placeholder="Cliente, telefone, serviço..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="border-gray-300"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Status</label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="border-gray-300">
                      <SelectValue placeholder="Todos os status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="scheduled">Agendados</SelectItem>
                      <SelectItem value="completed">Concluídos</SelectItem>
                      <SelectItem value="cancelled">Cancelados</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Barbeiro</label>
                  <Select value={barberFilter} onValueChange={setBarberFilter}>
                    <SelectTrigger className="border-gray-300">
                      <SelectValue placeholder="Todos os barbeiros" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      {barbers.map((barber) => (
                        <SelectItem key={barber.id} value={barber.id}>
                          {barber.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Barbearia</label>
                  <Select value={barbershopFilter} onValueChange={setBarbershopFilter}>
                    <SelectTrigger className="border-gray-300">
                      <SelectValue placeholder="Todas as barbearias" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      {barbershops.map((barbershop) => (
                        <SelectItem key={barbershop.id} value={barbershop.id}>
                          {barbershop.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Filtro de Data */}
              <div className="mb-4">
                <label className="text-sm font-medium text-gray-700 mb-2 block">Data Específica</label>
                <div className="flex items-center gap-4">
                  {!dateFilter ? (
                    <Button
                      variant="outline"
                      onClick={() => setShowDatePicker(true)}
                      className="border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      Selecionar Data
                    </Button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                        {dateFilter.toLocaleDateString('pt-BR')}
                      </Badge>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setDateFilter(undefined)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
                
                {/* Calendário Popup */}
                {showDatePicker && (
                  <div className="mt-3 p-4 bg-white rounded-lg border border-gray-300 shadow-lg">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm font-medium text-gray-700">Selecione uma data</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setShowDatePicker(false)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <Calendar
                      mode="single"
                      selected={dateFilter}
                      onSelect={(date) => {
                        setDateFilter(date);
                        setShowDatePicker(false);
                      }}
                      className="rounded-md"
                    />
                  </div>
                )}
              </div>
              
              {/* Filtros Ativos */}
              {(statusFilter !== 'all' || barberFilter !== 'all' || barbershopFilter !== 'all' || dateFilter || searchTerm) && (
                <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm font-medium text-blue-900 mb-2">Filtros Ativos:</p>
                  <div className="flex flex-wrap gap-2">
                    {statusFilter !== 'all' && (
                      <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                        Status: {getStatusLabel(statusFilter)}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setStatusFilter('all')}
                          className="ml-1 h-4 w-4 p-0 text-blue-600 hover:text-blue-700"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    )}
                    {barberFilter !== 'all' && (
                      <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                        Barbeiro: {barbers.find(b => b.id === barberFilter)?.name}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setBarberFilter('all')}
                          className="ml-1 h-4 w-4 p-0 text-blue-600 hover:text-blue-700"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    )}
                    {barbershopFilter !== 'all' && (
                      <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                        Barbearia: {barbershops.find(b => b.id === barbershopFilter)?.name}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setBarbershopFilter('all')}
                          className="ml-1 h-4 w-4 p-0 text-blue-600 hover:text-blue-700"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    )}
                    {dateFilter && (
                      <Badge variant="secondary" className="bg-blue-100 text-blue-700 text-xs">
                        {dateFilter.toLocaleDateString('pt-BR')}
                      </Badge>
                    )}
                    {searchTerm && (
                      <Badge variant="secondary" className="bg-blue-100 text-blue-700 text-xs">
                        "{searchTerm}"
                      </Badge>
                    )}
                  </div>
                </div>
              )}
              
              {/* Ações dos Filtros */}
              <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setStatusFilter('all');
                      setBarberFilter('all');
                      setBarbershopFilter('all');
                      setDateFilter(undefined);
                      setSearchTerm('');
                    }}
                    className="border-gray-300 text-gray-700"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Limpar Todos
                  </Button>
                  <span className="text-sm text-gray-500">
                    {filteredBookings.length} resultado(s) encontrado(s)
                  </span>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowFilters(false)}
                    className="border-gray-300 text-gray-700"
                  >
                    Fechar
                  </Button>
                  <Button
                    onClick={fetchBookings}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Aplicar Filtros
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Indicador de Filtros Ativos (quando filtros estão fechados) */}
        {!showFilters && (statusFilter !== 'all' || barberFilter !== 'all' || barbershopFilter !== 'all' || dateFilter || searchTerm) && (
          <Card className="gradient-card border-0 shadow-soft border-blue-200">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">Filtros Ativos</span>
                  <div className="flex flex-wrap gap-1">
                    {statusFilter !== 'all' && (
                      <Badge variant="secondary" className="bg-blue-100 text-blue-700 text-xs">
                        {getStatusLabel(statusFilter)}
                      </Badge>
                    )}
                    {barberFilter !== 'all' && (
                      <Badge variant="secondary" className="bg-blue-100 text-blue-700 text-xs">
                        {barbers.find(b => b.id === barberFilter)?.name}
                      </Badge>
                    )}
                    {barbershopFilter !== 'all' && (
                      <Badge variant="secondary" className="bg-blue-100 text-blue-700 text-xs">
                        {barbershops.find(b => b.id === barbershopFilter)?.name}
                      </Badge>
                    )}
                    {dateFilter && (
                      <Badge variant="secondary" className="bg-blue-100 text-blue-700 text-xs">
                        {dateFilter.toLocaleDateString('pt-BR')}
                      </Badge>
                    )}
                    {searchTerm && (
                      <Badge variant="secondary" className="bg-blue-100 text-blue-700 text-xs">
                        "{searchTerm}"
                      </Badge>
                    )}
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowFilters(true)}
                  className="border-blue-500 text-blue-600 hover:bg-blue-50"
                >
                  Editar Filtros
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card className="gradient-card border-0 shadow-soft">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <BarChart3 className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="gradient-card border-0 shadow-soft">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Agendados</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.scheduled}</p>
                </div>
                <Clock className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="gradient-card border-0 shadow-soft">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Concluídos</p>
                  <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="gradient-card border-0 shadow-soft">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Cancelados</p>
                  <p className="text-2xl font-bold text-red-600">{stats.cancelled}</p>
                </div>
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="gradient-card border-0 shadow-soft">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Hoje</p>
                  <p className="text-2xl font-bold text-amber-600">{stats.today}</p>
                </div>
                <CalendarIcon className="h-8 w-8 text-amber-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Ações em Lote */}
        {selectedBookings.length > 0 && (
          <Card className="gradient-card border-0 shadow-soft border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <p className="text-gray-700">
                  {selectedBookings.length} agendamento(s) selecionado(s)
                </p>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    onClick={() => updateMultipleBookings('completed')}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Concluir Todos
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateMultipleBookings('cancelled')}
                    className="border-red-500 text-red-600 hover:bg-red-50"
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Cancelar Todos
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedBookings([])}
                    className="border-gray-300 text-gray-700"
                  >
                    Desmarcar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Visualização */}
        {viewMode === 'calendar' ? (
          <div className="space-y-6">
            {/* Calendário Principal */}
            <Card className="gradient-card border-0 shadow-soft">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-gray-900">Visualização em Calendário</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      Clique em uma data para ver os agendamentos do dia
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newDate = new Date(selectedDate);
                        newDate.setMonth(newDate.getMonth() - 1);
                        setSelectedDate(newDate);
                      }}
                      className="border-gray-300"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-gray-700 font-medium px-4">
                      {selectedDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newDate = new Date(selectedDate);
                        newDate.setMonth(newDate.getMonth() + 1);
                        setSelectedDate(newDate);
                      }}
                      className="border-gray-300"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedDate(new Date())}
                      className="border-blue-500 text-blue-600 hover:bg-blue-50"
                    >
                      Hoje
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  className="rounded-md border border-gray-300"
                  modifiers={{
                    booked: (date) => getBookingsForDate(date).length > 0,
                    today: (date) => date.toDateString() === new Date().toDateString(),
                    selected: (date) => date.toDateString() === selectedDate.toDateString()
                  }}
                  modifiersStyles={{
                    booked: { 
                      backgroundColor: '#dbeafe', 
                      color: '#1e40af',
                      fontWeight: '600'
                    },
                    today: {
                      backgroundColor: '#fef3c7',
                      color: '#d97706',
                      fontWeight: 'bold'
                    },
                    selected: {
                      backgroundColor: '#3b82f6',
                      color: 'white',
                      fontWeight: 'bold'
                    }
                  }}
                />
              </CardContent>
            </Card>

            {/* Detalhes do Dia Selecionado */}
            <Card className="gradient-card border-0 shadow-soft">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-gray-900">
                      {selectedDate.toLocaleDateString('pt-BR', { 
                        weekday: 'long', 
                        day: '2-digit', 
                        month: 'long', 
                        year: 'numeric' 
                      })}
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      {getBookingsForDate(selectedDate).length} agendamento(s) para este dia
                    </p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {getBookingsForDate(selectedDate).filter(b => b.status === 'scheduled').length}
                      </div>
                      <div className="text-xs text-gray-600">Agendados</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {getBookingsForDate(selectedDate).filter(b => b.status === 'completed').length}
                      </div>
                      <div className="text-xs text-gray-600">Concluídos</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">
                        {getBookingsForDate(selectedDate).filter(b => b.status === 'cancelled').length}
                      </div>
                      <div className="text-xs text-gray-600">Cancelados</div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {getBookingsForDate(selectedDate).length === 0 ? (
                  <div className="text-center py-12">
                    <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 text-lg">Nenhum agendamento para este dia</p>
                    <p className="text-gray-500 text-sm">Selecione outra data ou crie novos agendamentos</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Timeline de Horários */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Clock className="h-5 w-5 text-blue-600" />
                        Timeline de Horários
                      </h3>
                      <div className="space-y-3">
                        {getBookingsForDate(selectedDate)
                          .sort((a, b) => a.time.localeCompare(b.time))
                          .map((booking) => (
                          <div key={booking.id} className="relative">
                            <div className="flex items-center space-x-4 p-4 bg-white rounded-lg border border-gray-200 shadow-soft hover:shadow-md transition-shadow">
                              {/* Indicador de Horário */}
                              <div className="flex-shrink-0">
                                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                  {booking.time}
                                </div>
                              </div>
                              
                              {/* Linha de Tempo */}
                              <div className="flex-shrink-0">
                                <div className="w-1 h-12 bg-gradient-to-b from-blue-500 to-blue-300 rounded-full"></div>
                              </div>
                              
                              {/* Informações do Agendamento */}
                              <div className="flex-1">
                                <div className="flex justify-between items-start mb-2">
                                  <div>
                                    <h4 className="text-lg font-semibold text-gray-900">{booking.clientName}</h4>
                                    <p className="text-sm text-gray-600">{booking.clientPhone}</p>
                                  </div>
                                  <Badge className={`${getStatusColor(booking.status)} text-white`}>
                                    {getStatusLabel(booking.status)}
                                  </Badge>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                  <div className="flex items-center gap-2">
                                    <Scissors className="h-4 w-4 text-gray-500" />
                                    <span className="text-gray-700">
                                      <span className="font-medium">{booking.service?.name}</span>
                                      <span className="text-gray-500 ml-1">({booking.service?.duration} min)</span>
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <User className="h-4 w-4 text-gray-500" />
                                    <span className="text-gray-700">{booking.barber?.name}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <DollarSign className="h-4 w-4 text-green-600" />
                                    <span className="font-semibold text-green-600">
                                      {formatPrice(booking.service?.price || 0)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              
                              {/* Ações */}
                              <div className="flex-shrink-0 flex flex-col space-y-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => sendWhatsAppMessage(booking)}
                                  className="border-blue-500 text-blue-600 hover:bg-blue-50"
                                >
                                  <MessageCircle className="h-4 w-4" />
                                </Button>
                                
                                {booking.status === 'scheduled' && (
                                  <>
                                    <Button
                                      size="sm"
                                      onClick={() => updateBookingStatus(booking.id, 'completed')}
                                      className="bg-green-600 hover:bg-green-700 text-white"
                                    >
                                      <CheckCircle className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                                      className="border-red-500 text-red-600 hover:bg-red-50"
                                    >
                                      <XCircle className="h-4 w-4" />
                                    </Button>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Resumo do Dia */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card className="border border-gray-200 shadow-soft">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-gray-600">Faturamento do Dia</p>
                              <p className="text-2xl font-bold text-green-600">
                                {formatPrice(
                                  getBookingsForDate(selectedDate)
                                    .filter(b => b.status === 'completed')
                                    .reduce((sum, b) => sum + (b.service?.price || 0), 0)
                                )}
                              </p>
                            </div>
                            <DollarSign className="h-8 w-8 text-green-600" />
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card className="border border-gray-200 shadow-soft">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-gray-600">Tempo Total</p>
                              <p className="text-2xl font-bold text-blue-600">
                                {getBookingsForDate(selectedDate)
                                  .reduce((sum, b) => sum + (b.service?.duration || 0), 0)} min
                              </p>
                            </div>
                            <Clock className="h-8 w-8 text-blue-600" />
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card className="border border-gray-200 shadow-soft">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-gray-600">Taxa de Conclusão</p>
                              <p className="text-2xl font-bold text-amber-600">
                                {getBookingsForDate(selectedDate).length > 0 
                                  ? Math.round(
                                      (getBookingsForDate(selectedDate).filter(b => b.status === 'completed').length / 
                                       getBookingsForDate(selectedDate).length) * 100
                                    )
                                  : 0}%
                              </p>
                            </div>
                            <CheckCircle className="h-8 w-8 text-amber-600" />
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          <>
            {/* Ações */}
            <div className="flex justify-between items-center">
              <p className="text-gray-600">
                {filteredBookings.length} agendamento(s) encontrado(s)
              </p>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={exportBookings}
                  className="border-gray-300 text-gray-700"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Exportar CSV
                </Button>
              </div>
            </div>

            {/* Lista de Agendamentos */}
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredBookings.map((booking) => (
                  <Card key={booking.id} className="gradient-card border-0 shadow-soft hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-gray-900 flex items-center gap-2">
                          <User className="h-5 w-5 text-blue-600" />
                          {booking.clientName}
                        </CardTitle>
                        <Badge className={`${getStatusColor(booking.status)} text-white`}>
                          {getStatusLabel(booking.status)}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Phone className="h-4 w-4" />
                        <span>{booking.clientPhone}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-gray-600">
                        <CalendarIcon className="h-4 w-4" />
                        <span>{formatDate(booking.date)}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-gray-600">
                        <Clock className="h-4 w-4" />
                        <span>{booking.time}</span>
                      </div>

                      <div className="pt-2 border-t border-gray-200">
                        <div className="flex items-center gap-2 text-gray-600 mb-1">
                          <Scissors className="h-4 w-4" />
                          <span className="font-medium">{booking.service?.name || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600 mb-1">
                          <User className="h-4 w-4" />
                          <span>{booking.barber?.name || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600 mb-2">
                          <MapPin className="h-4 w-4" />
                          <span>{booking.barbershop?.name || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-green-600 font-semibold">
                          <DollarSign className="h-4 w-4" />
                          <span>{formatPrice(booking.service?.price || 0)}</span>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => sendWhatsAppMessage(booking)}
                          className="border-blue-500 text-blue-600 hover:bg-blue-50"
                        >
                          <MessageCircle className="h-4 w-4" />
                        </Button>
                        
                        {booking.status === 'scheduled' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => updateBookingStatus(booking.id, 'completed')}
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                              className="border-red-500 text-red-600 hover:bg-red-50"
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-gray-300 text-gray-700"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-h-[90vh] overflow-hidden flex flex-col">
                            <DialogHeader className="flex-shrink-0">
                              <DialogTitle>Detalhes do Agendamento</DialogTitle>
                            </DialogHeader>
                            
                            <div className="flex-1 overflow-y-auto pr-2">
                              <div className="space-y-4">
                                <div>
                                  <h4 className="font-semibold text-gray-900">{booking.clientName}</h4>
                                  <p className="text-gray-600">{booking.clientPhone}</p>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <p className="text-sm font-medium text-gray-700">Data</p>
                                    <p className="text-sm text-gray-600">{new Date(booking.date).toLocaleDateString('pt-BR')}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-gray-700">Horário</p>
                                    <p className="text-sm text-gray-600">{booking.time}</p>
                                  </div>
                                </div>
                                
                                <div>
                                  <p className="text-sm font-medium text-gray-700">Serviço</p>
                                  <p className="text-sm text-gray-600">{booking.service?.name}</p>
                                </div>
                                
                                <div>
                                  <p className="text-sm font-medium text-gray-700">Status</p>
                                  <Badge 
                                    variant={booking.status === 'completed' ? 'default' : 
                                           booking.status === 'confirmed' ? 'secondary' : 'destructive'}
                                  >
                                    {booking.status === 'completed' ? 'Concluído' :
                                     booking.status === 'confirmed' ? 'Confirmado' : 'Pendente'}
                                  </Badge>
                                </div>
                                
                                {booking.notes && (
                                  <div>
                                    <p className="text-sm font-medium text-gray-700">Observações</p>
                                    <p className="text-sm text-gray-600">{booking.notes}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            {/* Botões fixos na parte inferior */}
                            <div className="flex justify-end space-x-2 pt-4 border-t border-gray-200 flex-shrink-0">
                              <Button
                                variant="outline"
                                onClick={() => {
                                  // Lógica para cancelar agendamento
                                }}
                                className="text-red-600 border-red-200 hover:bg-red-50"
                              >
                                Cancelar Agendamento
                              </Button>
                              <Button
                                onClick={() => {
                                  // Lógica para confirmar agendamento
                                }}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                Confirmar
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="gradient-card border-0 shadow-soft">
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Cliente
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Data/Hora
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Serviço
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Barbeiro
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Ações
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredBookings.map((booking) => (
                          <tr key={booking.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium text-gray-900">{booking.clientName}</div>
                                <div className="text-sm text-gray-500">{booking.clientPhone}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{formatDate(booking.date)}</div>
                              <div className="text-sm text-gray-500">{booking.time}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{booking.service?.name}</div>
                              <div className="text-sm text-gray-500">{formatPrice(booking.service?.price || 0)}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {booking.barber?.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Badge className={`${getStatusColor(booking.status)} text-white`}>
                                {getStatusLabel(booking.status)}
                              </Badge>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => sendWhatsAppMessage(booking)}
                                  className="border-blue-500 text-blue-600"
                                >
                                  <MessageCircle className="h-4 w-4" />
                                </Button>
                                {booking.status === 'scheduled' && (
                                  <>
                                    <Button
                                      size="sm"
                                      onClick={() => updateBookingStatus(booking.id, 'completed')}
                                      className="bg-green-600 hover:bg-green-700 text-white"
                                    >
                                      <CheckCircle className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                                      className="border-red-500 text-red-600 hover:bg-red-50"
                                    >
                                      <XCircle className="h-4 w-4" />
                                    </Button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {isLoading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-2">Carregando agendamentos...</p>
          </div>
        )}

        {!isLoading && filteredBookings.length === 0 && (
          <div className="text-center py-12">
            <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">Nenhum agendamento encontrado</p>
            <p className="text-gray-500">Tente ajustar os filtros ou adicionar novos agendamentos</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default BookingsPage;
