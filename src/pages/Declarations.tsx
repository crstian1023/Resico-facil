import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { FileText, ChevronRight, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';

interface Declaration {
  id: string;
  period: string;
  year: number;
  status: 'draft' | 'ready' | 'submitted';
  income: number;
  expenses: number;
  tax: number;
}

const Declarations = () => {
  const [declarations] = useState<Declaration[]>([
    { id: '1', period: 'Enero', year: 2024, status: 'submitted', income: 45000, expenses: 12000, tax: 990 },
    { id: '2', period: 'Febrero', year: 2024, status: 'ready', income: 52000, expenses: 15000, tax: 1110 },
    { id: '3', period: 'Marzo', year: 2024, status: 'draft', income: 38000, expenses: 9000, tax: 870 },
  ]);

  const [wizardStep, setWizardStep] = useState(0);
  const [showWizard, setShowWizard] = useState(false);

  const wizardSteps = [
    { title: 'Revisa tus ingresos', description: 'Confirma que todos tus ingresos del mes estén registrados.' },
    { title: 'Revisa tus gastos', description: 'Verifica que tus gastos deducibles estén completos.' },
    { title: 'Cálculo estimado', description: 'Revisamos el impuesto estimado con base en tus datos.' },
    { title: 'Genera formulario', description: 'Descarga tu formulario listo para presentar al SAT.' },
  ];

  const statusConfig = {
    draft: { label: 'Borrador', variant: 'secondary' as const, icon: Clock },
    ready: { label: 'Listo', variant: 'default' as const, icon: CheckCircle2 },
    submitted: { label: 'Presentado', variant: 'outline' as const, icon: CheckCircle2 },
  };

  const formatMoney = (n: number) => `$${n.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold font-display">Declaraciones</h1>
          <Button size="lg" onClick={() => setShowWizard(true)}>
            <FileText size={18} /> Nueva declaración
          </Button>
        </div>

        {showWizard && (
          <Card className="border-2 border-primary/20">
            <CardHeader>
              <CardTitle className="text-base font-display">Preparar declaración - Paso {wizardStep + 1} de {wizardSteps.length}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Progress value={((wizardStep + 1) / wizardSteps.length) * 100} className="h-2" />
              <div className="p-4 rounded-lg bg-accent/50">
                <h3 className="font-semibold">{wizardSteps[wizardStep].title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{wizardSteps[wizardStep].description}</p>
              </div>
              <div className="flex gap-2">
                {wizardStep > 0 && (
                  <Button variant="outline" onClick={() => setWizardStep(s => s - 1)}>Anterior</Button>
                )}
                {wizardStep < wizardSteps.length - 1 ? (
                  <Button onClick={() => setWizardStep(s => s + 1)}>Siguiente</Button>
                ) : (
                  <Button onClick={() => { setShowWizard(false); setWizardStep(0); }}>Generar formulario</Button>
                )}
                <Button variant="ghost" onClick={() => { setShowWizard(false); setWizardStep(0); }}>Cancelar</Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-display">Historial de declaraciones</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {declarations.map(dec => {
              const cfg = statusConfig[dec.status];
              const Icon = cfg.icon;
              return (
                <div key={dec.id} className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/30 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-muted">
                      <FileText size={18} />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{dec.period} {dec.year}</p>
                      <p className="text-xs text-muted-foreground">
                        Ingresos: {formatMoney(dec.income)} · Gastos: {formatMoney(dec.expenses)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <p className="text-sm font-bold">{formatMoney(dec.tax)}</p>
                      <Badge variant={cfg.variant} className="text-xs">{cfg.label}</Badge>
                    </div>
                    <ChevronRight size={16} className="text-muted-foreground" />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Declarations;
