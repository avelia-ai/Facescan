"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Droplets,
  Moon,
  Info,
  ScanFace,
  Sparkles,
  TrendingUp,
  UserRound,
} from "lucide-react";

import { buildPersonalizedInsights } from "@/lib/personalization";

type StoredScan = {
  id: string;
  date: string;
  score: number;
  indicators: {
    peau: number;
    hydratation: number;
    fatigue: number;
    equilibre: number;
  };
  photo?: string;
  faceDetection?: {
    detected: boolean;
    faceCount: number;
    confidence: number;
    imageWidth: number;
    imageHeight: number;
    faceBox: {
      x: number;
      y: number;
      width: number;
      height: number;
    } | null;
  };
};

const previousIndicators = {
  peau: 76,
  hydratation: 65,
  fatigue: 72,
  equilibre: 76,
};

const indicatorConfig = [
  {
    key: "peau",
    label: "Peau",
    description: "Qualité visuelle",
    icon: Sparkles,
    accent: "text-[#e06f59]",
    iconBg: "bg-[#fff0eb]",
    bar: "from-[#f39a82] to-[#d96550]",
  },
  {
    key: "hydratation",
    label: "Hydratation",
    description: "Aspect hydrique",
    icon: Droplets,
    accent: "text-[#168f91]",
    iconBg: "bg-[#e5faf7]",
    bar: "from-[#56d9ca] to-[#168f91]",
  },
  {
    key: "fatigue",
    label: "Fatigue",
    description: "Signes apparents",
    icon: Moon,
    accent: "text-[#756bd4]",
    iconBg: "bg-[#eeecff]",
    bar: "from-[#a49cff] to-[#756bd4]",
  },
  {
    key: "equilibre",
    label: "Équilibre",
    description: "Harmonie générale",
    icon: Activity,
    accent: "text-[#3f9864]",
    iconBg: "bg-[#e8f7ee]",
    bar: "from-[#82c99b] to-[#3f9864]",
  },
] as const;

function buildDailyActions(
  indicators: StoredScan["indicators"],
  goals: string[],
) {
  const candidates = [
    {
      key: "hydratation",
      title: "Hydratation",
      text: "Buvez régulièrement au cours de la journée et privilégiez les aliments riches en eau.",
      score: indicators.hydratation,
      tone: "bg-[#e5faf7] text-[#168f91]",
    },
    {
      key: "recuperation",
      title: "Récupération",
      text: "Privilégiez une soirée calme et un sommeil régulier pour favoriser la récupération.",
      score: indicators.fatigue,
      tone: "bg-[#eeecff] text-[#756bd4]",
    },
    {
      key: "peau",
      title: "Peau",
      text: "Conservez une routine douce et protégez votre peau des agressions quotidiennes.",
      score: indicators.peau,
      tone: "bg-[#fff0eb] text-[#d96550]",
    },
    {
      key: "equilibre",
      title: "Équilibre",
      text: "Gardez une routine régulière avec des habitudes simples et constantes.",
      score: indicators.equilibre,
      tone: "bg-[#e8f7ee] text-[#3f9864]",
    },
  ];

  return candidates
    .sort((a, b) => {
      const aPriority = goals.includes(a.key) ? -20 : 0;
      const bPriority = goals.includes(b.key) ? -20 : 0;
      return a.score + aPriority - (b.score + bPriority);
    })
    .slice(0, 3);
}

function getStatus(value: number) {
  if (value >= 80) return "Très bon";
  if (value >= 70) return "Bon";
  if (value >= 60) return "À surveiller";
  return "Attention";
}

function getScoreMessage(score: number) {
  if (score >= 85) return "Une dynamique très positive.";
  if (score >= 75) return "Une dynamique globalement positive.";
  if (score >= 65) return "Quelques axes peuvent encore progresser.";
  return "Plusieurs axes méritent votre attention.";
}

