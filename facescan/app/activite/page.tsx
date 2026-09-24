"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Dumbbell,
  Footprints,
  Sparkles,
  Timer,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { buildOtavioDailyTasks } from "@/lib/otavio-daily";
import { registerOtavioDailyAction } from "@/lib/otavio-streak";

type Profile = {
  activity_level: string | null;
};

type ActivityScan = {
  fatigue: number | null;
  equilibre: number | null;
};

const activityLabels: Record<string, string> = {
  sedentary: "Sédentaire",
  sedentaire: "Sédentaire",
  low: "Peu actif",
  faible: "Peu actif",
  moderate: "Actif",
  modere: "Actif",
  active: "Très actif",
  actif: "Très actif",
  very_active: "Très actif",
  tres_actif: "Très actif",
};

function getActivityLabel(value: string | null) {
  if (!value) return "À personnaliser";
  return activityLabels[value] ?? value;
}

function getActivityDescription(value: string | null) {
  switch (value) {
    case "sedentary":
    case "sedentaire":
      return "Otavio peut vous aider à remettre davantage de mouvement dans votre quotidien, progressivement.";
    case "low":
    case "faible":
      return "Votre niveau d’activité laisse de la place pour augmenter progressivement le mouvement au quotidien.";
    case "moderate":
    case "modere":
      return "Votre niveau d’activité constitue une bonne base pour structurer une routine régulière.";
    case "active":
    case "actif":
      return "Vous avez déjà une activité régulière. Otavio peut vous aider à mieux structurer votre récupération et votre progression.";
    case "very_active":
    case "tres_actif":
      return "Votre activité est élevée. L’objectif est surtout de préserver l’équilibre entre effort, récupération et régularité.";
    default:
      return "Votre niveau d’activité sera utilisé pour personnaliser progressivement vos recommandations.";
  }
}

