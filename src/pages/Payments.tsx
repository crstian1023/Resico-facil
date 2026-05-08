import React, { useEffect, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { CreditCard, Check, Star, Crown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface Plan {
  id: string;
  name: string;
  price: number;
  interval: string;
  features: any;
}

interface Subscription {
  id: string;
  plan_id: string | null;
  status: string;
  is_subsidized: boolean;
}

const planIcons: Record<string, React.ElementType> = {
  Gratuito: Star, Básico: CreditCard, Profesional: Crown,
};

const Payments = () => {
  const { user } = useAuth();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [activating, setActivating] = useState<string | null>(null);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    const [plansRes, subRes] = await Promise.all([
      supabase.from('subscription_plans').select('*').eq('is_active', true).order('price'),
      supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);
    setPlans((plansRes.data ?? []) as Plan[]);
    setSubscription((subRes.data ?? null) as Subscription | null);
    setLoading(false);
  };

  useEffect(() => { load(); }, [user]);

  const choosePlan = async (planId: string, price: number) => {
    if (!user) return;
    setActivating(planId);
    const { error } = await supabase.from('user_subscriptions').insert({
      user_id: user.id,
      plan_id: planId,
      status: 'active',
      is_subsidized: price === 0,
    });
    if (error) toast.error(`Error: ${error.message}`);
    else { toast.success('Plan activado'); await load(); }
    setActivating(null);
  };

  const currentPlan = plans.find((p) => p.id === subscription?.plan_id);

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold font-display">Pagos y Suscripción</h1>

        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-accent text-accent-foreground"><Star size={18} /></div>
            <div className="flex-1">
              <p className="font-medium text-sm">
                Plan actual: {loading ? '...' : currentPlan?.name ?? 'Sin plan activo'}
              </p>
              <p className="text-xs text-muted-foreground">
                {subscription?.is_subsidized ? 'Subsidiado' : 'Suscripción regular'}
              </p>
            </div>
            {subscription && <Badge className="bg-success text-success-foreground">Activo</Badge>}
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-3">
          {loading ? (
            [1, 2, 3].map((i) => <Skeleton key={i} className="h-72 w-full" />)
          ) : (
            plans.map((plan) => {
              const Icon = planIcons[plan.name] ?? CreditCard;
              const isCurrent = plan.id === subscription?.plan_id;
              const features: string[] = Array.isArray(plan.features)
                ? plan.features
                : (plan.features?.items ?? []);
              return (
                <Card key={plan.id} className={isCurrent ? 'border-2 border-primary' : ''}>
                  <CardHeader className="pb-3 text-center">
                    <Icon size={28} className="mx-auto text-primary mb-2" />
                    <CardTitle className="font-display text-lg">{plan.name}</CardTitle>
                    <div>
                      <span className="text-3xl font-bold font-display">
                        ${Number(plan.price).toLocaleString('es-MX')}
                      </span>
                      <span className="text-muted-foreground text-sm">/{plan.interval === 'monthly' ? 'mes' : plan.interval}</span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {features.map((f) => (
                      <div key={f} className="flex items-center gap-2 text-sm">
                        <Check size={14} className="text-primary shrink-0" /> {f}
                      </div>
                    ))}
                    <Button
                      variant={isCurrent ? 'outline' : 'default'}
                      className="w-full mt-4"
                      disabled={isCurrent || activating === plan.id}
                      onClick={() => choosePlan(plan.id, Number(plan.price))}
                    >
                      {isCurrent ? 'Plan actual' : activating === plan.id ? 'Activando...' : 'Elegir plan'}
                    </Button>
                  </CardContent>
                </Card>
              );
            })
          )}
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
    </AppLayout>
  );
};

export default Payments;
