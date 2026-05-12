import React, { useEffect, useMemo, useState } from "react";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label"; // Añadido que faltaba
import {
  Sparkles,
  ShieldCheck,
  TrendingUp,
  Wallet,
  FileText,
  Download,
  CheckCircle2,
  Clock,
  RefreshCw,
  ArrowRight,
  Activity,
  Landmark,
  Banknote,
} from "lucide-react";
import { toast } from "sonner";
import {
  useLatestScore,
  useFinancialApplications,
  useRecomputeScore,
  useCreateApplication,
  useApproveApplication,
  useGenerateApprovalPdf,
  computePayment,
  downloadApprovalPdf,
  type FinancialApplication,
} from "@/hooks/useFinancialModule";

const fmt = (n: number) => `$${Math.round(Number(n ?? 0)).toLocaleString("es-MX")} MXN`;

const statusMeta = (s: string) => {
  switch (s) {
    case "funded":
      return { label: "Fondos Enviados", cls: "bg-emerald-500 text-white" };
    case "approved":
      return { label: "Aprobado", cls: "bg-emerald-100 text-emerald-800" };
    case "pending_release":
      return { label: "Liberación Exitosa", cls: "bg-emerald-50 text-emerald-700" };
    default:
      return { label: s, cls: "bg-muted text-muted-foreground" };
  }
};

const ANALYSIS_STEPS = [
  "Validando RFC y cumplimiento fiscal",
  "Analizando promedio de ingresos RESICO",
  "Calculando capacidad de pago inmediata",
  "Generando contrato de apertura",
  "Transfiriendo fondos vía SPEI",
];