export default function ActivitePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [scan, setScan] = useState<ActivityScan | null>(null);
  const [loading, setLoading] = useState(true);
  const [activityCompleted, setActivityCompleted] = useState(false);
  const [activityCompleting, setActivityCompleting] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      try {
        const supabase = createClient();

        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setProfile({ activity_level: null });
          return;
        }

        const { data } = await supabase
          .from("profiles")
          .select("activity_level")
          .eq("id", user.id)
          .maybeSingle();

        setProfile((data ?? {}) as Profile);

        let latestScan: any = null;

        try {
          const { data: scans, error: scansError } = await supabase
            .from("scans")
            .select("id, created_at, score, indicators")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .limit(1);

          if (scansError) throw scansError;
          latestScan = Array.isArray(scans) ? scans[0] : null;
        } catch {
          try {
            const rawScans = localStorage.getItem("facescan-scans");
            const scans = rawScans ? JSON.parse(rawScans) : [];

            latestScan = Array.isArray(scans)
              ? [...scans].sort(
                  (a, b) =>
                    new Date(b?.date ?? 0).getTime() -
                    new Date(a?.date ?? 0).getTime()
                )[0]
              : null;
          } catch {
            latestScan = null;
          }
        }

        if (latestScan?.indicators) {
          setScan({
            fatigue:
              typeof latestScan.indicators.fatigue === "number"
                ? latestScan.indicators.fatigue
                : null,
            equilibre:
              typeof latestScan.indicators.equilibre === "number"
                ? latestScan.indicators.equilibre
                : null,
          });
        } else {
          setScan(null);
        }
      } catch {
        setProfile({ activity_level: null });
        setScan(null);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  const activity = profile?.activity_level ?? null;
  const fatigueScore = scan?.fatigue ?? null;
  const balanceScore = scan?.equilibre ?? null;

  const recoveryNeed =
    (fatigueScore !== null && fatigueScore < 70) ||
    (balanceScore !== null && balanceScore < 70);

  const activityTask =
    buildOtavioDailyTasks(
      profile ?? {},
      scan
        ? {
            indicators: {
              fatigue: fatigueScore,
              equilibre: balanceScore,
            },
          }
        : null,
      new Date()
    ).find((task) => task.category === "activité") ?? {
      task_key: "activity_daily",
      title: recoveryNeed
        ? "Bouger doucement aujourd’hui"
        : "Entretenir mon mouvement",
      description: recoveryNeed
        ? "Privilégiez une courte marche ou quelques mouvements doux plutôt qu’une séance exigeante si vous vous sentez fatigué."
        : "Conservez aujourd’hui un peu de mouvement en fonction de votre niveau habituel et de votre disponibilité.",
      category: "activité",
      priority: recoveryNeed ? "high" : "low",
    };

  useEffect(() => {
    async function loadActivityCompletion() {
      try {
        const supabase = createClient();

        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) return;

        const todayKey = new Date().toISOString().slice(0, 10);

        const { data, error } = await supabase
          .from("otavio_daily_tasks")
          .select("task_key, completed")
          .eq("user_id", user.id)
          .eq("task_date", todayKey)
          .eq("task_key", activityTask.task_key)
          .eq("completed", true)
          .maybeSingle();

        if (!error) {
          setActivityCompleted(Boolean(data));
        }
      } catch (error) {
        console.error("Activity completion loading error:", error);
      }
    }

    loadActivityCompletion();
  }, [activityTask.task_key]);

  const markActivityComplete = async () => {
    if (activityCompleted || activityCompleting) return;

    setActivityCompleting(true);

    try {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = "/connexion";
        return;
      }

      const todayKey = new Date().toISOString().slice(0, 10);

      const { error } = await supabase
        .from("otavio_daily_tasks")
        .upsert(
          {
            user_id: user.id,
            task_date: todayKey,
            task_key: activityTask.task_key,
            title: activityTask.title,
            description: activityTask.description,
            completed: true,
            completed_at: new Date().toISOString(),
          },
          {
            onConflict: "user_id,task_date,task_key",
          }
        );

      if (error) throw error;

      await registerOtavioDailyAction("activite_program");
      setActivityCompleted(true);
    } catch (error) {
      console.error("Activity completion error:", error);
    } finally {
      setActivityCompleting(false);
    }
  };

  if (loading) {
    return (
      <main className="app-background flex min-h-screen items-center justify-center">
        <div className="text-sm font-medium text-white/75">
          Préparation de votre programme activité…
        </div>
      </main>
    );
  }

  const priorityLabel =
    recoveryNeed
      ? "Privilégier la récupération"
      : activity === "sedentary" ||
          activity === "sedentaire" ||
          activity === "low" ||
          activity === "faible"
        ? "Construire une routine régulière"
        : "Maintenir une activité régulière";

  const priorityDescription =
    fatigueScore !== null && fatigueScore < 65
      ? `Votre indicateur visuel de fatigue est de ${Math.round(fatigueScore)}/100. Otavio privilégie aujourd’hui des efforts modérés et davantage de récupération.`
      : balanceScore !== null && balanceScore < 70
        ? `Votre indicateur visuel d’équilibre est de ${Math.round(balanceScore)}/100. Otavio privilégie une activité régulière et adaptée plutôt qu’une intensification.`
        : "Otavio combine votre niveau d’activité déclaré avec les repères disponibles pour ajuster progressivement vos recommandations.";

  return (
    <main className="app-background min-h-screen pb-12 text-[#171717]">
      <div className="mx-auto max-w-3xl px-5 pt-6">
        <header className="mb-7 flex items-center justify-between">
          <Link
            href="/"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[#e8ebe9] bg-white shadow-[0_6px_18px_rgba(35,55,60,0.05)] transition hover:-translate-y-0.5"
            aria-label="Retour à l'accueil"
          >
            <ArrowLeft size={19} />
          </Link>

          <div className="text-center">
            <p className="text-[11px] uppercase tracking-[0.18em] text-[#7b8580]">
              Otavio
            </p>
            <h1 className="text-xl font-semibold text-white">
              Activité
            </h1>
          </div>

          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#d9f5ef]">
            <Activity size={18} className="text-[#287f72]" />
          </div>
        </header>

        <section className="relative overflow-hidden rounded-[28px] bg-[linear-gradient(135deg,#0b5876_0%,#087ea4_48%,#12a6a6_72%,#48b881_100%)] p-6 text-white shadow-[0_22px_52px_rgba(8,126,164,0.18)] sm:p-7">
            <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-[#42cfc2]/22 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-16 left-8 h-36 w-36 rounded-full bg-[#ff8066]/18 blur-3xl" />
          <div className="mb-5 flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/10">
                <Activity size={21} />
              </div>

              <div className="min-w-0">
                <p className="text-xs uppercase tracking-wider text-white/60">
                  Votre programme
                </p>
                <h2 className="text-xl font-semibold leading-tight">
                  Une routine adaptée à votre niveau d’activité
                </h2>
              </div>
            </div>

            <div className="relative h-[78px] w-[78px] shrink-0 overflow-hidden rounded-[22px] border border-white/20 bg-white/10 shadow-[0_10px_28px_rgba(0,0,0,0.16)]">
              <video
                src="/otavio/video-quotidien.mp4"
                autoPlay
                muted
                loop
                playsInline
                className="absolute inset-0 h-full w-full object-cover"
                aria-label="Otavio vous accompagne dans votre programme activité"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent" />
            </div>
          </div>

          <p className="mb-6 text-sm leading-6 text-white/75">
            {priorityDescription}
          </p>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-white/10 p-4">
              <p className="mb-1 text-xs text-white/60">
                Votre niveau actuel
              </p>
              <p className="text-xl font-semibold">
                {getActivityLabel(activity)}
              </p>
            </div>

            <div className="rounded-2xl bg-white/10 p-4">
              <p className="mb-1 text-xs text-white/60">
                Priorité actuelle
              </p>
              <p className="text-sm font-medium leading-5">
                {priorityLabel}
              </p>
            </div>
          </div>
        </section>

        <section className="mt-5 grid grid-cols-3 gap-3">
          <div className="rounded-2xl border border-[#8fd8d1] bg-[linear-gradient(145deg,#ffffff_0%,#e6f8f4_100%)] p-4 shadow-[0_8px_22px_rgba(35,70,60,0.04)]">
            <Footprints size={18} className="mb-3 text-[#287f72]" />
            <p className="text-xs text-[#8a928e]">Mouvement</p>
            <p className="mt-1 font-semibold">
              {recoveryNeed
                ? "Mouvement doux"
                : activity === "sedentary" ||
                    activity === "sedentaire" ||
                    activity === "low" ||
                    activity === "faible"
                  ? "À renforcer"
                  : "À maintenir"}
            </p>
          </div>

          <div className="rounded-2xl border border-[#b8afff] bg-[linear-gradient(145deg,#ffffff_0%,#eeeaff_100%)] p-4 shadow-[0_8px_22px_rgba(82,75,130,0.04)]">
            <Dumbbell size={18} className="mb-3 text-[#756bd4]" />
            <p className="text-xs text-[#8a928e]">Sport</p>
            <p className="mt-1 font-semibold">
              {fatigueScore !== null && fatigueScore < 65
                ? "Intensité modérée"
                : activity === "sedentary" ||
                    activity === "sedentaire" ||
                    activity === "low" ||
                    activity === "faible"
                  ? "Progressif"
                  : "À structurer"}
            </p>
          </div>

          <div className="rounded-2xl border border-[#ffb19d] bg-[linear-gradient(145deg,#ffffff_0%,#fff0eb_100%)] p-4 shadow-[0_8px_22px_rgba(120,75,60,0.04)]">
            <Timer size={18} className="mb-3 text-[#b76b58]" />
            <p className="text-xs text-[#8a928e]">Régularité</p>
            <p className="mt-1 font-semibold">
              {recoveryNeed
                ? "Priorité récupération"
                : "À consolider"}
            </p>
          </div>
        </section>

        <section className="mt-7">
          <div className="mb-3">
            <p className="text-xs uppercase tracking-wider text-[#89918d]">
              Votre niveau
            </p>
            <h2 className="mt-1 text-xl font-semibold">
              {getActivityLabel(activity)}
            </h2>
          </div>

          <div className="rounded-[26px] border border-[#9fd8d0] bg-[linear-gradient(145deg,#ffffff_0%,#eaf8f5_100%)] p-5 shadow-[0_12px_30px_rgba(30,70,65,0.045)]">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#c9f2eb] text-[#087ea4]">
                <Footprints size={19} />
              </div>

              <div className="min-w-0">
                <p className="text-sm font-semibold text-[#183d48]">
                  Votre activité aujourd’hui
                </p>
                <p className="mt-2 text-sm leading-6 text-[#718088]">
                  {getActivityDescription(activity)}
                </p>

                {scan && (
                  <p className="mt-3 text-[11px] leading-5 text-[#879596]">
                    Repères du dernier scan : fatigue visuelle{" "}
                    {fatigueScore !== null ? `${Math.round(fatigueScore)}/100` : "—"}
                    {" · "}
                    équilibre visuel{" "}
                    {balanceScore !== null ? `${Math.round(balanceScore)}/100` : "—"}.
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-7 rounded-[26px] border border-[#9fd8d0] bg-[linear-gradient(145deg,#ffffff_0%,#eaf8f5_100%)] p-5 shadow-[0_12px_30px_rgba(30,70,65,0.045)]">
          <div className="flex items-start gap-3">
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${
                activityCompleted ? "bg-[#c6efe5]" : "bg-[#c9f2eb]"
              }`}
            >
              <CheckCircle2 size={18} className="text-[#087ea4]" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-xs uppercase tracking-wider text-[#89918d]">
                Action du jour
              </p>
              <h2 className="mt-1 text-lg font-semibold text-[#183d48]">
                {activityTask.title}
              </h2>
              <p className="mt-2 text-sm leading-6 text-[#718088]">
                {activityTask.description}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={markActivityComplete}
            disabled={activityCompleted || activityCompleting}
            className={`mt-4 flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3.5 text-sm font-semibold transition ${
              activityCompleted
                ? "border border-[#78d2c8] bg-[#dff8f2] text-[#087ea4]"
                : "bg-[linear-gradient(135deg,#0b5876_0%,#087ea4_48%,#12a6a6_72%,#48b881_100%)] text-white shadow-[0_10px_26px_rgba(8,126,164,0.16)] hover:-translate-y-0.5"
            } disabled:cursor-default disabled:opacity-90`}
          >
            <CheckCircle2 size={17} />
            {activityCompleted
              ? "Activité suivie"
              : activityCompleting
                ? "Enregistrement…"
                : "J’ai suivi cette activité"}
          </button>
        </section>

        <section className="mt-7 rounded-[26px] border border-[#9fd8d0] bg-[linear-gradient(145deg,#ffffff_0%,#eaf8f5_100%)] p-5 shadow-[0_12px_30px_rgba(30,70,65,0.045)]">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#c9f2eb] text-[#087ea4]">
              <Sparkles size={18} />
            </div>

            <div className="min-w-0">
              <p className="text-sm font-semibold text-[#183d48]">
                Ce qu’Otavio peut suivre
              </p>

              <p className="mt-2 text-xs leading-5 text-[#718088]">
                Votre fréquence de pratique, votre mouvement quotidien, votre
                récupération et votre régularité pourront progressivement
                enrichir votre accompagnement.
              </p>
            </div>
          </div>

          <Link
            href="/conseils"
            className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-[#168f91]"
          >
            Voir mes conseils
            <ArrowRight size={15} />
          </Link>
        </section>

        <p className="mt-5 px-2 text-[11px] leading-5 text-[#8a928e]">
          Les recommandations d’activité proposées par Otavio sont des conseils
          de bien-être et ne remplacent pas l’avis d’un professionnel de santé.
        </p>
      </div>
    </main>
  );
}
