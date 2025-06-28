
import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { Trash2, Building, Search, Phone, Mail, MapPin, Users } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { toast } from '../components/ui/sonner';
import { User, Barbershop } from '../types';
import { transformDatabaseUser } from '../utils/dataTransforms';

const BarbershopsPage: React.FC = () => {
  const { user } = useAuthStore();
  const [barbershops, setBarbershops] = useState<Barbershop[]>([]);
  const [admins, setAdmins] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateBarbershopOpen, setIsCreateBarbershopOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [newBarbershop, setNewBarbershop] = useState({
    name: '',
    address: '',
    phone: '',
    adminId: ''
  });

  const loadBarbershops = async () => {
    try {
      let query = supabase
        .from('barbershops')
        .select('*')
        .order('created_at', { ascending: false });

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
          createdAt: new Date(shop.created_at || Date.now()),
          subdomain: shop.subdomain || undefined,
          customDomain: shop.custom_domain || undefined,
          domainEnabled: shop.domain_enabled || false
        })));
      }
    } catch (error) {
      console.error('Erro ao carregar barbearias:', error);
      toast.error('Erro ao carregar barbearias');
    }
  };

  const loadAdmins = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'admin')
        .order('name', { ascending: true });

      if (error) throw error;

      if (data) {
        const transformedAdmins = data.map(transformDatabaseUser);
        setAdmins(transformedAdmins);
      }
    } catch (error) {
      console.error('Erro ao carregar admins:', error);
    }
  };

  const handleCreateBarbershop = async () => {
    if (!newBarbershop.name || !newBarbershop.address || !newBarbershop.phone) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('barbershops')
        .insert([{
          name: newBarbershop.name,
          address: newBarbershop.address,
          phone: newBarbershop.phone,
          admin_id: newBarbershop.adminId || null
        }])
        .select()
        .single();

      if (error) throw error;

      // Se um admin foi selecionado, atualizar o barbershop_id do admin
      if (newBarbershop.adminId && data) {
        const { error: updateError } = await supabase
          .from('users')
          .update({ barbershop_id: data.id })
          .eq('id', newBarbershop.adminId);

        if (updateError) {
          console.error('Erro ao atualizar admin:', updateError);
        }
      }

      toast.success('Barbearia criada com sucesso');
      setIsCreateBarbershopOpen(false);
      setNewBarbershop({
        name: '',
        address: '',
        phone: '',
        adminId: ''
      });
      loadBarbershops();
    } catch (error: any) {
      console.error('Erro ao criar barbearia:', error);
      toast.error(error.message || 'Erro ao criar barbearia');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteBarbershop = async (barbershopId: string) => {
    if (!confirm('Tem certeza que deseja deletar esta barbearia?')) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('barbershops')
        .delete()
        .eq('id', barbershopId);

      if (error) throw error;

      toast.success('Barbearia deletada com sucesso');
      loadBarbershops();
    } catch (error: any) {
      console.error('Erro ao deletar barbearia:', error);
      toast.error(error.message || 'Erro ao deletar barbearia');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBarbershops();
    if (user?.role === 'super-admin') {
      loadAdmins();
    }
  }, [user]);

  const filteredBarbershops = barbershops.filter(barbershop =>
    barbershop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    barbershop.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    barbershop.phone.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const canManageBarbershops = user?.role === 'super-admin';

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Barbearias</h1>
          <p className="text-gray-600">Gerencie as barbearias do sistema</p>
        </div>
        {canManageBarbershops && (
          <Dialog open={isCreateBarbershopOpen} onOpenChange={setIsCreateBarbershopOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Building className="h-4 w-4 mr-2" />
                Adicionar Barbearia
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Criar Nova Barbearia</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome</Label>
                  <Input
                    id="name"
                    value={newBarbershop.name}
                    onChange={(e) => setNewBarbershop(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Nome da barbearia"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Endereço</Label>
                  <Input
                    id="address"
                    value={newBarbershop.address}
                    onChange={(e) => setNewBarbershop(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="Endereço completo"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    value={newBarbershop.phone}
                    onChange={(e) => setNewBarbershop(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="(11) 99999-9999"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="admin">Administrador (Opcional)</Label>
                  <Select value={newBarbershop.adminId} onValueChange={(value) => setNewBarbershop(prev => ({ ...prev, adminId: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um administrador" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Sem administrador</SelectItem>
                      {admins.map((admin) => (
                        <SelectItem key={admin.id} value={admin.id}>
                          {admin.name} - {admin.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsCreateBarbershopOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleCreateBarbershop} disabled={isLoading}>
                    {isLoading ? 'Criando...' : 'Criar Barbearia'}
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
          placeholder="Buscar barbearias..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Barbershops Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBarbershops.map((barbershop) => (
          <Card key={barbershop.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <Building className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{barbershop.name}</CardTitle>
                    <Badge variant="outline">Barbearia</Badge>
                  </div>
                </div>
                {canManageBarbershops && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteBarbershop(barbershop.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <MapPin className="h-4 w-4" />
                <span>{barbershop.address}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Phone className="h-4 w-4" />
                <span>{barbershop.phone}</span>
              </div>
              {barbershop.adminId && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Users className="h-4 w-4" />
                  <span>
                    Admin: {admins.find(admin => admin.id === barbershop.adminId)?.name || 'Admin não encontrado'}
                  </span>
                </div>
              )}
              {barbershop.subdomain && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <span className="font-medium">Subdomínio:</span>
                  <span>{barbershop.subdomain}</span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredBarbershops.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-xl mb-2">🏪</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma barbearia encontrada</h3>
          <p className="text-gray-500 mb-4">
            {searchTerm ? 'Tente ajustar sua busca' : 'Adicione a primeira barbearia ao sistema'}
          </p>
          {canManageBarbershops && !searchTerm && (
            <Button onClick={() => setIsCreateBarbershopOpen(true)}>
              <Building className="h-4 w-4 mr-2" />
              Adicionar Barbearia
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default BarbershopsPage;
