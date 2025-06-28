
import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Switch } from '../components/ui/switch';
import { Textarea } from '../components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { toast } from '../components/ui/use-toast';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../integrations/supabase/client';
import { Settings, Bell, Shield, Palette, Save, Globe, ExternalLink, CheckCircle, AlertCircle, Clock, Copy } from 'lucide-react';
import { Barbershop, DomainSettings } from '../types';
import { transformDatabaseBarbershop } from '../utils/dataTransforms';

const SettingsPage: React.FC = () => {
  const { user } = useAuthStore();
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      whatsapp: true,
      push: false,
    },
    privacy: {
      showPhone: true,
      showEmail: false,
    },
    preferences: {
      theme: 'dark',
      language: 'pt-BR',
    },
    business: {
      autoConfirm: true,
      reminderTime: 24,
      maxAdvanceBooking: 30,
    }
  });

  // Estados para subdomínios
  const [barbershops, setBarbershops] = useState<Barbershop[]>([]);
  const [domainSettings, setDomainSettings] = useState<DomainSettings[]>([]);
  const [isDomainDialogOpen, setIsDomainDialogOpen] = useState(false);
  const [selectedBarbershop, setSelectedBarbershop] = useState<Barbershop | null>(null);
  const [domainFormData, setDomainFormData] = useState({
    subdomain: '',
    customDomain: '',
    sslEnabled: false
  });

  useEffect(() => {
    if (user?.role === 'super-admin') {
      fetchBarbershops();
      fetchDomainSettings();
    }
  }, [user]);

  const fetchBarbershops = async () => {
    try {
      const { data, error } = await supabase
        .from('barbershops')
        .select('*')
        .order('name');

      if (error) throw error;
      
      if (data) {
        const transformedBarbershops = data.map((dbBarbershop) => transformDatabaseBarbershop(dbBarbershop));
        setBarbershops(transformedBarbershops);
      }
    } catch (error) {
      console.error('Erro ao buscar barbearias:', error);
    }
  };

  const fetchDomainSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('domain_settings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const mappedSettings: DomainSettings[] = (data || []).map(item => ({
        id: item.id,
        barbershopId: item.barbershop_id,
        subdomain: item.subdomain,
        customDomain: item.custom_domain,
        sslEnabled: item.ssl_enabled,
        dnsConfigured: item.dns_configured,
        status: item.status as 'pending' | 'active' | 'error',
        createdAt: new Date(item.created_at || Date.now()),
        updatedAt: new Date(item.updated_at || Date.now())
      }));
      
      setDomainSettings(mappedSettings);
    } catch (error) {
      console.error('Erro ao buscar configurações de domínio:', error);
    }
  };

  const handleSave = async () => {
    try {
      // Simulate saving settings
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Sucesso!",
        description: "Configurações salvas com sucesso"
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível salvar as configurações",
        variant: "destructive"
      });
    }
  };

  const handleDomainSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedBarbershop) {
      toast({
        title: "Erro",
        description: "Nenhuma barbearia selecionada",
        variant: "destructive"
      });
      return;
    }

    try {
      console.log('Iniciando salvamento de domínio:', {
        barbershop: selectedBarbershop,
        formData: domainFormData
      });

      // Validar subdomínio
      if (domainFormData.subdomain) {
        const subdomainRegex = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/;
        if (!subdomainRegex.test(domainFormData.subdomain) || 
            domainFormData.subdomain.length < 3 || 
            domainFormData.subdomain.length > 63) {
          throw new Error('Subdomínio inválido. Use apenas letras, números e hífens (3-63 caracteres).');
        }
      }

      // Validar domínio customizado
      if (domainFormData.customDomain) {
        const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?)+$/;
        if (!domainRegex.test(domainFormData.customDomain) || 
            domainFormData.customDomain.length < 4 || 
            domainFormData.customDomain.length > 253) {
          throw new Error('Domínio customizado inválido.');
        }
      }

      console.log('Validações passaram, salvando configurações...');

      // Abordagem mais simples: apenas atualizar a barbearia
      const updateData: any = {
        domain_enabled: true
      };

      // Só adicionar subdomain se foi fornecido
      if (domainFormData.subdomain && domainFormData.subdomain.trim()) {
        updateData.subdomain = domainFormData.subdomain.trim();
      } else {
        updateData.subdomain = null;
      }

      // Só adicionar custom_domain se foi fornecido
      if (domainFormData.customDomain && domainFormData.customDomain.trim()) {
        updateData.custom_domain = domainFormData.customDomain.trim();
      } else {
        updateData.custom_domain = null;
      }

      console.log('Dados para atualizar barbearia:', updateData);

      // Atualizar apenas a barbearia (abordagem mais simples)
      const { error: barbershopError } = await supabase
        .from('barbershops')
        .update(updateData)
        .eq('id', selectedBarbershop.id);

      if (barbershopError) {
        console.error('Erro ao atualizar barbearia:', barbershopError);
        
        // Verificar se é erro de constraint
        if (barbershopError.message.includes('duplicate key') || 
            barbershopError.message.includes('unique constraint') ||
            barbershopError.message.includes('already exists')) {
          throw new Error('Este subdomínio ou domínio já está em uso por outra barbearia.');
        }
        
        throw new Error(`Erro ao atualizar barbearia: ${barbershopError.message}`);
      }

      console.log('Barbearia atualizada com sucesso');

      // Tentar inserir/atualizar na tabela domain_settings (opcional)
      try {
        const domainData = {
          barbershop_id: selectedBarbershop.id,
          subdomain: domainFormData.subdomain || null,
          custom_domain: domainFormData.customDomain || null,
          ssl_enabled: domainFormData.sslEnabled,
          dns_configured: false,
          status: 'pending'
        };

        console.log('Tentando salvar na tabela domain_settings:', domainData);

        // Primeiro, tentar deletar registro existente
        await supabase
          .from('domain_settings')
          .delete()
          .eq('barbershop_id', selectedBarbershop.id);

        // Depois, inserir novo registro
        const { error: domainError } = await supabase
          .from('domain_settings')
          .insert(domainData);

        if (domainError) {
          console.warn('Erro ao salvar na tabela domain_settings (não crítico):', domainError);
          // Não falhar se der erro aqui, pois já salvamos na barbearia
        } else {
          console.log('Configurações de domínio salvas com sucesso');
        }
      } catch (domainError) {
        console.warn('Erro ao salvar na tabela domain_settings (não crítico):', domainError);
        // Não falhar se der erro aqui
      }

      toast({ 
        title: "Sucesso!", 
        description: "Configurações de domínio salvas com sucesso" 
      });
      
      setIsDomainDialogOpen(false);
      setSelectedBarbershop(null);
      setDomainFormData({ subdomain: '', customDomain: '', sslEnabled: false });
      
      // Recarregar dados
      await Promise.all([
        fetchBarbershops(),
        fetchDomainSettings()
      ]);

    } catch (error: any) {
      console.error('Erro completo ao salvar configurações de domínio:', error);
      
      let errorMessage = "Não foi possível salvar as configurações de domínio";
      
      if (error.message) {
        errorMessage = error.message;
      } else if (error.details) {
        errorMessage = error.details;
      } else if (error.hint) {
        errorMessage = `${errorMessage}: ${error.hint}`;
      }

      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-amber-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-amber-100 text-amber-800 border-amber-200';
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado!",
      description: "Link copiado para a área de transferência"
    });
  };

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Configurações</h1>
            <p className="text-gray-600">Personalize sua experiência no sistema</p>
          </div>
          
          <Button 
            onClick={handleSave}
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-soft hover:shadow-medium transition-all duration-300"
          >
            <Save className="h-4 w-4 mr-2" />
            Salvar Configurações
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="gradient-card border-0 shadow-soft hover:shadow-medium transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-gray-900 flex items-center gap-3">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <Bell className="h-5 w-5 text-amber-600" />
                </div>
                Notificações
              </CardTitle>
              <p className="text-sm text-gray-600">Configure como você recebe notificações</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <Label htmlFor="email-notifications" className="text-gray-900 font-medium">
                    Notificações por Email
                  </Label>
                  <p className="text-sm text-gray-600">Receba lembretes por email</p>
                </div>
                <Switch
                  id="email-notifications"
                  checked={settings.notifications.email}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({
                      ...prev,
                      notifications: { ...prev.notifications, email: checked }
                    }))
                  }
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <Label htmlFor="whatsapp-notifications" className="text-gray-900 font-medium">
                    Notificações por WhatsApp
                  </Label>
                  <p className="text-sm text-gray-600">Receba lembretes por WhatsApp</p>
                </div>
                <Switch
                  id="whatsapp-notifications"
                  checked={settings.notifications.whatsapp}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({
                      ...prev,
                      notifications: { ...prev.notifications, whatsapp: checked }
                    }))
                  }
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <Label htmlFor="push-notifications" className="text-gray-900 font-medium">
                    Notificações Push
                  </Label>
                  <p className="text-sm text-gray-600">Receba notificações no navegador</p>
                </div>
                <Switch
                  id="push-notifications"
                  checked={settings.notifications.push}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({
                      ...prev,
                      notifications: { ...prev.notifications, push: checked }
                    }))
                  }
                />
              </div>
            </CardContent>
          </Card>

          <Card className="gradient-card border-0 shadow-soft hover:shadow-medium transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-gray-900 flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Shield className="h-5 w-5 text-blue-600" />
                </div>
                Privacidade
              </CardTitle>
              <p className="text-sm text-gray-600">Controle o que outros usuários veem</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <Label htmlFor="show-phone" className="text-gray-900 font-medium">
                    Mostrar Telefone no Perfil
                  </Label>
                  <p className="text-sm text-gray-600">Permitir que outros vejam seu telefone</p>
                </div>
                <Switch
                  id="show-phone"
                  checked={settings.privacy.showPhone}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({
                      ...prev,
                      privacy: { ...prev.privacy, showPhone: checked }
                    }))
                  }
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <Label htmlFor="show-email" className="text-gray-900 font-medium">
                    Mostrar Email no Perfil
                  </Label>
                  <p className="text-sm text-gray-600">Permitir que outros vejam seu email</p>
                </div>
                <Switch
                  id="show-email"
                  checked={settings.privacy.showEmail}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({
                      ...prev,
                      privacy: { ...prev.privacy, showEmail: checked }
                    }))
                  }
                />
              </div>
            </CardContent>
          </Card>

          {(user?.role === 'admin' || user?.role === 'super-admin') && (
            <Card className="gradient-card border-0 shadow-soft hover:shadow-medium transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-gray-900 flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Settings className="h-5 w-5 text-green-600" />
                  </div>
                  Configurações de Negócio
                </CardTitle>
                <p className="text-sm text-gray-600">Configurações específicas para administradores</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <Label htmlFor="auto-confirm" className="text-gray-900 font-medium">
                      Confirmação Automática
                    </Label>
                    <p className="text-sm text-gray-600">Confirmar agendamentos automaticamente</p>
                  </div>
                  <Switch
                    id="auto-confirm"
                    checked={settings.business.autoConfirm}
                    onCheckedChange={(checked) => 
                      setSettings(prev => ({
                        ...prev,
                        business: { ...prev.business, autoConfirm: checked }
                      }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reminder-time" className="text-gray-900 font-medium">
                    Lembrete (horas antes)
                  </Label>
                  <Input
                    id="reminder-time"
                    type="number"
                    value={settings.business.reminderTime}
                    onChange={(e) => 
                      setSettings(prev => ({
                        ...prev,
                        business: { ...prev.business, reminderTime: parseInt(e.target.value) }
                      }))
                    }
                    className="bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                  <p className="text-sm text-gray-600">Horas antes do agendamento para enviar lembrete</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="max-advance" className="text-gray-900 font-medium">
                    Antecedência Máxima (dias)
                  </Label>
                  <Input
                    id="max-advance"
                    type="number"
                    value={settings.business.maxAdvanceBooking}
                    onChange={(e) => 
                      setSettings(prev => ({
                        ...prev,
                        business: { ...prev.business, maxAdvanceBooking: parseInt(e.target.value) }
                      }))
                    }
                    className="bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                  <p className="text-sm text-gray-600">Dias de antecedência para agendamentos</p>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="gradient-card border-0 shadow-soft hover:shadow-medium transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-gray-900 flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Palette className="h-5 w-5 text-purple-600" />
                </div>
                Preferências
              </CardTitle>
              <p className="text-sm text-gray-600">Personalize a aparência do sistema</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="theme" className="text-gray-900 font-medium">
                  Tema
                </Label>
                <select
                  id="theme"
                  value={settings.preferences.theme}
                  onChange={(e) => 
                    setSettings(prev => ({
                      ...prev,
                      preferences: { ...prev.preferences, theme: e.target.value }
                    }))
                  }
                  className="w-full p-3 bg-white border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="light">Claro</option>
                  <option value="dark">Escuro</option>
                  <option value="auto">Automático</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="language" className="text-gray-900 font-medium">
                  Idioma
                </Label>
                <select
                  id="language"
                  value={settings.preferences.language}
                  onChange={(e) => 
                    setSettings(prev => ({
                      ...prev,
                      preferences: { ...prev.preferences, language: e.target.value }
                    }))
                  }
                  className="w-full p-3 bg-white border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="pt-BR">Português (Brasil)</option>
                  <option value="en-US">English (US)</option>
                  <option value="es-ES">Español</option>
                </select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Seção de Subdomínios - Apenas para Super Admin */}
        {user?.role === 'super-admin' && (
          <Card className="gradient-card border-0 shadow-soft">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <Globe className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div>
                    <CardTitle className="text-gray-900">Gerenciamento de Subdomínios</CardTitle>
                    <p className="text-sm text-gray-600">Configure subdomínios personalizados para cada barbearia</p>
                  </div>
                </div>
                
                <Dialog open={isDomainDialogOpen} onOpenChange={setIsDomainDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white shadow-soft hover:shadow-medium transition-all duration-300">
                      <Globe className="h-4 w-4 mr-2" />
                      Configurar Domínio
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md max-h-[90vh] overflow-hidden flex flex-col">
                    <DialogHeader className="flex-shrink-0">
                      <DialogTitle className="text-gray-900">Configurar Domínio</DialogTitle>
                    </DialogHeader>
                    
                    <div className="flex-1 overflow-y-auto pr-2">
                      <form onSubmit={handleDomainSubmit} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="barbershop-select" className="text-gray-700">Barbearia</Label>
                          <Select 
                            value={selectedBarbershop?.id || ''} 
                            onValueChange={(value) => {
                              const barbershop = barbershops.find(b => b.id === value);
                              setSelectedBarbershop(barbershop || null);
                              if (barbershop) {
                                setDomainFormData({
                                  subdomain: barbershop.subdomain || '',
                                  customDomain: barbershop.customDomain || '',
                                  sslEnabled: barbershop.domainEnabled || false
                                });
                              }
                            }}
                          >
                            <SelectTrigger className="bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                              <SelectValue placeholder="Selecione uma barbearia" />
                            </SelectTrigger>
                            <SelectContent>
                              {barbershops.map((barbershop) => (
                                <SelectItem key={barbershop.id} value={barbershop.id}>
                                  {barbershop.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="subdomain" className="text-gray-700">Subdomínio</Label>
                          <Input
                            id="subdomain"
                            value={domainFormData.subdomain}
                            onChange={(e) => setDomainFormData({...domainFormData, subdomain: e.target.value})}
                            placeholder="minha-barbearia"
                            className="bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                          />
                          <p className="text-xs text-gray-500">
                            URL: {domainFormData.subdomain}.seudominio.com
                          </p>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="customDomain" className="text-gray-700">Domínio Personalizado</Label>
                          <Input
                            id="customDomain"
                            value={domainFormData.customDomain}
                            onChange={(e) => setDomainFormData({...domainFormData, customDomain: e.target.value})}
                            placeholder="minha-barbearia.com"
                            className="bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                          />
                          <p className="text-xs text-gray-500">
                            Deixe em branco para usar apenas o subdomínio
                          </p>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="ssl-enabled"
                            checked={domainFormData.sslEnabled}
                            onCheckedChange={(checked) => setDomainFormData({...domainFormData, sslEnabled: checked})}
                          />
                          <Label htmlFor="ssl-enabled" className="text-gray-700">Habilitar SSL</Label>
                        </div>
                      </form>
                    </div>
                    
                    {/* Botões fixos na parte inferior */}
                    <div className="flex justify-end space-x-2 pt-4 border-t border-gray-200 flex-shrink-0">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setIsDomainDialogOpen(false);
                          setSelectedBarbershop(null);
                          setDomainFormData({ subdomain: '', customDomain: '', sslEnabled: false });
                        }}
                      >
                        Cancelar
                      </Button>
                      <Button 
                        type="submit"
                        onClick={(e) => {
                          e.preventDefault();
                          handleDomainSubmit(e as any);
                        }}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        Salvar Configurações
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {barbershops.map((barbershop) => {
                  const domainSetting = domainSettings.find(ds => ds.barbershopId === barbershop.id);
                  const subdomainUrl = barbershop.subdomain ? `https://${barbershop.subdomain}.seudominio.com` : null;
                  const customUrl = barbershop.customDomain ? `https://${barbershop.customDomain}` : null;
                  
                  return (
                    <div key={barbershop.id} className="p-4 bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-xl shadow-soft">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-gray-900">{barbershop.name}</h3>
                          <p className="text-sm text-gray-600">{barbershop.address}</p>
                        </div>
                        {domainSetting && (
                          <Badge className={`text-xs px-2 py-1 rounded-full border ${getStatusColor(domainSetting.status)}`}>
                            <div className="flex items-center gap-1">
                              {getStatusIcon(domainSetting.status)}
                              {domainSetting.status === 'active' ? 'Ativo' : 
                               domainSetting.status === 'error' ? 'Erro' : 'Pendente'}
                            </div>
                          </Badge>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        {subdomainUrl && (
                          <div className="flex items-center justify-between p-2 bg-white rounded-lg">
                            <div className="flex items-center gap-2">
                              <Globe className="h-4 w-4 text-blue-500" />
                              <span className="text-sm font-medium text-gray-900">Subdomínio:</span>
                              <span className="text-sm text-blue-600">{subdomainUrl}</span>
                            </div>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => window.open(subdomainUrl, '_blank')}
                                className="hover:bg-blue-50"
                              >
                                <ExternalLink className="h-4 w-4 text-blue-600" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(subdomainUrl)}
                                className="hover:bg-gray-50"
                              >
                                <Copy className="h-4 w-4 text-gray-600" />
                              </Button>
                            </div>
                          </div>
                        )}
                        
                        {customUrl && (
                          <div className="flex items-center justify-between p-2 bg-white rounded-lg">
                            <div className="flex items-center gap-2">
                              <Globe className="h-4 w-4 text-green-500" />
                              <span className="text-sm font-medium text-gray-900">Domínio Customizado:</span>
                              <span className="text-sm text-green-600">{customUrl}</span>
                            </div>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => window.open(customUrl, '_blank')}
                                className="hover:bg-green-50"
                              >
                                <ExternalLink className="h-4 w-4 text-green-600" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(customUrl)}
                                className="hover:bg-gray-50"
                              >
                                <Copy className="h-4 w-4 text-gray-600" />
                              </Button>
                            </div>
                          </div>
                        )}
                        
                        {!subdomainUrl && !customUrl && (
                          <div className="text-center py-4">
                            <Globe className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm text-gray-600">Nenhum domínio configurado</p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default SettingsPage;
