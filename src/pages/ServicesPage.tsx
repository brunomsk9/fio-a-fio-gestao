import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { toast } from '../hooks/use-toast';
import { supabase } from '../integrations/supabase/client';
import { useAuthStore } from '../store/authStore';
import { Service, Barbershop, DatabaseService, DatabaseBarbershop } from '../types';
import { transformDatabaseService, transformDatabaseBarbershop } from '../utils/dataTransforms';
import { Plus, Edit, Trash2 } from 'lucide-react';

const ServicesPage: React.FC = () => {
  const { user } = useAuthStore();
  const [barbershop, setBarbershop] = useState<Barbershop | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    duration: 0,
    price: 0,
    description: '',
  });

  useEffect(() => {
    if (user?.barbershopId) {
      fetchBarbershop();
      fetchServices();
    }
  }, [user]);

  const fetchBarbershop = async () => {
    try {
      const { data, error } = await supabase
        .from('barbershops')
        .select('*')
        .eq('id', user?.barbershopId)
        .single();
      
      if (error) throw error;
      
      const transformedBarbershop = transformDatabaseBarbershop(data as DatabaseBarbershop);
      setBarbershop(transformedBarbershop);
    } catch (error) {
      console.error('Error fetching barbershop:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar a barbearia",
        variant: "destructive"
      });
    }
  };

  const fetchServices = async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('barbershop_id', user?.barbershopId)
        .order('name');
      
      if (error) throw error;
      
      const transformedServices = (data as DatabaseService[]).map(transformDatabaseService);
      setServices(transformedServices);
    } catch (error) {
      console.error('Error fetching services:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os serviços",
        variant: "destructive"
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.barbershopId) return;
    
    try {
      const serviceData = {
        name: formData.name,
        duration: formData.duration,
        price: formData.price,
        description: formData.description || null,
        barbershop_id: user.barbershopId,
      };

      if (editingService) {
        const { error } = await supabase
          .from('services')
          .update(serviceData)
          .eq('id', editingService.id);
        
        if (error) throw error;
        toast({ title: "Sucesso!", description: "Serviço atualizado com sucesso" });
      } else {
        const { error } = await supabase
          .from('services')
          .insert([serviceData]);
        
        if (error) throw error;
        toast({ title: "Sucesso!", description: "Serviço criado com sucesso" });
      }
      
      setIsDialogOpen(false);
      setEditingService(null);
      setFormData({ name: '', duration: 0, price: 0, description: '' });
      fetchServices();
    } catch (error) {
      console.error('Error saving service:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o serviço",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      duration: service.duration,
      price: service.price,
      description: service.description || '',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (serviceId: string) => {
    if (!confirm('Tem certeza que deseja excluir este serviço?')) return;
    
    try {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', serviceId);
      
      if (error) throw error;
      
      toast({ title: "Sucesso!", description: "Serviço excluído com sucesso" });
      fetchServices();
    } catch (error) {
      console.error('Error deleting service:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o serviço",
        variant: "destructive"
      });
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">Serviços</h1>
            <p className="text-gray-400">Gerencie os serviços da barbearia</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-amber-500 hover:bg-amber-600 text-slate-900">
                <Plus className="h-4 w-4 mr-2" />
                Novo Serviço
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-800 border-amber-500/20 max-h-[90vh] overflow-hidden flex flex-col">
              <DialogHeader className="flex-shrink-0">
                <DialogTitle className="text-white">
                  {editingService ? 'Editar Serviço' : 'Novo Serviço'}
                </DialogTitle>
              </DialogHeader>
              
              <div className="flex-1 overflow-y-auto pr-2">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name" className="text-white">Nome do Serviço</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="bg-slate-700 border-slate-600 text-white"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="duration" className="text-white">Duração (min)</Label>
                      <Input
                        id="duration"
                        type="number"
                        value={formData.duration}
                        onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value)})}
                        className="bg-slate-700 border-slate-600 text-white"
                        required
                        min="1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="price" className="text-white">Preço (R$)</Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        value={formData.price}
                        onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value)})}
                        className="bg-slate-700 border-slate-600 text-white"
                        required
                        min="0"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="description" className="text-white">Descrição</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      className="bg-slate-700 border-slate-600 text-white"
                      rows={3}
                    />
                  </div>
                </form>
              </div>
              
              {/* Botões fixos na parte inferior */}
              <div className="flex justify-end space-x-2 pt-4 border-t border-slate-600 flex-shrink-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false);
                    setEditingService(null);
                    setFormData({ name: '', duration: 0, price: 0, description: '' });
                  }}
                  className="border-slate-600 text-white hover:bg-slate-700"
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit"
                  onClick={(e) => {
                    e.preventDefault();
                    handleSubmit(e as any);
                  }}
                  className="bg-amber-500 hover:bg-amber-600 text-slate-900"
                >
                  {editingService ? 'Atualizar' : 'Criar'} Serviço
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <Card key={service.id} className="bg-slate-800/50 border-amber-500/20">
              <CardHeader>
                <CardTitle className="text-white">{service.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-gray-300">
                    <strong>Duração:</strong> {service.duration} minutos
                  </p>
                  <p className="text-gray-300">
                    <strong>Preço:</strong> R$ {service.price.toFixed(2)}
                  </p>
                  {service.description && (
                    <p className="text-gray-300">
                      <strong>Descrição:</strong> {service.description}
                    </p>
                  )}
                </div>
                <div className="flex gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(service)}
                    className="border-amber-500/50 text-amber-400 hover:bg-amber-500/20"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(service.id)}
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

export default ServicesPage;
