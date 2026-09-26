"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  Check,
  Droplets,
  Moon,
  ScanFace,
  Sparkles,
  Target,
  TrendingUp,
  UserRound,
} from "lucide-react";

const goals = [
  {
    id: "qualite_peau",
    title: "Améliorer l’apparence de ma peau",
    text: "Suivre visuellement la texture, les imperfections et l’évolution générale de votre peau.",
    icon: Sparkles,
  },
  {
    id: "hydratation",
    title: "Mieux suivre mon hydratation",
    text: "Accorder davantage d’attention à votre hydratation et à son évolution dans le temps.",
    icon: Droplets,
  },
  {
    id: "fatigue",
    title: "Réduire les signes de fatigue",
    text: "Observer les tendances visuelles liées à la fatigue et à la récupération.",
    icon: Moon,
  },
  {
    id: "eclat",
    title: "Retrouver de l’éclat",
    text: "Suivre l’uniformité du teint et son aspect visuellement plus lumineux.",
    icon: Sparkles,
  },
  {
    id: "nutrition",
    title: "Mieux manger",
    text: "Recevoir des conseils alimentaires et des menus davantage adaptés à votre profil.",
    icon: Activity,
  },
  {
    id: "sommeil",
    title: "Améliorer mon sommeil",
    text: "Travailler progressivement la régularité, la récupération et les habitudes de sommeil.",
    icon: Moon,
  },
  {
    id: "bien_etre",
    title: "Prendre davantage soin de moi",
    text: "Construire de meilleures habitudes au quotidien et soutenir votre équilibre global.",
    icon: UserRound,
  },
  {
    id: "evolution",
    title: "Suivre mon évolution",
    text: "Observer vos progrès à travers vos scans et vos tendances dans le temps.",
    icon: TrendingUp,
  },
];

const goalAliases: Record<string, string> = {
  peau: "qualite_peau",
  qualite_peau: "qualite_peau",
  eclat: "eclat",
  hydratation: "hydratation",
  recuperation: "sommeil",
  fatigue: "fatigue",
  sommeil: "sommeil",
  equilibre: "bien_etre",
  nutrition: "nutrition",
  bien_etre: "bien_etre",
  evolution: "evolution",
};

function normalizeGoalId(value: string) {
  return goalAliases[value] ?? value;
}

