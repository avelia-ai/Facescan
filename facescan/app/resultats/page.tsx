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
  quality?: {
    qualityScore: number;
    qualityLabel: "Faible" | "Correcte" | "Bonne" | "Excellente";
    brightness: number;
    contrast: number;
    recommendations: string[];
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
  const [previousScan, setPreviousScan] = useState<StoredScan | null>(null);

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

          const previous = scans[1]?.indicators
            ? (scans[1] as StoredScan)
            : null;

          setPreviousScan(previous);

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

  const scoreChange =
    previousScan ? currentScore - previousScan.score : null;

  const scanQualityScore =
    latestScan?.quality?.qualityScore ?? null;

  const scanQualityLabel =
    latestScan?.quality?.qualityLabel ?? "Bonne";

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
    const previous = previousScan?.indicators?.[item.key] ?? null;
    const change = previous === null ? null : value - previous;

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
        <section className="mt-7 grid gap-5 lg:grid-cols-[0.92fr_1.08fr]">

          {/* SCORE CARD */}
          <div className="relative overflow-hidden rounded-[34px] bg-[linear-gradient(145deg,#102f3a_0%,#143f4c_48%,#214f6f_100%)] p-6 text-white shadow-[0_28px_75px_rgba(16,47,58,0.22)] sm:p-8">
            <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#49ddcb]/15 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 -left-20 h-72 w-72 rounded-full bg-[#7b74e1]/18 blur-3xl" />
            <div className="pointer-events-none absolute right-12 top-12 h-24 w-24 rounded-full border border-white/[0.06]" />

            <div className="relative flex items-start justify-between gap-4">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-white/45">
                  État global
                </p>
                <h2 className="mt-1.5 text-[18px] font-semibold tracking-[-0.03em]">
                  Votre lecture du jour
                </h2>
              </div>

              <span className="rounded-full border border-white/10 bg-white/[0.08] px-3 py-1.5 text-[9px] font-semibold text-white/65 backdrop-blur-sm">
                {scoreChange === null
                  ? "Premier scan"
                  : `${scoreChange >= 0 ? "+" : ""}${scoreChange} pts`}
              </span>
            </div>

            <div className="relative mt-8 flex items-center gap-7 sm:mt-10">
              <div
                className="relative flex h-[178px] w-[178px] shrink-0 items-center justify-center rounded-full"
                style={{
                  background: `conic-gradient(#72f0dc ${currentScore}%, rgba(255,255,255,0.08) ${currentScore}% 100%)`,
                }}
              >
                <div className="absolute inset-[10px] rounded-full bg-[#123943] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)]" />
                <div className="relative text-center">
                  <span className="block text-[64px] font-semibold leading-none tracking-[-0.08em]">
                    {currentScore}
                  </span>
                  <span className="mt-2 block text-[10px] font-semibold uppercase tracking-[0.16em] text-white/38">
                    sur 100
                  </span>
                </div>
              </div>

              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#72f0dc]/75">
                  Lecture Otavio
                </p>

                <p className="mt-3 text-[14px] font-medium leading-6 text-white/82">
                  {getScoreMessage(currentScore)}
                </p>

                <div className="mt-5 space-y-2">
                  <div className="flex items-center justify-between text-[9px]">
                    <span className="text-white/38">Niveau actuel</span>
                    <span className="font-semibold text-white/72">
                      {currentScore}/100
                    </span>
                  </div>

                  <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.08]">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#45d9ca] to-[#aaa4ff]"
                      style={{ width: `${currentScore}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="relative mt-7 grid grid-cols-2 gap-3">
              <div className="rounded-[20px] border border-white/8 bg-white/[0.06] p-3.5 backdrop-blur-sm">
                <p className="text-[9px] uppercase tracking-[0.14em] text-white/32">
                  Qualité du scan
                </p>
                <p className="mt-1.5 text-[13px] font-semibold text-white/88">
                  {scanQualityLabel}
                </p>
              </div>

              <div className="rounded-[20px] border border-white/8 bg-white/[0.06] p-3.5 backdrop-blur-sm">
                <p className="text-[9px] uppercase tracking-[0.14em] text-white/32">
                  Détection
                </p>
                <p className="mt-1.5 text-[13px] font-semibold text-white/88">
                  {faceDetected ? "Visage détecté" : "À vérifier"}
                </p>
              </div>
            </div>

            <div className="relative mt-5 flex items-center gap-2 border-t border-white/8 pt-4 text-[9px] text-white/32">
              <Sparkles size={12} className="text-[#72f0dc]" />
              {previousScan
                ? "Votre évolution est comparée à votre précédent scan."
                : "Votre premier scan devient votre point de référence."}
            </div>
          </div>

          {/* PHOTO / ANALYSE */}
          <div className="overflow-hidden rounded-[34px] border border-[#d9e5e7] bg-white shadow-[0_20px_55px_rgba(20,55,65,0.07)]">
            <div className="flex items-center justify-between border-b border-[#edf1f2] px-5 py-5 sm:px-7">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.21em] text-[#168f91]">
                  Analyse visuelle
                </p>
                <p className="mt-1 text-[12px] text-[#6c8086]">
                  Lecture du dernier scan
                </p>
              </div>

              <div className="flex items-center gap-2 rounded-full bg-[#eaf8f6] px-3 py-1.5 text-[9px] font-semibold text-[#168f91]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#38cbbb]" />
                {faceDetected ? "Visage détecté" : "Scan disponible"}
              </div>
            </div>

            <div className="p-5 sm:p-7">
              <div className="relative mx-auto aspect-[4/3] max-w-[560px] overflow-hidden rounded-[28px] bg-[#e9f1f2] shadow-[0_14px_35px_rgba(20,55,65,0.08)]">
                {scanPhoto ? (
                  <>
                    <img
                      src={scanPhoto}
                      alt="Photo utilisée pour le dernier scan"
                      className="absolute inset-0 h-full w-full object-cover"
                    />

                    <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(7,32,40,0.42),transparent_45%,rgba(255,255,255,0.03))]" />

                    {facePosition && (
                      <div
                        className="absolute rounded-[45%] border border-[#72f0dc]/85 shadow-[0_0_0_1px_rgba(255,255,255,0.28),0_0_30px_rgba(70,220,200,0.20)]"
                        style={{
                          left: `${facePosition.left}%`,
                          top: `${facePosition.top}%`,
                          width: `${facePosition.width}%`,
                          height: `${facePosition.height}%`,
                        }}
                      />
                    )}

                    <div className="absolute left-4 top-4 rounded-full border border-white/15 bg-[#102f3a]/72 px-3 py-1.5 text-[9px] font-semibold text-white backdrop-blur-md">
                      Analyse du visage
                    </div>

                    {scanQualityScore !== null && (
                      <div className="absolute bottom-4 right-4 rounded-2xl border border-white/15 bg-[#102f3a]/72 px-3 py-2 backdrop-blur-md">
                        <p className="text-[8px] uppercase tracking-[0.14em] text-white/42">
                          Qualité
                        </p>
                        <p className="mt-0.5 text-[13px] font-semibold text-white">
                          {scanQualityScore}%
                        </p>
                      </div>
                    )}
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

              <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
                <div className="rounded-[20px] border border-[#e0e8e9] bg-[#f6f9f9] px-4 py-3.5">
                  <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#74888d]">
                    Lecture du scan
                  </p>
                  <p className="mt-1 text-[11px] leading-5 text-[#61777e]">
                    {faceDetected
                      ? "Le visage détecté sert de zone de référence pour les indicateurs visuels."
                      : "La zone du visage n’a pas pu être confirmée avec suffisamment de précision."}
                  </p>
                </div>

                <Link
                  href="/scanner"
                  className="inline-flex items-center justify-center gap-2 rounded-[20px] border border-[#d9e5e7] bg-white px-4 py-3 text-[10px] font-bold text-[#168f91] shadow-[0_8px_20px_rgba(20,55,65,0.045)] transition hover:-translate-y-0.5"
                >
                  Nouveau scan
                  <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* INDICATORS */}
        <section className="mt-12">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-[#168f91]">
                Vos indicateurs
              </p>
              <h2 className="mt-1.5 text-2xl font-semibold tracking-[-0.045em] text-[#172a32]">
                Ce que votre scan révèle
              </h2>
              <p className="mt-2 max-w-xl text-[12px] leading-5 text-[#71858a]">
                Quatre indicateurs visuels pour comprendre votre lecture du jour
                et suivre leur évolution au fil des scans.
              </p>
            </div>

            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[#dce7e8] bg-white px-3 py-2 text-[9px] font-semibold text-[#6f8388] shadow-[0_8px_22px_rgba(20,55,65,0.045)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#42c9bd]" />
              Analyse du jour
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {indicators.map((item) => {
              const Icon = item.icon;
              const hasChange = item.change !== null;
              const positive =
                item.change !== null && item.change >= 0;

              return (
                <Link
                  key={item.key}
                  href={`/indicateur?type=${item.key === "fatigue" ? "fatigue" : item.key}`}
                  className="group relative overflow-hidden rounded-[28px] border border-[#dce6e8] bg-white p-5 shadow-[0_14px_38px_rgba(20,55,65,0.055),0_3px_8px_rgba(20,55,65,0.025)] transition duration-300 hover:-translate-y-1 hover:border-[#cfdedf] hover:shadow-[0_20px_48px_rgba(20,55,65,0.09)]"
                >
                  <div className={`pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full ${item.iconBg} opacity-60 blur-2xl`} />

                  <div className="relative flex items-start justify-between gap-3">
                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-[15px] ${item.iconBg} ${item.accent} shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]`}
                    >
                      <Icon size={19} strokeWidth={1.8} />
                    </div>

                    {hasChange ? (
                      <span
                        className={`rounded-full px-2.5 py-1.5 text-[9px] font-bold ${
                          positive
                            ? "bg-[#e8f8f5] text-[#168f91]"
                            : "bg-[#fff0ec] text-[#d96550]"
                        }`}
                      >
                        {positive ? "+" : ""}
                        {item.change} pts
                      </span>
                    ) : (
                      <span className="rounded-full bg-[#f3f6f6] px-2.5 py-1.5 text-[9px] font-semibold text-[#87979b]">
                        Référence
                      </span>
                    )}
                  </div>

                  <div className="relative mt-6">
                    <p className="text-[10px] font-semibold text-[#7b8d92]">
                      {item.label}
                    </p>

                    <div className="mt-1 flex items-end gap-1">
                      <span className="text-[38px] font-semibold leading-none tracking-[-0.07em] text-[#162a32]">
                        {item.value}
                      </span>
                      <span className="mb-1 text-[9px] font-medium text-[#9aabad]">
                        /100
                      </span>
                    </div>

                    <p className="mt-2 text-[10px] text-[#839397]">
                      {item.description}
                    </p>
                  </div>

                  <div className="relative mt-5">
                    <div className="h-2 overflow-hidden rounded-full bg-[#edf2f3]">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${item.bar} transition-all duration-700`}
                        style={{ width: `${item.value}%` }}
                      />
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-[9px] font-semibold text-[#536b72]">
                        {item.status}
                      </span>

                      <span className="flex items-center gap-1 text-[9px] font-bold text-[#168f91]">
                        Détails
                        <ArrowRight
                          size={12}
                          className="transition-transform group-hover:translate-x-0.5"
                        />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* DAILY PLAN */}
        <section className="mt-12">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-[#756bd4]">
                Aujourd’hui
              </p>
              <h2 className="mt-1.5 text-2xl font-semibold tracking-[-0.045em] text-[#172a32]">
                Votre plan du jour
              </h2>
              <p className="mt-2 max-w-xl text-[12px] leading-5 text-[#71858a]">
                Trois actions ciblées à partir de votre lecture du jour et de vos priorités.
              </p>
            </div>

            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-[#e0dcff] bg-[#f1efff] px-3 py-2 text-[9px] font-bold text-[#756bd4]">
              <Sparkles size={12} />
              Personnalisé
            </span>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            {dailyActions.map((action, index) => (
              <article
                key={action.title}
                className="group relative overflow-hidden rounded-[28px] border border-[#dce6e8] bg-white p-5 shadow-[0_14px_38px_rgba(20,55,65,0.055),0_3px_8px_rgba(20,55,65,0.025)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_48px_rgba(20,55,65,0.09)]"
              >
                <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-[#eef4ff] opacity-70 blur-2xl" />

                <div className="relative flex items-start justify-between gap-3">
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-[15px] ${action.tone} shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]`}
                  >
                    <span className="text-[11px] font-bold">
                      0{index + 1}
                    </span>
                  </div>

                  <span className="rounded-full bg-[#f4f7f7] px-2.5 py-1.5 text-[8px] font-bold uppercase tracking-[0.12em] text-[#87979b]">
                    Priorité
                  </span>
                </div>

                <div className="relative mt-6">
                  <h3 className="text-[15px] font-semibold tracking-[-0.02em] text-[#162a32]">
                    {action.title}
                  </h3>

                  <p className="mt-2 text-[11px] leading-5 text-[#71858a]">
                    {action.text}
                  </p>
                </div>

                <div className="relative mt-6 flex items-center justify-between border-t border-[#edf2f2] pt-4">
                  <div className="flex items-center gap-2 text-[9px] font-bold text-[#168f91]">
                    <CheckCircle2 size={13} />
                    À faire aujourd’hui
                  </div>

                  <span className="text-[9px] font-semibold text-[#a0afb2]">
                    Indicateur {action.score}/100
                  </span>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* EVOLUTION */}
        <section className="mt-12">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-[#3f9864]">
                Votre progression
              </p>
              <h2 className="mt-1.5 text-2xl font-semibold tracking-[-0.045em] text-[#172a32]">
                Votre évolution
              </h2>
              <p className="mt-2 max-w-xl text-[12px] leading-5 text-[#71858a]">
                Otavio compare vos scans au fil du temps pour faire apparaître les tendances.
              </p>
            </div>

            <Link
              href="/evolution"
              className="inline-flex w-fit items-center gap-2 rounded-full border border-[#dce9e2] bg-white px-3.5 py-2 text-[9px] font-bold text-[#3f9864] shadow-[0_8px_22px_rgba(20,55,65,0.045)] transition hover:-translate-y-0.5"
            >
              Ouvrir évolution
              <ArrowRight size={13} />
            </Link>
          </div>

          <div className="mt-6 overflow-hidden rounded-[30px] border border-[#dce6e8] bg-white shadow-[0_16px_42px_rgba(20,55,65,0.055)]">
            <div className="border-b border-[#edf2f2] bg-[linear-gradient(135deg,#fbfdfc_0%,#f4faf7_100%)] px-5 py-5 sm:px-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#3f9864]">
                    Lecture de tendance
                  </p>

                  <h3 className="mt-1.5 text-[16px] font-semibold tracking-[-0.02em] text-[#20343c]">
                    {previousScan
                      ? "Votre dernière évolution"
                      : "Votre point de départ"}
                  </h3>
                </div>

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[15px] bg-[#e8f7ee] text-[#3f9864]">
                  <TrendingUp size={19} strokeWidth={1.8} />
                </div>
              </div>

              <div className="mt-5 rounded-[22px] border border-[#dcebe3] bg-white/80 p-4 shadow-[0_8px_22px_rgba(35,90,65,0.04)]">
                {previousScan ? (
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-[9px] uppercase tracking-[0.14em] text-[#88999d]">
                        Score global
                      </p>

                      <div className="mt-1 flex items-end gap-2">
                        <span className="text-[30px] font-semibold leading-none tracking-[-0.06em] text-[#17313a]">
                          {currentScore}
                        </span>

                        <span
                          className={`mb-1 rounded-full px-2.5 py-1 text-[9px] font-bold ${
                            scoreChange !== null && scoreChange >= 0
                              ? "bg-[#e8f7ee] text-[#3f9864]"
                              : "bg-[#fff0ec] text-[#d96550]"
                          }`}
                        >
                          {scoreChange !== null && scoreChange >= 0 ? "+" : ""}
                          {scoreChange ?? 0} pts
                        </span>
                      </div>
                    </div>

                    <div className="text-left sm:text-right">
                      <p className="text-[9px] uppercase tracking-[0.14em] text-[#88999d]">
                        Scan précédent
                      </p>
                      <p className="mt-1 text-[14px] font-semibold text-[#304951]">
                        {previousScan.score}/100
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[13px] bg-[#eef7f1] text-[#3f9864]">
                      <Sparkles size={17} />
                    </div>

                    <div>
                      <p className="text-[11px] font-semibold text-[#304951]">
                        Votre premier scan est enregistré
                      </p>
                      <p className="mt-1 text-[10px] leading-5 text-[#7b8e93]">
                        Le prochain scan permettra à Otavio de mesurer vos évolutions.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="grid gap-3 p-5 sm:grid-cols-2 sm:p-6">
              {indicators.map((item) => {
                const hasChange = item.change !== null;
                const positive = item.change !== null ? item.change >= 0 : false;

                return (
                  <div
                    key={item.key}
                    className="rounded-[22px] border border-[#e2e9ea] bg-[#f8faf9] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-[11px] font-semibold text-[#304951]">
                          {item.label}
                        </p>
                        <p className="mt-1 text-[9px] text-[#899a9e]">
                          {hasChange
                            ? `Avant ${previousScan?.indicators[item.key]}`
                            : "Première mesure"}
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-[22px] font-semibold leading-none tracking-[-0.05em] text-[#17313a]">
                          {item.value}
                        </span>

                        {hasChange ? (
                          <p
                            className={`mt-1 text-[9px] font-bold ${
                              positive
                                ? "text-[#3f9864]"
                                : "text-[#d96550]"
                            }`}
                          >
                            {positive ? "+" : ""}
                            {item.change} pts
                          </p>
                        ) : (
                          <p className="mt-1 text-[9px] font-semibold text-[#8d9ca0]">
                            Référence
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#e7edef]">
                      {hasChange && previousScan ? (
                        <div className="relative h-full">
                          <div
                            className="absolute inset-y-0 left-0 rounded-full bg-[#d9e3e5]"
                            style={{
                              width: `${previousScan.indicators[item.key]}%`,
                            }}
                          />
                          <div
                            className={`absolute inset-y-0 left-0 rounded-full bg-gradient-to-r ${item.bar}`}
                            style={{
                              width: `${item.value}%`,
                            }}
                          />
                        </div>
                      ) : (
                        <div
                          className={`h-full rounded-full bg-gradient-to-r ${item.bar}`}
                          style={{ width: `${item.value}%` }}
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="border-t border-[#edf2f2] px-5 py-4 sm:px-6">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#edf7f1] text-[#3f9864]">
                  <Info size={14} />
                </div>

                <p className="text-[10px] leading-5 text-[#75878c]">
                  Les variations sont calculées uniquement à partir de vos scans
                  enregistrés. Un seul scan constitue une référence initiale.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* INSIGHTS */}
        <section className="mt-12">
          <div className="flex flex-col gap-2">
            <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-[#756bd4]">
              Interprétation Otavio
            </p>
            <h2 className="text-2xl font-semibold tracking-[-0.045em] text-[#172a32]">
              Ce que votre scan signifie
            </h2>
            <p className="max-w-2xl text-[12px] leading-5 text-[#71858a]">
              Otavio met en perspective vos observations visuelles pour vous aider à
              comprendre les principaux points à retenir aujourd’hui.
            </p>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <article className="relative overflow-hidden rounded-[30px] border border-[#dce9e2] bg-white p-5 shadow-[0_16px_42px_rgba(20,55,65,0.055)] sm:p-6">
              <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-[#e8f7ee] opacity-70 blur-3xl" />

              <div className="relative flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[15px] bg-[#e8f7ee] text-[#3f9864] shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
                  <CheckCircle2 size={19} strokeWidth={1.8} />
                </div>

                <div className="min-w-0">
                  <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#3f9864]">
                    Point positif
                  </p>
                  <h3 className="mt-1.5 text-[17px] font-semibold tracking-[-0.025em] text-[#20343c]">
                    {positiveInsight?.title ?? "Une dynamique positive"}
                  </h3>
                </div>
              </div>

              <div className="relative mt-5 rounded-[22px] bg-[linear-gradient(145deg,#f5fbf7_0%,#eef8f2_100%)] px-4 py-4">
                <p className="text-[11px] leading-5 text-[#5f757b]">
                  {positiveInsight?.text ??
                    "Votre scan présente plusieurs observations favorables."}
                </p>
              </div>
            </article>

            <article className="relative overflow-hidden rounded-[30px] border border-[#e2defb] bg-[linear-gradient(145deg,#fbfaff_0%,#f2efff_100%)] p-5 shadow-[0_16px_42px_rgba(71,64,130,0.055)] sm:p-6">
              <div className="pointer-events-none absolute -bottom-16 -right-10 h-36 w-36 rounded-full bg-[#c9c3ff]/25 blur-3xl" />

              <div className="relative flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[15px] bg-white/80 text-[#756bd4] shadow-[0_8px_20px_rgba(80,70,150,0.06)]">
                  <Droplets size={19} strokeWidth={1.8} />
                </div>

                <div className="min-w-0">
                  <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#756bd4]">
                    À surveiller
                  </p>
                  <h3 className="mt-1.5 text-[17px] font-semibold tracking-[-0.025em] text-[#24363e]">
                    {surveillanceTitle}
                  </h3>
                </div>
              </div>

              <div className="relative mt-5 rounded-[22px] border border-white/70 bg-white/65 px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
                <p className="text-[11px] leading-5 text-[#61767c]">
                  {attentionInsight?.text ??
                    "Ces axes font partie de vos priorités de suivi et méritent une attention régulière."}
                </p>
              </div>
            </article>
          </div>

          <div className="mt-4 flex items-start gap-3 rounded-[24px] border border-[#dce6e8] bg-white px-4 py-4 shadow-[0_10px_28px_rgba(20,55,65,0.04)]">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#eef7f6] text-[#168f91]">
              <Info size={15} />
            </div>

            <p className="text-[10px] leading-5 text-[#75878c]">
              Cette interprétation met en perspective des observations visuelles.
              Elle ne constitue pas une évaluation médicale et doit être lue comme
              un repère de suivi personnel.
            </p>
          </div>
        </section>

        {/* RELIABILITY */}
        <section className="mt-10">
          <div className="overflow-hidden rounded-[30px] border border-[#dce6e8] bg-white shadow-[0_14px_38px_rgba(20,55,65,0.05)]">
            <div className="flex items-start gap-4 border-b border-[#edf2f2] bg-[linear-gradient(135deg,#fbfdfc_0%,#f5faf9_100%)] px-5 py-5 sm:px-6">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[15px] bg-[#e8f7f5] text-[#168f91]">
                <Info size={18} strokeWidth={1.8} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#168f91]">
                  Qualité de l’analyse
                </p>
                <h2 className="mt-1.5 text-[17px] font-semibold tracking-[-0.025em] text-[#20343c]">
                  La qualité de votre scan
                </h2>
                <p className="mt-2 max-w-2xl text-[11px] leading-5 text-[#71858a]">
                  Ce niveau reflète les conditions visuelles de la photo utilisée
                  pour produire les observations présentées ci-dessus.
                </p>
              </div>

              <div className="hidden shrink-0 rounded-full bg-[#e8f7f5] px-3 py-1.5 text-[9px] font-bold text-[#168f91] sm:block">
                {scanQualityScore ?? 80} %
              </div>
            </div>

            <div className="p-5 sm:p-6">
              <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
                <div>
                  <div className="flex items-end justify-between gap-4">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.14em] text-[#8a9b9f]">
                        Conditions du scan
                      </p>
                      <p className="mt-1 text-[18px] font-semibold tracking-[-0.025em] text-[#20343c]">
                        {scanQualityLabel}
                      </p>
                    </div>

                    <span className="text-[22px] font-semibold tracking-[-0.05em] text-[#168f91]">
                      {scanQualityScore ?? 80}%
                    </span>
                  </div>

                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#e8eff0]">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#42c9bd] via-[#63d9d4] to-[#756bd4] transition-all duration-700"
                      style={{
                        width: `${scanQualityScore ?? 80}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="rounded-[22px] border border-[#e3eaeb] bg-[#f8faf9] px-4 py-3.5 lg:min-w-[230px]">
                  <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-[#899a9e]">
                    À retenir
                  </p>

                  <p className="mt-1.5 text-[10px] leading-5 text-[#63787e]">
                    {scanQualityScore !== null && scanQualityScore >= 80
                      ? "Les conditions de prise de vue sont favorables."
                      : scanQualityScore !== null && scanQualityScore >= 65
                        ? "Les conditions sont correctes, mais peuvent être améliorées."
                        : "Une meilleure lumière et une image plus nette amélioreront le prochain scan."}
                  </p>
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-[20px] bg-[#f7faf9] p-4">
                  <p className="text-[9px] uppercase tracking-[0.14em] text-[#899a9e]">
                    Ce que cela mesure
                  </p>
                  <p className="mt-1.5 text-[10px] leading-5 text-[#63787e]">
                    Lumière, contraste et conditions visuelles nécessaires à
                    l’analyse de l’image.
                  </p>
                </div>

                <div className="rounded-[20px] bg-[#f7faf9] p-4">
                  <p className="text-[9px] uppercase tracking-[0.14em] text-[#899a9e]">
                    Ce que cela ne mesure pas
                  </p>
                  <p className="mt-1.5 text-[10px] leading-5 text-[#63787e]">
                    Ce score ne représente ni une certitude médicale ni une
                    mesure clinique de votre état de santé.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* NEXT STEP */}
        <section className="relative mt-10 overflow-hidden rounded-[32px] bg-[linear-gradient(135deg,#102f3a_0%,#174b58_52%,#3b477f_100%)] p-6 text-white shadow-[0_24px_60px_rgba(16,47,58,0.18)] sm:p-7">
          <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-[#72f0dc]/12 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-[#aaa5ff]/14 blur-3xl" />
          <div className="pointer-events-none absolute right-10 top-10 h-28 w-28 rounded-full border border-white/[0.05]" />

          <div className="relative grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#72f0dc]/15 bg-[#72f0dc]/10 px-3 py-1.5 text-[9px] font-semibold text-[#a8f4ea]">
                <Sparkles size={12} />
                OTAVIO
              </div>

              <p className="mt-5 text-[9px] font-bold uppercase tracking-[0.2em] text-white/42">
                Prochaine étape
              </p>

              <h2 className="mt-2 text-[22px] font-semibold tracking-[-0.035em] sm:text-[25px]">
                Passez de l’analyse à l’action
              </h2>

              <p className="mt-2 max-w-2xl text-[11px] leading-5 text-white/58 sm:text-[12px]">
                Otavio peut maintenant transformer les observations de votre
                scan en conseils simples et personnalisés pour votre quotidien.
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                {[
                  "Conseils peau",
                  "Hydratation",
                  "Récupération",
                  "Alimentation",
                ].map((label) => (
                  <span
                    key={label}
                    className="rounded-full border border-white/10 bg-white/[0.07] px-3 py-1.5 text-[9px] font-medium text-white/62 backdrop-blur-sm"
                  >
                    {label}
                  </span>
                ))}
              </div>
            </div>

            <Link
              href="/conseils"
              className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-[20px] bg-white px-5 py-3 text-[10px] font-bold text-[#173f4a] shadow-[0_12px_30px_rgba(0,0,0,0.18)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#f5fffd] lg:min-w-[190px]"
            >
              Voir mes conseils
              <ArrowRight
                size={14}
                className="transition-transform duration-300 group-hover:translate-x-0.5"
              />
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
