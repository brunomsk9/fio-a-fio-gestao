import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../integrations/supabase/client';
import { createUserWithAuth, deleteUserWithAuth } from '../integrations/supabase/adminClient';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { Trash2, UserPlus, Search, Phone, Mail, MapPin } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { toast } from '../components/ui/sonner';
import { User, Barbershop } from '../types';
import { transformDatabaseUser } from '../utils/dataTransforms';

const BarbersPage: React.FC = () => {
  const { user } = useAuthStore();
  const [barbers, setBarbers] = useState<User[]>([]);
  const [barbershops, setBarbershops] = useState<Barbershop[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateBarberOpen, setIsCreateBarberOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [newBarber, setNewBarber] = useState({
    email: '',
    password: '',
    name: '',
    phone: '',
    role: 'barber' as const,
    barbershopId: ''
  });

  const handleCreateBarber = async () => {
    if (!newBarber.email || !newBarber.password || !newBarber.name || !newBarber.phone) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    setIsLoading(true);
    try {
      const result = await createUserWithAuth({
        email: newBarber.email,
        password: newBarber.password,
        name: newBarber.name,
        phone: newBarber.phone,
        role: newBarber.role,
        barbershopId: newBarber.barbershopId || undefined
      });

      if (result.success) {
        toast.success('Barbeiro criado com sucesso');
        setIsCreateBarberOpen(false);
        setNewBarber({
          email: '',
          password: '',
          name: '',
          phone: '',
          role: 'barber',
          barbershopId: ''
        });
        loadBarbers();
      } else {
        toast.error(result.message || 'Erro ao criar barbeiro');
      }
    } catch (error: any) {
      toast.error(error.message || 'Erro ao criar barbeiro');
    } finally {
      setIsLoading(false);
    }
  };

  const loadBarbers = async () => {
    try {
      let query = supabase
        .from('users')
        .select('*')
        .eq('role', 'barber')
        .order('created_at', { ascending: false });

      // Se for admin, filtrar pelos barbeiros da sua barbearia
      if (user?.role === 'admin' && user.barbershopId) {
        query = query.eq('barbershop_id', user.barbershopId);
      }

      const { data, error } = await query;

      if (error) throw error;

      if (data) {
        const transformedBarbers = data.map(transformDatabaseUser);
        setBarbers(transformedBarbers);
      }
    } catch (error) {
      console.error('Erro ao carregar barbeiros:', error);
      toast.error('Erro ao carregar barbeiros');
    }
  };

  const loadBarbershops = async () => {
    try {
      let query = supabase
        .from('barbershops')
        .select('*')
        .order('name', { ascending: true });

      // Se for admin, mostrar apenas suas barbearias
      if (user?.role === 'admin' && user.barbershopId) {
        query = query.eq('id', user.barbershopId);
      }

      const { data, error } = await query;

      if (error) throw error;

      if (data) {
        setBarbershops(data.map(shop => ({
          id: shop.id,
          name: shop.name,
          address: shop.address,
          phone: shop.phone,
          adminId: shop.admin_id || '',
          services: [],
          barbers: [],
          createdAt: new Date(shop.created_at || Date.now())
        })));
      }
    } catch (error) {
      console.error('Erro ao carregar barbearias:', error);
    }
  };

  const handleDeleteBarber = async (barberId: string) => {
    if (!confirm('Tem certeza que deseja deletar este barbeiro?')) return;

    setIsLoading(true);
    try {
      const result = await deleteUserWithAuth(barberId);
      
      if (result.success) {
        toast.success('Barbeiro deletado com sucesso');
        loadBarbers();
      } else {
        toast.error(result.message || 'Erro ao deletar barbeiro');
      }
    } catch (error: any) {
      toast.error(error.message || 'Erro ao deletar barbeiro');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBarbers();
    loadBarbershops();
  }, [user]);

  const filteredBarbers = barbers.filter(barber =>
    barber.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    barber.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    barber.phone.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const canManageBarbers = user?.role === 'super-admin' || user?.role === 'admin';

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Barbeiros</h1>
          <p className="text-gray-600">Gerencie os barbeiros do sistema</p>
        </div>
        {canManageBarbers && (
          <Dialog open={isCreateBarberOpen} onOpenChange={setIsCreateBarberOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <UserPlus className="h-4 w-4 mr-2" />
                Adicionar Barbeiro
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Criar Novo Barbeiro</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome</Label>
                  <Input
                    id="name"
                    value={newBarber.name}
                    onChange={(e) => setNewBarber(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Nome completo"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newBarber.email}
                    onChange={(e) => setNewBarber(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="email@exemplo.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <Input
                    id="password"
                    type="password"
                    value={newBarber.password}
                    onChange={(e) => setNewBarber(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="••••••••"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    value={newBarber.phone}
                    onChange={(e) => setNewBarber(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="(11) 99999-9999"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="barbershop">Barbearia</Label>
                  <Select value={newBarber.barbershopId} onValueChange={(value) => setNewBarber(prev => ({ ...prev, barbershopId: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma barbearia" />
                    </SelectTrigger>
                    <SelectContent>
                      {barbershops.map((shop) => (
                        <SelectItem key={shop.id} value={shop.id}>
                          {shop.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsCreateBarberOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleCreateBarber} disabled={isLoading}>
                    {isLoading ? 'Criando...' : 'Criar Barbeiro'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Buscar barbeiros..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Barbers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBarbers.map((barber) => (
          <Card key={barber.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold text-lg">
                      {barber.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <CardTitle className="text-lg">{barber.name}</CardTitle>
                    <Badge variant="secondary">Barbeiro</Badge>
                  </div>
                </div>
                {canManageBarbers && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteBarber(barber.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Mail className="h-4 w-4" />
                <span>{barber.email}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Phone className="h-4 w-4" />
                <span>{barber.phone}</span>
              </div>
              {barber.barbershopId && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <MapPin className="h-4 w-4" />
                  <span>
                    {barbershops.find(shop => shop.id === barber.barbershopId)?.name || 'Barbearia não encontrada'}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredBarbers.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-xl mb-2">👨‍💼</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum barbeiro encontrado</h3>
          <p className="text-gray-500 mb-4">
            {searchTerm ? 'Tente ajustar sua busca' : 'Adicione o primeiro barbeiro ao sistema'}
          </p>
          {canManageBarbers && !searchTerm && (
            <Button onClick={() => setIsCreateBarberOpen(true)}>
              <UserPlus className="h-4 w-4 mr-2" />
              Adicionar Barbeiro
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default BarbersPage;
