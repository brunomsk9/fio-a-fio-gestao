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
import { syncExistingBarbers } from '../integrations/supabase/adminClient';
import { useAuthStore } from '../store/authStore';
import { Barbershop, User, Barber } from '../types';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Edit, 
  Trash2, 
  MapPin, 
  Phone, 
  Users, 
  Scissors, 
  UserCheck, 
  UserX, 
  Crown, 
  Building2, 
  Search,
  UserPlus,
  UserMinus,
  CheckCircle,
  XCircle,
  RefreshCw,
  ArrowLeft,
  Calendar,
  Clock,
  Star,
  X,
  Loader2
} from 'lucide-react';

const BarbershopsPage: React.FC = () => {
  const { user } = useAuthStore();
  const { id: barbershopId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [barbershops, setBarbershops] = useState<Barbershop[]>([]);
  const [selectedBarbershop, setSelectedBarbershop] = useState<Barbershop | null>(null);
  const [admins, setAdmins] = useState<User[]>([]);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [availableBarbers, setAvailableBarbers] = useState<Barber[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAssignAdminDialogOpen, setIsAssignAdminDialogOpen] = useState(false);
  const [isManageBarbersDialogOpen, setIsManageBarbersDialogOpen] = useState(false);
  const [editingBarbershop, setEditingBarbershop] = useState<Barbershop | null>(null);
  const [selectedAdminId, setSelectedAdminId] = useState<string>('');
  const [selectedBarberId, setSelectedBarberId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
  });
  const [linkedBarbers, setLinkedBarbers] = useState<Barber[]>([]);
  
  // Estados para seleção múltipla
  const [selectedAdminIds, setSelectedAdminIds] = useState<string[]>([]);
  const [selectedBarbershopIds, setSelectedBarbershopIds] = useState<string[]>([]);
  const [isMultiAssignDialogOpen, setIsMultiAssignDialogOpen] = useState(false);
  const [multiAssignType, setMultiAssignType] = useState<'admin' | 'barber'>('admin');

  // Estados para busca por CEP
  const [cep, setCep] = useState('');
  const [isLoadingCep, setIsLoadingCep] = useState(false);
  const [addressData, setAddressData] = useState({
    logradouro: '',
    bairro: '',
    localidade: '',
    uf: '',
    complemento: ''
  });

  useEffect(() => {
    if (user?.role === 'super-admin') {
      if (barbershopId) {
        fetchSpecificBarbershop(barbershopId);
      } else {
        fetchBarbershops();
        fetchAdmins();
        fetchBarbers();
      }
    } else if (user?.role === 'admin') {
      if (barbershopId) {
        fetchSpecificBarbershop(barbershopId);
      } else {
        fetchAdminBarbershops();
        fetchAdminBarbers();
      }
    }
  }, [user, barbershopId]);

  const fetchBarbers = async () => {
    try {
      const { data, error } = await supabase
        .from('barbers')
        .select('*')
        .order('name');

      if (error) throw error;
      
      const mappedBarbers: Barber[] = (data || []).map(item => ({
        id: item.id,
        name: item.name,
        email: item.email,
        phone: item.phone,
        barbershops: [],
        specialties: [],
        workingHours: {}
      }));
      
      setBarbers(mappedBarbers);
    } catch (error) {
      console.error('Erro ao buscar barbeiros:', error);
    }
  };

  const fetchAdmins = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'admin')
        .order('name');

      if (error) throw error;
      setAdmins(data || []);
    } catch (error) {
      console.error('Erro ao buscar admins:', error);
    }
  };

  const fetchBarbershops = async () => {
    console.log('Iniciando busca das barbearias...');
    setIsLoading(true);
    try {
      console.log('Conectando com Supabase...');
      const { data, error } = await supabase
        .from('barbershops')
        .select(`
          *,
          admin:users!barbershops_admin_id_fkey(id, name, email, phone),
          services(id, name, price, duration),
          barber_barbershops(barber_id)
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
        admin: item.admin ? {
          id: item.admin.id,
          name: item.admin.name,
          email: item.admin.email,
          phone: item.admin.phone,
          role: 'admin' as any
        } : undefined,
        services: item.services || [],
        barbers: item.barber_barbershops?.map((bb: any) => bb.barber_id) || [],
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

  const fetchAdminBarbershops = async () => {
    console.log('Buscando barbearias do admin:', user?.id);
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('barbershops')
        .select(`
          *,
          admin:users!barbershops_admin_id_fkey(id, name, email, phone),
          services(id, name, price, duration),
          barber_barbershops(barber_id)
        `)
        .eq('admin_id', user?.id)
        .order('created_at', { ascending: false });
      
      console.log('Barbearias do admin:', data);
      
      if (error) {
        console.error('Erro na consulta:', error);
        throw error;
      }
      
      const mappedBarbershops: Barbershop[] = (data || []).map(item => ({
        id: item.id,
        name: item.name,
        address: item.address,
        phone: item.phone,
        adminId: item.admin_id || '',
        admin: item.admin ? {
          id: item.admin.id,
          name: item.admin.name,
          email: item.admin.email,
          phone: item.admin.phone,
          role: 'admin' as any
        } : undefined,
        services: item.services || [],
        barbers: item.barber_barbershops?.map((bb: any) => bb.barber_id) || [],
        createdAt: new Date(item.created_at || Date.now())
      }));
      
      setBarbershops(mappedBarbershops);
    } catch (error) {
      console.error('Erro ao buscar barbearias do admin:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar suas barbearias.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAdminBarbers = async () => {
    try {
      // Buscar barbeiros que estão vinculados às barbearias do admin
      const { data, error } = await supabase
        .from('barber_barbershops')
        .select(`
          barber_id,
          barbers:barbers!barber_barbershops_barber_id_fkey(id, name, email, phone, specialties)
        `)
        .eq('barbershop_id', user?.barbershopId);

      if (error) throw error;
      
      const mappedBarbers: Barber[] = (data || [])
        .filter(item => item.barbers)
        .map(item => ({
          id: item.barbers.id,
          name: item.barbers.name,
          email: item.barbers.email,
          phone: item.barbers.phone,
          barbershops: [user?.barbershopId || ''],
          specialties: item.barbers.specialties || [],
          workingHours: {}
        }));
      
      setBarbers(mappedBarbers);
    } catch (error) {
      console.error('Erro ao buscar barbeiros do admin:', error);
    }
  };

  const fetchBarbersForBarbershop = async (barbershopId: string) => {
    try {
      const { data, error } = await supabase
        .from('barber_barbershops')
        .select(`
          barber_id,
          barbers:barbers!barber_barbershops_barber_id_fkey(id, name, email, phone)
        `)
        .eq('barbershop_id', barbershopId);

      if (error) throw error;

      // Barbeiros já vinculados
      const linked = (data || [])
        .filter(item => item.barbers)
        .map(item => ({
          id: item.barbers.id,
          name: item.barbers.name,
          email: item.barbers.email,
          phone: item.barbers.phone,
          barbershops: [barbershopId],
          specialties: [],
          workingHours: {}
        }));
      setLinkedBarbers(linked);

      // Barbeiros disponíveis para adicionar
      const barberIds = (data || []).map(item => item.barber_id);
      const availableBarbers = barbers.filter(barber => !barberIds.includes(barber.id));
      setAvailableBarbers(availableBarbers);
    } catch (error) {
      console.error('Erro ao buscar barbeiros da barbearia:', error);
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

  const handleAssignAdmin = async () => {
    if (!selectedBarbershop || !selectedAdminId) return;

    try {
      const { error } = await supabase
        .from('barbershops')
        .update({ admin_id: selectedAdminId })
        .eq('id', selectedBarbershop.id);

      if (error) throw error;

      toast({ title: "Sucesso!", description: "Admin vinculado com sucesso" });
      setIsAssignAdminDialogOpen(false);
      setSelectedBarbershop(null);
      setSelectedAdminId('');
      fetchBarbershops();
    } catch (error) {
      console.error('Erro ao vincular admin:', error);
      toast({
        title: "Erro",
        description: "Não foi possível vincular o admin",
        variant: "destructive"
      });
    }
  };

  // Função para atribuição múltipla de admins
  const handleMultiAssignAdmin = async () => {
    if (selectedAdminIds.length === 0 || selectedBarbershopIds.length === 0) return;

    try {
      const updates = selectedBarbershopIds.map(barbershopId => ({
        id: barbershopId,
        admin_id: selectedAdminIds[0] // Por enquanto, um admin por barbearia
      }));

      const { error } = await supabase
        .from('barbershops')
        .upsert(updates);

      if (error) throw error;

      toast({ 
        title: "Sucesso!", 
        description: `${selectedAdminIds.length} admin(s) vinculado(s) a ${selectedBarbershopIds.length} barbearia(s)` 
      });
      
      setIsMultiAssignDialogOpen(false);
      setSelectedAdminIds([]);
      setSelectedBarbershopIds([]);
      fetchBarbershops();
    } catch (error) {
      console.error('Erro ao vincular admins:', error);
      toast({
        title: "Erro",
        description: "Não foi possível vincular os admins",
        variant: "destructive"
      });
    }
  };

  // Função para atribuição múltipla de barbeiros
  const handleMultiAssignBarber = async () => {
    if (selectedBarberId === '' || selectedBarbershopIds.length === 0) return;

    try {
      const barberBarbershopsData = selectedBarbershopIds.map(barbershopId => ({
        barber_id: selectedBarberId,
        barbershop_id: barbershopId
      }));

      const { error } = await supabase
        .from('barber_barbershops')
        .upsert(barberBarbershopsData, { onConflict: 'barber_id,barbershop_id' });

      if (error) throw error;

      toast({ 
        title: "Sucesso!", 
        description: `Barbeiro vinculado a ${selectedBarbershopIds.length} barbearia(s)` 
      });
      
      setIsMultiAssignDialogOpen(false);
      setSelectedBarberId('');
      setSelectedBarbershopIds([]);
      fetchBarbers();
    } catch (error) {
      console.error('Erro ao vincular barbeiro:', error);
      toast({
        title: "Erro",
        description: "Não foi possível vincular o barbeiro",
        variant: "destructive"
      });
    }
  };

  // Função para alternar seleção de admin
  const toggleAdminSelection = (adminId: string) => {
    setSelectedAdminIds(prev => 
      prev.includes(adminId) 
        ? prev.filter(id => id !== adminId)
        : [...prev, adminId]
    );
  };

  // Função para alternar seleção de barbearia
  const toggleBarbershopSelection = (barbershopId: string) => {
    setSelectedBarbershopIds(prev => 
      prev.includes(barbershopId) 
        ? prev.filter(id => id !== barbershopId)
        : [...prev, barbershopId]
    );
  };

  const handleAssignBarber = async () => {
    if (!selectedBarbershop || !selectedBarberId) return;

    try {
      console.log('Tentando vincular barbeiro:', {
        barber_id: selectedBarberId,
        barbershop_id: selectedBarbershop.id
      });

      const { error } = await supabase
        .from('barber_barbershops')
        .insert({
          barber_id: selectedBarberId,
          barbershop_id: selectedBarbershop.id
        });

      if (error) {
        console.error('Erro detalhado ao vincular barbeiro:', error);
        throw error;
      }

      toast({ title: "Sucesso!", description: "Barbeiro vinculado com sucesso" });
      setSelectedBarberId('');
      fetchBarbersForBarbershop(selectedBarbershop.id);
    } catch (error) {
      console.error('Erro ao vincular barbeiro:', error);
      toast({
        title: "Erro",
        description: "Não foi possível vincular o barbeiro",
        variant: "destructive"
      });
    }
  };

  const handleRemoveBarber = async (barberId: string) => {
    if (!selectedBarbershop) return;

    try {
      const { error } = await supabase
        .from('barber_barbershops')
        .delete()
        .eq('barber_id', barberId)
        .eq('barbershop_id', selectedBarbershop.id);

      if (error) throw error;

      toast({ title: "Sucesso!", description: "Barbeiro removido com sucesso" });
      fetchBarbersForBarbershop(selectedBarbershop.id);
    } catch (error) {
      console.error('Erro ao remover barbeiro:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover o barbeiro",
        variant: "destructive"
      });
    }
  };

  const handleRemoveAdmin = async (barbershopId: string) => {
    try {
      const { error } = await supabase
        .from('barbershops')
        .update({ admin_id: null })
        .eq('id', barbershopId);

      if (error) throw error;

      toast({ title: "Sucesso!", description: "Admin removido com sucesso" });
      fetchBarbershops();
    } catch (error) {
      console.error('Erro ao remover admin:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover o admin",
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
    
    // Limpar dados de endereço e CEP
    setCep('');
    setAddressData({
      logradouro: '',
      bairro: '',
      localidade: '',
      uf: '',
      complemento: ''
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

  const handleManageBarbers = async (barbershop: Barbershop) => {
    setSelectedBarbershop(barbershop);
    if (barbers.length === 0) {
      await fetchBarbers();
    }
    await fetchBarbersForBarbershop(barbershop.id);
    setIsManageBarbersDialogOpen(true);
  };

  const handleSyncBarbers = async () => {
    try {
      const result = await syncExistingBarbers();
      
      if (result.success) {
        toast({ 
          title: "Sucesso!", 
          description: result.message 
        });
        // Recarregar a lista de barbeiros após sincronização
        fetchBarbers();
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      console.error('Erro ao sincronizar barbeiros:', error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível sincronizar os barbeiros",
        variant: "destructive"
      });
    }
  };

  const fetchSpecificBarbershop = async (id: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('barbershops')
        .select(`
          *,
          admin:users!barbershops_admin_id_fkey(id, name, email, phone),
          services(id, name, price, duration),
          barber_barbershops(
            barber_id,
            barbers:barbers!barber_barbershops_barber_id_fkey(id, name, email, phone, specialties)
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      const mappedBarbershop: Barbershop = {
        id: data.id,
        name: data.name,
        address: data.address,
        phone: data.phone,
        adminId: data.admin_id || '',
        admin: data.admin ? {
          id: data.admin.id,
          name: data.admin.name,
          email: data.admin.email,
          phone: data.admin.phone,
          role: 'admin' as any
        } : undefined,
        services: data.services || [],
        barbers: data.barber_barbershops?.map((bb: any) => bb.barber_id) || [],
        createdAt: new Date(data.created_at || Date.now())
      };

      setSelectedBarbershop(mappedBarbershop);
      
      // Mapear barbeiros vinculados
      const linkedBarbersData = (data.barber_barbershops || [])
        .filter((bb: any) => bb.barbers)
        .map((bb: any) => ({
          id: bb.barbers.id,
          name: bb.barbers.name,
          email: bb.barbers.email,
          phone: bb.barbers.phone,
          barbershops: [id],
          specialties: bb.barbers.specialties || [],
          workingHours: {}
        }));
      
      setLinkedBarbers(linkedBarbersData);
    } catch (error) {
      console.error('Erro ao buscar barbearia específica:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados da barbearia.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredBarbershops = barbershops.filter(barbershop =>
    barbershop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    barbershop.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Função para buscar endereço por CEP
  const fetchAddressByCep = async (cepValue: string) => {
    const cleanCep = cepValue.replace(/\D/g, '');
    
    if (cleanCep.length !== 8) {
      return;
    }

    setIsLoadingCep(true);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      const data = await response.json();

      if (!data.erro) {
        setAddressData({
          logradouro: data.logradouro || '',
          bairro: data.bairro || '',
          localidade: data.localidade || '',
          uf: data.uf || '',
          complemento: data.complemento || ''
        });

        // Montar endereço completo
        const fullAddress = [
          data.logradouro,
          data.bairro,
          data.localidade,
          data.uf
        ].filter(Boolean).join(', ');

        setFormData(prev => ({
          ...prev,
          address: fullAddress
        }));

        toast({
          title: "Endereço encontrado!",
          description: "Endereço preenchido automaticamente",
        });
      } else {
        toast({
          title: "CEP não encontrado",
          description: "Verifique se o CEP está correto",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
      toast({
        title: "Erro",
        description: "Não foi possível buscar o endereço. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoadingCep(false);
    }
  };

  // Função para lidar com mudança no CEP
  const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCep(value);
    
    // Buscar automaticamente quando o CEP tiver 8 dígitos
    if (value.replace(/\D/g, '').length === 8) {
      fetchAddressByCep(value);
    }
  };

  // Função para formatar CEP
  const formatCep = (value: string) => {
    const cleanValue = value.replace(/\D/g, '');
    return cleanValue.replace(/(\d{5})(\d{3})/, '$1-$2');
  };

  // Função para atualizar o endereço completo
  const updateFullAddress = () => {
    const fullAddress = [
      addressData.logradouro,
      addressData.complemento,
      addressData.bairro,
      addressData.localidade,
      addressData.uf
    ].filter(Boolean).join(', ');

    setFormData(prev => ({
      ...prev,
      address: fullAddress
    }));
  };

  if (user?.role !== 'super-admin') {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Crown className="h-16 w-16 text-amber-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Acesso Restrito</h2>
            <p className="text-gray-600">Apenas super admins podem gerenciar barbearias.</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {barbershopId 
                ? selectedBarbershop?.name || 'Barbearia'
                : user?.role === 'admin' 
                  ? 'Minhas Barbearias' 
                  : 'Gerenciamento de Barbearias'
              }
            </h1>
            <p className="text-gray-600">
              {barbershopId 
                ? 'Detalhes da barbearia'
                : user?.role === 'admin' 
                  ? 'Gerencie as barbearias que você é responsável' 
                  : 'Gerencie todas as barbearias do sistema'
              }
            </p>
          </div>
          
          {barbershopId && (
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => navigate('/barbershops')}
                className="border-gray-300 text-gray-700"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
              
              {user?.role === 'super-admin' && (
                <Button
                  onClick={() => handleEdit(selectedBarbershop!)}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Editar Barbearia
                </Button>
              )}
            </div>
          )}
          
          {!barbershopId && user?.role === 'super-admin' && (
            <div className="flex space-x-2">
              <Button
                onClick={() => {
                  setMultiAssignType('admin');
                  setIsMultiAssignDialogOpen(true);
                }}
                variant="outline"
                className="border-green-500 text-green-600 hover:bg-green-50"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Vincular Admins
              </Button>
              <Button
                onClick={() => {
                  setMultiAssignType('barber');
                  setIsMultiAssignDialogOpen(true);
                }}
                variant="outline"
                className="border-purple-500 text-purple-600 hover:bg-purple-50"
              >
                <Scissors className="h-4 w-4 mr-2" />
                Vincular Barbeiros
              </Button>
              <Button
                onClick={() => setIsDialogOpen(true)}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nova Barbearia
              </Button>
            </div>
          )}
        </div>

        {/* Conteúdo específico da barbearia */}
        {barbershopId && selectedBarbershop ? (
          <div className="space-y-6">
            {/* Informações da Barbearia */}
            <Card className="gradient-card border-0 shadow-soft">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-gray-900">Informações da Barbearia</CardTitle>
                  {user?.role === 'super-admin' && (
                    <Button
                      onClick={() => handleEdit(selectedBarbershop!)}
                      variant="outline"
                      size="sm"
                      className="border-blue-500 text-blue-600 hover:bg-blue-50"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <Building2 className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-gray-900">{selectedBarbershop.name}</p>
                      <p className="text-sm text-gray-600">Nome da Barbearia</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium text-gray-900">{selectedBarbershop.address}</p>
                      <p className="text-sm text-gray-600">Endereço</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="font-medium text-gray-900">{selectedBarbershop.phone}</p>
                      <p className="text-sm text-gray-600">Telefone</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Crown className="h-5 w-5 text-amber-600" />
                    <div>
                      <p className="font-medium text-gray-900">{selectedBarbershop.admin?.name || 'Não definido'}</p>
                      <p className="text-sm text-gray-600">Administrador</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Estatísticas */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="gradient-card border-0 shadow-soft">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Barbeiros</p>
                      <p className="text-2xl font-bold text-blue-600">{linkedBarbers.length}</p>
                    </div>
                    <Scissors className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="gradient-card border-0 shadow-soft">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Serviços</p>
                      <p className="text-2xl font-bold text-green-600">{selectedBarbershop.services.length}</p>
                    </div>
                    <Star className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="gradient-card border-0 shadow-soft">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Agendamentos Hoje</p>
                      <p className="text-2xl font-bold text-purple-600">0</p>
                    </div>
                    <Calendar className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="gradient-card border-0 shadow-soft">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Avaliação</p>
                      <p className="text-2xl font-bold text-amber-600">4.8</p>
                    </div>
                    <Star className="h-8 w-8 text-amber-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Lista de Barbeiros */}
            <Card className="gradient-card border-0 shadow-soft">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-gray-900">Barbeiros da Barbearia</CardTitle>
                  <Button
                    variant="outline"
                    onClick={() => setIsManageBarbersDialogOpen(true)}
                    className="border-blue-500 text-blue-600 hover:bg-blue-50"
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Gerenciar Barbeiros
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {linkedBarbers.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {linkedBarbers.map((barber) => (
                      <div key={barber.id} className="flex items-center space-x-3 p-3 bg-white rounded-lg shadow-sm">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Scissors className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{barber.name}</p>
                          <p className="text-sm text-gray-600">{barber.email}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Scissors className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Nenhum barbeiro vinculado a esta barbearia</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          /* Lista de Barbearias */
          <div className="space-y-6">
            {/* Busca */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                type="text"
                placeholder="Buscar barbearias..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            {/* Lista de Barbearias */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBarbershops.map((barbershop) => (
                <Card key={barbershop.id} className="gradient-card border-0 shadow-soft hover:shadow-medium transition-all duration-300">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Building2 className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <CardTitle className="text-gray-900">{barbershop.name}</CardTitle>
                          <p className="text-sm text-gray-600">{barbershop.address}</p>
                        </div>
                      </div>
                      <div className="flex space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/barbershops/${barbershop.id}`)}
                          className="hover:bg-gray-100"
                        >
                          <Edit className="h-4 w-4 text-gray-600" />
                        </Button>
                        {user?.role === 'super-admin' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(barbershop.id)}
                            className="hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Phone className="h-4 w-4" />
                      <span className="text-sm">{barbershop.phone}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Crown className="h-4 w-4" />
                      <span className="text-sm">{barbershop.admin?.name || 'Admin não definido'}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Scissors className="h-4 w-4" />
                      <span className="text-sm">{barbershop.barbers.length} barbeiro(s)</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredBarbershops.length === 0 && (
              <Card className="gradient-card border-0 shadow-soft">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <div className="text-center">
                    <Building2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma barbearia encontrada</h3>
                    <p className="text-gray-600">
                      {searchTerm ? 'Nenhuma barbearia corresponde à sua busca.' : 'Comece adicionando sua primeira barbearia.'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>

      {/* Create/Edit Barbershop Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>
              {editingBarbershop ? 'Editar Barbearia' : 'Nova Barbearia'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto pr-2">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome da Barbearia</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nome da barbearia"
                  required
                />
              </div>

              {/* Campo de CEP */}
              <div className="space-y-2">
                <Label htmlFor="cep">CEP</Label>
                <div className="relative">
                  <Input
                    id="cep"
                    value={cep}
                    onChange={handleCepChange}
                    placeholder="00000-000"
                    maxLength={9}
                    className="pr-10"
                  />
                  {isLoadingCep && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500">Digite o CEP para buscar o endereço automaticamente</p>
              </div>

              {/* Campos detalhados do endereço */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="logradouro">Logradouro</Label>
                  <Input
                    id="logradouro"
                    value={addressData.logradouro}
                    onChange={(e) => {
                      setAddressData(prev => ({ ...prev, logradouro: e.target.value }));
                      updateFullAddress();
                    }}
                    placeholder="Rua, Avenida, etc."
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="complemento">Complemento</Label>
                  <Input
                    id="complemento"
                    value={addressData.complemento}
                    onChange={(e) => {
                      setAddressData(prev => ({ ...prev, complemento: e.target.value }));
                      updateFullAddress();
                    }}
                    placeholder="Número, apartamento, etc."
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="bairro">Bairro</Label>
                  <Input
                    id="bairro"
                    value={addressData.bairro}
                    onChange={(e) => {
                      setAddressData(prev => ({ ...prev, bairro: e.target.value }));
                      updateFullAddress();
                    }}
                    placeholder="Bairro"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="localidade">Cidade</Label>
                  <Input
                    id="localidade"
                    value={addressData.localidade}
                    onChange={(e) => {
                      setAddressData(prev => ({ ...prev, localidade: e.target.value }));
                      updateFullAddress();
                    }}
                    placeholder="Cidade"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="uf">Estado</Label>
                  <Input
                    id="uf"
                    value={addressData.uf}
                    onChange={(e) => {
                      setAddressData(prev => ({ ...prev, uf: e.target.value }));
                      updateFullAddress();
                    }}
                    placeholder="UF"
                    maxLength={2}
                  />
                </div>
              </div>

              {/* Endereço completo (somente leitura) */}
              <div className="space-y-2">
                <Label htmlFor="address">Endereço Completo</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Endereço completo será preenchido automaticamente"
                  className="bg-gray-50"
                />
                <p className="text-xs text-gray-500">Endereço montado automaticamente. Você pode editar se necessário.</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="(11) 99999-9999"
                  required
                />
              </div>
            </form>
          </div>
          
          {/* Botões fixos na parte inferior */}
          <div className="flex justify-end space-x-2 pt-4 border-t border-gray-200 flex-shrink-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsDialogOpen(false);
                setEditingBarbershop(null);
                setFormData({ name: '', address: '', phone: '' });
                setCep('');
                setAddressData({
                  logradouro: '',
                  bairro: '',
                  localidade: '',
                  uf: '',
                  complemento: ''
                });
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
            >
              {editingBarbershop ? 'Atualizar' : 'Criar'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Assign Admin Dialog */}
      <Dialog open={isAssignAdminDialogOpen} onOpenChange={setIsAssignAdminDialogOpen}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>Vincular Admin</DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto pr-2">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Selecionar Admin</Label>
                <Select value={selectedAdminId} onValueChange={setSelectedAdminId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Escolha um admin" />
                  </SelectTrigger>
                  <SelectContent>
                    {admins.map((admin) => (
                      <SelectItem key={admin.id} value={admin.id}>
                        {admin.name} ({admin.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          {/* Botões fixos na parte inferior */}
          <div className="flex justify-end space-x-2 pt-4 border-t border-gray-200 flex-shrink-0">
            <Button
              variant="outline"
              onClick={() => {
                setIsAssignAdminDialogOpen(false);
                setSelectedBarbershop(null);
                setSelectedAdminId('');
              }}
            >
              Cancelar
            </Button>
            <Button onClick={handleAssignAdmin} disabled={!selectedAdminId}>
              Vincular
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Manage Barbers Dialog */}
      <Dialog open={isManageBarbersDialogOpen} onOpenChange={setIsManageBarbersDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>Gerenciar Barbeiros - {selectedBarbershop?.name}</DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto pr-2">
            <div className="space-y-6">
              {/* Add Barber */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">Adicionar Barbeiro</h3>
                <div className="flex space-x-2">
                  <Select value={selectedBarberId} onValueChange={setSelectedBarberId}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Escolha um barbeiro" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableBarbers.map((barber) => (
                        <SelectItem key={barber.id} value={barber.id}>
                          {barber.name} ({barber.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button 
                    onClick={handleAssignBarber}
                    disabled={!selectedBarberId}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Adicionar
                  </Button>
                </div>
              </div>

              {/* Current Barbers */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">Barbeiros Atuais</h3>
                <div className="space-y-2">
                  {linkedBarbers.map((barber) => (
                    <div key={barber.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{barber.name}</p>
                        <p className="text-sm text-gray-600">{barber.email}</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveBarber(barber.id)}
                        className="text-red-600 border-red-200 hover:bg-red-50"
                      >
                        Remover
                      </Button>
                    </div>
                  ))}
                  {linkedBarbers.length === 0 && (
                    <p className="text-gray-500 text-center py-4">Nenhum barbeiro vinculado</p>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Botões fixos na parte inferior */}
          <div className="flex justify-end space-x-2 pt-4 border-t border-gray-200 flex-shrink-0">
            <Button
              onClick={() => {
                setIsManageBarbersDialogOpen(false);
                setSelectedBarbershop(null);
                setSelectedBarberId('');
              }}
            >
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Multi-Assign Dialog */}
      <Dialog open={isMultiAssignDialogOpen} onOpenChange={setIsMultiAssignDialogOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>
              {multiAssignType === 'admin' ? 'Vincular Admins a Barbearias' : 'Vincular Barbeiro a Barbearias'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto pr-2">
            <div className="space-y-6">
              {/* Seleção de Admins/Barbeiros */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">
                  {multiAssignType === 'admin' ? 'Selecionar Admins' : 'Selecionar Barbeiro'}
                </h3>
                
                {multiAssignType === 'admin' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {admins.map((admin) => (
                      <div key={admin.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                        <Checkbox
                          checked={selectedAdminIds.includes(admin.id)}
                          onCheckedChange={() => toggleAdminSelection(admin.id)}
                        />
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{admin.name}</div>
                          <div className="text-sm text-gray-600">{admin.email}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {barbers.map((barber) => (
                      <div key={barber.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                        <Checkbox
                          checked={selectedBarberId === barber.id}
                          onCheckedChange={() => setSelectedBarberId(barber.id)}
                        />
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{barber.name}</div>
                          <div className="text-sm text-gray-600">{barber.email}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Seleção de Barbearias */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">Selecionar Barbearias</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {barbershops.map((barbershop) => (
                    <div key={barbershop.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                      <Checkbox
                        checked={selectedBarbershopIds.includes(barbershop.id)}
                        onCheckedChange={() => toggleBarbershopSelection(barbershop.id)}
                      />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{barbershop.name}</div>
                        <div className="text-sm text-gray-600">{barbershop.address}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Resumo da Operação */}
              {(selectedAdminIds.length > 0 || selectedBarberId) && selectedBarbershopIds.length > 0 && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">Resumo da Operação</h4>
                  <p className="text-sm text-blue-800">
                    {multiAssignType === 'admin' 
                      ? `${selectedAdminIds.length} admin(s) será(ão) vinculado(s) a ${selectedBarbershopIds.length} barbearia(s)`
                      : `${selectedBarberId ? 1 : 0} barbeiro(s) será(ão) vinculado(s) a ${selectedBarbershopIds.length} barbearia(s)`
                    }
                  </p>
                </div>
              )}
            </div>
          </div>
          
          {/* Botões fixos na parte inferior */}
          <div className="flex justify-end space-x-2 pt-4 border-t border-gray-200 flex-shrink-0">
            <Button
              variant="outline"
              onClick={() => {
                setIsMultiAssignDialogOpen(false);
                setMultiAssignType(null);
                setSelectedAdminIds([]);
                setSelectedBarberId('');
                setSelectedBarbershopIds([]);
              }}
            >
              Cancelar
            </Button>
            <Button 
              onClick={multiAssignType === 'admin' ? handleMultiAssignAdmin : handleMultiAssignBarber}
              disabled={
                (multiAssignType === 'admin' && (selectedAdminIds.length === 0 || selectedBarbershopIds.length === 0)) ||
                (multiAssignType === 'barber' && (selectedBarberId === '' || selectedBarbershopIds.length === 0))
              }
              className="bg-blue-600 hover:bg-blue-700"
            >
              Vincular
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default BarbershopsPage;