export default function ResultatsPage() {
  const [userGoals, setUserGoals] = useState<string[]>([]);
  const [scanPhoto, setScanPhoto] = useState<string | null>(null);
  const [latestScan, setLatestScan] = useState<StoredScan | null>(null);

  useEffect(() => {
    const photo = sessionStorage.getItem("facescan-scan-photo");

    if (photo) {
      setScanPhoto(photo);
    }

    const scansStored = localStorage.getItem("facescan-scans");

    if (scansStored) {
      try {
        const scans = JSON.parse(scansStored);

        if (Array.isArray(scans) && scans.length > 0 && scans[0]?.indicators) {
          const scan = scans[0] as StoredScan;
          setLatestScan(scan);

          if (!photo && scan.photo) {
            setScanPhoto(scan.photo);
          }
        }
      } catch {
        setLatestScan(null);
      }
    }

    const storedGoals = localStorage.getItem("facescan-goals");

    if (!storedGoals) {
      setUserGoals(["peau", "hydratation"]);
      return;
    }

    try {
      const parsed = JSON.parse(storedGoals);

      setUserGoals(
        Array.isArray(parsed) ? parsed : ["peau", "hydratation"],
      );
    } catch {
      setUserGoals(["peau", "hydratation"]);
    }
  }, []);

  const currentIndicators = latestScan?.indicators ?? {
    peau: 82,
    hydratation: 74,
    fatigue: 68,
    equilibre: 79,
  };

  const currentScore = latestScan?.score ?? 78;

  const faceDetected =
    Boolean(latestScan?.faceDetection?.detected) &&
    Boolean(latestScan?.faceDetection?.faceBox);

  const faceBox = latestScan?.faceDetection?.faceBox;

  const facePosition = useMemo(() => {
    if (
      !faceBox ||
      !latestScan?.faceDetection ||
      latestScan.faceDetection.imageWidth <= 0 ||
      latestScan.faceDetection.imageHeight <= 0
    ) {
      return null;
    }

    return {
      left:
        (faceBox.x / latestScan.faceDetection.imageWidth) * 100,
      top:
        (faceBox.y / latestScan.faceDetection.imageHeight) * 100,
      width:
        (faceBox.width / latestScan.faceDetection.imageWidth) * 100,
      height:
        (faceBox.height / latestScan.faceDetection.imageHeight) * 100,
    };
  }, [faceBox, latestScan]);

  const indicators = indicatorConfig.map((item) => {
    const value = currentIndicators[item.key];
    const previous = previousIndicators[item.key];
    const change = value - previous;

    return {
      ...item,
      value,
      change,
      status: getStatus(value),
    };
  });

  const personalizedInsights = buildPersonalizedInsights({
    goals: userGoals,
    indicators: currentIndicators,
  });

  const positiveInsight =
    personalizedInsights.find((item) => item.type === "positive") ??
    personalizedInsights[0];

  const attentionInsight =
    personalizedInsights.find((item) => item.type === "attention") ??
    personalizedInsights[0];

  const dailyActions = buildDailyActions(currentIndicators, userGoals);

  const surveillanceGoals = userGoals.filter((goal) =>
    ["peau", "hydratation", "recuperation", "equilibre"].includes(goal),
  );

  const surveillanceTitle =
    surveillanceGoals.length > 0
      ? surveillanceGoals
          .slice(0, 2)
          .map((goal) => {
            const labels: Record<string, string> = {
              peau: "Peau",
              hydratation: "Hydratation",
              recuperation: "Récupération",
              equilibre: "Équilibre",
            };

            return labels[goal];
          })
          .join(" · ")
      : "Votre équilibre général";

  return (
    <main className="app-background min-h-screen pb-28 text-[#14252d]">
      <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">

        {/* HEADER */}
        <header className="flex items-center justify-between pt-7 sm:pt-9">
          <div className="flex items-center gap-3">
            <Link
              href="/scanner"
              aria-label="Retour au scanner"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[#d9e4e7] bg-white text-[#36545d] shadow-[0_8px_25px_rgba(20,55,65,0.06)] transition hover:-translate-y-0.5"
            >
              <ArrowLeft size={18} strokeWidth={1.8} />
            </Link>

            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.24em] text-[#168f91]">
                FACESCAN
              </p>
              <h1 className="mt-1 text-2xl font-semibold tracking-[-0.04em] text-white">
                Résultats
              </h1>
            </div>
          </div>

          <div className="rounded-full border border-[#d8e5e7] bg-white px-3.5 py-2 text-[9px] font-semibold text-[#5c737a] shadow-[0_7px_22px_rgba(20,55,65,0.05)]">
            Dernier scan · Aujourd’hui
          </div>
        </header>

        {/* HERO */}
        <section className="mt-7 grid gap-5 lg:grid-cols-[0.88fr_1.12fr]">

          {/* SCORE */}
          <div className="relative min-h-[360px] overflow-hidden rounded-[32px] bg-[#102f3a] p-7 text-white shadow-[0_28px_70px_rgba(16,47,58,0.22)] sm:p-8">
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#39d8c5]/20 blur-3xl" />
            <div className="absolute -bottom-28 -left-16 h-64 w-64 rounded-full bg-[#756bd4]/25 blur-3xl" />

            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-white/45">
                  État global
                </p>
                <p className="mt-2 text-sm font-medium text-white/75">
                  Votre lecture du jour
                </p>
              </div>

              <div className="flex items-center gap-1.5 rounded-full border border-[#72f0dc]/20 bg-[#72f0dc]/10 px-3 py-1.5 text-[9px] font-semibold text-[#72f0dc]">
                <TrendingUp size={12} />
                +4 pts
              </div>
            </div>

            <div className="relative mt-9 flex items-end gap-3">
              <span className="text-[88px] font-semibold leading-none tracking-[-0.09em]">
                {currentScore}
              </span>
              <span className="mb-2 text-sm text-white/35">
                / 100
              </span>
            </div>

            <p className="relative mt-4 text-[13px] text-white/65">
              {getScoreMessage(currentScore)}
            </p>

            <div className="relative mt-8">
              <div className="h-2 overflow-hidden rounded-full bg-white/[0.09]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#45d9ca] via-[#72f0dc] to-[#aaa4ff]"
                  style={{ width: `${Math.min(currentScore, 100)}%` }}
                />
              </div>

              <div className="mt-3 flex justify-between text-[9px] text-white/30">
                <span>Votre score</span>
                <span>100</span>
              </div>
            </div>

            <div className="absolute bottom-7 left-7 right-7 flex items-center gap-2 border-t border-white/10 pt-4 text-[9px] text-white/35 sm:left-8 sm:right-8">
              <Sparkles size={12} className="text-[#72f0dc]" />
              Comparaison avec votre précédent scan
            </div>
          </div>

          {/* PHOTO / ANALYSE */}
          <div className="overflow-hidden rounded-[32px] border border-[#d9e5e7] bg-white shadow-[0_20px_55px_rgba(20,55,65,0.07)]">

            <div className="flex items-center justify-between border-b border-[#edf1f2] px-6 py-5 sm:px-7">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.21em] text-[#168f91]">
                  Analyse visuelle
                </p>
                <p className="mt-1 text-[12px] text-[#6c8086]">
                  Lecture de votre dernier scan
                </p>
              </div>

              <div className="flex items-center gap-2 rounded-full bg-[#eaf8f6] px-3 py-1.5 text-[9px] font-semibold text-[#168f91]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#38cbbb]" />
                {faceDetected ? "Visage détecté" : "Prêt à analyser"}
              </div>
            </div>

            <div className="p-5 sm:p-7">
              <div className="relative mx-auto aspect-[4/3] max-w-[520px] overflow-hidden rounded-[26px] bg-[#e9f1f2]">

                {scanPhoto ? (
                  <>
                    <img
                      src={scanPhoto}
                      alt="Photo utilisée pour le dernier scan"
                      className="absolute inset-0 h-full w-full object-cover"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-[#092832]/35 via-transparent to-transparent" />

                    {facePosition && (
                      <div
                        className="absolute rounded-[45%] border border-[#72f0dc]/80 shadow-[0_0_0_1px_rgba(255,255,255,0.35),0_0_30px_rgba(70,220,200,0.25)]"
                        style={{
                          left: `${facePosition.left}%`,
                          top: `${facePosition.top}%`,
                          width: `${facePosition.width}%`,
                          height: `${facePosition.height}%`,
                        }}
                      />
                    )}

                    <div className="absolute bottom-4 left-4 flex items-center gap-2 rounded-full border border-white/20 bg-[#102f3a]/75 px-3 py-2 text-[9px] font-semibold text-white backdrop-blur-md">
                      <ScanFace size={12} />
                      Analyse du visage
                    </div>
                  </>
                ) : (
                  <div className="flex h-full flex-col items-center justify-center px-6 text-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-[#168f91] shadow-sm">
                      <ScanFace size={25} strokeWidth={1.6} />
                    </div>
                    <p className="mt-4 text-[12px] font-semibold text-[#304b54]">
                      Aucun scan disponible
                    </p>
                    <p className="mt-1 max-w-[230px] text-[10px] leading-5 text-[#7b8e93]">
                      Lancez un nouveau scan pour obtenir votre analyse.
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-4 flex items-center justify-between rounded-2xl bg-[#f3f7f7] px-4 py-3">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#74888d]">
                    Qualité du scan
                  </p>
                  <p className="mt-1 text-[12px] font-semibold text-[#263f48]">
                    Bonne
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="h-1.5 w-20 overflow-hidden rounded-full bg-[#dce6e7]">
                    <div className="h-full w-[80%] rounded-full bg-gradient-to-r from-[#42c9bd] to-[#756bd4]" />
                  </div>
                  <span className="text-[10px] font-bold text-[#168f91]">
                    80%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* INDICATORS */}
        <section className="mt-11">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-[#168f91]">
                Vos indicateurs
              </p>
              <h2 className="mt-1.5 text-2xl font-semibold tracking-[-0.045em]">
                Ce que votre scan révèle
              </h2>
              <p className="mt-2 max-w-xl text-[12px] leading-5 text-[#71858a]">
                Une lecture simple de vos principaux indicateurs visuels.
              </p>
            </div>

            <span className="hidden rounded-full border border-[#d9e5e7] bg-white px-3 py-2 text-[9px] font-semibold text-[#667c82] sm:block">
              4 indicateurs
            </span>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {indicators.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.key}
                  href={`/indicateur?type=${item.key === "fatigue" ? "fatigue" : item.key}`}
                  className="group relative overflow-hidden rounded-[24px] border border-[#dce6e8] bg-white p-5 shadow-[0_12px_35px_rgba(20,55,65,0.055)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_42px_rgba(20,55,65,0.10)]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-[13px] ${item.iconBg} ${item.accent}`}
                    >
                      <Icon size={18} strokeWidth={1.8} />
                    </div>

                    <span
                      className={`text-[10px] font-bold ${
                        item.change >= 0
                          ? "text-[#168f91]"
                          : "text-[#d96550]"
                      }`}
                    >
                      {item.change >= 0 ? "+" : ""}
                      {item.change}
                    </span>
                  </div>

                  <p className="mt-5 text-[10px] font-medium text-[#7a8d92]">
                    {item.label}
                  </p>

                  <div className="mt-1 flex items-end gap-1">
                    <span className="text-3xl font-semibold tracking-[-0.06em] text-[#162a32]">
                      {item.value}
                    </span>
                    <span className="mb-1 text-[9px] text-[#9aabad]">
                      /100
                    </span>
                  </div>

                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#edf2f3]">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${item.bar}`}
                      style={{ width: `${item.value}%` }}
                    />
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-[9px] font-semibold text-[#5f747a]">
                      {item.status}
                    </span>

                    <ArrowRight
                      size={13}
                      className="text-[#9aabad] transition-transform group-hover:translate-x-1"
                    />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* DAILY PLAN */}
        <section className="mt-11">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-[#756bd4]">
                Aujourd’hui
              </p>
              <h2 className="mt-1.5 text-2xl font-semibold tracking-[-0.045em]">
                Votre plan du jour
              </h2>
              <p className="mt-2 max-w-xl text-[12px] leading-5 text-[#71858a]">
                Trois actions simples choisies selon vos indicateurs et vos priorités.
              </p>
            </div>

            <span className="hidden rounded-full bg-[#eeecff] px-3 py-2 text-[9px] font-bold text-[#756bd4] sm:block">
              Personnalisé
            </span>
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-3">
            {dailyActions.map((action, index) => (
              <div
                key={action.title}
                className="relative overflow-hidden rounded-[24px] border border-[#dce6e8] bg-white p-5 shadow-[0_12px_35px_rgba(20,55,65,0.05)]"
              >
                <div className="flex items-center justify-between">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-[13px] ${action.tone}`}
                  >
                    <span className="text-[11px] font-bold">
                      0{index + 1}
                    </span>
                  </div>

                  <span className="text-[9px] font-bold uppercase tracking-[0.13em] text-[#9aabad]">
                    Priorité
                  </span>
                </div>

                <h3 className="mt-5 text-[14px] font-semibold text-[#162a32]">
                  {action.title}
                </h3>

                <p className="mt-2 text-[11px] leading-5 text-[#71858a]">
                  {action.text}
                </p>

                <div className="mt-5 flex items-center gap-2 text-[9px] font-bold text-[#168f91]">
                  <CheckCircle2 size={13} />
                  À faire aujourd’hui
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* EVOLUTION */}
        <section className="mt-11">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-[#3f9864]">
              Votre progression
            </p>
            <h2 className="mt-1.5 text-2xl font-semibold tracking-[-0.045em]">
              Votre évolution
            </h2>
            <p className="mt-2 max-w-xl text-[12px] leading-5 text-[#71858a]">
              Comparez votre dernier scan à votre niveau de référence.
            </p>
          </div>

          <div className="mt-5 rounded-[28px] border border-[#dce6e8] bg-white p-5 shadow-[0_15px_40px_rgba(20,55,65,0.05)] sm:p-6">
            <div className="grid gap-3 sm:grid-cols-2">
              {indicators.map((item) => {
                const positive = item.change >= 0;

                return (
                  <div
                    key={item.key}
                    className="rounded-[20px] bg-[#f5f8f8] p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[11px] font-semibold text-[#304951]">
                          {item.label}
                        </p>
                        <p className="mt-1 text-[9px] text-[#899a9e]">
                          Référence {previousIndicators[item.key]}
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-xl font-semibold tracking-[-0.05em]">
                          {item.value}
                        </span>
                        <p
                          className={`text-[9px] font-bold ${
                            positive
                              ? "text-[#168f91]"
                              : "text-[#d96550]"
                          }`}
                        >
                          {positive ? "+" : ""}
                          {item.change} pts
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-[#dfe8e9]">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${item.bar}`}
                        style={{ width: `${item.value}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 flex items-start gap-3 rounded-[20px] bg-gradient-to-r from-[#e9f9f6] to-[#efedff] p-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/80 text-[#168f91]">
                <TrendingUp size={15} />
              </div>

              <div>
                <p className="text-[10px] font-bold text-[#263f48]">
                  Les tendances comptent plus qu’un résultat isolé
                </p>
                <p className="mt-1 text-[9px] leading-5 text-[#71858a]">
                  Otavio compare progressivement vos scans pour faire apparaître votre évolution.
                </p>
              </div>
            </div>
          </div>

          <Link
            href="/evolution"
            className="mt-4 flex items-center justify-center gap-2 text-[10px] font-bold text-[#168f91]"
          >
            Voir mon évolution
            <ArrowRight size={13} />
          </Link>
        </section>

        {/* INSIGHTS */}
        <section className="mt-11 grid gap-4 lg:grid-cols-2">
          <article className="rounded-[26px] border border-[#dce6e8] bg-white p-6 shadow-[0_12px_35px_rgba(20,55,65,0.045)]">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-[13px] bg-[#e8f7ee] text-[#3f9864]">
                <CheckCircle2 size={18} />
              </div>

              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#3f9864]">
                  Observation principale
                </p>
                <h3 className="mt-1 text-[16px] font-semibold">
                  {positiveInsight?.title ?? "Une dynamique positive"}
                </h3>
              </div>
            </div>

            <p className="mt-5 text-[12px] leading-6 text-[#62777d]">
              {positiveInsight?.text ??
                "Votre scan présente plusieurs indicateurs favorables."}
            </p>
          </article>

          <article className="rounded-[26px] bg-gradient-to-br from-[#eaf9f6] via-[#eef3ff] to-[#f4efff] p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-[13px] bg-white/80 text-[#756bd4]">
                <Droplets size={18} />
              </div>

              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#756bd4]">
                  À surveiller
                </p>
                <h3 className="mt-1 text-[16px] font-semibold text-[#24363e]">
                  {surveillanceTitle}
                </h3>
              </div>
            </div>

            <p className="mt-5 text-[12px] leading-6 text-[#61767c]">
              {attentionInsight?.text ??
                "Ces axes font partie de vos priorités de suivi et méritent une attention régulière."}
            </p>
          </article>
        </section>

        {/* RELIABILITY */}
        <section className="mt-8 rounded-[26px] border border-[#dce6e8] bg-white p-6 shadow-[0_12px_35px_rgba(20,55,65,0.045)]">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[13px] bg-[#e8f7f5] text-[#168f91]">
              <Info size={18} />
            </div>

            <div className="flex-1">
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#168f91]">
                    Qualité de l’analyse
                  </p>
                  <h3 className="mt-1 text-[16px] font-semibold">
                    Qualité élevée
                  </h3>
                </div>

                <span className="rounded-full bg-[#e8f7f5] px-3 py-1.5 text-[9px] font-bold text-[#168f91]">
                  91 %
                </span>
              </div>

              <p className="mt-3 max-w-2xl text-[11px] leading-5 text-[#62777d]">
                La qualité de l’image permet une lecture visuelle claire des principaux indicateurs présentés.
              </p>

              <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-[#e3ebec]">
                <div className="h-full w-[91%] rounded-full bg-gradient-to-r from-[#42c9bd] to-[#756bd4]" />
              </div>

              <p className="mt-3 text-[9px] leading-5 text-[#819297]">
                Cette estimation concerne la qualité du scan, et non la certitude d’une observation médicale.
              </p>
            </div>
          </div>
        </section>

        {/* NEXT STEP */}
        <section className="relative mt-8 overflow-hidden rounded-[28px] bg-[#102f3a] p-6 text-white shadow-[0_22px_55px_rgba(16,47,58,0.17)] sm:p-7">
          <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-[#756bd4]/30 blur-3xl" />
          <div className="absolute -bottom-20 left-1/3 h-52 w-52 rounded-full bg-[#39d8c5]/20 blur-3xl" />

          <div className="relative flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#72f0dc]/60">
                Prochaine étape
              </p>

              <h2 className="mt-2 text-xl font-semibold tracking-[-0.03em]">
                Passez de l’analyse à l’action
              </h2>

              <p className="mt-2 max-w-xl text-[11px] leading-5 text-white/55">
                Retrouvez vos recommandations personnalisées à partir des observations de votre scan.
              </p>
            </div>

            <Link
              href="/conseils"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-[10px] font-bold text-[#102f3a] shadow-lg transition hover:-translate-y-0.5"
            >
              Voir mes conseils
              <ArrowRight size={14} />
            </Link>
          </div>
        </section>

        {/* DISCLAIMER */}
        <p className="mt-7 max-w-3xl text-[9px] leading-5 text-[#87979b]">
          Les observations présentées par Otavio sont informatives. Elles ne constituent pas un diagnostic médical et ne remplacent pas l’avis, l’examen ou le suivi d’un professionnel de santé.
        </p>
      </div>

      {/* BOTTOM NAV */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#dce6e8] bg-white/95 px-5 pb-[max(14px,env(safe-area-inset-bottom))] pt-3 backdrop-blur-xl">
        <div className="mx-auto flex max-w-md items-end justify-between">
          <Link
            href="/"
            className="flex w-16 flex-col items-center gap-1.5 text-[#657a80]"
          >
            <Activity size={18} strokeWidth={1.8} />
            <span className="text-[9px]">Accueil</span>
          </Link>

          <Link
            href="/conseils"
            className="flex w-16 flex-col items-center gap-1.5 text-[#657a80]"
          >
            <Sparkles size={18} strokeWidth={1.8} />
            <span className="text-[9px]">Conseils</span>
          </Link>

          <div className="flex w-16 flex-col items-center gap-1">
            <Link
              href="/scanner"
              aria-label="Scanner"
              className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#168f91] to-[#756bd4] text-white shadow-[0_10px_28px_rgba(34,91,105,0.28)]"
            >
              <ScanFace size={21} strokeWidth={1.8} />
            </Link>
            <span className="text-[9px] font-medium text-[#425b62]">
              Scanner
            </span>
          </div>

          <Link
            href="/evolution"
            className="flex w-16 flex-col items-center gap-1.5 text-[#657a80]"
          >
            <TrendingUp size={18} strokeWidth={1.8} />
            <span className="text-[9px]">Évolution</span>
          </Link>

          <Link
            href="/profil"
            className="flex w-16 flex-col items-center gap-1.5 text-[#657a80]"
          >
            <UserRound size={18} strokeWidth={1.8} />
            <span className="text-[9px]">Profil</span>
          </Link>
        </div>
      </nav>
    </main>
  );
}
