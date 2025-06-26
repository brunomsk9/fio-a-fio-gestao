
import React from 'react';
import { useAuthStore } from '../store/authStore';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Bell, LogOut } from 'lucide-react';

export const Header: React.FC = () => {
  const { user, logout } = useAuthStore();

  const getRoleLabel = (role: string) => {
    const labels = {
      'super-admin': 'Super Administrador',
      'admin': 'Administrador',
      'barber': 'Barbeiro',
      'client': 'Cliente'
    };
    return labels[role as keyof typeof labels] || role;
  };

  return (
    <header className="bg-slate-800/50 backdrop-blur-sm border-b border-amber-500/20 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">BarberPro</h1>
          <p className="text-sm text-amber-400">{getRoleLabel(user?.role || '')}</p>
        </div>
        
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="text-white hover:bg-amber-500/20">
            <Bell className="h-5 w-5" />
          </Button>
          
          <div className="flex items-center gap-3">
            <Avatar className="border-2 border-amber-500">
              <AvatarFallback className="bg-amber-500 text-slate-900 font-semibold">
                {user?.name?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="hidden md:block">
              <p className="text-white font-medium">{user?.name}</p>
              <p className="text-sm text-gray-400">{user?.email}</p>
            </div>
          </div>
          
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={logout}
            className="text-white hover:bg-red-500/20 hover:text-red-400"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};