export default function ObjectifsPage() {
  const [selected, setSelected] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [scanCount, setScanCount] = useState(0);
  const [latestScore, setLatestScore] = useState<number | null>(null);
  const [previousScore, setPreviousScore] = useState<number | null>(null);

  useEffect(() => {
    const loadGoals = async () => {
      const localFallback = (userId?: string) => {
        if (!userId) {
          setSelected(["qualite_peau", "hydratation"]);
          return;
        }

        const stored = localStorage.getItem(
          `facescan-goals-${userId}`
        );

        if (stored) {
          try {
            const parsed = JSON.parse(stored);

            if (Array.isArray(parsed)) {
              const normalized = Array.from(
                new Set(
                  parsed
                    .filter(
                      (value): value is string => typeof value === "string"
                    )
                    .map(normalizeGoalId)
                )
              );

              setSelected(normalized);
              return;
            }
          } catch {
            // Données locales invalides : on utilise les objectifs par défaut.
          }
        }

        setSelected(["qualite_peau", "hydratation"]);
      };

      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          localFallback();
          return;
        }

        const { data, error: profileError } = await supabase
          .from("profiles")
          .select("goals")
          .eq("id", user.id)
          .maybeSingle();

        if (
          !profileError &&
          data &&
          Array.isArray(data.goals)
        ) {
          const normalized = Array.from(
            new Set(
              data.goals
                .filter(
                  (value): value is string => typeof value === "string"
                )
                .map(normalizeGoalId)
            )
          );

          setSelected(
            normalized.length > 0
              ? normalized
              : ["qualite_peau", "hydratation"]
          );
          localStorage.setItem(
            `facescan-goals-${user.id}`,
            JSON.stringify(
              normalized.length > 0
                ? normalized
                : ["qualite_peau", "hydratation"]
            )
          );
          return;
        }

        localFallback(user.id);
      } catch {
        localFallback();
      }
    };

    loadGoals();
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadScanStats() {
      let scans: any[] = [];
      let userId: string | null = null;

      try {
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();

        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          userId = user.id;

          const { data: remoteScans, error } = await supabase
            .from("scans")
            .select("id, created_at, score")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .limit(20);

          if (!error && Array.isArray(remoteScans)) {
            scans = remoteScans.filter(
              (scan: any) =>
                scan &&
                typeof scan.score === "number" &&
                typeof scan.created_at === "string"
            );
          }
        }
      } catch (error) {
        console.error("Objectifs Supabase scans error:", error);
      }

      if (scans.length === 0 && userId) {
        try {
          const storedScans = localStorage.getItem(
            `facescan-scans-${userId}`
          );
          const parsed = storedScans ? JSON.parse(storedScans) : [];

          scans = Array.isArray(parsed)
            ? parsed
                .filter(
                  (scan: any) =>
                    scan &&
                    typeof scan.date === "string" &&
                    typeof scan.score === "number"
                )
                .sort(
                  (a: any, b: any) =>
                    new Date(b.date).getTime() -
                    new Date(a.date).getTime()
                )
            : [];
        } catch {
          scans = [];
        }
      }

      if (!cancelled) {
        setScanCount(scans.length);
        setLatestScore(scans[0]?.score ?? null);
        setPreviousScore(scans[1]?.score ?? null);
      }
    }

    loadScanStats();

    return () => {
      cancelled = true;
    };
  }, []);

  const toggleGoal = (id: string) => {
    setSaved(false);
    setError("");

    setSelected((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : current.length >= 3
          ? current
          : [...current, id]
    );
  };

  const saveGoals = async () => {
    if (selected.length === 0) {
      setError("Choisissez au moins un objectif.");
      return;
    }

    setSaving(true);
    setSaved(false);
    setError("");

    const normalized = Array.from(
      new Set(selected.map(normalizeGoalId))
    ).slice(0, 3);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      localStorage.setItem(
        `facescan-goals-${user.id}`,
        JSON.stringify(normalized)
      );
    }
    setSelected(normalized);

    try {
      if (!user) {
        setSaved(true);
        return;
      }

      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          goals: normalized,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (updateError) {
        setError("Impossible d’enregistrer vos objectifs.");
        return;
      }

      setSaved(true);
    } catch {
      setError("Impossible d’enregistrer vos objectifs.");
    } finally {
      setSaving(false);
    }
  };

  const scoreChange =
    latestScore !== null && previousScore !== null
      ? latestScore - previousScore
      : null;

  return (
    <main className="app-background min-h-screen text-[#17202a] pb-28">
      <div className="mx-auto w-full max-w-5xl px-5 sm:px-8">
        <header className="flex items-center justify-between pt-7 sm:pt-9">
          <div className="flex items-center gap-3">
            <Link
              href="/profil"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[#dce5e4] bg-white shadow-[0_8px_25px_rgba(30,55,60,0.06)]"
              aria-label="Retour au profil"
            >
              <ArrowLeft size={18} strokeWidth={1.8} />
            </Link>

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#668083]">
                Otavio
              </p>
              <h1 className="mt-1 text-2xl font-semibold tracking-[-0.03em] text-white">
                Mes objectifs
              </h1>
            </div>
          </div>

          <Link
            href="/scanner"
            className="hidden items-center gap-2 rounded-full bg-[linear-gradient(135deg,#0b5876_0%,#087ea4_52%,#12a6a6_100%)] px-5 py-3 text-[12px] font-medium text-white sm:flex"
          >
            <ScanFace size={16} strokeWidth={1.8} />
            Nouveau scan
          </Link>
        </header>

        <section className="mt-8 rounded-[28px] bg-[linear-gradient(135deg,#0b5876_0%,#087ea4_52%,#12a6a6_100%)] p-6 text-white shadow-[0_20px_60px_rgba(0,0,0,0.12)] sm:p-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/8">
              <Target size={20} strokeWidth={1.7} />
            </div>

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/40">
                Personnalisation
              </p>
              <h2 className="mt-1 text-2xl font-semibold tracking-[-0.03em]">
                Qu’est-ce qui compte pour vous ?
              </h2>
            </div>
          </div>

          <p className="mt-4 max-w-2xl text-[13px] leading-6 text-white/50">
            Vos objectifs permettront à Otavio de mieux hiérarchiser les
            informations, recommandations et suivis qui vous sont présentés.
          </p>
        </section>

        <section className="mt-8">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#668083]">
                Sélection
              </p>
              <h2 className="mt-1 text-xl font-semibold tracking-[-0.025em]">
                Vos priorités
              </h2>
            </div>

            <span className="rounded-full bg-[#ffe3d9] px-3 py-1.5 text-[10px] font-semibold text-[#668083]">
              {selected.length} / 3 sélectionné{selected.length > 1 ? "s" : ""}
            </span>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {goals.map((goal) => {
              const Icon = goal.icon;
              const isSelected = selected.includes(goal.id);

              return (
                <button
                  key={goal.id}
                  type="button"
                  onClick={() => toggleGoal(goal.id)}
                  className={`rounded-[24px] border p-5 text-left transition ${
                    isSelected
                      ? "border-[#12a6a6] bg-[linear-gradient(145deg,#ffffff_0%,#dcf8f3_100%)] shadow-[0_10px_35px_rgba(8,126,164,0.12)]"
                      : "border-[#c6dfe3] bg-white/90 hover:bg-[#eefafa]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-2xl ${
                        isSelected ? "bg-[linear-gradient(135deg,#0b5876_0%,#087ea4_52%,#12a6a6_100%)] text-white" : "bg-[#d9f5ef]"
                      }`}
                    >
                      <Icon size={19} strokeWidth={1.7} />
                    </div>

                    <div
                      className={`flex h-6 w-6 items-center justify-center rounded-full border ${
                        isSelected
                          ? "border-[#171717] bg-[linear-gradient(135deg,#0b5876_0%,#087ea4_52%,#12a6a6_100%)] text-white"
                          : "border-black/10 bg-transparent text-transparent"
                      }`}
                    >
                      <Check size={13} strokeWidth={2.2} />
                    </div>
                  </div>

                  <h3 className="mt-5 text-[15px] font-semibold">
                    {goal.title}
                  </h3>

                  <p className="mt-2 text-[12px] leading-6 text-[#668083]">
                    {goal.text}
                  </p>
                </button>
              );
            })}
          </div>
        </section>

        <section className="mt-8 rounded-[24px] border border-[#9fd8d0] bg-[linear-gradient(145deg,#ffffff_0%,#eaf8f5_100%)] shadow-[0_10px_30px_rgba(35,55,60,0.045)] p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#668083]">
                Enregistrement
              </p>
              <p className="mt-1 text-[12px] text-[#668083]">
                Vos choix sont conservés sur cet appareil pour le prototype.
              </p>
            </div>

            <button
              type="button"
              onClick={saveGoals}
              disabled={selected.length === 0}
              className="rounded-full bg-gradient-to-br from-[#087ea4] via-[#12a6a6] to-[#7767e8] px-5 py-3 text-[11px] font-semibold text-white shadow-[0_10px_25px_rgba(34,91,105,0.22)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-30"
            >
              {saving
                ? "Enregistrement…"
                : saved
                  ? "Objectifs enregistrés"
                  : "Enregistrer mes objectifs"}
            </button>
          </div>

          <div className="mt-6 flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#d9f5ef]">
              <TrendingUp size={18} strokeWidth={1.7} />
            </div>

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#99938a]">
                Votre suivi
              </p>
              <h3 className="mt-1 text-[16px] font-semibold">
                Ce que cela changera
              </h3>
              <p className="mt-2 text-[12px] leading-6 text-[#668083]">
                Plus un objectif est important pour vous, plus les contenus
                associés pourront être mis en avant dans votre tableau de bord,
                vos conseils et vos futures analyses.
              </p>

              <p className="mt-3 text-[10px] font-medium text-[#8a9a9d]">
                {scanCount === 0
                  ? "Aucun scan enregistré pour le moment."
                  : scanCount === 1
                    ? "1 scan enregistré."
                    : `${scanCount} scans enregistrés.`}
              </p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              ["Priorités", `${selected.length}`],
              ["Indicateurs", "4"],
              ["Dernier scan", latestScore !== null ? `${latestScore}/100` : "—"],
              [
                "Progression",
                scoreChange === null
                  ? "—"
                  : `${scoreChange >= 0 ? "+" : ""}${scoreChange}`,
              ],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl bg-[#edf8f6] px-4 py-3">
                <p className="text-[9px] uppercase tracking-[0.13em] text-[#668083]">
                  {label}
                </p>
                <p className="mt-1 text-lg font-semibold">{value}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-8 rounded-[26px] bg-gradient-to-br from-[#eee9ff] via-[#dcf8f2] to-[#fff0eb] p-6 shadow-[0_12px_35px_rgba(70,80,130,0.07)]">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/80">
              <Sparkles size={18} strokeWidth={1.7} />
            </div>

            <div className="flex-1">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#668083]">
                Prochaine étape
              </p>

              <h3 className="mt-1 text-[16px] font-semibold">
                Continuez votre suivi
              </h3>

              <p className="mt-2 text-[12px] leading-6 text-[#668083]">
                Les objectifs seront utilisés plus tard pour personnaliser
                automatiquement vos conseils et prioriser les évolutions les
                plus pertinentes pour vous.
              </p>

              <Link
                href="/scanner"
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-gradient-to-br from-[#087ea4] via-[#12a6a6] to-[#7767e8] px-5 py-3 text-[11px] font-semibold text-white shadow-[0_10px_25px_rgba(34,91,105,0.22)] transition hover:-translate-y-0.5"
              >
                Faire un scan
                <ArrowRight size={14} strokeWidth={1.8} />
              </Link>
            </div>
          </div>
        </section>

        <p className="mt-8 max-w-3xl text-[10px] leading-5 text-[#668083]">
          Les objectifs définis dans Otavio servent à personnaliser
          l’expérience de suivi. Ils ne constituent pas des recommandations
          médicales et ne remplacent pas l’avis d’un professionnel de santé.
        </p>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#dce5e4] bg-white/95 px-5 pb-[max(14px,env(safe-area-inset-bottom))] pt-3 backdrop-blur-xl">
        <div className="mx-auto flex max-w-md items-end justify-between">
          <Link
            href="/"
            className="flex w-16 flex-col items-center gap-1.5 text-[#668083]"
          >
            <Activity size={18} strokeWidth={1.8} />
            <span className="text-[9px]">Accueil</span>
          </Link>

          <Link
            href="/conseils"
            className="flex w-16 flex-col items-center gap-1.5 text-[#668083]"
          >
            <Sparkles size={18} strokeWidth={1.8} />
            <span className="text-[9px]">Conseils</span>
          </Link>

          <div className="flex w-16 flex-col items-center gap-1">
            <Link
              href="/scanner"
              className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#087ea4] via-[#12a6a6] to-[#7767e8] text-white shadow-[0_8px_25px_rgba(0,0,0,0.16)]"
              aria-label="Scanner"
            >
              <ScanFace size={21} strokeWidth={1.8} />
            </Link>
            <span className="text-[9px]">Scanner</span>
          </div>

          <Link
            href="/evolution"
            className="flex w-16 flex-col items-center gap-1.5 text-[#668083]"
          >
            <TrendingUp size={18} strokeWidth={1.8} />
            <span className="text-[9px]">Évolution</span>
          </Link>

          <Link
            href="/profil"
            className="flex w-16 flex-col items-center gap-1.5 text-[#171717]"
          >
            <UserRound size={18} strokeWidth={2} />
            <span className="text-[9px] font-medium">Profil</span>
          </Link>
        </div>
      </nav>
    </main>
  );
}
