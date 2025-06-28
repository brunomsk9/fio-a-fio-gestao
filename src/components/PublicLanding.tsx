
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { supabase } from '../integrations/supabase/client';
import { 
  Scissors, 
  Clock, 
  MapPin, 
  Star, 
  Calendar, 
  Phone, 
  ArrowRight,
  CheckCircle,
  Users,
  Award,
  Sparkles
} from 'lucide-react';

interface Barbershop {
  id: string;
  name: string;
  address: string;
  phone: string;
}

interface Service {
  id: string;
  name: string;
  duration: number;
  price: number;
  description?: string;
}

export const PublicLanding: React.FC = () => {
  const [barbershops, setBarbershops] = useState<Barbershop[]>([]);
  const [featuredServices, setFeaturedServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchBarbershops();
    fetchServices();
  }, []);

  const fetchBarbershops = async () => {
    try {
      const { data, error } = await supabase
        .from('barbershops')
        .select('id, name, address, phone')
        .limit(3);

      if (error) {
        console.error('Erro ao buscar barbearias:', error);
        return;
      }

      setBarbershops(data || []);
    } catch (error) {
      console.error('Erro ao buscar barbearias:', error);
    }
  };

  const fetchServices = async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('id, name, duration, price, description')
        .limit(6);

      if (error) {
        console.error('Erro ao buscar serviços:', error);
        return;
      }

      setFeaturedServices(data || []);
    } catch (error) {
      console.error('Erro ao buscar serviços:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="border-b border-white/20 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-lg">
              <Scissors className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Fio a Fio</h1>
              <p className="text-xs text-gray-500">Sua barbearia ideal</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link to="/login">
              <Button 
                variant="outline" 
                size="sm" 
                className="border-blue-200 text-blue-700 hover:bg-blue-50"
              >
                Área Profissional
              </Button>
            </Link>
            <Link to="/book">
              <Button 
                size="sm" 
                className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white shadow-lg"
              >
                Agendar Agora
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-indigo-700/10"></div>
        <div className="relative max-w-7xl mx-auto px-6 text-center">
          <div className="inline-flex items-center space-x-2 bg-white/90 rounded-full px-4 py-2 mb-8 shadow-lg">
            <Sparkles className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-gray-700">Agendamento Online Gratuito</span>
          </div>
          
          <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Sua Barbearia
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-700">
              Ideal Te Espera
            </span>
          </h2>
          
          <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
            Encontre os melhores profissionais da região e agende seu horário de forma prática e segura. 
            Qualidade garantida e atendimento personalizado.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/book">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white text-lg px-8 py-4 shadow-xl">
                <Calendar className="mr-2 h-5 w-5" />
                Agendar Agora
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Por que escolher o Fio a Fio?</h3>
            <p className="text-gray-600 text-lg">Facilitamos seu agendamento com as melhores barbearias</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/80">
              <CardHeader className="text-center pb-2">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-gray-900">Agendamento Rápido</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600">
                  Agende em poucos cliques, sem complicação. Escolha o horário que melhor se adequa à sua rotina.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/80">
              <CardHeader className="text-center pb-2">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Award className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-gray-900">Profissionais Qualificados</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600">
                  Apenas barbeiros experientes e qualificados. Qualidade garantida em cada atendimento.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/80">
              <CardHeader className="text-center pb-2">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <MapPin className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-gray-900">Localização Conveniente</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600">
                  Encontre barbearias próximas a você. Praticidade e comodidade na palma da sua mão.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Services Section */}
      {!isLoading && featuredServices.length > 0 && (
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold text-gray-900 mb-4">Nossos Serviços</h3>
              <p className="text-gray-600 text-lg">Cuidado completo para o homem moderno</p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredServices.map((service) => (
                <Card key={service.id} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/90">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-gray-900">{service.name}</CardTitle>
                      <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                        R$ {service.price.toFixed(2)}
                      </Badge>
                    </div>
                    <CardDescription className="flex items-center text-gray-600">
                      <Clock className="h-4 w-4 mr-1" />
                      {service.duration} min
                    </CardDescription>
                  </CardHeader>
                  {service.description && (
                    <CardContent>
                      <p className="text-gray-600 text-sm">{service.description}</p>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Barbershops Section */}
      {!isLoading && barbershops.length > 0 && (
        <section className="py-16 bg-white/50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold text-gray-900 mb-4">Barbearias Parceiras</h3>
              <p className="text-gray-600 text-lg">Conheça alguns dos nossos parceiros</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {barbershops.map((barbershop) => (
                <Card key={barbershop.id} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/90">
                  <CardHeader>
                    <CardTitle className="text-gray-900 flex items-center">
                      <Scissors className="h-5 w-5 mr-2 text-blue-600" />
                      {barbershop.name}
                    </CardTitle>
                    <CardDescription className="flex items-start text-gray-600">
                      <MapPin className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
                      {barbershop.address}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-gray-600">
                        <Phone className="h-4 w-4 mr-1" />
                        {barbershop.phone}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-700">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h3 className="text-4xl font-bold text-white mb-6">
            Pronto para uma Experiência Única?
          </h3>
          <p className="text-xl text-blue-100 mb-10 leading-relaxed">
            Agende agora mesmo e descubra por que somos a escolha de milhares de clientes satisfeitos.
          </p>
          <Link to="/book">
            <Button size="lg" variant="secondary" className="bg-white text-blue-700 hover:bg-gray-50 text-lg px-8 py-4 shadow-xl">
              <Calendar className="mr-2 h-5 w-5" />
              Fazer Agendamento
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center">
                  <Scissors className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h4 className="text-xl font-bold">Fio a Fio</h4>
                  <p className="text-gray-400 text-sm">Sua barbearia ideal</p>
                </div>
              </div>
              <p className="text-gray-400">
                Conectamos você aos melhores profissionais da região com agendamento prático e seguro.
              </p>
            </div>
            
            <div>
              <h5 className="font-semibold mb-4">Links Úteis</h5>
              <div className="space-y-2">
                <Link to="/book" className="block text-gray-400 hover:text-white transition-colors">
                  Agendar Serviço
                </Link>
                <Link to="/login" className="block text-gray-400 hover:text-white transition-colors">
                  Área Profissional
                </Link>
              </div>
            </div>
            
            <div>
              <h5 className="font-semibold mb-4">Suporte</h5>
              <div className="space-y-2">
                <p className="text-gray-400">contato@fioafio.com</p>
                <p className="text-gray-400">(11) 99999-9999</p>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p className="text-gray-400">
              © 2024 Fio a Fio. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
