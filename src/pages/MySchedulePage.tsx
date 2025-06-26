
import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Calendar } from '../components/ui/calendar';
import { toast } from '../components/ui/use-toast';
import { supabase } from '../integrations/supabase/client';
import { useAuthStore } from '../store/authStore';
import { Booking } from '../types';
import { transformDatabaseBooking } from '../utils/dataTransforms';
import { Clock, User, Phone } from 'lucide-react';

const MySchedulePage: React.FC = () => {
  const { user } = useAuthStore();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => {
    if (selectedDate) {
      fetchBookings();
    }
  }, [selectedDate, user]);

  const fetchBookings = async () => {
    if (!user || user.role !== 'barber') return;

    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          barbershop:barbershops(*),
          service:services(*)
        `)
        .eq('barber_id', user.id)
        .eq('date', selectedDate.toISOString().split('T')[0])
        .order('time');

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
    }
  };

  const updateBookingStatus = async (bookingId: string, status: 'completed' | 'cancelled') => {
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

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Minha Agenda</h1>
          <p className="text-gray-400">Gerencie seus agendamentos diários</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="bg-slate-800/50 border-amber-500/20">
            <CardHeader>
              <CardTitle className="text-white">Selecionar Data</CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                className="rounded-md border border-slate-600 bg-slate-700"
              />
            </CardContent>
          </Card>

          <div className="lg:col-span-2 space-y-4">
            <Card className="bg-slate-800/50 border-amber-500/20">
              <CardHeader>
                <CardTitle className="text-white">
                  Agendamentos para {selectedDate.toLocaleDateString('pt-BR')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {bookings.length === 0 ? (
                  <p className="text-gray-400 text-center py-8">
                    Nenhum agendamento para esta data
                  </p>
                ) : (
                  <div className="space-y-4">
                    {bookings.map((booking) => (
                      <div key={booking.id} className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-amber-400" />
                            <span className="text-white font-semibold">{booking.time}</span>
                          </div>
                          <Badge className={`${getStatusColor(booking.status)} text-white`}>
                            {getStatusLabel(booking.status)}
                          </Badge>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-gray-300">
                            <User className="h-4 w-4" />
                            <span>{booking.clientName}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-300">
                            <Phone className="h-4 w-4" />
                            <span>{booking.clientPhone}</span>
                          </div>
                          <p className="text-sm text-gray-400">
                            <strong>Serviço:</strong> {booking.service?.name || 'N/A'} - R$ {booking.service?.price || 0}
                          </p>
                          <p className="text-sm text-gray-400">
                            <strong>Barbearia:</strong> {booking.barbershop?.name || 'N/A'}
                          </p>
                        </div>

                        {booking.status === 'scheduled' && (
                          <div className="flex gap-2 mt-4">
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
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default MySchedulePage;
