import React, { useEffect, useMemo, useState } from "react";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Sparkles, ShieldCheck, TrendingUp, Wallet, FileText, Download,
  CheckCircle2, Clock, RefreshCw, ArrowRight, Activity,
} from "lucide-react";
import { toast } from "sonner";
import {
  useLatestScore, useFinancialApplications, useRecomputeScore,
  useCreateApplication, useApproveApplication, useGenerateApprovalPdf,
  computePayment, downloadApprovalPdf,
  type FinancialApplication,
} from "@/hooks/useFinancialModule";

const fmt = (n: number) =>
  `$${Math.round(Number(n ?? 0)).toLocaleString("es-MX")} MXN`;

const riskMeta = (level?: string) => {
  if (level === "low") return { label: "Riesgo bajo", cls: "bg-emerald-100 text-emerald-800 border-emerald-200", rate: 0.029 };
  if (level === "medium") return { label: "Riesgo medio", cls: "bg-amber-100 text-amber-800 border-amber-200", rate: 0.032 };
  if (level === "high") return { label: "Riesgo alto", cls: "bg-rose-100 text-rose-800 border-rose-200", rate: 0.045 };
  return { label: "Sin evaluar", cls: "bg-muted text-muted-foreground", rate: 0.032 };
};

const statusMeta = (s: string) => {
  switch (s) {
    case "in_review": return { label: "En revisión", cls: "bg-sky-100 text-sky-800" };
    case "analyzing": return { label: "En análisis", cls: "bg-indigo-100 text-indigo-800" };
    case "preapproved": return { label: "Preaprobado", cls: "bg-emerald-100 text-emerald-800" };
    case "approved": return { label: "Aprobado", cls: "bg-emerald-100 text-emerald-800" };
    case "pending_release": return { label: "Pendiente de liberación", cls: "bg-amber-100 text-amber-900" };
    case "rejected": return { label: "No aprobado", cls: "bg-rose-100 text-rose-800" };
    default: return { label: s, cls: "bg-muted text-muted-foreground" };
  }
};

const ANALYSIS_STEPS = [
  "Validando RFC",
  "Analizando ingresos",
  "Revisando actividad fiscal",
  "Calculando capacidad de pago",
  "Evaluando perfil financiero",
];

