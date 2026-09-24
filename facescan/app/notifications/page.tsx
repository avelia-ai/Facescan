"use client";

import { useEffect, useMemo, useState } from "react";

import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import {
  Activity,
  ArrowLeft,
  Bell,
  BellOff,
  Check,
  ChevronRight,
  Droplets,
  Moon,
  ScanFace,
  Sparkles,
  TrendingUp,
  UserRound,
} from "lucide-react";

const baseNotifications = [
  {
    id: 1,
    icon: ScanFace,
    title: "Votre prochain scan",
    text: "Votre suivi mérite une nouvelle analyse pour comparer votre évolution.",
    time: "Aujourd’hui",
    type: "Suivi",
  },
  {
    id: 2,
    icon: Droplets,
    title: "Hydratation à surveiller",
    text: "Votre indicateur d’hydratation mérite actuellement une attention particulière.",
    time: "Aujourd’hui",
    type: "Tendance",
  },
  {
    id: 3,
    icon: TrendingUp,
    title: "Votre progression",
    text: "Comparez vos scans pour suivre les tendances de vos indicateurs.",
    time: "Récent",
    type: "Progression",
  },
  {
    id: 4,
    icon: Sparkles,
    title: "Un conseil pour vous",
    text: "Découvrez une recommandation adaptée à vos priorités actuelles.",
    time: "Récent",
    type: "Conseil",
  },
  {
    id: 5,
    icon: Moon,
    title: "Votre récupération",
    text: "Votre indicateur de fatigue peut être suivi au fil de vos prochaines analyses.",
    time: "Récent",
    type: "Suivi",
  },
];

