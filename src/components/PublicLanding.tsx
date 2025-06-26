
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Scissors, Calendar, Users, Clock, Star, CheckCircle, MapPin } from 'lucide-react';

export const PublicLanding: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-orange-400 via-orange-500 to-red-600 rounded-full mb-8 shadow-2xl">
            <Scissors className="h-12 w-12 text-white" />
          </div>
          <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-600 mb-4">
            BarberPro
          </h1>
          <p className="text-2xl text-gray-300 mb-12 max-w-2xl mx-auto">
            Transforme seu visual com os melhores profissionais da cidade
          </p>
          
          {/* Botões principais */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-8">
            <Button 
              onClick={() => navigate('/book')}
              className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-bold text-xl px-12 py-4 rounded-full shadow-2xl transform hover:scale-105 transition-all duration-300"
              size="lg"
            >
              <Calendar className="h-6 w-6 mr-3" />
              Agendar Agora
            </Button>
            
            <Button 
              onClick={() => navigate('/login')}
              variant="outline"
              className="border-2 border-orange-500/70 text-orange-400 hover:bg-orange-500/20 hover:border-orange-400 font-semibold text-xl px-12 py-4 rounded-full backdrop-blur-sm"
              size="lg"
            >
              Área do Profissional
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto mb-16">
            <div className="text-center">
              <div className="text-4xl font-bold text-orange-400 mb-2">500+</div>
              <div className="text-gray-300">Clientes Satisfeitos</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-orange-400 mb-2">50+</div>
              <div className="text-gray-300">Barbeiros Parceiros</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-orange-400 mb-2">4.9</div>
              <div className="text-gray-300">Avaliação Média</div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <Card className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 border-orange-500/30 backdrop-blur-sm hover:border-orange-400/50 transition-all duration-300 group">
            <CardHeader className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Calendar className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-white text-xl">Agendamento Inteligente</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 text-center leading-relaxed">
                Sistema moderno de agendamento com confirmação automática e lembretes por WhatsApp.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 border-orange-500/30 backdrop-blur-sm hover:border-orange-400/50 transition-all duration-300 group">
            <CardHeader className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Users className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-white text-xl">Profissionais de Elite</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 text-center leading-relaxed">
                Barbeiros certificados e especializados em cortes modernos, clássicos e tendências.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 border-orange-500/30 backdrop-blur-sm hover:border-orange-400/50 transition-all duration-300 group">
            <CardHeader className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Clock className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-white text-xl">Horários Flexíveis</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 text-center leading-relaxed">
                Atendimento de segunda a sábado, com horários que se encaixam na sua agenda.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Serviços */}
        <div className="mb-16">
          <h2 className="text-4xl font-bold text-center text-white mb-12">Nossos Serviços</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: 'Corte Tradicional', price: 'R$ 25', icon: Scissors },
              { name: 'Corte + Barba', price: 'R$ 35', icon: Star },
              { name: 'Barba Completa', price: 'R$ 20', icon: CheckCircle },
              { name: 'Corte Premium', price: 'R$ 45', icon: Star }
            ].map((service, index) => (
              <Card key={index} className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 border-orange-500/20 backdrop-blur-sm hover:border-orange-400/40 transition-all duration-300">
                <CardContent className="p-6 text-center">
                  <service.icon className="h-8 w-8 text-orange-400 mx-auto mb-3" />
                  <h3 className="text-white font-semibold mb-2">{service.name}</h3>
                  <p className="text-orange-400 text-xl font-bold">{service.price}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA Final */}
        <div className="text-center">
          <Card className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 border-orange-500/30 backdrop-blur-sm max-w-4xl mx-auto">
            <CardContent className="p-12">
              <div className="flex items-center justify-center mb-6">
                <MapPin className="h-8 w-8 text-orange-400 mr-3" />
                <h2 className="text-4xl font-bold text-white">
                  Encontre a Barbearia Perfeita
                </h2>
              </div>
              <p className="text-gray-300 text-xl mb-8 leading-relaxed">
                Mais de 20 barbearias parceiras em toda a cidade. 
                Agende seu horário e garanta o melhor atendimento!
              </p>
              <Button 
                onClick={() => navigate('/book')}
                className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-bold text-2xl px-16 py-6 rounded-full shadow-2xl transform hover:scale-105 transition-all duration-300"
                size="lg"
              >
                <Calendar className="h-7 w-7 mr-4" />
                Começar Agora
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="mt-16 text-center text-gray-400">
          <p>&copy; 2024 BarberPro. Todos os direitos reservados.</p>
        </div>
      </div>
    </div>
  );
};
