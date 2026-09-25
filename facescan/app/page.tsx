"use client";

import { buildOtavioDailyProgram } from "@/lib/otavio-program-engine";
import type { OtavioMealFeedback } from "@/lib/otavio-programs";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Camera,
  ChevronRight,
  Droplets,
  Moon,
  ScanFace,
  Sparkles,
  Target,
  User,
  LogOut,
  Utensils,
  Activity,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getOtavioProgress } from "@/lib/otavio-progression";
import { registerOtavioDailyAction } from "@/lib/otavio-streak";
import { buildOtavioDailyTasks } from "@/lib/otavio-daily";

type DailyTask = {
  id: string;
  task_key: string;
  title: string;
  description: string | null;
  completed: boolean;
};

type Profile = {
  age: number | null;
  sex: string | null;
  skin_type: string | null;
  skin_sensitivity: string | null;
  skin_concerns: string[] | null;
  goals: string[] | null;
  hydration_level: string | null;
  activity_level: string | null;
  sleep_quality: string | null;
  eating_style: string | null;
  meals_per_day: number | null;
  onboarding_completed: boolean | null;
  otavio_xp: number | null;
  otavio_stage: number | null;
  otavio_streak: number | null;
};

const goalLabels: Record<string, string> = {
  qualite_peau: "Améliorer ma peau",
  hydratation: "Améliorer mon hydratation",
  fatigue: "Réduire les signes de fatigue",
  eclat: "Retrouver de l’éclat",
  nutrition: "Mieux manger",
  sommeil: "Améliorer mon sommeil",
  bien_etre: "Prendre davantage soin de moi",
  evolution: "Suivre mon évolution",
};

function getFirstName(email?: string | null) {
  if (!email) return "vous";

  const value = email.split("@")[0]?.trim();
  if (!value) return "vous";

  return value.charAt(0).toUpperCase() + value.slice(1);
}

function getGoalLabel(goal?: string) {
  if (!goal) return "votre bien-être";
  return goalLabels[goal] ?? goal;
}

