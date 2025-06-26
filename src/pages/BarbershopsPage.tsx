
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
import { Plus, Edit, Trash2 } from 'lucide-react';

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
        .select('*')
        .order('created_at', { ascending: false });
      
      console.log('Resposta do Supabase:', { data, error });
      
      if (error) {
        console.error('Erro na consulta:', error);
        throw error;
      }
      
      console.log('Barbearias encontradas:', data?.length || 0);
      
      // Mapeando os dados do Supabase para o tipo Barbershop
      const mappedBarbershops: Barbershop[] = (data || []).map(item => ({
        id: item.id,
        name: item.name,
        address: item.address,
        phone: item.phone,
        adminId: item.admin_id || '',
        services: [], // Inicializar como array vazio por enquanto
        barbers: [], // Inicializar como array vazio por enquanto
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
              <Button className="bg-amber-500 hover:bg-amber-600 text-slate-900">
                <Plus className="h-4 w-4 mr-2" />
                Nova Barbearia
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-800 border-amber-500/20">
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
                    className="bg-slate-700 border-slate-600 text-white"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="address" className="text-white">Endereço</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    className="bg-slate-700 border-slate-600 text-white"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone" className="text-white">Telefone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="bg-slate-700 border-slate-600 text-white"
                    required
                  />
                </div>
                <Button type="submit" className="w-full bg-amber-500 hover:bg-amber-600 text-slate-900">
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
              <Card key={barbershop.id} className="bg-slate-800/50 border-amber-500/20">
                <CardHeader>
                  <CardTitle className="text-white">{barbershop.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-gray-300">
                    <p><strong>Endereço:</strong> {barbershop.address}</p>
                    <p><strong>Telefone:</strong> {barbershop.phone}</p>
                    <p><strong>Barbeiros:</strong> {barbershop.barbers?.length || 0}</p>
                    <p><strong>Serviços:</strong> {barbershop.services?.length || 0}</p>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(barbershop)}
                      className="border-amber-500/50 text-amber-400 hover:bg-amber-500/20"
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

  async function handleSubmit(e: React.FormEvent) {
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
  }

  function handleEdit(barbershop: Barbershop) {
    setEditingBarbershop(barbershop);
    setFormData({
      name: barbershop.name,
      address: barbershop.address,
      phone: barbershop.phone,
    });
    setIsDialogOpen(true);
  }

  async function handleDelete(id: string) {
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
  }
};

export default BarbershopsPage;