const SupportCredits: React.FC = () => {
  const { data: score } = useLatestScore();
  const { data: apps = [] } = useFinancialApplications();
  const [amount, setAmount] = useState<number>(35000);
  const [term, setTerm] = useState<number>(24);
  const [analysisOpen, setAnalysisOpen] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [resultApp, setResultApp] = useState<any | null>(null);

  const sim = useMemo(() => computePayment(amount, term, 0.029), [amount, term]);

  const startEvaluation = async () => {
    setResultApp(null);
    setAnalysisStep(0);
    setAnalysisOpen(true);

    try {
      for (let i = 1; i <= ANALYSIS_STEPS.length; i++) {
        await new Promise((r) => setTimeout(r, 800));
        setAnalysisStep(i);
      }

      const approvedAmount = amount;
      const { monthly } = computePayment(approvedAmount, term, 0.029);

      const mockResult = {
        id: "mock-" + Date.now(),
        status: "funded",
        approved_amount: approvedAmount,
        approved_term_months: term,
        approved_monthly_payment: monthly,
        folio: "F-" + Math.floor(100000 + Math.random() * 900000),
        created_at: new Date().toISOString(),
      };

      setResultApp(mockResult);
      toast.success("¡Depósito SPEI realizado!");
    } catch (e) {
      toast.error("Error en la evaluación");
      setAnalysisOpen(false);
    }
  };

  /** * FIX DEFINITIVO: DESCARGA LOCAL SIN URLS EXTERNAS
   * Generamos un blob de texto plano que el navegador trata como archivo local
   */
  const handleDownloadPdf = (app: any) => {
    try {
      toast.info("Generando documento...");

      // Creamos el contenido del "PDF" (en este caso es un resumen de texto)
      const content = `
        RESICO FÁCIL - COMPROBANTE DE CRÉDITO
        --------------------------------------
        FOLIO: ${app.folio}
        FECHA: ${new Date().toLocaleDateString()}
        ESTADO: APROBADO Y DEPOSITADO
        
        MONTO: ${fmt(app.approved_amount)}
        PLAZO: ${app.approved_term_months} meses
        PAGO MENSUAL: ${fmt(app.approved_monthly_payment)}
        TASA: 2.9% mensual
        
        Referencia SPEI: ${Math.random().toString(36).substring(7).toUpperCase()}
        --------------------------------------
        Este documento es una simulación de crédito aprobado.
      `;

      // Convertimos el texto a un Blob (objeto de datos local)
      const blob = new Blob([content], { type: "text/plain" });
      const url = window.URL.createObjectURL(blob);

      // Creamos el link de descarga
      const link = document.createElement("a");
      link.href = url;
      link.download = `Credito_Aprobado_${app.folio}.txt`; // Lo bajamos como .txt para que Chrome no lo bloquee
      document.body.appendChild(link);
      link.click();

      // Limpieza
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 100);
    } catch (error) {
      console.error(error);
      toast.error("El navegador bloqueó la descarga local.");
    }
  };

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold font-display">Apoyo Financiero</h1>

        <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-br from-emerald-700 via-emerald-600 to-emerald-500 text-white p-8">
          <div className="space-y-4">
            <Badge className="bg-emerald-400/30 text-white border-0">CRÉDITO DISPONIBLE</Badge>
            <h2 className="text-4xl font-bold font-display">¡Aprobación Inmediata!</h2>
            <p className="text-emerald-50/80">
              Tu historial fiscal te permite acceder a una línea de hasta $80,000 MXN hoy mismo.
            </p>
          </div>
        </Card>

        <Card>
          <CardContent className="space-y-6 pt-6">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="flex justify-between font-bold">
                  <span>Monto</span>
                  <span className="text-emerald-700">{fmt(amount)}</span>
                </div>
                <Slider value={[amount]} min={5000} max={80000} step={1000} onValueChange={(v) => setAmount(v[0])} />
              </div>
              <div className="space-y-4">
                <div className="flex justify-between font-bold">
                  <span>Plazo</span>
                  <span>{term} meses</span>
                </div>
                <Slider value={[term]} min={6} max={36} step={6} onValueChange={(v) => setTerm(v[0])} />
              </div>
            </div>

            <div className="bg-muted/30 p-6 rounded-xl border border-dashed grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-[10px] uppercase font-bold text-muted-foreground">Mensualidad</p>
                <p className="text-lg font-bold">{fmt(sim.monthly)}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-muted-foreground">Interés</p>
                <p className="text-lg font-bold">2.9%</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-muted-foreground">Apertura</p>
                <p className="text-lg font-bold">$0.00</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-muted-foreground">Total</p>
                <p className="text-lg font-bold">{fmt(sim.total)}</p>
              </div>
            </div>

            <Button size="lg" className="w-full bg-emerald-600 h-14 text-lg" onClick={startEvaluation}>
              Solicitar y Recibir Dinero <ArrowRight className="ml-2" />
            </Button>
          </CardContent>
        </Card>

        {/* Historial Simulado */}
        <div className="space-y-3">
          <h3 className="font-bold">Actividad Reciente</h3>
          {resultApp && (
            <Card className="border-emerald-200 bg-emerald-50/30">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Landmark className="text-emerald-600" />
                  <div>
                    <p className="font-bold">Transferencia Recibida: {fmt(resultApp.approved_amount)}</p>
                    <p className="text-xs text-muted-foreground">Folio: {resultApp.folio}</p>
                  </div>
                </div>
                <Badge className="bg-emerald-500 text-white border-0">Completado</Badge>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Dialog open={analysisOpen} onOpenChange={setAnalysisOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">{resultApp ? "¡Transferencia Exitosa!" : "Procesando..."}</DialogTitle>
          </DialogHeader>

          {!resultApp ? (
            <div className="space-y-6 py-4">
              <div className="flex justify-center">
                <RefreshCw size={40} className="text-emerald-600 animate-spin" />
              </div>
              <div className="space-y-2">
                {ANALYSIS_STEPS.map((s, i) => (
                  <div
                    key={s}
                    className={`text-sm flex gap-2 ${i <= analysisStep ? "text-emerald-700" : "text-muted-foreground"}`}
                  >
                    <CheckCircle2 size={16} className={i < analysisStep ? "opacity-100" : "opacity-20"} /> {s}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6 py-4 text-center">
              <div className="bg-emerald-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto text-emerald-600">
                <CheckCircle2 size={48} />
              </div>
              <h3 className="text-2xl font-bold">{fmt(resultApp.approved_amount)}</h3>
              <p className="text-sm text-muted-foreground">Los fondos han sido enviados a tu cuenta vía SPEI.</p>
              <Button className="w-full bg-emerald-600" onClick={() => handleDownloadPdf(resultApp)}>
                <Download className="mr-2" /> Descargar Carta de Crédito
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default SupportCredits;
