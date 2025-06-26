
import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { toast } from '../components/ui/use-toast';
import { supabase } from '../lib/supabase';
import { Booking } from '../types';
import { Calendar, Clock, MapPin, Phone, Search } from 'lucide-react';

const MyBookingsPage: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [searchPhone, setSearchPhone] = useState('');
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);

  useEffect(() => {
    if (searchPhone.length >= 10) {
      fetchBookings();
    }
  }, [searchPhone]);

  const fetchBookings = async () => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          barber:barbers(*),
          barbershop:barbershops(*),
          service:services(*)
        `)
        .eq('client_phone', searchPhone)
        .order('date', { ascending: false });

      if (error) throw error;
      
      setBookings(data || []);
      setFilteredBookings(data || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os agendamentos",
        variant: "destructive"
      });
    }
  };

  const cancelBooking = async (bookingId: string) => {
    if (!confirm('Tem certeza que deseja cancelar este agendamento?')) return;

    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'cancelled' })
        .eq('id', bookingId);

      if (error) throw error;
      
      toast({
        title: "Sucesso!",
        description: "Agendamento cancelado"
      });
      
      fetchBookings();
    } catch (error) {
      console.error('Error cancelling booking:', error);
      toast({
        title: "Erro",
        description: "Não foi possível cancelar o agendamento",
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

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Meus Agendamentos</h1>
          <p className="text-gray-400">Consulte e gerencie seus agendamentos</p>
        </div>

        <Card className="bg-slate-800/50 border-amber-500/20">
          <CardHeader>
            <CardTitle className="text-white">Buscar Agendamentos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Digite seu WhatsApp (11) 99999-9999"
                  value={searchPhone}
                  onChange={(e) => setSearchPhone(e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              <Button 
                onClick={fetchBookings}
                className="bg-amber-500 hover:bg-amber-600 text-slate-900"
                disabled={searchPhone.length < 10}
              >
                <Search className="h-4 w-4 mr-2" />
                Buscar
              </Button>
            </div>
          </CardContent>
        </Card>

        {filteredBookings.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBookings.map((booking) => (
              <Card key={booking.id} className="bg-slate-800/50 border-amber-500/20">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-white">{booking.clientName}</CardTitle>
                    <Badge className={`${getStatusColor(booking.status)} text-white`}>
                      {getStatusLabel(booking.status)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-gray-300">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(booking.date).toLocaleDateString('pt-BR')}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-gray-300">
                    <Clock className="h-4 w-4" />
                    <span>{booking.time}</span>
                  </div>

                  <div className="flex items-center gap-2 text-gray-300">
                    <Phone className="h-4 w-4" />
                    <span>{booking.clientPhone}</span>
                  </div>

                  <div className="flex items-center gap-2 text-gray-300">
                    <MapPin className="h-4 w-4" />
                    <span>{booking.barbershop?.name || 'N/A'}</span>
                  </div>

                  <div className="pt-2 border-t border-slate-600">
                    <p className="text-sm text-gray-400">
                      <strong>Serviço:</strong> {booking.service?.name || 'N/A'}
                    </p>
                    <p className="text-sm text-gray-400">
                      <strong>Barbeiro:</strong> {booking.barber?.name || 'N/A'}
                    </p>
                    <p className="text-sm text-gray-400">
                      <strong>Preço:</strong> R$ {booking.service?.price || 0}
                    </p>
                  </div>

                  {booking.status === 'scheduled' && new Date(booking.date) > new Date() && (
                    <Button
                      onClick={() => cancelBooking(booking.id)}
                      variant="outline"
                      size="sm"
                      className="w-full border-red-500/50 text-red-400 hover:bg-red-500/20"
                    >
                      Cancelar Agendamento
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {searchPhone.length >= 10 && filteredBookings.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">Nenhum agendamento encontrado para este telefone</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default MyBookingsPage;
