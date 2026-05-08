import React, { useEffect, useMemo, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  FileText, ChevronRight, CheckCircle2, Clock, Loader2, RefreshCw,
  Sparkles, Pencil, Download, History, Lock,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  useCalculateTaxPeriod,
  useDeclarationDrafts,
  useSaveDeclarationDraft,
  useTaxCalculations,
  usePeriodVersions,
  useGenerateDeclarationPdf,
  useRefreshPdfSignedUrl,
  type TaxCalculation,
} from '@/hooks/useTaxEngine';
import { useTaxpayerProfile } from '@/hooks/useTaxpayerProfile';

const fmt = (n: number) => `$${Number(n).toLocaleString('es-MX', { minimumFractionDigits: 2 })}`;
const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

const Declarations = () => {
  const now = new Date();
  const [showWizard, setShowWizard] = useState(false);
  const [wizardStep, setWizardStep] = useState(0);
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [currentCalc, setCurrentCalc] = useState<TaxCalculation | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editIncome, setEditIncome] = useState('');
  const [editExpenses, setEditExpenses] = useState('');
  const [editTaxableBase, setEditTaxableBase] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [versionsModal, setVersionsModal] = useState<{ year: number; month: number } | null>(null);

  const { data: profile } = useTaxpayerProfile();
  const { data: calculations, isLoading } = useTaxCalculations({ onlyCurrent: true });
  const { data: drafts } = useDeclarationDrafts();
  const calculate = useCalculateTaxPeriod();
  const saveDraft = useSaveDeclarationDraft();
  const generatePdf = useGenerateDeclarationPdf();
  const refreshSigned = useRefreshPdfSignedUrl();
  const versions = usePeriodVersions(versionsModal?.year, versionsModal?.month);

  useEffect(() => {
    if (currentCalc) {
      setEditIncome(String(currentCalc.total_income ?? 0));
      setEditExpenses(String(currentCalc.total_expenses ?? 0));
      setEditTaxableBase(String(currentCalc.taxable_base ?? 0));
    }
  }, [currentCalc?.id]);

  const isAdjusted = !!(currentCalc as any)?.breakdown?.adjusted;

  const draftByCalc = useMemo(() => {
    const map = new Map<string, ReturnType<typeof Object> | any>();
    (drafts ?? []).forEach((d) => { if (d.calculation_id) map.set(d.calculation_id, d); });
    return map;
  }, [drafts]);

  const wizardSteps = [
    { title: 'Selecciona el periodo', description: 'Elige el mes y año a declarar.' },
    { title: 'Cálculo server-side', description: 'Calculamos ISR RESICO con tus ingresos y gastos.' },
    { title: 'Revisa el resumen', description: 'Puedes ajustar los montos y recalcular. Cada recalculo crea una nueva versión.' },
    { title: 'Guarda y genera PDF', description: 'El borrador se congela y se guarda el PDF final.' },
  ];

  const years = Array.from({ length: 5 }).map((_, i) => now.getFullYear() - i);

  const handleCalculate = async () => {
    try {
      const calc = await calculate.mutateAsync({
        year, month, taxpayer_profile_id: profile?.id ?? null,
      });
      setCurrentCalc(calc);
      setEditMode(false); setEditNotes('');
      setWizardStep(2);
    } catch (e: any) { toast.error(e.message ?? 'Error al calcular'); }
  };

  const validateOverrides = () => {
    const i = Number(editIncome), e = Number(editExpenses), b = Number(editTaxableBase);
    if (!Number.isFinite(i) || i < 0) { toast.error('El ingreso no puede ser negativo'); return null; }
    if (!Number.isFinite(e) || e < 0) { toast.error('Los gastos no pueden ser negativos'); return null; }
    if (!Number.isFinite(b) || b < 0) { toast.error('La base gravable no puede ser negativa'); return null; }
    return { total_income: +i.toFixed(2), total_expenses: +e.toFixed(2), taxable_base: +b.toFixed(2) };
  };

  const handleRecalculate = async () => {
    const v = validateOverrides();
    if (!v) return;
    try {
      const calc = await calculate.mutateAsync({
        year, month, taxpayer_profile_id: profile?.id ?? null,
        overrides: v, notes: editNotes || null,
      });
      setCurrentCalc(calc);
      toast.success(`Nueva versión v${calc.version_number} creada`);
    } catch (e: any) { toast.error(e.message ?? 'Error al recalcular'); }
  };

  const buildFormData = (c: TaxCalculation) => {
    const bd: any = (c as any).breakdown ?? {};
    return {
      total_income: c.total_income, total_expenses: c.total_expenses,
      taxable_base: c.taxable_base, estimated_tax: c.estimated_tax,
      applied_rate: c.applied_rate, version: c.calculation_version,
      version_number: c.version_number,
      adjusted: !!bd.adjusted,
      calculated_income: bd.calculated_income,
      calculated_expenses: bd.calculated_expenses,
      calculated_taxable_base: bd.calculated_taxable_base,
      calculated_tax: bd.calculated_tax,
      adjustment_notes: bd.adjustment_notes ?? editNotes ?? null,
    };
  };

  const handleSaveAndExport = async () => {
    if (!currentCalc) return;
    try {
      await saveDraft.mutateAsync({
        calculation_id: currentCalc.id,
        period_year: currentCalc.period_year,
        period_month: currentCalc.period_month,
        form_data: buildFormData(currentCalc),
        status: 'ready',
      });
      const res = await generatePdf.mutateAsync({ calculation_id: currentCalc.id });
      toast.success('PDF generado y borrador congelado');
      window.open(res.pdf_url, '_blank');
      setShowWizard(false); setWizardStep(0); setCurrentCalc(null); setEditMode(false);
    } catch (e: any) { toast.error(e.message ?? 'Error al generar PDF'); }
  };

  const handleSaveDraftOnly = async () => {
    if (!currentCalc) return;
    try {
      await saveDraft.mutateAsync({
        calculation_id: currentCalc.id,
        period_year: currentCalc.period_year,
        period_month: currentCalc.period_month,
        form_data: buildFormData(currentCalc),
        status: 'ready',
      });
      toast.success('Borrador guardado');
      setShowWizard(false); setWizardStep(0); setCurrentCalc(null); setEditMode(false);
    } catch (e: any) { toast.error(e.message ?? 'Error al guardar'); }
  };

  const handleDownloadExisting = async (draft: any) => {
    try {
      if (draft.pdf_storage_path) {
        const url = await refreshSigned.mutateAsync(draft.pdf_storage_path);
        window.open(url, '_blank');
      } else if (draft.pdf_url) {
        window.open(draft.pdf_url, '_blank');
      }
    } catch (e: any) { toast.error(e.message ?? 'No se pudo abrir el PDF'); }
  };

  const handleQuickPdf = async (calcId: string) => {
    try {
      const res = await generatePdf.mutateAsync({ calculation_id: calcId });
      toast.success('PDF generado');
      window.open(res.pdf_url, '_blank');
    } catch (e: any) { toast.error(e.message ?? 'Error al generar PDF'); }
  };

  const statusBadge = (draft: any) => {
    const s = draft?.status;
    if (s === 'submitted') return <Badge variant="outline" className="text-xs"><CheckCircle2 size={12} className="mr-1" />Presentado</Badge>;
    if (s === 'exported_pdf') return <Badge className="text-xs bg-primary"><FileText size={12} className="mr-1" />PDF generado</Badge>;
    if (s === 'finalized') return <Badge className="text-xs"><Lock size={12} className="mr-1" />Finalizado</Badge>;
    if (s === 'ready') return <Badge variant="secondary" className="text-xs"><CheckCircle2 size={12} className="mr-1" />Listo</Badge>;
    return <Badge variant="secondary" className="text-xs"><Clock size={12} className="mr-1" />Borrador</Badge>;
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold font-display">Declaraciones</h1>
          <Button size="lg" onClick={() => { setShowWizard(true); setWizardStep(0); setCurrentCalc(null); }}>
            <FileText size={18} /> Nueva declaración
          </Button>
        </div>

        {showWizard && (
          <Card className="border-2 border-primary/20">
            <CardHeader>
              <CardTitle className="text-base font-display">
                Preparar declaración — Paso {wizardStep + 1} de {wizardSteps.length}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Progress value={((wizardStep + 1) / wizardSteps.length) * 100} className="h-2" />
              <div className="p-4 rounded-lg bg-accent/50">
                <h3 className="font-semibold">{wizardSteps[wizardStep].title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{wizardSteps[wizardStep].description}</p>
              </div>

              {wizardStep === 0 && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-muted-foreground">Mes</label>
                    <Select value={String(month)} onValueChange={(v) => setMonth(Number(v))}>
                      <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {MONTHS.map((m, i) => <SelectItem key={i + 1} value={String(i + 1)}>{m}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Año</label>
                    <Select value={String(year)} onValueChange={(v) => setYear(Number(v))}>
                      <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {years.map((y) => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {wizardStep === 1 && (
                <div className="text-sm text-muted-foreground">
                  Vamos a consultar tus movimientos del periodo seleccionado y calcular tu ISR
                  RESICO en el servidor. Cada cálculo queda registrado como una versión inmutable.
                </div>
              )}

              {wizardStep === 2 && currentCalc && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-2">
                      <Badge variant={isAdjusted ? 'default' : 'secondary'} className="text-xs">
                        {isAdjusted ? <><Pencil size={12} className="mr-1" />Editado manualmente</> : <><Sparkles size={12} className="mr-1" />Automático</>}
                      </Badge>
                      <Badge variant="outline" className="text-xs">v{currentCalc.version_number}</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Label htmlFor="edit-mode" className="text-xs text-muted-foreground">Ajustar manualmente</Label>
                      <Switch id="edit-mode" checked={editMode} onCheckedChange={setEditMode} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Card><CardContent className="p-3 space-y-1">
                      <p className="text-xs text-muted-foreground">Ingresos</p>
                      {editMode
                        ? <Input type="number" min="0" step="0.01" value={editIncome} onChange={(e) => setEditIncome(e.target.value)} className="h-9" />
                        : <p className="font-bold">{fmt(currentCalc.total_income)}</p>}
                    </CardContent></Card>
                    <Card><CardContent className="p-3 space-y-1">
                      <p className="text-xs text-muted-foreground">Gastos</p>
                      {editMode
                        ? <Input type="number" min="0" step="0.01" value={editExpenses} onChange={(e) => setEditExpenses(e.target.value)} className="h-9" />
                        : <p className="font-bold">{fmt(currentCalc.total_expenses)}</p>}
                    </CardContent></Card>
                    <Card><CardContent className="p-3 space-y-1">
                      <p className="text-xs text-muted-foreground">Base gravable</p>
                      {editMode
                        ? <Input type="number" min="0" step="0.01" value={editTaxableBase} onChange={(e) => setEditTaxableBase(e.target.value)} className="h-9" />
                        : <p className="font-bold">{fmt(currentCalc.taxable_base)}</p>}
                    </CardContent></Card>
                    <Card className="border-primary/30"><CardContent className="p-3">
                      <p className="text-xs text-muted-foreground">ISR estimado ({(currentCalc.applied_rate * 100).toFixed(2)}%)</p>
                      <p className="font-bold text-primary">{fmt(currentCalc.estimated_tax)}</p>
                    </CardContent></Card>
                  </div>

                  {editMode && (
                    <div className="space-y-2">
                      <div>
                        <Label htmlFor="notes" className="text-xs text-muted-foreground">Notas del ajuste (opcional)</Label>
                        <Textarea id="notes" rows={2} value={editNotes}
                          onChange={(e) => setEditNotes(e.target.value)}
                          placeholder="Ej. Se incluyó factura del día 31 fuera de sistema." />
                      </div>
                      <Button size="sm" onClick={handleRecalculate} disabled={calculate.isPending}>
                        {calculate.isPending ? <><Loader2 size={14} className="animate-spin mr-2" />Recalculando...</> : <><RefreshCw size={14} className="mr-2" />Crear nueva versión</>}
                      </Button>
                    </div>
                  )}

                  <p className="text-xs text-muted-foreground">
                    {currentCalc.calculation_version} · v{currentCalc.version_number} · {MONTHS[currentCalc.period_month - 1]} {currentCalc.period_year}
                    {isAdjusted && (currentCalc as any).breakdown?.calculated_tax !== undefined && (
                      <> · Original: {fmt((currentCalc as any).breakdown.calculated_tax)}</>
                    )}
                  </p>
                </div>
              )}

              {wizardStep === 3 && currentCalc && (
                <div className="space-y-2 text-sm">
                  <p>Vamos a congelar el snapshot v{currentCalc.version_number} de <strong>{MONTHS[currentCalc.period_month - 1]} {currentCalc.period_year}</strong> con ISR <strong>{fmt(currentCalc.estimated_tax)}</strong>.</p>
                  <p className="text-muted-foreground text-xs">Una vez generado el PDF, el borrador queda inmutable y se almacena de forma segura.</p>
                </div>
              )}

              <div className="flex gap-2 flex-wrap">
                {wizardStep > 0 && (
                  <Button variant="outline" onClick={() => setWizardStep((s) => s - 1)} disabled={calculate.isPending || saveDraft.isPending || generatePdf.isPending}>
                    Anterior
                  </Button>
                )}
                {wizardStep === 0 && <Button onClick={() => setWizardStep(1)}>Siguiente</Button>}
                {wizardStep === 1 && (
                  <Button onClick={handleCalculate} disabled={calculate.isPending}>
                    {calculate.isPending ? <><Loader2 size={16} className="animate-spin mr-2" />Calculando...</> : 'Calcular'}
                  </Button>
                )}
                {wizardStep === 2 && currentCalc && (
                  <Button onClick={() => setWizardStep(3)}>Continuar</Button>
                )}
                {wizardStep === 3 && currentCalc && (
                  <>
                    <Button onClick={handleSaveAndExport} disabled={saveDraft.isPending || generatePdf.isPending}>
                      {generatePdf.isPending ? <><Loader2 size={16} className="animate-spin mr-2" />Generando PDF...</> : <><Download size={16} className="mr-2" />Generar PDF</>}
                    </Button>
                    <Button variant="outline" onClick={handleSaveDraftOnly} disabled={saveDraft.isPending || generatePdf.isPending}>
                      Guardar sólo borrador
                    </Button>
                  </>
                )}
                <Button variant="ghost" onClick={() => { setShowWizard(false); setWizardStep(0); setCurrentCalc(null); }}>
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="pb-3 flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base font-display">Historial fiscal</CardTitle>
            <RefreshCw size={14} className="text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-2">
            {isLoading ? (
              [1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full" />)
            ) : (calculations ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Aún no has calculado ninguna declaración. Pulsa "Nueva declaración".
              </p>
            ) : (
              calculations!.map((c) => {
                const draft = draftByCalc.get(c.id);
                const hasPdf = draft?.status === 'exported_pdf';
                return (
                  <div key={c.id} className="flex items-center justify-between gap-3 p-4 rounded-lg border border-border hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2 rounded-lg bg-muted shrink-0"><FileText size={18} /></div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium text-sm">{MONTHS[c.period_month - 1]} {c.period_year}</p>
                          <Badge variant="outline" className="text-[10px] h-5">v{c.version_number}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          Ingresos {fmt(c.total_income)} · Gastos {fmt(c.total_expenses)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="text-right">
                        <p className="text-sm font-bold">{fmt(c.estimated_tax)}</p>
                        {draft ? statusBadge(draft) : <Badge variant="secondary" className="text-xs">Calculado</Badge>}
                      </div>
                      {hasPdf ? (
                        <Button size="sm" variant="outline" onClick={() => handleDownloadExisting(draft)}>
                          <Download size={14} />
                        </Button>
                      ) : (
                        <Button size="sm" variant="outline" onClick={() => handleQuickPdf(c.id)} disabled={generatePdf.isPending}>
                          {generatePdf.isPending ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                        </Button>
                      )}
                      <Button size="sm" variant="ghost" onClick={() => setVersionsModal({ year: c.period_year, month: c.period_month })}>
                        <History size={14} />
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        <Dialog open={!!versionsModal} onOpenChange={(o) => !o && setVersionsModal(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                Versiones — {versionsModal && MONTHS[versionsModal.month - 1]} {versionsModal?.year}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {versions.isLoading
                ? [1, 2].map((i) => <Skeleton key={i} className="h-14 w-full" />)
                : (versions.data ?? []).length === 0
                  ? <p className="text-sm text-muted-foreground">Sin versiones.</p>
                  : versions.data!.map((v) => (
                    <div key={v.id} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <Badge variant={v.is_current ? 'default' : 'outline'} className="text-[10px] h-5">v{v.version_number}</Badge>
                          {v.is_current && <span className="text-xs text-muted-foreground">actual</span>}
                          {(v as any).breakdown?.adjusted && <Badge variant="secondary" className="text-[10px] h-5"><Pencil size={10} className="mr-1" />ajustada</Badge>}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(v.created_at).toLocaleString('es-MX')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold">{fmt(v.estimated_tax)}</p>
                        <p className="text-[10px] text-muted-foreground">{(v.applied_rate * 100).toFixed(2)}%</p>
                      </div>
                    </div>
                  ))}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
};

export default Declarations;
