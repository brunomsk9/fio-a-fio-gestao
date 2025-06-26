
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Scissors, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export const LoginForm: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(email, password);
      toast({
        title: "Login realizado com sucesso!",
        description: "Bem-vindo ao BarberPro",
      });
      navigate('/');
    } catch (error) {
      toast({
        title: "Erro no login",
        description: "Verifique suas credenciais e tente novamente",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const demoCredentials = [
    { email: 'super@barberpro.com', role: 'Super Admin' },
    { email: 'admin@barberpro.com', role: 'Administrador' },
    { email: 'joao@barberpro.com', role: 'Barbeiro' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/')}
            className="text-white hover:bg-amber-500/20"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h2 className="text-2xl font-bold text-white">Voltar ao Início</h2>
        </div>

        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl mb-4">
            <Scissors className="h-8 w-8 text-slate-900" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">BarberPro</h1>
          <p className="text-gray-400">Login para Profissionais</p>
        </div>

        <Card className="bg-slate-800/50 backdrop-blur-sm border-amber-500/20">
          <CardHeader>
            <CardTitle className="text-white">Acesso Profissional</CardTitle>
            <CardDescription className="text-gray-400">
              Área restrita para Barbeiros, Administradores e Super Admins
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-slate-700/50 border-amber-500/30 text-white placeholder:text-gray-400"
                  placeholder="seu@email.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-white">Senha</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-slate-700/50 border-amber-500/30 text-white placeholder:text-gray-400 pr-10"
                    placeholder="••••••••"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 text-gray-400 hover:text-white"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-900 font-semibold"
                disabled={isLoading}
              >
                {isLoading ? 'Entrando...' : 'Entrar'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/30 backdrop-blur-sm border-amber-500/10">
          <CardHeader>
            <CardTitle className="text-sm text-white">Credenciais de Demonstração</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {demoCredentials.map((cred, index) => (
              <Button
                key={index}
                variant="ghost"
                size="sm"
                className="w-full justify-between text-xs text-gray-300 hover:text-white hover:bg-slate-700/50"
                onClick={() => {
                  setEmail(cred.email);
                  setPassword('demo123');
                }}
              >
                <span>{cred.role}</span>
                <span className="text-amber-400">{cred.email}</span>
              </Button>
            ))}
            <p className="text-xs text-gray-500 mt-2">Senha para todos: demo123</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
