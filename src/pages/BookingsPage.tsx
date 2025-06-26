
import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from '../components/ui/use-toast';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { Booking } from '../types';
import { Calendar, Clock, User, Phone } from 'lucide-react';

const BookingsPage: React.FC = () => {
  const { user } = useAuthStore();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    fetchBookings();
  }, [user]);

  const fetchBookings = async () => {
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

      const { data, error } = await query.order('date', { ascending: false });
      
      if (error) throw error;
      setBookings(data || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os agendamentos",
        variant: "destructive"
      });
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

  const filteredBookings = bookings.filter(booking => {
    if (filter === 'all') return true;
    return booking.status === filter;
  });

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">Agendamentos</h1>
            <p className="text-gray-400">Gerencie todos os agendamentos</p>
          </div>
          
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-48 bg-slate-700 border-slate-600 text-white">
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="scheduled">Agendados</SelectItem>
              <SelectItem value="completed">Concluídos</SelectItem>
              <SelectItem value="cancelled">Cancelados</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBookings.map((booking) => (
            <Card key={booking.id} className="bg-slate-800/50 border-amber-500/20">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-white flex items-center gap-2">
                    <User className="h-5 w-5" />
                    {booking.clientName}
                  </CardTitle>
                  <Badge className={`${getStatusColor(booking.status)} text-white`}>
                    {getStatusLabel(booking.status)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-gray-300">
                  <Phone className="h-4 w-4" />
                  <span>{booking.clientPhone}</span>
                </div>
                
                <div className="flex items-center gap-2 text-gray-300">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(booking.date).toLocaleDateString('pt-BR')}</span>
                </div>
                
                <div className="flex items-center gap-2 text-gray-300">
                  <Clock className="h-4 w-4" />
                  <span>{booking.time}</span>
                </div>

                <div className="pt-2 border-t border-slate-600">
                  <p className="text-sm text-gray-400">
                    <strong>Serviço:</strong> {booking.service?.name || 'N/A'}
                  </p>
                  <p className="text-sm text-gray-400">
                    <strong>Barbeiro:</strong> {booking.barber?.name || 'N/A'}
                  </p>
                  <p className="text-sm text-gray-400">
                    <strong>Barbearia:</strong> {booking.barbershop?.name || 'N/A'}
                  </p>
                </div>

                {booking.status === 'scheduled' && (
                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      onClick={() => updateBookingStatus(booking.id, 'completed')}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      Concluir
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                      className="border-red-500/50 text-red-400 hover:bg-red-500/20"
                    >
                      Cancelar
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredBookings.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">Nenhum agendamento encontrado</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default BookingsPage;
