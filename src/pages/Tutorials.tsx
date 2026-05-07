import React from 'react';
import AppLayout from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { GraduationCap, Play, CheckCircle2, Clock } from 'lucide-react';

const topics = [
  { id: '1', title: '¿Qué es RESICO?', description: 'Conoce el régimen simplificado de confianza', duration: '5 min', completed: true },
  { id: '2', title: 'Cómo registrar tus ventas', description: 'Paso a paso para llevar tu registro diario', duration: '3 min', completed: true },
  { id: '3', title: 'Tu expediente fiscal', description: 'Qué documentos necesitas y cómo organizarlos', duration: '4 min', completed: false },
  { id: '4', title: 'Cómo presentar tu declaración', description: 'Guía simplificada del proceso mensual', duration: '6 min', completed: false },
  { id: '5', title: 'Finanzas personales básicas', description: 'Separa lo personal de lo del negocio', duration: '5 min', completed: false },
  { id: '6', title: 'Beneficios de estar al día', description: 'Accede a créditos y apoyos', duration: '4 min', completed: false },
];

const Tutorials = () => {
  const completed = topics.filter(t => t.completed).length;
  const progress = Math.round((completed / topics.length) * 100);

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold font-display">Aprende</h1>

        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="flex justify-between items-center">
              <p className="text-sm font-medium">Tu progreso</p>
              <span className="text-sm font-bold text-primary">{completed}/{topics.length}</span>
            </div>
            <Progress value={progress} className="h-3" />
          </CardContent>
        </Card>

        <div className="space-y-3">
          {topics.map((topic, i) => (
            <Card key={topic.id} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                  topic.completed ? 'bg-success text-success-foreground' : 'bg-muted text-muted-foreground'
                }`}>
                  {topic.completed ? <CheckCircle2 size={18} /> : <Play size={18} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{topic.title}</p>
                  <p className="text-xs text-muted-foreground">{topic.description}</p>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                  <Clock size={12} /> {topic.duration}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AppLayout>
  );
};

export default Tutorials;
