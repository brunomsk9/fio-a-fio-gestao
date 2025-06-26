
import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from '../components/ui/use-toast';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { Barber, Barbershop } from '../types';
import { Plus, Edit, Trash2 } from 'lucide-react';

const BarbersPage: React.FC = () => {
  const { user } = useAuthStore();
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [barbershops, setBarbershops] = useState<Barbershop[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBarber, setEditingBarber] = useState<Barber | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    barbershops: [] as string[],
    specialties: [] as string[],
  });

  useEffect(() => {
    fetchBarbers();
    fetchBarbershops();
  }, []);

  const fetchBarbers = async () => {
    try {
      let query = supabase.from('barbers').select('*');
      
      if (user?.role === 'admin' && user.barbershopId) {
        query = query.contains('barbershops', [user.barbershopId]);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      setBarbers(data || []);
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
        query = query.eq('id', user.barbershopId);
      }
      
      const { data, error } = await query.order('name');
      
      if (error) throw error;
      setBarbershops(data || []);
    } catch (error) {
      console.error('Error fetching barbershops:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingBarber) {
        const { error } = await supabase
          .from('barbers')
          .update(formData)
          .eq('id', editingBarber.id);
        
        if (error) throw error;
        toast({ title: "Sucesso!", description: "Barbeiro atualizado com sucesso" });
      } else {
        const { error } = await supabase
          .from('barbers')
          .insert([formData]);
        
        if (error) throw error;
        toast({ title: "Sucesso!", description: "Barbeiro criado com sucesso" });
      }
      
      setIsDialogOpen(false);
      setEditingBarber(null);
      setFormData({ name: '', email: '', phone: '', barbershops: [], specialties: [] });
      fetchBarbers();
    } catch (error) {
      console.error('Error saving barber:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o barbeiro",
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
      barbershops: barber.barbershops,
      specialties: barber.specialties,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este barbeiro?')) return;
    
    try {
      const { error } = await supabase
        .from('barbers')
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

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">Barbeiros</h1>
            <p className="text-gray-400">Gerencie os barbeiros da barbearia</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-amber-500 hover:bg-amber-600 text-slate-900">
                <Plus className="h-4 w-4 mr-2" />
                Novo Barbeiro
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-800 border-amber-500/20">
              <DialogHeader>
                <DialogTitle className="text-white">
                  {editingBarber ? 'Editar Barbeiro' : 'Novo Barbeiro'}
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
                  <Label htmlFor="email" className="text-white">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
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
                <div>
                  <Label htmlFor="specialties" className="text-white">Especialidades</Label>
                  <Input
                    id="specialties"
                    value={formData.specialties.join(', ')}
                    onChange={(e) => setFormData({...formData, specialties: e.target.value.split(', ').filter(s => s.trim())})}
                    className="bg-slate-700 border-slate-600 text-white"
                    placeholder="Corte, Barba, Sobrancelha..."
                  />
                </div>
                <Button type="submit" className="w-full bg-amber-500 hover:bg-amber-600 text-slate-900">
                  {editingBarber ? 'Atualizar' : 'Criar'} Barbeiro
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {barbers.map((barber) => (
            <Card key={barber.id} className="bg-slate-800/50 border-amber-500/20">
              <CardHeader>
                <CardTitle className="text-white">{barber.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-gray-300">
                  <p><strong>Email:</strong> {barber.email}</p>
                  <p><strong>Telefone:</strong> {barber.phone}</p>
                  <p><strong>Especialidades:</strong> {barber.specialties.join(', ')}</p>
                  <p><strong>Barbearias:</strong> {barber.barbershops.length}</p>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(barber)}
                    className="border-amber-500/50 text-amber-400 hover:bg-amber-500/20"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(barber.id)}
                    className="border-red-500/50 text-red-400 hover:bg-red-500/20"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default BarbersPage;
