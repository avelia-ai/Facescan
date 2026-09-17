"use client";

import { buildOtavioDailyProgram } from "@/lib/otavio-program-engine";

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

  const otavioDailyProgram = buildOtavioDailyProgram(otavioProfile ?? {});


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
  const [dailyTasks, setDailyTasks] = useState<DailyTask[]>([]);
  const [taskLoading, setTaskLoading] = useState(false);
  const [xpFeedback, setXpFeedback] = useState<number | null>(null);
  const [stageUp, setStageUp] = useState(false);

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

            if (
              scans[0]?.indicators &&
              typeof scans[0].indicators.peau === "number" &&
              typeof scans[0].indicators.hydratation === "number" &&
              typeof scans[0].indicators.fatigue === "number" &&
              typeof scans[0].indicators.equilibre === "number"
            ) {
              setLatestIndicators(scans[0].indicators);
            }
          }
        } catch {
          setHasScan(false);
          setScanCount(0);
          setLatestScore(null);
        }
      }

      setLoading(false);
    };

    loadHome();
  }, [router, supabase]);

  useEffect(() => {
    const loadDailyTasks = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const today = new Date().toISOString().slice(0, 10);

      const generatedTasks = buildOtavioDailyTasks(profile ?? {}, { score: latestScore, indicators: latestIndicators }, new Date());

      const { data: existing } = await supabase
        .from("otavio_daily_tasks")
        .select("id, task_key, title, description, completed")
        .eq("user_id", user.id)
        .eq("task_date", today)
        .order("created_at", { ascending: true });

      const existingTasks = (existing ?? []) as DailyTask[];

      if (existingTasks.length === 0) {
        const { data: inserted } = await supabase
          .from("otavio_daily_tasks")
          .insert(
            generatedTasks.map((task) => ({
              user_id: user.id,
              task_date: today,
              task_key: task.task_key,
              title: task.title,
              description: task.description,
              completed: false,
            }))
          )
          .select("id, task_key, title, description, completed");

        setDailyTasks((inserted ?? []) as DailyTask[]);
        return;
      }

      const existingKeys = new Set(
        existingTasks.map((task) => task.task_key)
      );

      const missingTasks = generatedTasks.filter(
        (task) => !existingKeys.has(task.task_key)
      );

      let finalTasks = existingTasks;

      if (missingTasks.length > 0) {
        const { data: inserted } = await supabase
          .from("otavio_daily_tasks")
          .insert(
            missingTasks.map((task) => ({
              user_id: user.id,
              task_date: today,
              task_key: task.task_key,
              title: task.title,
              description: task.description,
              completed: false,
            }))
          )
          .select("id, task_key, title, description, completed");

        finalTasks = [...existingTasks, ...((inserted ?? []) as DailyTask[])];
      }

      setDailyTasks(finalTasks);
    };

    loadDailyTasks();
  }, [hasScan, latestIndicators, profile, supabase]);

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

  useEffect(() => {
    const refreshScanState = () => {
      const storedScans = localStorage.getItem("facescan-scans");

      if (!storedScans) {
        setHasScan(false);
        setScanCount(0);
        setLatestScore(null);
        setLatestIndicators(null);
        return;
      }

      try {
        const scans = JSON.parse(storedScans);

        if (Array.isArray(scans) && scans.length > 0) {
          setHasScan(true);
          setScanCount(scans.length);
          setLatestScore(
            typeof scans[0]?.score === "number" ? scans[0].score : null
          );

          setLatestIndicators(
            scans[0]?.indicators &&
              typeof scans[0].indicators.peau === "number" &&
              typeof scans[0].indicators.hydratation === "number" &&
              typeof scans[0].indicators.fatigue === "number" &&
              typeof scans[0].indicators.equilibre === "number"
              ? scans[0].indicators
              : null
          );
        } else {
          setHasScan(false);
          setScanCount(0);
          setLatestScore(null);
        }
      } catch {
        setHasScan(false);
        setScanCount(0);
        setLatestScore(null);
      }
    };

    window.addEventListener("focus", refreshScanState);
    window.addEventListener("storage", refreshScanState);

    return () => {
      window.removeEventListener("focus", refreshScanState);
      window.removeEventListener("storage", refreshScanState);
    };
  }, []);

  if (loading) {
    return (
      
<main className="relative min-h-screen bg-white">
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
            className="relative mt-7 w-full overflow-hidden rounded-[32px] border border-[#9fc0c8] bg-[#fffdfb] text-left shadow-[0_20px_50px_rgba(24,55,68,0.10)] transition hover:-translate-y-0.5 hover:shadow-[0_24px_55px_rgba(24,55,68,0.13)]"
          >
            <div className="relative flex items-start justify-between gap-4 overflow-hidden bg-[linear-gradient(135deg,#123544_0%,#184b5c_55%,#28677a_100%)] p-6 text-white">
              <div>
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

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/12 backdrop-blur-sm">
                <ArrowRight size={19} />
              </div>
            </div>

            <div className="bg-[#fffdfb] p-5">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-[#183d48]">
                    Ce que le scan a observé
                  </p>
                  <p className="mt-1 text-xs text-[#7b898f]">
                    Des indicateurs visuels, pas un diagnostic médical.
                  </p>
                </div>

                <span className="rounded-full bg-[#e9f7f2] px-3 py-1.5 text-xs font-semibold text-[#287f72] transition hover:bg-[#dff1ea]">
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
                    className="rounded-[22px] border border-[#d3d0c7] bg-[#fffefb] p-4 shadow-[0_6px_18px_rgba(70,55,40,0.035)]"
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
          <section className="mt-7 overflow-hidden rounded-[30px] border border-[#b8cecf] bg-white shadow-[0_16px_40px_rgba(16,47,58,0.07)]">
            <div className="relative overflow-hidden bg-[linear-gradient(135deg,#edf8f5_0%,#f9fcfb_55%,#eef3ff_100%)] px-5 py-7">
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


        <section className="mt-5 overflow-hidden rounded-[30px] border border-[#b8cecf] bg-white shadow-[0_16px_40px_rgba(16,47,58,0.07)]">
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

          <div className="px-5 py-5">
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
                  className="h-full rounded-full bg-[#168f91] transition-all duration-700"
                  style={{ width: `${otavioProgress.progress}%` }}
                />
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-[#f7f5f1] px-4 py-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#7c8b90]">
                  Série
                </p>

                <p className="mt-1 text-sm font-semibold text-[#183d48]">
                  🔥 {otavioStreak} jour{otavioStreak > 1 ? "s" : ""}
                </p>
              </div>

              <div className="rounded-2xl bg-[#f7f5f1] px-4 py-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#7c8b90]">
                  Aujourd’hui
                </p>

                <p className="mt-1 text-sm font-semibold text-[#183d48]">
                  {completedToday} / {dailyTasks.length || 4} actions
                </p>
              </div>
            </div>

            <div className="mt-3 rounded-2xl bg-[#e5faf7] px-4 py-3">
              <p className="text-xs font-semibold text-[#176678]">
                {hasScan
                  ? "Otavio progresse avec vous."
                  : "Votre aventure avec Otavio commence ici."}
              </p>

              <p className="mt-1 text-xs leading-5 text-[#55757b]">
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
            <div className="rounded-[24px] border border-[#b8d7cf] bg-[linear-gradient(145deg,#ffffff_0%,#f4fbf8_100%)] p-5 shadow-[0_12px_30px_rgba(36,78,70,0.06)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_34px_rgba(36,78,70,0.10)]">
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#e7f8f3_0%,#d7eee7_100%)] text-[#287f72]">
                  <Sparkles size={18} />
                </div>

                <span className="text-xs font-semibold text-[#9aa7ad]">
                  {hasScan && latestScore !== null ? `${latestScore}` : "—"}
                </span>
              </div>

              <p className="mt-4 text-sm font-semibold text-[#183d48]">
                Qualité de peau
              </p>

              <p className="mt-1 text-xs leading-5 text-[#7b898f]">
                Votre premier score apparaîtra ici.
              </p>
            </div>

            <div className="rounded-[24px] border border-[#a9d5d7] bg-[linear-gradient(145deg,#ffffff_0%,#f2fbfb_100%)] p-5 shadow-[0_12px_30px_rgba(30,100,105,0.06)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_34px_rgba(30,100,105,0.10)]">
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#e7f8f3_0%,#d7eee7_100%)] text-[#287f72]">
                  <Droplets size={18} />
                </div>

                <span className="text-xs font-semibold text-[#9aa7ad]">
                  —
                </span>
              </div>

              <p className="mt-4 text-sm font-semibold text-[#183d48]">
                Hydratation
              </p>

              <p className="mt-1 text-xs leading-5 text-[#7b898f]">
                Votre premier score apparaîtra ici.
              </p>
            </div>

            <div className="rounded-[24px] border border-[#c7c2e2] bg-[linear-gradient(145deg,#ffffff_0%,#f7f5fd_100%)] p-5 shadow-[0_12px_30px_rgba(82,75,130,0.06)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_34px_rgba(82,75,130,0.10)]">
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#f2f0ff_0%,#e6e2fb_100%)] text-[#655cc2]">
                  <Moon size={18} />
                </div>

                <span className="text-xs font-semibold text-[#9aa7ad]">
                  —
                </span>
              </div>

              <p className="mt-4 text-sm font-semibold text-[#183d48]">
                Fatigue apparente
              </p>

              <p className="mt-1 text-xs leading-5 text-[#7b898f]">
                Votre premier score apparaîtra ici.
              </p>
            </div>

            <div className="rounded-[24px] border border-[#e0b9ad] bg-[linear-gradient(145deg,#ffffff_0%,#fff7f3_100%)] p-5 shadow-[0_12px_30px_rgba(120,75,60,0.06)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_34px_rgba(120,75,60,0.10)]">
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#fff2ed_0%,#f9e2da_100%)] text-[#c06450]">
                  <Activity size={18} />
                </div>

                <span className="text-xs font-semibold text-[#9aa7ad]">
                  —
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
                Votre quotidien
              </p>

              <h2 className="mt-1 text-xl font-semibold tracking-[-0.025em] text-[#183d48]">
                Les habitudes qui comptent
              </h2>

              <p className="mt-1.5 text-xs leading-5 text-[#718088]">
                Les leviers que vous pouvez suivre au quotidien.
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

            {/* Sommeil */}
            <Link
              href="/sommeil"
              className="group relative block overflow-hidden rounded-[26px] border border-[#c9c7e2] bg-white shadow-[0_12px_32px_rgba(64,59,90,0.07)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_38px_rgba(64,59,90,0.11)]"
            >
              <div className="flex items-stretch">
                <div className="flex w-[88px] shrink-0 items-center justify-center bg-[linear-gradient(160deg,#f5f4fd_0%,#e7e6f6_100%)]">
                  <div className="flex h-12 w-12 items-center justify-center rounded-[17px] bg-white/85 text-[#5d5b9d] shadow-[0_6px_16px_rgba(93,91,157,0.10)]">
                    <Moon size={21} strokeWidth={1.8} />
                  </div>
                </div>

                <div className="min-w-0 flex-1 px-4 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#7774a7]">
                        Récupération
                      </p>

                      <p className="mt-1 text-[17px] font-semibold tracking-[-0.02em] text-[#39395f]">
                        Sommeil
                      </p>
                    </div>

                    <ChevronRight
                      size={17}
                      className="mt-1 shrink-0 text-[#aaa9c7] transition-transform group-hover:translate-x-0.5"
                    />
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-[#f1f0fa] px-2.5 py-1 text-[10px] font-semibold text-[#5d5b9d]">
                      {profile?.sleep_quality
                        ? profile.sleep_quality === "tres_bonne"
                          ? "Très bonne qualité"
                          : profile.sleep_quality === "bonne"
                            ? "Bonne qualité"
                            : "À suivre"
                        : "Personnalisation en cours"}
                    </span>

                    <span className="text-[10px] text-[#89909a]">
                      Suivi quotidien
                    </span>
                  </div>

                  <p className="mt-2 text-xs leading-5 text-[#7b898f]">
                    {profile?.sleep_quality
                      ? "Votre qualité de sommeil est prise en compte dans vos recommandations."
                      : "Votre sommeil sera intégré progressivement à votre accompagnement."}
                  </p>
                </div>
              </div>
            </Link>

            {/* Nutrition */}
            <Link
              href="/alimentation"
              className="group relative block overflow-hidden rounded-[26px] border border-[#dfb7aa] bg-white shadow-[0_12px_32px_rgba(111,72,58,0.07)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_38px_rgba(111,72,58,0.11)]"
            >
              <div className="flex items-stretch">
                <div className="flex w-[88px] shrink-0 items-center justify-center bg-[linear-gradient(160deg,#fff5f0_0%,#f8dfd5_100%)]">
                  <div className="flex h-12 w-12 items-center justify-center rounded-[17px] bg-white/85 text-[#b76b58] shadow-[0_6px_16px_rgba(183,107,88,0.10)]">
                    <Utensils size={21} strokeWidth={1.8} />
                  </div>
                </div>

                <div className="min-w-0 flex-1 px-4 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#b76b58]">
                        Alimentation
                      </p>

                      <p className="mt-1 text-[17px] font-semibold tracking-[-0.02em] text-[#77463b]">
                        Nutrition
                      </p>
                    </div>

                    <ChevronRight
                      size={17}
                      className="mt-1 shrink-0 text-[#d29b8b] transition-transform group-hover:translate-x-0.5"
                    />
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-[#fcf0eb] px-2.5 py-1 text-[10px] font-semibold text-[#a35f4d]">
                      {profile?.eating_style
                        ? profile.eating_style
                        : "Profil alimentaire"}
                    </span>

                    {profile?.meals_per_day ? (
                      <span className="rounded-full bg-[#f8f4f1] px-2.5 py-1 text-[10px] font-semibold text-[#8b7770]">
                        {profile.meals_per_day} repas / jour
                      </span>
                    ) : null}
                  </div>

                  <p className="mt-2 text-xs leading-5 text-[#7b898f]">
                    Votre alimentation, vos préférences et vos repas servent à personnaliser vos recommandations.
                  </p>
                </div>
              </div>
            </Link>

            {/* Activité */}
            <Link
              href="/indicateur"
              className="group relative block overflow-hidden rounded-[26px] border border-[#a9d1cb] bg-white shadow-[0_12px_32px_rgba(35,90,84,0.06)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_38px_rgba(35,90,84,0.10)]"
            >
              <div className="flex items-stretch">
                <div className="flex w-[88px] shrink-0 items-center justify-center bg-[linear-gradient(160deg,#ebfaf6_0%,#d7eee8_100%)]">
                  <div className="flex h-12 w-12 items-center justify-center rounded-[17px] bg-white/85 text-[#168f91] shadow-[0_6px_16px_rgba(22,143,145,0.10)]">
                    <Activity size={21} strokeWidth={1.8} />
                  </div>
                </div>

                <div className="min-w-0 flex-1 px-4 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#168f91]">
                        Mouvement
                      </p>

                      <p className="mt-1 text-[17px] font-semibold tracking-[-0.02em] text-[#21585d]">
                        Activité
                      </p>
                    </div>

                    <ChevronRight
                      size={17}
                      className="mt-1 shrink-0 text-[#8bb6b3] transition-transform group-hover:translate-x-0.5"
                    />
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-[#eaf8f6] px-2.5 py-1 text-[10px] font-semibold text-[#168f91]">
                      {profile?.activity_level
                        ? profile.activity_level
                        : "À personnaliser"}
                    </span>

                    <span className="text-[10px] text-[#89909a]">
                      Suivi de progression
                    </span>
                  </div>

                  <p className="mt-2 text-xs leading-5 text-[#7b898f]">
                    Votre niveau d’activité aide à ajuster votre accompagnement et vos recommandations.
                  </p>
                </div>
              </div>
            </Link>

          </div>
        </section>

        <section className="mt-9 border-t border-[#d7e3e0] pt-6">
          <div className="flex items-start gap-4">
            <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#e8f5f2] text-[#287f72]">
              <Sparkles size={17} strokeWidth={1.8} />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#287f72]">
                Votre prochaine étape
              </p>

              <h2 className="mt-1.5 text-lg font-semibold tracking-[-0.02em] text-[#183d48]">
                Continuons ensemble
              </h2>

              <p className="mt-2 max-w-md text-sm leading-6 text-[#66757d]">
                {primaryGoal
                  ? `Votre priorité est ${getGoalLabel(primaryGoal).toLowerCase()}. Votre premier scan permettra à Otavio d’affiner ses recommandations.`
                  : "Votre premier scan permettra à Otavio d’établir vos premiers indicateurs personnalisés."}
              </p>

              <button
                type="button"
                onClick={() => router.push("/scanner")}
                className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-[#168f91] transition hover:gap-2.5"
              >
                Commencer mon scan
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        </section>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-[#e7e2d9]/80 bg-[#fffdf9]/88 shadow-[0_-12px_35px_rgba(70,55,40,0.07)] backdrop-blur-2xl">
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
            className="relative -mt-7 flex h-16 w-16 items-center justify-center justify-self-center rounded-full bg-[linear-gradient(135deg,#123544_0%,#1d596b_100%)] text-white shadow-[0_14px_32px_rgba(18,53,68,0.28)] ring-4 ring-[#fffdf9] transition hover:scale-[1.03]"
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
