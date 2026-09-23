"use client";

import { useEffect, useState } from "react";

import Link from "next/link";
import {
  Activity,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Bell,
  ChevronRight,
  Droplets,
  Home,
  ScanFace,
  Sparkles,
  TrendingUp,
  User,
} from "lucide-react";



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
};



export default function EvolutionPage() {
  const [storedScans, setStoredScans] = useState<StoredScan[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<7 | 30 | 90>(30);

  useEffect(() => {
    const stored = localStorage.getItem("facescan-scans");

    if (!stored) return;

    try {
      const parsed = JSON.parse(stored);

      if (Array.isArray(parsed)) {
        const validScans = parsed.filter(
          (scan): scan is StoredScan =>
            scan &&
            typeof scan.id === "string" &&
            typeof scan.date === "string" &&
            typeof scan.score === "number" &&
            scan.indicators
        );

        setStoredScans(validScans);
      }
    } catch {
      setStoredScans([]);
    }
  }, []);

  const scans = storedScans
    .slice()
    .sort(
      (a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
    );

  const latestScan = scans[0];

  const currentMetrics = latestScan
    ? [
        { name: "Peau", value: latestScan.indicators.peau },
        { name: "Hydratation", value: latestScan.indicators.hydratation },
        { name: "Fatigue", value: latestScan.indicators.fatigue },
        { name: "Équilibre", value: latestScan.indicators.equilibre },
      ]
    : [];

  const scoreHistory = scans
    .slice()
    .reverse()
    .map((scan) => scan.score);

  const currentScore = latestScan?.score ?? null;
  const firstScore = scans.length
    ? scans[scans.length - 1].score
    : null;
  const scoreChange =
    scans.length > 1 && currentScore !== null && firstScore !== null
      ? currentScore - firstScore
      : null;

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - selectedPeriod);

  const periodScans = scans.filter(
    (scan) => new Date(scan.date).getTime() >= cutoffDate.getTime()
  );

  const periodScoreHistory = periodScans
    .slice()
    .reverse()
    .map((scan) => scan.score);

  const periodScoreChange =
    periodScans.length > 1
      ? periodScans[0].score -
        periodScans[periodScans.length - 1].score
      : null;

  return (
    <main className="app-background min-h-screen text-[#17202a] pb-24 lg:pb-10">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-transparent backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-6xl items-center justify-between px-5 md:px-8">
          <Link
            href="/"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[#dce5e4] bg-white shadow-[0_8px_25px_rgba(30,55,60,0.06)] transition hover:bg-[#f7fbfa]"
          >
            <ArrowLeft size={18} />
          </Link>

          <div className="text-center">
            <p className="text-sm font-semibold tracking-tight">
              Mon évolution
            </p>
            <p className="mt-0.5 text-[10px] text-white/70">
              Votre progression dans le temps
            </p>
          </div>

          <Link
            href="/scanner"
            className="flex h-10 items-center gap-2 rounded-full bg-gradient-to-r from-[#087ea4] to-[#12a6a6] px-4 text-xs font-semibold text-white shadow-[0_8px_22px_rgba(23,102,120,0.18)]"
          >
            <ScanFace size={15} />
            <span className="hidden sm:inline">Nouveau scan</span>
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-5 pt-8 md:px-8">
        {/* Intro */}
        <div className="mb-8">
          <p className="mb-2 text-xs font-medium uppercase tracking-[0.2em] text-white/70">
            Votre progression
          </p>

          <h1 className="text-3xl font-semibold tracking-[-0.035em] md:text-4xl text-white">
            Votre évolution
          </h1>

          <p className="mt-3 max-w-xl text-sm leading-6 text-white/75">
            Comparez vos analyses dans le temps et observez les tendances qui
            se dessinent progressivement.
          </p>
        </div>

        {/* Evolution summary */}
        <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-[22px] border border-[#dfe7e6] bg-white p-5 shadow-[0_10px_30px_rgba(35,55,60,0.045)]">
            <p className="text-[10px] uppercase tracking-[0.16em] text-[#718789]">
              Scans réalisés
            </p>
            <p className="mt-2 text-2xl font-semibold tracking-[-0.04em]">
              {scans.length}
            </p>
            <p className="mt-1 text-[11px] text-[#668083]">
              {scans.length === 0
                ? "Aucun scan enregistré"
                : scans.length === 1
                  ? "Premier scan enregistré"
                  : "Scans disponibles"}
            </p>
          </div>

          <div className="rounded-[22px] border border-[#dfe7e6] bg-white p-5 shadow-[0_10px_30px_rgba(35,55,60,0.045)]">
            <p className="text-[10px] uppercase tracking-[0.16em] text-[#718789]">
              Score actuel
            </p>
            <p className="mt-2 text-2xl font-semibold tracking-[-0.04em]">
              {scans.length ? currentScore : "—"}
              {scans.length > 0 && (
                <span className="ml-1 text-sm font-normal text-[#718789]">
                  /100
                </span>
              )}
            </p>
            <p className="mt-1 text-[11px] text-[#668083]">
              Dernier scan
            </p>
          </div>

          <div className="rounded-[22px] border border-[#dfe7e6] bg-white p-5 shadow-[0_10px_30px_rgba(35,55,60,0.045)]">
            <p className="text-[10px] uppercase tracking-[0.16em] text-[#718789]">
              Évolution
            </p>
            <p className="mt-2 text-2xl font-semibold tracking-[-0.04em]">
              {scans.length > 1 && scoreChange !== null
                ? `${scoreChange >= 0 ? "+" : ""}${scoreChange}`
                : "—"}
              {scans.length > 1 && (
                <span className="ml-1 text-sm font-normal text-[#718789]">
                  pt
                </span>
              )}
            </p>
            <p className="mt-1 text-[11px] text-[#668083]">
              {scans.length > 1
                ? "Depuis le premier scan"
                : "Disponible après 2 scans"}
            </p>
          </div>
        </div>

        {/* Main score */}
        <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-[30px] relative overflow-hidden bg-gradient-to-br from-[#0b5876] via-[#087ea4] to-[#12a6a6] p-6 text-white shadow-[0_24px_60px_rgba(23,76,87,0.22)] md:p-8">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-white/60">
                  Score global
                </p>
                <p className="mt-5 text-6xl font-semibold tracking-[-0.06em]">
                  {currentScore}
                  <span className="ml-1 text-xl font-normal text-white/50">
                    /100
                  </span>
                </p>
              </div>

              <div className="flex flex-col items-end gap-2.5">
                <div className="relative h-[78px] w-[78px] overflow-hidden rounded-[22px] border border-white/20 bg-white/10 shadow-[0_10px_28px_rgba(0,0,0,0.16)]">
                  <video
                    src="/otavio/video-evolution.mp4"
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="absolute inset-0 h-full w-full object-cover"
                    aria-label="Otavio vous accompagne dans votre évolution"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent" />
                </div>

                {scans.length > 1 && scoreChange !== null && (
                  <div className="flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs text-white/85 backdrop-blur-sm">
                    <TrendingUp size={14} />
                    {scoreChange >= 0 ? "+" : ""}
                    {scoreChange}
                  </div>
                )}
              </div>
            </div>

            {/* Chart */}
            <div className="mt-8">
              {periodScoreHistory.length > 0 ? (
                <>
                  <div className="flex h-40 items-end gap-2 md:gap-4">
                    {periodScoreHistory.map((score, index) => (
                      <div
                        key={`${score}-${index}`}
                        className="group relative flex h-full flex-1 items-end"
                      >
                        <div
                          className="w-full rounded-t-xl bg-gradient-to-t from-[#42cfc2]/85 to-[#b9f5ed]/35 transition-all group-hover:from-[#72e5d5]/80 group-hover:to-[#d8fbf6]/45"
                          style={{ height: `${Math.max(8, score)}%` }}
                        />
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 flex justify-between gap-2 text-[10px] text-white/50">
                    {scans
                      .slice()
                      .reverse()
                      .map((scan) =>
                        new Date(scan.date).toLocaleDateString("fr-FR", {
                          day: "2-digit",
                          month: "short",
                        })
                      )
                      .map((label, index) => (
                        <span key={`${label}-${index}`}>{label}</span>
                      ))}
                  </div>
                </>
              ) : (
                <div className="flex h-40 items-center justify-center rounded-[22px] border border-white/8 bg-white/[0.04] text-center">
                  <div>
                    <Sparkles size={20} className="mx-auto text-white/35" />
                    <p className="mt-3 text-[11px] font-medium text-white/60">
                      Votre historique apparaîtra ici
                    </p>
                    <p className="mt-1 text-[9px] text-white/35">
                      Lancez votre premier scan pour commencer le suivi.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 flex items-center gap-2 border-t border-white/15 pt-5">
              {scans.length > 1 && scoreChange !== null ? (
                <>
                  {scoreChange >= 0 ? (
                    <ArrowUp size={14} />
                  ) : (
                    <ArrowDown size={14} />
                  )}
                  <p className="text-xs text-white/75">
                    {scoreChange > 0
                      ? `Votre score a progressé de ${scoreChange} point${scoreChange > 1 ? "s" : ""} depuis votre premier scan.`
                      : scoreChange < 0
                        ? `Votre score a diminué de ${Math.abs(scoreChange)} point${Math.abs(scoreChange) > 1 ? "s" : ""} depuis votre premier scan.`
                        : "Votre score reste stable depuis votre premier scan."}
                  </p>
                </>
              ) : (
                <>
                  <Sparkles size={14} />
                  <p className="text-xs text-white/60">
                    {scans.length === 1
                      ? "Ce premier scan constitue votre point de référence."
                      : "Votre premier scan permettra de commencer votre suivi."}
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Period selector + summary */}
          <div className="rounded-[30px] border border-[#dfe7e6] bg-white p-6 shadow-[0_14px_40px_rgba(35,55,60,0.05)] md:p-8">
            <div className="flex gap-2 rounded-full border border-[#e1ebe9] bg-[#dff7f2] p-1">
              {[
                ["7 jours", 7],
                ["30 jours", 30],
                ["3 mois", 90],
              ].map(([label, days]) => (
                <button
                  key={label}
                  type="button"
                  onClick={() =>
                    setSelectedPeriod(days as 7 | 30 | 90)
                  }
                  className={`flex-1 rounded-full px-3 py-2 text-[11px] font-medium transition ${
                    selectedPeriod === days
                      ? "bg-white text-[#171717] shadow-sm"
                      : "text-[#718789] hover:text-[#304951]"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="mt-8">
              <p className="text-xs uppercase tracking-[0.16em] text-[#718789]">
                {selectedPeriod === 7
                  ? "Sur les 7 derniers jours"
                  : selectedPeriod === 30
                    ? "Sur les 30 derniers jours"
                    : "Sur les 3 derniers mois"}
              </p>

              <p className="mt-3 text-3xl font-semibold tracking-[-0.04em]">
                {periodScoreChange !== null
                  ? `${periodScoreChange >= 0 ? "+" : ""}${periodScoreChange} point${Math.abs(periodScoreChange) > 1 ? "s" : ""}`
                  : "—"}
              </p>

              <p className="mt-2 text-sm leading-6 text-[#587174]">
                {periodScans.length > 1
                  ? `Votre score est passé de ${periodScans[periodScans.length - 1].score}/100 à ${periodScans[0].score}/100 sur cette période.`
                  : periodScans.length === 1
                    ? "Un seul scan est disponible sur cette période."
                    : "Aucun scan enregistré sur cette période."}
              </p>
            </div>

            <div className="mt-7 rounded-2xl border border-[#e2eeeb] bg-[#e8f8f4] p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white">
                  <Sparkles size={16} />
                </div>
                <div>
                  <p className="text-xs font-semibold">
                    {periodScans.length > 1 && periodScoreChange !== null
                      ? periodScoreChange > 0
                        ? "Progression sur la période"
                        : periodScoreChange < 0
                          ? "Évolution à surveiller"
                          : "Tendance stable"
                      : periodScans.length === 1
                        ? "Scan de référence"
                        : "En attente d’un scan"}
                  </p>
                  <p className="mt-0.5 text-[11px] text-[#587174]">
                    {periodScans.length > 1
                      ? "Plusieurs scans permettent de comparer votre tendance sur la période choisie."
                      : periodScans.length === 1
                        ? "Un autre scan permettra de mesurer une évolution."
                        : "Vos prochaines analyses construiront votre historique."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Indicators */}
        <div className="mt-6 rounded-[30px] border border-[#dfe7e6] bg-white p-6 shadow-[0_14px_40px_rgba(35,55,60,0.05)] md:p-8">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-[#718789]">
                Indicateurs
              </p>
              <h2 className="mt-2 text-xl font-semibold tracking-[-0.025em]">
                Ce qui évolue
              </h2>
            </div>

            <p className="hidden text-[11px] text-[#718789] sm:block">
              Comparaison avec le premier scan
            </p>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {currentMetrics.map((metric, index) => (
              (() => {
                const metricKey =
                  ["peau", "hydratation", "fatigue", "equilibre"][index] as keyof StoredScan["indicators"];

                const referenceMetric =
                  scans.length > 1
                    ? scans[scans.length - 1].indicators[metricKey]
                    : null;

                const change =
                  referenceMetric === null
                    ? null
                    : metric.value - referenceMetric;

                return (
              <div
                key={metric.name}
                className="rounded-2xl border border-[#e2eeeb] bg-[#eaf8f6] p-4"
              >
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium">{metric.name}</p>

                  {metric.name === "Hydratation" ? (
                    <Droplets size={15} className="text-[#668083]" />
                  ) : (
                    <Activity size={15} className="text-[#668083]" />
                  )}
                </div>

                <div className="mt-5 flex items-end justify-between">
                  <p className="text-2xl font-semibold tracking-[-0.04em]">
                    {metric.value}
                  </p>

                  {change === null ? (
                    <span className="rounded-full bg-white px-2.5 py-1 text-[9px] font-semibold text-[#8a9a9e]">
                      Référence
                    </span>
                  ) : (
                    <div
                      className={`flex items-center gap-1 text-[11px] font-medium ${
                        change >= 0 ? "text-[#3f9864]" : "text-[#d96550]"
                      }`}
                    >
                      {change >= 0 ? (
                        <ArrowUp size={12} />
                      ) : (
                        <ArrowDown size={12} />
                      )}
                      {change >= 0 ? "+" : ""}
                      {change}
                    </div>
                  )}
                </div>

                <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-black/[0.07]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#12a6a6] via-[#42cfc2] to-[#7767e8]"
                    style={{ width: `${metric.value}%` }}
                  />
                </div>
              </div>
                );
              })()
            ))}
          </div>
        </div>

        {/* What changed */}
        <div className="mt-10 grid gap-5 lg:grid-cols-2">
          <div className="relative overflow-hidden rounded-[30px] border border-[#dce9e2] bg-white p-6 shadow-[0_16px_42px_rgba(20,55,65,0.055)] md:p-7">
            <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-[#dff6eb] opacity-60 blur-3xl" />

            <div className="relative">
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#3f9864]">
                Analyse
              </p>

              <h2 className="mt-1.5 text-[20px] font-semibold tracking-[-0.03em] text-[#17333d]">
                Ce qui évolue favorablement
              </h2>

              <p className="mt-2 text-[11px] leading-5 text-[#71858a]">
                {scans.length > 1
                  ? "Comparaison entre votre dernier scan et votre premier scan enregistré."
                  : "Les tendances apparaîtront après un second scan."}
              </p>

              <div className="mt-6 space-y-4">
                {currentMetrics.map((metric, index) => {
                  const metricKey =
                    ["peau", "hydratation", "fatigue", "equilibre"][index] as keyof StoredScan["indicators"];

                  const reference =
                    scans.length > 1
                      ? scans[scans.length - 1].indicators[metricKey]
                      : null;

                  const change =
                    reference === null ? null : metric.value - reference;

                  if (change === null || change <= 0) {
                    return null;
                  }

                  return (
                    <div
                      key={metric.name}
                      className="flex items-center justify-between gap-4 border-b border-[#e5eeea] pb-4 last:border-0 last:pb-0"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#d7f3e8] text-[#3f9864]">
                          <ArrowUp size={15} />
                        </div>

                        <div className="min-w-0">
                          <p className="text-[12px] font-semibold text-[#304951]">
                            {metric.name}
                          </p>
                          <p className="mt-1 text-[10px] text-[#7b8e93]">
                            {reference} → {metric.value}
                          </p>
                        </div>
                      </div>

                      <span className="shrink-0 text-[11px] font-bold text-[#3f9864]">
                        +{change} pts
                      </span>
                    </div>
                  );
                })}

                {scans.length <= 1 && (
                  <div className="rounded-[20px] bg-[#e8f8f3] p-4">
                    <p className="text-[11px] font-semibold text-[#304951]">
                      Pas encore de tendance
                    </p>
                    <p className="mt-1 text-[10px] leading-5 text-[#7b8e93]">
                      Votre prochain scan permettra à Otavio de comparer les
                      indicateurs et de faire apparaître les premières évolutions.
                    </p>
                  </div>
                )}

                {scans.length > 1 &&
                  currentMetrics.every((metric, index) => {
                    const key =
                      ["peau", "hydratation", "fatigue", "equilibre"][index] as keyof StoredScan["indicators"];
                    return metric.value <= scans[scans.length - 1].indicators[key];
                  }) && (
                    <div className="rounded-[20px] bg-[#e8f8f3] p-4">
                      <p className="text-[11px] font-semibold text-[#304951]">
                        Pas de progression mesurable
                      </p>
                      <p className="mt-1 text-[10px] leading-5 text-[#7b8e93]">
                        Aucun indicateur n’a augmenté entre votre premier et votre dernier scan.
                      </p>
                    </div>
                  )}
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[30px] border border-[#e5e1f6] bg-[linear-gradient(145deg,#ffffff_0%,#ebe7ff_100%)] p-6 shadow-[0_16px_42px_rgba(71,64,130,0.055)] md:p-7">
            <div className="pointer-events-none absolute -bottom-16 -right-16 h-40 w-40 rounded-full bg-[#9b8cff]/28 blur-3xl" />

            <div className="relative">
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#756bd4]">
                À surveiller
              </p>

              <h2 className="mt-1.5 text-[20px] font-semibold tracking-[-0.03em] text-[#24363e]">
                Ce qui mérite votre attention
              </h2>

              <p className="mt-2 text-[11px] leading-5 text-[#71858a]">
                {scans.length > 1
                  ? "Les indicateurs en baisse ou stables sont présentés sans interprétation médicale."
                  : "Une comparaison sera disponible après votre prochain scan."}
              </p>

              <div className="mt-6 space-y-4">
                {currentMetrics.map((metric, index) => {
                  const metricKey =
                    ["peau", "hydratation", "fatigue", "equilibre"][index] as keyof StoredScan["indicators"];

                  const reference =
                    scans.length > 1
                      ? scans[scans.length - 1].indicators[metricKey]
                      : null;

                  const change =
                    reference === null ? null : metric.value - reference;

                  if (change === null || change >= 0) {
                    return null;
                  }

                  return (
                    <div
                      key={metric.name}
                      className="flex items-center justify-between gap-4 border-b border-[#e7e4f2] pb-4 last:border-0 last:pb-0"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#e1dcff] text-[#756bd4]">
                          <ArrowDown size={15} />
                        </div>

                        <div className="min-w-0">
                          <p className="text-[12px] font-semibold text-[#304951]">
                            {metric.name}
                          </p>
                          <p className="mt-1 text-[10px] text-[#7b8e93]">
                            {reference} → {metric.value}
                          </p>
                        </div>
                      </div>

                      <span className="shrink-0 text-[11px] font-bold text-[#d96550]">
                        {change} pts
                      </span>
                    </div>
                  );
                })}

                {scans.length <= 1 && (
                  <div className="rounded-[20px] border border-white/70 bg-white/70 p-4">
                    <p className="text-[11px] font-semibold text-[#304951]">
                      Suivi en construction
                    </p>
                    <p className="mt-1 text-[10px] leading-5 text-[#7b8e93]">
                      Otavio attend votre prochaine analyse pour identifier les
                      évolutions qui méritent votre attention.
                    </p>
                  </div>
                )}

                {scans.length > 1 &&
                  currentMetrics.every((metric, index) => {
                    const key =
                      ["peau", "hydratation", "fatigue", "equilibre"][index] as keyof StoredScan["indicators"];
                    return metric.value >= scans[scans.length - 1].indicators[key];
                  }) && (
                    <div className="rounded-[20px] border border-white/70 bg-white/70 p-4">
                      <p className="text-[11px] font-semibold text-[#304951]">
                        Aucun indicateur en baisse
                      </p>
                      <p className="mt-1 text-[10px] leading-5 text-[#7b8e93]">
                        Votre dernier scan ne présente pas de baisse par rapport au premier scan enregistré.
                      </p>
                    </div>
                  )}
              </div>

              <Link
                href="/scanner"
                className="mt-6 flex items-center justify-between rounded-[20px] border border-white/80 bg-white/75 px-4 py-4 shadow-[0_8px_22px_rgba(71,64,130,0.045)] transition hover:-translate-y-0.5"
              >
                <span className="text-[10px] font-bold text-[#756bd4]">
                  Faire un nouveau scan
                </span>
                <ChevronRight size={16} className="text-[#756bd4]" />
              </Link>
            </div>
          </div>
        </div>

        {/* History */}
        <section className="mt-10 overflow-hidden rounded-[30px] border border-[#dce6e8] bg-white shadow-[0_16px_42px_rgba(20,55,65,0.055)]">
          <div className="border-b border-[#edf2f2] bg-[linear-gradient(135deg,#e5faf5_0%,#f2edff_100%)] px-5 py-5 sm:px-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#168f91]">
                  Historique
                </p>

                <h2 className="mt-1.5 text-[18px] font-semibold tracking-[-0.025em] text-[#17333d]">
                  Vos scans
                </h2>

                <p className="mt-1.5 text-[10px] leading-5 text-[#7a8e93]">
                  Chaque analyse enrichit progressivement votre suivi personnel.
                </p>
              </div>

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[15px] bg-[#d5f5ee] text-[#168f91]">
                <ScanFace size={18} strokeWidth={1.8} />
              </div>
            </div>
          </div>

          <div className="p-5 sm:p-6">
            {scans.length > 0 ? (
              <div className="space-y-3">
                {scans.map((scan, index) => {
                  const previous =
                    index < scans.length - 1 ? scans[index + 1] : null;

                  const change = previous
                    ? scan.score - previous.score
                    : null;

                  const dateLabel = new Date(scan.date).toLocaleDateString(
                    "fr-FR",
                    {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    }
                  );

                  return (
                    <div
                      key={scan.id}
                      className="group rounded-[22px] border border-[#e1e9ea] bg-[#edf8f6] p-4 transition duration-300 hover:border-[#d4e3e3] hover:bg-white hover:shadow-[0_10px_26px_rgba(20,55,65,0.045)]"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[15px] bg-white text-[#168f91] shadow-[0_6px_16px_rgba(20,55,65,0.045)]">
                          <ScanFace size={17} strokeWidth={1.8} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-[11px] font-semibold text-[#304951]">
                              {index === 0 ? "Dernier scan" : `Scan ${scans.length - index}`}
                            </p>

                            {index === 0 && (
                              <span className="rounded-full bg-[#d5f5ee] px-2.5 py-1 text-[8px] font-bold text-[#168f91]">
                                LE PLUS RÉCENT
                              </span>
                            )}
                          </div>

                          <p className="mt-1 text-[9px] text-[#83969a]">
                            {dateLabel}
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="text-[20px] font-semibold leading-none tracking-[-0.05em] text-[#17313a]">
                            {scan.score}
                            <span className="ml-1 text-[9px] font-medium tracking-normal text-[#9aa8ab]">
                              /100
                            </span>
                          </p>

                          {change !== null ? (
                            <p
                              className={`mt-1.5 text-[9px] font-bold ${
                                change >= 0
                                  ? "text-[#3f9864]"
                                  : "text-[#d96550]"
                              }`}
                            >
                              {change >= 0 ? "+" : ""}
                              {change} pts
                            </p>
                          ) : (
                            <p className="mt-1.5 text-[9px] font-semibold text-[#8d9ca0]">
                              Référence
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="mt-4 grid grid-cols-4 gap-2">
                        {[
                          ["Peau", scan.indicators.peau],
                          ["Hydratation", scan.indicators.hydratation],
                          ["Fatigue", scan.indicators.fatigue],
                          ["Équilibre", scan.indicators.equilibre],
                        ].map(([label, value]) => (
                          <div
                            key={label}
                            className="rounded-[15px] bg-white px-2.5 py-2.5"
                          >
                            <p className="truncate text-[8px] uppercase tracking-[0.08em] text-[#97a5a8]">
                              {label}
                            </p>
                            <p className="mt-1 text-[12px] font-semibold text-[#304951]">
                              {value}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-[24px] border border-dashed border-[#d8e5e5] bg-[#edf8f6] px-5 py-10 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-[16px] bg-white text-[#168f91] shadow-[0_8px_20px_rgba(20,55,65,0.045)]">
                  <ScanFace size={20} strokeWidth={1.7} />
                </div>

                <p className="mt-4 text-[12px] font-semibold text-[#304951]">
                  Aucun scan enregistré
                </p>

                <p className="mx-auto mt-1.5 max-w-sm text-[10px] leading-5 text-[#7b8e93]">
                  Votre historique apparaîtra ici dès votre première analyse.
                </p>

                <Link
                  href="/scanner"
                  className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#087ea4] px-4 py-2.5 text-[9px] font-bold text-white shadow-[0_8px_20px_rgba(23,63,74,0.16)] transition hover:-translate-y-0.5"
                >
                  Faire mon premier scan
                  <ArrowRight size={13} />
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* Disclaimer */}
        <div className="mx-auto mt-8 flex max-w-2xl items-start gap-3 px-3 pb-4">
          <Bell
            size={15}
            className="mt-0.5 shrink-0 text-[#6b8183]"
            strokeWidth={1.5}
          />
          <p className="text-[10px] leading-4 text-[#6f8587]">
            Les évolutions présentées sont basées sur les analyses visuelles
            réalisées dans Otavio. Elles sont informatives et ne constituent
            pas un diagnostic médical.
          </p>
        </div>
      </section>

      {/* Mobile navigation */}
      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-[#dce5e4] bg-white/95 backdrop-blur-xl lg:hidden">
        <div className="mx-auto flex h-[72px] max-w-[500px] items-center justify-around px-3">
          <Link
            href="/"
            className="flex flex-col items-center gap-1.5 text-[#6b8183]"
          >
            <Home size={18} strokeWidth={1.8} />
            <span className="text-[9px]">Accueil</span>
          </Link>

          <Link
            href="/conseils"
            className="flex flex-col items-center gap-1.5 text-[#6b8183]"
          >
            <Sparkles size={18} strokeWidth={1.6} />
            <span className="text-[9px]">Conseils</span>
          </Link>

          <Link
            href="/scanner"
            className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#087ea4] via-[#12a6a6] to-[#7767e8] text-white shadow-[0_10px_28px_rgba(34,91,105,0.28)]"
          >
            <ScanFace size={21} strokeWidth={1.5} />
          </Link>

          <Link
            href="/evolution"
            className="flex flex-col items-center gap-1.5 text-[#171717]"
          >
            <TrendingUp size={18} strokeWidth={1.7} />
            <span className="text-[9px] font-medium">Évolution</span>
          </Link>

          <Link
            href="/profil"
            className="flex flex-col items-center gap-1.5 text-[#6b8183]"
          >
            <User size={18} strokeWidth={1.6} />
            <span className="text-[9px]">Profil</span>
          </Link>
        </div>
      </nav>
    </main>
  );
}
