import React, { useState } from "react";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Play, CheckCircle2, Clock } from "lucide-react";
import { toast } from "sonner";

// Datos manuales para que aparezcan sin depender de la base de datos
const MANUAL_TUTORIALS = [
  {
    id: "1",
    title: "¿Qué es el RESICO? Guía Completa",
    description: "Aprende las bases del Régimen Simplificado de Confianza.",
    duration_minutes: 15,
    video_url: "https://www.youtube.com/watch?v=TbBRSOJcvws&t=12s",
  },
  {
    id: "2",
    title: "Cómo presentar tu Declaración Mensual",
    description: "Paso a paso para cumplir con tus obligaciones fiscales.",
    duration_minutes: 22,
    video_url: "https://www.youtube.com/watch?v=WDt5QCQ3HOY&t=719s",
  },
  {
    id: "3",
    title: "Estrategias de Ahorro de Impuestos",
    description: "Consejos legales para optimizar tu carga tributaria.",
    duration_minutes: 10,
    video_url: "https://www.youtube.com/watch?v=XjCE6y2uBxg&t=10s",
  },
];

const Tutorials = () => {
  // Estado para manejar los completados localmente (solo para la vista actual)
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());

  const handleTutorialClick = (t: any) => {
    // 1. Redirigir a YouTube
    if (t.video_url) {
      window.open(t.video_url, "_blank", "noopener,noreferrer");
    }

    // 2. Marcar como completado visualmente
    if (!completedIds.has(t.id)) {
      setCompletedIds((prev) => new Set(prev).add(t.id));
      toast.success("¡Marcado como visto!");
    }
  };

  const completed = completedIds.size;
  const total = MANUAL_TUTORIALS.length;
  const progress = Math.round((completed / total) * 100);

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold font-display">Aprende</h1>

        {/* Card de Progreso */}
        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="flex justify-between items-center">
              <p className="text-sm font-medium">Tu progreso de aprendizaje</p>
              <span className="text-sm font-bold text-primary">
                {completed}/{total}
              </span>
            </div>
            <Progress value={progress} className="h-3" />
          </CardContent>
        </Card>

        {/* Lista de Videos */}
        <div className="space-y-3">
          {MANUAL_TUTORIALS.map((t) => {
            const isDone = completedIds.has(t.id);
            return (
              <Card
                key={t.id}
                className="cursor-pointer hover:shadow-md transition-all hover:border-primary/50 group"
                onClick={() => handleTutorialClick(t)}
              >
                <CardContent className="p-4 flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                      isDone
                        ? "bg-green-100 text-green-600"
                        : "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white"
                    }`}
                  >
                    {isDone ? <CheckCircle2 size={18} /> : <Play size={18} />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{t.title}</p>
                    <p className="text-xs text-muted-foreground line-clamp-1">{t.description}</p>
                  </div>

                  <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                    <Clock size={12} /> {t.duration_minutes} min
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
};

export default Tutorials;
