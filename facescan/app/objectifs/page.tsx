"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
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
    text: "Suivre visuellement l’évolution de votre peau dans le temps.",
    icon: Sparkles,
  },
  {
    id: "hydratation",
    title: "Mieux suivre mon hydratation",
    text: "Accorder davantage d’attention à cet indicateur dans votre suivi.",
    icon: Droplets,
  },
  {
    id: "recuperation",
    title: "Mieux suivre ma récupération",
    text: "Observer les tendances liées à la fatigue et au repos.",
    icon: Moon,
  },
  {
    id: "equilibre",
    title: "Maintenir mon équilibre",
    text: "Conserver une vision globale et régulière de votre évolution.",
    icon: Activity,
  },
];

const goalAliases: Record<string, string> = {
  peau: "qualite_peau",
  qualite_peau: "qualite_peau",
  eclat: "qualite_peau",
  hydratation: "hydratation",
  recuperation: "recuperation",
  fatigue: "recuperation",
  sommeil: "recuperation",
  equilibre: "equilibre",
  bien_etre: "equilibre",
  evolution: "equilibre",
};

function normalizeGoalId(value: string) {
  return goalAliases[value] ?? value;
}

export default function ObjectifsPage() {
  const [selected, setSelected] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);
  const [scanCount, setScanCount] = useState(0);
  const [latestScore, setLatestScore] = useState<number | null>(null);
  const [previousScore, setPreviousScore] = useState<number | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("facescan-goals");

    if (stored) {
      try {
        const parsed = JSON.parse(stored);

        if (Array.isArray(parsed)) {
          const normalized = Array.from(
            new Set(
              parsed
                .filter((value): value is string => typeof value === "string")
                .map(normalizeGoalId)
            )
          );

          setSelected(normalized);
          return;
        }
      } catch {
        // Données locales invalides : on repart sur une sélection vide.
      }
    }

    setSelected(["qualite_peau", "hydratation"]);
  }, []);

  useEffect(() => {
    const storedScans = localStorage.getItem("facescan-scans");

    if (!storedScans) {
      setScanCount(0);
      setLatestScore(null);
      setPreviousScore(null);
      return;
    }

    try {
      const parsed = JSON.parse(storedScans);

      if (!Array.isArray(parsed)) {
        setScanCount(0);
        setLatestScore(null);
        setPreviousScore(null);
        return;
      }

      const scans = parsed
        .filter(
          (scan) =>
            scan &&
            typeof scan.date === "string" &&
            typeof scan.score === "number"
        )
        .sort(
          (a, b) =>
            new Date(b.date).getTime() - new Date(a.date).getTime()
        );

      setScanCount(scans.length);
      setLatestScore(scans[0]?.score ?? null);
      setPreviousScore(scans[1]?.score ?? null);
    } catch {
      setScanCount(0);
      setLatestScore(null);
      setPreviousScore(null);
    }
  }, []);

  const toggleGoal = (id: string) => {
    setSaved(false);

    setSelected((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  };

  const saveGoals = () => {
    const normalized = Array.from(
      new Set(selected.map(normalizeGoalId))
    );

    localStorage.setItem("facescan-goals", JSON.stringify(normalized));
    setSelected(normalized);
    setSaved(true);
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
            className="hidden items-center gap-2 rounded-full bg-[#171717] px-5 py-3 text-[12px] font-medium text-white sm:flex"
          >
            <ScanFace size={16} strokeWidth={1.8} />
            Nouveau scan
          </Link>
        </header>

        <section className="mt-8 rounded-[28px] bg-[#171717] p-6 text-white shadow-[0_20px_60px_rgba(0,0,0,0.12)] sm:p-8">
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

            <span className="rounded-full bg-[#e9e5de] px-3 py-1.5 text-[10px] font-semibold text-[#668083]">
              {selected.length} sélectionné{selected.length > 1 ? "s" : ""}
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
                      ? "border-[#171717] bg-white shadow-[0_10px_35px_rgba(28,27,24,0.06)]"
                      : "border-black/6 bg-white/70 hover:bg-white"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-2xl ${
                        isSelected ? "bg-[#171717] text-white" : "bg-[#eef7f5]"
                      }`}
                    >
                      <Icon size={19} strokeWidth={1.7} />
                    </div>

                    <div
                      className={`flex h-6 w-6 items-center justify-center rounded-full border ${
                        isSelected
                          ? "border-[#171717] bg-[#171717] text-white"
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

        <section className="mt-8 rounded-[24px] border border-[#dfe7e6] bg-white shadow-[0_10px_30px_rgba(35,55,60,0.045)] p-6">
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
              className="rounded-full bg-gradient-to-br from-[#176678] to-[#756bd4] px-5 py-3 text-[11px] font-semibold text-white shadow-[0_10px_25px_rgba(34,91,105,0.22)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-30"
            >
              {saved ? "Objectifs enregistrés" : "Enregistrer mes objectifs"}
            </button>
          </div>

          <div className="mt-6 flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#eef7f5]">
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
              <div key={label} className="rounded-2xl bg-[#f8fbfa] px-4 py-3">
                <p className="text-[9px] uppercase tracking-[0.13em] text-[#668083]">
                  {label}
                </p>
                <p className="mt-1 text-lg font-semibold">{value}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-8 rounded-[26px] bg-gradient-to-br from-[#f0edff] to-[#e8f8f4] p-6 shadow-[0_12px_35px_rgba(70,80,130,0.07)]">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/65">
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
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-gradient-to-br from-[#176678] to-[#756bd4] px-5 py-3 text-[11px] font-semibold text-white shadow-[0_10px_25px_rgba(34,91,105,0.22)] transition hover:-translate-y-0.5"
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
              className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#176678] to-[#756bd4] text-white shadow-[0_8px_25px_rgba(0,0,0,0.16)]"
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
