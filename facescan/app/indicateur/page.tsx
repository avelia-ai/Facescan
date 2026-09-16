"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  Check,
  Droplets,
  Moon,
  ScanFace,
  Sparkles,
  TrendingUp,
  UserRound,
} from "lucide-react";

const data = {
  peau: {
    title: "Peau",
    value: 82,
    change: "+6",
    status: "Bonne",
    icon: Sparkles,
    accent: "#168f91",
    soft: "#e5faf7",
    observation:
      "Votre dernier scan montre une évolution visuelle favorable de cet indicateur.",
    factors:
      "L’environnement, le sommeil, les habitudes quotidiennes et la routine cutanée peuvent influencer les observations.",
    actions: [
      "Maintenir une routine régulière adaptée à votre peau",
      "Limiter les variations importantes de routine",
      "Observer l’évolution lors des prochains scans",
    ],
    history: [76, 78, 77, 79, 82],
  },

  hydratation: {
    title: "Hydratation",
    value: 74,
    change: "+9",
    status: "À surveiller",
    icon: Droplets,
    accent: "#287f86",
    soft: "#e5f7f7",
    observation:
      "L’apparence visuelle suggère un niveau d’hydratation perfectible lors de ce scan.",
    factors:
      "L’hydratation quotidienne, le sommeil, l’environnement et certains facteurs du quotidien peuvent faire varier les observations.",
    actions: [
      "Répartir votre consommation d’eau sur la journée",
      "Maintenir une routine de sommeil régulière",
      "Observer l’évolution lors des prochains scans",
    ],
    history: [61, 65, 66, 70, 74],
  },

  fatigue: {
    title: "Fatigue",
    value: 68,
    change: "-4",
    status: "Modérée",
    icon: Moon,
    accent: "#756bd4",
    soft: "#eeecff",
    observation:
      "Votre indicateur reste inférieur à vos autres indicateurs et mérite une attention particulière.",
    factors:
      "Le sommeil, la récupération, le rythme quotidien et l’environnement peuvent influencer les observations.",
    actions: [
      "Préserver des horaires de sommeil réguliers",
      "Accorder davantage de temps à la récupération",
      "Comparer cet indicateur sur plusieurs scans",
    ],
    history: [72, 71, 70, 69, 68],
  },

  equilibre: {
    title: "Équilibre",
    value: 79,
    change: "+3",
    status: "Stable",
    icon: Activity,
    accent: "#d96550",
    soft: "#fff0eb",
    observation:
      "Votre indicateur d’équilibre évolue de manière régulière et reste globalement stable.",
    factors:
      "Les habitudes quotidiennes, le sommeil, l’activité et le contexte général peuvent influencer cette observation.",
    actions: [
      "Conserver des habitudes quotidiennes régulières",
      "Maintenir un bon équilibre entre activité et récupération",
      "Continuer à suivre votre évolution",
    ],
    history: [74, 75, 77, 76, 79],
  },
};

const dates = ["13 août", "20 août", "27 août", "3 sept.", "10 sept."];

