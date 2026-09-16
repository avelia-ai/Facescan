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

const metrics = [
  { name: "Peau", value: 82, change: "+6", positive: true },
  { name: "Hydratation", value: 74, change: "+9", positive: true },
  { name: "Fatigue", value: 68, change: "-4", positive: true },
  { name: "Équilibre", value: 79, change: "+3", positive: true },
];

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
    : metrics.map((metric) => ({
        name: metric.name,
        value: metric.value,
      }));

  const scoreHistory = scans.length
    ? scans
        .slice()
        .reverse()
        .map((scan) => scan.score)
    : [52, 57, 55, 63, 61, 70, 68, 74, 71, 78];

  const currentScore = latestScan?.score ?? 78;
  const firstScore = scans.length
    ? scans[scans.length - 1].score
    : 68;
  const scoreChange = currentScore - firstScore;

  return (
    <main className="app-background min-h-screen text-[#17202a] pb-24 lg:pb-10">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-[#dce5e4] bg-white/92 backdrop-blur-xl">
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
            <p className="mt-0.5 text-[10px] text-[#6f8587]">
              Votre progression dans le temps
            </p>
          </div>

          <Link
            href="/scanner"
            className="flex h-10 items-center gap-2 rounded-full bg-gradient-to-r from-[#176678] to-[#287f88] px-4 text-xs font-semibold text-white shadow-[0_8px_22px_rgba(23,102,120,0.18)]"
          >
            <ScanFace size={15} />
            <span className="hidden sm:inline">Nouveau scan</span>
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-5 pt-8 md:px-8">
        {/* Intro */}
        <div className="mb-8">
          <p className="mb-2 text-xs font-medium uppercase tracking-[0.2em] text-[#668083]">
            Votre progression
          </p>

          <h1 className="text-3xl font-semibold tracking-[-0.035em] md:text-4xl">
            Votre évolution
          </h1>

          <p className="mt-3 max-w-xl text-sm leading-6 text-[#587174]">
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
              {scans.length > 1
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
          <div className="rounded-[30px] relative overflow-hidden bg-gradient-to-br from-[#183d48] via-[#195263] to-[#167b82] p-6 text-white shadow-[0_24px_60px_rgba(23,76,87,0.22)] md:p-8">
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

              <div className="flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs text-white/85 backdrop-blur-sm">
                <TrendingUp size={14} />
                {scoreChange >= 0 ? "+" : ""}
                {scoreChange}
              </div>
            </div>

            {/* Chart */}
            <div className="mt-8">
              <div className="flex h-40 items-end gap-2 md:gap-4">
                {scoreHistory.map((score, index) => (
                  <div
                    key={`${score}-${index}`}
                    className="group relative flex h-full flex-1 items-end"
                  >
                    <div
                      className="w-full rounded-t-xl bg-gradient-to-t from-[#72e5d5]/55 to-[#b5f4eb]/25 transition-all group-hover:from-[#72e5d5]/80 group-hover:to-[#d8fbf6]/45"
                      style={{ height: `${score}%` }}
                    />
                  </div>
                ))}
              </div>

              <div className="mt-3 flex justify-between gap-2 text-[10px] text-white/50">
                {(
                  scans.length
                    ? scans
                        .slice()
                        .reverse()
                        .map((scan) =>
                          new Date(scan.date).toLocaleDateString("fr-FR", {
                            day: "2-digit",
                            month: "short",
                          })
                        )
                    : ["13 août", "20 août", "27 août", "3 sept.", "Aujourd'hui"]
                ).map((label, index) => (
                  <span key={`${label}-${index}`}>{label}</span>
                ))}
              </div>
            </div>

            <div className="mt-6 flex items-center gap-2 border-t border-white/15 pt-5">
              <ArrowUp size={14} />
              <p className="text-xs text-white/75">
                Votre score progresse régulièrement depuis votre premier scan.
              </p>
            </div>
          </div>

          {/* Period selector + summary */}
          <div className="rounded-[30px] border border-[#dfe7e6] bg-white p-6 shadow-[0_14px_40px_rgba(35,55,60,0.05)] md:p-8">
            <div className="flex gap-2 rounded-full border border-[#e1ebe9] bg-[#f0f7f5] p-1">
              {["7 jours", "30 jours", "3 mois"].map((period, index) => (
                <button
                  key={period}
                  className={`flex-1 rounded-full px-3 py-2 text-[11px] font-medium ${
                    index === 1
                      ? "bg-white text-[#171717] shadow-sm"
                      : "text-[#718789]"
                  }`}
                >
                  {period}
                </button>
              ))}
            </div>

            <div className="mt-8">
              <p className="text-xs uppercase tracking-[0.16em] text-[#718789]">
                Depuis votre premier scan
              </p>

              <p className="mt-3 text-3xl font-semibold tracking-[-0.04em]">
                {scans.length > 1
                  ? `${scoreChange >= 0 ? "+" : ""}${scoreChange} point${Math.abs(scoreChange) > 1 ? "s" : ""}`
                  : "—"}
              </p>

              <p className="mt-2 text-sm leading-6 text-[#587174]">
                {scans.length > 1
                  ? `Votre dernier score est de ${currentScore}/100. ${
                      scoreChange > 0
                        ? `Vous progressez de ${scoreChange} point${scoreChange > 1 ? "s" : ""} depuis votre premier scan enregistré.`
                        : scoreChange < 0
                          ? `Votre score est inférieur de ${Math.abs(scoreChange)} point${Math.abs(scoreChange) > 1 ? "s" : ""} à votre premier scan enregistré.`
                          : "Votre score reste stable depuis votre premier scan enregistré."
                    }`
                  : scans.length === 1
                    ? "Premier scan enregistré. Un second scan permettra de mesurer votre évolution."
                    : "Effectuez votre premier scan pour commencer à suivre votre évolution dans le temps."}
              </p>
            </div>

            <div className="mt-7 rounded-2xl border border-[#e2eeeb] bg-[#f3faf8] p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white">
                  <Sparkles size={16} />
                </div>
                <div>
                  <p className="text-xs font-semibold">
                    {scans.length > 1
                      ? scoreChange > 0
                        ? "Tendance encourageante"
                        : scoreChange < 0
                          ? "Évolution à surveiller"
                          : "Tendance stable"
                      : scans.length === 1
                        ? "Premier scan enregistré"
                        : "En attente du premier scan"}
                  </p>
                  <p className="mt-0.5 text-[11px] text-[#587174]">
                    {scans.length > 1
                      ? "La comparaison de plusieurs scans permet de suivre votre tendance."
                      : scans.length === 1
                        ? "Un second scan permettra de comparer vos indicateurs."
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
                const previousMetric =
                  scans.length > 1
                    ? scans[1].indicators[
                        ["peau", "hydratation", "fatigue", "equilibre"][index] as keyof StoredScan["indicators"]
                      ]
                    : metric.value;

                const change = metric.value - previousMetric;

                return (
              <div
                key={metric.name}
                className="rounded-2xl border border-[#e2eeeb] bg-[#f5faf9] p-4"
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

                  <div className="flex items-center gap-1 text-[11px] font-medium">
                    <ArrowUp size={12} />
                    {change >= 0 ? "+" : ""}
                    {change}
                  </div>
                </div>

                <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-black/[0.07]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#42c9bd] to-[#6b8df4]"
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
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="rounded-[30px] border border-[#dfe7e6] bg-white p-6 shadow-[0_14px_40px_rgba(35,55,60,0.05)] md:p-8">
            <p className="text-xs uppercase tracking-[0.16em] text-[#718789]">
              Analyse
            </p>

            <h2 className="mt-2 text-xl font-semibold tracking-[-0.025em]">
              Ce qui s&apos;améliore
            </h2>

            <div className="mt-6 space-y-4">
              {[
                ["Hydratation", "+9 points", "Votre indicateur progresse."],
                ["Peau", "+6 points", "Une tendance positive se confirme."],
                ["Équilibre", "+3 points", "Une progression régulière."],
              ].map(([title, value, description]) => (
                <div
                  key={title}
                  className="flex items-center justify-between gap-4 border-b border-[#e0e9e7] pb-4 last:border-0 last:pb-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#e9f8f5]">
                      <ArrowUp size={15} />
                    </div>

                    <div>
                      <p className="text-xs font-medium">{title}</p>
                      <p className="mt-1 text-[11px] text-[#668083]">
                        {description}
                      </p>
                    </div>
                  </div>

                  <span className="text-xs font-semibold">{value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[30px] border border-[#dfe7e6] bg-white p-6 shadow-[0_14px_40px_rgba(35,55,60,0.05)] md:p-8">
            <p className="text-xs uppercase tracking-[0.16em] text-[#718789]">
              À surveiller
            </p>

            <h2 className="mt-2 text-xl font-semibold tracking-[-0.025em]">
              Ce qui mérite votre attention
            </h2>

            <div className="mt-6 rounded-2xl border border-[#e2eeeb] bg-[#f5faf9] p-5">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white">
                  <ArrowDown size={15} />
                </div>

                <div>
                  <p className="text-xs font-semibold">Fatigue</p>
                  <p className="mt-1 text-[11px] leading-5 text-[#587174]">
                    Votre indicateur reste à surveiller. Otavio pourra
                    comparer cette tendance avec vos prochaines analyses.
                  </p>
                </div>
              </div>
            </div>

            <Link
              href="/scanner"
              className="mt-5 flex items-center justify-between rounded-2xl border border-[#dce8e6] bg-[#f8fbfa] px-4 py-4 transition hover:bg-black/[0.02]"
            >
              <span className="text-xs font-medium">
                Faire un nouveau scan
              </span>
              <ChevronRight size={16} className="text-[#668083]" />
            </Link>
          </div>
        </div>

        {/* History */}
        <div className="mt-6 rounded-[30px] border border-[#dfe7e6] bg-white p-6 shadow-[0_14px_40px_rgba(35,55,60,0.05)] md:p-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-[#718789]">
                Historique
              </p>
              <h2 className="mt-2 text-xl font-semibold tracking-[-0.025em]">
                Vos scans
              </h2>
            </div>

            <button className="hidden items-center gap-1 text-xs font-medium text-[#587174] sm:flex">
              Tout afficher
              <ArrowRight size={14} />
            </button>
          </div>

          <div className="mt-6 divide-y divide-[#e0e9e7]">
            {scans.map((scan, index) => (
              <div
                key={scan.date}
                className="flex items-center justify-between py-4 first:pt-0 last:pb-0"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#edf7f5]">
                    <ScanFace size={17} />
                  </div>

                  <div>
                    <p className="text-xs font-medium">
                        {index === 0 ? "Dernier scan" : "Scan précédent"}
                      </p>
                    <p className="mt-1 text-[11px] text-[#668083]">
                      {new Date(scan.date).toLocaleDateString("fr-FR", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {index < scans.length - 1 && (
                    <span
                      className={`hidden text-[10px] font-medium sm:block ${
                        scan.score - scans[index + 1].score > 0
                          ? "text-[#4f514c]"
                          : scan.score - scans[index + 1].score < 0
                            ? "text-[#8a665f]"
                            : "text-[#99948c]"
                      }`}
                    >
                      {scan.score - scans[index + 1].score > 0 ? "+" : ""}
                      {scan.score - scans[index + 1].score} pt
                    </span>
                  )}

                  <div className="text-right">
                    <p className="text-sm font-semibold">{scan.score}/100</p>
                    {index < scans.length - 1 && (
                      <p className="mt-1 text-[10px] text-[#718789]">
                        Score global
                      </p>
                    )}
                  </div>

                  <ChevronRight size={15} className="text-black/25" />
                </div>
              </div>
            ))}
          </div>
        </div>

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
            className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#176678] to-[#756bd4] text-white shadow-[0_10px_28px_rgba(34,91,105,0.28)]"
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