export default function HomePage() {
  const [otavioProfile, setOtavioProfile] = useState<any>(null);

  useEffect(() => {
    async function loadOtavioProfile() {
      try {
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();

        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) return;

        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .maybeSingle();

        setOtavioProfile(data ?? {});
      } catch {
        setOtavioProfile({});
      }
    }

    loadOtavioProfile();
  }, []);



  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [profile, setProfile] = useState<Profile | null>(null);
  const [firstName, setFirstName] = useState("vous");
  const [todayLabel, setTodayLabel] = useState("");
  const [loading, setLoading] = useState(true);
  const [hasScan, setHasScan] = useState(false);
  const [scanCount, setScanCount] = useState(0);
  const [latestScore, setLatestScore] = useState<number | null>(null);
  const [latestIndicators, setLatestIndicators] = useState<{
    peau: number;
    hydratation: number;
    fatigue: number;
    equilibre: number;
  } | null>(null);
  const [nutritionFeedback, setNutritionFeedback] = useState<
    OtavioMealFeedback[]
  >([]);
  const [dailyTasks, setDailyTasks] = useState<DailyTask[]>([]);
  const [taskLoading, setTaskLoading] = useState(false);
  const [xpFeedback, setXpFeedback] = useState<number | null>(null);
  const [stageUp, setStageUp] = useState(false);

  const otavioDailyProgram = useMemo(
    () =>
      buildOtavioDailyProgram(
        otavioProfile ?? {},
        latestIndicators,
        nutritionFeedback
      ),
    [otavioProfile, latestIndicators, nutritionFeedback]
  );

  const dailyProgramItems = useMemo(() => {
    const items = otavioDailyProgram.items;

    if (items.length <= 3) {
      return items;
    }

    const selected: typeof items = [];
    const usedCategories = new Set<string>();

    // La première carte reste toujours la plus pertinente selon le scan.
    if (items[0]) {
      selected.push(items[0]);
      usedCategories.add(items[0].category);
    }

    // Pour les cartes suivantes, on privilégie une nouvelle catégorie.
    for (const item of items) {
      if (selected.length >= 3) break;

      if (!usedCategories.has(item.category)) {
        selected.push(item);
        usedCategories.add(item.category);
      }
    }

    // S'il n'y a pas assez de catégories différentes, on complète.
    for (const item of items) {
      if (selected.length >= 3) break;

      if (!selected.includes(item)) {
        selected.push(item);
      }
    }

    return selected;
  }, [otavioDailyProgram.items]);

  const dailyHabitItems = useMemo(() => {
    const scan = latestIndicators;
    const goals = profile?.goals ?? [];

    const urgency = (value: number | null | undefined) =>
      typeof value === "number" ? 100 - value : 0;

    const items = [
      {
        key: "peau",
        href: "/peau",
        title: "Peau",
        eyebrow: "Priorité du jour",
        badge:
          scan?.peau != null
            ? `Score ${Math.round(scan.peau)} / 100`
            : profile?.skin_type || "À personnaliser",
        description:
          scan?.peau != null && scan.peau < 70
            ? `Votre dernier scan montre un score peau de ${Math.round(scan.peau)}. Otavio renforce aujourd’hui les gestes adaptés à votre profil.`
            : "Votre profil peau et votre évolution servent à ajuster les gestes proposés par Otavio.",
        relevance:
          urgency(scan?.peau) +
          (goals.includes("qualite_peau") || goals.includes("eclat") ? 18 : 0),
        border: "border-[#b9d7d1]",
        shadow: "shadow-[0_12px_32px_rgba(35,90,84,0.07)]",
        iconBg: "bg-[linear-gradient(160deg,#d9f8f3_0%,#aee7dd_100%)]",
        iconColor: "text-[#287f72]",
        badgeBg: "bg-[#dff6f0]",
        badgeColor: "text-[#287f72]",
        titleColor: "text-[#244c50]",
      },
      {
        key: "hydratation",
        href: "/hydratation",
        title: "Hydratation",
        eyebrow: "Besoin détecté",
        badge:
          scan?.hydratation != null
            ? `Score ${Math.round(scan.hydratation)} / 100`
            : profile?.hydration_level || "À personnaliser",
        description:
          scan?.hydratation != null && scan.hydratation < 70
            ? `Votre dernier scan montre un score d’hydratation apparente de ${Math.round(scan.hydratation)}. Otavio met l’hydratation régulière en avant aujourd’hui.`
            : "Votre niveau d’hydratation et vos habitudes servent à ajuster les conseils du quotidien.",
        relevance:
          urgency(scan?.hydratation) +
          (goals.includes("hydratation") ? 20 : 0),
        border: "border-[#b9d9e5]",
        shadow: "shadow-[0_12px_32px_rgba(37,98,116,0.07)]",
        iconBg: "bg-[linear-gradient(160deg,#dff7ff_0%,#a9deef_100%)]",
        iconColor: "text-[#2d8eae]",
        badgeBg: "bg-[#dff3fa]",
        badgeColor: "text-[#2d7e9a]",
        titleColor: "text-[#245766]",
      },
      {
        key: "sommeil",
        href: "/sommeil",
        title: "Sommeil",
        eyebrow: "Récupération",
        badge:
          scan?.fatigue != null
            ? `Fatigue ${Math.round(scan.fatigue)} / 100`
            : profile?.sleep_quality || "À personnaliser",
        description:
          scan?.fatigue != null && scan.fatigue < 70
            ? `Le dernier scan montre un score de fatigue apparente de ${Math.round(scan.fatigue)}. Otavio privilégie aujourd’hui la récupération.`
            : "Votre qualité et votre régularité de sommeil servent à personnaliser votre accompagnement.",
        relevance:
          urgency(scan?.fatigue) +
          (goals.includes("sommeil") || goals.includes("fatigue") ? 18 : 0),
        border: "border-[#c9c7e2]",
        shadow: "shadow-[0_12px_32px_rgba(64,59,90,0.07)]",
        iconBg: "bg-[linear-gradient(160deg,#f0edff_0%,#cfc7ff_100%)]",
        iconColor: "text-[#5d5b9d]",
        badgeBg: "bg-[#eeeaff]",
        badgeColor: "text-[#5d5b9d]",
        titleColor: "text-[#39395f]",
      },
      {
        key: "alimentation",
        href: "/alimentation",
        title: "Nutrition",
        eyebrow: "Alimentation",
        badge:
          profile?.eating_style ||
          (scan?.equilibre != null
            ? `Équilibre ${Math.round(scan.equilibre)} / 100`
            : "À personnaliser"),
        description:
          scan?.hydratation != null && scan.hydratation < 70
            ? "Otavio renforce les habitudes alimentaires cohérentes avec votre hydratation et votre profil."
            : scan?.equilibre != null && scan.equilibre < 70
              ? "Votre score d’équilibre entre dans la sélection des habitudes alimentaires proposées par Otavio."
              : "Votre alimentation et vos préférences servent à personnaliser vos recommandations.",
        relevance:
          urgency(scan?.equilibre) * 0.45 +
          urgency(scan?.hydratation) * 0.35 +
          urgency(scan?.peau) * 0.20 +
          (goals.includes("nutrition") ? 16 : 0),
        border: "border-[#dfb7aa]",
        shadow: "shadow-[0_12px_32px_rgba(111,72,58,0.07)]",
        iconBg: "bg-[linear-gradient(160deg,#fff1eb_0%,#ffc7b8_100%)]",
        iconColor: "text-[#b76b58]",
        badgeBg: "bg-[#ffebe4]",
        badgeColor: "text-[#a35f4d]",
        titleColor: "text-[#77463b]",
      },
      {
        key: "activite",
        href: "/activite",
        title: "Activité",
        eyebrow: "Mouvement",
        badge: profile?.activity_level || "À personnaliser",
        description:
          scan?.fatigue != null && scan.fatigue < 60
            ? "Otavio privilégie aujourd’hui un mouvement doux et des pauses actives."
            : "Votre niveau d’activité, votre fatigue apparente et votre équilibre servent à ajuster le mouvement conseillé.",
        relevance:
          urgency(scan?.fatigue) * 0.55 +
          urgency(scan?.equilibre) * 0.45 +
          (profile?.activity_level === "faible" ||
          profile?.activity_level === "sédentaire"
            ? 12
            : 0),
        border: "border-[#a9d1cb]",
        shadow: "shadow-[0_12px_32px_rgba(35,90,84,0.06)]",
        iconBg: "bg-[linear-gradient(160deg,#e1faf3_0%,#b9eadc_100%)]",
        iconColor: "text-[#168f91]",
        badgeBg: "bg-[#dff7f0]",
        badgeColor: "text-[#168f91]",
        titleColor: "text-[#21585d]",
      },
    ];

    return [...items]
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, 3);
  }, [latestIndicators, profile]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.replace("/connexion");
  };

  useEffect(() => {
    const loadHome = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/connexion");
        return;
      }

      setFirstName(getFirstName(user.email));

      setTodayLabel(
        new Intl.DateTimeFormat("fr-FR", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        }).format(new Date())
      );

      const { data } = await supabase
        .from("profiles")
        .select(
          "age, sex, skin_type, skin_sensitivity, skin_concerns, goals, hydration_level, activity_level, sleep_quality, eating_style, meals_per_day, onboarding_completed, otavio_xp, otavio_stage, otavio_streak"
        )
        .eq("id", user.id)
        .maybeSingle();

      setProfile(data ?? null);

      let loadedFromSupabase = false;

      try {
        const { data: scans, error: scansError } = await supabase
          .from("scans")
          .select("id, created_at, score, indicators")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(20);

        if (scansError) {
          throw scansError;
        }

        if (Array.isArray(scans) && scans.length > 0) {
          const validScans = scans.filter(
            (scan) =>
              scan &&
              typeof scan.id === "string" &&
              typeof scan.created_at === "string" &&
              typeof scan.score === "number" &&
              scan.indicators &&
              typeof scan.indicators === "object"
          );

          if (validScans.length > 0) {
            loadedFromSupabase = true;

            setHasScan(true);
            setScanCount(validScans.length);
            setLatestScore(validScans[0].score);

            const completeScan = validScans.find(
              (scan) =>
                scan.indicators &&
                typeof scan.indicators.peau === "number" &&
                typeof scan.indicators.hydratation === "number" &&
                typeof scan.indicators.fatigue === "number" &&
                typeof scan.indicators.equilibre === "number"
            );

            if (completeScan) {
              setLatestIndicators({
                peau: completeScan.indicators.peau,
                hydratation: completeScan.indicators.hydratation,
                fatigue: completeScan.indicators.fatigue,
                equilibre: completeScan.indicators.equilibre,
              });
            } else {
              setLatestIndicators(null);
            }
          }
        }
      } catch (error) {
        console.error("Supabase home scans loading error:", error);
      }

      // Fallback temporaire pendant la migration des anciens scans locaux.
      if (!loadedFromSupabase) {
        const storedScans = localStorage.getItem("facescan-scans");

        if (storedScans) {
          try {
            const scans = JSON.parse(storedScans);

            if (Array.isArray(scans) && scans.length > 0) {
              setHasScan(true);
              setScanCount(scans.length);

              if (typeof scans[0]?.score === "number") {
                setLatestScore(scans[0].score);
              }

              const completeLocalScan = scans.find(
                (scan: any) =>
                  scan?.indicators &&
                  typeof scan.indicators.peau === "number" &&
                  typeof scan.indicators.hydratation === "number" &&
                  typeof scan.indicators.fatigue === "number" &&
                  typeof scan.indicators.equilibre === "number"
              );

              setLatestIndicators(
                completeLocalScan?.indicators ?? null
              );
            }
          } catch {
            setHasScan(false);
            setScanCount(0);
            setLatestScore(null);
            setLatestIndicators(null);
          }
        }
      }

      setLoading(false);
    };

    loadHome();
  }, [router, supabase]);

  useEffect(() => {
    const loadNutritionFeedback = () => {
      try {
        const stored = localStorage.getItem(
          "otavio-nutrition-feedback"
        );

        if (!stored) {
          setNutritionFeedback([]);
          return;
        }

        const parsed = JSON.parse(stored);
        setNutritionFeedback(
          Array.isArray(parsed) ? parsed : []
        );
      } catch {
        setNutritionFeedback([]);
      }
    };

    loadNutritionFeedback();

    window.addEventListener(
      "focus",
      loadNutritionFeedback
    );
    window.addEventListener(
      "storage",
      loadNutritionFeedback
    );

    return () => {
      window.removeEventListener(
        "focus",
        loadNutritionFeedback
      );
      window.removeEventListener(
        "storage",
        loadNutritionFeedback
      );
    };
  }, []);

  useEffect(() => {
    const loadDailyTasks = async () => {
      if (loading) return;

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const today = new Date().toISOString().slice(0, 10);

      const generatedTasks = buildOtavioDailyTasks(
        profile ?? {},
        latestIndicators
          ? {
              score: latestScore,
              indicators: latestIndicators,
            }
          : null,
        new Date()
      );

      const { data: existing } = await supabase
        .from("otavio_daily_tasks")
        .select("id, task_key, title, description, completed")
        .eq("user_id", user.id)
        .eq("task_date", today)
        .order("created_at", { ascending: true });

      const existingTasks = (existing ?? []) as DailyTask[];
      const existingByKey = new Map(
        existingTasks.map((task) => [task.task_key, task])
      );

      const finalTasks: DailyTask[] = [];

      for (const task of generatedTasks) {
        const existingTask = existingByKey.get(task.task_key);

        if (existingTask) {
          const shouldUpdateContent =
            existingTask.title !== task.title ||
            existingTask.description !== task.description;

          if (shouldUpdateContent) {
            await supabase
              .from("otavio_daily_tasks")
              .update({
                title: task.title,
                description: task.description,
              })
              .eq("id", existingTask.id);
          }

          finalTasks.push({
            ...existingTask,
            title: task.title,
            description: task.description,
          });

          continue;
        }

        const { data: inserted } = await supabase
          .from("otavio_daily_tasks")
          .insert({
            user_id: user.id,
            task_date: today,
            task_key: task.task_key,
            title: task.title,
            description: task.description,
            completed: false,
          })
          .select("id, task_key, title, description, completed")
          .maybeSingle();

        if (inserted) {
          finalTasks.push(inserted as DailyTask);
        }
      }

      const generatedKeys = new Set(
        generatedTasks.map((task) => task.task_key)
      );

      const staleIncompleteTasks = existingTasks.filter(
        (task) =>
          !generatedKeys.has(task.task_key) &&
          !task.completed
      );

      if (staleIncompleteTasks.length > 0) {
        await supabase
          .from("otavio_daily_tasks")
          .delete()
          .in("id", staleIncompleteTasks.map((task) => task.id));
      }

      setDailyTasks(finalTasks);
    };

    loadDailyTasks();
  }, [
    loading,
    hasScan,
    latestScore,
    latestIndicators,
    profile,
    supabase,
  ]);

  const toggleDailyTask = async (task: DailyTask) => {
    if (taskLoading) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.replace("/connexion");
      return;
    }

    const today = new Date().toISOString().slice(0, 10);
    const nextCompleted = !task.completed;

    setTaskLoading(true);

    const { error: updateError } = await supabase
      .from("otavio_daily_tasks")
      .update({
        completed: nextCompleted,
        completed_at: nextCompleted
          ? new Date().toISOString()
          : null,
      })
      .eq("id", task.id)
      .eq("user_id", user.id);

    if (updateError) {
      setTaskLoading(false);
      return;
    }

    setDailyTasks((current) =>
      current.map((item) =>
        item.id === task.id
          ? { ...item, completed: nextCompleted }
          : item
      )
    );

    if (nextCompleted) {
      try {
        const result = await registerOtavioDailyAction(task.task_key);

        if (result) {
          const gainedXp = result.actionXp + result.bonusXp;

          setProfile((current) => {
            if (!current) return current;

            const previousXp = current.otavio_xp ?? 0;
            const previousStage = current.otavio_stage ?? 1;
            const newXp = previousXp + gainedXp;
            const newProgress = getOtavioProgress(newXp);

            if (newProgress.stage > previousStage) {
              setStageUp(true);
              window.setTimeout(() => setStageUp(false), 3500);
            }

            return {
              ...current,
              otavio_xp: newXp,
              otavio_stage: newProgress.stage,
              otavio_streak: result.streak,
            };
          });

          setXpFeedback(gainedXp);
          window.setTimeout(() => setXpFeedback(null), 2200);
        }
      } catch (error) {
        console.error("Daily Otavio progression error:", error);
      }
    }

    setTaskLoading(false);
  };



  if (loading) {
    return (
      
<main className="relative min-h-screen app-background">
        <div className="mx-auto flex min-h-screen max-w-md items-center justify-center px-5">
          <div className="text-sm font-medium text-[#64747b]">
            Préparation de votre espace Otavio…
          </div>
        </div>
      </main>
    );
  }

  const goals = profile?.goals ?? [];
  const primaryGoal = goals[0];

  const otavioXp = profile?.otavio_xp ?? 0;
  const otavioProgress = getOtavioProgress(otavioXp);
  const otavioStreak = profile?.otavio_streak ?? 0;
  const completedToday = dailyTasks.filter((task) => task.completed).length;

  const nextStep = (() => {
    // Aucun scan : première étape
    if (!hasScan) {
      return {
        title: "Commencez par votre premier scan",
        description: primaryGoal
          ? `Votre priorité est ${getGoalLabel(primaryGoal).toLowerCase()}. Votre premier scan permettra à Otavio d’affiner vos recommandations.`
          : "Votre premier scan permettra à Otavio d’établir vos premiers indicateurs personnalisés.",
        cta: "Faire mon premier scan",
        href: "/scanner",
        score: null as number | null,
      };
    }

    // Scan enregistré mais indicateurs momentanément indisponibles.
    if (!latestIndicators) {
      return {
        title: "Votre scan est bien enregistré",
        description:
          "Votre analyse figure dans votre historique. Consultez vos résultats pour retrouver le détail de vos indicateurs.",
        cta: "Voir mes résultats",
        href: "/resultats",
        score: latestScore,
      };
    }

    const indicators = [
      {
        key: "peau",
        value: latestIndicators.peau,
      },
      {
        key: "hydratation",
        value: latestIndicators.hydratation,
      },
      {
        key: "fatigue",
        value: latestIndicators.fatigue,
      },
      {
        key: "equilibre",
        value: latestIndicators.equilibre,
      },
    ];

    const weakest = [...indicators].sort((a, b) => a.value - b.value)[0];

    // Indicateurs globalement bons : suivi de l'évolution
    if (weakest.value >= 85) {
      return {
        title: "Continuez votre progression",
        description:
          "Vos indicateurs sont globalement équilibrés. Suivez votre évolution pour voir comment vos habitudes évoluent dans le temps.",
        cta: "Voir mon évolution",
        href: "/evolution",
        score: weakest.value,
      };
    }

    switch (weakest.key) {
      case "peau":
        return {
          title: "Prenez soin de votre peau",
          description: `Votre indicateur peau est actuellement à ${weakest.value}/100. Otavio peut vous proposer des conseils plus ciblés pour votre routine et vos habitudes.`,
          cta: "Voir mes conseils peau",
          href: "/peau",
          score: weakest.value,
        };

      case "hydratation":
        return {
          title: "Travaillez votre hydratation",
          description: `Votre indicateur d’hydratation est actuellement à ${weakest.value}/100. C’est un bon levier à travailler dans votre quotidien.`,
          cta: "Voir mes conseils",
          href: "/conseils",
          score: weakest.value,
        };

      case "fatigue":
        return {
          title: "Améliorez votre récupération",
          description: `Votre indicateur de fatigue apparente est actuellement à ${weakest.value}/100. Le sommeil et la récupération peuvent devenir votre prochaine priorité.`,
          cta: "Voir mon programme sommeil",
          href: "/sommeil",
          score: weakest.value,
        };

      default:
        return {
          title: "Travaillez votre équilibre",
          description: `Votre indicateur d’équilibre est actuellement à ${weakest.value}/100. Otavio peut vous aider à ajuster progressivement vos habitudes.`,
          cta: "Voir mes conseils",
          href: "/conseils",
          score: weakest.value,
        };
    }
  })();

  return (
    <main className="app-background relative min-h-screen overflow-hidden pb-28">
      <div className="relative z-10 mx-auto max-w-md px-5 pt-6">
        <header className="relative -mx-5 -mt-6 px-5 pb-4 pt-5 sm:-mx-8 sm:px-8 sm:pt-6">

          <div className="relative flex items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-[68px] w-[68px] shrink-0 items-center justify-center overflow-hidden rounded-[18px] bg-transparent">
                <img
                  src="/logo-otavio.png"
                  alt="Otavio"
                  className="h-full w-full scale-[1.18] object-contain"
                />
              </div>

              <div className="min-w-0">
                <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-white/65">
                  Bonjour
                </p>
                <h1 className="mt-0.5 truncate text-[24px] font-semibold tracking-[-0.025em] text-white">
                  {firstName}
                </h1>

                {todayLabel && (
                  <p className="mt-0.5 text-[10px] font-medium capitalize tracking-[0.01em] text-white/60">
                    {todayLabel}
                  </p>
                )}
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-1.5">
              <button
                type="button"
                onClick={() => router.push("/profil")}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/12 text-white/90 backdrop-blur-md transition hover:bg-white/20"
                aria-label="Mon profil"
              >
                <User size={18} strokeWidth={1.7} />
              </button>

              <button
                type="button"
                onClick={handleSignOut}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/10 text-white/80 backdrop-blur-md transition hover:bg-white/20"
                aria-label="Se déconnecter"
                title="Se déconnecter"
              >
                <LogOut size={17} strokeWidth={1.7} />
              </button>
            </div>
          </div>
        </header>

        {hasScan ? (
          <button
            type="button"
            onClick={() => router.push("/resultats")}
            className="relative mt-7 w-full overflow-hidden rounded-[32px] border border-[#8fc7cf] bg-white text-left shadow-[0_20px_50px_rgba(24,55,68,0.10)] transition hover:-translate-y-0.5 hover:shadow-[0_24px_55px_rgba(24,55,68,0.13)]"
          >
            <div className="relative flex items-center justify-between gap-5 overflow-hidden bg-[linear-gradient(135deg,#0b5876_0%,#087ea4_48%,#12a6a6_100%)] p-6 text-white">
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#9ce5de]">
                  <ScanFace size={15} />
                  Votre analyse
                </div>

                <h2 className="mt-3 text-3xl font-semibold tracking-tight">
                  {latestScore ?? "—"}
                  <span className="ml-1 text-lg font-normal text-[#c7dadd]">
                    /100
                  </span>
                </h2>

                <p className="mt-1 text-sm text-[#d6e4e7]">
                  Indice visuel global
                </p>
              </div>

              <div className="flex shrink-0 flex-col items-end gap-2.5">
                <div className="relative h-[78px] w-[78px] overflow-hidden rounded-[22px] border border-white/20 bg-white/10 shadow-[0_10px_28px_rgba(0,0,0,0.16)]">
                  <video
                    src="/otavio/video-analyse.mp4"
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="absolute inset-0 h-full w-full object-cover"
                    aria-label="Otavio"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent" />
                </div>

                <div className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/12 backdrop-blur-sm">
                  <ArrowRight size={17} />
                </div>
              </div>
            </div>

            <div className="bg-white p-5">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-[#163d4c]">
                    Ce que le scan a observé
                  </p>
                  <p className="mt-1 text-xs text-[#7b898f]">
                    Des indicateurs visuels, pas un diagnostic médical.
                  </p>
                </div>

                <span className="rounded-full bg-[#dff7ef] px-3 py-1.5 text-xs font-semibold text-[#287f72] transition hover:bg-[#dff1ea]">
                  Voir l’analyse
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  {
                    label: "Peau",
                    value: latestIndicators?.peau,
                    tone: "text-[#d96550]",
                    bg: "bg-[#fff0eb]",
                  },
                  {
                    label: "Hydratation",
                    value: latestIndicators?.hydratation,
                    tone: "text-[#168f91]",
                    bg: "bg-[#e5faf7]",
                  },
                  {
                    label: "Fatigue apparente",
                    value: latestIndicators?.fatigue,
                    tone: "text-[#756bd4]",
                    bg: "bg-[#eeecff]",
                  },
                  {
                    label: "Équilibre visuel",
                    value: latestIndicators?.equilibre,
                    tone: "text-[#3f9864]",
                    bg: "bg-[#e8f7ee]",
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-[22px] border border-[#b9dfe0] bg-white p-4 shadow-[0_6px_18px_rgba(70,55,40,0.035)]"
                  >
                    <div
                      className={`inline-flex rounded-2xl px-3 py-1.5 text-xs font-bold ${item.bg} ${item.tone}`}
                    >
                      {item.value ?? "—"}
                    </div>

                    <p className="mt-3 text-xs font-semibold text-[#183d48]">
                      {item.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </button>
        ) : (
          <section className="mt-7 overflow-hidden rounded-[30px] border border-[#72c9cf] bg-white shadow-[0_18px_50px_rgba(8,126,164,0.16)]">
            <div className="relative overflow-hidden bg-[linear-gradient(135deg,#dff8f4_0%,#eefcff_52%,#eee9ff_100%)] px-5 py-7">
              <div className="pointer-events-none absolute -right-10 -top-12 h-32 w-32 rounded-full bg-[#9ee7dc]/25 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-12 -left-10 h-28 w-28 rounded-full bg-[#a9b2f7]/20 blur-3xl" />

              <div className="relative flex items-start gap-4">
                <div className="shrink-0">
                  <div className="relative h-20 w-20 overflow-hidden rounded-[22px] border border-white/90 bg-white shadow-[0_12px_30px_rgba(35,92,96,0.12)]">
                    <video
                      src="/otavio/premier-scan.mp4"
                      autoPlay
                      muted
                      loop
                      playsInline
                      preload="metadata"
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  </div>
                </div>

                <div className="min-w-0 flex-1 pt-0.5">
                  <div className="inline-flex items-center gap-2 rounded-full border border-[#cfe6e3] bg-white/75 px-3 py-1.5 shadow-sm">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#168f91]" />
                    <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#277d80]">
                      Votre première étape
                    </span>
                  </div>

                  <h2 className="mt-3 text-[21px] font-semibold leading-tight tracking-tight text-[#183d48]">
                    Faites votre premier scan
                  </h2>
                </div>
              </div>

              <p className="relative mt-4 max-w-[340px] text-sm leading-5 text-[#617078]">
                Votre scan va établir votre point de départ et permettre à
                Otavio de personnaliser votre accompagnement.
              </p>

              <button
                type="button"
                onClick={() => router.push("/scanner")}
                className="relative mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#183d48] px-5 py-3 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(24,61,72,0.18)] transition hover:-translate-y-0.5 hover:bg-[#214d59] hover:shadow-[0_14px_28px_rgba(24,61,72,0.22)]"
              >
                <ScanFace size={17} strokeWidth={1.8} />
                Faire mon premier scan
              </button>
            </div>

            <div className="border-t border-[#e0e8e7] px-5 py-4">
              <p className="text-xs leading-5 text-[#728087]">
                Quelques secondes suffisent pour obtenir vos premiers
                indicateurs visuels.
              </p>
            </div>
          </section>
        )}


        <section className="mt-5 overflow-hidden rounded-[30px] border border-[#72c9cf] bg-white shadow-[0_18px_50px_rgba(8,126,164,0.16)]">
          <div className="relative aspect-[16/8] overflow-hidden bg-white">
            <video
              src="/otavio/compagnon.mp4"
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              className="absolute inset-0 h-full w-full object-contain scale-[0.97]"
            />
          </div>

          <div className="bg-white/96 px-5 py-5">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#168f91]" />

              <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[#168f91]">
                Votre compagnon
              </span>
            </div>

            <div className="mt-2 flex items-end justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold tracking-tight text-[#183d48]">
                  Otavio
                </h2>

                <p className="mt-1 text-sm text-[#66757d]">
                  Stade {otavioProgress.stage} · {otavioProgress.name}
                </p>
              </div>

              <div className="text-right">
                <p className="text-2xl font-semibold tracking-tight text-[#102f3a]">
                  {otavioXp}
                </p>

                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#89969c]">
                  XP
                </p>
              </div>
            </div>

            <div className="mt-5">
              <div className="flex items-center justify-between text-[10px] font-semibold text-[#7c8b90]">
                <span>Progression</span>

                <span>
                  {otavioProgress.nextXp
                    ? `${otavioProgress.nextXp - otavioXp} XP avant ${getOtavioProgress(otavioProgress.nextXp).name}`
                    : "Stade ultime"}
                </span>
              </div>

              <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#e6eceb]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#087ea4] via-[#12a6a6] to-[#42cfc2] transition-all duration-700"
                  style={{ width: `${otavioProgress.progress}%` }}
                />
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-[#ffb7a4] bg-[linear-gradient(135deg,#fff1eb_0%,#ffd4c8_100%)] px-4 py-3 shadow-[0_8px_22px_rgba(255,128,102,0.10)]">
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#7c8b90]">
                  Série
                </p>

                <p className="mt-1 text-sm font-semibold text-[#163d4c]">
                  🔥 {otavioStreak} jour{otavioStreak > 1 ? "s" : ""}
                </p>
              </div>

              <div className="rounded-2xl border border-[#ffb7a4] bg-[linear-gradient(135deg,#fff1eb_0%,#ffd4c8_100%)] px-4 py-3 shadow-[0_8px_22px_rgba(255,128,102,0.10)]">
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#7c8b90]">
                  Aujourd’hui
                </p>

                <p className="mt-1 text-sm font-semibold text-[#163d4c]">
                  {completedToday} / {dailyTasks.length || 4} actions
                </p>
              </div>
            </div>

            <div className="mt-3 rounded-2xl border border-[#8fddd3] bg-[linear-gradient(135deg,#d9f8f1_0%,#c5efea_48%,#eee8ff_100%)] px-4 py-3 shadow-[0_8px_22px_rgba(18,166,166,0.08)]">
              <p className="text-xs font-semibold text-[#176678]">
                {hasScan
                  ? "Otavio progresse avec vous."
                  : "Votre aventure avec Otavio commence ici."}
              </p>

              <p className="mt-1 text-xs leading-5 text-[#466d74]">
                {hasScan
                  ? "Complétez votre programme régulièrement pour faire évoluer votre compagnon."
                  : "Votre premier scan vous permettra de commencer à faire évoluer Otavio."}
              </p>
            </div>
          </div>
        </section>

        <section className="mt-7">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-sm font-semibold text-[#287f72]">
                Votre aperçu
              </p>

              <h2 className="mt-1 text-xl font-semibold tracking-tight text-[#183d48]">
                Vos indicateurs
              </h2>
            </div>

            <span className="text-xs font-medium text-[#8a989e]">
              {hasScan ? "Dernière analyse" : "Après votre scan"}
            </span>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-[24px] border border-[#72d0c4] bg-[linear-gradient(145deg,#ffffff_0%,#d7f6ee_100%)] p-5 shadow-[0_10px_20px_rgba(31,69,65,0.055),0_22px_42px_rgba(31,69,65,0.055),inset_0_1px_0_rgba(255,255,255,0.96)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_14px_26px_rgba(31,69,65,0.075),0_28px_54px_rgba(31,69,65,0.10),inset_0_1px_0_rgba(255,255,255,1)]">
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-[14px] border border-white/80 bg-[linear-gradient(145deg,#effffc_0%,#bdece1_100%)] text-[#287f72] shadow-[0_4px_8px_rgba(35,80,74,0.08),0_9px_18px_rgba(35,80,74,0.07),inset_0_1px_0_rgba(255,255,255,1)] transition-transform duration-300 hover:scale-[1.04]">
                  <Sparkles size={18} />
                </div>

                <span className="text-xs font-semibold text-[#9aa7ad]">
                  {latestIndicators?.peau != null
                    ? `${Math.round(latestIndicators.peau)}`
                    : "—"}
                </span>
              </div>

              <p className="mt-4 text-sm font-semibold text-[#183d48]">
                Qualité de peau
              </p>

              <p className="mt-1 text-xs leading-5 text-[#7b898f]">
                Votre premier score apparaîtra ici.
              </p>
            </div>

            <div className="rounded-[24px] border border-[#71cbd5] bg-[linear-gradient(145deg,#ffffff_0%,#d9f5f8_100%)] p-5 shadow-[0_10px_20px_rgba(30,100,105,0.05),0_22px_42px_rgba(30,100,105,0.055),inset_0_1px_0_rgba(255,255,255,0.96)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_14px_26px_rgba(30,100,105,0.07),0_28px_54px_rgba(30,100,105,0.10),inset_0_1px_0_rgba(255,255,255,1)]">
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-[14px] border border-white/80 bg-[linear-gradient(145deg,#effffc_0%,#bdece1_100%)] text-[#287f72] shadow-[0_4px_8px_rgba(35,80,74,0.08),0_9px_18px_rgba(35,80,74,0.07),inset_0_1px_0_rgba(255,255,255,1)] transition-transform duration-300 hover:scale-[1.04]">
                  <Droplets size={18} />
                </div>

                <span className="text-xs font-semibold text-[#9aa7ad]">
                  {latestIndicators?.hydratation != null
                    ? `${Math.round(latestIndicators.hydratation)}`
                    : "—"}
                </span>
              </div>

              <p className="mt-4 text-sm font-semibold text-[#183d48]">
                Hydratation
              </p>

              <p className="mt-1 text-xs leading-5 text-[#7b898f]">
                Votre premier score apparaîtra ici.
              </p>
            </div>

            <div className="rounded-[24px] border border-[#b1a6f7] bg-[linear-gradient(145deg,#ffffff_0%,#e5e0ff_100%)] p-5 shadow-[0_10px_20px_rgba(82,75,130,0.05),0_22px_42px_rgba(82,75,130,0.055),inset_0_1px_0_rgba(255,255,255,0.96)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_14px_26px_rgba(82,75,130,0.07),0_28px_54px_rgba(82,75,130,0.10),inset_0_1px_0_rgba(255,255,255,1)]">
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-[14px] border border-white/80 bg-[linear-gradient(145deg,#fbfaff_0%,#d9d2ff_100%)] text-[#655cc2] shadow-[0_4px_8px_rgba(82,75,130,0.08),0_9px_18px_rgba(82,75,130,0.07),inset_0_1px_0_rgba(255,255,255,1)] transition-transform duration-300 hover:scale-[1.04]">
                  <Moon size={18} />
                </div>

                <span className="text-xs font-semibold text-[#9aa7ad]">
                  {latestIndicators?.fatigue != null
                    ? `${Math.round(latestIndicators.fatigue)}`
                    : "—"}
                </span>
              </div>

              <p className="mt-4 text-sm font-semibold text-[#183d48]">
                Fatigue apparente
              </p>

              <p className="mt-1 text-xs leading-5 text-[#7b898f]">
                Votre premier score apparaîtra ici.
              </p>
            </div>

            <div className="rounded-[24px] border border-[#ffad98] bg-[linear-gradient(145deg,#ffffff_0%,#ffe2d9_100%)] p-5 shadow-[0_10px_20px_rgba(120,75,60,0.05),0_22px_42px_rgba(120,75,60,0.055),inset_0_1px_0_rgba(255,255,255,0.96)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_14px_26px_rgba(120,75,60,0.07),0_28px_54px_rgba(120,75,60,0.10),inset_0_1px_0_rgba(255,255,255,1)]">
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-[14px] border border-white/80 bg-[linear-gradient(145deg,#fffaf7_0%,#ffc9bb_100%)] text-[#c06450] shadow-[0_4px_8px_rgba(120,75,60,0.08),0_9px_18px_rgba(120,75,60,0.07),inset_0_1px_0_rgba(255,255,255,1)] transition-transform duration-300 hover:scale-[1.04]">
                  <Activity size={18} />
                </div>

                <span className="text-xs font-semibold text-[#9aa7ad]">
                  {latestIndicators?.equilibre != null
                    ? `${Math.round(latestIndicators.equilibre)}`
                    : "—"}
                </span>
              </div>

              <p className="mt-4 text-sm font-semibold text-[#183d48]">
                Équilibre visuel
              </p>

              <p className="mt-1 text-xs leading-5 text-[#7b898f]">
                Votre premier score apparaîtra ici.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-7">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[#287f72]">
                Votre programme
              </p>
              <h2 className="mt-1 text-xl font-semibold tracking-[-0.025em] text-[#183d48]">
                Votre programme du jour
              </h2>
              <p className="mt-1.5 text-xs leading-5 text-[#718088]">
                {otavioDailyProgram.subtitle}
              </p>
            </div>

            <div className="relative h-[74px] w-[74px] shrink-0 overflow-hidden rounded-[22px] border border-white/90 bg-[#dce8e5] shadow-[0_9px_24px_rgba(25,68,80,0.12)]">
              <video
                src="/otavio/video-quotidien.mp4"
                autoPlay
                muted
                loop
                playsInline
                className="absolute inset-0 h-full w-full object-cover"
                aria-label="Otavio"
              />
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {dailyProgramItems.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className="group block rounded-[22px] border border-[#dce7e4] bg-white px-4 py-4 shadow-[0_8px_24px_rgba(25,68,80,0.06)] transition hover:border-[#bcd5d0] hover:shadow-[0_10px_28px_rgba(25,68,80,0.09)]"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-[#eef5f3] text-[#287f72]">
                    {item.category === "hydratation" ? (
                      <Droplets className="h-5 w-5" />
                    ) : item.category === "alimentation" ? (
                      <Utensils className="h-5 w-5" />
                    ) : item.category === "sommeil" ? (
                      <Moon className="h-5 w-5" />
                    ) : (
                      <Sparkles className="h-5 w-5" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#287f72]">
                        {item.category === "hydratation"
                          ? "Hydratation"
                          : item.category === "alimentation"
                            ? "Alimentation"
                            : item.category === "sommeil"
                              ? "Sommeil"
                              : "Peau"}
                      </span>

                      {item.time && (
                        <span className="rounded-full bg-[#f3f6f5] px-2 py-0.5 text-[10px] font-medium text-[#718088]">
                          {item.time}
                        </span>
                      )}
                    </div>

                    <h3 className="mt-1.5 text-sm font-semibold leading-5 text-[#183d48]">
                      {item.title}
                    </h3>

                    <p className="mt-1 text-xs leading-5 text-[#718088]">
                      {item.description}
                    </p>
                  </div>

                  <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-[#9aaba8] transition-transform group-hover:translate-x-0.5" />
                </div>
              </Link>
            ))}

            {dailyProgramItems.length === 0 && (
              <div className="rounded-[22px] border border-[#dce7e4] bg-white px-4 py-5 text-center shadow-[0_8px_24px_rgba(25,68,80,0.05)]">
                <p className="text-sm font-medium text-[#183d48]">
                  Votre programme se prépare
                </p>
                <p className="mt-1 text-xs leading-5 text-[#718088]">
                  Complétez votre profil pour permettre à Otavio de personnaliser vos actions.
                </p>
              </div>
            )}
          </div>
        </section>

        <section className="mt-7">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[#287f72]">
                Votre quotidien
              </p>

              <h2 className="mt-1 text-xl font-semibold tracking-[-0.025em] text-[#183d48]">
                Les habitudes qui comptent
              </h2>

              <p className="mt-1.5 text-xs leading-5 text-[#718088]">
                Otavio ajuste ces priorités à partir de votre profil et de votre dernier scan.
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {dailyHabitItems.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                className={`group relative block overflow-hidden rounded-[26px] border bg-white ${item.border} ${item.shadow} transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_38px_rgba(25,68,80,0.11)]`}
              >
                <div className="flex items-stretch">
                  <div
                    className={`flex w-[88px] shrink-0 items-center justify-center ${item.iconBg}`}
                  >
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-[17px] bg-white/85 ${item.iconColor} shadow-[0_6px_16px_rgba(25,68,80,0.08)]`}
                    >
                      {item.key === "sommeil" ? (
                        <Moon size={21} strokeWidth={1.8} />
                      ) : item.key === "alimentation" ? (
                        <Utensils size={21} strokeWidth={1.8} />
                      ) : item.key === "activite" ? (
                        <Activity size={21} strokeWidth={1.8} />
                      ) : item.key === "hydratation" ? (
                        <Droplets size={21} strokeWidth={1.8} />
                      ) : (
                        <Sparkles size={21} strokeWidth={1.8} />
                      )}
                    </div>
                  </div>

                  <div className="min-w-0 flex-1 px-4 py-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p
                          className={`text-[10px] font-bold uppercase tracking-[0.16em] ${item.iconColor}`}
                        >
                          {item.eyebrow}
                        </p>

                        <p
                          className={`mt-1 text-[17px] font-semibold tracking-[-0.02em] ${item.titleColor}`}
                        >
                          {item.title}
                        </p>
                      </div>

                      <ChevronRight
                        size={17}
                        className="mt-1 shrink-0 text-[#a6b2b0] transition-transform group-hover:translate-x-0.5"
                      />
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${item.badgeBg} ${item.badgeColor}`}
                      >
                        {item.badge}
                      </span>

                      <span className="text-[10px] text-[#89909a]">
                        Personnalisé par Otavio
                      </span>
                    </div>

                    <p className="mt-2 text-xs leading-5 text-[#7b898f]">
                      {item.description}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-9 border-t border-[#d7e3e0] pt-6">
          <div className="flex items-start gap-4">
            <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#e8f5f2] text-[#287f72]">
              <Sparkles size={17} strokeWidth={1.8} />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#287f72]">
                    Votre prochaine étape
                  </p>

                  <h2 className="mt-1.5 text-lg font-semibold tracking-[-0.02em] text-[#183d48]">
                    {nextStep.title}
                  </h2>
                </div>

                <div className="relative h-[88px] w-[88px] shrink-0 overflow-hidden rounded-[22px] border border-white bg-[#e7f1ef] shadow-[0_9px_24px_rgba(25,68,80,0.12)]">
                  <video
                    src="/prochaine-etape.mp4"
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="absolute inset-0 h-full w-full object-cover"
                    aria-label="Votre prochaine étape"
                  />

                  <div className="pointer-events-none absolute inset-0 rounded-[22px] ring-1 ring-inset ring-black/5" />
                </div>


              </div>

              <p className="mt-2 max-w-md text-sm leading-6 text-[#66757d]">
                {nextStep.description}
              </p>

              <button
                type="button"
                onClick={() => router.push(nextStep.href)}
                className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-[#168f91] transition hover:gap-2.5"
              >
                {nextStep.cta}
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        </section>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-[#cfe1e3]/80 bg-white/92 shadow-[0_-12px_35px_rgba(70,55,40,0.07)] backdrop-blur-2xl">
        <div className="mx-auto grid max-w-md grid-cols-5 items-end px-3 pb-3 pt-2">
          <button
            type="button"
            onClick={() => router.push("/")}
            className="flex flex-col items-center gap-1 py-2 text-[#168f91]"
          >
            <Sparkles size={19} />
            <span className="text-[10px] font-semibold">Accueil</span>
          </button>

          <button
            type="button"
            onClick={() => router.push("/conseils")}
            className="flex flex-col items-center gap-1 py-2 text-[#718088]"
          >
            <Target size={19} />
            <span className="text-[10px] font-semibold">Conseils</span>
          </button>

          <button
            type="button"
            onClick={() => router.push("/scanner")}
            className="relative -mt-7 flex h-16 w-16 items-center justify-center justify-self-center rounded-full bg-[linear-gradient(135deg,#087ea4_0%,#12a6a6_50%,#7767e8_100%)] text-white shadow-[0_14px_32px_rgba(18,53,68,0.28)] ring-4 ring-white transition hover:scale-[1.03]"
            aria-label="Scanner"
          >
            <Camera size={25} strokeWidth={1.8} />
          </button>

          <button
            type="button"
            onClick={() => router.push("/evolution")}
            className="flex flex-col items-center gap-1 py-2 text-[#718088]"
          >
            <ArrowRight size={19} />
            <span className="text-[10px] font-semibold">Évolution</span>
          </button>

          <button
            type="button"
            onClick={() => router.push("/profil")}
            className="flex flex-col items-center gap-1 py-2 text-[#718088]"
          >
            <User size={19} />
            <span className="text-[10px] font-semibold">Profil</span>
          </button>
        </div>
      </nav>
    </main>
  );
}