function IndicateurContent() {
  const searchParams = useSearchParams();
  const type = searchParams.get("type") || "hydratation";

  const current = data[type as keyof typeof data] ?? data.hydratation;
  const Icon = current.icon;

  const maxHistory = Math.max(...current.history);

  return (
    <main className="app-background min-h-screen text-[#172a31] pb-28">
      <div className="mx-auto w-full max-w-5xl px-5 sm:px-8">
        {/* Header */}
        <header className="flex items-center justify-between pt-7 sm:pt-9">
          <div className="flex items-center gap-3">
            <Link
              href="/resultats"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[#dbe6e7] bg-white shadow-[0_6px_20px_rgba(35,55,60,0.05)] transition hover:-translate-y-0.5"
              aria-label="Retour aux résultats"
            >
              <ArrowLeft size={18} strokeWidth={1.8} />
            </Link>

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#759095]">
                Otavio · Indicateur
              </p>
              <h1 className="mt-1 text-2xl font-semibold tracking-[-0.035em] text-[#102f3a]">
                {current.title}
              </h1>
            </div>
          </div>

          <Link
            href="/scanner"
            className="hidden items-center gap-2 rounded-full bg-[#102f3a] px-5 py-3 text-[12px] font-semibold text-white shadow-[0_10px_25px_rgba(16,47,58,0.15)] transition hover:-translate-y-0.5 sm:flex"
          >
            <ScanFace size={16} strokeWidth={1.8} />
            Nouveau scan
          </Link>
        </header>

        {/* Score hero */}
        <section className="relative mt-7 overflow-hidden rounded-[30px] bg-[#102f3a] p-6 text-white shadow-[0_22px_60px_rgba(16,47,58,0.16)] sm:p-8">
          <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-[#168f91]/25 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-28 right-20 h-56 w-56 rounded-full bg-[#756bd4]/20 blur-3xl" />

          <div className="relative flex flex-col justify-between gap-8 sm:flex-row sm:items-end">
            <div>
              <div className="flex items-center gap-2">
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-xl"
                  style={{ backgroundColor: `${current.accent}28` }}
                >
                  <Icon size={17} strokeWidth={1.8} />
                </div>

                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/45">
                    Observation visuelle
                  </p>
                  <p className="mt-0.5 text-[12px] text-white/75">
                    {current.status}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex items-end gap-3">
                <span className="text-7xl font-semibold tracking-[-0.07em]">
                  {current.value}
                </span>
                <span className="mb-2.5 text-sm text-white/35">/ 100</span>
              </div>
            </div>

            <div className="rounded-[22px] border border-white/10 bg-white/7 px-5 py-4 backdrop-blur-sm sm:min-w-[190px]">
              <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-white/40">
                Progression
              </p>

              <div className="mt-1.5 flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10">
                  <TrendingUp size={14} strokeWidth={1.9} />
                </div>

                <span className="text-xl font-semibold">{current.change}</span>

                <span className="text-[10px] text-white/40">
                  depuis le début
                </span>
              </div>
            </div>
          </div>

          <div className="relative mt-8">
            <div className="h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${current.value}%`,
                  background: `linear-gradient(90deg, ${current.accent}, #8bded4)`,
                }}
              />
            </div>

            <div className="mt-3 flex justify-between">
              <p className="text-[10px] text-white/35">0</p>
              <p className="text-[10px] text-white/35">Dernier scan</p>
              <p className="text-[10px] text-white/35">100</p>
            </div>
          </div>
        </section>

        {/* Understanding */}
        <section className="mt-9">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#789095]">
              Comprendre
            </p>

            <h2 className="mt-1 text-xl font-semibold tracking-[-0.03em] text-[#17333d]">
              Ce que Otavio observe
            </h2>
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-3">
            <article className="rounded-[25px] border border-[#dfe8e9] bg-white p-5 shadow-[0_10px_30px_rgba(35,55,60,0.045)]">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#e5faf7] text-[#168f91]">
                <Activity size={19} strokeWidth={1.7} />
              </div>

              <h3 className="mt-5 text-[15px] font-semibold text-[#17333d]">
                Observation principale
              </h3>

              <p className="mt-2 text-[12px] leading-6 text-[#668083]">
                {current.observation}
              </p>
            </article>

            <article className="rounded-[25px] border border-[#dfe8e9] bg-white p-5 shadow-[0_10px_30px_rgba(35,55,60,0.045)]">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#eeecff] text-[#756bd4]">
                <TrendingUp size={19} strokeWidth={1.7} />
              </div>

              <h3 className="mt-5 text-[15px] font-semibold text-[#17333d]">
                Évolution récente
              </h3>

              <p className="mt-2 text-[12px] leading-6 text-[#668083]">
                Votre indicateur est passé de{" "}
                <strong className="font-semibold text-[#17333d]">
                  {current.history[0]}
                </strong>{" "}
                à{" "}
                <strong className="font-semibold text-[#17333d]">
                  {current.value}
                </strong>{" "}
                sur la période observée.
              </p>
            </article>

            <article className="rounded-[25px] border border-[#dfe8e9] bg-white p-5 shadow-[0_10px_30px_rgba(35,55,60,0.045)]">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#fff0eb] text-[#d96550]">
                <Sparkles size={19} strokeWidth={1.7} />
              </div>

              <h3 className="mt-5 text-[15px] font-semibold text-[#17333d]">
                Facteurs à considérer
              </h3>

              <p className="mt-2 text-[12px] leading-6 text-[#668083]">
                {current.factors}
              </p>
            </article>
          </div>
        </section>

        {/* History */}
        <section className="mt-9 rounded-[27px] border border-[#dfe8e9] bg-white p-6 shadow-[0_10px_30px_rgba(35,55,60,0.045)] sm:p-7">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#789095]">
                Historique
              </p>

              <h2 className="mt-1 text-xl font-semibold tracking-[-0.03em] text-[#17333d]">
                Votre évolution
              </h2>
            </div>

            <span className="rounded-full bg-[#f1f6f6] px-3 py-1.5 text-[10px] font-medium text-[#70868a]">
              5 derniers scans
            </span>
          </div>

          <div className="mt-7">
            <div className="flex h-52 items-end gap-2 border-b border-[#e5eded] px-1 sm:gap-5">
              {current.history.map((value, index) => {
                const isLatest = index === current.history.length - 1;
                const height = Math.max(
                  22,
                  Math.round((value / maxHistory) * 145)
                );

                return (
                  <div
                    key={`${dates[index]}-${value}`}
                    className="flex h-full flex-1 flex-col items-center justify-end"
                  >
                    <span
                      className={`mb-2 text-[10px] font-semibold ${
                        isLatest ? "text-[#17333d]" : "text-[#789095]"
                      }`}
                    >
                      {value}
                    </span>

                    <div className="flex h-[150px] w-full items-end">
                      <div
                        className={`mx-auto w-full max-w-[48px] rounded-t-[14px] transition-all ${
                          isLatest
                            ? "shadow-[0_8px_20px_rgba(22,143,145,0.18)]"
                            : "bg-[#dfe9e9]"
                        }`}
                        style={{
                          height: `${height}px`,
                          ...(isLatest
                            ? {
                                background: `linear-gradient(180deg, ${current.accent}, #72c9c3)`,
                              }
                            : {}),
                        }}
                      />
                    </div>

                    <span className="mt-3 text-[9px] text-[#8aa0a3]">
                      {dates[index]}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Actions */}
        <section className="mt-9">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#789095]">
                Actions
              </p>

              <h2 className="mt-1 text-xl font-semibold tracking-[-0.03em] text-[#17333d]">
                Ce que vous pouvez faire
              </h2>
            </div>

            <Link
              href="/conseils"
              className="hidden items-center gap-1.5 text-[11px] font-semibold text-[#287f86] sm:flex"
            >
              Tous les conseils
              <ArrowRight size={14} strokeWidth={1.8} />
            </Link>
          </div>

          <div className="mt-5 grid gap-3">
            {current.actions.map((action, index) => (
              <div
                key={action}
                className="flex items-center gap-3 rounded-[20px] border border-[#dfe8e9] bg-white px-4 py-4 shadow-[0_6px_20px_rgba(35,55,60,0.035)]"
              >
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                    index === 0
                      ? "bg-[#e5faf7] text-[#168f91]"
                      : index === 1
                        ? "bg-[#eeecff] text-[#756bd4]"
                        : "bg-[#fff0eb] text-[#d96550]"
                  }`}
                >
                  <Check size={15} strokeWidth={2.2} />
                </div>

                <p className="text-[12px] leading-5 text-[#5e777c]">
                  {action}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Reminder */}
        <section className="mt-8 overflow-hidden rounded-[25px] border border-[#d8e9e7] bg-gradient-to-br from-[#e8faf7] via-white to-[#f0eeff] p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-[#168f91] shadow-[0_6px_18px_rgba(35,55,60,0.06)]">
              <Sparkles size={18} strokeWidth={1.7} />
            </div>

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#5d8084]">
                À retenir
              </p>

              <p className="mt-2 text-[13px] leading-6 text-[#557075]">
                Cet indicateur sert à suivre une évolution visuelle dans le
                temps. Il ne permet pas, à lui seul, de déterminer un état de
                santé.
              </p>
            </div>
          </div>
        </section>

        <p className="mt-8 max-w-3xl text-[10px] leading-5 text-[#82979a]">
          Otavio fournit des observations visuelles et des informations
          générales. Elles ne constituent pas un diagnostic médical et ne
          remplacent pas l’avis, l’examen ou le suivi d’un professionnel de
          santé.
        </p>
      </div>

      {/* Bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#dce5e4] bg-white/95 px-5 pb-[max(14px,env(safe-area-inset-bottom))] pt-3 backdrop-blur-xl">
        <div className="mx-auto flex max-w-md items-end justify-between">
          <Link
            href="/"
            className="flex w-16 flex-col items-center gap-1.5 text-[#789095]"
          >
            <Activity size={18} strokeWidth={1.8} />
            <span className="text-[9px]">Accueil</span>
          </Link>

          <Link
            href="/conseils"
            className="flex w-16 flex-col items-center gap-1.5 text-[#789095]"
          >
            <Sparkles size={18} strokeWidth={1.8} />
            <span className="text-[9px]">Conseils</span>
          </Link>

          <div className="flex w-16 flex-col items-center gap-1">
            <Link
              href="/scanner"
              className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-[#176678] to-[#756bd4] text-white shadow-[0_10px_28px_rgba(23,102,120,0.22)] transition hover:scale-[1.03]"
              aria-label="Scanner"
            >
              <ScanFace size={21} strokeWidth={1.8} />
            </Link>
            <span className="text-[9px] text-[#557075]">Scanner</span>
          </div>

          <Link
            href="/evolution"
            className="flex w-16 flex-col items-center gap-1.5 text-[#789095]"
          >
            <TrendingUp size={18} strokeWidth={1.8} />
            <span className="text-[9px]">Évolution</span>
          </Link>

          <Link
            href="/profil"
            className="flex w-16 flex-col items-center gap-1.5 text-[#789095]"
          >
            <UserRound size={18} strokeWidth={1.8} />
            <span className="text-[9px]">Profil</span>
          </Link>
        </div>
      </nav>
    </main>
  );
}

export default function IndicateurPage() {
  return (
    <Suspense
      fallback={<div className="app-background min-h-screen" />}
    >
      <IndicateurContent />
    </Suspense>
  );
}
