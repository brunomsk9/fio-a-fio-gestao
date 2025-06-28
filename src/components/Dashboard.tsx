
import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { createUserWithAuth, deleteUserWithAuth } from '../integrations/supabase/adminClient';
import { supabase } from '../integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Trash2, Users, Building, Calendar, BarChart3, UserPlus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { toast } from './ui/sonner';
import { User, Barbershop } from '../types';
import { transformDatabaseUser, transformDatabaseBarbershop } from '../utils/dataTransforms';

export const Dashboard: React.FC = () => {
  const { user } = useAuthStore();
  const [users, setUsers] = useState<User[]>([]);
  const [barbershops, setBarbershops] = useState<Barbershop[]>([]);
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    name: '',
    phone: '',
    role: 'client' as 'super-admin' | 'admin' | 'barber' | 'client',
    barbershopId: ''
  });

  const handleCreateUser = async () => {
    if (!newUser.email || !newUser.password || !newUser.name || !newUser.phone) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    setIsLoading(true);
    try {
      const result = await createUserWithAuth({
        email: newUser.email,
        password: newUser.password,
        name: newUser.name,
        phone: newUser.phone,
        role: newUser.role,
        barbershopId: newUser.barbershopId || undefined
      });

      if (result.success) {
        toast.success('Usuário criado com sucesso');
        setIsCreateUserOpen(false);
        setNewUser({
          email: '',
          password: '',
          name: '',
          phone: '',
          role: 'client',
          barbershopId: ''
        });
        loadUsers();
      } else {
        toast.error(result.message || 'Erro ao criar usuário');
      }
    } catch (error: any) {
      toast.error(error.message || 'Erro ao criar usuário');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Tem certeza que deseja deletar este usuário?')) return;

    setIsLoading(true);
    try {
      const result = await deleteUserWithAuth(userId);
      
      if (result.success) {
        toast.success('Usuário deletado com sucesso');
        loadUsers();
      } else {
        toast.error(result.message || 'Erro ao deletar usuário');
      }
    } catch (error: any) {
      toast.error(error.message || 'Erro ao deletar usuário');
    } finally {
      setIsLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        const transformedUsers = data.map((dbUser) => transformDatabaseUser(dbUser));
        setUsers(transformedUsers);
      }
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
    }
  };

  const loadBarbershops = async () => {
    try {
      const { data, error } = await supabase
        .from('barbershops')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        const transformedBarbershops = data.map((dbBarbershop) => transformDatabaseBarbershop(dbBarbershop));
        setBarbershops(transformedBarbershops);
      }
    } catch (error) {
      console.error('Erro ao carregar barbearias:', error);
    }
  };

  useEffect(() => {
    loadUsers();
    loadBarbershops();
  }, []);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Carregando...</h2>
          <p className="text-gray-600">Verificando autenticação</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Bem-vindo, {user.name}</p>
        </div>
        {user.role === 'super-admin' && (
          <Dialog open={isCreateUserOpen} onOpenChange={setIsCreateUserOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <UserPlus className="h-4 w-4 mr-2" />
                Criar Usuário
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Criar Novo Usuário</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome</Label>
                  <Input
                    id="name"
                    value={newUser.name}
                    onChange={(e) => setNewUser(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Nome completo"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="email@exemplo.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <Input
                    id="password"
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="••••••••"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    value={newUser.phone}
                    onChange={(e) => setNewUser(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="(11) 99999-9999"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Função</Label>
                  <Select value={newUser.role} onValueChange={(value: any) => setNewUser(prev => ({ ...prev, role: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="client">Cliente</SelectItem>
                      <SelectItem value="barber">Barbeiro</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="super-admin">Super Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {(newUser.role === 'barber' || newUser.role === 'admin') && (
                  <div className="space-y-2">
                    <Label htmlFor="barbershop">Barbearia</Label>
                    <Select value={newUser.barbershopId} onValueChange={(value) => setNewUser(prev => ({ ...prev, barbershopId: value }))}>
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
                )}
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsCreateUserOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleCreateUser} disabled={isLoading}>
                    {isLoading ? 'Criando...' : 'Criar Usuário'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Barbearias</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{barbershops.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Agendamentos</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Relatórios</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Users */}
      {user.role === 'super-admin' && (
        <Card>
          <CardHeader>
            <CardTitle>Usuários Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {users.slice(0, 5).map((userData) => (
                <div key={userData.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-semibold">
                        {userData.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">{userData.name}</p>
                      <p className="text-sm text-gray-500">{userData.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={userData.role === 'super-admin' ? 'default' : 'secondary'}>
                      {userData.role}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteUser(userData.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
