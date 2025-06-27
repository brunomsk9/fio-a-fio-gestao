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
import { toast } from '../hooks/use-toast';
import { supabase } from '../integrations/supabase/client';
import { createUserWithAuth } from '../integrations/supabase/adminClient';
import { useAuthStore } from '../store/authStore';
import { Barber, Barbershop, DatabaseBarber, DatabaseBarbershop } from '../types';
import { transformDatabaseBarber, transformDatabaseBarbershop } from '../utils/dataTransforms';
import { Plus, Edit, Trash2, Scissors, Search, Users, UserPlus, Building2, X } from 'lucide-react';

const BarbersPage: React.FC = () => {
  const { user } = useAuthStore();
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [barbershops, setBarbershops] = useState<Barbershop[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBarber, setEditingBarber] = useState<Barber | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    specialties: [] as string[],
    password: '',
    barbershopIds: [] as string[]
  });

  // Estado para busca de barbearias
  const [barbershopSearch, setBarbershopSearch] = useState('');

  useEffect(() => {
    fetchBarbers();
    fetchBarbershops();
  }, []);

  const fetchBarbers = async () => {
    try {
      let query;
      
      if (user?.role === 'super-admin') {
        // Super admin vê todos os barbeiros
        query = supabase.from('barbers').select(`
          *,
          barber_barbershops(barbershop_id)
        `);
      } else if (user?.role === 'admin' && user.barbershopId) {
        // Admin vê apenas barbeiros das suas barbearias
        query = supabase
          .from('barber_barbershops')
          .select(`
            barber_id,
            barbers:barbers!barber_barbershops_barber_id_fkey(
              id, 
              name, 
              email, 
              phone, 
              specialties,
              barber_barbershops(barbershop_id)
            )
          `)
          .eq('barbershop_id', user.barbershopId);
      } else {
        // Outros usuários não devem acessar esta página
        setBarbers([]);
        return;
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      
      let transformedBarbers: Barber[] = [];
      
      if (user?.role === 'super-admin') {
        // Para super admin, usar a estrutura original
        transformedBarbers = (data || []).map(item => ({
          id: item.id,
          name: item.name,
          email: item.email,
          phone: item.phone,
          specialties: item.specialties || [],
          barbershops: item.barber_barbershops?.map((bb: any) => bb.barbershop_id) || [],
          workingHours: {}
        }));
      } else if (user?.role === 'admin') {
        // Para admin, usar a estrutura da consulta com JOIN
        transformedBarbers = (data || [])
          .filter(item => item.barbers)
          .map(item => ({
            id: item.barbers.id,
            name: item.barbers.name,
            email: item.barbers.email,
            phone: item.barbers.phone,
            specialties: item.barbers.specialties || [],
            barbershops: item.barbers.barber_barbershops?.map((bb: any) => bb.barbershop_id) || [],
            workingHours: {}
          }));
      }
      
      setBarbers(transformedBarbers);
    } catch (error) {
      console.error('Error fetching barbers:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os barbeiros",
        variant: "destructive"
      });
    }
  };

  const fetchBarbershops = async () => {
    try {
      let query = supabase.from('barbershops').select('*');
      
      if (user?.role === 'admin' && user.barbershopId) {
        // Admin vê apenas suas barbearias
        query = query.eq('admin_id', user.id);
      }
      
      const { data, error } = await query.order('name');
      
      if (error) throw error;
      
      const transformedBarbershops = (data as DatabaseBarbershop[]).map(shop => transformDatabaseBarbershop(shop));
      setBarbershops(transformedBarbershops);
    } catch (error) {
      console.error('Error fetching barbershops:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Iniciando handleSubmit com formData:', formData);
    
    try {
      if (editingBarber) {
        console.log('Editando barbeiro existente:', editingBarber.id);
        // Atualizar barbeiro existente
        const { error } = await supabase
          .from('users')
          .update({
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            specialties: formData.specialties
          })
          .eq('id', editingBarber.id);
        
        if (error) throw error;
        toast({ title: "Sucesso!", description: "Barbeiro atualizado com sucesso" });
      } else {
        console.log('Criando novo barbeiro...');
        // Criar novo barbeiro usando o cliente administrativo
        const result = await createUserWithAuth({
          email: formData.email,
          password: formData.password,
          name: formData.name,
          phone: formData.phone,
          role: 'barber',
          barbershopIds: formData.barbershopIds || user?.barbershopIds || undefined
        });
        
        console.log('Resultado createUserWithAuth:', result);
        
        if (result.success) {
          console.log('Usuário criado com sucesso, verificando vinculação...');
          // Se barbearias foram selecionadas, vincular automaticamente
          if (formData.barbershopIds.length > 0 && result.user?.id) {
            console.log('Vinculando barbeiro às barbearias:', formData.barbershopIds);
            try {
              const barberBarbershopsData = formData.barbershopIds.map(barbershopId => ({
                barber_id: result.user.id,
                barbershop_id: barbershopId
              }));

              const { error: linkError } = await supabase
                .from('barber_barbershops')
                .insert(barberBarbershopsData);
              
              if (linkError) {
                console.warn('Erro ao vincular barbeiro às barbearias:', linkError);
                toast({
                  title: "Aviso",
                  description: "Barbeiro criado, mas não foi possível vincular às barbearias automaticamente. Você pode fazer isso manualmente.",
                  variant: "default"
                });
              } else {
                toast({ 
                  title: "Sucesso!", 
                  description: `Barbeiro criado e vinculado a ${formData.barbershopIds.length} barbearia(s) com sucesso` 
                });
              }
            } catch (linkError) {
              console.warn('Erro ao vincular barbeiro às barbearias:', linkError);
              toast({
                title: "Aviso",
                description: "Barbeiro criado, mas não foi possível vincular às barbearias automaticamente. Você pode fazer isso manualmente.",
                variant: "default"
              });
            }
          } else {
            toast({ 
              title: "Sucesso!", 
              description: result.message 
            });
          }
        } else {
          console.error('Erro na criação do usuário:', result.error);
          throw new Error(result.error);
        }
      }
      
      console.log('Formulário enviado com sucesso, limpando...');
      setIsDialogOpen(false);
      setEditingBarber(null);
      setFormData({ name: '', email: '', phone: '', specialties: [], password: '', barbershopIds: [] });
      setBarbershopSearch(''); // Limpar busca
      fetchBarbers();
    } catch (error: any) {
      console.error('Erro completo no handleSubmit:', error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível salvar o barbeiro",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (barber: Barber) => {
    setEditingBarber(barber);
    setFormData({
      name: barber.name,
      email: barber.email,
      phone: barber.phone,
      specialties: barber.specialties,
      password: '',
      barbershopIds: barber.barbershops || []
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este barbeiro?')) return;
    
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      toast({ title: "Sucesso!", description: "Barbeiro excluído com sucesso" });
      fetchBarbers();
    } catch (error) {
      console.error('Error deleting barber:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o barbeiro",
        variant: "destructive"
      });
    }
  };

  const filteredBarbers = barbers.filter(barber =>
    barber.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    barber.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    barber.phone.includes(searchTerm)
  );

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

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {user?.role === 'admin' ? 'Meus Barbeiros' : 'Gerenciamento de Barbeiros'}
            </h1>
            <p className="text-gray-600">
              {user?.role === 'admin' 
                ? 'Gerencie os barbeiros das suas barbearias' 
                : 'Gerencie todos os barbeiros do sistema'
              }
            </p>
          </div>
          
          {(user?.role === 'super-admin' || user?.role === 'admin') && (
            <Button
              onClick={() => setIsDialogOpen(true)}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Novo Barbeiro
            </Button>
          )}
        </div>

        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <Input
            type="text"
            placeholder="Buscar barbeiros..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBarbers.map((barber) => (
            <Card key={barber.id} className="gradient-card border-0 shadow-soft hover:shadow-medium transition-all duration-300">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Scissors className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <CardTitle className="text-gray-900">{barber.name}</CardTitle>
                      <p className="text-sm text-gray-600">{barber.email}</p>
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(barber)}
                      className="hover:bg-gray-100"
                    >
                      <Edit className="h-4 w-4 text-gray-600" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(barber.id)}
                      className="hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2 text-gray-600">
                  <Users className="h-4 w-4" />
                  <span className="text-sm">{barber.phone}</span>
                </div>
                
                {barber.specialties.length > 0 && (
                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-600 mb-2">Especialidades:</p>
                    <div className="flex flex-wrap gap-1">
                      {barber.specialties.map((specialty, index) => (
                        <span
                          key={index}
                          className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full"
                        >
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {barber.barbershops.length > 0 && (
                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-600 mb-2">Barbearias:</p>
                    <div className="flex flex-wrap gap-1">
                      {barber.barbershops.map((barbershopId) => {
                        const barbershop = barbershops.find(b => b.id === barbershopId);
                        return barbershop ? (
                          <span
                            key={barbershopId}
                            className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full"
                          >
                            {barbershop.name}
                          </span>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredBarbers.length === 0 && (
          <Card className="gradient-card border-0 shadow-soft">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="text-center">
                <Scissors className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum barbeiro encontrado</h3>
                <p className="text-gray-600">
                  {searchTerm ? 'Nenhum barbeiro corresponde à sua busca.' : 'Comece adicionando seu primeiro barbeiro.'}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="text-gray-900">
              {editingBarber ? 'Editar Barbeiro' : 'Novo Barbeiro'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto pr-2">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-gray-700">Nome Completo</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Nome do barbeiro"
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
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
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
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  placeholder="(11) 99999-9999"
                  className="bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              {!editingBarber && (
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-700">Senha Temporária</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    placeholder="Senha temporária"
                    className="bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    required={!editingBarber}
                  />
                  <p className="text-xs text-gray-500">O barbeiro poderá alterar a senha no primeiro login</p>
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="specialties" className="text-gray-700">Especialidades</Label>
                <Input
                  id="specialties"
                  value={formData.specialties.join(', ')}
                  onChange={(e) => setFormData({
                    ...formData, 
                    specialties: e.target.value.split(',').map(s => s.trim()).filter(s => s)
                  })}
                  placeholder="Corte, Barba, Sombrancelha (separadas por vírgula)"
                  className="bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              {/* Seleção de Barbearias */}
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
            </form>
          </div>
          
          {/* Botões fixos na parte inferior */}
          <div className="flex justify-end space-x-2 pt-4 border-t border-gray-200 flex-shrink-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                console.log('Cancelando formulário...');
                setIsDialogOpen(false);
                setEditingBarber(null);
                setFormData({ name: '', email: '', phone: '', specialties: [], password: '', barbershopIds: [] });
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
              {editingBarber ? 'Atualizar' : 'Criar'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default BarbersPage;
