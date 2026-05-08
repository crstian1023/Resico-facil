import React, { useEffect, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { HandCoins, Building2, ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface Program {
  id: string;
  name: string;
  institution: string;
  program_type: string | null;
  max_amount: number | null;
  description: string | null;
}

const SupportCredits = () => {
  const { user } = useAuth();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [appliedIds, setAppliedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!user) return;
    const [pRes, aRes] = await Promise.all([
      supabase.from('support_programs').select('*').eq('is_active', true).order('name'),
      supabase.from('support_applications').select('program_id').eq('user_id', user.id),
    ]);
    setPrograms((pRes.data ?? []) as Program[]);
    setAppliedIds(new Set((aRes.data ?? []).map((a: any) => a.program_id)));
    setLoading(false);
  };

  useEffect(() => { load(); }, [user]);

  const apply = async (programId: string) => {
    if (!user) return;
    const { error } = await supabase
      .from('support_applications')
      .insert({ user_id: user.id, program_id: programId, status: 'interested' });
    if (error) toast.error(`Error: ${error.message}`);
    else { toast.success('Solicitud registrada'); await load(); }
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold font-display">Apoyos y Créditos</h1>

        <Card className="bg-accent/30 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <HandCoins size={24} className="text-primary shrink-0 mt-1" />
              <div>
                <p className="font-medium text-sm">Tu expediente fiscal te abre puertas</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Mantén tu expediente completo y tus registros al día para acceder a programas de apoyo y financiamiento.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-display">Programas disponibles</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              [1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full" />)
            ) : programs.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No hay programas disponibles ahora</p>
            ) : (
              programs.map((p) => {
                const applied = appliedIds.has(p.id);
                return (
                  <div key={p.id} className="flex items-center gap-3 p-4 rounded-lg border border-border hover:bg-muted/30 transition-colors">
                    <div className="p-2 rounded-lg bg-muted"><Building2 size={18} /></div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{p.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {p.institution}
                        {p.max_amount ? ` · Hasta $${Number(p.max_amount).toLocaleString('es-MX')}` : ''}
                      </p>
                    </div>
                    {applied ? (
                      <Badge className="bg-success text-success-foreground text-xs">Solicitado</Badge>
                    ) : (
                      <Button size="sm" variant="outline" onClick={() => apply(p.id)}>
                        Me interesa <ArrowRight size={14} />
                      </Button>
                    )}
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default SupportCredits;
