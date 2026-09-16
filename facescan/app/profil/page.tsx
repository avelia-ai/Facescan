"use client";

import { useEffect, useState } from "react";

import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { getOtavioProgress } from "@/lib/otavio-progression";
import {
  Activity,
  ArrowLeft,
  Bell,
  ChevronRight,
  Droplets,
  LockKeyhole,
  Moon,
  ScanFace,
  Settings,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  UserRound,
  LogOut,
} from "lucide-react";

const profileSections = [
  {
    icon: Target,
    title: "Mes objectifs",
    text: "Suivre votre peau, votre hydratation, votre récupération et votre équilibre.",
  },
  {
    icon: Bell,
    title: "Notifications",
    text: "Recevoir des rappels et informations utiles au bon moment.",
  },
  {
    icon: ShieldCheck,
    title: "Confidentialité",
    text: "Gérer vos données et les préférences liées à vos analyses.",
  },
  {
    icon: Settings,
    title: "Paramètres",
    text: "Gérer votre compte et les préférences de l’application.",
  },
];

export default function ProfilPage() {
  const [scanFrequency, setScanFrequency] = useState(7);
  const [scanCount, setScanCount] = useState(0);
  const [currentScore, setCurrentScore] = useState<number | null>(null);
  const [previousScore, setPreviousScore] = useState<number | null>(null);
  const [xp, setXp] = useState(0);
  const [stage, setStage] = useState(1);
  const [streak, setStreak] = useState(0);

  const handleSignOut = async () => {
    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();

    await supabase.auth.signOut();
    window.location.href = "/connexion";
  };

  useEffect(() => {
    const loadProfileStats = async () => {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = "/connexion";
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("otavio_xp, otavio_stage, otavio_streak")
        .eq("id", user.id)
        .maybeSingle();

      const nextXp = profile?.otavio_xp ?? 0;
      const progress = getOtavioProgress(nextXp);

      setXp(nextXp);
      setStage(progress.stage);
      setStreak(profile?.otavio_streak ?? 0);

      const storedScans = localStorage.getItem("facescan-scans");

      if (!storedScans) return;

      try {
        const scans = JSON.parse(storedScans);

        if (Array.isArray(scans) && scans.length > 0) {
          setScanCount(scans.length);

          const scores = scans
            .map((scan) => scan?.score)
            .filter((score) => typeof score === "number");

          if (scores.length > 0) {
            setCurrentScore(scores[0]);
          }

          if (scores.length > 1) {
            setPreviousScore(scores[1]);
          }
        }
      } catch {
        setScanCount(0);
      }
    };

    loadProfileStats();
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem("facescan-scan-frequency");

    if (!stored) return;

    const value = Number(stored);

    if ([3, 7, 14, 30].includes(value)) {
      setScanFrequency(value);
    }
  }, []);

  const updateScanFrequency = (value: number) => {
    setScanFrequency(value);
    localStorage.setItem("facescan-scan-frequency", String(value));
  };

  return (
    <main className="app-background min-h-screen text-[#17202a] pb-28">
      <div className="mx-auto w-full max-w-5xl px-5 sm:px-8">
        <header className="flex items-center justify-between pt-7 sm:pt-9">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[#dce5e4] bg-white shadow-[0_8px_25px_rgba(30,55,60,0.06)]"
              aria-label="Retour à l’accueil"
            >
              <ArrowLeft size={18} strokeWidth={1.8} />
            </Link>

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#6f8587]">
                Otavio
              </p>
              <h1 className="mt-1 text-2xl font-semibold tracking-[-0.03em] text-white">
                Mon profil
              </h1>
            </div>
          </div>

          <Link
            href="/scanner"
            className="hidden items-center gap-2 rounded-full bg-gradient-to-r from-[#176678] to-[#287f88] px-5 py-3 text-[12px] font-semibold text-white shadow-[0_10px_25px_rgba(23,102,120,0.18)] sm:flex"
          >
            <ScanFace size={16} strokeWidth={1.8} />
            Nouveau scan
          </Link>

          <button
            type="button"
            onClick={handleSignOut}
            className="flex items-center gap-2 rounded-full border border-[#ead8d4] bg-white px-4 py-3 text-[12px] font-semibold text-[#b45a48] shadow-sm transition hover:bg-[#fff5f2]"
          >
            <LogOut size={15} strokeWidth={1.8} />
            Déconnexion
          </button>
        </header>

        <div className="mt-5 sm:hidden">
          <button
            type="button"
            onClick={handleSignOut}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-[#ead8d4] bg-white px-4 py-3.5 text-sm font-semibold text-[#b45a48]"
          >
            <LogOut size={17} strokeWidth={1.8} />
            Se déconnecter
          </button>
        </div>

        <section className="mt-8 relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#183d48] via-[#195263] to-[#167b82] p-6 text-white shadow-[0_24px_60px_rgba(23,76,87,0.22)] sm:p-8">
          <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-[#63e4d4]/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-20 h-64 w-64 rounded-full bg-[#8d8df5]/20 blur-3xl" />
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-white/12">
              <UserRound size={34} strokeWidth={1.5} />
            </div>

            <div className="flex-1">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/60">
                Votre espace personnel
              </p>

              <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em]">
                Bonjour
              </h2>

              <p className="mt-2 max-w-xl text-[13px] leading-6 text-white/70">
                Votre profil permet à Otavio de mieux contextualiser vos
                analyses et d’adapter progressivement votre expérience.
              </p>
            </div>
          </div>

          <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              ["Scans", String(scanCount)],
              ["Score actuel", currentScore !== null ? String(currentScore) : "—"],
              [
                "Progression",
                currentScore !== null && previousScore !== null
                  ? `${currentScore - previousScore >= 0 ? "+" : ""}${currentScore - previousScore}`
                  : "—",
              ],
              ["Série", `${streak} j`],
            ].map(([label, value]) => (
              <div
                key={label}
                className="rounded-2xl border border-white/15 bg-white/10 backdrop-blur-sm px-4 py-3"
              >
                <p className="text-[9px] uppercase tracking-[0.14em] text-white/55">
                  {label}
                </p>
                <p className="mt-1 text-lg font-semibold">{value}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-8">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#668083]">
            Ma personnalisation
          </p>

          <h2 className="mt-1 text-xl font-semibold tracking-[-0.025em]">
            Les informations qui façonnent votre expérience
          </h2>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <Link
              href="/objectifs"
              className="group block w-full rounded-[24px] border border-[#e0e9e7] bg-white p-5 shadow-[0_10px_30px_rgba(35,55,60,0.045)] text-left transition hover:-translate-y-0.5"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#e9f8f5]">
                  <Target size={18} strokeWidth={1.7} />
                </div>
                <span className="rounded-full bg-[#e9f8f5] px-2.5 py-1 text-[9px] font-semibold text-[#287b78]">
                  À compléter
                </span>
              </div>

              <h3 className="mt-5 text-[16px] font-semibold">
                Mes objectifs
              </h3>

              <p className="mt-2 text-[12px] leading-6 text-[#587174]">
                Choisissez les aspects que vous souhaitez particulièrement
                suivre dans le temps.
              </p>

              <div className="mt-5 flex items-center gap-2 text-[11px] font-semibold">
                Configurer
                <ChevronRight
                  size={14}
                  strokeWidth={1.8}
                  className="transition-transform group-hover:translate-x-0.5"
                />
              </div>
            </Link>

            <article className="rounded-[24px] border border-[#e0e9e7] bg-white p-5 shadow-[0_10px_30px_rgba(35,55,60,0.045)]">
              <div className="flex items-start justify-between gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#e9f8f5]">
                  <Activity size={18} strokeWidth={1.7} />
                </div>

                <span className="rounded-full bg-[#e9f8f5] px-2.5 py-1 text-[9px] font-semibold text-[#287b78]">
                  {scanFrequency} jours
                </span>
              </div>

              <h3 className="mt-5 text-[16px] font-semibold">
                Fréquence de suivi
              </h3>

              <p className="mt-2 text-[12px] leading-6 text-[#587174]">
                Choisissez à quelle fréquence Otavio vous suggère de refaire
                une analyse.
              </p>

              <div className="mt-5 grid grid-cols-4 gap-2">
                {[3, 7, 14, 30].map((days) => {
                  const active = scanFrequency === days;

                  return (
                    <button
                      key={days}
                      type="button"
                      onClick={() => updateScanFrequency(days)}
                      className={`rounded-xl border px-2 py-2.5 text-[10px] font-semibold transition ${
                        active
                          ? "border-[#167b82] bg-[#eaf8f5] text-[#167b82]"
                          : "border-[#e2e9e8] bg-[#fafcfc] text-[#708486] hover:bg-[#f2f8f7]"
                      }`}
                    >
                      {days} j
                    </button>
                  );
                })}
              </div>

              <p className="mt-4 text-[10px] leading-5 text-[#809092]">
                Otavio vous proposera un nouveau scan après {scanFrequency}{" "}
                jour{scanFrequency > 1 ? "s" : ""}.
              </p>

              <button
                type="button"
                className="mt-5 flex items-center gap-2 text-[11px] font-semibold"
              >
                Modifier
                <ChevronRight size={14} strokeWidth={1.8} />
              </button>
            </article>
          </div>
        </section>

        <section className="mt-10">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#668083]">
            Votre suivi
          </p>

          <h2 className="mt-1 text-xl font-semibold tracking-[-0.025em]">
            Vue d’ensemble
          </h2>

          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: "Peau", value: "82", icon: Sparkles, trend: "+6" },
              {
                label: "Hydratation",
                value: "74",
                icon: Droplets,
                trend: "+9",
              },
              { label: "Fatigue", value: "68", icon: Moon, trend: "-4" },
              {
                label: "Équilibre",
                value: "79",
                icon: Activity,
                trend: "+3",
              },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.label}
                  href={`/indicateur?type=${item.label
                    .toLowerCase()
                    .normalize("NFD")
                    .replace(/[\u0300-\u036f]/g, "")}`}
                  className="rounded-[22px] border border-[#e0e9e7] bg-white p-4 shadow-[0_10px_30px_rgba(35,55,60,0.045)] transition hover:-translate-y-0.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#e9f8f5]">
                      <Icon size={17} strokeWidth={1.7} />
                    </div>

                    <TrendingUp
                      size={14}
                      strokeWidth={1.7}
                      className="text-[#668083]"
                    />
                  </div>

                  <p className="mt-4 text-[10px] text-[#718789]">
                    {item.label}
                  </p>

                  <div className="mt-1 flex items-baseline gap-1">
                    <span className="text-2xl font-semibold tracking-[-0.03em]">
                      {item.value}
                    </span>
                    <span className="text-[10px] text-[#8aa0a1]">/100</span>
                  </div>

                  <p className="mt-2 text-[10px] font-semibold text-[#587174]">
                    {item.trend}
                  </p>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="mt-10">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#668083]">
            Gestion
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {profileSections.map((item) => {
              const Icon = item.icon;

              const href =
                item.title === "Notifications"
                  ? "/notifications"
                  : item.title === "Confidentialité"
                    ? "/confidentialite"
                    : item.title === "Paramètres"
                      ? "/parametres"
                      : "#";

              if (href !== "#") {
                return (
                  <Link
                    key={item.title}
                    href={href}
                    className="group flex items-center gap-4 rounded-[22px] border border-[#e0e9e7] bg-white p-5 shadow-[0_10px_30px_rgba(35,55,60,0.045)] text-left transition hover:-translate-y-0.5"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#e9f8f5]">
                      <Icon size={19} strokeWidth={1.7} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="text-[14px] font-semibold">{item.title}</h3>
                      <p className="mt-1 text-[11px] leading-5 text-[#587174]">
                        {item.text}
                      </p>
                    </div>

                    <ChevronRight
                      size={16}
                      strokeWidth={1.8}
                      className="shrink-0 text-[#718789] transition-transform group-hover:translate-x-0.5"
                    />
                  </Link>
                );
              }

              return (
                <button
                  key={item.title}
                  type="button"
                  className="group flex items-center gap-4 rounded-[22px] border border-[#e0e9e7] bg-white p-5 shadow-[0_10px_30px_rgba(35,55,60,0.045)] text-left transition hover:-translate-y-0.5"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#e9f8f5]">
                    <Icon size={19} strokeWidth={1.7} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="text-[14px] font-semibold">{item.title}</h3>
                    <p className="mt-1 text-[11px] leading-5 text-[#587174]">
                      {item.text}
                    </p>
                  </div>

                  <ChevronRight
                    size={16}
                    strokeWidth={1.8}
                    className="shrink-0 text-[#718789] transition-transform group-hover:translate-x-0.5"
                  />
                </button>
              );
            })}
          </div>
        </section>

        <section className="mt-8 rounded-[24px] bg-gradient-to-br from-[#f0edff] to-[#e8f8f4] p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/80">
              <LockKeyhole size={18} strokeWidth={1.7} />
            </div>

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#668083]">
                Vos données
              </p>

              <h3 className="mt-1 text-[16px] font-semibold">
                Vous gardez le contrôle
              </h3>

              <p className="mt-2 text-[12px] leading-6 text-[#587174]">
                Les réglages de confidentialité permettront de contrôler la
                conservation et l’utilisation de vos données et analyses.
              </p>
            </div>
          </div>
        </section>

        <p className="mt-8 max-w-3xl text-[10px] leading-5 text-[#718789]">
          Otavio fournit des observations visuelles et des informations
          générales. Elles ne constituent pas un diagnostic médical et ne
          remplacent pas l’avis, l’examen ou le suivi d’un professionnel de
          santé.
        </p>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#dce5e4] bg-white/95 px-5 pb-[max(14px,env(safe-area-inset-bottom))] pt-3 backdrop-blur-xl">
        <div className="mx-auto flex max-w-md items-end justify-between">
          <Link
            href="/"
            className="flex w-16 flex-col items-center gap-1.5 text-[#587174]"
          >
            <Activity size={18} strokeWidth={1.8} />
            <span className="text-[9px]">Accueil</span>
          </Link>

          <Link
            href="/conseils"
            className="flex w-16 flex-col items-center gap-1.5 text-[#587174]"
          >
            <Sparkles size={18} strokeWidth={1.8} />
            <span className="text-[9px]">Conseils</span>
          </Link>

          <div className="flex w-16 flex-col items-center gap-1">
            <Link
              href="/scanner"
              className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#176678] to-[#756bd4] text-white shadow-[0_10px_28px_rgba(34,91,105,0.28)]"
              aria-label="Scanner"
            >
              <ScanFace size={21} strokeWidth={1.8} />
            </Link>
            <span className="text-[9px]">Scanner</span>
          </div>

          <Link
            href="/evolution"
            className="flex w-16 flex-col items-center gap-1.5 text-[#587174]"
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