export default function NotificationsPage() {
  const [latestScan, setLatestScan] = useState<{
    score: number | null;
    date: string;
    indicators: {
      peau: number;
      hydratation: number;
      fatigue: number;
      equilibre: number;
    };
  } | null>(null);

  const [userGoals, setUserGoals] = useState<string[]>([]);
  const [readIds, setReadIds] = useState<number[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      let loadedScan = false;
      let loadedGoals = false;

      try {
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();

        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          const [{ data: scans, error: scansError }, { data: profile, error: profileError }] =
            await Promise.all([
              supabase
                .from("scans")
                .select("id, created_at, score, indicators")
                .eq("user_id", user.id)
                .order("created_at", { ascending: false })
                .limit(1),
              supabase
                .from("profiles")
                .select("goals")
                .eq("id", user.id)
                .maybeSingle(),
            ]);

          if (!scansError) {
            const scan = Array.isArray(scans) ? scans[0] : null;

            if (scan?.indicators && !cancelled) {
              setLatestScan({
                score: typeof scan.score === "number" ? scan.score : null,
                date:
                  typeof scan.created_at === "string"
                    ? scan.created_at
                    : new Date().toISOString(),
                indicators: scan.indicators,
              });
              loadedScan = true;
            }
          }

          if (
            !profileError &&
            Array.isArray(profile?.goals) &&
            !cancelled
          ) {
            setUserGoals(
              profile.goals.filter(
                (goal: unknown): goal is string => typeof goal === "string"
              )
            );
            loadedGoals = true;
          }
        }
      } catch (error) {
        console.error("Notifications Supabase error:", error);
      }

      if (!loadedScan && !cancelled) {
        try {
          const storedScans = localStorage.getItem("facescan-scans");
          const parsed = storedScans ? JSON.parse(storedScans) : [];

          if (Array.isArray(parsed) && parsed[0]?.indicators) {
            setLatestScan({
              score:
                typeof parsed[0].score === "number" ? parsed[0].score : null,
              date:
                typeof parsed[0].date === "string"
                  ? parsed[0].date
                  : new Date().toISOString(),
              indicators: parsed[0].indicators,
            });
          } else {
            setLatestScan(null);
          }
        } catch {
          setLatestScan(null);
        }
      }

      if (!loadedGoals && !cancelled) {
        try {
          const storedGoals = localStorage.getItem("facescan-goals");
          const parsed = storedGoals ? JSON.parse(storedGoals) : [];

          setUserGoals(Array.isArray(parsed) ? parsed : []);
        } catch {
          setUserGoals([]);
        }
      }

      try {
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();

        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user && !cancelled) {
          const storedRead = localStorage.getItem(
            `facescan-read-notifications-${user.id}`
          );

          if (storedRead) {
            const parsed = JSON.parse(storedRead);

            if (Array.isArray(parsed)) {
              setReadIds(parsed);
            }
          }
        }
      } catch {
        if (!cancelled) setReadIds([]);
      }
    }

    loadData();

    return () => {
      cancelled = true;
    };
  }, []);

  const notifications = useMemo(() => {
    return baseNotifications.map((item) => {
      let text = item.text;

      if (item.id === 2 && latestScan) {
        text =
          latestScan.indicators.hydratation < 70
            ? `Votre indicateur d’hydratation est actuellement à ${latestScan.indicators.hydratation}/100.`
            : `Votre hydratation est actuellement à ${latestScan.indicators.hydratation}/100. Continuez à maintenir une bonne régularité.`;
      }

      if (item.id === 3 && latestScan) {
        text =
          latestScan.score !== null
            ? `Votre dernier score global est de ${latestScan.score}/100. Vos prochains scans permettront de suivre son évolution.`
            : "Votre dernier scan est enregistré. Vos prochains scans permettront de suivre votre évolution.";
      }

      if (item.id === 5 && latestScan) {
        text = `Votre indicateur associé à la fatigue est actuellement à ${latestScan.indicators.fatigue}/100.`;
      }

      if (
        item.id === 4 &&
        userGoals.length > 0
      ) {
        const goalNames: Record<string, string> = {
          peau: "Peau",
          hydratation: "Hydratation",
          recuperation: "Récupération",
          equilibre: "Équilibre",
        };

        const goalName = goalNames[userGoals[0]];

        if (goalName) {
          text = `Votre priorité actuelle est la ${goalName.toLowerCase()}. Retrouvez les conseils adaptés à votre suivi.`;
        }
      }

      return {
        ...item,
        unread: !readIds.includes(item.id),
        text,
      };
    });
  }, [latestScan, userGoals, readIds]);

  const daysSinceLastScan = latestScan?.date
    ? Math.floor(
        (Date.now() - new Date(latestScan.date).getTime()) /
          (1000 * 60 * 60 * 24)
      )
    : null;

  const scanFrequency = (() => {
    if (typeof window === "undefined") return 7;

    const stored = localStorage.getItem("facescan-scan-frequency");
    const value = Number(stored);

    return [3, 7, 14, 30].includes(value) ? value : 7;
  })();

  const shouldRemindForScan =
    daysSinceLastScan === null || daysSinceLastScan >= scanFrequency;

  const dynamicNotifications = useMemo(() => {
    if (!shouldRemindForScan) {
      return notifications;
    }

    return [
      {
        id: 99,
        icon: ScanFace,
        title: "Votre prochain scan",
        text:
          daysSinceLastScan === null
            ? "Effectuez votre premier scan pour commencer votre suivi."
            : `Cela fait ${daysSinceLastScan} jours depuis votre dernier scan. C’est un bon moment pour comparer votre évolution.`,
        time: "Aujourd’hui",
        type: "Suivi",
        unread: !readIds.includes(99),
      },
      ...notifications.filter((item) => item.id !== 1),
    ];
  }, [notifications, shouldRemindForScan, daysSinceLastScan, readIds]);

  const unreadCount = dynamicNotifications.filter(
    (item) => item.unread
  ).length;

  const saveReadIds = async (ids: number[]) => {
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      localStorage.setItem(
        `facescan-read-notifications-${user.id}`,
        JSON.stringify(ids)
      );
    } catch (error) {
      console.error("Notification read state error:", error);
    }
  };

  const markAllRead = () => {
    const ids = dynamicNotifications.map((item) => item.id);
    setReadIds(ids);
    void saveReadIds(ids);
  };

  const markRead = (id: number) => {
    const updated = Array.from(new Set([...readIds, id]));
    setReadIds(updated);
    void saveReadIds(updated);
  };

  return (
    <main className="app-background min-h-screen text-[#17202a] pb-28">
      <div className="mx-auto w-full max-w-5xl px-5 sm:px-8">
        <header className="flex items-center justify-between pt-7 sm:pt-9">
          <div className="flex items-center gap-3">
            <Link
              href="/profil"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[#c4dde1] bg-white shadow-[0_8px_25px_rgba(30,55,60,0.06)]"
              aria-label="Retour au profil"
            >
              <ArrowLeft size={18} strokeWidth={1.8} />
            </Link>

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8a867f]">
                Otavio
              </p>
              <h1 className="mt-1 text-2xl font-semibold tracking-[-0.03em] text-white">
                Notifications
              </h1>
            </div>
          </div>

          <button
            type="button"
            onClick={markAllRead}
            className="hidden items-center gap-2 rounded-full border border-[#c4dde1] bg-white px-4 py-3 text-[11px] font-medium text-[#587174] shadow-[0_6px_20px_rgba(30,55,60,0.05)] sm:flex"
          >
            <Check size={15} strokeWidth={1.8} />
            Tout lire
          </button>
        </header>

        <section className="mt-8 rounded-[28px] bg-gradient-to-br from-[#0b5876] via-[#087ea4] to-[#12a6a6] p-6 text-white shadow-[0_24px_60px_rgba(23,76,87,0.22)] shadow-[0_20px_60px_rgba(0,0,0,0.12)] sm:p-8">
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
            <div>
              <div className="flex items-center gap-2 text-white/45">
                <Bell size={17} strokeWidth={1.8} />
                <span className="text-[10px] font-semibold uppercase tracking-[0.18em]">
                  Centre de notifications
                </span>
              </div>

              <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em]">
                Restez au bon rythme.
              </h2>

              <p className="mt-3 max-w-xl text-[13px] leading-6 text-white/50">
                Otavio peut vous rappeler vos suivis et vous signaler les
                évolutions importantes de votre historique.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/6 px-5 py-4">
              <p className="text-[9px] uppercase tracking-[0.16em] text-white/40">
                Non lues
              </p>
              <p className="mt-1 text-3xl font-semibold">{unreadCount}</p>
            </div>
          </div>
        </section>

        <section className="mt-8">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#948f87]">
                Votre activité
              </p>
              <h2 className="mt-1 text-xl font-semibold tracking-[-0.025em]">
                Récentes
              </h2>
            </div>

            <button
              type="button"
              onClick={markAllRead}
              className="text-[10px] font-semibold text-[#167b82]"
            >
              Tout marquer comme lu
            </button>
          </div>

          <div className="mt-5 space-y-3">
            {dynamicNotifications.map((item) => {
              const Icon = item.icon;

              return (
                <article
                  key={item.id}
                  onClick={() => markRead(item.id)}
                  className={`rounded-[22px] border p-4 shadow-[0_8px_28px_rgba(28,27,24,0.035)] ${
                    item.unread
                      ? "border-[#9fd8d0] bg-[linear-gradient(145deg,#ffffff_0%,#eaf8f5_100%)]"
                      : "border-[#b9dfe3] bg-[#f0fafb]"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#d3f4ed]">
                      <Icon size={19} strokeWidth={1.7} />
                      {item.unread && (
                        <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-[#ff8066] ring-2 ring-white" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="rounded-full bg-[#d3f4ed] px-2.5 py-1 text-[9px] font-semibold text-[#69645d]">
                            {item.type}
                          </span>

                          {item.unread && (
                            <span className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[#8e8981]">
                              Nouveau
                            </span>
                          )}
                        </div>

                        <span className="text-[9px] text-[#9a958d]">
                          {item.time}
                        </span>
                      </div>

                      <h3 className="mt-3 text-[14px] font-semibold">
                        {item.title}
                      </h3>

                      <p className="mt-1.5 text-[11px] leading-5 text-[#77736d]">
                        {item.text}
                      </p>

                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          markRead(item.id);
                        }}
                        className="mt-3 flex items-center gap-1.5 text-[10px] font-semibold text-[#167b82]"
                      >
                        Voir le détail
                        <ChevronRight size={13} strokeWidth={1.8} />
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="mt-10 grid gap-4 lg:grid-cols-2">
          <article className="rounded-[24px] border border-black/6 bg-white p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#d3f4ed]">
                <Bell size={18} strokeWidth={1.7} />
              </div>

              <div>
                <p className="text-[10px] uppercase tracking-[0.16em] text-[#99938a]">
                  Rappels
                </p>
                <h3 className="mt-1 text-[16px] font-semibold">
                  Suivi activé
                </h3>
              </div>
            </div>

            <p className="mt-4 text-[12px] leading-6 text-[#77736d]">
              Otavio pourra vous rappeler de refaire un scan selon la
              fréquence choisie dans votre profil.
            </p>

            <Link
              href="/profil"
              className="mt-5 flex items-center gap-2 text-[11px] font-semibold"
            >
              Modifier mes préférences
              <ChevronRight size={14} strokeWidth={1.8} />
            </Link>
          </article>

          <article className="rounded-[24px] bg-gradient-to-br from-[#dcf8f2] via-[#eefaff] to-[#eee9ff] p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/65">
                <BellOff size={18} strokeWidth={1.7} />
              </div>

              <div>
                <p className="text-[10px] uppercase tracking-[0.16em] text-[#8f897f]">
                  Contrôle
                </p>
                <h3 className="mt-1 text-[16px] font-semibold">
                  Personnalisez vos alertes
                </h3>
              </div>
            </div>

            <p className="mt-4 text-[12px] leading-6 text-[#69645d]">
              Choisissez plus tard les types de notifications que vous
              souhaitez recevoir et leur fréquence.
            </p>

            <Link
              href="/profil"
              className="mt-5 flex items-center gap-2 text-[11px] font-semibold"
            >
              Gérer mes préférences
              <ChevronRight size={14} strokeWidth={1.8} />
            </Link>
          </article>
        </section>

        <p className="mt-8 max-w-3xl text-[10px] leading-5 text-[#9a958d]">
          Les notifications Otavio sont destinées à vous accompagner dans le
          suivi de vos observations. Elles ne constituent pas des alertes ou
          diagnostics médicaux.
        </p>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#c4dde1] bg-white/95 px-5 pb-[max(14px,env(safe-area-inset-bottom))] pt-3 backdrop-blur-xl">
        <div className="mx-auto flex max-w-md items-end justify-between">
          <Link
            href="/"
            className="flex w-16 flex-col items-center gap-1.5 text-[#77736d]"
          >
            <Activity size={18} strokeWidth={1.8} />
            <span className="text-[9px]">Accueil</span>
          </Link>

          <Link
            href="/conseils"
            className="flex w-16 flex-col items-center gap-1.5 text-[#77736d]"
          >
            <Sparkles size={18} strokeWidth={1.8} />
            <span className="text-[9px]">Conseils</span>
          </Link>

          <div className="flex w-16 flex-col items-center gap-1">
            <Link
              href="/scanner"
              className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-[#087ea4] via-[#12a6a6] to-[#7767e8] text-white shadow-[0_10px_28px_rgba(23,102,120,0.22)]"
              aria-label="Scanner"
            >
              <ScanFace size={21} strokeWidth={1.8} />
            </Link>
            <span className="text-[9px]">Scanner</span>
          </div>

          <Link
            href="/evolution"
            className="flex w-16 flex-col items-center gap-1.5 text-[#77736d]"
          >
            <TrendingUp size={18} strokeWidth={1.8} />
            <span className="text-[9px]">Évolution</span>
          </Link>

          <Link
            href="/profil"
            className="flex w-16 flex-col items-center gap-1.5 text-[#77736d]"
          >
            <UserRound size={18} strokeWidth={1.8} />
            <span className="text-[9px]">Profil</span>
          </Link>
        </div>
      </nav>
    </main>
  );
}
