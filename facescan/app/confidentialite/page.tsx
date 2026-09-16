"use client";

import Link from "next/link";
import {
  Activity,
  ArrowLeft,
  ChevronRight,
  Database,
  Download,
  LockKeyhole,
  ScanFace,
  ShieldCheck,
  Sparkles,
  Trash2,
  TrendingUp,
  UserRound,
} from "lucide-react";

export default function ConfidentialitePage() {
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
              <h1 className="mt-1 text-2xl font-semibold tracking-[-0.03em]">
                Confidentialité
              </h1>
            </div>
          </div>

          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white">
            <ShieldCheck size={18} strokeWidth={1.7} />
          </div>
        </header>

        <section className="mt-8 relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#183d48] via-[#195263] to-[#167b82] p-6 text-white shadow-[0_24px_60px_rgba(23,76,87,0.22)] sm:p-8">
          <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-[#63e4d4]/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-20 h-64 w-64 rounded-full bg-[#8d8df5]/20 blur-3xl" />
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/12">
              <LockKeyhole size={20} strokeWidth={1.7} />
            </div>

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/60">
                Protection des données
              </p>
              <h2 className="mt-1 text-2xl font-semibold tracking-[-0.03em]">
                Vous gardez le contrôle.
              </h2>
            </div>
          </div>

          <p className="mt-4 max-w-2xl text-[13px] leading-6 text-white/70">
            Cet espace permettra de gérer les données utilisées pour votre
            expérience Otavio, leur conservation et vos choix de
            confidentialité.
          </p>
        </section>

        <section className="mt-8">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#668083]">
            Vos données
          </p>

          <h2 className="mt-1 text-xl font-semibold tracking-[-0.025em]">
            Ce qui est associé à votre suivi
          </h2>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {[
              {
                icon: ScanFace,
                title: "Analyses visuelles",
                text: "Vos scans et les résultats associés.",
              },
              {
                icon: TrendingUp,
                title: "Historique d’évolution",
                text: "Les scores et tendances enregistrés au fil du temps.",
              },
              {
                icon: UserRound,
                title: "Profil et objectifs",
                text: "Les informations utilisées pour personnaliser l’expérience.",
              },
              {
                icon: Sparkles,
                title: "Préférences",
                text: "Vos choix de suivi, conseils et notifications.",
              },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="flex items-center gap-4 rounded-[22px] border border-[#e0e9e7] bg-white p-5 shadow-[0_10px_30px_rgba(35,55,60,0.045)]"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#e9f8f5]">
                    <Icon size={19} strokeWidth={1.7} />
                  </div>

                  <div>
                    <h3 className="text-[14px] font-semibold">{item.title}</h3>
                    <p className="mt-1 text-[11px] leading-5 text-[#587174]">
                      {item.text}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="mt-10 space-y-3">
          <Link
            href="#"
            className="group flex items-center gap-4 rounded-[22px] border border-[#e0e9e7] bg-white p-5 shadow-[0_10px_30px_rgba(35,55,60,0.045)]"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#e9f8f5]">
              <Database size={19} strokeWidth={1.7} />
            </div>

            <div className="flex-1">
              <h3 className="text-[14px] font-semibold">
                Gérer mes données
              </h3>
              <p className="mt-1 text-[11px] leading-5 text-[#587174]">
                Consulter les informations conservées pour votre compte.
              </p>
            </div>

            <ChevronRight
              size={16}
              strokeWidth={1.8}
              className="text-[#718789]"
            />
          </Link>

          <button
            type="button"
            className="flex w-full items-center gap-4 rounded-[22px] border border-[#e0e9e7] bg-white p-5 shadow-[0_10px_30px_rgba(35,55,60,0.045)] text-left"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#e9f8f5]">
              <Download size={19} strokeWidth={1.7} />
            </div>

            <div className="flex-1">
              <h3 className="text-[14px] font-semibold">
                Télécharger mes données
              </h3>
              <p className="mt-1 text-[11px] leading-5 text-[#587174]">
                Préparer une copie de vos données et de votre historique.
              </p>
            </div>

            <ChevronRight size={16} strokeWidth={1.8} className="text-[#718789]" />
          </button>

          <button
            type="button"
            className="flex w-full items-center gap-4 rounded-[22px] border border-[#ead6d1] bg-[#fff4f1] p-5 text-left"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/85">
              <Trash2 size={19} strokeWidth={1.7} />
            </div>

            <div className="flex-1">
              <h3 className="text-[14px] font-semibold">
                Supprimer mes données
              </h3>
              <p className="mt-1 text-[11px] leading-5 text-[#755f5a]">
                Cette action sera sécurisée et irréversible lorsqu’elle sera
                connectée au système de compte.
              </p>
            </div>

            <ChevronRight size={16} strokeWidth={1.8} className="text-[#9a7770]" />
          </button>
        </section>

        <section className="mt-8 rounded-[26px] bg-gradient-to-br from-[#f0edff] to-[#e8f8f4] p-6 shadow-[0_12px_35px_rgba(70,80,130,0.07)]">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/80">
              <ShieldCheck size={18} strokeWidth={1.7} />
            </div>

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#668083]">
                Principe
              </p>

              <h3 className="mt-1 text-[16px] font-semibold">
                Transparence avant tout
              </h3>

              <p className="mt-2 text-[12px] leading-6 text-[#587174]">
                Les fonctions de confidentialité seront détaillées avant la
                mise en production afin que vous sachiez quelles données sont
                utilisées, pourquoi elles le sont et comment les contrôler.
              </p>
            </div>
          </div>
        </section>

        <p className="mt-8 max-w-3xl text-[10px] leading-5 text-[#718789]">
          Les écrans présentés ici constituent l’interface de gestion prévue
          pour Otavio. Les mécanismes réels de stockage, export et suppression
          seront connectés avec le système de données de l’application.
        </p>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#dce5e4] bg-white/95 px-5 pb-[max(14px,env(safe-area-inset-bottom))] pt-3 backdrop-blur-xl">
        <div className="mx-auto flex max-w-md items-end justify-between">
          <Link href="/" className="flex w-16 flex-col items-center gap-1.5 text-[#668083]">
            <Activity size={18} strokeWidth={1.8} />
            <span className="text-[9px]">Accueil</span>
          </Link>

          <Link href="/conseils" className="flex w-16 flex-col items-center gap-1.5 text-[#668083]">
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

          <Link href="/evolution" className="flex w-16 flex-col items-center gap-1.5 text-[#668083]">
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