const ScoreRing: React.FC<{ score: number }> = ({ score }) => {
  const pct = Math.min(1, Math.max(0, (score - 300) / 550));
  const r = 56;
  const c = 2 * Math.PI * r;
  const dash = c * pct;
  return (
    <div className="relative w-36 h-36">
      <svg viewBox="0 0 140 140" className="w-full h-full -rotate-90">
        <circle cx="70" cy="70" r={r} stroke="hsl(var(--muted))" strokeWidth="10" fill="none" />
        <circle
          cx="70" cy="70" r={r} stroke="hsl(var(--primary))" strokeWidth="10" fill="none"
          strokeDasharray={`${dash} ${c}`} strokeLinecap="round"
          style={{ transition: "stroke-dasharray 700ms ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <p className="text-3xl font-bold font-display">{score}</p>
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Score</p>
      </div>
    </div>
  );
};

const TimelineRow: React.FC<{ done: boolean; label: string; pending?: boolean }> = ({ done, label, pending }) => (
  <div className="flex items-center gap-3">
    <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
      done ? "bg-emerald-100 text-emerald-700" : pending ? "bg-amber-100 text-amber-700" : "bg-muted text-muted-foreground"
    }`}>
      {done ? <CheckCircle2 size={16} /> : <Clock size={14} />}
    </div>
    <span className={`text-sm ${done ? "text-foreground" : "text-muted-foreground"}`}>{label}</span>
  </div>
);

const SupportCredits: React.FC = () => {
  const { data: score, isLoading: scoreLoading } = useLatestScore();
  const { data: apps = [], isLoading: appsLoading } = useFinancialApplications();
  const recompute = useRecomputeScore();
  const createApp = useCreateApplication();
  const approveApp = useApproveApplication();
  const genPdf = useGenerateApprovalPdf();

  const risk = riskMeta(score?.risk_level);
  const monthlyRate = risk.rate;
  const cat = risk.rate === 0.029 ? 0.32 : risk.rate === 0.032 ? 0.35 : 0.48;

  const maxAmount = Math.max(5000, Math.round((score?.estimated_capacity ?? 30000) / 1000) * 1000);
  const [amount, setAmount] = useState<number>(Math.min(80000, maxAmount));
  const [term, setTerm] = useState<number>(18);
  useEffect(() => { setAmount(Math.min(amount, maxAmount)); /* clamp */ }, [maxAmount]); // eslint-disable-line

  const sim = useMemo(() => computePayment(amount, term, monthlyRate), [amount, term, monthlyRate]);

  // Auto compute score on first visit if missing
  useEffect(() => {
    if (!scoreLoading && !score && !recompute.isPending) {
      recompute.mutate();
    }
  }, [scoreLoading, score]); // eslint-disable-line

  // Analysis flow
  const [analysisOpen, setAnalysisOpen] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [resultApp, setResultApp] = useState<FinancialApplication | null>(null);

  const startEvaluation = async () => {
    if (!score) {
      toast.error("Aún estamos calculando tu perfil. Intenta en unos segundos.");
      return;
    }
    setResultApp(null);
    setAnalysisStep(0);
    setAnalysisOpen(true);

    try {
      // Animate steps
      for (let i = 1; i <= ANALYSIS_STEPS.length; i++) {
        await new Promise((r) => setTimeout(r, 700));
        setAnalysisStep(i);
      }

      const created = await createApp.mutateAsync({
        requested_amount: amount,
        term_months: term,
        monthly_rate: monthlyRate,
        cat_estimate: cat,
        score_snapshot: score.score,
        risk_snapshot: score.risk_level,
      });

      // Auto-approval logic
      if (score.score >= 600) {
        const approvedAmount = Math.min(amount, score.estimated_capacity || amount);
        const { monthly } = computePayment(approvedAmount, term, monthlyRate);
        await approveApp.mutateAsync({
          id: created.id,
          approved_amount: approvedAmount,
          approved_term_months: term,
          approved_monthly_payment: monthly,
        });
        setResultApp({
          ...created,
          status: "pending_release",
          approved_amount: approvedAmount,
          approved_term_months: term,
          approved_monthly_payment: monthly,
          approved_at: new Date().toISOString(),
        });
      } else {
        setResultApp(created);
      }
    } catch (e) {
      toast.error((e as Error).message || "No se pudo completar la evaluación");
      setAnalysisOpen(false);
    }
  };

  const handleDownloadPdf = async (app: FinancialApplication) => {
    try {
      let path = app.pdf_path;
      if (!path) {
        const res = await genPdf.mutateAsync(app.id);
        path = res.path;
      }
      await downloadApprovalPdf(path!, app.folio);
    } catch (e) {
      toast.error((e as Error).message || "No se pudo descargar el documento");
    }
  };

  const lastApp = apps[0];

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold font-display">Apoyo Financiero</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Tu actividad fiscal te abre puertas. Conoce tu perfil financiero y simula opciones a tu medida.
            </p>
          </div>
          <Button
            variant="outline" size="sm"
            onClick={() => recompute.mutate(undefined, { onSuccess: () => toast.success("Perfil actualizado") })}
            disabled={recompute.isPending}
          >
            <RefreshCw size={14} className={recompute.isPending ? "animate-spin" : ""} />
            Actualizar perfil
          </Button>
        </div>

        {/* Hero card */}
        <Card className="overflow-hidden border-0 shadow-lg">
          <div className="bg-gradient-to-br from-emerald-700 via-emerald-600 to-emerald-500 text-white p-6 md:p-8">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles size={16} />
              <span className="text-xs uppercase tracking-widest opacity-80">Tu perfil financiero</span>
            </div>

            {scoreLoading || !score ? (
              <div className="grid md:grid-cols-3 gap-6 items-center">
                <Skeleton className="h-36 w-36 rounded-full bg-white/20" />
                <div className="md:col-span-2 space-y-3">
                  <Skeleton className="h-6 w-40 bg-white/20" />
                  <Skeleton className="h-10 w-56 bg-white/20" />
                  <Skeleton className="h-4 w-full bg-white/20" />
                </div>
              </div>
            ) : (
              <div className="grid md:grid-cols-3 gap-6 items-center">
                <div className="flex justify-center md:justify-start">
                  <div className="bg-white/10 rounded-2xl p-4 backdrop-blur">
                    <ScoreRing score={score.score} />
                  </div>
                </div>
                <div className="md:col-span-2 space-y-4">
                  <div>
                    <p className="text-xs opacity-80 uppercase tracking-wider">Capacidad estimada</p>
                    <p className="text-3xl md:text-4xl font-bold font-display mt-1">
                      Hasta {fmt(score.estimated_capacity)}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className={`text-xs px-3 py-1 rounded-full font-medium border bg-white/95 ${risk.cls.replace("bg-", "").replace("border-", "")}`}>
                      <ShieldCheck size={12} className="inline mr-1 -mt-0.5" />
                      {risk.label}
                    </span>
                    <span className="text-xs px-3 py-1 rounded-full bg-white/15 backdrop-blur font-medium">
                      Estado: {score.score >= 700 ? "Preaprobado" : score.score >= 600 ? "Calificado" : "En desarrollo"}
                    </span>
                    <span className="text-xs px-3 py-1 rounded-full bg-white/15 backdrop-blur font-medium">
                      Actualizado: {new Date(score.computed_at).toLocaleDateString("es-MX")}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-3 pt-2 text-xs">
                    <div className="bg-white/10 rounded-lg px-3 py-2 backdrop-blur">
                      <p className="opacity-70">Ingreso mensual</p>
                      <p className="font-semibold text-sm">{fmt(score.monthly_avg_income)}</p>
                    </div>
                    <div className="bg-white/10 rounded-lg px-3 py-2 backdrop-blur">
                      <p className="opacity-70">Meses activos</p>
                      <p className="font-semibold text-sm">{score.active_months}</p>
                    </div>
                    <div className="bg-white/10 rounded-lg px-3 py-2 backdrop-blur">
                      <p className="opacity-70">Declaraciones</p>
                      <p className="font-semibold text-sm">{score.declarations_count}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Simulator + CTA */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-display flex items-center gap-2">
              <Wallet size={18} className="text-emerald-700" /> Simulador
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Monto</span>
                  <span className="font-bold font-display">{fmt(amount)}</span>
                </div>
                <Slider
                  value={[amount]}
                  min={5000}
                  max={maxAmount}
                  step={1000}
                  onValueChange={(v) => setAmount(v[0])}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{fmt(5000)}</span>
                  <span>{fmt(maxAmount)}</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Plazo</span>
                  <span className="font-bold font-display">{term} meses</span>
                </div>
                <Slider
                  value={[term]}
                  min={6}
                  max={36}
                  step={3}
                  onValueChange={(v) => setTerm(v[0])}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>6 meses</span>
                  <span>36 meses</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-3">
                <p className="text-[10px] uppercase tracking-wider text-emerald-800/70">Pago mensual</p>
                <p className="text-lg font-bold font-display text-emerald-900">{fmt(sim.monthly)}</p>
              </div>
              <div className="rounded-xl bg-muted/40 border p-3">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Pago total</p>
                <p className="text-lg font-bold font-display">{fmt(sim.total)}</p>
              </div>
              <div className="rounded-xl bg-muted/40 border p-3">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Tasa estimada</p>
                <p className="text-lg font-bold font-display">{(monthlyRate * 100).toFixed(1)}% <span className="text-xs font-normal text-muted-foreground">/ mes</span></p>
              </div>
              <div className="rounded-xl bg-muted/40 border p-3">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">CAT estimado</p>
                <p className="text-lg font-bold font-display">{(cat * 100).toFixed(1)}%</p>
              </div>
            </div>

            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Las cifras son estimaciones generadas a partir de tu actividad fiscal y no constituyen una oferta crediticia.
            </p>

            <Button size="lg" className="w-full md:w-auto" onClick={startEvaluation} disabled={createApp.isPending}>
              Solicitar evaluación financiera <ArrowRight size={16} />
            </Button>
          </CardContent>
        </Card>

        {/* History */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-display flex items-center gap-2">
              <Activity size={18} /> Historial de solicitudes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {appsLoading ? (
              [1, 2].map((i) => <Skeleton key={i} className="h-24 w-full" />)
            ) : apps.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">Aún no tienes solicitudes</p>
            ) : (
              apps.map((app) => {
                const sm = statusMeta(app.status);
                const isApproved = ["approved", "pending_release"].includes(app.status);
                return (
                  <div key={app.id} className="rounded-xl border p-4 space-y-3 hover:shadow-sm transition-shadow">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div>
                        <p className="text-xs text-muted-foreground">Folio {app.folio}</p>
                        <p className="font-semibold font-display">
                          {fmt(isApproved ? Number(app.approved_amount) : app.requested_amount)}
                          <span className="text-sm text-muted-foreground font-normal"> · {app.approved_term_months ?? app.term_months} meses</span>
                        </p>
                      </div>
                      <Badge className={`${sm.cls} border-0`}>{sm.label}</Badge>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div><span className="text-muted-foreground">Pago mensual</span><br/><strong>{fmt(Number(app.approved_monthly_payment ?? app.estimated_monthly_payment))}</strong></div>
                      <div><span className="text-muted-foreground">Tasa</span><br/><strong>{(Number(app.monthly_rate) * 100).toFixed(2)}%</strong></div>
                      <div><span className="text-muted-foreground">Fecha</span><br/><strong>{new Date(app.created_at).toLocaleDateString("es-MX")}</strong></div>
                    </div>

                    {/* Timeline */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 pt-2 border-t">
                      <TimelineRow done label="Solicitud enviada" />
                      <TimelineRow done label="Perfil validado" />
                      <TimelineRow done label="Evaluación completada" />
                      <TimelineRow done={isApproved} label="Solicitud aprobada" />
                      <TimelineRow done={false} pending={isApproved} label="Liberación pendiente" />
                    </div>

                    {isApproved && (
                      <div className="pt-2">
                        <Button size="sm" variant="outline" onClick={() => handleDownloadPdf(app)} disabled={genPdf.isPending}>
                          <Download size={14} /> {app.pdf_path ? "Descargar carta" : "Generar carta"}
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        {lastApp && ["approved", "pending_release"].includes(lastApp.status) && (
          <p className="text-[11px] text-muted-foreground text-center">
            Documento preliminar sujeto a validación final.
          </p>
        )}
      </div>

      {/* Analysis dialog */}
      <Dialog open={analysisOpen} onOpenChange={(o) => { if (!createApp.isPending) setAnalysisOpen(o); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">
              {resultApp ? "Resultado de tu evaluación" : "Analizando tu perfil"}
            </DialogTitle>
          </DialogHeader>

          {!resultApp ? (
            <div className="space-y-4 py-2">
              <Progress value={(analysisStep / ANALYSIS_STEPS.length) * 100} className="h-2" />
              <div className="space-y-2.5">
                {ANALYSIS_STEPS.map((s, i) => (
                  <div key={s} className="flex items-center gap-3 text-sm">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                      i < analysisStep ? "bg-emerald-100 text-emerald-700" :
                      i === analysisStep ? "bg-emerald-200 text-emerald-800 animate-pulse" : "bg-muted text-muted-foreground"
                    }`}>
                      {i < analysisStep ? <CheckCircle2 size={14} /> : <Clock size={12} />}
                    </div>
                    <span className={i <= analysisStep ? "text-foreground" : "text-muted-foreground"}>{s}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : ["approved", "pending_release"].includes(resultApp.status) ? (
            <div className="space-y-4 py-2">
              <div className="rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 p-4 text-center">
                <CheckCircle2 size={36} className="mx-auto text-emerald-600 mb-2" />
                <p className="text-sm text-emerald-800/80">Solicitud aprobada</p>
                <p className="text-2xl font-bold font-display text-emerald-900 mt-1">
                  {fmt(Number(resultApp.approved_amount))}
                </p>
                <p className="text-xs text-emerald-800/70 mt-1">
                  {resultApp.approved_term_months} meses · {fmt(Number(resultApp.approved_monthly_payment))} / mes
                </p>
              </div>
              <div className="text-xs text-muted-foreground text-center">
                Estado: <strong>Pendiente de liberación</strong>. Tu carta preliminar está lista.
              </div>
              <Button className="w-full" onClick={() => handleDownloadPdf(resultApp)} disabled={genPdf.isPending}>
                <Download size={16} /> Descargar carta de aprobación
              </Button>
            </div>
          ) : (
            <div className="space-y-3 py-2 text-center">
              <TrendingUp size={36} className="mx-auto text-muted-foreground" />
              <p className="font-semibold">Tu solicitud quedó en revisión</p>
              <p className="text-sm text-muted-foreground">
                Sigue registrando ingresos y declaraciones para mejorar tu perfil financiero.
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default SupportCredits;
