"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import {
  Activity,
  ArrowLeft,
  Bell,
  ChevronRight,
  LogOut,
  ScanFace,
  Settings,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  UserRound,
} from "lucide-react";

const settings = [
  {
    icon: Bell,
    title: "Notifications",
    text: "Gérer les rappels, conseils et alertes.",
    href: "/notifications",
  },
  {
    icon: ShieldCheck,
    title: "Confidentialité",
    text: "Contrôler vos données et vos préférences.",
    href: "/confidentialite",
  },
];

export default function ParametresPage() {
  const [scanFrequency, setScanFrequency] = useState(7);
  const [isSigningOut, setIsSigningOut] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("facescan-scan-frequency");

    if (!stored) return;

    const value = Number(stored);

    if ([3, 7, 14, 30].includes(value)) {
      setScanFrequency(value);
    }
  }, []);

  const handleSignOut = async () => {
    setIsSigningOut(true);

    const supabase = createClient();
    await supabase.auth.signOut();

    window.location.href = "/connexion";
  };

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
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#6f8587]">
                Otavio
              </p>
              <h1 className="mt-1 text-2xl font-semibold tracking-[-0.03em] text-white">
                Paramètres
              </h1>
            </div>
          </div>

          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white">
            <Settings size={18} strokeWidth={1.7} />
          </div>
        </header>

        <section className="mt-8 relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#183d48] via-[#195263] to-[#167b82] p-6 text-white shadow-[0_24px_60px_rgba(23,76,87,0.22)] sm:p-8">
          <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-[#63e4d4]/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-20 h-64 w-64 rounded-full bg-[#8d8df5]/20 blur-3xl" />
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/60">
            Configuration
          </p>

          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em]">
            Votre expérience Otavio
          </h2>

          <p className="mt-3 max-w-xl text-[13px] leading-6 text-white/70">
            Gérez les préférences qui contrôlent votre suivi, vos notifications
            et la manière dont vos données sont utilisées.
          </p>
        </section>

        <section className="mt-8">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#668083]">
            Général
          </p>

          <div className="mt-5 space-y-3">
            {settings.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.title}
                  href={item.href}
                  className="group flex items-center gap-4 rounded-[22px] border border-[#e0e9e7] bg-white p-5 shadow-[0_10px_30px_rgba(35,55,60,0.045)] transition hover:-translate-y-0.5"
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
            })}
          </div>
        </section>

        <section className="mt-8 rounded-[24px] border border-[#dfe7e6] bg-white p-6 shadow-[0_12px_35px_rgba(35,55,60,0.045)]">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#668083]">
            Application
          </p>

          <div className="mt-5 space-y-3">
            {[
              ["Version", "0.1.0"],
              ["Suivi", "Actif"],
              ["Fréquence", `${scanFrequency} jours`],
            ].map(([label, value]) => (
              <div
                key={label}
                className="flex items-center justify-between border-b border-[#e0e9e7] pb-3 last:border-0 last:pb-0"
              >
                <span className="text-[12px] text-[#587174]">{label}</span>
                <span className="text-[12px] font-semibold">{value}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-8 relative overflow-hidden rounded-[26px] bg-gradient-to-br from-[#f0edff] to-[#e8f8f4] p-6 shadow-[0_12px_35px_rgba(70,80,130,0.07)]">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/80">
              <LogOut size={18} strokeWidth={1.7} />
            </div>

            <div className="flex-1">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#668083]">
                Compte
              </p>

              <h3 className="mt-1 text-[16px] font-semibold">
                Se déconnecter
              </h3>

              <p className="mt-2 text-[12px] leading-6 text-[#587174]">
                Votre session FaceScan sera fermée sur cet appareil.
              </p>

              <button
                type="button"
                onClick={handleSignOut}
                disabled={isSigningOut}
                className="mt-5 rounded-full bg-gradient-to-r from-[#176678] to-[#756bd4] px-5 py-3 text-[11px] font-semibold text-white shadow-[0_8px_22px_rgba(34,91,105,0.20)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSigningOut ? "Déconnexion…" : "Se déconnecter"}
              </button>
            </div>
          </div>
        </section>

        <p className="mt-8 max-w-3xl text-[10px] leading-5 text-[#718789]">
          Les paramètres permettent de gérer votre expérience Otavio. Les
          analyses et observations de l’application ne constituent pas un
          diagnostic médical.
        </p>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#dce5e4] bg-white/95 px-5 pb-[max(14px,env(safe-area-inset-bottom))] pt-3 backdrop-blur-xl">
        <div className="mx-auto flex max-w-md items-end justify-between">
          <Link href="/" className="flex w-16 flex-col items-center gap-1.5 text-[#587174]">
            <Activity size={18} strokeWidth={1.8} />
            <span className="text-[9px]">Accueil</span>
          </Link>

          <Link href="/conseils" className="flex w-16 flex-col items-center gap-1.5 text-[#587174]">
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

          <Link href="/evolution" className="flex w-16 flex-col items-center gap-1.5 text-[#587174]">
            <TrendingUp size={18} strokeWidth={1.8} />
            <span className="text-[9px]">Évolution</span>
          </Link>

          <Link href="/profil" className="flex w-16 flex-col items-center gap-1.5 text-[#171717]">
            <UserRound size={18} strokeWidth={2} />
            <span className="text-[9px] font-medium">Profil</span>
          </Link>
        </div>
      </nav>
    </main>
  );
}
