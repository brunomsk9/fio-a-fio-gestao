import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Checkbox } from '../components/ui/checkbox';
import { Badge } from '../components/ui/badge';
import { Alert, AlertDescription } from '../components/ui/alert';
import { toast } from '../hooks/use-toast';
import { supabase } from '../integrations/supabase/client';
import { createUserWithAuth, deleteUserWithAuth } from '../integrations/supabase/adminClient';
import { useAuthStore } from '../store/authStore';
import { User, Barbershop } from '../types';
import { Plus, Edit, Trash2, UserPlus, Crown, Shield, Scissors, User as UserIcon, Key, Search, Filter, Users, Building2, X } from 'lucide-react';

const UsersPage: React.FC = () => {
  const { user } = useAuthStore();
  const [users, setUsers] = useState<User[]>([]);
  const [barbershops, setBarbershops] = useState<Barbershop[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'client' as 'super-admin' | 'admin' | 'barber' | 'client',
    barbershopId: '',
    barbershopIds: [] as string[],
    password: ''
  });

  // Estado para busca de barbearias
  const [barbershopSearch, setBarbershopSearch] = useState('');

  useEffect(() => {
    console.log('UsersPage useEffect - user:', user);
    if (user?.role === 'super-admin') {
      console.log('Usuário é super-admin, buscando dados...');
      fetchUsers();
      fetchBarbershops();
    } else {
      console.log('Usuário não é super-admin:', user?.role);
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
      console.log('Buscando usuários...');
      
      // Query simples primeiro para verificar se funciona
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro na query:', error);
        throw error;
      }

      console.log('Usuários encontrados:', data?.length || 0);

      const mappedUsers: User[] = (data || []).map(item => ({
        id: item.id,
        name: item.name,
        email: item.email,
        phone: item.phone,
        role: item.role as any,
        barbershopId: item.barbershop_id || undefined,
        barbershop: undefined,
        barbershops: []
      }));

      setUsers(mappedUsers);
      console.log('Usuários mapeados:', mappedUsers.length);
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

        // Se for admin e há barbearias selecionadas, vincular às barbearias
        if (formData.role === 'admin' && formData.barbershopIds.length > 0) {
          const updates = formData.barbershopIds.map(barbershopId => ({
            id: barbershopId,
            admin_id: editingUser.id
          }));

          const { error: barbershopError } = await supabase
            .from('barbershops')
            .upsert(updates);

          if (barbershopError) {
            console.warn('Erro ao vincular admin às barbearias:', barbershopError);
          }
        }

        // Se for barbeiro e há barbearias selecionadas, vincular às barbearias
        if (formData.role === 'barber' && formData.barbershopIds.length > 0) {
          const barberBarbershopsData = formData.barbershopIds.map(barbershopId => ({
            barber_id: editingUser.id,
            barbershop_id: barbershopId
          }));

          const { error: barberError } = await supabase
            .from('barber_barbershops')
            .upsert(barberBarbershopsData, { onConflict: 'barber_id,barbershop_id' });

          if (barberError) {
            console.warn('Erro ao vincular barbeiro às barbearias:', barberError);
          }
        }

        toast({ title: "Sucesso!", description: "Usuário atualizado com sucesso" });
      } else {
        // Criar novo usuário usando o cliente administrativo
        const result = await createUserWithAuth({
          email: formData.email,
          password: formData.password,
          name: formData.name,
          phone: formData.phone,
          role: formData.role,
          barbershopId: formData.barbershopId || undefined,
          barbershopIds: formData.barbershopIds.length > 0 ? formData.barbershopIds : undefined
        });
        
        if (result.success && result.user?.id) {
          // Se há barbearias selecionadas, vincular automaticamente
          if (formData.barbershopIds.length > 0) {
            if (formData.role === 'admin') {
              // Vincular admin às barbearias
              const updates = formData.barbershopIds.map(barbershopId => ({
                id: barbershopId,
                admin_id: result.user.id
              }));

              const { error: barbershopError } = await supabase
                .from('barbershops')
                .upsert(updates);

              if (barbershopError) {
                console.warn('Erro ao vincular admin às barbearias:', barbershopError);
              }
            } else if (formData.role === 'barber') {
              // Vincular barbeiro às barbearias
              const barberBarbershopsData = formData.barbershopIds.map(barbershopId => ({
                barber_id: result.user.id,
                barbershop_id: barbershopId
              }));

              const { error: barberError } = await supabase
                .from('barber_barbershops')
                .upsert(barberBarbershopsData, { onConflict: 'barber_id,barbershop_id' });

              if (barberError) {
                console.warn('Erro ao vincular barbeiro às barbearias:', barberError);
              }
            }
          }

          toast({ 
            title: "Sucesso!", 
            description: formData.barbershopIds.length > 0 
              ? `Usuário criado e vinculado a ${formData.barbershopIds.length} barbearia(s)`
              : result.message 
          });
        } else {
          throw new Error(result.error);
        }
      }
      
      setIsDialogOpen(false);
      setEditingUser(null);
      setFormData({ name: '', email: '', phone: '', role: 'client', barbershopId: '', barbershopIds: [], password: '' });
      setBarbershopSearch(''); // Limpar busca
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

  const handleEdit = async (user: User) => {
    setEditingUser(user);
    
    // Buscar barbearias vinculadas ao usuário
    let userBarbershopIds: string[] = [];
    
    if (user.role === 'admin') {
      // Buscar barbearias onde o usuário é admin
      const { data: adminBarbershops } = await supabase
        .from('barbershops')
        .select('id')
        .eq('admin_id', user.id);
      
      userBarbershopIds = adminBarbershops?.map(b => b.id) || [];
    } else if (user.role === 'barber') {
      // Buscar barbearias onde o usuário é barbeiro
      const { data: barberBarbershops } = await supabase
        .from('barber_barbershops')
        .select('barbershop_id')
        .eq('barber_id', user.id);
      
      userBarbershopIds = barberBarbershops?.map(b => b.barbershop_id) || [];
    }
    
    setFormData({
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      barbershopId: user.barbershopId || '',
      barbershopIds: userBarbershopIds,
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
        return <Crown className="h-4 w-4 text-amber-500" />;
      case 'admin':
        return <Shield className="h-4 w-4 text-blue-500" />;
      case 'barber':
        return <Scissors className="h-4 w-4 text-green-500" />;
      default:
        return <UserIcon className="h-4 w-4 text-gray-500" />;
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

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'super-admin':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'admin':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'barber':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone.includes(searchTerm);
    
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    
    return matchesSearch && matchesRole;
  });

  // Função para alternar seleção de barbearia
  const toggleBarbershopSelection = (barbershopId: string) => {
    setFormData(prev => ({
      ...prev,
      barbershopIds: prev.barbershopIds.includes(barbershopId)
        ? prev.barbershopIds.filter(id => id !== barbershopId)
        : [...prev.barbershopIds, barbershopId]
    }));
  };

  // Função para remover barbearia da seleção
  const removeBarbershopFromSelection = (barbershopId: string) => {
    setFormData(prev => ({
      ...prev,
      barbershopIds: prev.barbershopIds.filter(id => id !== barbershopId)
    }));
  };

  // Filtrar barbearias baseado na busca
  const filteredBarbershops = barbershops.filter(barbershop =>
    barbershop.name.toLowerCase().includes(barbershopSearch.toLowerCase()) ||
    barbershop.address.toLowerCase().includes(barbershopSearch.toLowerCase())
  );

  // Limpar busca
  const clearBarbershopSearch = () => {
    setBarbershopSearch('');
  };

  // Selecionar todas as barbearias filtradas
  const selectAllFiltered = () => {
    const newBarbershopIds = [...formData.barbershopIds];
    filteredBarbershops.forEach(barbershop => {
      if (!newBarbershopIds.includes(barbershop.id)) {
        newBarbershopIds.push(barbershop.id);
      }
    });
    setFormData(prev => ({ ...prev, barbershopIds: newBarbershopIds }));
  };

  // Desmarcar todas as barbearias filtradas
  const deselectAllFiltered = () => {
    const newBarbershopIds = formData.barbershopIds.filter(id => 
      !filteredBarbershops.find(barbershop => barbershop.id === id)
    );
    setFormData(prev => ({ ...prev, barbershopIds: newBarbershopIds }));
  };

  if (user?.role !== 'super-admin') {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Crown className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Acesso Restrito</h2>
            <p className="text-gray-600">Apenas super administradores podem acessar esta página.</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Usuários</h1>
            <p className="text-gray-600">Gerencie todos os usuários do sistema</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-soft hover:shadow-medium transition-all duration-300">
                <UserPlus className="h-4 w-4 mr-2" />
                Novo Usuário
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md max-h-[90vh] overflow-hidden flex flex-col">
              <DialogHeader className="flex-shrink-0">
                <DialogTitle className="text-gray-900">
                  {editingUser ? 'Editar Usuário' : 'Novo Usuário'}
                </DialogTitle>
              </DialogHeader>
              
              <div className="flex-1 overflow-y-auto pr-2">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-gray-700">Nome Completo</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Nome completo"
                      className="bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-700">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="email@exemplo.com"
                      className="bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-gray-700">Telefone</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="(11) 99999-9999"
                      className="bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role" className="text-gray-700">Função</Label>
                    <Select value={formData.role} onValueChange={(value: any) => setFormData({ ...formData, role: value })}>
                      <SelectTrigger className="bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="client">Cliente</SelectItem>
                        <SelectItem value="barber">Barbeiro</SelectItem>
                        <SelectItem value="admin">Administrador</SelectItem>
                        <SelectItem value="super-admin">Super Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {(formData.role === 'admin' || formData.role === 'barber') && (
                    <div className="space-y-3">
                      <Label className="text-gray-700">Barbearias</Label>
                      
                      {/* Barbearias Selecionadas */}
                      {formData.barbershopIds.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-sm text-gray-600">Barbearias selecionadas:</p>
                          <div className="flex flex-wrap gap-2">
                            {formData.barbershopIds.map((barbershopId) => {
                              const barbershop = barbershops.find(b => b.id === barbershopId);
                              return barbershop ? (
                                <Badge key={barbershopId} variant="secondary" className="bg-blue-100 text-blue-800">
                                  <Building2 className="h-3 w-3 mr-1" />
                                  {barbershop.name}
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeBarbershopFromSelection(barbershopId)}
                                    className="h-4 w-4 p-0 ml-1 hover:bg-blue-200"
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </Badge>
                              ) : null;
                            })}
                          </div>
                        </div>
                      )}

                      {/* Lista de Barbearias Disponíveis */}
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600">Selecionar barbearias:</p>
                        
                        {/* Campo de busca */}
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            type="text"
                            placeholder="Buscar barbearias..."
                            value={barbershopSearch}
                            onChange={(e) => setBarbershopSearch(e.target.value)}
                            className="pl-10 pr-20 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-sm"
                          />
                          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex space-x-1">
                            {barbershopSearch && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={clearBarbershopSearch}
                                className="h-6 w-6 p-0 hover:bg-gray-100"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                        
                        {/* Botões de ação rápida */}
                        {filteredBarbershops.length > 0 && (
                          <div className="flex space-x-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={selectAllFiltered}
                              className="text-xs h-7"
                            >
                              Selecionar Todas
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={deselectAllFiltered}
                              className="text-xs h-7"
                            >
                              Desmarcar Todas
                            </Button>
                          </div>
                        )}
                        
                        {/* Resultados da busca */}
                        <div className="max-h-40 overflow-y-auto space-y-2 border rounded-lg p-2">
                          {filteredBarbershops.length > 0 ? (
                            filteredBarbershops.map((barbershop) => (
                              <div 
                                key={barbershop.id} 
                                className={`flex items-center space-x-3 p-2 rounded transition-colors ${
                                  formData.barbershopIds.includes(barbershop.id)
                                    ? 'bg-blue-50 border border-blue-200'
                                    : 'hover:bg-gray-50'
                                }`}
                              >
                                <Checkbox
                                  checked={formData.barbershopIds.includes(barbershop.id)}
                                  onCheckedChange={() => toggleBarbershopSelection(barbershop.id)}
                                />
                                <div className="flex-1">
                                  <div className={`font-medium ${
                                    formData.barbershopIds.includes(barbershop.id)
                                      ? 'text-blue-900'
                                      : 'text-gray-900'
                                  }`}>
                                    {barbershop.name}
                                  </div>
                                  <div className={`text-sm ${
                                    formData.barbershopIds.includes(barbershop.id)
                                      ? 'text-blue-700'
                                      : 'text-gray-600'
                                  }`}>
                                    {barbershop.address}
                                  </div>
                                </div>
                                {formData.barbershopIds.includes(barbershop.id) && (
                                  <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
                                    Selecionada
                                  </Badge>
                                )}
                              </div>
                            ))
                          ) : (
                            <div className="text-center py-4 text-gray-500">
                              <Search className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                              <p className="text-sm">Nenhuma barbearia encontrada</p>
                              {barbershopSearch && (
                                <p className="text-xs">Tente ajustar sua busca</p>
                              )}
                            </div>
                          )}
                        </div>
                        
                        {/* Contador de resultados */}
                        {barbershopSearch && (
                          <p className="text-xs text-gray-500">
                            {filteredBarbershops.length} de {barbershops.length} barbearias encontradas
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                  {!editingUser && (
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-gray-700">Senha</Label>
                      <Input
                        id="password"
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        placeholder="Senha temporária"
                        className="bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        required={!editingUser}
                      />
                      <p className="text-xs text-gray-500">O usuário poderá alterar a senha no primeiro login</p>
                    </div>
                  )}
                </form>
              </div>
              
              {/* Botões fixos na parte inferior */}
              <div className="flex justify-end space-x-2 pt-4 border-t border-gray-200 flex-shrink-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false);
                    setEditingUser(null);
                    setFormData({ name: '', email: '', phone: '', role: 'client', barbershopId: '', barbershopIds: [], password: '' });
                    setBarbershopSearch(''); // Limpar busca
                  }}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit"
                  onClick={(e) => {
                    e.preventDefault();
                    handleSubmit(e as any);
                  }}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {editingUser ? 'Atualizar' : 'Criar'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              type="text"
              placeholder="Buscar usuários..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <Select value={filterRole} onValueChange={setFilterRole}>
            <SelectTrigger className="w-full sm:w-48 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as funções</SelectItem>
              <SelectItem value="super-admin">Super Admin</SelectItem>
              <SelectItem value="admin">Administrador</SelectItem>
              <SelectItem value="barber">Barbeiro</SelectItem>
              <SelectItem value="client">Cliente</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="gradient-card border-0 shadow-soft animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-gray-200 rounded mb-4"></div>
                  <div className="h-3 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUsers.map((userItem) => (
              <Card key={userItem.id} className="gradient-card border-0 shadow-soft hover:shadow-medium transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <UserIcon className="h-5 w-5 text-gray-600" />
                      </div>
                      <div>
                        <CardTitle className="text-gray-900">{userItem.name}</CardTitle>
                        <p className="text-sm text-gray-600">{userItem.email}</p>
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(userItem)}
                        className="hover:bg-gray-100"
                      >
                        <Edit className="h-4 w-4 text-gray-600" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(userItem.id)}
                        className="hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Key className="h-4 w-4" />
                    <span className="text-sm">{userItem.phone}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {getRoleIcon(userItem.role)}
                    <span className={`text-xs px-2 py-1 rounded-full border ${getRoleColor(userItem.role)}`}>
                      {getRoleLabel(userItem.role)}
                    </span>
                  </div>
                  
                  {userItem.barbershop && (
                    <div className="pt-4 border-t border-gray-200">
                      <div className="flex items-center space-x-2">
                        <Shield className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">Barbearia:</span>
                        <span className="text-sm font-medium text-gray-900">{userItem.barbershop.name}</span>
                      </div>
                    </div>
                  )}
                  
                  {/* Mostrar múltiplas barbearias se houver */}
                  {userItem.barbershops && userItem.barbershops.length > 1 && (
                    <div className="pt-2">
                      <div className="flex items-center space-x-2 mb-2">
                        <Building2 className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">Barbearias vinculadas:</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {userItem.barbershops.map((barbershop) => (
                          <Badge key={barbershop.id} variant="outline" className="text-xs">
                            {barbershop.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!isLoading && filteredUsers.length === 0 && (
          <Card className="gradient-card border-0 shadow-soft">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="text-center">
                <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum usuário encontrado</h3>
                <p className="text-gray-600">
                  {searchTerm || filterRole !== 'all' ? 'Nenhum usuário corresponde aos filtros aplicados.' : 'Comece criando seu primeiro usuário.'}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default UsersPage; 