import React, { useEffect, useState } from "react";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Play, CheckCircle2, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface Tutorial {
  id: string;
  title: string;
  description: string | null;
  duration_minutes: number | null;
  order_index: number | null;
  video_url?: string; // nuevo campo opcional
}

// enlaces de videos
const tutorialLinks: string[] = [
  "https://youtu.be/WDt5QCQ3HOY",
  "https://youtu.be/wKBSYxAjd58",
  "https://youtu.be/XjCE6y2uBxg",
  "https://youtu.be/TbBRSOJcvws",
];

const Tutorials = () => {
  const { user } = useAuth();
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!user) return;
    const [tRes, pRes] = await Promise.all([
      supabase.from("tutorials").select("*").eq("is_published", true).order("order_index"),
      supabase.from("tutorial_progress").select("tutorial_id, completed").eq("user_id", user.id).eq("completed", true),
    ]);
    // asignar videos en orden
    const withVideos = (tRes.data ?? []).map((t: any, idx: number) => ({
      ...t,
      video_url: tutorialLinks[idx % tutorialLinks.length],
    }));
    setTutorials(withVideos as Tutorial[]);
    setCompletedIds(new Set((pRes.data ?? []).map((p: any) => p.tutorial_id)));
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [user]);

  const markCompleted = async (id: string) => {
    if (!user || completedIds.has(id)) return;
    const { error } = await supabase
      .from("tutorial_progress")
      .insert({ user_id: user.id, tutorial_id: id, completed: true, completed_at: new Date().toISOString() });
    if (error) toast.error(error.message);
    else {
      toast.success("¡Tutorial completado!");
      setCompletedIds((s) => new Set(s).add(id));
    }
  };

  const openTutorial = (id: string, url?: string) => {
    if (url) window.open(url, "_blank");
    markCompleted(id);
  };

  const completed = completedIds.size;
  const total = tutorials.length;
  const progress = total ? Math.round((completed / total) * 100) : 0;

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold font-display">Aprende</h1>

        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="flex justify-between items-center">
              <p className="text-sm font-medium">Tu progreso</p>
              <span className="text-sm font-bold text-primary">
                {completed}/{total}
              </span>
            </div>
            <Progress value={progress} className="h-3" />
          </CardContent>
        </Card>

        <div className="space-y-3">
          {loading ? (
            [1, 2, 3].map((i) => <Skeleton key={i} className="h-20 w-full" />)
          ) : tutorials.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No hay tutoriales disponibles</p>
          ) : (
            tutorials.map((t) => {
              const isDone = completedIds.has(t.id);
              return (
                <Card
                  key={t.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => openTutorial(t.id, t.video_url)}
                >
                  <CardContent className="p-4 flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                        isDone ? "bg-success text-success-foreground" : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {isDone ? <CheckCircle2 size={18} /> : <Play size={18} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{t.title}</p>
                      <p className="text-xs text-muted-foreground">{t.description}</p>
                    </div>
                    {t.duration_minutes && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                        <Clock size={12} /> {t.duration_minutes} min
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default Tutorials;
