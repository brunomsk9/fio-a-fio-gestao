import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Calendar } from '../components/ui/calendar';
import { Badge } from '../components/ui/badge';
import { toast } from '../hooks/use-toast';
import { supabase } from '../integrations/supabase/client';
import { Barbershop, Barber, Service } from '../types';
import { 
  ArrowLeft, 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  Phone, 
  User, 
  Scissors,
  CheckCircle,
  Star,
  ChevronRight,
  Loader2,
  MessageCircle,
  AlertCircle,
  X,
  Check,
  Zap,
  Shield,
  Award
} from 'lucide-react';
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
  const [clientEmail, setClientEmail] = useState<string>('');
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingTimes, setIsLoadingTimes] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedBarbershopData, setSelectedBarbershopData] = useState<Barbershop | null>(null);
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});

  useEffect(() => {
    fetchBarbershops();
  }, []);

  useEffect(() => {
    if (selectedBarbershop) {
      fetchBarbers(selectedBarbershop);
      fetchServices(selectedBarbershop);
      const barbershop = barbershops.find(b => b.id === selectedBarbershop);
      setSelectedBarbershopData(barbershop || null);
      // Reset dependent selections
      setSelectedBarber('');
      setSelectedService('');
      setSelectedDate(undefined);
      setSelectedTime('');
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
        .from('barber_barbershops')
        .select(`
          barber_id,
          barbers (*)
        `)
        .eq('barbershop_id', barbershopId);
      
      if (error) throw error;
      
      const mappedBarbers: Barber[] = (data || [])
        .filter(item => item.barbers)
        .map(item => ({
          id: item.barbers.id,
          name: item.barbers.name,
          email: item.barbers.email,
          phone: item.barbers.phone,
          barbershops: [barbershopId],
          specialties: item.barbers.specialties || [],
          workingHours: {}
        }));
      
      setBarbers(mappedBarbers);
    } catch (error) {
      console.error('Error fetching barbers:', error);
      setBarbers([]);
    }
  };

  const fetchServices = async (barbershopId: string) => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('barbershop_id', barbershopId)
        .order('name');
      
      if (error) throw error;
      
      const mappedServices: Service[] = (data || []).map(item => ({
        id: item.id,
        name: item.name,
        duration: item.duration,
        price: item.price,
        description: item.description || undefined
      }));
      
      setServices(mappedServices);
    } catch (error) {
      console.error('Error fetching services:', error);
      setServices([]);
    }
  };

  const fetchAvailableTimes = async () => {
    if (!selectedBarber || !selectedDate) return;
    
    setIsLoadingTimes(true);
    try {
      const dateString = selectedDate.toISOString().split('T')[0];
      
      // Buscar agendamentos existentes para o barbeiro na data
      const { data: existingBookings, error } = await supabase
        .from('bookings')
        .select('time')
        .eq('barber_id', selectedBarber)
        .eq('date', dateString)
        .eq('status', 'scheduled');
      
      if (error) throw error;
      
      const bookedTimes = new Set(existingBookings?.map(b => b.time) || []);
      
      // Gerar horários disponíveis (8h às 18h, intervalos de 30min)
      const allTimes = [];
      for (let hour = 8; hour <= 18; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
          const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
          if (!bookedTimes.has(timeString)) {
            allTimes.push(timeString);
          }
        }
      }
      
      setAvailableTimes(allTimes);
    } catch (error) {
      console.error('Error fetching available times:', error);
      setAvailableTimes([]);
    } finally {
      setIsLoadingTimes(false);
    }
  };

  const validateForm = () => {
    const errors: {[key: string]: string} = {};
    
    if (!selectedBarbershop) errors.barbershop = 'Selecione uma barbearia';
    if (!selectedBarber) errors.barber = 'Selecione um profissional';
    if (!selectedService) errors.service = 'Selecione um serviço';
    if (!selectedDate) errors.date = 'Selecione uma data';
    if (!selectedTime) errors.time = 'Selecione um horário';
    if (!clientName.trim()) errors.name = 'Nome é obrigatório';
    if (!clientPhone.trim()) errors.phone = 'WhatsApp é obrigatório';
    
    // Validar formato do telefone
    const phoneRegex = /^\(?([0-9]{2})\)?[-. ]?([0-9]{4,5})[-. ]?([0-9]{4})$/;
    if (clientPhone && !phoneRegex.test(clientPhone.replace(/\D/g, ''))) {
      errors.phone = 'Formato de telefone inválido';
    }
    
    // Validar email se fornecido
    if (clientEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clientEmail)) {
      errors.email = 'Email inválido';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios corretamente",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('bookings')
        .insert({
          client_name: clientName.trim(),
          client_phone: clientPhone.trim(),
          barber_id: selectedBarber,
          barbershop_id: selectedBarbershop,
          service_id: selectedService,
          date: selectedDate!.toISOString().split('T')[0],
          time: selectedTime,
          status: 'scheduled'
        });

      if (error) throw error;

      const serviceData = getSelectedServiceData();
      const barbershopData = selectedBarbershopData;
      
      // Criar mensagem para WhatsApp
      const message = `Olá! Agendei um horário na ${barbershopData?.name}:
      
📅 Data: ${formatDate(selectedDate!)}
⏰ Horário: ${selectedTime}
💇‍♂️ Profissional: ${getSelectedBarberData()?.name}
✂️ Serviço: ${serviceData?.name}
💰 Valor: R$ ${serviceData?.price}

Aguardo confirmação!`;

      const whatsappUrl = `https://wa.me/${barbershopData?.phone?.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;

      toast({
        title: "Agendamento Confirmado! 🎉",
        description: "Você receberá uma confirmação por WhatsApp em breve."
      });

      // Abrir WhatsApp após 2 segundos
      setTimeout(() => {
        window.open(whatsappUrl, '_blank');
      }, 2000);

      // Reset form
      setSelectedBarbershop('');
      setSelectedBarber('');
      setSelectedService('');
      setSelectedDate(undefined);
      setSelectedTime('');
      setClientName('');
      setClientPhone('');
      setClientEmail('');
      setCurrentStep(1);
      setSelectedBarbershopData(null);
      setFormErrors({});
    } catch (error) {
      console.error('Error creating booking:', error);
      toast({
        title: "Erro",
        description: "Não foi possível realizar o agendamento. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getSelectedServiceData = () => {
    return services.find(s => s.id === selectedService);
  };

  const getSelectedBarberData = () => {
    return barbers.find(b => b.id === selectedBarber);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const nextStep = () => {
    if (currentStep === 1 && selectedBarbershop) {
      setCurrentStep(2);
    } else if (currentStep === 2 && selectedBarber && selectedService) {
      setCurrentStep(3);
    } else if (currentStep === 3 && selectedDate && selectedTime) {
      setCurrentStep(4);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const getStepStatus = (step: number) => {
    if (currentStep > step) return 'completed';
    if (currentStep === step) return 'current';
    return 'pending';
  };

  return (
    <div className="min-h-screen gradient-bg">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/')}
                className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Agendar Horário</h1>
                <p className="text-gray-600 text-sm">Escolha sua barbearia e horário preferido</p>
              </div>
            </div>
            
            {/* Progress Steps */}
            <div className="hidden md:flex items-center space-x-2">
              {[
                { step: 1, label: 'Barbearia', icon: MapPin },
                { step: 2, label: 'Serviço', icon: Scissors },
                { step: 3, label: 'Horário', icon: Clock },
                { step: 4, label: 'Dados', icon: User }
              ].map(({ step, label, icon: Icon }) => {
                const status = getStepStatus(step);
                return (
                  <div key={step} className="flex items-center">
                    <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-300 ${
                      status === 'completed' 
                        ? 'bg-green-100 text-green-700' 
                        : status === 'current'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-500'
                    }`}>
                      <Icon className="h-4 w-4" />
                      <span className="text-sm font-medium hidden lg:inline">{label}</span>
                      <span className="text-sm font-medium lg:hidden">{step}</span>
                    </div>
                    {step < 4 && (
                      <ChevronRight className="h-4 w-4 text-gray-400 mx-1" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Form */}
            <div className="lg:col-span-2">
              <Card className="border-0 shadow-lg bg-white">
                <CardHeader>
                  <CardTitle className="text-gray-900 flex items-center gap-2">
                    <CalendarIcon className="h-5 w-5 text-blue-600" />
                    {currentStep === 1 && "Escolha a Barbearia"}
                    {currentStep === 2 && "Selecione o Profissional e Serviço"}
                    {currentStep === 3 && "Escolha Data e Horário"}
                    {currentStep === 4 && "Dados Pessoais"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Step 1: Barbearia */}
                    {currentStep === 1 && (
                      <div className="space-y-4">
                        <div className="grid gap-4">
                          {barbershops.map((barbershop) => (
                            <div
                              key={barbershop.id}
                              onClick={() => setSelectedBarbershop(barbershop.id)}
                              className={`p-6 border-2 rounded-xl cursor-pointer transition-all duration-300 hover:shadow-md ${
                                selectedBarbershop === barbershop.id
                                  ? 'border-blue-500 bg-blue-50 shadow-md'
                                  : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
                                    <Scissors className="h-7 w-7 text-white" />
                                  </div>
                                  <div className="flex-1">
                                    <h3 className="font-semibold text-gray-900 text-lg">{barbershop.name}</h3>
                                    <div className="flex flex-col space-y-1 mt-1">
                                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                                        <MapPin className="h-4 w-4" />
                                        <span>{barbershop.address}</span>
                                      </div>
                                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                                        <Phone className="h-4 w-4" />
                                        <span>{barbershop.phone}</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Badge variant="secondary" className="bg-green-100 text-green-700">
                                    Disponível
                                  </Badge>
                                  <ChevronRight className="h-5 w-5 text-gray-400" />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        {formErrors.barbershop && (
                          <div className="flex items-center space-x-2 text-red-600 text-sm">
                            <AlertCircle className="h-4 w-4" />
                            <span>{formErrors.barbershop}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Step 2: Barbeiro e Serviço */}
                    {currentStep === 2 && (
                      <div className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label className="text-gray-700 font-medium flex items-center gap-2">
                              <User className="h-4 w-4" />
                              Profissional
                            </Label>
                            <Select value={selectedBarber} onValueChange={setSelectedBarber}>
                              <SelectTrigger className={`border-gray-200 ${formErrors.barber ? 'border-red-500' : ''}`}>
                                <SelectValue placeholder="Escolha um profissional" />
                              </SelectTrigger>
                              <SelectContent>
                                {barbers.map((barber) => (
                                  <SelectItem key={barber.id} value={barber.id}>
                                    <div className="flex items-center justify-between w-full">
                                      <div className="flex items-center space-x-2">
                                        <span className="font-medium">{barber.name}</span>
                                        {barber.specialties.length > 0 && (
                                          <Badge variant="outline" className="text-xs">
                                            {barber.specialties[0]}
                                          </Badge>
                                        )}
                                      </div>
                                      <div className="flex items-center space-x-1">
                                        <Star className="h-3 w-3 text-yellow-500 fill-current" />
                                        <span className="text-xs">4.9</span>
                                      </div>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {formErrors.barber && (
                              <div className="flex items-center space-x-2 text-red-600 text-sm">
                                <AlertCircle className="h-4 w-4" />
                                <span>{formErrors.barber}</span>
                              </div>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label className="text-gray-700 font-medium flex items-center gap-2">
                              <Scissors className="h-4 w-4" />
                              Serviço
                            </Label>
                            <Select value={selectedService} onValueChange={setSelectedService}>
                              <SelectTrigger className={`border-gray-200 ${formErrors.service ? 'border-red-500' : ''}`}>
                                <SelectValue placeholder="Escolha um serviço" />
                              </SelectTrigger>
                              <SelectContent>
                                {services.map((service) => (
                                  <SelectItem key={service.id} value={service.id}>
                                    <div className="flex items-center justify-between w-full">
                                      <div className="flex flex-col">
                                        <span className="font-medium">{service.name}</span>
                                        <span className="text-xs text-gray-500">{service.duration} min</span>
                                      </div>
                                      <span className="font-bold text-blue-600">
                                        {formatPrice(service.price)}
                                      </span>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {formErrors.service && (
                              <div className="flex items-center space-x-2 text-red-600 text-sm">
                                <AlertCircle className="h-4 w-4" />
                                <span>{formErrors.service}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Step 3: Data e Horário */}
                    {currentStep === 3 && (
                      <div className="space-y-6">
                        <div className="space-y-2">
                          <Label className="text-gray-700 font-medium flex items-center gap-2">
                            <CalendarIcon className="h-4 w-4" />
                            Data
                          </Label>
                          <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={setSelectedDate}
                            disabled={(date) => date < new Date()}
                            className="rounded-xl border border-gray-200 bg-white shadow-sm"
                          />
                          {formErrors.date && (
                            <div className="flex items-center space-x-2 text-red-600 text-sm">
                              <AlertCircle className="h-4 w-4" />
                              <span>{formErrors.date}</span>
                            </div>
                          )}
                        </div>

                        {selectedDate && (
                          <div className="space-y-2">
                            <Label className="text-gray-700 font-medium flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              Horário
                              {isLoadingTimes && <Loader2 className="h-4 w-4 animate-spin" />}
                            </Label>
                            {isLoadingTimes ? (
                              <div className="grid grid-cols-4 gap-2">
                                {[...Array(8)].map((_, i) => (
                                  <div key={i} className="h-12 bg-gray-200 rounded-lg animate-pulse" />
                                ))}
                              </div>
                            ) : availableTimes.length > 0 ? (
                              <div className="grid grid-cols-4 gap-2">
                                {availableTimes.map((time) => (
                                  <Button
                                    key={time}
                                    type="button"
                                    variant={selectedTime === time ? "default" : "outline"}
                                    onClick={() => setSelectedTime(time)}
                                    className={`h-12 transition-all duration-200 ${
                                      selectedTime === time 
                                        ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                                        : 'hover:border-blue-300 hover:bg-blue-50'
                                    }`}
                                  >
                                    <Clock className="h-4 w-4 mr-1" />
                                    {time}
                                  </Button>
                                ))}
                              </div>
                            ) : (
                              <div className="text-center py-8 text-gray-500">
                                <Clock className="h-8 w-8 mx-auto mb-2" />
                                <p>Nenhum horário disponível para esta data</p>
                                <p className="text-sm">Tente selecionar outra data</p>
                              </div>
                            )}
                            {formErrors.time && (
                              <div className="flex items-center space-x-2 text-red-600 text-sm">
                                <AlertCircle className="h-4 w-4" />
                                <span>{formErrors.time}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Step 4: Dados Pessoais */}
                    {currentStep === 4 && (
                      <div className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label htmlFor="name" className="text-gray-700 font-medium flex items-center gap-2">
                              <User className="h-4 w-4" />
                              Nome Completo *
                            </Label>
                            <Input
                              id="name"
                              value={clientName}
                              onChange={(e) => setClientName(e.target.value)}
                              className={`border-gray-200 ${formErrors.name ? 'border-red-500' : ''}`}
                              placeholder="Seu nome completo"
                            />
                            {formErrors.name && (
                              <div className="flex items-center space-x-2 text-red-600 text-sm">
                                <AlertCircle className="h-4 w-4" />
                                <span>{formErrors.name}</span>
                              </div>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="phone" className="text-gray-700 font-medium flex items-center gap-2">
                              <MessageCircle className="h-4 w-4" />
                              WhatsApp *
                            </Label>
                            <Input
                              id="phone"
                              value={clientPhone}
                              onChange={(e) => setClientPhone(e.target.value)}
                              className={`border-gray-200 ${formErrors.phone ? 'border-red-500' : ''}`}
                              placeholder="(11) 99999-9999"
                            />
                            {formErrors.phone && (
                              <div className="flex items-center space-x-2 text-red-600 text-sm">
                                <AlertCircle className="h-4 w-4" />
                                <span>{formErrors.phone}</span>
                              </div>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="email" className="text-gray-700 font-medium flex items-center gap-2">
                              <User className="h-4 w-4" />
                              Email (opcional)
                            </Label>
                            <Input
                              id="email"
                              type="email"
                              value={clientEmail}
                              onChange={(e) => setClientEmail(e.target.value)}
                              className={`border-gray-200 ${formErrors.email ? 'border-red-500' : ''}`}
                              placeholder="seu@email.com"
                            />
                            {formErrors.email && (
                              <div className="flex items-center space-x-2 text-red-600 text-sm">
                                <AlertCircle className="h-4 w-4" />
                                <span>{formErrors.email}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex justify-between pt-6 border-t border-gray-200">
                      {currentStep > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={prevStep}
                          className="border-gray-200 text-gray-700 hover:bg-gray-50"
                        >
                          Voltar
                        </Button>
                      )}
                      
                      {currentStep < 4 ? (
                        <Button
                          type="button"
                          onClick={nextStep}
                          disabled={
                            (currentStep === 1 && !selectedBarbershop) ||
                            (currentStep === 2 && (!selectedBarber || !selectedService)) ||
                            (currentStep === 3 && (!selectedDate || !selectedTime))
                          }
                          className="bg-blue-600 hover:bg-blue-700 text-white shadow-md"
                        >
                          Próximo
                          <ChevronRight className="h-4 w-4 ml-2" />
                        </Button>
                      ) : (
                        <Button
                          type="submit"
                          disabled={isLoading || !clientName || !clientPhone}
                          className="bg-green-600 hover:bg-green-700 text-white shadow-md"
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Confirmando...
                            </>
                          ) : (
                            <>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Confirmar Agendamento
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Summary Sidebar */}
            <div className="lg:col-span-1">
              <Card className="border-0 shadow-lg bg-white sticky top-24">
                <CardHeader>
                  <CardTitle className="text-gray-900 flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    Resumo do Agendamento
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {selectedBarbershopData && (
                    <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin className="h-4 w-4 text-blue-600" />
                        <h3 className="font-semibold text-gray-900">Barbearia</h3>
                      </div>
                      <p className="text-gray-700 font-medium">{selectedBarbershopData.name}</p>
                      <p className="text-sm text-gray-600">{selectedBarbershopData.address}</p>
                    </div>
                  )}

                  {getSelectedBarberData() && (
                    <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                      <div className="flex items-center gap-2 mb-2">
                        <User className="h-4 w-4 text-green-600" />
                        <h3 className="font-semibold text-gray-900">Profissional</h3>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-700 font-medium">{getSelectedBarberData()?.name}</span>
                        <div className="flex items-center space-x-1">
                          <Star className="h-3 w-3 text-yellow-500 fill-current" />
                          <span className="text-xs font-medium">4.9</span>
                        </div>
                      </div>
                      {getSelectedBarberData()?.specialties.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {getSelectedBarberData()?.specialties.slice(0, 2).map((specialty, index) => (
                            <Badge key={index} variant="secondary" className="text-xs bg-green-100 text-green-700">
                              {specialty}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {getSelectedServiceData() && (
                    <div className="p-4 bg-orange-50 rounded-xl border border-orange-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Scissors className="h-4 w-4 text-orange-600" />
                        <h3 className="font-semibold text-gray-900">Serviço</h3>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-gray-700 font-medium">{getSelectedServiceData()?.name}</span>
                          <p className="text-sm text-gray-600">{getSelectedServiceData()?.duration} minutos</p>
                        </div>
                        <span className="font-bold text-orange-600 text-lg">
                          {formatPrice(getSelectedServiceData()?.price || 0)}
                        </span>
                      </div>
                    </div>
                  )}

                  {selectedDate && selectedTime && (
                    <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="h-4 w-4 text-purple-600" />
                        <h3 className="font-semibold text-gray-900">Data e Horário</h3>
                      </div>
                      <p className="text-gray-700 font-medium">{formatDate(selectedDate)}</p>
                      <p className="text-gray-700 font-medium">{selectedTime}</p>
                    </div>
                  )}

                  {clientName && (
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                      <div className="flex items-center gap-2 mb-2">
                        <User className="h-4 w-4 text-gray-600" />
                        <h3 className="font-semibold text-gray-900">Cliente</h3>
                      </div>
                      <p className="text-gray-700 font-medium">{clientName}</p>
                      {clientPhone && <p className="text-gray-600">{clientPhone}</p>}
                    </div>
                  )}

                  {currentStep === 4 && (
                    <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                      <div className="flex items-center space-x-2 text-green-700 mb-2">
                        <CheckCircle className="h-5 w-5" />
                        <span className="font-semibold">Pronto para confirmar!</span>
                      </div>
                      <p className="text-sm text-green-600">
                        Clique em "Confirmar Agendamento" para finalizar.
                      </p>
                    </div>
                  )}

                  {/* Features */}
                  <div className="space-y-3 pt-4 border-t border-gray-200">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Shield className="h-4 w-4 text-green-600" />
                      <span>Agendamento seguro</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <MessageCircle className="h-4 w-4 text-blue-600" />
                      <span>Confirmação por WhatsApp</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Zap className="h-4 w-4 text-yellow-600" />
                      <span>Confirmação instantânea</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Award className="h-4 w-4 text-purple-600" />
                      <span>Profissionais qualificados</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
