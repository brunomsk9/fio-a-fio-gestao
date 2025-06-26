
import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Calendar } from '../components/ui/calendar';
import { toast } from '../components/ui/use-toast';
import { supabase } from '../lib/supabase';
import { Barbershop, Barber, Service } from '../types';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const BookingPage: React.FC = () => {
  const navigate = useNavigate();
  const [barbershops, setBarbershops] = useState<Barbershop[]>([]);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedBarbershop, setSelectedBarbershop] = useState<string>('');
  const [selectedBarber, setSelectedBarber] = useState<string>('');
  const [selectedService, setSelectedService] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [clientName, setClientName] = useState<string>('');
  const [clientPhone, setClientPhone] = useState<string>('');
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);

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
      generateAvailableTimes();
    }
  }, [selectedBarber, selectedDate]);

  const fetchBarbershops = async () => {
    try {
      const { data, error } = await supabase
        .from('barbershops')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setBarbershops(data || []);
    } catch (error) {
      console.error('Error fetching barbershops:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as barbearias",
        variant: "destructive"
      });
    }
  };

  const fetchBarbers = async (barbershopId: string) => {
    try {
      const { data, error } = await supabase
        .from('barbers')
        .select('*')
        .contains('barbershops', [barbershopId])
        .order('name');
      
      if (error) throw error;
      setBarbers(data || []);
    } catch (error) {
      console.error('Error fetching barbers:', error);
    }
  };

  const fetchServices = async (barbershopId: string) => {
    try {
      const { data, error } = await supabase
        .from('barbershops')
        .select('services')
        .eq('id', barbershopId)
        .single();
      
      if (error) throw error;
      setServices(data?.services || []);
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };

  const generateAvailableTimes = () => {
    const times = [];
    for (let hour = 8; hour <= 18; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        times.push(timeString);
      }
    }
    setAvailableTimes(times);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedBarbershop || !selectedBarber || !selectedService || !selectedDate || !selectedTime || !clientName || !clientPhone) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('bookings')
        .insert({
          client_name: clientName,
          client_phone: clientPhone,
          barber_id: selectedBarber,
          barbershop_id: selectedBarbershop,
          service_id: selectedService,
          date: selectedDate.toISOString().split('T')[0],
          time: selectedTime,
          status: 'scheduled'
        });

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: "Agendamento realizado com sucesso. Você receberá uma confirmação por WhatsApp."
      });

      // Reset form
      setSelectedBarbershop('');
      setSelectedBarber('');
      setSelectedService('');
      setSelectedDate(undefined);
      setSelectedTime('');
      setClientName('');
      setClientPhone('');
    } catch (error) {
      console.error('Error creating booking:', error);
      toast({
        title: "Erro",
        description: "Não foi possível realizar o agendamento",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/')}
            className="text-white hover:bg-amber-500/20"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-white">Fazer Agendamento</h1>
            <p className="text-amber-400">Escolha sua barbearia e horário preferido</p>
          </div>
        </div>

        <Card className="bg-slate-800/50 border-amber-500/20">
          <CardHeader>
            <CardTitle className="text-white">Dados do Agendamento</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-white">Nome Completo</Label>
                  <Input
                    id="name"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white"
                    placeholder="Seu nome completo"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-white">WhatsApp</Label>
                  <Input
                    id="phone"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white"
                    placeholder="(11) 99999-9999"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="barbershop" className="text-white">Barbearia</Label>
                  <Select value={selectedBarbershop} onValueChange={setSelectedBarbershop}>
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                      <SelectValue placeholder="Escolha uma barbearia" />
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

                <div className="space-y-2">
                  <Label htmlFor="barber" className="text-white">Barbeiro</Label>
                  <Select value={selectedBarber} onValueChange={setSelectedBarber} disabled={!selectedBarbershop}>
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                      <SelectValue placeholder="Escolha um barbeiro" />
                    </SelectTrigger>
                    <SelectContent>
                      {barbers.map((barber) => (
                        <SelectItem key={barber.id} value={barber.id}>
                          {barber.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="service" className="text-white">Serviço</Label>
                  <Select value={selectedService} onValueChange={setSelectedService} disabled={!selectedBarbershop}>
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                      <SelectValue placeholder="Escolha um serviço" />
                    </SelectTrigger>
                    <SelectContent>
                      {services.map((service) => (
                        <SelectItem key={service.id} value={service.id}>
                          {service.name} - R$ {service.price}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="time" className="text-white">Horário</Label>
                  <Select value={selectedTime} onValueChange={setSelectedTime} disabled={!selectedBarber || !selectedDate}>
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                      <SelectValue placeholder="Escolha um horário" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableTimes.map((time) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-white">Data</Label>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={(date) => date < new Date()}
                  className="rounded-md border border-slate-600 bg-slate-700"
                />
              </div>

              <Button 
                type="submit" 
                className="w-full bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold"
              >
                Confirmar Agendamento
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BookingPage;
