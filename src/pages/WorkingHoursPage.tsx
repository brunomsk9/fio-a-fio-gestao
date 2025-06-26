import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Switch } from '../components/ui/switch';
import { toast } from '../components/ui/use-toast';
import { supabase } from '../integrations/supabase/client';
import { useAuthStore } from '../store/authStore';
import { WorkingHours } from '../types';

const WorkingHoursPage: React.FC = () => {
  const { user } = useAuthStore();
  const [workingHours, setWorkingHours] = useState<WorkingHours>({
    monday: { start: '09:00', end: '18:00', isWorking: true },
    tuesday: { start: '09:00', end: '18:00', isWorking: true },
    wednesday: { start: '09:00', end: '18:00', isWorking: true },
    thursday: { start: '09:00', end: '18:00', isWorking: true },
    friday: { start: '09:00', end: '18:00', isWorking: true },
    saturday: { start: '09:00', end: '16:00', isWorking: true },
    sunday: { start: '09:00', end: '16:00', isWorking: false },
  });

  const dayNames = {
    monday: 'Segunda-feira',
    tuesday: 'Terça-feira',
    wednesday: 'Quarta-feira',
    thursday: 'Quinta-feira',
    friday: 'Sexta-feira',
    saturday: 'Sábado',
    sunday: 'Domingo',
  };

  useEffect(() => {
    fetchWorkingHours();
  }, [user]);

  const fetchWorkingHours = async () => {
    if (!user || user.role !== 'barber') return;

    try {
      const { data, error } = await supabase
        .from('barbers')
        .select('working_hours')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      
      if (data.working_hours) {
        setWorkingHours(data.working_hours);
      }
    } catch (error) {
      console.error('Error fetching working hours:', error);
    }
  };

  const handleSave = async () => {
    if (!user || user.role !== 'barber') return;

    try {
      const { error } = await supabase
        .from('barbers')
        .update({ working_hours: workingHours })
        .eq('id', user.id);

      if (error) throw error;
      
      toast({
        title: "Sucesso!",
        description: "Horários de trabalho atualizados"
      });
    } catch (error) {
      console.error('Error updating working hours:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar os horários",
        variant: "destructive"
      });
    }
  };

  const updateWorkingHours = (day: keyof WorkingHours, field: string, value: string | boolean) => {
    setWorkingHours(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value
      }
    }));
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Horários de Trabalho</h1>
          <p className="text-gray-400">Configure seus horários de disponibilidade</p>
        </div>

        <Card className="bg-slate-800/50 border-amber-500/20">
          <CardHeader>
            <CardTitle className="text-white">Configurar Horários</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {Object.entries(workingHours).map(([day, hours]) => (
              <div key={day} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center p-4 bg-slate-700/30 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={hours.isWorking}
                    onCheckedChange={(checked) => updateWorkingHours(day as keyof WorkingHours, 'isWorking', checked)}
                  />
                  <Label className="text-white font-medium">
                    {dayNames[day as keyof typeof dayNames]}
                  </Label>
                </div>

                {hours.isWorking && (
                  <>
                    <div>
                      <Label htmlFor={`${day}-start`} className="text-gray-300">Início</Label>
                      <Input
                        id={`${day}-start`}
                        type="time"
                        value={hours.start}
                        onChange={(e) => updateWorkingHours(day as keyof WorkingHours, 'start', e.target.value)}
                        className="bg-slate-600 border-slate-500 text-white"
                      />
                    </div>

                    <div>
                      <Label htmlFor={`${day}-end`} className="text-gray-300">Fim</Label>
                      <Input
                        id={`${day}-end`}
                        type="time"
                        value={hours.end}
                        onChange={(e) => updateWorkingHours(day as keyof WorkingHours, 'end', e.target.value)}
                        className="bg-slate-600 border-slate-500 text-white"
                      />
                    </div>
                  </>
                )}

                {!hours.isWorking && (
                  <div className="md:col-span-2">
                    <span className="text-gray-400 italic">Não trabalha neste dia</span>
                  </div>
                )}
              </div>
            ))}

            <Button
              onClick={handleSave}
              className="w-full bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold"
            >
              Salvar Horários
            </Button>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default WorkingHoursPage;
