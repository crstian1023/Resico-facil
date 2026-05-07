import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  DollarSign, TrendingUp, TrendingDown, FolderOpen,
  FileText, Plus, ArrowRight, AlertCircle, CheckCircle2
} from 'lucide-react';
import AppLayout from '@/components/AppLayout';

const StatCard: React.FC<{
  title: string; value: string; subtitle?: string;
  icon: React.ReactNode; variant?: 'default' | 'success' | 'warning';
}> = ({ title, value, subtitle, icon, variant = 'default' }) => (
  <Card className="animate-fade-in">
    <CardContent className="p-4 flex items-start gap-3">
      <div className={`p-2 rounded-lg ${
        variant === 'success' ? 'bg-accent text-accent-foreground' :
        variant === 'warning' ? 'bg-warning/10 text-warning' :
        'bg-muted text-muted-foreground'
      }`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{title}</p>
        <p className="text-lg font-bold font-display">{value}</p>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </div>
    </CardContent>
  </Card>
);

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const displayName = user?.user_metadata?.full_name?.split(' ')[0] || 'Usuario';

  const currentMonth = new Date().toLocaleDateString('es-MX', { month: 'long', year: 'numeric' });

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold font-display">¡Hola, {displayName}!</h1>
          <p className="text-muted-foreground text-sm capitalize">{currentMonth}</p>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard title="Ingresos del mes" value="$0.00" icon={<TrendingUp size={18} />} variant="success" />
          <StatCard title="Gastos del mes" value="$0.00" icon={<TrendingDown size={18} />} />
          <StatCard title="Expediente" value="0%" subtitle="Completado" icon={<FolderOpen size={18} />} variant="warning" />
          <StatCard title="Declaraciones" value="0" subtitle="Pendientes" icon={<FileText size={18} />} />
        </div>

        {/* Quick actions */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-display">Acciones rápidas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start h-12 text-left" onClick={() => navigate('/income-expenses')}>
              <Plus size={18} className="mr-2 text-primary shrink-0" />
              <span>Registrar ingreso o gasto</span>
              <ArrowRight size={16} className="ml-auto text-muted-foreground" />
            </Button>
            <Button variant="outline" className="w-full justify-start h-12 text-left" onClick={() => navigate('/documents')}>
              <FolderOpen size={18} className="mr-2 text-primary shrink-0" />
              <span>Subir documento</span>
              <ArrowRight size={16} className="ml-auto text-muted-foreground" />
            </Button>
            <Button variant="outline" className="w-full justify-start h-12 text-left" onClick={() => navigate('/declarations')}>
              <FileText size={18} className="mr-2 text-primary shrink-0" />
              <span>Preparar declaración</span>
              <ArrowRight size={16} className="ml-auto text-muted-foreground" />
            </Button>
          </CardContent>
        </Card>

        {/* Pending tasks */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-display">Pendientes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-warning/5 border border-warning/20">
              <AlertCircle size={18} className="text-warning shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium">Completa tu perfil fiscal</p>
                <p className="text-xs text-muted-foreground">Necesitas agregar tu RFC y datos fiscales</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-accent/50">
              <CheckCircle2 size={18} className="text-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium">Registra tus ingresos de hoy</p>
                <p className="text-xs text-muted-foreground">Mantén tus registros al día</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
