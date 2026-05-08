import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Check, Star, Crown } from 'lucide-react';

const plans = [
  { id: 'free', name: 'Gratuito', price: '$0', period: '/mes', features: ['5 ingresos/gastos al mes', 'Expediente básico', '1 declaración'], icon: Star, current: true },
  { id: 'basic', name: 'Básico', price: '$149', period: '/mes', features: ['Ilimitados ingresos/gastos', 'Expediente completo', 'Declaraciones ilimitadas', 'Soporte por chat'], icon: CreditCard, current: false },
  { id: 'pro', name: 'Profesional', price: '$299', period: '/mes', features: ['Todo lo de Básico', 'Contador asignado', 'OCR avanzado', 'Apoyos y créditos', 'Soporte prioritario'], icon: Crown, current: false },
];

const Payments = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold font-display">Pagos y Suscripción</h1>

        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-accent text-accent-foreground"><Star size={18} /></div>
            <div className="flex-1">
              <p className="font-medium text-sm">Plan actual: Gratuito</p>
              <p className="text-xs text-muted-foreground">Primer año con subsidio incluido</p>
            </div>
            <Badge className="bg-success text-success-foreground">Activo</Badge>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-3">
          {plans.map(plan => (
            <Card key={plan.id} className={plan.current ? 'border-2 border-primary' : ''}>
              <CardHeader className="pb-3 text-center">
                <plan.icon size={28} className="mx-auto text-primary mb-2" />
                <CardTitle className="font-display text-lg">{plan.name}</CardTitle>
                <div>
                  <span className="text-3xl font-bold font-display">{plan.price}</span>
                  <span className="text-muted-foreground text-sm">{plan.period}</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {plan.features.map(f => (
                  <div key={f} className="flex items-center gap-2 text-sm">
                    <Check size={14} className="text-primary shrink-0" /> {f}
                  </div>
                ))}
                <Button variant={plan.current ? 'outline' : 'default'} className="w-full mt-4" disabled={plan.current}>
                  {plan.current ? 'Plan actual' : 'Elegir plan'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-display">Historial de pagos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground text-center py-6">No hay pagos registrados</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Payments;
