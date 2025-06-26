
import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { toast } from '../hooks/use-toast';
import { supabase } from '../integrations/supabase/client';
import { useAuthStore } from '../store/authStore';

const ProfilePage: React.FC = () => {
  const { user, setUser } = useAuthStore();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        phone: user.phone,
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;

    try {
      const tableName = user.role === 'barber' ? 'barbers' : 'users';
      
      const { error } = await supabase
        .from(tableName)
        .update(formData)
        .eq('id', user.id);

      if (error) throw error;
      
      // Update local user state
      setUser({ ...user, ...formData });
      
      toast({
        title: "Sucesso!",
        description: "Perfil atualizado com sucesso"
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o perfil",
        variant: "destructive"
      });
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Meu Perfil</h1>
          <p className="text-gray-400">Gerencie suas informações pessoais</p>
        </div>

        <Card className="bg-slate-800/50 border-amber-500/20 max-w-2xl">
          <CardHeader>
            <CardTitle className="text-white">Informações Pessoais</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-white">Nome Completo</Label>
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

              <div className="pt-4">
                <p className="text-sm text-gray-400 mb-2">
                  <strong>Função:</strong> {user?.role === 'client' ? 'Cliente' : user?.role}
                </p>
                {user?.barbershopId && (
                  <p className="text-sm text-gray-400">
                    <strong>ID da Barbearia:</strong> {user.barbershopId}
                  </p>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold"
              >
                Atualizar Perfil
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default ProfilePage;
