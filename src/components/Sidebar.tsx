import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useIsMobile } from '../hooks/use-mobile';
import { cn } from '../lib/utils';
import { supabase } from '../integrations/supabase/client';
import { 
  Home, 
  Users, 
  Scissors, 
  Calendar, 
  Settings, 
  BarChart3, 
  Building2,
  X,
  Menu,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';

interface AdminBarbershop {
  id: string;
  name: string;
}

export const Sidebar: React.FC = () => {
  const { user } = useAuthStore();
  const location = useLocation();
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);
  const [adminBarbershops, setAdminBarbershops] = useState<AdminBarbershop[]>([]);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (user?.role === 'admin' && user?.id) {
      fetchAdminBarbershops();
    }
  }, [user?.id, user?.role]);

  const fetchAdminBarbershops = async () => {
    try {
      console.log('Buscando barbearias para admin:', user?.id);
      const { data, error } = await supabase
        .from('barbershops')
        .select('id, name')
        .eq('admin_id', user?.id)
        .order('name');

      if (error) {
        console.error('Erro ao buscar barbearias:', error);
        throw error;
      }
      
      console.log('Barbearias encontradas:', data);
      setAdminBarbershops(data || []);
    } catch (error) {
      console.error('Erro ao buscar barbearias do admin:', error);
    }
  };

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const menuItems = [
    {
      title: 'Dashboard',
      href: '/',
      icon: Home,
      roles: ['super-admin', 'admin', 'barber', 'client']
    },
    {
      title: 'Barbearias',
      href: '/barbershops',
      icon: Building2,
      roles: ['super-admin'],
      isSection: false,
      subItems: []
    },
    {
      title: 'Minhas Barbearias',
      href: '/barbershops',
      icon: Building2,
      roles: ['admin'],
      isSection: adminBarbershops.length > 0,
      subItems: adminBarbershops.map(shop => ({
        title: shop.name,
        href: `/barbershops/${shop.id}`,
        icon: Building2
      }))
    },
    {
      title: 'Usuários',
      href: '/users',
      icon: Users,
      roles: ['super-admin']
    },
    {
      title: 'Barbeiros',
      href: '/barbers',
      icon: Scissors,
      roles: ['super-admin', 'admin']
    },
    {
      title: 'Agendamentos',
      href: '/bookings',
      icon: Calendar,
      roles: ['super-admin', 'admin', 'barber']
    },
    {
      title: 'Meus Agendamentos',
      href: '/my-bookings',
      icon: Calendar,
      roles: ['client']
    },
    {
      title: 'Relatórios',
      href: '/reports',
      icon: BarChart3,
      roles: ['super-admin', 'admin']
    },
    {
      title: 'Configurações',
      href: '/settings',
      icon: Settings,
      roles: ['super-admin', 'admin', 'barber', 'client']
    }
  ];

  const filteredMenuItems = menuItems.filter(item => 
    item.roles.includes(user?.role || 'client')
  );

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-gray-200/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-soft">
              <span className="text-white font-bold text-xl">F</span>
            </div>
            <div className="hidden lg:block">
              <h2 className="text-xl font-bold text-gray-900">Fio a Fio</h2>
              <p className="text-xs text-gray-500">Gestão</p>
            </div>
          </div>
          {isMobile && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="lg:hidden p-2 hover:bg-gray-100/80 rounded-lg"
            >
              <X className="h-5 w-5 text-gray-600" />
            </Button>
          )}
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {filteredMenuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href;
          const isExpanded = expandedSections.has(item.title);
          
          if (item.isSection && item.subItems && item.subItems.length > 0) {
            return (
              <div key={item.href} className="space-y-1">
                <button
                  onClick={() => toggleSection(item.title)}
                  className={cn(
                    "w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200",
                    "hover:bg-gray-100/80 hover:shadow-soft",
                    isActive 
                      ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-medium" 
                      : "text-gray-700 hover:text-gray-900"
                  )}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{item.title}</span>
                  </div>
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </button>
                
                {isExpanded && (
                  <div className="ml-4 space-y-1">
                    {item.subItems.map((subItem) => {
                      const SubIcon = subItem.icon;
                      const isSubActive = location.pathname === subItem.href;
                      
                      return (
                        <Link
                          key={subItem.href}
                          to={subItem.href}
                          onClick={() => isMobile && setIsOpen(false)}
                          className={cn(
                            "flex items-center space-x-3 px-4 py-2 rounded-lg transition-all duration-200",
                            "hover:bg-gray-100/80",
                            isSubActive 
                              ? "bg-blue-100 text-blue-700" 
                              : "text-gray-600 hover:text-gray-900"
                          )}
                        >
                          <SubIcon className="h-4 w-4" />
                          <span className="text-sm font-medium">{subItem.title}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }
          
          return (
            <Link
              key={item.href}
              to={item.href}
              onClick={() => isMobile && setIsOpen(false)}
              className={cn(
                "flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200",
                "hover:bg-gray-100/80 hover:shadow-soft",
                isActive 
                  ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-medium" 
                  : "text-gray-700 hover:text-gray-900"
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="font-medium">{item.title}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-200/50">
        <div className="flex items-center space-x-3 p-3 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100/50">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-soft">
            <span className="text-white font-semibold text-sm">
              {user?.name?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="hidden lg:block flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.name}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {user?.email}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden p-2 hover:bg-gray-100/80 rounded-lg"
          >
            <Menu className="h-5 w-5 text-gray-600" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-80 p-0 bg-white shadow-medium border-r border-gray-200">
          <SidebarContent />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <aside className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-white/80 backdrop-blur-md border-r border-gray-200/50 z-30 shadow-soft">
      <SidebarContent />
    </aside>
  );
};
