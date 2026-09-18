"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Check,
  Droplets,
  Sparkles,
  SunMedium,
  Clock3,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  buildOtavioDailyTasks,
  type OtavioDailyScan,
} from "@/lib/otavio-daily";

type Profile = {
  goals?: string[] | null;
  hydration_level?: string | null;
  activity_level?: string | null;
  activity_frequency?: string | null;
  bedtime?: string | null;
  wake_time?: string | null;
  sleep_duration?: number | null;
  sleep_quality?: string | null;
  eating_style?: string | null;
  meals_per_day?: number | null;
};

type HydrationDay = {
  day: number;
  title: string;
  task: {
    task_key: string;
    title: string;
    description: string;
    priority: "high" | "medium" | "low";
  };
};

function addDays(date: Date, amount: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

export default function HydratationPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [scan, setScan] = useState<OtavioDailyScan | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(1);
  const [completedActions, setCompletedActions] = useState<string[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();

        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          const { data } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .maybeSingle();

          setProfile(data ?? {});
        } else {
          setProfile({});
        }

        try {
          const rawScans = localStorage.getItem("facescan-scans");
          const scans = rawScans ? JSON.parse(rawScans) : [];

          const latestScan = Array.isArray(scans)
            ? [...scans].sort(
                (a, b) =>
                  new Date(b?.date ?? 0).getTime() -
                  new Date(a?.date ?? 0).getTime()
              )[0]
            : null;

          setScan(
            latestScan
              ? {
                  score:
                    typeof latestScan.score === "number"
                      ? latestScan.score
                      : null,
                  indicators: latestScan.indicators ?? null,
                }
              : null
          );
        } catch {
          setScan(null);
        }

        try {
          const stored =
            localStorage.getItem("facescan-hydration-actions") || "[]";
          const parsed = JSON.parse(stored);
          setCompletedActions(Array.isArray(parsed) ? parsed : []);
        } catch {
          setCompletedActions([]);
        }
      } catch {
        setProfile({});
        setScan(null);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const plan = useMemo<HydrationDay[]>(() => {
    const baseDate = new Date();

    return Array.from({ length: 7 }, (_, index) => {
      const dayNumber = index + 1;
      const date = addDays(baseDate, index);

      const tasks = buildOtavioDailyTasks(profile ?? {}, scan, date);
      const hydrationTask = tasks.find(
        (task) => task.category === "hydratation"
      );

      return {
        day: dayNumber,
        title:
          dayNumber === 1
            ? "Installer un premier repère"
            : dayNumber === 7
              ? "Ancrer la routine"
              : "Maintenir une hydratation régulière",
        task:
          hydrationTask ?? {
            task_key: `hydration-fallback-${dayNumber}`,
            title: "Créer un réflexe hydratation",
            description:
              "Associez une pause hydratation à deux moments fixes de votre journée et gardez une bouteille accessible.",
            priority: "medium",
          },
      };
    });
  }, [profile, scan]);

  const today = plan[selectedDay - 1] ?? plan[0];
  const hydrationScore = scan?.indicators?.hydratation ?? null;

  const completedCount = plan.filter((day) =>
    completedActions.includes(`${day.day}-${day.task.task_key}`)
  ).length;

  const toggleAction = (day: HydrationDay) => {
    const key = `${day.day}-${day.task.task_key}`;

    setCompletedActions((current) => {
      const next = current.includes(key)
        ? current.filter((item) => item !== key)
        : [...current, key];

      localStorage.setItem(
        "facescan-hydration-actions",
        JSON.stringify(next)
      );

      return next;
    });
  };

  if (loading) {
    return (
      <main className="app-background flex min-h-screen items-center justify-center">
        <div className="text-sm text-[#777]">
          Préparation de votre programme…
        </div>
      </main>
    );
  }

  const currentDone = completedActions.includes(
    `${today.day}-${today.task.task_key}`
  );

  return (
    <main className="app-background min-h-screen pb-12 text-[#171717]">
      <div className="mx-auto max-w-3xl px-5 pt-6">
        <header className="mb-7 flex items-center justify-between">
          <Link
            href="/conseils"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[#e8ebe9] bg-white shadow-[0_6px_18px_rgba(35,55,60,0.05)] transition hover:-translate-y-0.5"
            aria-label="Retour aux conseils"
          >
            <ArrowLeft size={19} />
          </Link>

          <div className="text-center">
            <p className="text-[11px] uppercase tracking-[0.18em] text-[#7b8580]">
              Otavio
            </p>
            <h1 className="text-xl font-semibold text-white">
              Hydratation
            </h1>
          </div>

          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e9f8f5]">
            <Droplets size={18} className="text-[#287f86]" />
          </div>
        </header>

        <section className="rounded-[28px] bg-[#163b43] p-6 text-white shadow-[0_20px_48px_rgba(22,59,67,0.16)] sm:p-7">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/10">
                <Droplets size={21} />
              </div>

              <div className="min-w-0">
                <p className="text-xs uppercase tracking-wider text-white/60">
                  Votre programme
                </p>
                <h2 className="text-xl font-semibold leading-tight">
                  Une routine adaptée à votre hydratation
                </h2>
              </div>
            </div>

            <div className="relative h-[78px] w-[78px] shrink-0 overflow-hidden rounded-[22px] border border-white/20 bg-white/10 shadow-[0_10px_28px_rgba(0,0,0,0.16)]">
              <video
                src="/otavio/video-sommeil.mp4"
                autoPlay
                muted
                loop
                playsInline
                className="absolute inset-0 h-full w-full object-cover"
                aria-label="Otavio vous accompagne dans votre programme hydratation"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent" />
            </div>
          </div>

          <p className="mb-6 text-sm leading-6 text-white/75">
            Otavio adapte vos actions d’hydratation à votre profil et aux
            observations de votre dernier scan.
          </p>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-white/10 p-4">
              <p className="mb-1 text-xs text-white/60">
                Dernier indicateur
              </p>
              <div className="flex items-end gap-2">
                <span className="text-3xl font-semibold tracking-[-0.04em]">
                  {hydrationScore ?? "—"}
                </span>
                <span className="mb-1 text-xs text-white/40">/ 100</span>
              </div>
            </div>

            <div className="rounded-2xl bg-white/10 p-4">
              <p className="mb-1 text-xs text-white/60">
                Progression du programme
              </p>
              <p className="text-sm font-medium">
                {completedCount}/7 jours suivis
              </p>
            </div>
          </div>
        </section>

        <section className="mt-5 grid grid-cols-3 gap-3">
          <div className="rounded-2xl border border-[#e2ebeb] bg-white p-4 shadow-[0_8px_22px_rgba(35,70,75,0.035)]">
            <Droplets size={18} className="mb-3 text-[#287f86]" />
            <p className="text-xs text-[#8a928e]">Routine</p>
            <p className="mt-1 font-semibold">Toute la journée</p>
          </div>

          <div className="rounded-2xl border border-[#e2ebeb] bg-white p-4 shadow-[0_8px_22px_rgba(35,70,75,0.035)]">
            <Clock3 size={18} className="mb-3 text-[#287f86]" />
            <p className="text-xs text-[#8a928e]">Approche</p>
            <p className="mt-1 font-semibold">Progressive</p>
          </div>

          <div className="rounded-2xl border border-[#e2ebeb] bg-white p-4 shadow-[0_8px_22px_rgba(35,70,75,0.035)]">
            <SunMedium size={18} className="mb-3 text-[#287f86]" />
            <p className="text-xs text-[#8a928e]">Programme</p>
            <p className="mt-1 font-semibold">7 jours</p>
          </div>
        </section>

        <section className="mt-7">
          <div className="mb-3 flex items-end justify-between">
            <div>
              <p className="text-xs uppercase tracking-wider text-[#89918d]">
                Programme du jour
              </p>
              <h2 className="mt-1 text-xl font-semibold">
                {today.task.title}
              </h2>
            </div>

            <div className="text-xs text-[#89918d]">
              Jour {selectedDay}/7
            </div>
          </div>

          <button
            type="button"
            onClick={() => toggleAction(today)}
            className={`group w-full rounded-[24px] border p-5 text-left transition ${
              currentDone
                ? "border-[#b8dcd7] bg-[#effaf7]"
                : "border-[#dfe8e7] bg-white shadow-[0_12px_30px_rgba(35,70,75,0.05)] hover:-translate-y-0.5 hover:shadow-[0_16px_34px_rgba(35,70,75,0.07)]"
            }`}
          >
            <div className="flex items-start gap-4">
              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
                  currentDone ? "bg-[#d7eee8]" : "bg-[#eaf8f5]"
                }`}
              >
                {currentDone ? (
                  <Check size={19} className="text-[#287f86]" />
                ) : (
                  <Droplets size={19} className="text-[#287f86]" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#287f86]">
                      {today.title}
                    </p>
                    <h3
                      className={`mt-1 text-[16px] font-semibold ${
                        currentDone ? "text-[#287f72]" : "text-[#171717]"
                      }`}
                    >
                      {today.task.title}
                    </h3>
                  </div>

                  <span className="shrink-0 rounded-full bg-[#edf7f7] px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.08em] text-[#287f86]">
                    {today.task.priority === "high"
                      ? "Priorité"
                      : today.task.priority === "medium"
                        ? "À suivre"
                        : "À maintenir"}
                  </span>
                </div>

                <p className="mt-2 text-sm leading-6 text-[#737a76]">
                  {today.task.description}
                </p>

                <p className="mt-4 text-[10px] font-medium text-[#89918d]">
                  Appuyez pour marquer cette action comme suivie
                </p>
              </div>
            </div>
          </button>
        </section>

        <section className="mt-7">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs uppercase tracking-wider text-[#89918d]">
              Votre semaine
            </p>

            <span className="text-[10px] font-medium text-[#287f86]">
              {completedCount}/7 suivis
            </span>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2">
            {plan.map((day) => {
              const done = completedActions.includes(
                `${day.day}-${day.task.task_key}`
              );

              return (
                <button
                  key={day.day}
                  type="button"
                  onClick={() => setSelectedDay(day.day)}
                  className={`relative min-w-[64px] rounded-2xl border px-3 py-3 text-center transition ${
                    selectedDay === day.day
                      ? "border-[#163b43] bg-[#163b43] text-white"
                      : "border-[#e8ebe9] bg-white text-[#555]"
                  }`}
                >
                  {done && (
                    <span className="absolute right-1.5 top-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#287f86] text-white">
                      <Check size={9} strokeWidth={2.5} />
                    </span>
                  )}

                  <div className="text-[10px] uppercase tracking-wider opacity-60">
                    Jour
                  </div>
                  <div className="mt-0.5 text-lg font-semibold">{day.day}</div>
                </button>
              );
            })}
          </div>
        </section>

        <section className="mt-7 rounded-[24px] border border-[#e1ebeb] bg-white p-5 shadow-[0_10px_28px_rgba(35,70,75,0.04)]">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eaf8f5]">
              <Sparkles size={18} className="text-[#287f86]" />
            </div>

            <div>
              <h2 className="font-semibold">Personnalisation Otavio</h2>
              <p className="text-xs text-[#8a928e]">
                Pourquoi cette recommandation vous est proposée
              </p>
            </div>
          </div>

          <div className="space-y-2 text-sm leading-6 text-[#666d69]">
            {hydrationScore !== null && (
              <div className="flex items-start gap-2">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#287f86]" />
                <span>
                  Votre dernier scan présente un indicateur visuel
                  d’hydratation de <strong>{hydrationScore}/100</strong>.
                </span>
              </div>
            )}

            {profile?.hydration_level && (
              <div className="flex items-start gap-2">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#287f86]" />
                <span>
                  Votre niveau d’hydratation renseigné dans votre profil est
                  pris en compte.
                </span>
              </div>
            )}

            {profile?.activity_level && (
              <div className="flex items-start gap-2">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#287f86]" />
                <span>
                  Votre niveau d’activité peut influencer les moments auxquels
                  Otavio vous propose de renforcer vos repères.
                </span>
              </div>
            )}

            {profile?.goals?.includes("hydratation") && (
              <div className="flex items-start gap-2">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#287f86]" />
                <span>
                  L’hydratation fait partie de vos objectifs déclarés.
                </span>
              </div>
            )}

            {hydrationScore === null &&
              !profile?.hydration_level &&
              !profile?.activity_level &&
              !profile?.goals?.includes("hydratation") && (
                <p>
                  Complétez votre profil et réalisez un scan pour permettre à
                  Otavio d’affiner progressivement ce programme.
                </p>
              )}
          </div>
        </section>

        <p className="mt-5 px-2 text-[11px] leading-5 text-[#8a928e]">
          L’indicateur d’hydratation de FaceScan correspond à une observation
          visuelle et ne mesure pas directement l’hydratation corporelle. Les
          recommandations proposées sont des conseils de bien-être.
        </p>
      </div>
    </main>
  );
}
