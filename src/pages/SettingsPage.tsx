
import React, { useState } from 'react';
import { Layout } from '../components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Switch } from '../components/ui/switch';
import { Textarea } from '../components/ui/textarea';
import { toast } from '../components/ui/use-toast';
import { useAuthStore } from '../store/authStore';
import { Settings, Bell, Shield, Palette } from 'lucide-react';

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

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Configurações</h1>
          <p className="text-gray-400">Personalize sua experiência no sistema</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-slate-800/50 border-amber-500/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notificações
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="email-notifications" className="text-white">
                  Notificações por Email
                </Label>
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

              <div className="flex items-center justify-between">
                <Label htmlFor="whatsapp-notifications" className="text-white">
                  Notificações por WhatsApp
                </Label>
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

              <div className="flex items-center justify-between">
                <Label htmlFor="push-notifications" className="text-white">
                  Notificações Push
                </Label>
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

          <Card className="bg-slate-800/50 border-amber-500/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Privacidade
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="show-phone" className="text-white">
                  Mostrar Telefone no Perfil
                </Label>
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

              <div className="flex items-center justify-between">
                <Label htmlFor="show-email" className="text-white">
                  Mostrar Email no Perfil
                </Label>
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
            <Card className="bg-slate-800/50 border-amber-500/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Configurações de Negócio
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="auto-confirm" className="text-white">
                    Confirmação Automática
                  </Label>
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

                <div>
                  <Label htmlFor="reminder-time" className="text-white">
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
                    className="bg-slate-700 border-slate-600 text-white mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="max-advance" className="text-white">
                    Máximo de dias para agendamento
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
                    className="bg-slate-700 border-slate-600 text-white mt-1"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="bg-slate-800/50 border-amber-500/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Aparência
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="theme" className="text-white">Tema</Label>
                <select
                  id="theme"
                  value={settings.preferences.theme}
                  onChange={(e) => 
                    setSettings(prev => ({
                      ...prev,
                      preferences: { ...prev.preferences, theme: e.target.value }
                    }))
                  }
                  className="w-full mt-1 bg-slate-700 border border-slate-600 text-white rounded-md px-3 py-2"
                >
                  <option value="dark">Escuro</option>
                  <option value="light">Claro</option>
                  <option value="auto">Automático</option>
                </select>
              </div>

              <div>
                <Label htmlFor="language" className="text-white">Idioma</Label>
                <select
                  id="language"
                  value={settings.preferences.language}
                  onChange={(e) => 
                    setSettings(prev => ({
                      ...prev,
                      preferences: { ...prev.preferences, language: e.target.value }
                    }))
                  }
                  className="w-full mt-1 bg-slate-700 border border-slate-600 text-white rounded-md px-3 py-2"
                >
                  <option value="pt-BR">Português (Brasil)</option>
                  <option value="en-US">English (US)</option>
                  <option value="es-ES">Español</option>
                </select>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end">
          <Button 
            onClick={handleSave}
            className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold"
          >
            Salvar Configurações
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default SettingsPage;
