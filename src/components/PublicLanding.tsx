import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { 
  Scissors, 
  Calendar, 
  Users, 
  Clock, 
  Star, 
  CheckCircle, 
  MapPin, 
  ArrowRight,
  Phone,
  Mail,
  Instagram,
  Facebook,
  Award,
  Shield,
  Zap,
  Heart,
  TrendingUp,
  UserCheck,
  Clock3,
  Sparkles
} from 'lucide-react';

export const PublicLanding: React.FC = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const stats = [
    { number: '2.5k+', label: 'Clientes Satisfeitos', icon: Heart, color: 'text-red-500' },
    { number: '50+', label: 'Barbeiros Parceiros', icon: UserCheck, color: 'text-blue-500' },
    { number: '4.9', label: 'Avaliação Média', icon: Star, color: 'text-yellow-500' },
    { number: '24/7', label: 'Suporte Online', icon: Clock3, color: 'text-green-500' }
  ];

  const features = [
    {
      icon: Zap,
      title: 'Agendamento Instantâneo',
      description: 'Reserve seu horário em segundos com confirmação automática',
      color: 'from-blue-500 to-indigo-600',
      bgColor: 'from-blue-50 to-indigo-50'
    },
    {
      icon: Shield,
      title: 'Pagamento Seguro',
      description: 'Transações protegidas com a mais alta segurança',
      color: 'from-green-500 to-emerald-600',
      bgColor: 'from-green-50 to-emerald-50'
    },
    {
      icon: Award,
      title: 'Profissionais Certificados',
      description: 'Barbeiros especializados e com anos de experiência',
      color: 'from-purple-500 to-pink-600',
      bgColor: 'from-purple-50 to-pink-50'
    },
    {
      icon: Clock,
      title: 'Horários Flexíveis',
      description: 'Atendimento de segunda a sábado, das 8h às 20h',
      color: 'from-orange-500 to-red-600',
      bgColor: 'from-orange-50 to-red-50'
    },
    {
      icon: Sparkles,
      title: 'Experiência Premium',
      description: 'Ambiente moderno e atendimento personalizado',
      color: 'from-indigo-500 to-purple-600',
      bgColor: 'from-indigo-50 to-purple-50'
    },
    {
      icon: TrendingUp,
      title: 'Tendências Atuais',
      description: 'Cortes modernos e técnicas atualizadas',
      color: 'from-pink-500 to-rose-600',
      bgColor: 'from-pink-50 to-rose-50'
    }
  ];

  const services = [
    { 
      name: 'Corte Tradicional', 
      price: 'R$ 25', 
      description: 'Corte clássico com acabamento perfeito',
      icon: Scissors, 
      color: 'from-blue-500 to-indigo-600',
      popular: false
    },
    { 
      name: 'Corte + Barba', 
      price: 'R$ 35', 
      description: 'Combo completo para um visual renovado',
      icon: Star, 
      color: 'from-green-500 to-emerald-600',
      popular: true
    },
    { 
      name: 'Barba Completa', 
      price: 'R$ 20', 
      description: 'Modelagem e hidratação da barba',
      icon: CheckCircle, 
      color: 'from-orange-500 to-red-600',
      popular: false
    },
    { 
      name: 'Corte Premium', 
      price: 'R$ 45', 
      description: 'Corte exclusivo com produtos premium',
      icon: Award, 
      color: 'from-purple-500 to-pink-600',
      popular: false
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header/Navigation */}
      <header className="bg-white/90 backdrop-blur-md border-b border-slate-200/50 sticky top-0 z-50 transition-all duration-300">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Scissors className="h-7 w-7 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                BarberPro
              </span>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <a href="#servicos" className="text-slate-600 hover:text-blue-600 transition-colors font-medium">Serviços</a>
              <a href="#sobre" className="text-slate-600 hover:text-blue-600 transition-colors font-medium">Sobre</a>
              <a href="#contato" className="text-slate-600 hover:text-blue-600 transition-colors font-medium">Contato</a>
              <Button 
                onClick={() => navigate('/login')}
                variant="outline"
                className="border-blue-500 text-blue-600 hover:bg-blue-50 font-semibold"
              >
                Área Profissional
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-indigo-500/10"></div>
        <div className="container mx-auto px-6 py-24 relative">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className={`space-y-8 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <div className="space-y-6">
                <Badge className="bg-blue-100 text-blue-700 border-blue-200 px-4 py-2 text-sm font-medium">
                  🎉 Mais de 2.500 clientes satisfeitos
                </Badge>
                <h1 className="text-5xl lg:text-7xl font-bold text-slate-800 leading-tight">
                  Transforme seu
                  <span className="block bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    visual hoje
                  </span>
                </h1>
                <p className="text-xl text-slate-600 leading-relaxed max-w-lg">
                  Agende seu horário com os melhores barbeiros da cidade. 
                  Sistema moderno, rápido e confiável para cuidar do seu estilo.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  onClick={() => navigate('/book')}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold px-10 py-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 group text-lg"
                  size="lg"
                >
                  <Calendar className="h-6 w-6 mr-3 group-hover:translate-x-1 transition-transform" />
                  Agendar Agora
                  <ArrowRight className="h-6 w-6 ml-3 group-hover:translate-x-1 transition-transform" />
                </Button>
                
                <Button 
                  variant="outline"
                  className="border-slate-300 text-slate-700 hover:bg-slate-50 px-10 py-6 rounded-2xl text-lg font-semibold"
                  size="lg"
                >
                  <Phone className="h-6 w-6 mr-3" />
                  Fale Conosco
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 pt-8">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center group">
                    <div className="flex items-center justify-center mb-2">
                      <stat.icon className={`h-8 w-8 ${stat.color} group-hover:scale-110 transition-transform`} />
                    </div>
                    <div className="text-2xl font-bold text-slate-800 mb-1">{stat.number}</div>
                    <div className="text-slate-600 text-sm font-medium">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className={`relative transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <div className="bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-3xl p-8 backdrop-blur-sm">
                <div className="bg-white rounded-3xl p-8 shadow-2xl">
                  <div className="space-y-8">
                    {[
                      { icon: Scissors, title: 'Corte Moderno', desc: 'Profissional certificado', color: 'from-blue-500 to-indigo-600' },
                      { icon: CheckCircle, title: 'Agendamento Online', desc: 'Rápido e seguro', color: 'from-green-500 to-emerald-600' },
                      { icon: Star, title: 'Melhor Avaliação', desc: '4.9 estrelas', color: 'from-orange-500 to-red-600' }
                    ].map((item, index) => (
                      <div key={index} className="flex items-center space-x-4 group">
                        <div className={`w-14 h-14 bg-gradient-to-br ${item.color} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                          <item.icon className="h-7 w-7 text-white" />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-800 text-lg">{item.title}</h3>
                          <p className="text-slate-600">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <Badge className="bg-blue-100 text-blue-700 border-blue-200 px-4 py-2 text-sm font-medium mb-4">
              ✨ Por que escolher o BarberPro?
            </Badge>
            <h2 className="text-5xl font-bold text-slate-800 mb-6">Experiência Premium</h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Oferecemos a melhor experiência em agendamento de barbearia com tecnologia de ponta e atendimento personalizado
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className={`border-0 shadow-xl hover:shadow-2xl transition-all duration-500 group bg-gradient-to-br ${feature.bgColor} hover:scale-105`}>
                <CardHeader className="text-center pb-6">
                  <div className={`w-20 h-20 bg-gradient-to-br ${feature.color} rounded-3xl mx-auto mb-6 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                    <feature.icon className="h-10 w-10 text-white" />
                  </div>
                  <CardTitle className="text-slate-800 text-2xl font-bold">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-slate-600 leading-relaxed text-lg">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="servicos" className="py-24 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <Badge className="bg-green-100 text-green-700 border-green-200 px-4 py-2 text-sm font-medium mb-4">
              💇‍♂️ Nossos Serviços
            </Badge>
            <h2 className="text-5xl font-bold text-slate-800 mb-6">Serviços Premium</h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Oferecemos uma ampla variedade de serviços para cuidar do seu visual com qualidade e excelência
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service, index) => (
              <Card key={index} className="border-0 shadow-xl hover:shadow-2xl transition-all duration-500 bg-white group hover:scale-105 relative">
                {service.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-orange-500 to-red-500 text-white border-0 px-4 py-1 text-sm font-bold">
                    Mais Popular
                  </Badge>
                )}
                <CardContent className="p-8 text-center">
                  <div className={`w-20 h-20 bg-gradient-to-br ${service.color} rounded-3xl mx-auto mb-6 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                    <service.icon className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-slate-800 font-bold mb-3 text-xl">{service.name}</h3>
                  <p className="text-slate-600 mb-4 leading-relaxed">{service.description}</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">{service.price}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-blue-600 to-indigo-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="container mx-auto px-6 text-center relative">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-center mb-8">
              <MapPin className="h-12 w-12 text-white mr-4" />
              <h2 className="text-5xl font-bold text-white">
                Encontre a Barbearia Perfeita
              </h2>
            </div>
            <p className="text-blue-100 text-2xl mb-12 leading-relaxed max-w-3xl mx-auto">
              Mais de 20 barbearias parceiras em toda a cidade. 
              Agende seu horário e garanta o melhor atendimento com profissionais certificados!
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Button 
                onClick={() => navigate('/book')}
                className="bg-white text-blue-600 hover:bg-blue-50 font-bold text-xl px-16 py-8 rounded-3xl shadow-2xl transform hover:scale-105 transition-all duration-300 group"
                size="lg"
              >
                <Calendar className="h-8 w-8 mr-4 group-hover:translate-x-1 transition-transform" />
                Começar Agora
                <ArrowRight className="h-8 w-8 ml-4 group-hover:translate-x-1 transition-transform" />
              </Button>
              
              <Button 
                variant="outline"
                className="border-white text-blue-600 hover:bg-white/10 hover:text-white font-bold text-xl px-16 py-8 rounded-3xl"
                size="lg"
              >
                <Phone className="h-8 w-8 mr-4" />
                Falar Conosco
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-16">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12">
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center">
                  <Scissors className="h-7 w-7 text-white" />
                </div>
                <span className="text-2xl font-bold">BarberPro</span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                Transformando visuais e conectando clientes aos melhores barbeiros da cidade com tecnologia de ponta.
              </p>
              <div className="flex space-x-4">
                <Instagram className="h-6 w-6 hover:text-blue-400 cursor-pointer transition-colors" />
                <Facebook className="h-6 w-6 hover:text-blue-400 cursor-pointer transition-colors" />
              </div>
            </div>
            
            <div>
              <h3 className="font-bold text-lg mb-6">Serviços</h3>
              <ul className="space-y-3 text-slate-300">
                <li className="hover:text-white transition-colors cursor-pointer">Corte Tradicional</li>
                <li className="hover:text-white transition-colors cursor-pointer">Corte + Barba</li>
                <li className="hover:text-white transition-colors cursor-pointer">Barba Completa</li>
                <li className="hover:text-white transition-colors cursor-pointer">Corte Premium</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold text-lg mb-6">Empresa</h3>
              <ul className="space-y-3 text-slate-300">
                <li className="hover:text-white transition-colors cursor-pointer">Sobre Nós</li>
                <li className="hover:text-white transition-colors cursor-pointer">Parceiros</li>
                <li className="hover:text-white transition-colors cursor-pointer">Carreiras</li>
                <li className="hover:text-white transition-colors cursor-pointer">Blog</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold text-lg mb-6">Contato</h3>
              <div className="space-y-4 text-slate-300">
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5" />
                  <span>(11) 99999-9999</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5" />
                  <span>contato@barberpro.com</span>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5" />
                  <span>São Paulo, SP</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-slate-800 mt-12 pt-8 text-center text-slate-400">
            <p>&copy; 2024 BarberPro. Todos os direitos reservados. | Desenvolvido com ❤️ para transformar visuais</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
