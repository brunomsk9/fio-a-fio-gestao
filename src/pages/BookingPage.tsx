
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Calendar } from '../components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';
import { supabase } from '../integrations/supabase/client';
import { toast } from '../components/ui/sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ArrowLeft, Calendar as CalendarIcon, Clock, Scissors, User, Phone, Mail } from 'lucide-react';

interface Barbershop {
  id: string;
  name: string;
  address: string;
}

interface Barber {
  id: string;
  name: string;
  specialties: string[];
}

interface Service {
  id: string;
  name: string;
  duration: number;
  price: number;
}

const BookingPage: React.FC = () => {
  const navigate = useNavigate();
  const [barbershops, setBarbershops] = useState<Barbershop[]>([]);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedBarbershop, setSelectedBarbershop] = useState('');
  const [selectedBarber, setSelectedBarber] = useState('');
  const [selectedService, setSelectedService] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);

  // Horários disponíveis padrão
  const defaultTimes = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30', '18:00', '18:30'
  ];

  useEffect(() => {
    fetchBarbershops();
  }, []);

  useEffect(() => {
    if (selectedBarbershop) {
      fetchBarbers(selectedBarbershop);
      fetchServices(selectedBarbershop);
    }
  }, [selectedBarbershop]);

  useEffect(() => {
    if (selectedBarber && selectedDate) {
      fetchAvailableTimes();
    }
  }, [selectedBarber, selectedDate]);

  const fetchBarbershops = async () => {
    try {
      const { data, error } = await supabase
        .from('barbershops')
        .select('id, name, address')
        .order('name');

      if (error) throw error;
      setBarbershops(data || []);
    } catch (error) {
      console.error('Erro ao buscar barbearias:', error);
      toast.error('Erro ao carregar barbearias');
    }
  };

  const fetchBarbers = async (barbershopId: string) => {
    try {
      const { data, error } = await supabase
        .from('barber_barbershops')
        .select(`
          barber_id,
          barbers (
            id,
            name,
            specialties
          )
        `)
        .eq('barbershop_id', barbershopId);

      if (error) throw error;

      const barbersData = data
        ?.map(item => item.barbers)
        .filter(Boolean) as Barber[];

      setBarbers(barbersData || []);
    } catch (error) {
      console.error('Erro ao buscar barbeiros:', error);
      toast.error('Erro ao carregar barbeiros');
    }
  };

  const fetchServices = async (barbershopId: string) => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('id, name, duration, price')
        .eq('barbershop_id', barbershopId)
        .order('name');

      if (error) throw error;
      setServices(data || []);
    } catch (error) {
      console.error('Erro ao buscar serviços:', error);
      toast.error('Erro ao carregar serviços');
    }
  };

  const fetchAvailableTimes = async () => {
    try {
      if (!selectedDate || !selectedBarber) return;

      const dateString = format(selectedDate, 'yyyy-MM-dd');
      
      const { data: bookings, error } = await supabase
        .from('bookings')
        .select('time')
        .eq('barber_id', selectedBarber)
        .eq('date', dateString)
        .eq('status', 'scheduled');

      if (error) throw error;

      const bookedTimes = bookings?.map(booking => booking.time) || [];
      const available = defaultTimes.filter(time => !bookedTimes.includes(time));
      
      setAvailableTimes(available);
    } catch (error) {
      console.error('Erro ao buscar horários:', error);
      setAvailableTimes(defaultTimes);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedBarbershop || !selectedBarber || !selectedService || !selectedDate || !selectedTime) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    if (!clientName || !clientPhone) {
      toast.error('Nome e telefone são obrigatórios');
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('bookings')
        .insert({
          client_name: clientName,
          client_phone: clientPhone,
          client_email: clientEmail || null,
          barber_id: selectedBarber,
          barbershop_id: selectedBarbershop,
          service_id: selectedService,
          date: format(selectedDate, 'yyyy-MM-dd'),
          time: selectedTime,
          status: 'scheduled'
        });

      if (error) throw error;

      toast.success('Agendamento realizado com sucesso!', {
        description: `Seu horário foi marcado para ${format(selectedDate, 'dd/MM/yyyy', { locale: ptBR })} às ${selectedTime}`,
      });

      // Reset form
      setSelectedBarbershop('');
      setSelectedBarber('');
      setSelectedService('');
      setSelectedDate(undefined);
      setSelectedTime('');
      setClientName('');
      setClientPhone('');
      setClientEmail('');
      setBarbers([]);
      setServices([]);
      setAvailableTimes([]);

    } catch (error: any) {
      console.error('Erro ao criar agendamento:', error);
      toast.error('Erro ao realizar agendamento', {
        description: error.message || 'Tente novamente mais tarde',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const selectedServiceData = services.find(s => s.id === selectedService);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/')}
            className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Agendar Serviço</h1>
            <p className="text-gray-600">Escolha sua barbearia e marque seu horário</p>
          </div>
        </div>

        <Card className="bg-white/80 backdrop-blur-md shadow-xl border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <Scissors className="h-5 w-5 text-blue-600" />
              Novo Agendamento
            </CardTitle>
            <CardDescription>
              Preencha os dados abaixo para agendar seu atendimento
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Dados do Cliente */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <User className="h-5 w-5 text-blue-600" />
                  Seus Dados
                </h3>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="clientName">Nome Completo *</Label>
                    <Input
                      id="clientName"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder="Seu nome completo"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="clientPhone">Telefone *</Label>
                    <Input
                      id="clientPhone"
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      placeholder="(11) 99999-9999"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="clientEmail">Email (opcional)</Label>
                  <Input
                    id="clientEmail"
                    type="email"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    placeholder="seu@email.com"
                  />
                </div>
              </div>

              {/* Seleção de Serviço */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Scissors className="h-5 w-5 text-blue-600" />
                  Escolha o Serviço
                </h3>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Barbearia</Label>
                    <Select value={selectedBarbershop} onValueChange={setSelectedBarbershop}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma barbearia" />
                      </SelectTrigger>
                      <SelectContent>
                        {barbershops.map((barbershop) => (
                          <SelectItem key={barbershop.id} value={barbershop.id}>
                            {barbershop.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedBarbershop && (
                    <div className="space-y-2">
                      <Label>Barbeiro</Label>
                      <Select value={selectedBarber} onValueChange={setSelectedBarber}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um barbeiro" />
                        </SelectTrigger>
                        <SelectContent>
                          {barbers.map((barber) => (
                            <SelectItem key={barber.id} value={barber.id}>
                              {barber.name}
                              {barber.specialties && barber.specialties.length > 0 && (
                                <span className="text-gray-500 text-sm ml-2">
                                  ({barber.specialties.join(', ')})
                                </span>
                              )}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {selectedBarbershop && (
                    <div className="space-y-2">
                      <Label>Serviço</Label>
                      <Select value={selectedService} onValueChange={setSelectedService}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um serviço" />
                        </SelectTrigger>
                        <SelectContent>
                          {services.map((service) => (
                            <SelectItem key={service.id} value={service.id}>
                              {service.name} - R$ {service.price.toFixed(2)} ({service.duration}min)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              </div>

              {/* Seleção de Data e Hora */}
              {selectedService && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <CalendarIcon className="h-5 w-5 text-blue-600" />
                    Data e Horário
                  </h3>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Data</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={`w-full justify-start text-left font-normal ${
                              !selectedDate && 'text-muted-foreground'
                            }`}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {selectedDate ? format(selectedDate, 'dd/MM/yyyy', { locale: ptBR }) : 'Selecione uma data'}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={setSelectedDate}
                            disabled={(date) => date < new Date()}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    {selectedDate && availableTimes.length > 0 && (
                      <div className="space-y-2">
                        <Label>Horário</Label>
                        <Select value={selectedTime} onValueChange={setSelectedTime}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um horário" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableTimes.map((time) => (
                              <SelectItem key={time} value={time}>
                                <div className="flex items-center gap-2">
                                  <Clock className="h-4 w-4" />
                                  {time}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Resumo */}
              {selectedServiceData && selectedDate && selectedTime && (
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-gray-900 mb-2">Resumo do Agendamento</h4>
                  <div className="space-y-1 text-sm">
                    <p><strong>Serviço:</strong> {selectedServiceData.name}</p>
                    <p><strong>Valor:</strong> R$ {selectedServiceData.price.toFixed(2)}</p>
                    <p><strong>Duração:</strong> {selectedServiceData.duration} minutos</p>
                    <p><strong>Data:</strong> {format(selectedDate, 'dd/MM/yyyy', { locale: ptBR })}</p>
                    <p><strong>Horário:</strong> {selectedTime}</p>
                  </div>
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-semibold shadow-lg"
                disabled={isLoading || !selectedBarbershop || !selectedBarber || !selectedService || !selectedDate || !selectedTime || !clientName || !clientPhone}
              >
                {isLoading ? 'Agendando...' : 'Confirmar Agendamento'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BookingPage;
