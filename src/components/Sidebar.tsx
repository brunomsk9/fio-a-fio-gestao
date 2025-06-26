
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Button } from './ui/button';
import { cn } from '../lib/utils';
import { 
  Calendar, 
  Users, 
  Scissors, 
  Building2, 
  BarChart3, 
  Settings,
  Clock,
  User
} from 'lucide-react';

const menuItems = {
  'super-admin': [
    { icon: Building2, label: 'Barbearias', path: '/barbershops' },
    { icon: BarChart3, label: 'Relatórios Gerais', path: '/reports' },
    { icon: Settings, label: 'Configurações', path: '/settings' },
  ],
  'admin': [
    { icon: Calendar, label: 'Agendamentos', path: '/bookings' },
    { icon: Users, label: 'Barbeiros', path: '/barbers' },
    { icon: Scissors, label: 'Serviços', path: '/services' },
    { icon: BarChart3, label: 'Relatórios', path: '/reports' },
    { icon: Settings, label: 'Configurações', path: '/settings' },
  ],
  'barber': [
    { icon: Calendar, label: 'Minha Agenda', path: '/my-schedule' },
    { icon: Clock, label: 'Horários', path: '/working-hours' },
    { icon: BarChart3, label: 'Meus Relatórios', path: '/my-reports' },
  ],
  'client': [
    { icon: Calendar, label: 'Agendar', path: '/book' },
    { icon: Clock, label: 'Meus Agendamentos', path: '/my-bookings' },
    { icon: User, label: 'Perfil', path: '/profile' },
  ]
};

export const Sidebar: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const items = menuItems[user?.role as keyof typeof menuItems] || [];

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <div className="w-64 bg-slate-900/90 backdrop-blur-sm border-r border-amber-500/20 h-screen">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg flex items-center justify-center">
            <Scissors className="h-6 w-6 text-slate-900" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">BarberPro</h2>
            <p className="text-xs text-amber-400">Gestão Profissional</p>
          </div>
        </div>

        <nav className="space-y-2">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Button
                key={item.path}
                variant="ghost"
                className={cn(
                  "w-full justify-start text-left font-medium transition-all duration-200",
                  isActive
                    ? "bg-amber-500/20 text-amber-400 border-r-2 border-amber-500"
                    : "text-gray-300 hover:text-white hover:bg-slate-800/50"
                )}
                onClick={() => handleNavigation(item.path)}
              >
                <Icon className="mr-3 h-5 w-5" />
                {item.label}
              </Button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
