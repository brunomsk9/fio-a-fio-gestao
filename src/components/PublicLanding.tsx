
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Scissors, Calendar, Users, Clock } from 'lucide-react';

export const PublicLanding: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-amber-400 to-amber-600 rounded-3xl mb-6">
            <Scissors className="h-10 w-10 text-slate-900" />
          </div>
          <h1 className="text-5xl font-bold text-white mb-4">BarberPro</h1>
          <p className="text-xl text-gray-300 mb-8">Sistema de Gestão para Barbearias</p>
          
          {/* Botões principais */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              onClick={() => navigate('/book')}
              className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-900 font-bold text-lg px-8 py-3"
              size="lg"
            >
              <Calendar className="h-5 w-5 mr-2" />
              Agendar Horário
            </Button>
            
            <Button 
              onClick={() => navigate('/login')}
              variant="outline"
              className="border-amber-500/50 text-amber-400 hover:bg-amber-500/20 font-semibold text-lg px-8 py-3"
              size="lg"
            >
              Login Profissional
            </Button>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <Card className="bg-slate-800/50 border-amber-500/20 backdrop-blur-sm">
            <CardHeader className="text-center">
              <Calendar className="h-12 w-12 text-amber-400 mx-auto mb-4" />
              <CardTitle className="text-white">Agendamento Fácil</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 text-center">
                Agende seu horário de forma rápida e prática, sem complicações.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-amber-500/20 backdrop-blur-sm">
            <CardHeader className="text-center">
              <Users className="h-12 w-12 text-amber-400 mx-auto mb-4" />
              <CardTitle className="text-white">Barbeiros Especializados</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 text-center">
                Escolha entre diversos profissionais qualificados e especializados.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-amber-500/20 backdrop-blur-sm">
            <CardHeader className="text-center">
              <Clock className="h-12 w-12 text-amber-400 mx-auto mb-4" />
              <CardTitle className="text-white">Horários Flexíveis</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 text-center">
                Funcionamento em horários que se adequam à sua rotina.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Card className="bg-slate-800/30 border-amber-500/20 backdrop-blur-sm max-w-2xl mx-auto">
            <CardContent className="pt-8">
              <h2 className="text-3xl font-bold text-white mb-4">
                Pronto para ficar no estilo?
              </h2>
              <p className="text-gray-300 mb-6">
                Agende agora mesmo seu horário e garante o melhor corte!
              </p>
              <Button 
                onClick={() => navigate('/book')}
                className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-900 font-bold text-xl px-12 py-4"
                size="lg"
              >
                Agendar Agora
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
