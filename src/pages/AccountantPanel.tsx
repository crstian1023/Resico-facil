import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { useAccountantClients } from '@/hooks/useAccountantClients';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LogOut, UserPlus, Search, Users, Calculator, FileText, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

const ClientDetail: React.FC<{ clientId: string; onBack: () => void }> = ({ clientId, onBack }) => {
  const { user } = useAuth();
  const [note, setNote] = useState('');

  const { data: summary, isLoading } = useQuery({
    queryKey: ['client_summary', clientId],
    queryFn: async () => {
      const [{ data: tp }, { data: lastCalc }, { data: drafts }, { data: notes }] = await Promise.all([
        supabase.from('taxpayer_profiles').select('*').eq('user_id', clientId).maybeSingle(),
        supabase.from('tax_calculations').select('*').eq('user_id', clientId).eq('is_current', true).order('period_year', { ascending: false }).order('period_month', { ascending: false }).limit(1).maybeSingle(),
        supabase.from('declaration_drafts').select('id, period_year, period_month, status, pdf_url').eq('user_id', clientId).order('period_year', { ascending: false }).order('period_month', { ascending: false }).limit(6),
        supabase.from('accountant_notes').select('id, content, created_at').eq('client_id', clientId).eq('accountant_id', user!.id).order('created_at', { ascending: false }),
      ]);
      return { tp, lastCalc, drafts: drafts ?? [], notes: notes ?? [] };
    },
  });

  const addNote = async () => {
    if (!note.trim() || !user) return;
    const { error } = await supabase.from('accountant_notes').insert({
      client_id: clientId,
      accountant_id: user.id,
      content: note.trim(),
    });
    if (error) {
      toast.error('No se pudo guardar la nota');
      return;
    }
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: 'accountant.note.create',
      table_name: 'accountant_notes',
      record_id: clientId,
    });
    toast.success('Nota guardada');
    setNote('');
  };

  if (isLoading) return <Skeleton className="h-64 w-full" />;

  return (
    <div className="space-y-4">
      <Button variant="ghost" size="sm" onClick={onBack}>← Volver</Button>

      <Card>
        <CardHeader><CardTitle className="text-base">Datos fiscales</CardTitle></CardHeader>
        <CardContent className="text-sm space-y-1">
          <p><span className="text-muted-foreground">RFC:</span> {summary?.tp?.rfc ?? '—'}</p>
          <p><span className="text-muted-foreground">Régimen:</span> {summary?.tp?.tax_regime ?? '—'}</p>
          <p><span className="text-muted-foreground">Actividad:</span> {summary?.tp?.economic_activity ?? '—'}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Último cálculo fiscal</CardTitle></CardHeader>
        <CardContent className="text-sm">
          {summary?.lastCalc ? (
            <div className="grid grid-cols-2 gap-2">
              <div><p className="text-muted-foreground text-xs">Periodo</p><p className="font-semibold">{summary.lastCalc.period_month}/{summary.lastCalc.period_year}</p></div>
              <div><p className="text-muted-foreground text-xs">ISR estimado</p><p className="font-semibold">${Number(summary.lastCalc.estimated_tax).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</p></div>
              <div><p className="text-muted-foreground text-xs">Ingresos</p><p>${Number(summary.lastCalc.total_income).toLocaleString('es-MX')}</p></div>
              <div><p className="text-muted-foreground text-xs">Gastos</p><p>${Number(summary.lastCalc.total_expenses).toLocaleString('es-MX')}</p></div>
            </div>
          ) : <p className="text-muted-foreground">Sin cálculos.</p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Declaraciones recientes</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {summary?.drafts.length ? summary.drafts.map((d: any) => (
            <div key={d.id} className="flex items-center justify-between text-sm p-2 rounded border border-border">
              <span>{d.period_month}/{d.period_year}</span>
              <Badge variant="secondary">{d.status}</Badge>
            </div>
          )) : <p className="text-sm text-muted-foreground">Sin declaraciones.</p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Notas del contador</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Agrega una nota..." />
            <Button onClick={addNote} disabled={!note.trim()}>Guardar</Button>
          </div>
          <div className="space-y-2">
            {summary?.notes.length ? summary.notes.map((n: any) => (
              <div key={n.id} className="text-sm p-2 rounded bg-muted">
                <p>{n.content}</p>
                <p className="text-xs text-muted-foreground mt-1">{new Date(n.created_at).toLocaleString('es-MX')}</p>
              </div>
            )) : <p className="text-sm text-muted-foreground">Sin notas.</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const AccountantPanel: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { data: role, isLoading: roleLoading } = useUserRole();
  const { data: clients, isLoading, inviteByRfc } = useAccountantClients();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'pending'>('all');
  const [rfcInvite, setRfcInvite] = useState('');
  const [selectedClient, setSelectedClient] = useState<string | null>(null);

  if (roleLoading) return <div className="min-h-screen flex items-center justify-center"><p className="text-muted-foreground">Cargando...</p></div>;
  if (role !== 'accountant' && role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center space-y-3">
            <AlertCircle className="mx-auto text-warning" size={32} />
            <p className="font-medium">Esta sección es exclusiva para contadores.</p>
            <Button onClick={() => navigate('/dashboard')}>Ir al dashboard</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const filtered = (clients ?? []).filter((c) => {
    const matchesFilter = filter === 'all' || c.status === filter;
    const q = search.trim().toLowerCase();
    const matchesSearch = !q || (c.client_name?.toLowerCase().includes(q) || c.client_rfc?.toLowerCase().includes(q));
    return matchesFilter && matchesSearch;
  });

  const handleInvite = async () => {
    if (!rfcInvite.trim()) return;
    try {
      await inviteByRfc.mutateAsync(rfcInvite);
      toast.success('Invitación enviada. El cliente debe aceptarla.');
      setRfcInvite('');
    } catch (e: any) {
      toast.error(e.message || 'No se pudo enviar la invitación');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calculator className="text-primary" size={20} />
            <h1 className="font-display font-bold text-lg">Panel Contador</h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground hidden sm:inline">{user?.email}</span>
            <Button variant="ghost" size="sm" onClick={async () => { await signOut(); navigate('/login'); }}>
              <LogOut size={16} />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-4 md:p-6">
        {selectedClient ? (
          <ClientDetail clientId={selectedClient} onBack={() => setSelectedClient(null)} />
        ) : (
          <Tabs defaultValue="clients">
            <TabsList>
              <TabsTrigger value="clients"><Users size={14} className="mr-1" /> Clientes</TabsTrigger>
              <TabsTrigger value="invite"><UserPlus size={14} className="mr-1" /> Invitar</TabsTrigger>
            </TabsList>

            <TabsContent value="clients" className="space-y-4 mt-4">
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por nombre o RFC" className="pl-9" />
                </div>
                <div className="flex gap-1">
                  {(['all', 'active', 'pending'] as const).map((f) => (
                    <Button key={f} size="sm" variant={filter === f ? 'default' : 'outline'} onClick={() => setFilter(f)}>
                      {f === 'all' ? 'Todos' : f === 'active' ? 'Activos' : 'Pendientes'}
                    </Button>
                  ))}
                </div>
              </div>

              {isLoading ? (
                <Skeleton className="h-32 w-full" />
              ) : filtered.length === 0 ? (
                <Card><CardContent className="p-8 text-center text-muted-foreground">
                  <Users className="mx-auto mb-2 opacity-50" size={32} />
                  <p>No hay clientes para mostrar.</p>
                </CardContent></Card>
              ) : (
                <div className="grid gap-3">
                  {filtered.map((c) => (
                    <Card key={c.id} className="hover:border-primary transition-colors cursor-pointer" onClick={() => c.status === 'active' && setSelectedClient(c.client_id)}>
                      <CardContent className="p-4 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-medium truncate">{c.client_name || 'Cliente'}</p>
                          <p className="text-xs text-muted-foreground">RFC: {c.client_rfc || '—'}</p>
                        </div>
                        <Badge variant={c.status === 'active' ? 'default' : c.status === 'pending' ? 'secondary' : 'outline'}>
                          {c.status === 'active' ? 'Activo' : c.status === 'pending' ? 'Pendiente' : c.status}
                        </Badge>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="invite" className="mt-4">
              <Card>
                <CardHeader><CardTitle className="text-base">Invitar cliente por RFC</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">El cliente debe aceptar la invitación desde su cuenta antes de que puedas acceder a su información.</p>
                  <div className="flex gap-2">
                    <Input value={rfcInvite} onChange={(e) => setRfcInvite(e.target.value.toUpperCase())} placeholder="RFC del cliente" maxLength={13} className="uppercase" />
                    <Button onClick={handleInvite} disabled={inviteByRfc.isPending}>
                      <FileText size={16} className="mr-1" /> Invitar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  );
};

export default AccountantPanel;
