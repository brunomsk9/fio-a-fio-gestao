import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Alert, AlertDescription } from '../components/ui/alert';
import { toast } from '../hooks/use-toast';
import { supabase } from '../integrations/supabase/client';
import { createUserWithAuth, deleteUserWithAuth } from '../integrations/supabase/adminClient';
import { useAuthStore } from '../store/authStore';
import { User, Barbershop } from '../types';
import { Plus, Edit, Trash2, UserPlus, Crown, Shield, Scissors, User as UserIcon, AlertCircle, Info, Key } from 'lucide-react';

const UsersPage: React.FC = () => {
  const { user } = useAuthStore();
  const [users, setUsers] = useState<User[]>([]);
  const [barbershops, setBarbershops] = useState<Barbershop[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'client' as 'super-admin' | 'admin' | 'barber' | 'client',
    barbershopId: '',
    password: ''
  });

  useEffect(() => {
    if (user?.role === 'super-admin') {
      fetchUsers();
      fetchBarbershops();
    }
  }, [user]);

  const fetchBarbershops = async () => {
    try {
      const { data, error } = await supabase
        .from('barbershops')
        .select('*')
        .order('name');

      if (error) throw error;
      setBarbershops(data || []);
    } catch (error) {
      console.error('Erro ao buscar barbearias:', error);
    }
  };

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .select(`
          *,
          barbershop:barbershops!users_barbershop_id_fkey(id, name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mappedUsers: User[] = (data || []).map(item => ({
        id: item.id,
        name: item.name,
        email: item.email,
        phone: item.phone,
        role: item.role as any,
        barbershopId: item.barbershop_id || undefined,
        barbershop: item.barbershop ? {
          id: item.barbershop.id,
          name: item.barbershop.name,
          address: '',
          phone: '',
          adminId: '',
          services: [],
          barbers: [],
          createdAt: new Date()
        } : undefined
      }));

      setUsers(mappedUsers);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os usuários",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingUser) {
        // Atualizar usuário existente
        const { error } = await supabase
          .from('users')
          .update({
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            role: formData.role,
            barbershop_id: formData.barbershopId || null
          })
          .eq('id', editingUser.id);
        
        if (error) throw error;
        toast({ title: "Sucesso!", description: "Usuário atualizado com sucesso" });
      } else {
        // Criar novo usuário usando o cliente administrativo
        const result = await createUserWithAuth({
          email: formData.email,
          password: formData.password,
          name: formData.name,
          phone: formData.phone,
          role: formData.role,
          barbershopId: formData.barbershopId || undefined
        });
        
        if (result.success) {
          toast({ 
            title: "Sucesso!", 
            description: result.message 
          });
        } else {
          throw new Error(result.error);
        }
      }
      
      setIsDialogOpen(false);
      setEditingUser(null);
      setFormData({ name: '', email: '', phone: '', role: 'client', barbershopId: '', password: '' });
      fetchUsers();
    } catch (error: any) {
      console.error('Error saving user:', error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível salvar o usuário",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      barbershopId: user.barbershopId || '',
      password: ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita.')) return;
    
    try {
      const result = await deleteUserWithAuth(id);
      
      if (result.success) {
        toast({ title: "Sucesso!", description: result.message });
        fetchUsers();
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível excluir o usuário",
        variant: "destructive"
      });
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'super-admin':
        return <Crown className="h-4 w-4 text-yellow-400" />;
      case 'admin':
        return <Shield className="h-4 w-4 text-blue-400" />;
      case 'barber':
        return <Scissors className="h-4 w-4 text-green-400" />;
      default:
        return <UserIcon className="h-4 w-4 text-gray-400" />;
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'super-admin':
        return 'Super Admin';
      case 'admin':
        return 'Administrador';
      case 'barber':
        return 'Barbeiro';
      default:
        return 'Cliente';
    }
  };

  // Verificar se o usuário é superadmin
  if (user?.role !== 'super-admin') {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <Crown className="h-16 w-16 text-yellow-400 mx-auto mb-4" />
            <h3 className="text-xl text-white mb-2">Acesso Restrito</h3>
            <p className="text-gray-400">
              Apenas super administradores podem gerenciar usuários.
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">Gerenciamento de Usuários</h1>
            <p className="text-gray-400">Super Admin - Gerencie todos os usuários do sistema</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white">
                <UserPlus className="h-4 w-4 mr-2" />
                Novo Usuário
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-800 border-blue-500/20 max-w-md">
              <DialogHeader>
                <DialogTitle className="text-white">
                  {editingUser ? 'Editar Usuário' : 'Novo Usuário'}
                </DialogTitle>
              </DialogHeader>
              
              {!editingUser && (
                <Alert className="bg-green-500/10 border-green-500/20">
                  <Key className="h-4 w-4 text-green-400" />
                  <AlertDescription className="text-green-300 text-sm">
                    O usuário será criado automaticamente na autenticação e na tabela.
                  </AlertDescription>
                </Alert>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name" className="text-white">Nome</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="bg-gray-700 border-gray-600 text-white"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email" className="text-white">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="bg-gray-700 border-gray-600 text-white"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone" className="text-white">Telefone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="bg-gray-700 border-gray-600 text-white"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="role" className="text-white">Função</Label>
                  <Select value={formData.role} onValueChange={(value: any) => setFormData({...formData, role: value})}>
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-700 border-gray-600">
                      <SelectItem value="client" className="text-white">Cliente</SelectItem>
                      <SelectItem value="barber" className="text-white">Barbeiro</SelectItem>
                      <SelectItem value="admin" className="text-white">Administrador</SelectItem>
                      <SelectItem value="super-admin" className="text-white">Super Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {formData.role === 'admin' && (
                  <div>
                    <Label htmlFor="barbershop" className="text-white">Barbearia</Label>
                    <Select value={formData.barbershopId} onValueChange={(value) => setFormData({...formData, barbershopId: value})}>
                      <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                        <SelectValue placeholder="Selecione uma barbearia" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-700 border-gray-600">
                        {barbershops.map((barbershop) => (
                          <SelectItem key={barbershop.id} value={barbershop.id} className="text-white">
                            {barbershop.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                {!editingUser && (
                  <div>
                    <Label htmlFor="password" className="text-white">Senha</Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      className="bg-gray-700 border-gray-600 text-white"
                      required={!editingUser}
                      minLength={6}
                    />
                  </div>
                )}
                <Button type="submit" className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white">
                  {editingUser ? 'Atualizar' : 'Criar'} Usuário
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-white text-lg">Carregando usuários...</div>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-12">
            <UserIcon className="h-16 w-16 text-blue-400 mx-auto mb-4" />
            <h3 className="text-xl text-white mb-2">Nenhum usuário encontrado</h3>
            <p className="text-gray-400">
              Crie seu primeiro usuário para começar a gerenciar o sistema.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {users.map((userItem) => (
              <Card key={userItem.id} className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 border-blue-500/20 hover:border-blue-400/40 transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    {getRoleIcon(userItem.role)}
                    {userItem.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-gray-300">
                    <div className="flex items-center gap-2">
                      <UserIcon className="h-4 w-4 text-blue-400" />
                      <span className="text-sm">{userItem.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-blue-400" />
                      <span className="text-sm">{getRoleLabel(userItem.role)}</span>
                    </div>
                    {userItem.barbershop && (
                      <div className="flex items-center gap-2">
                        <Scissors className="h-4 w-4 text-green-400" />
                        <span className="text-sm text-green-400">
                          {userItem.barbershop.name}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(userItem)}
                      className="border-blue-500/50 text-blue-400 hover:bg-blue-500/20"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(userItem.id)}
                      className="border-red-500/50 text-red-400 hover:bg-red-500/20"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default UsersPage; 