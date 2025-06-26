
import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { toast } from '../hooks/use-toast';
import { supabase } from '../integrations/supabase/client';
import { Barbershop } from '../types';
import { Plus, Edit, Trash2, MapPin, Phone, Users, Scissors } from 'lucide-react';

const BarbershopsPage: React.FC = () => {
  const [barbershops, setBarbershops] = useState<Barbershop[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBarbershop, setEditingBarbershop] = useState<Barbershop | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
  });

  useEffect(() => {
    fetchBarbershops();
  }, []);

  const fetchBarbershops = async () => {
    console.log('Iniciando busca das barbearias...');
    setIsLoading(true);
    try {
      console.log('Conectando com Supabase...');
      const { data, error } = await supabase
        .from('barbershops')
        .select(`
          *,
          barber_barbershops!inner(
            barber_id,
            barbers(name, email, phone, specialties)
          ),
          services(id, name, price, duration)
        `)
        .order('created_at', { ascending: false });
      
      console.log('Resposta do Supabase:', { data, error });
      
      if (error) {
        console.error('Erro na consulta:', error);
        // Fallback para busca simples se a consulta com JOIN falhar
        const { data: simpleData, error: simpleError } = await supabase
          .from('barbershops')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (simpleError) {
          throw simpleError;
        }
        
        const mappedBarbershops: Barbershop[] = (simpleData || []).map(item => ({
          id: item.id,
          name: item.name,
          address: item.address,
          phone: item.phone,
          adminId: item.admin_id || '',
          services: [],
          barbers: [],
          createdAt: new Date(item.created_at || Date.now())
        }));
        
        setBarbershops(mappedBarbershops);
        return;
      }
      
      console.log('Barbearias encontradas:', data?.length || 0);
      
      // Mapeando os dados do Supabase para o tipo Barbershop
      const mappedBarbershops: Barbershop[] = (data || []).map(item => ({
        id: item.id,
        name: item.name,
        address: item.address,
        phone: item.phone,
        adminId: item.admin_id || '',
        services: item.services || [],
        barbers: item.barber_barbershops?.map((bb: any) => bb.barbers).filter(Boolean) || [],
        createdAt: new Date(item.created_at || Date.now())
      }));
      
      setBarbershops(mappedBarbershops);
    } catch (error) {
      console.error('Erro ao buscar barbearias:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as barbearias. Verifique se o banco foi configurado.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingBarbershop) {
        const { error } = await supabase
          .from('barbershops')
          .update(formData)
          .eq('id', editingBarbershop.id);
        
        if (error) throw error;
        toast({ title: "Sucesso!", description: "Barbearia atualizada com sucesso" });
      } else {
        const { error } = await supabase
          .from('barbershops')
          .insert([formData]);
        
        if (error) throw error;
        toast({ title: "Sucesso!", description: "Barbearia criada com sucesso" });
      }
      
      setIsDialogOpen(false);
      setEditingBarbershop(null);
      setFormData({ name: '', address: '', phone: '' });
      fetchBarbershops();
    } catch (error) {
      console.error('Error saving barbershop:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar a barbearia",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (barbershop: Barbershop) => {
    setEditingBarbershop(barbershop);
    setFormData({
      name: barbershop.name,
      address: barbershop.address,
      phone: barbershop.phone,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta barbearia?')) return;
    
    try {
      const { error } = await supabase
        .from('barbershops')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      toast({ title: "Sucesso!", description: "Barbearia excluída com sucesso" });
      fetchBarbershops();
    } catch (error) {
      console.error('Error deleting barbershop:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir a barbearia",
        variant: "destructive"
      });
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">Barbearias</h1>
            <p className="text-gray-400">Gerencie todas as barbearias do sistema</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Nova Barbearia
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-800 border-orange-500/20">
              <DialogHeader>
                <DialogTitle className="text-white">
                  {editingBarbershop ? 'Editar Barbearia' : 'Nova Barbearia'}
                </DialogTitle>
              </DialogHeader>
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
                  <Label htmlFor="address" className="text-white">Endereço</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
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
                <Button type="submit" className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white">
                  {editingBarbershop ? 'Atualizar' : 'Criar'} Barbearia
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-white text-lg">Carregando barbearias...</div>
          </div>
        ) : barbershops.length === 0 ? (
          <div className="text-center py-12">
            <Scissors className="h-16 w-16 text-orange-400 mx-auto mb-4" />
            <h3 className="text-xl text-white mb-2">Nenhuma barbearia encontrada</h3>
            <p className="text-gray-400 mb-4">
              Parece que o banco de dados ainda não foi configurado ou não há barbearias cadastradas.
            </p>
            <p className="text-sm text-gray-500">
              Execute os scripts SQL no Supabase ou crie sua primeira barbearia.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {barbershops.map((barbershop) => (
              <Card key={barbershop.id} className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 border-orange-500/20 hover:border-orange-400/40 transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Scissors className="h-5 w-5 text-orange-400" />
                    {barbershop.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-gray-300">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-orange-400" />
                      <span className="text-sm">{barbershop.address}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-orange-400" />
                      <span className="text-sm">{barbershop.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-orange-400" />
                      <span className="text-sm">{barbershop.barbers?.length || 0} Barbeiros</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Scissors className="h-4 w-4 text-orange-400" />
                      <span className="text-sm">{barbershop.services?.length || 0} Serviços</span>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(barbershop)}
                      className="border-orange-500/50 text-orange-400 hover:bg-orange-500/20"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(barbershop.id)}
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

export default BarbershopsPage;
